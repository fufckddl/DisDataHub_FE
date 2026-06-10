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

import {
  getGisReportDetailApi,
  updateMyGisReportApi,
} from "../../api/gisReportApi";

import { loadKakaoMapScript } from "../../utils/loadKakaoMapScript";

import "../css/GisReportWritePage.css";

const OSM_BASE_MAP_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const DEFAULT_LATITUDE = "37.5007000";
const DEFAULT_LONGITUDE = "127.0365000";

const MAX_LOCATION_RESULT_COUNT = 20;

const SEOUL_GU_LIST = [
  "종로구",
  "중구",
  "용산구",
  "성동구",
  "광진구",
  "동대문구",
  "중랑구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "서대문구",
  "마포구",
  "양천구",
  "강서구",
  "구로구",
  "금천구",
  "영등포구",
  "동작구",
  "관악구",
  "서초구",
  "강남구",
  "송파구",
  "강동구",
];

const normalizeText = (value) => {
  return String(value ?? "").replace(/\s+/g, " ").trim();
};

const parseRegionFromAddress = (addressText) => {
  const result = {
    sido: "",
    sigungu: "",
    eupmyeondong: "",
  };

  if (!addressText) {
    return result;
  }

  const trimmedAddress = normalizeText(addressText);
  const parts = trimmedAddress.split(/\s+/);

  result.sido = parts[0] ?? "";
  result.sigungu = parts[1] ?? "";

  const openIndex = trimmedAddress.indexOf("(");
  const closeIndex = trimmedAddress.indexOf(")");

  if (openIndex >= 0 && closeIndex > openIndex) {
    result.eupmyeondong = trimmedAddress
      .substring(openIndex + 1, closeIndex)
      .trim();

    return result;
  }

  result.eupmyeondong = parts[2] ?? "";

  return result;
};

const hasSidoText = (keyword) => {
  return (
    keyword.startsWith("서울") ||
    keyword.startsWith("서울특별시") ||
    keyword.startsWith("부산") ||
    keyword.startsWith("부산광역시") ||
    keyword.startsWith("대구") ||
    keyword.startsWith("대구광역시") ||
    keyword.startsWith("인천") ||
    keyword.startsWith("인천광역시") ||
    keyword.startsWith("광주") ||
    keyword.startsWith("광주광역시") ||
    keyword.startsWith("대전") ||
    keyword.startsWith("대전광역시") ||
    keyword.startsWith("울산") ||
    keyword.startsWith("울산광역시") ||
    keyword.startsWith("세종") ||
    keyword.startsWith("세종특별자치시") ||
    keyword.startsWith("경기") ||
    keyword.startsWith("경기도") ||
    keyword.startsWith("강원") ||
    keyword.startsWith("강원특별자치도") ||
    keyword.startsWith("충북") ||
    keyword.startsWith("충청북도") ||
    keyword.startsWith("충남") ||
    keyword.startsWith("충청남도") ||
    keyword.startsWith("전북") ||
    keyword.startsWith("전라북도") ||
    keyword.startsWith("전남") ||
    keyword.startsWith("전라남도") ||
    keyword.startsWith("경북") ||
    keyword.startsWith("경상북도") ||
    keyword.startsWith("경남") ||
    keyword.startsWith("경상남도") ||
    keyword.startsWith("제주") ||
    keyword.startsWith("제주특별자치도")
  );
};

const isSeoulWideKeyword = (keyword) => {
  const normalizedKeyword = normalizeText(keyword);

  return (
    normalizedKeyword === "서울" ||
    normalizedKeyword === "서울시" ||
    normalizedKeyword === "서울특별시"
  );
};

const isNumberOnly = (keyword) => {
  return /^\d+$/.test(normalizeText(keyword));
};

const createSearchKeywordList = (keyword) => {
  const trimmedKeyword = normalizeText(keyword);

  if (!trimmedKeyword) {
    return [];
  }

  const keywordList = [trimmedKeyword];

  if (isSeoulWideKeyword(trimmedKeyword)) {
    SEOUL_GU_LIST.forEach((gu) => {
      keywordList.push(`서울특별시 ${gu}`);
    });

    keywordList.push("서울특별시 구청");
    keywordList.push("서울특별시 주민센터");
    keywordList.push("서울특별시 행정복지센터");

    return [...new Set(keywordList)];
  }

  const hasSido = hasSidoText(trimmedKeyword);

  const hasSigungu =
    trimmedKeyword.includes("구 ") ||
    trimmedKeyword.includes("군 ") ||
    trimmedKeyword.includes("시 ") ||
    trimmedKeyword.endsWith("구") ||
    trimmedKeyword.endsWith("군") ||
    trimmedKeyword.endsWith("시");

  if (!hasSido && hasSigungu) {
    keywordList.push(`서울특별시 ${trimmedKeyword}`);
  }

  if (!hasSido && !hasSigungu) {
    keywordList.push(`서울특별시 ${trimmedKeyword}`);
    keywordList.push(`강남구 ${trimmedKeyword}`);
    keywordList.push(`서울특별시 강남구 ${trimmedKeyword}`);
  }

  if (isNumberOnly(trimmedKeyword)) {
    keywordList.push(`봉은사로 ${trimmedKeyword}`);
    keywordList.push(`강남구 봉은사로 ${trimmedKeyword}`);
    keywordList.push(`서울특별시 강남구 봉은사로 ${trimmedKeyword}`);
  }

  return [...new Set(keywordList)];
};

const searchKakaoAddress = (geocoder, kakao, keyword) => {
  return new Promise((resolve) => {
    geocoder.addressSearch(
      keyword,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(data);
        } else {
          resolve([]);
        }
      },
      {
        size: 10,
        analyze_type: kakao.maps.services.AnalyzeType.SIMILAR,
      }
    );
  });
};

const searchKakaoPlaces = (places, kakao, keyword) => {
  return new Promise((resolve) => {
    places.keywordSearch(
      keyword,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(data);
        } else {
          resolve([]);
        }
      },
      {
        size: 15,
      }
    );
  });
};

const convertAddressResult = (item, index) => {
  const roadAddress = item.road_address?.address_name ?? "";
  const jibunAddress = item.address?.address_name ?? "";
  const mainAddress = roadAddress || jibunAddress || item.address_name || "";

  const parsedRegion = parseRegionFromAddress(mainAddress);

  const sidoValue =
    item.road_address?.region_1depth_name ||
    item.address?.region_1depth_name ||
    parsedRegion.sido;

  const sigunguValue =
    item.road_address?.region_2depth_name ||
    item.address?.region_2depth_name ||
    parsedRegion.sigungu;

  const eupmyeondongValue =
    item.road_address?.region_3depth_name ||
    item.address?.region_3depth_name ||
    parsedRegion.eupmyeondong;

  return {
    id: `address-${item.x}-${item.y}-${index}`,
    title: mainAddress,
    address: mainAddress,
    roadAddress,
    jibunAddress,
    zonecode: item.road_address?.zone_no ?? "",
    latitude: Number(item.y),
    longitude: Number(item.x),
    sido: sidoValue,
    sigungu: sigunguValue,
    eupmyeondong: eupmyeondongValue,
  };
};

const convertPlaceResult = (item, index) => {
  const roadAddress = item.road_address_name ?? "";
  const jibunAddress = item.address_name ?? "";
  const mainAddress = roadAddress || jibunAddress || item.place_name || "";

  const parsedRegion = parseRegionFromAddress(mainAddress);

  return {
    id: `place-${item.id ?? `${item.x}-${item.y}-${index}`}`,
    title: item.place_name || mainAddress,
    address: mainAddress,
    roadAddress,
    jibunAddress,
    zonecode: "",
    latitude: Number(item.y),
    longitude: Number(item.x),
    sido: parsedRegion.sido,
    sigungu: parsedRegion.sigungu,
    eupmyeondong: parsedRegion.eupmyeondong,
  };
};

const addUniqueLocation = (resultMap, location) => {
  if (!location.address || !location.latitude || !location.longitude) {
    return;
  }

  const key = `${location.address}_${location.latitude}_${location.longitude}`;

  if (!resultMap.has(key)) {
    resultMap.set(key, location);
  }
};

const searchKakaoLocationList = async (kakao, keyword) => {
  const geocoder = new kakao.maps.services.Geocoder();
  const places = new kakao.maps.services.Places();

  const keywordList = createSearchKeywordList(keyword);

  // OpenLayers의 Map import와 충돌하지 않도록 브라우저 기본 Map 사용
  const resultMap = new globalThis.Map();

  for (const searchKeyword of keywordList) {
    const [addressResultList, placeResultList] = await Promise.all([
      searchKakaoAddress(geocoder, kakao, searchKeyword),
      searchKakaoPlaces(places, kakao, searchKeyword),
    ]);

    addressResultList
      .map((item, index) => convertAddressResult(item, index))
      .forEach((location) => addUniqueLocation(resultMap, location));

    placeResultList
      .map((item, index) => convertPlaceResult(item, index))
      .forEach((location) => addUniqueLocation(resultMap, location));

    if (resultMap.size >= MAX_LOCATION_RESULT_COUNT) {
      break;
    }
  }

  return Array.from(resultMap.values()).slice(0, MAX_LOCATION_RESULT_COUNT);
};

function GisReportEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerSourceRef = useRef(null);
  const markerStyleRef = useRef(null);

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
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [eupmyeondong, setEupmyeondong] = useState("");

  const [report, setReport] = useState(null);
  const [isOwner, setOwner] = useState(false);
  const [isLoading, setLoading] = useState(false);
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
        setLocationKeyword(detail.address ?? "");

        setLatitude(String(detail.latitude ?? ""));
        setLongitude(String(detail.longitude ?? ""));

        setSido(detail.sido ?? "");
        setSigungu(detail.sigungu ?? "");
        setEupmyeondong(detail.eupmyeondong ?? "");
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
    if (!postId) return;

    getGisReportDetail();
  }, [postId]);

  useEffect(() => {
    if (!mapRef.current || !report) return;

    const defaultLongitude = Number(report.longitude || DEFAULT_LONGITUDE);
    const defaultLatitude = Number(report.latitude || DEFAULT_LATITUDE);

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
            url: OSM_BASE_MAP_URL,
            attributions: OSM_ATTRIBUTION,
            crossOrigin: "anonymous",
          }),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([defaultLongitude, defaultLatitude]),
        zoom: 15,
      }),
    });

    mapInstanceRef.current = map;
    markerSourceRef.current = markerSource;
    markerStyleRef.current = markerStyle;

    addMarker(defaultLongitude, defaultLatitude);

    const handleMapClick = (event) => {
      const [lon, lat] = toLonLat(event.coordinate);

      setLongitude(lon.toFixed(7));
      setLatitude(lat.toFixed(7));
      setSelectedLocation(null);

      moveMarker(lon, lat, false);
    };

    map.on("singleclick", handleMapClick);

    requestAnimationFrame(() => {
      map.updateSize();
    });

    setTimeout(() => {
      map.updateSize();
    }, 300);

    return () => {
      map.un("singleclick", handleMapClick);
      map.setTarget(null);
      mapInstanceRef.current = null;
      markerSourceRef.current = null;
      markerStyleRef.current = null;
    };
  }, [report]);

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

      const kakao = await loadKakaoMapScript();
      const resultList = await searchKakaoLocationList(kakao, locationKeyword);

      setLocationResultList(resultList);
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
    setLocationKeyword(location.address ?? "");

    setLatitude(String(location.latitude ?? ""));
    setLongitude(String(location.longitude ?? ""));

    setSido(location.sido ?? "");
    setSigungu(location.sigungu ?? "");
    setEupmyeondong(location.eupmyeondong ?? "");

    moveMarker(location.longitude, location.latitude, true);
  };

  const getAddressParts = () => {
    const parsedRegion = parseRegionFromAddress(address);

    return {
      sido: sido || parsedRegion.sido,
      sigungu: sigungu || parsedRegion.sigungu,
      eupmyeondong: eupmyeondong || parsedRegion.eupmyeondong,
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
      alert("주소 검색 결과를 선택해주세요.");
      return;
    }

    if (!latitude || !longitude) {
      alert("위치 좌표를 선택해주세요.");
      return;
    }

    const addressParts = getAddressParts();

    const requestData = {
      title,
      content,
      visibilityStatus: report?.visibilityStatus ?? "PUBLIC",

      reportCategoryCode,
      errorTypeCode,
      targetDataName: selectedLocation?.title ?? report?.targetDataName ?? "",

      address,
      detailAddress: address,

      latitude: Number(latitude),
      longitude: Number(longitude),

      sido: addressParts.sido,
      sigungu: addressParts.sigungu,
      eupmyeondong: addressParts.eupmyeondong,
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
      <div className="container-fluid px-4 py-3 gis-report-write-page">
        <section className="gis-report-write-header">
          <h1>GIS 오류제보 수정 정보를 불러오는 중입니다.</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3 gis-report-write-page">
      <section className="gis-report-write-header">
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

        <section className="gis-report-location-info">
          <h2>위치 정보</h2>

          <div className="gis-report-form-row">
            <label>주소 검색</label>

            <div className="gis-report-address-search-row">
              <input
                type="text"
                placeholder="예: 서울특별시, 강남구, 삼성동, 봉은사로 531, 531"
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
            주소를 다시 검색하거나, 실제 오류 위치가 다르면 지도를 클릭해
            좌표를 조정할 수 있습니다. 넓은 지역명만 입력하면 대표 검색 결과만
            표시됩니다.
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
                    key={location.id ?? `${location.address}-${index}`}
                    className={
                      isSelected
                        ? "location-result-item selected"
                        : "location-result-item"
                    }
                    onClick={() => handleSelectLocation(location)}
                  >
                    <strong>{location.title || location.address}</strong>

                    {location.roadAddress && <span>{location.roadAddress}</span>}

                    {location.jibunAddress && (
                      <em>
                        {location.jibunAddress}
                        {location.zonecode
                          ? ` / 우편번호 ${location.zonecode}`
                          : ""}
                      </em>
                    )}

                    {!location.roadAddress && !location.jibunAddress && (
                      <em>
                        {location.sido} {location.sigungu}{" "}
                        {location.eupmyeondong}
                      </em>
                    )}
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

          <div ref={mapRef} className="gis-report-write-map"></div>

          <p className="map-help-text">
            검색 결과를 선택하면 지도에 마커가 표시됩니다. 실제 오류 위치가
            다르면 지도를 클릭해 좌표를 조정할 수 있습니다.
          </p>
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