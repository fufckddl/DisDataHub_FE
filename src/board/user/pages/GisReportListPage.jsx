import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

import { VWORLD_BASE_MAP_URL } from "../../config/vworldConfig";
import "../css/GisReportListPage.css";

import {
  gisProcessStatusMockList,
  gisReportMockList,
  gisReportPaginationMock,
} from "../../mock/gisReportListPage";

function GisReportListPage() {
    const mapRef = useRef(null);

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

    const getStatusClassName = (statusCode) => {
        if (statusCode === "RECEIVED") return "status-received";
        if (statusCode === "CHECKING") return "status-checking";
        if (statusCode === "COMPLETED") return "status-completed";
        return "";
    };

    const getMarkerClassName = (statusCode) => {
        if (statusCode === "RECEIVED") return "marker-received";
        if (statusCode === "CHECKING") return "marker-checking";
        if (statusCode === "COMPLETED") return "marker-completed";
        return "";
    };

    return (
        <div className="gis-report-page">
            {/* 상단 제목 섹션 */}
            <section className="gis-report-header">
                <div className="gis-report-header-icon">💬</div>
                <h1>GIS 데이터 오류 제보 게시판</h1>
            </section>

            {/* 검색 / 필터 섹션 */}
            <section className="gis-report-filter-section">
                <input type="text" placeholder="검색어 입력" />

                <select>
                    {gisProcessStatusMockList.map((category) => (
                        <option key={category.code} value={category.code}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select>
                    {gisProcessStatusMockList.map((status) => (
                        <option key={status.code} value={status.code}>
                            {status.name}
                        </option>
                    ))}
                </select>

                <select>
                    {gisProcessStatusMockList.map((region) => (
                        <option key={region.code} value={region.code}>
                            {region.name}
                        </option>
                    ))}
                </select>

                <button type="button">🔍 검색</button>

                <button type="button" className="radius-search-button">
                    반경 검색
                </button>

                <Link to="/board/gis-report/write" className="write-button">
                    ✎ 글쓰기
                </Link>
            </section>

            {/* 본문 레이아웃 섹션 */}
            <section className="gis-report-content-layout">
                {/* 왼쪽 제보 목록 섹션 */}
                <section className="gis-report-list-section">
                    <div className="gis-report-list-header">
                        <h2>제보 목록</h2>
                    </div>

                    <div className="gis-report-list">
                        {gisReportMockList.map((report) => (
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
                                        {report.processStatusName}
                                    </span>
                                </div>

                                <div className="report-content-area">
                                    <h3>{report.title}</h3>

                                    <p>
                                        {report.reportCategoryName}
                                        <span>/</span>
                                        {report.address}
                                    </p>

                                    <p>작성일: {report.createdAt}</p>
                                </div>

                                <div className="report-arrow">›</div>
                            </Link>
                        ))}
                    </div>

                    <div className="gis-report-pagination">
                        <button type="button">‹</button>

                        {gisReportPaginationMock.pageList.map((page) => (
                            <button
                                type="button"
                                key={page}
                                className={
                                    page === gisReportPaginationMock.currentPage ? "active" : ""
                                }
                            >
                                {page}
                            </button>
                        ))}

                        <button type="button">›</button>
                    </div>
                </section>

                {/* 오른쪽 지도 영역 섹션 */}
                <section className="gis-report-map-section">
                    <div className="gis-report-map-header">
                        <h2>지도 영역</h2>
                    </div>

                    <div ref={mapRef} className="vworld-map"></div>
                </section>
            
            </section>
        </div>
    )

}
export default GisReportListPage;