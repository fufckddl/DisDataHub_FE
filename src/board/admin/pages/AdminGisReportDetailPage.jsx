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

import {
  adminGisReportMockList,
  adminGisProcessStatusMockList,
} from "../../mock/adminGisReportMockData";

import "../css/AdminGisReportDetailPage.css";

function AdminGisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const report = adminGisReportMockList.find(
    (item) => item.postId === Number(postId)
  );

  const [processStatusCode, setProcessStatusCode] = useState(
    report?.processStatusCode || "RECEIVED"
  );

  const [adminProcessContent, setAdminProcessContent] = useState(
    report?.adminProcessContent || ""
  );

  const getErrorTypeClassName = (errorTypeCode) => {
    if (errorTypeCode === "SPATIAL_ERROR") return "error-spatial";
    if (errorTypeCode === "MISSING_DATA") return "error-missing";
    if (errorTypeCode === "ATTRIBUTE_ERROR") return "error-attribute";
    if (errorTypeCode === "UPDATE_REQUEST") return "error-update";
    if (errorTypeCode === "CLASSIFY_ERROR") return "error-classify";
    return "error-etc";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "REVIEWING") return "status-reviewing";
    if (statusCode === "ACTIONING") return "status-actioning";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  useEffect(() => {
    if (!mapRef.current || !report) return;

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

  const handleSave = () => {
    const selectedStatus = adminGisProcessStatusMockList.find(
      (status) => status.code === processStatusCode
    );

    const requestData = {
      postId: report.postId,
      processStatusCode,
      processStatusName: selectedStatus?.name,
      adminProcessContent,
    };

    console.log("GIS 제보 처리 저장 데이터:", requestData);
    alert("현재는 디자인 단계입니다. 처리 상태 저장 API는 나중에 연결합니다.");
  };

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

  const reportContent =
    report.content ||
    "사용자가 등록한 GIS 오류 제보 내용이 표시됩니다. 상세 데이터는 백엔드 API 연결 후 실제 DB 데이터로 대체됩니다.";

  const processHistory = report.processHistory || [
    {
      historyId: 1,
      statusName: report.processStatusName,
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
              {report.errorTypeName}
            </span>

            <span
              className={`admin-gis-status-badge ${getStatusClassName(
                report.processStatusCode
              )}`}
            >
              {report.processStatusName}
            </span>
          </div>

          <h2>{report.title}</h2>

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
              {report.writerName || "사용자"}{" "}
              {report.writerId ? `(${report.writerId})` : ""}
            </strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{report.createdAt}</strong>
          </div>

          <div>
            <span>오류 유형</span>
            <strong>{report.errorTypeName}</strong>
          </div>

          <div>
            <span>대상 데이터명</span>
            <strong>{report.targetDataName}</strong>
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
                  <strong>{report.address}</strong>
                </div>

                <div>
                  <span>위도</span>
                  <strong>{report.latitude || "37.500700"}</strong>
                </div>

                <div>
                  <span>경도</span>
                  <strong>{report.longitude || "127.036500"}</strong>
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
                    <strong>{history.processedAt}</strong>
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

            <p>{reportContent}</p>

            <div className="admin-gis-file-area">
              <h4>첨부 파일</h4>

              {report.attachmentName ? (
                <div className="admin-gis-file-item">
                  <span>📎 {report.attachmentName}</span>
                  <button type="button">다운로드</button>
                </div>
              ) : (
                <div className="admin-gis-file-empty">
                  첨부파일이 없습니다.
                </div>
              )}
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
                {adminGisProcessStatusMockList
                  .filter((status) => status.code !== "")
                  .map((status) => (
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