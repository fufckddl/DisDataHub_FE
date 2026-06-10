// src/board/admin/pages/AdminInquiryManagePage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminInquiryListApi } from "../../api/inquiryApi";
import "../css/AdminInquiryManagePage.css";

function AdminInquiryManagePage() {
  const navigate = useNavigate();

  const [inquiryList, setInquiryList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [isLoading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const inquiryCategoryList = [
    { code: "", name: "문의 분류 전체" },
    { code: "SYSTEM_USE", name: "시스템 이용" },
    { code: "DATA", name: "데이터 문의" },
    { code: "ERROR", name: "오류 문의" },
    { code: "ETC", name: "기타 문의" },
  ];

  const inquiryStatusList = [
    { code: "", name: "답변 상태 전체" },
    { code: "RECEIVED", name: "접수완료" },
    { code: "CHECKING", name: "확인중" },
    { code: "ANSWERED", name: "답변완료" },
  ];

  const getAdminInquiryList = async () => {
    try {
      setLoading(true);

      const data = await getAdminInquiryListApi();

      if (data.result === "success") {
        setInquiryList(data.adminInquiryList ?? data.inquiryList ?? []);
      }
    } catch (error) {
      console.error("관리자 문의 목록 조회 실패:", error);
      alert("문의 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminInquiryList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchWord, categoryCode, statusCode]);

  const filteredInquiryList = useMemo(() => {
    return inquiryList.filter((inquiry) => {
      const title = inquiry.title ?? "";
      const writer = String(inquiry.userId ?? "");

      const matchSearch =
        title.toLowerCase().includes(searchWord.toLowerCase()) ||
        writer.includes(searchWord);

      const matchCategory =
        categoryCode === "" || inquiry.inquiryCategoryCode === categoryCode;

      const matchStatus =
        statusCode === "" || inquiry.inquiryStatusCode === statusCode;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inquiryList, searchWord, categoryCode, statusCode]);

  const totalPage = Math.max(
    1,
    Math.ceil(filteredInquiryList.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const pagedInquiryList = filteredInquiryList.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageNumbers = Array.from({ length: totalPage }, (_, index) => index + 1);

  const totalCount = inquiryList.length;

  const receivedCount = inquiryList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "RECEIVED"
  ).length;

  const checkingCount = inquiryList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "CHECKING"
  ).length;

  const answeredCount = inquiryList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "ANSWERED"
  ).length;

  const handleMoveDetail = (postId) => {
    navigate(`/admin/board/inquiry/${postId}`);
  };

  const handleResetSearch = () => {
    setSearchWord("");
    setCategoryCode("");
    setStatusCode("");
    setCurrentPage(1);
  };

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SYSTEM_USE") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    if (categoryCode === "ERROR") return "category-error";
    if (categoryCode === "ETC") return "category-etc";
    return "";
  };

  const getCategoryName = (categoryCode) => {
    if (categoryCode === "SYSTEM_USE") return "시스템 이용";
    if (categoryCode === "DATA") return "데이터 문의";
    if (categoryCode === "ERROR") return "오류 문의";
    if (categoryCode === "ETC") return "기타 문의";
    return categoryCode ?? "-";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  const getStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "접수완료";
    if (statusCode === "CHECKING") return "확인중";
    if (statusCode === "ANSWERED") return "답변완료";
    return statusCode ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  return (
    <div className="container-fluid px-4 py-3 admin-inquiry-manage-page">
      <section className="admin-inquiry-header">
        <div>
          <h1>문의 관리</h1>
          <p>사용자 문의를 조회하고 상태를 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-inquiry-summary-section">
        <div className="admin-inquiry-summary-card">
          <p>전체 문의</p>
          <strong>{totalCount}건</strong>
          <span>전체 문의 내역</span>
        </div>

        <div className="admin-inquiry-summary-card">
          <p>접수완료</p>
          <strong>{receivedCount}건</strong>
          <span>신규 접수된 문의</span>
        </div>

        <div className="admin-inquiry-summary-card">
          <p>확인중</p>
          <strong>{checkingCount}건</strong>
          <span>검토 중인 문의</span>
        </div>

        <div className="admin-inquiry-summary-card">
          <p>답변완료</p>
          <strong>{answeredCount}건</strong>
          <span>답변 완료된 문의</span>
        </div>
      </section>

      <section className="admin-inquiry-board-section">
        <div className="admin-inquiry-filter-section">
          <input
            type="text"
            placeholder="제목 또는 작성자 ID를 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />

          <select
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          >
            {inquiryCategoryList.map((category) => (
              <option key={category.code} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
          >
            {inquiryStatusList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="inquiry-reset-button"
            onClick={handleResetSearch}
          >
            초기화
          </button>
        </div>

        <div className="admin-inquiry-table-header">
          <div>
            <h2>문의 목록</h2>
            <span>
              검색 결과 {filteredInquiryList.length}건 / 전체 {totalCount}건
            </span>
          </div>
        </div>

        <div className="admin-inquiry-table-wrap">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>문의 분류</th>
                <th>작성자</th>
                <th>상태</th>
                <th>작성일</th>
                <th>상세</th>
              </tr>
            </thead>

            <tbody>
              {pagedInquiryList.map((inquiry) => (
                <tr
                  key={inquiry.postId}
                  className="admin-inquiry-clickable-row"
                  onClick={() => handleMoveDetail(inquiry.postId)}
                >
                  <td>{inquiry.postId}</td>

                  <td className="inquiry-title-cell">
                    <span className="inquiry-title-text">{inquiry.title}</span>
                  </td>

                  <td>
                    <span
                      className={`inquiry-category-badge ${getCategoryClassName(
                        inquiry.inquiryCategoryCode
                      )}`}
                    >
                      {getCategoryName(inquiry.inquiryCategoryCode)}
                    </span>
                  </td>

                  <td>{inquiry.userId}</td>

                  <td>
                    <span
                      className={`inquiry-status-badge ${getStatusClassName(
                        inquiry.inquiryStatusCode
                      )}`}
                    >
                      {getStatusName(inquiry.inquiryStatusCode)}
                    </span>
                  </td>

                  <td>{formatDate(inquiry.createdAt)}</td>

                  <td>
                    <button
                      type="button"
                      className="inquiry-detail-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDetail(inquiry.postId);
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
          <div className="admin-inquiry-empty-message">
            문의 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredInquiryList.length === 0 && (
          <div className="admin-inquiry-empty-message">
            검색 결과가 없습니다.
          </div>
        )}

        {!isLoading && filteredInquiryList.length > 0 && (
          <div className="admin-inquiry-list-bottom">
            <div className="admin-inquiry-pagination">
              <button
                type="button"
                className="pagination-arrow-button"
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
                className="pagination-arrow-button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPage))
                }
                disabled={currentPage === totalPage}
              >
                &gt;
              </button>
            </div>

            <div className="admin-inquiry-page-info">
              {currentPage} / {totalPage}페이지
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminInquiryManagePage;