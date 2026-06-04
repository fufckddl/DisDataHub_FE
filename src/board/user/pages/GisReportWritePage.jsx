import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { createGisReportApi } from "../../api/gisReportApi";
import useAuthStore from "../../../commons/auth/useAuthStore";
import "../css/GisReportWritePage.css";

function GisReportWritePage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const userInfo = useAuthStore((state) => state.userInfo);

  const [title, setTitle] = useState("");
  const [reportCategoryCode, setReportCategoryCode] =
    useState("LOCATION_ERROR");
  const [errorTypeCode, setErrorTypeCode] = useState("COORDINATE_ERROR");
  const [content, setContent] = useState("");

  const [address, setAddress] = useState("서울특별시 강남구 역삼동");
  const [latitude, setLatitude] = useState("37.5007000");
  const [longitude, setLongitude] = useState("127.0365000");

  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

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
        center: fromLonLat([127.0365, 37.5007]),
        zoom: 15,
      }),
    });

    const defaultMarker = new Feature({
      geometry: new Point(fromLonLat([127.0365, 37.5007])),
    });

    defaultMarker.setStyle(markerStyle);
    markerSource.addFeature(defaultMarker);

    const handleMapClick = (event) => {
      const [lon, lat] = toLonLat(event.coordinate);

      setLongitude(lon.toFixed(7));
      setLatitude(lat.toFixed(7));
      setAddress("선택한 위치의 주소 조회 예정");

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
  }, []);

  const handleSubmit = async () => {
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

    const userId = userInfo?.userId ?? userInfo?.id;

    if (!userId) {
      alert("로그인한 사용자 정보를 찾을 수 없습니다.");
      return;
    }

    const requestData = {
      userId,
      title,
      content,
      visibilityStatus: "PUBLIC",

      reportCategoryCode,
      errorTypeCode,
      targetDataName: "",
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      sido: "",
      sigungu: "",
      eupmyeondong: "",
    };

    try {
      setSubmitting(true);

      const data = await createGisReportApi(requestData);

      if (data.result === "success") {
        alert("GIS 오류 제보가 등록되었습니다.");
        navigate("/board/gis-report");
      } else {
        alert("GIS 오류 제보 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("GIS 오류 제보 등록 실패:", error);
      alert("GIS 오류 제보 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gis-report-write-page">
      <section className="gis-report-write-header">
        <div className="gis-report-write-icon">💬</div>
        <h1>GIS 데이터 오류 제보 작성</h1>
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
            지도에서 오류 위치를 클릭하면 위도와 경도가 자동으로 입력됩니다.
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
            onClick={() => navigate("/board/gis-report")}
          >
            취소
          </button>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default GisReportWritePage;