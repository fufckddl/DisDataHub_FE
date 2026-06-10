import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

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
  getGisReportDetailApi,
  deleteMyGisReportApi,
} from "../../api/gisReportApi";

import "../css/GisReportDetailPage.css";

function GisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [gisReport, setGisReport] = useState(null);
  const [processHistoryList, setProcessHistoryList] = useState([]);
  const [previousPostId, setPreviousPostId] = useState(null);
  const [nextPostId, setNextPostId] = useState(null);
  const [isOwner, setOwner] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const getGisReportDetail = async () => {
    try {
      setLoading(true);

      const data = await getGisReportDetailApi(postId);

      if (data.result === "success") {
        setGisReport(data.gisReportDetail);
        setProcessHistoryList(data.processHistoryList ?? []);
        setPreviousPostId(data.previousPostId ?? null);
        setNextPostId(data.nextPostId ?? null);
        setOwner(data.isOwner === true);
      }
    } catch (error) {
      console.error("GIS 오류제보 상세 조회 실패:", error);
      alert("GIS 오류제보 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    setGisReport(null);
    setProcessHistoryList([]);
    setPreviousPostId(null);
    setNextPostId(null);

    getGisReportDetail();
  }, [postId]);

  useLayoutEffect(() => {
    if (!gisReport) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [postId, gisReport]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!gisReport) return;
    if (gisReport.latitude == null || gisReport.longitude == null) return;

    const longitude = Number(gisReport.longitude);
    const latitude = Number(gisReport.latitude);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(null);
      mapInstanceRef.current = null;
    }

    const coordinate = fromLonLat([longitude, latitude]);

    const marker = new Feature({
      geometry: new Point(coordinate),
    });

    marker.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 9,
          fill: new Fill({
            color: getMarkerColor(gisReport.processStatusCode),
          }),
          stroke: new Stroke({
            color: "#ffffff",
            width: 3,
          }),
        }),
      })
    );

    const markerSource = new VectorSource({
      features: [marker],
    });

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
        center: coordinate,
        zoom: 16,
      }),
    });

    mapInstanceRef.current = map;

    requestAnimationFrame(() => {
      map.updateSize();
    });

    setTimeout(() => {
      map.updateSize();
    }, 300);

    return () => {
      map.setTarget(null);
      mapInstanceRef.current = null;
    };
  }, [gisReport]);

  const handleMoveEdit = () => {
    if (!isOwner) {
      alert("작성자 본인만 수정할 수 있습니다.");
      return;
    }

    navigate(`/board/gis-report/edit/${postId}`);
  };

  const handleDelete = async () => {
    if (!isOwner) {
      alert("작성자 본인만 삭제할 수 있습니다.");
      return;
    }

    const isConfirm = window.confirm(
      "정말 이 GIS 오류제보 글을 삭제하시겠습니까?"
    );

    if (!isConfirm) return;

    try {
      setDeleting(true);

      const data = await deleteMyGisReportApi(postId);

      if (data.result === "success") {
        alert("GIS 오류제보 글이 삭제되었습니다.");
        navigate("/board/gis-report");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("GIS 오류제보 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleMovePrevious = () => {
    if (!previousPostId) {
      alert("이전 글이 없습니다.");
      return;
    }

    navigate(`/board/gis-report/${previousPostId}`);
  };

  const handleMoveNext = () => {
    if (!nextPostId) {
      alert("다음 글이 없습니다.");
      return;
    }

    navigate(`/board/gis-report/${nextPostId}`);
  };

  const getMarkerColor = (statusCode) => {
    if (statusCode === "RECEIVED") return "#1f6feb";
    if (statusCode === "REVIEWING") return "#f97316";
    if (statusCode === "CHECKING") return "#f97316";
    if (statusCode === "PROCESSING") return "#f97316";
    if (statusCode === "COMPLETED") return "#16a34a";
    return "#64748b";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "user-gis-detail-status-received";
    if (statusCode === "REVIEWING") return "user-gis-detail-status-checking";
    if (statusCode === "CHECKING") return "user-gis-detail-status-checking";
    if (statusCode === "PROCESSING") return "user-gis-detail-status-processing";
    if (statusCode === "COMPLETED") return "user-gis-detail-status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "REVIEWING") return "검토중";
    if (statusCode === "CHECKING") return "검토중";
    if (statusCode === "PROCESSING") return "조치중";
    if (statusCode === "COMPLETED") return "처리완료";
    return "";
  };

  const getReportCategoryName = (categoryCode) => {
    if (categoryCode === "LOCATION_ERROR") return "위치 오류";
    if (categoryCode === "MISSING_DATA") return "데이터 누락";
    if (categoryCode === "ATTRIBUTE_ERROR") return "속성 오류";
    if (categoryCode === "ETC") return "기타";
    return "";
  };

  const getErrorTypeName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "좌표 오류";
    if (errorTypeCode === "NAME_ERROR") return "명칭 오류";
    if (errorTypeCode === "VALUE_ERROR") return "속성값 오류";
    if (errorTypeCode === "ETC") return "기타";
    return "";
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.replace("T", " ").substring(0, 16);
  };

  if (isLoading && !gisReport) {
    return (
      <div className="container-fluid px-4 py-3 gis-detail-page">
        <div className="gis-detail-container">
          <section className="gis-not-found">
            <p>GIS 오류제보 상세 정보를 불러오는 중입니다.</p>
          </section>
        </div>
      </div>
    );
  }

  if (!gisReport) {
    return (
      <div className="container-fluid px-4 py-3 gis-detail-page">
        <div className="gis-detail-container">
          <section className="gis-not-found">
            <p>GIS 오류제보 게시글을 찾을 수 없습니다.</p>
            <p>비공개 글인 경우 작성자 본인만 확인할 수 있습니다.</p>

            <button
              type="button"
              className="gis-list-button"
              onClick={() => navigate("/board/gis-report")}
            >
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  const hasLocation = gisReport.latitude != null && gisReport.longitude != null;

  const reportCategoryName = getReportCategoryName(
    gisReport.reportCategoryCode
  );

  const errorTypeName = getErrorTypeName(gisReport.errorTypeCode);

  const processStatusName = getProcessStatusName(gisReport.processStatusCode);

  const visibilityName = getVisibilityName(gisReport.visibilityStatus);

  return (
    <div className="container-fluid px-4 py-3 gis-detail-page">
      <div className="gis-detail-container">
        <section className="gis-detail-board">
          <div className="gis-detail-top">
            <div className="gis-detail-badge-area">
              {reportCategoryName && (
                <span className="user-gis-detail-category-badge">
                  {reportCategoryName}
                </span>
              )}

              {errorTypeName && (
                <span className="user-gis-detail-error-type-badge">
                  {errorTypeName}
                </span>
              )}

              {gisReport.processStatusCode && processStatusName && (
                <span
                  className={`user-gis-detail-status-badge ${getStatusClassName(
                    gisReport.processStatusCode
                  )}`}
                >
                  {processStatusName}
                </span>
              )}

              {visibilityName && (
                <span className="user-gis-detail-visibility-badge">
                  {visibilityName}
                </span>
              )}
            </div>

            <h1>{gisReport.title || "제목 없음"}</h1>

            <div className="gis-detail-info-row">
              <span>
                <em>작성자</em>
                <strong>
                  {gisReport.writerName ||
                    gisReport.nickname ||
                    `사용자 ${gisReport.userId ?? "-"}`}
                </strong>
              </span>

              <span>
                <em>작성일</em>
                <strong>{formatDate(gisReport.createdAt)}</strong>
              </span>

              <span>
                <em>조회수</em>
                <strong>{gisReport.viewCount ?? 0}</strong>
              </span>

              <span>
                <em>지역</em>
                <strong>
                  {[gisReport.sido, gisReport.sigungu, gisReport.eupmyeondong]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </strong>
              </span>
            </div>

            {isOwner && (
              <div className="gis-owner-button-area">
                <button
                  type="button"
                  className="gis-edit-button"
                  onClick={handleMoveEdit}
                >
                  수정
                </button>

                <button
                  type="button"
                  className="gis-delete-button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </div>
            )}
          </div>

          <div className="gis-detail-body">
            <div className="gis-detail-body-title">제보 내용</div>

            <p>{gisReport.content || "등록된 제보 내용이 없습니다."}</p>
          </div>

          <div className="gis-location-section">
            <div className="gis-location-title">오류 위치 정보</div>

            <div className="gis-location-content">
              <div className="gis-location-info-box">
                <div>
                  <em>확정 주소</em>
                  <strong>{gisReport.address || "주소 정보 없음"}</strong>
                </div>

                <div>
                  <em>대상 데이터명</em>
                  <strong>{gisReport.targetDataName || "-"}</strong>
                </div>

                <div>
                  <em>시/도</em>
                  <strong>{gisReport.sido || "-"}</strong>
                </div>

                <div>
                  <em>시/군/구</em>
                  <strong>{gisReport.sigungu || "-"}</strong>
                </div>

                <div>
                  <em>읍/면/동</em>
                  <strong>{gisReport.eupmyeondong || "-"}</strong>
                </div>

                <div>
                  <em>위도</em>
                  <strong>{gisReport.latitude ?? "-"}</strong>
                </div>

                <div>
                  <em>경도</em>
                  <strong>{gisReport.longitude ?? "-"}</strong>
                </div>
              </div>

              <div className="gis-detail-map-wrap">
                {hasLocation ? (
                  <div ref={mapRef} className="gis-detail-map"></div>
                ) : (
                  <div className="gis-detail-map-empty">
                    위치 좌표가 등록되지 않았습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="gis-process-section">
            <div className="gis-process-title">처리 이력</div>

            {processHistoryList.length > 0 ? (
              <div className="gis-process-list">
                {processHistoryList.map((history, index) => (
                  <div
                    className="gis-process-item"
                    key={history.historyId ?? index}
                  >
                    <div className="gis-process-meta">
                      <strong className="gis-process-writer-name">
                        {history.processWriterName ||
                          history.writerName ||
                          "관리자"}
                      </strong>

                      <div className="gis-process-right-area">
                        {history.processStatusCode === "COMPLETED" && (
                          <span className="user-gis-answer-completed-badge">
                            처리완료
                          </span>
                        )}

                        <span className="gis-process-date">
                          {formatDateTime(history.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p>
                      {history.processContent ||
                        "등록된 처리 내용이 없습니다."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gis-process-waiting-box">
                <strong>아직 처리 이력이 등록되지 않았습니다.</strong>
                <p>
                  관리자가 제보 내용을 확인한 후 처리 이력을 등록할 예정입니다.
                </p>
              </div>
            )}
          </div>

          <div className="gis-detail-button-area">
            <button
              type="button"
              className="gis-list-button"
              onClick={() => navigate("/board/gis-report")}
            >
              목록으로
            </button>

            <div className="gis-move-button-group">
              <button
                type="button"
                className="gis-move-button"
                onClick={handleMovePrevious}
              >
                이전글
              </button>

              <button
                type="button"
                className="gis-move-button"
                onClick={handleMoveNext}
              >
                다음글
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default GisReportDetailPage;