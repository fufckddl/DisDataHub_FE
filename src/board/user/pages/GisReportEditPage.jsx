import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";

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
  updateMyGisReportApi,
} from "../../api/gisReportApi";

import "../css/GisReportWritePage.css";

function GisReportEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [title, setTitle] = useState("");
  const [reportCategoryCode, setReportCategoryCode] = useState("LOCATION_ERROR");
  const [errorTypeCode, setErrorTypeCode] = useState("COORDINATE_ERROR");
  const [content, setContent] = useState("");

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [isOwner, setOwner] = useState(false);

  const getGisReportDetail = async () => {
    try {
      setLoading(true);

      const data = await getGisReportDetailApi(postId);

      if (data.result === "success") {
        if (data.isOwner !== true) {
          alert("작성자 본인만 수정할 수 있습니다.");
          navigate(`/board/gis-report/${postId}`);
          return;
        }

        const detail = data.gisReportDetail;

        setReport(detail);
        setOwner(data.isOwner === true);

        setTitle(detail.title ?? "");
        setReportCategoryCode(detail.reportCategoryCode ?? "LOCATION_ERROR");
        setErrorTypeCode(detail.errorTypeCode ?? "COORDINATE_ERROR");
        setContent(detail.content ?? "");
        setAddress(detail.address ?? "");
        setLatitude(String(detail.latitude ?? ""));
        setLongitude(String(detail.longitude ?? ""));
      }
    } catch (error) {
      console.error("GIS 오류제보 상세 조회 실패:", error);
      alert("수정할 GIS 오류제보 정보를 불러오는 중 오류가 발생했습니다.");
      navigate("/board/gis-report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    getGisReportDetail();
  }, [postId]);

  useEffect(() => {
    if (!mapRef.current || !report) {
      return;
    }

    const defaultLongitude = Number(report.longitude || 127.0365);
    const defaultLatitude = Number(report.latitude || 37.5007);

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

    const defaultMarker = new Feature({
      geometry: new Point(fromLonLat([defaultLongitude, defaultLatitude])),
    });

    defaultMarker.setStyle(markerStyle);
    markerSource.addFeature(defaultMarker);

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
        center: fromLonLat([defaultLongitude, defaultLatitude]),
        zoom: 15,
      }),
    });

    const handleMapClick = (event) => {
      const [lon, lat] = toLonLat(event.coordinate);

      setLongitude(lon.toFixed(7));
      setLatitude(lat.toFixed(7));

      markerSource.clear();

      const marker = new Feature({
        geometry: new Point(event.coordinate),
      });

      marker.setStyle(markerStyle);
      markerSource.addFeature(marker);
    };

    map.on("singleclick", handleMapClick);

    return () => {
      map.un("singleclick", handleMapClick);
      map.setTarget(null);
    };
  }, [report]);

  const getAddressParts = () => {
    const addressParts = address.trim().split(/\s+/);

    return {
      sido: addressParts[0] ?? "",
      sigungu: addressParts[1] ?? "",
      eupmyeondong: addressParts[2] ?? "",
    };
  };

  const handleSubmit = async () => {
    if (!isOwner) {
      alert("작성자 본인만 수정할 수 있습니다.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!address.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    if (!latitude || !longitude) {
      alert("위치 좌표를 선택해주세요.");
      return;
    }

    const { sido, sigungu, eupmyeondong } = getAddressParts();

    const requestData = {
      title,
      content,
      visibilityStatus: report?.visibilityStatus ?? "PUBLIC",

      reportCategoryCode,
      errorTypeCode,
      targetDataName: report?.targetDataName ?? "",
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      sido,
      sigungu,
      eupmyeondong,
    };

    try {
      setSubmitting(true);

      const data = await updateMyGisReportApi(postId, requestData);

      if (data.result === "success") {
        alert("GIS 오류제보가 수정되었습니다.");
        navigate(`/board/gis-report/${postId}`);
      } else {
        alert("GIS 오류제보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("GIS 오류제보 수정 실패:", error);
      alert("수정 중 오류가 발생했습니다. 작성자 본인인지 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="gis-report-write-page">
        <section className="gis-report-write-header">
          <div className="gis-report-write-icon">💬</div>
          <h1>GIS 오류제보 수정 정보를 불러오는 중입니다.</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="gis-report-write-page">
      <section className="gis-report-write-header">
        <div className="gis-report-write-icon">💬</div>
        <h1>GIS 데이터 오류 제보 수정</h1>
      </section>

      <section className="gis-report-write-form-card">
        <section className="gis-report-form-section">
          <div className="gis-report-form-row">
            <label>제목</label>
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="gis-report-form-row">
            <label>카테고리</label>
            <select
              value={reportCategoryCode}
              onChange={(e) => setReportCategoryCode(e.target.value)}
            >
              <option value="LOCATION_ERROR">위치 오류</option>
              <option value="MISSING_DATA">데이터 누락</option>
              <option value="ATTRIBUTE_ERROR">속성 오류</option>
              <option value="ETC">기타</option>
            </select>
          </div>

          <div className="gis-report-form-row">
            <label>오류 유형</label>
            <select
              value={errorTypeCode}
              onChange={(e) => setErrorTypeCode(e.target.value)}
            >
              <option value="COORDINATE_ERROR">좌표 오류</option>
              <option value="NAME_ERROR">명칭 오류</option>
              <option value="VALUE_ERROR">속성값 오류</option>
            </select>
          </div>

          <div className="gis-report-form-row textarea-row">
            <label>내용</label>
            <textarea
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </section>

        <div className="gis-report-divider" />

        <section className="gis-report-write-map-section">
          <h2>위치 선택</h2>

          <div ref={mapRef} className="gis-report-write-map"></div>

          <p className="map-help-text">
            지도에서 오류 위치를 클릭하면 위도와 경도가 변경됩니다.
          </p>
        </section>

        <section className="gis-report-location-info">
          <h2>선택된 위치 정보</h2>

          <div className="gis-report-form-row">
            <label>주소</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="gis-report-form-row">
            <label>위도</label>
            <input type="text" value={latitude} readOnly />
          </div>

          <div className="gis-report-form-row">
            <label>경도</label>
            <input type="text" value={longitude} readOnly />
          </div>
        </section>

        <div className="gis-report-button-area">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/board/gis-report/${postId}`)}
          >
            취소
          </button>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default GisReportEditPage;