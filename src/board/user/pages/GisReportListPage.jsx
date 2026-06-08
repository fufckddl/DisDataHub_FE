import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

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
  const [reportCategoryCode, setReportCategoryCode] = useState("");
  const [errorTypeCode, setErrorTypeCode] = useState("");
  const [processStatusCode, setProcessStatusCode] = useState("");
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [eupmyeondong, setEupmyeondong] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const gisProcessStatusList = [
    { code: "", name: "전체 상태" },
    { code: "RECEIVED", name: "제보완료" },
    { code: "REVIEWING", name: "검토중" },
    { code: "PROCESSING", name: "조치중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const gisReportCategoryList = [
    { code: "", name: "전체 제보 유형" },
    { code: "LOCATION_ERROR", name: "위치 오류" },
    { code: "MISSING_DATA", name: "데이터 누락" },
    { code: "ATTRIBUTE_ERROR", name: "속성 오류" },
    { code: "ETC", name: "기타" },
  ];

  const gisErrorTypeList = [
    { code: "", name: "전체 오류 유형" },
    { code: "COORDINATE_ERROR", name: "좌표 오류" },
    { code: "NAME_ERROR", name: "명칭 오류" },
    { code: "VALUE_ERROR", name: "속성값 오류" },
  ];

  const sidoList = [
    { code: "", name: "전체 시도" },
    { code: "서울특별시", name: "서울특별시" },
    { code: "부산광역시", name: "부산광역시" },
    { code: "대구광역시", name: "대구광역시" },
    { code: "인천광역시", name: "인천광역시" },
    { code: "광주광역시", name: "광주광역시" },
    { code: "대전광역시", name: "대전광역시" },
    { code: "울산광역시", name: "울산광역시" },
    { code: "세종특별자치시", name: "세종특별자치시" },
    { code: "경기도", name: "경기도" },
    { code: "강원특별자치도", name: "강원특별자치도" },
    { code: "충청북도", name: "충청북도" },
    { code: "충청남도", name: "충청남도" },
    { code: "전북특별자치도", name: "전북특별자치도" },
    { code: "전라남도", name: "전라남도" },
    { code: "경상북도", name: "경상북도" },
    { code: "경상남도", name: "경상남도" },
    { code: "제주특별자치도", name: "제주특별자치도" },
  ];

  const totalPage = Math.ceil(gisReportList.length / pageSize);

  const pageList = Array.from({ length: totalPage }, (_, index) => index + 1);

  const currentPageReportList = gisReportList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
      alert("GIS 오류제보 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const searchGisReportList = async () => {
    try {
      setLoading(true);

      const searchData = {
        searchWord,
        reportCategoryCode,
        errorTypeCode,
        processStatusCode,
        sido,
        sigungu,
        eupmyeondong,
      };

      const data = await searchGisReportListApi(searchData);

      if (data.result === "success") {
        setGisReportList(data.gisReportList ?? []);
        setCurrentPage(1);
        hidePopup();
      }
    } catch (error) {
      console.error("GIS 오류제보 검색 실패:", error);
      alert("GIS 오류제보 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = async () => {
    setSearchWord("");
    setReportCategoryCode("");
    setErrorTypeCode("");
    setProcessStatusCode("");
    setSido("");
    setSigungu("");
    setEupmyeondong("");
    setCurrentPage(1);
    hidePopup();

    try {
      setLoading(true);

      const data = await getGisReportListApi();

      if (data.result === "success") {
        setGisReportList(data.gisReportList ?? []);
      }
    } catch (error) {
      console.error("GIS 오류제보 목록 초기화 실패:", error);
      alert("GIS 오류제보 목록을 다시 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGisReportList();
  }, []);

  useEffect(() => {
    if (totalPage > 0 && currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [gisReportList, currentPage, totalPage]);

  const getMarkerColor = (statusCode) => {
    if (statusCode === "RECEIVED") return "#1f6feb";
    if (statusCode === "REVIEWING") return "#2563eb";
    if (statusCode === "CHECKING") return "#2563eb";
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

    // 마커 클릭 시 상세 페이지 이동
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

    // 마커 hover 시 지도 이동 없이 팝업만 표시
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

    gisReportList.forEach((report) => {
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
  }, [gisReportList]);

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
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "REVIEWING") return "status-checking";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "PROCESSING") return "status-checking";
    if (statusCode === "COMPLETED") return "status-completed";
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
        <div className="gis-report-header-icon">💬</div>
        <h1>GIS 데이터 오류 제보 게시판</h1>
      </section>

      <section className="gis-report-filter-section">
        <input
          type="text"
          placeholder="제목, 내용, 주소, 데이터명을 검색하세요."
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <select
          value={reportCategoryCode}
          onChange={(e) => setReportCategoryCode(e.target.value)}
        >
          {gisReportCategoryList.map((category) => (
            <option key={category.code} value={category.code}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={errorTypeCode}
          onChange={(e) => setErrorTypeCode(e.target.value)}
        >
          {gisErrorTypeList.map((errorType) => (
            <option key={errorType.code} value={errorType.code}>
              {errorType.name}
            </option>
          ))}
        </select>

        <select
          value={processStatusCode}
          onChange={(e) => setProcessStatusCode(e.target.value)}
        >
          {gisProcessStatusList.map((status) => (
            <option key={status.code} value={status.code}>
              {status.name}
            </option>
          ))}
        </select>

        <select value={sido} onChange={(e) => setSido(e.target.value)}>
          {sidoList.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="시군구 입력"
          value={sigungu}
          onChange={(e) => setSigungu(e.target.value)}
        />

        <input
          type="text"
          placeholder="읍면동 입력"
          value={eupmyeondong}
          onChange={(e) => setEupmyeondong(e.target.value)}
        />

        <button type="button" onClick={searchGisReportList}>
          🔍 검색
        </button>

        <button type="button" onClick={handleResetSearch}>
          초기화
        </button>

        <button type="button" className="radius-search-button">
          반경 검색
        </button>

        <Link to="/board/gis-report/write" className="write-button">
          ✎ 글쓰기
        </Link>
      </section>

      <section className="gis-report-content-layout">
        <section className="gis-report-list-section">
          <div className="gis-report-list-header">
            <h2>제보 목록</h2>
            <span>
              총 {gisReportList.length}건 / {currentPage}
              {totalPage > 0 ? ` / ${totalPage}페이지` : " / 0페이지"}
            </span>
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

            {!isLoading && gisReportList.length === 0 && (
              <div className="gis-report-empty-message">
                등록된 GIS 오류제보가 없습니다.
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

        <section className="gis-report-map-section">
          <div className="gis-report-map-header">
            <h2>지도 영역</h2>
          </div>

          <div className="vworld-map-wrap">
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
      </section>
    </div>
  );
}

export default GisReportListPage;