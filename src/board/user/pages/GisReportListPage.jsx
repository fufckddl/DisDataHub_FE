import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

import { VWORLD_BASE_MAP_URL } from "../../config/vworldConfig";
import { getGisReportListApi } from "../../api/gisReportApi";
import "../css/GisReportListPage.css";

function GisReportListPage() {
  const mapRef = useRef(null);

  const [gisReportList, setGisReportList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [isLoading, setLoading] = useState(false);

  const gisProcessStatusList = [
    { code: "", name: "전체 상태" },
    { code: "RECEIVED", name: "제보완료" },
    { code: "REVIEWING", name: "검토중" },
    { code: "PROCESSING", name: "조치중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const gisReportCategoryList = [
    { code: "", name: "전체 유형" },
    { code: "DATA_ERROR", name: "데이터 오류" },
    { code: "LOCATION_ERROR", name: "위치 오류" },
    { code: "ATTRIBUTE_ERROR", name: "속성 오류" },
    { code: "ETC", name: "기타" },
  ];

  const regionList = [
    { code: "", name: "전체 지역" },
    { code: "SEOUL", name: "서울" },
    { code: "BUSAN", name: "부산" },
    { code: "DAEGU", name: "대구" },
    { code: "INCHEON", name: "인천" },
    { code: "GWANGJU", name: "광주" },
    { code: "DAEJEON", name: "대전" },
    { code: "ULSAN", name: "울산" },
    { code: "ETC", name: "기타" },
  ];

  const getGisReportList = async () => {
    try {
      setLoading(true);

      const data = await getGisReportListApi();

      if (data.result === "success") {
        setGisReportList(data.gisReportList ?? []);
      }
    } catch (error) {
      console.error("GIS 오류제보 목록 조회 실패:", error);
      alert("GIS 오류제보 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGisReportList();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: VWORLD_BASE_MAP_URL,
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([127.0276, 37.4979]),
        zoom: 12,
      }),
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  const filteredGisReportList = gisReportList.filter((report) => {
    const title = report.title ?? "";
    const targetDataName = report.targetDataName ?? "";
    const address = report.address ?? "";
    const sido = report.sido ?? "";

    const matchSearch =
      title.toLowerCase().includes(searchWord.toLowerCase()) ||
      targetDataName.toLowerCase().includes(searchWord.toLowerCase()) ||
      address.toLowerCase().includes(searchWord.toLowerCase());

    const matchCategory =
      categoryCode === "" || report.reportCategoryCode === categoryCode;

    const matchStatus =
      statusCode === "" || report.processStatusCode === statusCode;

    const matchRegion =
      regionCode === "" ||
      sido.toLowerCase().includes(regionCode.toLowerCase());

    return matchSearch && matchCategory && matchStatus && matchRegion;
  });

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "REVIEWING") return "status-checking";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "PROCESSING") return "status-checking";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "REVIEWING") return "검토중";
    if (statusCode === "CHECKING") return "검토중";
    if (statusCode === "PROCESSING") return "조치중";
    if (statusCode === "COMPLETED") return "처리완료";
    return statusCode ?? "-";
  };

  const getReportCategoryName = (categoryCode) => {
    if (categoryCode === "DATA_ERROR") return "데이터 오류";
    if (categoryCode === "LOCATION_ERROR") return "위치 오류";
    if (categoryCode === "ATTRIBUTE_ERROR") return "속성 오류";
    if (categoryCode === "ETC") return "기타";
    return categoryCode ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  return (
    <div className="gis-report-page">
      <section className="gis-report-header">
        <div className="gis-report-header-icon">💬</div>
        <h1>GIS 데이터 오류 제보 게시판</h1>
      </section>

      <section className="gis-report-filter-section">
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <select
          value={categoryCode}
          onChange={(e) => setCategoryCode(e.target.value)}
        >
          {gisReportCategoryList.map((category) => (
            <option key={category.code} value={category.code}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusCode}
          onChange={(e) => setStatusCode(e.target.value)}
        >
          {gisProcessStatusList.map((status) => (
            <option key={status.code} value={status.code}>
              {status.name}
            </option>
          ))}
        </select>

        <select
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
        >
          {regionList.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>

        <button type="button" onClick={getGisReportList}>
          🔍 새로고침
        </button>

        <button type="button" className="radius-search-button">
          반경 검색
        </button>

        <Link to="/board/gis-report/write" className="write-button">
          ✎ 글쓰기
        </Link>
      </section>

      <section className="gis-report-content-layout">
        <section className="gis-report-list-section">
          <div className="gis-report-list-header">
            <h2>제보 목록</h2>
          </div>

          <div className="gis-report-list">
            {filteredGisReportList.map((report) => (
              <Link
                to={`/board/gis-report/${report.postId}`}
                className="gis-report-list-item"
                key={report.postId}
              >
                <div className="report-status-area">
                  <span
                    className={`report-status-badge ${getStatusClassName(
                      report.processStatusCode
                    )}`}
                  >
                    {getProcessStatusName(report.processStatusCode)}
                  </span>
                </div>

                <div className="report-content-area">
                  <h3>{report.title}</h3>

                  <p>
                    {getReportCategoryName(report.reportCategoryCode)}
                    <span>/</span>
                    {report.address || "주소 정보 없음"}
                  </p>

                  <p>
                    대상 데이터: {report.targetDataName || "-"}
                  </p>

                  <p>작성일: {formatDate(report.createdAt)}</p>
                </div>

                <div className="report-arrow">›</div>
              </Link>
            ))}

            {isLoading && (
              <div className="gis-report-empty-message">
                GIS 오류제보 목록을 불러오는 중입니다.
              </div>
            )}

            {!isLoading && filteredGisReportList.length === 0 && (
              <div className="gis-report-empty-message">
                등록된 GIS 오류제보가 없습니다.
              </div>
            )}
          </div>

          <div className="gis-report-pagination">
            <button type="button">‹</button>
            <button type="button" className="active">
              1
            </button>
            <button type="button">›</button>
          </div>
        </section>

        <section className="gis-report-map-section">
          <div className="gis-report-map-header">
            <h2>지도 영역</h2>
          </div>

          <div ref={mapRef} className="vworld-map"></div>
        </section>
      </section>
    </div>
  );
}

export default GisReportListPage;