import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

import { VWORLD_BASE_MAP_URL } from "../../config/vworldConfig";
import {
  getGisReportListApi,
  searchGisReportListApi,
} from "../../api/gisReportApi";
import { getSidoListApi, getSigunguListApi } from "../../api/regionApi";

import "../css/GisReportListPage.css";

function GisReportListPage() {
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerSourceRef = useRef(null);

  const popupRef = useRef(null);
  const popupOverlayRef = useRef(null);

  const [popupReport, setPopupReport] = useState(null);
  const [gisReportList, setGisReportList] = useState([]);

  const [searchWord, setSearchWord] = useState("");

  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);

  const [sidoCode, setSidoCode] = useState("");
  const [sigunguCode, setSigunguCode] = useState("");

  const [isMarkerVisible, setMarkerVisible] = useState(true);
  const [isCompletedVisible, setCompletedVisible] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const visibleGisReportList = useMemo(() => {
    if (isCompletedVisible) {
      return gisReportList;
    }

    return gisReportList.filter(
      (report) => report.processStatusCode !== "COMPLETED"
    );
  }, [gisReportList, isCompletedVisible]);

  const totalPage = Math.ceil(visibleGisReportList.length / pageSize);

  const pageList = Array.from({ length: totalPage }, (_, index) => index + 1);

  const currentPageReportList = visibleGisReportList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getSelectedName = (list, code) => {
    if (!Array.isArray(list)) return "";

    const item = list.find((item) => String(item.code) === String(code));
    return item?.name ?? "";
  };

  const sidoName = getSelectedName(sidoList, sidoCode);
  const sigunguName = getSelectedName(sigunguList, sigunguCode);

  const hidePopup = () => {
    setPopupReport(null);

    if (popupOverlayRef.current) {
      popupOverlayRef.current.setPosition(undefined);
    }
  };

  const getGisReportList = async () => {
    try {
      setLoading(true);

      const data = await getGisReportListApi();

      if (data.result === "success") {
        setGisReportList(data.gisReportList ?? []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("GIS 오류제보 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchGisReportList = async () => {
    try {
      setLoading(true);

      const searchData = {
        searchWord,
        sido: sidoName,
        sigungu: sigunguName,
      };

      const data = await searchGisReportListApi(searchData);

      if (data.result === "success") {
        setGisReportList(data.gisReportList ?? []);
        setCurrentPage(1);
        hidePopup();
      }
    } catch (error) {
      console.error("GIS 오류제보 검색 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchWord("");
    setSidoCode("");
    setSigunguCode("");
    setSigunguList([]);
    setCurrentPage(1);
    hidePopup();
  };

  const handleToggleCompletedVisible = () => {
    setCompletedVisible((prev) => !prev);
    setCurrentPage(1);
    hidePopup();
  };

  useEffect(() => {
    const getSidoList = async () => {
      try {
        const data = await getSidoListApi();
        setSidoList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("시/도 목록 조회 실패:", error);
        setSidoList([]);
      }
    };

    getSidoList();
  }, []);

  useEffect(() => {
    if (!sidoCode) {
      setSigunguCode("");
      setSigunguList([]);
      return;
    }

    const getSigunguList = async () => {
      try {
        const data = await getSigunguListApi(sidoCode);
        setSigunguList(Array.isArray(data) ? data : []);
        setSigunguCode("");
      } catch (error) {
        console.error("시/군/구 목록 조회 실패:", error);
        setSigunguList([]);
      }
    };

    getSigunguList();
  }, [sidoCode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSearchCondition =
        searchWord.trim() !== "" || sidoName !== "" || sigunguName !== "";

      if (hasSearchCondition) {
        searchGisReportList();
      } else {
        getGisReportList();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchWord, sidoName, sigunguName]);

  useEffect(() => {
    if (totalPage > 0 && currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [visibleGisReportList, currentPage, totalPage]);

  const getMarkerColor = (statusCode) => {
    if (statusCode === "RECEIVED") return "#1f6feb";
    if (statusCode === "REVIEWING") return "#f97316";
    if (statusCode === "CHECKING") return "#f97316";
    if (statusCode === "PROCESSING") return "#f97316";
    if (statusCode === "COMPLETED") return "#16a34a";
    return "#64748b";
  };

  const createMarkerStyle = (statusCode) => {
    return new Style({
      image: new CircleStyle({
        radius: 9,
        fill: new Fill({
          color: getMarkerColor(statusCode),
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 3,
        }),
      }),
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const markerSource = new VectorSource();
    markerSourceRef.current = markerSource;

    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: VWORLD_BASE_MAP_URL,
          }),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([127.0276, 37.4979]),
        zoom: 12,
      }),
    });

    if (popupRef.current) {
      const popupOverlay = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        offset: [0, -16],
        stopEvent: false,
      });

      map.addOverlay(popupOverlay);
      popupOverlayRef.current = popupOverlay;
    }

    map.on("singleclick", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      if (!feature) return;

      const markerPostId = feature.get("postId");

      if (markerPostId) {
        navigate(`/board/gis-report/${markerPostId}`);
      }
    });

    map.on("pointermove", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      const mapElement = map.getTargetElement();

      if (mapElement) {
        mapElement.style.cursor = feature ? "pointer" : "";
      }

      if (!feature) {
        setPopupReport(null);

        if (popupOverlayRef.current) {
          popupOverlayRef.current.setPosition(undefined);
        }

        return;
      }

      const report = feature.get("report");
      const geometry = feature.getGeometry();

      if (!report || !geometry) {
        setPopupReport(null);

        if (popupOverlayRef.current) {
          popupOverlayRef.current.setPosition(undefined);
        }

        return;
      }

      setPopupReport(report);

      if (popupOverlayRef.current) {
        popupOverlayRef.current.setPosition(geometry.getCoordinates());
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
      markerSourceRef.current = null;
      popupOverlayRef.current = null;
    };
  }, [navigate]);

  useEffect(() => {
    if (!markerSourceRef.current || !mapInstanceRef.current) return;

    const markerSource = markerSourceRef.current;

    markerSource.clear();

    if (!isMarkerVisible) {
      hidePopup();
      return;
    }

    visibleGisReportList.forEach((report) => {
      if (report.latitude == null || report.longitude == null) return;

      const longitude = Number(report.longitude);
      const latitude = Number(report.latitude);

      if (Number.isNaN(longitude) || Number.isNaN(latitude)) return;

      const marker = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude])),
      });

      marker.setProperties({
        postId: report.postId,
        title: report.title,
        processStatusCode: report.processStatusCode,
        report,
      });

      marker.setStyle(createMarkerStyle(report.processStatusCode));

      markerSource.addFeature(marker);
    });

    const features = markerSource.getFeatures();

    if (features.length > 0) {
      mapInstanceRef.current.getView().fit(markerSource.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 14,
        duration: 300,
      });
    } else {
      hidePopup();
    }
  }, [visibleGisReportList, isMarkerVisible]);

  const handleMoveMapCenter = (report) => {
    if (!mapInstanceRef.current) return;
    if (report.latitude == null || report.longitude == null) return;

    const longitude = Number(report.longitude);
    const latitude = Number(report.latitude);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) return;

    const coordinate = fromLonLat([longitude, latitude]);

    mapInstanceRef.current.getView().animate({
      center: coordinate,
      zoom: 15,
      duration: 300,
    });

    if (!isMarkerVisible) {
      hidePopup();
      return;
    }

    setPopupReport(report);

    if (popupOverlayRef.current) {
      popupOverlayRef.current.setPosition(coordinate);
    }
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;

    setCurrentPage(currentPage - 1);
    hidePopup();
  };

  const handleNextPage = () => {
    if (currentPage >= totalPage) return;

    setCurrentPage(currentPage + 1);
    hidePopup();
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    hidePopup();
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "user-gis-status-received";
    if (statusCode === "REVIEWING") return "user-gis-status-checking";
    if (statusCode === "CHECKING") return "user-gis-status-checking";
    if (statusCode === "PROCESSING") return "user-gis-status-checking";
    if (statusCode === "COMPLETED") return "user-gis-status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "REVIEWING") return "검토중";
    if (statusCode === "CHECKING") return "검토중";
    if (statusCode === "PROCESSING") return "조치중";
    if (statusCode === "COMPLETED") return "처리완료";
    return statusCode ?? "-";
  };

  const getReportCategoryName = (categoryCode) => {
    if (categoryCode === "LOCATION_ERROR") return "위치 오류";
    if (categoryCode === "MISSING_DATA") return "데이터 누락";
    if (categoryCode === "ATTRIBUTE_ERROR") return "속성 오류";
    if (categoryCode === "ETC") return "기타";
    return categoryCode ?? "-";
  };

  const getErrorTypeName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "좌표 오류";
    if (errorTypeCode === "NAME_ERROR") return "명칭 오류";
    if (errorTypeCode === "VALUE_ERROR") return "속성값 오류";
    return errorTypeCode ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  return (
    <div className="container-fluid px-4 py-3 gis-report-page">
      <section className="gis-report-header">
        <h1>GIS 데이터 오류 제보 게시판</h1>
      </section>

      <section className="gis-report-filter-section">
        <div className="filter-title-search">
          <input
            type="text"
            placeholder="게시글 제목을 검색하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>

        <select
          value={sidoCode}
          onChange={(e) => setSidoCode(e.target.value)}
        >
          <option value="">전체 시/도</option>
          {sidoList.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>

        <select
          value={sigunguCode}
          onChange={(e) => setSigunguCode(e.target.value)}
          disabled={!sidoCode}
        >
          <option value="">전체 시/군/구</option>
          {sigunguList.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="reset-button"
          onClick={handleResetSearch}
        >
          초기화
        </button>

        <Link to="/board/gis-report/write" className="write-button">
          글쓰기
        </Link>
      </section>

      <section className="gis-report-content-layout">
        <section className="gis-report-map-section">
          <div className="gis-report-map-header">
            <h2>지도 영역</h2>
            <span>현재 조회된 제보 위치만 표시됩니다.</span>
          </div>

          <div className="vworld-map-wrap">
            <div className="map-legend-panel">
              <div className="map-legend-items">
                <span className="legend-item">
                  <span className="legend-dot legend-received"></span>
                  제보완료
                </span>

                <span className="legend-item">
                  <span className="legend-dot legend-checking"></span>
                  검토중
                </span>

                <span className="legend-item">
                  <span className="legend-dot legend-completed"></span>
                  처리완료
                </span>
              </div>

              <button
                type="button"
                className={`marker-toggle ${isMarkerVisible ? "on" : ""}`}
                onClick={() => setMarkerVisible((prev) => !prev)}
                aria-label="마커 표시 전환"
              >
                <span className="marker-toggle-label">마커 표시</span>
                <span className="marker-toggle-track">
                  <span className="marker-toggle-thumb"></span>
                </span>
              </button>
            </div>

            <div ref={mapRef} className="vworld-map"></div>

            <div
              ref={popupRef}
              className={`gis-marker-popup ${popupReport ? "show" : ""}`}
            >
              {popupReport && (
                <>
                  <strong>{popupReport.title || "제목 없음"}</strong>

                  <p>
                    {getReportCategoryName(popupReport.reportCategoryCode)}
                    <span>/</span>
                    {getErrorTypeName(popupReport.errorTypeCode)}
                  </p>

                  <p>{popupReport.address || "주소 정보 없음"}</p>

                  <div className="popup-status-row">
                    <span
                      className={`popup-status-badge ${getStatusClassName(
                        popupReport.processStatusCode
                      )}`}
                    >
                      {getProcessStatusName(popupReport.processStatusCode)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="gis-report-list-section">
          <div className="gis-report-list-header">
            <div className="gis-report-list-title-area">
              <h2>제보 목록</h2>

              <span className="gis-report-list-count">
                총 {visibleGisReportList.length}건 / {currentPage}
                {totalPage > 0 ? ` / ${totalPage}페이지` : " / 0페이지"}
              </span>
            </div>

            <button
              type="button"
              className={`completed-toggle ${isCompletedVisible ? "on" : ""}`}
              onClick={handleToggleCompletedVisible}
              aria-label="처리완료 게시글 표시 전환"
            >
              <span className="completed-toggle-label">처리완료 보기</span>
              <span className="completed-toggle-track">
                <span className="completed-toggle-thumb"></span>
              </span>
            </button>
          </div>

          <div className="gis-report-list">
            {currentPageReportList.map((report) => (
              <div
                className="gis-report-list-item"
                key={report.postId}
                onMouseEnter={() => handleMoveMapCenter(report)}
                onMouseLeave={hidePopup}
              >
                <Link
                  to={`/board/gis-report/${report.postId}`}
                  className="gis-report-list-link"
                >
                  <div className="report-status-area">
                    <span
                      className={`report-status-badge ${getStatusClassName(
                        report.processStatusCode
                      )}`}
                    >
                      {getProcessStatusName(report.processStatusCode)}
                    </span>
                  </div>

                  <div className="report-content-area">
                    <h3>{report.title || "제목 없음"}</h3>

                    <p>
                      {getReportCategoryName(report.reportCategoryCode)}
                      <span>/</span>
                      {report.address || "주소 정보 없음"}
                    </p>

                    <p>작성일: {formatDate(report.createdAt)}</p>
                  </div>

                  <div className="report-arrow">›</div>
                </Link>
              </div>
            ))}

            {isLoading && (
              <div className="gis-report-empty-message">
                GIS 오류제보 목록을 불러오는 중입니다.
              </div>
            )}

            {!isLoading && visibleGisReportList.length === 0 && (
              <div className="gis-report-empty-message">
                표시할 GIS 오류제보가 없습니다.
              </div>
            )}
          </div>

          <div className="gis-report-pagination">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              ‹
            </button>

            {pageList.map((page) => (
              <button
                type="button"
                key={page}
                className={page === currentPage ? "active" : ""}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPage || totalPage === 0}
            >
              ›
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}

export default GisReportListPage;