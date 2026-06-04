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

import { VWORLD_BASE_MAP_URL } from "../../config/vworldConfig";
import { getAdminGisReportDetailApi } from "../../api/gisReportApi";

import "../css/AdminGisReportDetailPage.css";

function AdminGisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [report, setReport] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [processStatusCode, setProcessStatusCode] = useState("RECEIVED");
  const [adminProcessContent, setAdminProcessContent] = useState("");

  const adminGisProcessStatusList = [
    { code: "RECEIVED", name: "제보완료" },
    { code: "REVIEWING", name: "검토중" },
    { code: "PROCESSING", name: "조치중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const getAdminGisReportDetail = async () => {
    try {
      setLoading(true);

      const data = await getAdminGisReportDetailApi(postId);

      console.log("관리자 GIS 상세 응답:", data);

      if (data.result === "success") {
        const detail = data.adminGisReportDetail ?? data.gisReportDetail;

        setReport(detail);
        setProcessStatusCode(detail?.processStatusCode ?? "RECEIVED");
        setAdminProcessContent(detail?.adminProcessContent ?? "");
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
          color: "#1f6feb",
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
            url: VWORLD_BASE_MAP_URL,
          }),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([longitude, latitude]),
        zoom: 15,
      }),
    });

    return () => {
      map.setTarget(null);
    };
  }, [report]);

  const getErrorTypeClassName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "error-spatial";
    if (errorTypeCode === "NAME_ERROR") return "error-classify";
    if (errorTypeCode === "VALUE_ERROR") return "error-attribute";
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
    if (statusCode === "REVIEWING") return "status-reviewing";
    if (statusCode === "PROCESSING") return "status-actioning";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "REVIEWING") return "검토중";
    if (statusCode === "PROCESSING") return "조치중";
    if (statusCode === "COMPLETED") return "처리완료";
    return statusCode ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleSave = () => {
    const selectedStatus = adminGisProcessStatusList.find(
      (status) => status.code === processStatusCode
    );

    const requestData = {
      postId: report.postId,
      processStatusCode,
      processStatusName: selectedStatus?.name,
      adminProcessContent,
    };

    console.log("GIS 제보 처리 저장 데이터:", requestData);
    alert("처리 상태 저장 API는 다음 단계에서 연결합니다.");
  };

  if (isLoading) {
    return (
      <div className="admin-gis-detail-page">
        <section className="admin-gis-not-found">
          <h1>GIS 오류 제보 상세 정보를 불러오는 중입니다.</h1>
        </section>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="admin-gis-detail-page">
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

  const processHistory = report.processHistory ?? [
    {
      historyId: 1,
      statusName: getProcessStatusName(report.processStatusCode),
      processedAt: report.createdAt,
      content: "GIS 오류 제보가 등록되었습니다.",
    },
  ];

  return (
    <div className="admin-gis-detail-page">
      <div className="admin-gis-detail-container">
        <div className="admin-gis-detail-top">
          <h1>GIS 오류 제보 상세 관리</h1>

          <button
            type="button"
            className="top-list-button"
            onClick={() => navigate("/admin/board/gis-report")}
          >
            ← 목록으로
          </button>
        </div>

        <section className="admin-gis-detail-header-card">
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
          </div>

          <h2>{report.title || "제목 없음"}</h2>

          <p>
            {report.content
              ? report.content.split("\n")[0]
              : "GIS 데이터 오류 제보 상세 정보를 확인할 수 있습니다."}
          </p>
        </section>

        <section className="admin-gis-meta-card">
          <div>
            <span>작성자</span>
            <strong>
              {report.writerName ||
                report.nickname ||
                `사용자 ${report.userId ?? "-"}`}
            </strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(report.createdAt)}</strong>
          </div>

          <div>
            <span>제보 유형</span>
            <strong>{getReportCategoryName(report.reportCategoryCode)}</strong>
          </div>

          <div>
            <span>오류 유형</span>
            <strong>{getErrorTypeName(report.errorTypeCode)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{report.viewCount ?? 0}</strong>
          </div>
        </section>

        <div className="admin-gis-main-grid">
          <section className="admin-gis-location-card">
            <h3>위치 정보</h3>

            <div className="admin-gis-location-layout">
              <div ref={mapRef} className="admin-gis-detail-map"></div>

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

          <section className="admin-gis-history-card">
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
          </section>
        </div>

        <div className="admin-gis-bottom-grid">
          <section className="admin-gis-content-card">
            <h3>제보 내용</h3>

            <p>{report.content || "등록된 제보 내용이 없습니다."}</p>

            <div className="admin-gis-file-area">
              <h4>첨부 파일</h4>

              <div className="admin-gis-file-empty">
                첨부파일이 없습니다.
              </div>
            </div>
          </section>

          <section className="admin-gis-process-card">
            <h3>처리 관리</h3>

            <div className="admin-gis-process-row">
              <label>처리 상태 *</label>

              <select
                value={processStatusCode}
                onChange={(e) => setProcessStatusCode(e.target.value)}
              >
                {adminGisProcessStatusList.map((status) => (
                  <option key={status.code} value={status.code}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-gis-process-row textarea-row">
              <label>관리자 처리 내용 *</label>

              <div className="process-textarea-box">
                <textarea
                  placeholder="처리 내용을 입력해주세요."
                  value={adminProcessContent}
                  maxLength={500}
                  onChange={(e) => setAdminProcessContent(e.target.value)}
                />

                <span>{adminProcessContent.length} / 500</span>
              </div>
            </div>

            <button
              type="button"
              className="process-save-button"
              onClick={handleSave}
            >
              ✓ 저장
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminGisReportDetailPage;