import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import {
  getAdminGisReportDetailApi,
  deleteAdminGisReportApi,
  saveAdminGisReportProcessApi,
} from "../../api/gisReportApi";

import "../css/AdminGisReportDetailPage.css";

function AdminGisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [report, setReport] = useState(null);
  const [processHistoryList, setProcessHistoryList] = useState([]);

  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const [processStatusCode, setProcessStatusCode] = useState("RECEIVED");
  const [adminProcessContent, setAdminProcessContent] = useState("");

  const adminGisProcessStatusList = [
    { code: "RECEIVED", name: "제보완료" },
    { code: "PROCESSING", name: "검토중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const getAdminGisReportDetail = async () => {
    try {
      setLoading(true);

      const data = await getAdminGisReportDetailApi(postId);

      console.log("관리자 GIS 상세 응답:", data);

      if (data.result === "success") {
        const detail = data.adminGisReportDetail ?? data.gisReportDetail;

        const currentStatusCode =
          detail?.processStatusCode === "REVIEWING"
            ? "PROCESSING"
            : detail?.processStatusCode ?? "RECEIVED";

        setReport(detail);
        setProcessStatusCode(currentStatusCode);
        setAdminProcessContent("");
        setProcessHistoryList(data.processHistoryList ?? []);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error("관리자 GIS 오류제보 상세 조회 실패:", error);
      alert("GIS 오류제보 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    window.scrollTo(0, 0);
    getAdminGisReportDetail();
  }, [postId]);

  useEffect(() => {
    if (!mapRef.current || !report) {
      return;
    }

    const longitude = Number(report.longitude || 127.0365);
    const latitude = Number(report.latitude || 37.5007);

    const markerSource = new VectorSource();

    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const markerStyle = new Style({
      image: new CircleStyle({
        radius: 9,
        fill: new Fill({
          color: "#334155",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 3,
        }),
      }),
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude])),
    });

    marker.setStyle(markerStyle);
    markerSource.addFeature(marker);

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
          }),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([longitude, latitude]),
        zoom: 15,
      }),
    });

    setTimeout(() => {
      map.updateSize();
    }, 0);

    return () => {
      map.setTarget(null);
    };
  }, [report]);

  const getErrorTypeClassName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "error-coordinate";
    if (errorTypeCode === "NAME_ERROR") return "error-name";
    if (errorTypeCode === "VALUE_ERROR") return "error-value";
    return "error-etc";
  };

  const getErrorTypeName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "좌표 오류";
    if (errorTypeCode === "NAME_ERROR") return "명칭 오류";
    if (errorTypeCode === "VALUE_ERROR") return "속성값 오류";
    return errorTypeCode ?? "-";
  };

  const getReportCategoryName = (categoryCode) => {
    if (categoryCode === "LOCATION_ERROR") return "위치 오류";
    if (categoryCode === "MISSING_DATA") return "데이터 누락";
    if (categoryCode === "ATTRIBUTE_ERROR") return "속성 오류";
    if (categoryCode === "ETC") return "기타";
    return categoryCode ?? "-";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "PROCESSING" || statusCode === "REVIEWING") {
      return "status-processing";
    }
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "PROCESSING" || statusCode === "REVIEWING") {
      return "검토중";
    }
    if (statusCode === "COMPLETED") return "처리완료";
    return statusCode ?? "-";
  };

  const getDeletedName = (deletedYn) => {
    if (deletedYn === "Y") return "삭제됨";
    if (deletedYn === "N") return "정상";
    return "-";
  };

  const getWriterDisplayName = (reportData) => {
    return (
      reportData?.writerName ||
      reportData?.name ||
      reportData?.userName ||
      reportData?.memberName ||
      reportData?.nickname ||
      reportData?.writerNickname ||
      `사용자 ${reportData?.userId ?? "-"}`
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleSave = async () => {
    if (report?.deletedYn === "Y") {
      alert("삭제된 GIS 오류 제보 게시글은 처리 내용을 저장할 수 없습니다.");
      return;
    }

    if (!processStatusCode) {
      alert("처리 상태를 선택해주세요.");
      return;
    }

    if (!adminProcessContent.trim()) {
      alert("관리자 처리 내용을 입력해주세요.");
      return;
    }

    const requestData = {
      processStatusCode,
      processContent: adminProcessContent,
    };

    try {
      setSaving(true);

      const data = await saveAdminGisReportProcessApi(postId, requestData);

      if (data.result === "success") {
        alert("처리 상태와 처리 내용이 저장되었습니다.");
        setAdminProcessContent("");
        getAdminGisReportDetail();
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("GIS 제보 처리 저장 실패:", error);
      alert("처리 상태 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const isConfirm = window.confirm(
      "정말 이 GIS 오류제보 게시글을 삭제하시겠습니까?"
    );

    if (!isConfirm) {
      return;
    }

    try {
      setDeleting(true);

      const data = await deleteAdminGisReportApi(postId);

      if (data.result === "success") {
        alert("GIS 오류제보 게시글이 삭제되었습니다.");
        navigate("/admin/board/gis-report");
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

  if (isLoading) {
    return (
      <div className="container-fluid px-4 py-3 admin-gis-detail-page">
        <section className="admin-gis-not-found">
          <h1>GIS 오류 제보 상세 정보를 불러오는 중입니다.</h1>
        </section>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container-fluid px-4 py-3 admin-gis-detail-page">
        <section className="admin-gis-not-found">
          <h1>GIS 오류 제보글을 찾을 수 없습니다.</h1>

          <button
            type="button"
            onClick={() => navigate("/admin/board/gis-report")}
          >
            목록으로
          </button>
        </section>
      </div>
    );
  }

  const isDeleted = report.deletedYn === "Y";

  const processHistory =
    processHistoryList.length > 0
      ? processHistoryList.map((history) => ({
          historyId: history.historyId,
          statusName: getProcessStatusName(history.processStatusCode),
          processedAt: history.createdAt,
          content: history.processContent,
        }))
      : [
          {
            historyId: 1,
            statusName: getProcessStatusName(report.processStatusCode),
            processedAt: report.createdAt,
            content: "GIS 오류 제보가 등록되었습니다.",
          },
        ];

  return (
    <div className="container-fluid px-4 py-3 admin-gis-detail-page">
      <div className="admin-gis-detail-container">
        <div className="admin-gis-detail-top">
          <div>
            <h1>GIS 오류 제보 상세 관리</h1>
            <p>제보 내용과 위치 정보를 확인하고 처리 상태를 관리합니다.</p>
          </div>

          {!isDeleted && (
            <button
              type="button"
              className="admin-gis-delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          )}
        </div>

        <section className="admin-gis-detail-card">
          <div className="admin-gis-title-area">
            <div className="admin-gis-badge-area">
              <span
                className={`admin-gis-error-badge ${getErrorTypeClassName(
                  report.errorTypeCode
                )}`}
              >
                {getErrorTypeName(report.errorTypeCode)}
              </span>

              <span
                className={`admin-gis-status-badge ${getStatusClassName(
                  report.processStatusCode
                )}`}
              >
                {getProcessStatusName(report.processStatusCode)}
              </span>

              {isDeleted && (
                <span className="admin-gis-deleted-badge">삭제됨</span>
              )}
            </div>

            <h2>{report.title || "제목 없음"}</h2>
          </div>

          <div className="admin-gis-info-bar">
            <div className="admin-gis-info-item">
              <span>작성자</span>
              <strong>{getWriterDisplayName(report)}</strong>
            </div>

            <div className="admin-gis-info-item">
              <span>작성일</span>
              <strong>{formatDate(report.createdAt)}</strong>
            </div>

            <div className="admin-gis-info-item">
              <span>제보 유형</span>
              <strong>{getReportCategoryName(report.reportCategoryCode)}</strong>
            </div>

            <div className="admin-gis-info-item">
              <span>오류 유형</span>
              <strong>{getErrorTypeName(report.errorTypeCode)}</strong>
            </div>

            <div className="admin-gis-info-item">
              <span>삭제 여부</span>
              <strong>{getDeletedName(report.deletedYn)}</strong>
            </div>

            <div className="admin-gis-info-item">
              <span>조회수</span>
              <strong>{report.viewCount ?? 0}</strong>
            </div>
          </div>

          <section className="admin-gis-content-section">
            <h3>제보 내용</h3>
            <p>{report.content || "등록된 제보 내용이 없습니다."}</p>
          </section>

          <section className="admin-gis-location-section">
            <h3>위치 정보</h3>

            <div className="admin-gis-location-layout">
              <div className="admin-gis-map-area">
                <div ref={mapRef} className="admin-gis-detail-map"></div>
              </div>

              <div className="admin-gis-location-info">
                <div>
                  <span>주소</span>
                  <strong>{report.address || "-"}</strong>
                </div>

                <div>
                  <span>위도</span>
                  <strong>{report.latitude ?? "-"}</strong>
                </div>

                <div>
                  <span>경도</span>
                  <strong>{report.longitude ?? "-"}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-gis-management-section">
            <div className="admin-gis-process-area">
              <h3>처리 관리</h3>

              <div className="admin-gis-process-form-box">
                <div className="admin-gis-process-row">
                  <label>처리 상태</label>

                  <select
                    value={processStatusCode}
                    onChange={(e) => setProcessStatusCode(e.target.value)}
                    disabled={isDeleted}
                  >
                    {adminGisProcessStatusList.map((status) => (
                      <option key={status.code} value={status.code}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-gis-process-row textarea-row">
                  <label>관리자 처리 내용</label>

                  <div className="process-textarea-box">
                    <textarea
                      placeholder={
                        isDeleted
                          ? "삭제된 GIS 오류 제보 게시글은 처리 내용을 수정할 수 없습니다."
                          : "처리 내용을 입력해주세요."
                      }
                      value={adminProcessContent}
                      maxLength={500}
                      onChange={(e) => setAdminProcessContent(e.target.value)}
                      disabled={isDeleted}
                    />

                    <span>{adminProcessContent.length} / 500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-gis-history-area">
              <h3>처리 이력</h3>

              <div className="admin-gis-timeline">
                {processHistory.map((history) => (
                  <div className="timeline-item" key={history.historyId}>
                    <div className="timeline-dot"></div>

                    <div>
                      <strong>{formatDate(history.processedAt)}</strong>
                      <span>{history.statusName}</span>
                      <p>{history.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="admin-gis-detail-bottom">
            <button
              type="button"
              className="admin-gis-list-button"
              onClick={() => navigate("/admin/board/gis-report")}
            >
              목록으로
            </button>

            <button
              type="button"
              className="admin-gis-save-button"
              onClick={handleSave}
              disabled={isSaving || isDeleted}
            >
              {isSaving ? "저장 중..." : "처리 저장"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminGisReportDetailPage;