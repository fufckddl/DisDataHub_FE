import { useEffect, useRef } from "react";
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
import { gisReportMockList } from "../../mock/gisReportListPage";

import "../css/GisReportDetailPage.css";

function GisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const report = gisReportMockList.find(
    (item) => item.postId === Number(postId)
  );

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  useEffect(() => {
    if (!mapRef.current || !report) return;

    const longitude = Number(report.longitude || 127.0276);
    const latitude = Number(report.latitude || 37.4979);

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

  if (!report) {
    return (
      <div className="gis-report-detail-page">
        <div className="gis-report-detail-container">
          <section className="gis-report-not-found">
            <h1>제보글을 찾을 수 없습니다.</h1>
            <button type="button" onClick={() => navigate("/board/gis-report")}>
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="gis-report-detail-page">
      <div className="gis-report-detail-container">
        <section className="gis-report-detail-header">
          <div className="gis-report-detail-badge-area">
            <span className="gis-category-badge">
              {report.reportCategoryName}
            </span>

            <span
              className={`gis-status-badge ${getStatusClassName(
                report.processStatusCode
              )}`}
            >
              {report.processStatusName}
            </span>
          </div>

          <h1>{report.title}</h1>
          <p>GIS 데이터 오류 제보 상세 정보를 확인할 수 있습니다.</p>
        </section>

        <section className="gis-report-detail-meta">
          <div>
            <span>작성자</span>
            <strong>{report.writerName}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{report.createdAt}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{report.viewCount}</strong>
          </div>
        </section>

        <section className="gis-report-info-section">
          <h2>제보 정보</h2>

          <div className="gis-info-grid">
            <div>
              <span>오류 유형</span>
              <strong>{report.reportCategoryName}</strong>
            </div>

            <div>
              <span>대상 데이터</span>
              <strong>{report.targetDataName}</strong>
            </div>

            <div>
              <span>처리 상태</span>
              <strong>{report.processStatusName}</strong>
            </div>

            <div>
              <span>행정구역</span>
              <strong>
                {report.sido} {report.sigungu} {report.eupmyeondong}
              </strong>
            </div>
          </div>
        </section>

        <section className="gis-report-location-section">
          <h2>위치 정보</h2>

          <div ref={mapRef} className="gis-report-detail-map"></div>

          <div className="gis-location-grid">
            <div>
              <span>주소</span>
              <strong>{report.address}</strong>
            </div>

            <div>
              <span>위도</span>
              <strong>{report.latitude}</strong>
            </div>

            <div>
              <span>경도</span>
              <strong>{report.longitude}</strong>
            </div>
          </div>
        </section>

        <section className="gis-report-content-section">
          <h2>제보 내용</h2>
          <p>{report.content}</p>
        </section>

        <section className="gis-report-file-section">
          <h2>첨부파일</h2>

          {report.attachmentName ? (
            <div className="gis-file-item">📎 {report.attachmentName}</div>
          ) : (
            <div className="gis-file-empty">첨부파일이 없습니다.</div>
          )}
        </section>

        <section className="gis-report-process-section">
          <h2>처리 내역</h2>

          <div className="process-timeline">
            <div className="process-item active">
              <strong>제보 접수</strong>
              <p>사용자가 GIS 데이터 오류를 제보했습니다.</p>
            </div>

            <div
              className={
                report.processStatusCode === "CHECKING" ||
                report.processStatusCode === "COMPLETED"
                  ? "process-item active"
                  : "process-item"
              }
            >
              <strong>확인 중</strong>
              <p>관리자가 제보 내용을 확인 중입니다.</p>
            </div>

            <div
              className={
                report.processStatusCode === "COMPLETED"
                  ? "process-item active"
                  : "process-item"
              }
            >
              <strong>수정 완료</strong>
              <p>오류 데이터 수정이 완료되었습니다.</p>
            </div>
          </div>
        </section>

        <section className="gis-report-detail-button-area">
          <button type="button">이전글</button>

          <button type="button" onClick={() => navigate("/board/gis-report")}>
            목록으로
          </button>

          <button type="button">다음글</button>
        </section>
      </div>
    </div>
  );
}

export default GisReportDetailPage;