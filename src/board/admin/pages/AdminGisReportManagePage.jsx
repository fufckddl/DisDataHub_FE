import { useState } from "react";
import { Link } from "react-router-dom";

import {
  adminGisReportMockList,
  adminGisErrorTypeMockList,
  adminGisProcessStatusMockList,
  adminGisRegionMockList,
  adminGisReportPaginationMock,
  adminGisReportSummaryMock,
} from "../../mock/adminGisReportMockData";

import "../css/AdminGisReportManagePage.css";

function AdminGisReportManagePage() {
  const [searchWord, setSearchWord] = useState("");
  const [errorTypeCode, setErrorTypeCode] = useState("");
  const [processStatusCode, setProcessStatusCode] = useState("");
  const [regionCode, setRegionCode] = useState("");

  const filteredReportList = adminGisReportMockList.filter((report) => {
    const matchSearch = report.title.includes(searchWord);

    const matchErrorType =
      errorTypeCode === "" || report.errorTypeCode === errorTypeCode;

    const matchStatus =
      processStatusCode === "" ||
      report.processStatusCode === processStatusCode;

    const matchRegion =
      regionCode === "" ||
      report.address.includes(
        adminGisRegionMockList.find((region) => region.code === regionCode)
          ?.name || ""
      );

    return matchSearch && matchErrorType && matchStatus && matchRegion;
  });

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

  const handleReset = () => {
    setSearchWord("");
    setErrorTypeCode("");
    setProcessStatusCode("");
    setRegionCode("");
  };

  return (
    <div className="admin-gis-report-manage-page">
      <section className="admin-gis-report-header">
        <div>
          <h1>GIS 오류 제보 관리</h1>
          <p>제보 현황을 확인하고 처리 상태를 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-gis-summary-section">
        <div className="admin-gis-summary-card">
          <div className="summary-icon">💬</div>
          <div>
            <p>전체 제보</p>
            <strong>{adminGisReportSummaryMock.totalCount}건</strong>
            <span>전체 제보 건수</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">✓</div>
          <div>
            <p>제보완료</p>
            <strong>{adminGisReportSummaryMock.receivedCount}건</strong>
            <span>제보 접수 완료</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">🔎</div>
          <div>
            <p>검토중</p>
            <strong>{adminGisReportSummaryMock.reviewingCount}건</strong>
            <span>내용 검토 중</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">⚙</div>
          <div>
            <p>조치중</p>
            <strong>{adminGisReportSummaryMock.actioningCount}건</strong>
            <span>수정·반영 진행 중</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">⚑</div>
          <div>
            <p>처리완료</p>
            <strong>{adminGisReportSummaryMock.completedCount}건</strong>
            <span>조치 완료</span>
          </div>
        </div>
      </section>

      <section className="admin-gis-filter-section">
        <div className="filter-item search-item">
          <label>제목 검색</label>

          <input
            type="text"
            placeholder="제목을 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>오류 유형</label>

          <select
            value={errorTypeCode}
            onChange={(e) => setErrorTypeCode(e.target.value)}
          >
            {adminGisErrorTypeMockList.map((errorType) => (
              <option key={errorType.code} value={errorType.code}>
                {errorType.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>처리 상태</label>

          <select
            value={processStatusCode}
            onChange={(e) => setProcessStatusCode(e.target.value)}
          >
            {adminGisProcessStatusMockList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>행정구역</label>

          <select
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
          >
            {adminGisRegionMockList.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="gis-search-button">
          🔍 검색
        </button>

        <button
          type="button"
          className="gis-reset-button"
          onClick={handleReset}
        >
          ⟳ 초기화
        </button>
      </section>

      <section className="admin-gis-table-section">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>오류 유형</th>
              <th>대상 데이터명</th>
              <th>주소</th>
              <th>처리 상태</th>
              <th>작성일</th>
              <th>상세</th>
            </tr>
          </thead>

          <tbody>
            {filteredReportList.map((report) => (
              <tr key={report.postId}>
                <td>{report.postId}</td>

                <td className="gis-title-cell">{report.title}</td>

                <td>
                  <span
                    className={`gis-error-type-badge ${getErrorTypeClassName(
                      report.errorTypeCode
                    )}`}
                  >
                    {report.errorTypeName}
                  </span>
                </td>

                <td>{report.targetDataName}</td>

                <td className="gis-address-cell">{report.address}</td>

                <td>
                  <span
                    className={`gis-status-badge ${getStatusClassName(
                      report.processStatusCode
                    )}`}
                  >
                    {report.processStatusName}
                  </span>
                </td>

                <td>{report.createdAt}</td>

                <td>
                  <Link
                    to={`/admin/board/gis-report/${report.postId}`}
                    className="gis-detail-button"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReportList.length === 0 && (
          <div className="admin-gis-empty-message">검색 결과가 없습니다.</div>
        )}

        <div className="admin-gis-pagination">
          <button type="button">«</button>
          <button type="button">‹</button>

          {adminGisReportPaginationMock.pageList.map((page) => (
            <button
              type="button"
              key={page}
              className={
                page === adminGisReportPaginationMock.currentPage
                  ? "active"
                  : ""
              }
            >
              {page}
            </button>
          ))}

          <span>...</span>
          <button type="button">{adminGisReportPaginationMock.totalPage}</button>
          <button type="button">›</button>
          <button type="button">»</button>

          <select className="gis-page-size-select">
            <option>10개씩 보기</option>
            <option>20개씩 보기</option>
            <option>50개씩 보기</option>
          </select>
        </div>
      </section>
    </div>
  );
}

export default AdminGisReportManagePage;