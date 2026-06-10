import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminGisReportListApi } from "../../api/gisReportApi";
import "../css/AdminGisReportManagePage.css";

function AdminGisReportManagePage() {
  const navigate = useNavigate();

  const [gisReportList, setGisReportList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [errorTypeCode, setErrorTypeCode] = useState("");
  const [processStatusCode, setProcessStatusCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [isDeletedVisible, setDeletedVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const adminGisErrorTypeList = [
    { code: "", name: "오류 유형 전체" },
    { code: "COORDINATE_ERROR", name: "좌표 오류" },
    { code: "NAME_ERROR", name: "명칭 오류" },
    { code: "VALUE_ERROR", name: "속성값 오류" },
  ];

  const adminGisProcessStatusList = [
    { code: "", name: "처리 상태 전체" },
    { code: "RECEIVED", name: "제보완료" },
    { code: "PROCESSING", name: "처리중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const adminGisRegionList = [
    { code: "", name: "행정구역 전체" },
    { code: "강남구", name: "강남구" },
    { code: "강동구", name: "강동구" },
    { code: "강북구", name: "강북구" },
    { code: "강서구", name: "강서구" },
    { code: "관악구", name: "관악구" },
    { code: "광진구", name: "광진구" },
    { code: "구로구", name: "구로구" },
    { code: "금천구", name: "금천구" },
    { code: "노원구", name: "노원구" },
    { code: "도봉구", name: "도봉구" },
    { code: "동대문구", name: "동대문구" },
    { code: "동작구", name: "동작구" },
    { code: "마포구", name: "마포구" },
    { code: "서대문구", name: "서대문구" },
    { code: "서초구", name: "서초구" },
    { code: "성동구", name: "성동구" },
    { code: "성북구", name: "성북구" },
    { code: "송파구", name: "송파구" },
    { code: "양천구", name: "양천구" },
    { code: "영등포구", name: "영등포구" },
    { code: "용산구", name: "용산구" },
    { code: "은평구", name: "은평구" },
    { code: "종로구", name: "종로구" },
    { code: "중구", name: "중구" },
    { code: "중랑구", name: "중랑구" },
  ];

  const getAdminGisReportList = async () => {
    try {
      setLoading(true);

      const data = await getAdminGisReportListApi();

      if (data.result === "success") {
        setGisReportList(data.adminGisReportList ?? data.gisReportList ?? []);
      }
    } catch (error) {
      console.error("관리자 GIS 오류제보 목록 조회 실패:", error);
      alert("GIS 오류제보 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminGisReportList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchWord,
    errorTypeCode,
    processStatusCode,
    regionCode,
    isDeletedVisible,
  ]);

  const filteredReportList = useMemo(() => {
    return gisReportList.filter((report) => {
      const title = report.title ?? "";
      const address = report.address ?? "";
      const writerName = report.writerName ?? "";
      const userId = String(report.userId ?? "");
      const sigungu = report.sigungu ?? "";

      const matchSearch =
        title.toLowerCase().includes(searchWord.toLowerCase()) ||
        address.toLowerCase().includes(searchWord.toLowerCase()) ||
        writerName.toLowerCase().includes(searchWord.toLowerCase()) ||
        userId.includes(searchWord);

      const matchErrorType =
        errorTypeCode === "" || report.errorTypeCode === errorTypeCode;

      const matchStatus =
        processStatusCode === "" ||
        report.processStatusCode === processStatusCode ||
        (processStatusCode === "PROCESSING" &&
          report.processStatusCode === "REVIEWING");

      const matchRegion =
        regionCode === "" ||
        sigungu.includes(regionCode) ||
        address.includes(regionCode);

      const matchDeletedVisible =
        isDeletedVisible || report.deletedYn !== "Y";

      return (
        matchSearch &&
        matchErrorType &&
        matchStatus &&
        matchRegion &&
        matchDeletedVisible
      );
    });
  }, [
    gisReportList,
    searchWord,
    errorTypeCode,
    processStatusCode,
    regionCode,
    isDeletedVisible,
  ]);

  const totalPage = Math.max(
    1,
    Math.ceil(filteredReportList.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const pagedReportList = filteredReportList.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageNumbers = Array.from({ length: totalPage }, (_, index) => index + 1);

  useEffect(() => {
    if (currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [currentPage, totalPage]);

  const totalCount = gisReportList.length;

  const receivedCount = gisReportList.filter(
    (report) => report.processStatusCode === "RECEIVED"
  ).length;

  const processingCount = gisReportList.filter(
    (report) =>
      report.processStatusCode === "PROCESSING" ||
      report.processStatusCode === "REVIEWING"
  ).length;

  const completedCount = gisReportList.filter(
    (report) => report.processStatusCode === "COMPLETED"
  ).length;

  const deletedCount = gisReportList.filter(
    (report) => report.deletedYn === "Y"
  ).length;

  const getErrorTypeClassName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "error-coordinate";
    if (errorTypeCode === "NAME_ERROR") return "error-name";
    if (errorTypeCode === "VALUE_ERROR") return "error-value";
    return "error-etc";
  };

  const getErrorTypeName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "좌표 오류";
    if (errorTypeCode === "NAME_ERROR") return "명칭 오류";
    if (errorTypeCode === "VALUE_ERROR") return "속성값 오류";
    return errorTypeCode ?? "-";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "PROCESSING" || statusCode === "REVIEWING") {
      return "status-processing";
    }
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "PROCESSING" || statusCode === "REVIEWING") {
      return "처리중";
    }
    if (statusCode === "COMPLETED") return "처리완료";
    return statusCode ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleReset = () => {
    setSearchWord("");
    setErrorTypeCode("");
    setProcessStatusCode("");
    setRegionCode("");
    setDeletedVisible(false);
    setCurrentPage(1);
  };

  const handleMoveDetail = (postId) => {
    navigate(`/admin/board/gis-report/${postId}`);
  };

  return (
    <div className="container-fluid px-4 py-3 admin-gis-report-manage-page">
      <section className="admin-gis-report-header">
        <div>
          <h1>GIS 오류 제보 관리</h1>
          <p>제보 현황을 확인하고 처리 상태를 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-gis-summary-section">
        <div className="admin-gis-summary-card">
          <p>전체 제보</p>
          <strong>{totalCount}건</strong>
          <span>전체 제보 건수</span>
        </div>

        <div className="admin-gis-summary-card">
          <p>제보완료</p>
          <strong>{receivedCount}건</strong>
          <span>제보 접수 완료</span>
        </div>

        <div className="admin-gis-summary-card">
          <p>처리중</p>
          <strong>{processingCount}건</strong>
          <span>수정·반영 진행 중</span>
        </div>

        <div className="admin-gis-summary-card">
          <p>처리완료</p>
          <strong>{completedCount}건</strong>
          <span>조치 완료</span>
        </div>

        <div className="admin-gis-summary-card">
          <p>삭제됨</p>
          <strong>{deletedCount}건</strong>
          <span>삭제 처리된 제보</span>
        </div>
      </section>

      <section className="admin-gis-board-section">
        <div className="admin-gis-filter-section">
          <input
            className="admin-gis-search-input"
            type="text"
            placeholder="제목, 작성자, 주소를 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />

          <select
            className="admin-gis-filter-select"
            value={errorTypeCode}
            onChange={(e) => setErrorTypeCode(e.target.value)}
          >
            {adminGisErrorTypeList.map((errorType) => (
              <option key={errorType.code} value={errorType.code}>
                {errorType.name}
              </option>
            ))}
          </select>

          <select
            className="admin-gis-filter-select"
            value={processStatusCode}
            onChange={(e) => setProcessStatusCode(e.target.value)}
          >
            {adminGisProcessStatusList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>

          <select
            className="admin-gis-filter-select"
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
          >
            {adminGisRegionList.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="admin-gis-reset-button"
            onClick={handleReset}
          >
            초기화
          </button>
        </div>

        <div className="admin-gis-table-header">
          <div className="admin-gis-table-title-area">
            <h2>GIS 오류 제보 목록</h2>
            <span>
              검색 결과 {filteredReportList.length}건 / 전체 {totalCount}건
            </span>
          </div>

          <button
            type="button"
            className={`admin-gis-deleted-toggle ${
              isDeletedVisible ? "on" : ""
            }`}
            onClick={() => setDeletedVisible((prev) => !prev)}
          >
            <span className="admin-gis-deleted-toggle-label">
              {isDeletedVisible
                ? "삭제된 게시글 숨기기"
                : "삭제된 게시글 보기"}
            </span>

            <span className="admin-gis-deleted-toggle-track">
              <span className="admin-gis-deleted-toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div className="admin-gis-table-wrap">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>오류 유형</th>
                <th>작성자</th>
                <th>주소</th>
                <th>처리 상태</th>
                <th>삭제여부</th>
                <th>작성일</th>
                <th>상세</th>
              </tr>
            </thead>

            <tbody>
              {pagedReportList.map((report) => (
                <tr
                  key={report.postId}
                  className={
                    report.deletedYn === "Y"
                      ? "admin-gis-clickable-row admin-gis-deleted-row"
                      : "admin-gis-clickable-row"
                  }
                  onClick={() => handleMoveDetail(report.postId)}
                >
                  <td>{report.postId}</td>

                  <td className="admin-gis-title-cell">
                    <span className="admin-gis-title-text">
                      {report.title || "제목 없음"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-gis-error-type-badge ${getErrorTypeClassName(
                        report.errorTypeCode
                      )}`}
                    >
                      {getErrorTypeName(report.errorTypeCode)}
                    </span>
                  </td>

                  <td>{report.writerName || `사용자 ${report.userId ?? "-"}`}</td>

                  <td className="admin-gis-address-cell">
                    {report.address || "-"}
                  </td>

                  <td>
                    <span
                      className={`admin-gis-list-status-badge ${getStatusClassName(
                        report.processStatusCode
                      )}`}
                    >
                      {getProcessStatusName(report.processStatusCode)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        report.deletedYn === "Y"
                          ? "admin-gis-delete-status deleted"
                          : "admin-gis-delete-status normal"
                      }
                    >
                      {report.deletedYn === "Y" ? "삭제됨" : "정상"}
                    </span>
                  </td>

                  <td>{formatDate(report.createdAt)}</td>

                  <td>
                    <button
                      type="button"
                      className="admin-gis-detail-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDetail(report.postId);
                      }}
                    >
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="admin-gis-empty-message">
            GIS 오류제보 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredReportList.length === 0 && (
          <div className="admin-gis-empty-message">검색 결과가 없습니다.</div>
        )}

        {!isLoading && filteredReportList.length > 0 && (
          <div className="admin-gis-list-bottom">
            <div className="admin-gis-pagination">
              <button
                type="button"
                className="admin-gis-pagination-arrow-button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={currentPage === pageNumber ? "active" : ""}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="admin-gis-pagination-arrow-button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPage))
                }
                disabled={currentPage === totalPage}
              >
                &gt;
              </button>
            </div>

            <div className="admin-gis-page-info">
              {currentPage} / {totalPage}페이지
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminGisReportManagePage;