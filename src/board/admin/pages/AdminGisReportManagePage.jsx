import { useEffect, useState } from "react";
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
  const [isLoading, setLoading] = useState(false);

  const adminGisErrorTypeList = [
    { code: "", name: "전체" },
    { code: "COORDINATE_ERROR", name: "좌표 오류" },
    { code: "NAME_ERROR", name: "명칭 오류" },
    { code: "VALUE_ERROR", name: "속성값 오류" },
  ];

  const adminGisProcessStatusList = [
    { code: "", name: "전체" },
    { code: "RECEIVED", name: "제보완료" },
    { code: "REVIEWING", name: "검토중" },
    { code: "PROCESSING", name: "조치중" },
    { code: "COMPLETED", name: "처리완료" },
  ];

  const adminGisRegionList = [
    { code: "", name: "전체" },
    { code: "서울", name: "서울" },
    { code: "부산", name: "부산" },
    { code: "대구", name: "대구" },
    { code: "인천", name: "인천" },
    { code: "광주", name: "광주" },
    { code: "대전", name: "대전" },
    { code: "울산", name: "울산" },
    { code: "기타", name: "기타" },
  ];

  const getAdminGisReportList = async () => {
    try {
      setLoading(true);

      const data = await getAdminGisReportListApi();

      console.log("관리자 GIS 오류제보 목록 응답:", data);

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

  const filteredReportList = gisReportList.filter((report) => {
    const title = report.title ?? "";
    const address = report.address ?? "";
    const writerName = report.writerName ?? "";
    const userId = String(report.userId ?? "");
    const sido = report.sido ?? "";

    const matchSearch =
      title.toLowerCase().includes(searchWord.toLowerCase()) ||
      address.toLowerCase().includes(searchWord.toLowerCase()) ||
      writerName.toLowerCase().includes(searchWord.toLowerCase()) ||
      userId.includes(searchWord);

    const matchErrorType =
      errorTypeCode === "" || report.errorTypeCode === errorTypeCode;

    const matchStatus =
      processStatusCode === "" ||
      report.processStatusCode === processStatusCode;

    const matchRegion = regionCode === "" || sido.includes(regionCode);

    return matchSearch && matchErrorType && matchStatus && matchRegion;
  });

  const totalCount = gisReportList.length;

  const receivedCount = gisReportList.filter(
    (report) => report.processStatusCode === "RECEIVED"
  ).length;

  const reviewingCount = gisReportList.filter(
    (report) => report.processStatusCode === "REVIEWING"
  ).length;

  const processingCount = gisReportList.filter(
    (report) => report.processStatusCode === "PROCESSING"
  ).length;

  const completedCount = gisReportList.filter(
    (report) => report.processStatusCode === "COMPLETED"
  ).length;

  const deletedCount = gisReportList.filter(
    (report) => report.deletedYn === "Y"
  ).length;

  const getErrorTypeClassName = (errorTypeCode) => {
    if (errorTypeCode === "COORDINATE_ERROR") return "error-spatial";
    if (errorTypeCode === "NAME_ERROR") return "error-classify";
    if (errorTypeCode === "VALUE_ERROR") return "error-attribute";
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
    if (statusCode === "REVIEWING") return "status-reviewing";
    if (statusCode === "PROCESSING") return "status-actioning";
    if (statusCode === "COMPLETED") return "status-completed";
    return "";
  };

  const getProcessStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "제보완료";
    if (statusCode === "REVIEWING") return "검토중";
    if (statusCode === "PROCESSING") return "조치중";
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
  };

  const handleMoveDetail = (postId) => {
    navigate(`/admin/board/gis-report/${postId}`);
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
            <strong>{totalCount}건</strong>
            <span>전체 제보 건수</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">✓</div>
          <div>
            <p>제보완료</p>
            <strong>{receivedCount}건</strong>
            <span>제보 접수 완료</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">🔎</div>
          <div>
            <p>검토중</p>
            <strong>{reviewingCount}건</strong>
            <span>내용 검토 중</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">⚙</div>
          <div>
            <p>조치중</p>
            <strong>{processingCount}건</strong>
            <span>수정·반영 진행 중</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">⚑</div>
          <div>
            <p>처리완료</p>
            <strong>{completedCount}건</strong>
            <span>조치 완료</span>
          </div>
        </div>

        <div className="admin-gis-summary-card">
          <div className="summary-icon">🗑</div>
          <div>
            <p>삭제됨</p>
            <strong>{deletedCount}건</strong>
            <span>삭제 처리된 제보</span>
          </div>
        </div>
      </section>

      <section className="admin-gis-filter-section">
        <div className="filter-item search-item">
          <label>검색</label>

          <input
            type="text"
            placeholder="제목, 작성자, 주소를 입력하세요."
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
            {adminGisErrorTypeList.map((errorType) => (
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
            {adminGisProcessStatusList.map((status) => (
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
            {adminGisRegionList.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="gis-search-button"
          onClick={getAdminGisReportList}
        >
          🔍 새로고침
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
              <th>작성자</th>
              <th>주소</th>
              <th>처리 상태</th>
              <th>삭제여부</th>
              <th>작성일</th>
              <th>상세</th>
            </tr>
          </thead>

          <tbody>
            {filteredReportList.map((report) => (
              <tr
                key={report.postId}
                className={
                  report.deletedYn === "Y"
                    ? "admin-gis-clickable-row deleted-row"
                    : "admin-gis-clickable-row"
                }
                onClick={() => handleMoveDetail(report.postId)}
              >
                <td>{report.postId}</td>

                <td className="gis-title-cell">
                  {report.title || "제목 없음"}
                </td>

                <td>
                  <span
                    className={`gis-error-type-badge ${getErrorTypeClassName(
                      report.errorTypeCode
                    )}`}
                  >
                    {getErrorTypeName(report.errorTypeCode)}
                  </span>
                </td>

                <td>{report.writerName || `사용자 ${report.userId ?? "-"}`}</td>

                <td className="gis-address-cell">{report.address || "-"}</td>

                <td>
                  <span
                    className={`gis-status-badge ${getStatusClassName(
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
                        ? "gis-delete-status deleted"
                        : "gis-delete-status normal"
                    }
                  >
                    {report.deletedYn === "Y" ? "삭제됨" : "정상"}
                  </span>
                </td>

                <td>{formatDate(report.createdAt)}</td>

                <td>
                  <button
                    type="button"
                    className="gis-detail-button"
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

        {isLoading && (
          <div className="admin-gis-empty-message">
            GIS 오류제보 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredReportList.length === 0 && (
          <div className="admin-gis-empty-message">검색 결과가 없습니다.</div>
        )}

        <div className="admin-gis-pagination">
          <button type="button">«</button>
          <button type="button">‹</button>
          <button type="button" className="active">
            1
          </button>
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