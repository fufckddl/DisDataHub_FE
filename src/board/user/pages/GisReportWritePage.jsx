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
import {
  getSidoListApi,
  getSigunguListApi,
  getEupmyeondongListApi,
} from "../../api/regionApi";
import { geocodeApi } from "../../api/locationApi";

import useAuthStore from "../../../commons/auth/useAuthStore";
import "../css/GisReportWritePage.css";

function GisReportWritePage() {
  const navigate = useNavigate();

  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerSourceRef = useRef(null);
  const markerStyleRef = useRef(null);
  const fullAddressRef = useRef("");

  const userInfo = useAuthStore((state) => state.userInfo);

  const [title, setTitle] = useState("");
  const [reportCategoryCode, setReportCategoryCode] =
    useState("LOCATION_ERROR");
  const [errorTypeCode, setErrorTypeCode] = useState("COORDINATE_ERROR");
  const [content, setContent] = useState("");

  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [eupmyeondongList, setEupmyeondongList] = useState([]);

  const [sidoCode, setSidoCode] = useState("");
  const [sigunguCode, setSigunguCode] = useState("");
  const [eupmyeondongCode, setEupmyeondongCode] = useState("");

  const [detailAddress, setDetailAddress] = useState("");

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("37.5007000");
  const [longitude, setLongitude] = useState("127.0365000");

  const [isSearchingLocation, setSearchingLocation] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const normalizeList = (data) => {
    console.log("normalizeList로 들어온 원본 data:", data);

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.list)) {
      return data.list;
    }

    if (Array.isArray(data?.result)) {
      return data.result;
    }

    return [];
  };

  const getSelectedName = (list, code) => {
    if (!Array.isArray(list)) {
      console.log("getSelectedName list가 배열이 아님:", list);
      return "";
    }

    const item = list.find((item) => String(item.code) === String(code));
    return item?.name ?? "";
  };

  const sidoName = getSelectedName(sidoList, sidoCode);
  const sigunguName = getSelectedName(sigunguList, sigunguCode);
  const eupmyeondongName = getSelectedName(eupmyeondongList, eupmyeondongCode);

  const fullAddress = [
    sidoName,
    sigunguName,
    eupmyeondongName,
    detailAddress,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    fullAddressRef.current = fullAddress;
  }, [fullAddress]);

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
    const getSidoList = async () => {
      try {
        const data = await getSidoListApi();

        console.log("시/도 목록 API 응답:", data);
        console.log("시/도 목록 응답 타입:", typeof data);
        console.log("시/도 목록 배열 여부:", Array.isArray(data));

        const list = normalizeList(data);

        console.log("화면에 저장할 시/도 목록:", list);

        setSidoList(list);
      } catch (error) {
        console.error("시/도 목록 조회 실패:", error);
        setSidoList([]);
      }
    };

    getSidoList();
  }, []);

  useEffect(() => {
    if (!sidoCode) {
      setSigunguList([]);
      setEupmyeondongList([]);
      setSigunguCode("");
      setEupmyeondongCode("");
      setAddress("");
      return;
    }

    const getSigunguList = async () => {
      try {
        const data = await getSigunguListApi(sidoCode);

        console.log("선택한 시/도 코드:", sidoCode);
        console.log("시/군/구 목록 API 응답:", data);
        console.log("시/군/구 목록 응답 타입:", typeof data);
        console.log("시/군/구 목록 배열 여부:", Array.isArray(data));

        const list = normalizeList(data);

        console.log("화면에 저장할 시/군/구 목록:", list);

        setSigunguList(list);
        setEupmyeondongList([]);
        setSigunguCode("");
        setEupmyeondongCode("");
        setAddress("");
      } catch (error) {
        console.error("시/군/구 목록 조회 실패:", error);
        setSigunguList([]);
      }
    };

    getSigunguList();
  }, [sidoCode]);

  useEffect(() => {
    if (!sigunguCode) {
      setEupmyeondongList([]);
      setEupmyeondongCode("");
      setAddress("");
      return;
    }

    const getEupmyeondongList = async () => {
      try {
        const data = await getEupmyeondongListApi(sigunguCode);

        console.log("선택한 시/군/구 코드:", sigunguCode);
        console.log("읍/면/동 목록 API 응답:", data);
        console.log("읍/면/동 목록 응답 타입:", typeof data);
        console.log("읍/면/동 목록 배열 여부:", Array.isArray(data));

        const list = normalizeList(data);

        console.log("화면에 저장할 읍/면/동 목록:", list);

        setEupmyeondongList(list);
        setEupmyeondongCode("");
        setAddress("");
      } catch (error) {
        console.error("읍/면/동 목록 조회 실패:", error);
        setEupmyeondongList([]);
      }
    };

    getEupmyeondongList();
  }, [sigunguCode]);

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

      console.log("지도 클릭 좌표:", {
        longitude: lon,
        latitude: lat,
      });

      setLongitude(lon.toFixed(7));
      setLatitude(lat.toFixed(7));
      setAddress(fullAddressRef.current || "지도에서 직접 선택한 위치");

      moveMarker(lon, lat, false);
    };

    map.on("singleclick", handleMapClick);

    return () => {
      map.un("singleclick", handleMapClick);
      map.setTarget(null);
    };
  }, []);

  const handleSearchLocation = async () => {
    if (!sidoCode) {
      alert("시/도를 선택해주세요.");
      return;
    }

    if (!sigunguCode) {
      alert("시/군/구를 선택해주세요.");
      return;
    }

    if (!eupmyeondongCode) {
      alert("읍/면/동을 선택해주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      alert("상세 위치를 입력해주세요.");
      return;
    }

    const searchAddress = fullAddress.trim();

    console.log("위치 검색 요청 주소:", searchAddress);

    try {
      setSearchingLocation(true);

      const data = await geocodeApi(searchAddress);

      console.log("위치 검색 API 응답:", data);

      if (data.result !== "success") {
        alert(data.message || "위치 검색에 실패했습니다.");
        return;
      }

      setAddress(searchAddress);
      setLatitude(String(data.latitude));
      setLongitude(String(data.longitude));

      moveMarker(data.longitude, data.latitude, true);
    } catch (error) {
      console.error("위치 검색 실패:", error);
      alert("위치 검색 중 오류가 발생했습니다.");
    } finally {
      setSearchingLocation(false);
    }
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

    if (!sidoCode) {
      alert("시/도를 선택해주세요.");
      return;
    }

    if (!sigunguCode) {
      alert("시/군/구를 선택해주세요.");
      return;
    }

    if (!eupmyeondongCode) {
      alert("읍/면/동을 선택해주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      alert("상세 위치를 입력해주세요.");
      return;
    }

    if (!address.trim()) {
      alert("위치 검색을 통해 주소를 확정해주세요.");
      return;
    }

    if (!latitude || !longitude) {
      alert("위도와 경도를 찾을 수 없습니다. 위치 검색을 먼저 진행해주세요.");
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

      sido: sidoName,
      sigungu: sigunguName,
      eupmyeondong: eupmyeondongName,
      detailAddress,
      address,

      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    console.log("GIS 오류 제보 등록 요청 데이터:", requestData);

    try {
      setSubmitting(true);

      const data = await createGisReportApi(requestData);

      console.log("GIS 오류 제보 등록 API 응답:", data);

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

        <section className="gis-report-location-info">
          <h2>위치 검색</h2>

          <div className="gis-report-location-select-row">
            <select
              value={sidoCode}
              onChange={(e) => {
                setSidoCode(e.target.value);
                setAddress("");
              }}
            >
              <option value="">시/도 선택</option>
              {Array.isArray(sidoList) &&
                sidoList.map((sido) => (
                  <option key={sido.code} value={sido.code}>
                    {sido.name}
                  </option>
                ))}
            </select>

            <select
              value={sigunguCode}
              onChange={(e) => {
                setSigunguCode(e.target.value);
                setAddress("");
              }}
              disabled={!sidoCode}
            >
              <option value="">시/군/구 선택</option>
              {Array.isArray(sigunguList) &&
                sigunguList.map((sigungu) => (
                  <option key={sigungu.code} value={sigungu.code}>
                    {sigungu.name}
                  </option>
                ))}
            </select>

            <select
              value={eupmyeondongCode}
              onChange={(e) => {
                setEupmyeondongCode(e.target.value);
                setAddress("");
              }}
              disabled={!sigunguCode}
            >
              <option value="">읍/면/동 선택</option>
              {Array.isArray(eupmyeondongList) &&
                eupmyeondongList.map((dong) => (
                  <option key={dong.code} value={dong.code}>
                    {dong.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="gis-report-form-row">
            <label>상세 위치</label>
            <div className="gis-report-address-search-row">
              <input
                type="text"
                placeholder="도로명, 지번, 건물명 등을 입력해주세요"
                value={detailAddress}
                onChange={(e) => {
                  setDetailAddress(e.target.value);
                  setAddress("");
                }}
              />

              <button
                type="button"
                className="location-search-button"
                onClick={handleSearchLocation}
                disabled={isSearchingLocation}
              >
                {isSearchingLocation ? "검색 중..." : "위치 검색"}
              </button>
            </div>
          </div>

          <div className="gis-report-form-row">
            <label>확정 주소</label>
            <input
              type="text"
              value={address}
              placeholder="위치 검색 후 자동으로 입력됩니다"
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
        </section>

        <section className="gis-report-write-map-section">
          <h2>지도 확인</h2>

          <div ref={mapElementRef} className="gis-report-write-map"></div>

          <p className="map-help-text">
            위치 검색 후 지도에 마커가 표시됩니다. 실제 오류 위치가 다르면
            지도를 클릭해 좌표를 조정할 수 있습니다.
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