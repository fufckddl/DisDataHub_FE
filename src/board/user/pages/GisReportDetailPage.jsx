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
import { getGisReportDetailApi } from "../../api/gisReportApi";

import "../css/GisReportDetailPage.css";

function GisReportDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const [report, setReport] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const getGisReportDetail = async () => {
    try {
      setLoading(true);

      const data = await getGisReportDetailApi(postId);

      console.log("GIS 상세 응답:", data);
      console.log("GIS 상세 조회수:", data.gisReportDetail?.viewCount);

      if (data.result === "success") {
        setReport(data.gisReportDetail);
      }
    } catch (error) {
      console.error("GIS 오류제보 상세 조회 실패:", error);
      alert("GIS 오류제보 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    getGisReportDetail();
  }, [postId]);

  useEffect(() => {
    if (!mapRef.current || !report) {
      return;
    }

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

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "REVIEWING") return "status-checking";
    if (statusCode === "PROCESSING") return "status-checking";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "CHECKING") return "검토중";
    if (statusCode === "REVIEWING") return "검토중";
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

  if (isLoading) {
    return (
      <div className="gis-report-detail-page">
        <div className="gis-report-detail-container">
          <section className="gis-report-not-found">
            <h1>GIS 오류제보 상세 정보를 불러오는 중입니다.</h1>
          </section>
        </div>
      </div>
    );
  }

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
              {getReportCategoryName(report.reportCategoryCode)}
            </span>

            <span
              className={`gis-status-badge ${getStatusClassName(
                report.processStatusCode
              )}`}
            >
              {getProcessStatusName(report.processStatusCode)}
            </span>
          </div>

          <h1>{report.title || "제목 없음"}</h1>
          <p>GIS 데이터 오류 제보 상세 정보를 확인할 수 있습니다.</p>
        </section>

        <section className="gis-report-detail-meta">
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
            <span>조회수</span>
            <strong>{report.viewCount ?? 0}</strong>
          </div>
        </section>

        <section className="gis-report-info-section">
          <h2>제보 정보</h2>

          <div className="gis-info-grid">
            <div>
              <span>제보 유형</span>
              <strong>{getReportCategoryName(report.reportCategoryCode)}</strong>
            </div>

            <div>
              <span>오류 유형</span>
              <strong>{getErrorTypeName(report.errorTypeCode)}</strong>
            </div>

            <div>
              <span>처리 상태</span>
              <strong>{getProcessStatusName(report.processStatusCode)}</strong>
            </div>

            <div>
              <span>주소</span>
              <strong>{report.address || "-"}</strong>
            </div>
          </div>
        </section>

        <section className="gis-report-location-section">
          <h2>위치 정보</h2>

          <div ref={mapRef} className="gis-report-detail-map"></div>

          <div className="gis-location-grid">
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
        </section>

        <section className="gis-report-content-section">
          <h2>제보 내용</h2>
          <p>{report.content || "등록된 제보 내용이 없습니다."}</p>
        </section>

        <section className="gis-report-file-section">
          <h2>첨부파일</h2>

          <div className="gis-file-empty">첨부파일이 없습니다.</div>
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
                report.processStatusCode === "REVIEWING" ||
                report.processStatusCode === "PROCESSING" ||
                report.processStatusCode === "COMPLETED"
                  ? "process-item active"
                  : "process-item"
              }
            >
              <strong>검토 / 처리 중</strong>
              <p>관리자가 제보 내용을 확인 중입니다.</p>
            </div>

            <div
              className={
                report.processStatusCode === "COMPLETED"
                  ? "process-item active"
                  : "process-item"
              }
            >
              <strong>처리 완료</strong>
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