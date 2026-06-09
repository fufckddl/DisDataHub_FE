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
import { searchLocationApi } from "../../api/locationApi";

import useAuthStore from "../../../commons/auth/useAuthStore";
import "../css/GisReportWritePage.css";

function GisReportWritePage() {
  const navigate = useNavigate();

  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerSourceRef = useRef(null);
  const markerStyleRef = useRef(null);

  const userInfo = useAuthStore((state) => state.userInfo);

  const [title, setTitle] = useState("");
  const [reportCategoryCode, setReportCategoryCode] =
    useState("LOCATION_ERROR");
  const [errorTypeCode, setErrorTypeCode] = useState("COORDINATE_ERROR");
  const [content, setContent] = useState("");

  const [locationKeyword, setLocationKeyword] = useState("");
  const [locationResultList, setLocationResultList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("37.5007000");
  const [longitude, setLongitude] = useState("127.0365000");

  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [eupmyeondong, setEupmyeondong] = useState("");

  const [isSearchingLocation, setSearchingLocation] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const addMarker = (lon, lat) => {
    if (!markerSourceRef.current || !markerStyleRef.current) return;

    const marker = new Feature({
      geometry: new Point(fromLonLat([Number(lon), Number(lat)])),
    });

    marker.setStyle(markerStyleRef.current);
    markerSourceRef.current.addFeature(marker);
  };

  const moveMarker = (lon, lat, moveCenter = true) => {
    if (!markerSourceRef.current) return;

    markerSourceRef.current.clear();
    addMarker(lon, lat);

    if (moveCenter && mapInstanceRef.current) {
      mapInstanceRef.current.getView().animate({
        center: fromLonLat([Number(lon), Number(lat)]),
        zoom: 17,
        duration: 400,
      });
    }
  };

  useEffect(() => {
    if (!mapElementRef.current) return;

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
      target: mapElementRef.current,
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

    mapInstanceRef.current = map;
    markerSourceRef.current = markerSource;
    markerStyleRef.current = markerStyle;

    addMarker(127.0365, 37.5007);

    const handleMapClick = (event) => {
      const [lon, lat] = toLonLat(event.coordinate);

      setLongitude(lon.toFixed(7));
      setLatitude(lat.toFixed(7));

      if (!address.trim()) {
        setAddress("지도에서 직접 선택한 위치");
      }

      moveMarker(lon, lat, false);
    };

    map.on("singleclick", handleMapClick);

    return () => {
      map.un("singleclick", handleMapClick);
      map.setTarget(null);
    };
  }, [address]);

  const handleSearchLocation = async () => {
    if (!locationKeyword.trim()) {
      alert("검색할 주소나 장소명을 입력해주세요.");
      return;
    }

    try {
      setSearchingLocation(true);
      setHasSearchedLocation(true);
      setLocationResultList([]);
      setSelectedLocation(null);

      const data = await searchLocationApi(locationKeyword.trim());

      if (!Array.isArray(data)) {
        setLocationResultList([]);
        return;
      }

      setLocationResultList(data);
    } catch (error) {
      console.error("위치 검색 실패:", error);
      alert("위치 검색 중 오류가 발생했습니다.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);

    setAddress(location.address ?? "");
    setLatitude(String(location.latitude ?? ""));
    setLongitude(String(location.longitude ?? ""));

    setSido(location.sido ?? "");
    setSigungu(location.sigungu ?? "");
    setEupmyeondong(location.eupmyeondong ?? "");

    moveMarker(location.longitude, location.latitude, true);
  };

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
      alert("주소 검색 결과를 선택하거나 지도에서 위치를 선택해주세요.");
      return;
    }

    if (!latitude || !longitude) {
      alert("위도와 경도를 찾을 수 없습니다. 위치를 먼저 선택해주세요.");
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
      targetDataName: selectedLocation?.title ?? "",

      address,
      detailAddress: address,

      latitude: Number(latitude),
      longitude: Number(longitude),

      sido,
      sigungu,
      eupmyeondong,
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
    <div className="container-fluid px-4 py-3 gis-report-write-page">
      <section className="gis-report-write-header">
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

        <section className="gis-report-location-info">
          <h2>위치 검색</h2>

          <div className="gis-report-form-row">
            <label>주소 검색</label>
            <div className="gis-report-address-search-row">
              <input
                type="text"
                placeholder="예: 봉은사로 524, 테헤란로 152, 서울특별시 강남구 봉은사로 524"
                value={locationKeyword}
                onChange={(e) => setLocationKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchLocation();
                  }
                }}
              />

              <button
                type="button"
                className="location-search-button"
                onClick={handleSearchLocation}
                disabled={isSearchingLocation}
              >
                {isSearchingLocation ? "검색 중..." : "검색"}
              </button>
            </div>
          </div>

          <p className="location-search-help">
            도로명과 건물번호를 입력하면 검색됩니다. 검색 결과가 없으면 지도에서
            직접 위치를 클릭해 좌표를 지정할 수 있습니다.
          </p>

          {hasSearchedLocation && locationResultList.length === 0 && (
            <div className="location-result-empty">
              검색 결과가 없습니다. 주소를 더 자세히 입력하거나 지도에서 직접
              위치를 선택해주세요.
            </div>
          )}

          {locationResultList.length > 0 && (
            <div className="location-result-list">
              {locationResultList.map((location, index) => {
                const isSelected =
                  selectedLocation &&
                  selectedLocation.address === location.address &&
                  selectedLocation.latitude === location.latitude &&
                  selectedLocation.longitude === location.longitude;

                return (
                  <button
                    type="button"
                    key={`${location.address}-${location.latitude}-${location.longitude}-${index}`}
                    className={
                      isSelected
                        ? "location-result-item selected"
                        : "location-result-item"
                    }
                    onClick={() => handleSelectLocation(location)}
                  >
                    <strong>{location.title || location.address}</strong>
                    <span>{location.address}</span>
                    <em>
                      {location.sido} {location.sigungu}{" "}
                      {location.eupmyeondong}
                    </em>
                  </button>
                );
              })}
            </div>
          )}

          <div className="gis-report-form-row">
            <label>확정 주소</label>
            <input
              type="text"
              value={address}
              placeholder="검색 결과를 선택하면 자동으로 입력됩니다"
              readOnly
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

          <div className="gis-report-form-row">
            <label>시/도</label>
            <input type="text" value={sido} readOnly />
          </div>

          <div className="gis-report-form-row">
            <label>시/군/구</label>
            <input type="text" value={sigungu} readOnly />
          </div>

          <div className="gis-report-form-row">
            <label>읍/면/동</label>
            <input type="text" value={eupmyeondong} readOnly />
          </div>
        </section>

        <section className="gis-report-write-map-section">
          <h2>지도 확인</h2>

          <div ref={mapElementRef} className="gis-report-write-map"></div>

          <p className="map-help-text">
            검색 결과를 선택하면 지도에 마커가 표시됩니다. 실제 오류 위치가
            다르면 지도를 클릭해 좌표를 조정할 수 있습니다.
          </p>
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