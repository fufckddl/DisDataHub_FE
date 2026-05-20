// src/board/admin/pages/AdminInquiryManagePage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";

import {
  adminInquiryMockList,
  adminInquiryCategoryMockList,
  adminInquiryStatusMockList,
  adminInquiryPaginationMock,
} from "../../mock/adminInquiryMockData";

import "../css/AdminInquiryManagePage.css";

function AdminInquiryManagePage() {
  const [searchWord, setSearchWord] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [statusCode, setStatusCode] = useState("");

  const filteredInquiryList = adminInquiryMockList.filter((inquiry) => {
    const matchSearch =
      inquiry.title.includes(searchWord) ||
      inquiry.writerName.includes(searchWord);

    const matchCategory =
      categoryCode === "" || inquiry.inquiryCategoryCode === categoryCode;

    const matchStatus =
      statusCode === "" || inquiry.inquiryStatusCode === statusCode;

    return matchSearch && matchCategory && matchStatus;
  });

  const totalCount = adminInquiryMockList.length;

  const receivedCount = adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "RECEIVED"
  ).length;

  const checkingCount = adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "CHECKING"
  ).length;

  const answeredCount = adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "ANSWERED"
  ).length;

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SERVICE") return "category-service";
    if (categoryCode === "SYSTEM") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    return "category-etc";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  return (
    <div className="admin-inquiry-manage-page">
      <section className="admin-inquiry-header">
        <div>
          <h1>문의 관리</h1>
          <p>사용자 문의를 조회하고 상태를 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-inquiry-summary-section">
        <div className="admin-inquiry-summary-card">
          <div className="summary-icon">💬</div>
          <div>
            <p>전체 문의</p>
            <strong>{totalCount}건</strong>
            <span>전체 문의 내역</span>
          </div>
        </div>

        <div className="admin-inquiry-summary-card">
          <div className="summary-icon">📥</div>
          <div>
            <p>접수</p>
            <strong>{receivedCount}건</strong>
            <span>신규 접수된 문의</span>
          </div>
        </div>

        <div className="admin-inquiry-summary-card">
          <div className="summary-icon">🔎</div>
          <div>
            <p>확인 중</p>
            <strong>{checkingCount}건</strong>
            <span>검토 중인 문의</span>
          </div>
        </div>

        <div className="admin-inquiry-summary-card">
          <div className="summary-icon">✅</div>
          <div>
            <p>답변 완료</p>
            <strong>{answeredCount}건</strong>
            <span>답변 완료된 문의</span>
          </div>
        </div>
      </section>

      <section className="admin-inquiry-filter-section">
        <div className="filter-item search-item">
          <label>제목 / 작성자 검색</label>

          <input
            type="text"
            placeholder="제목 또는 작성자를 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>문의 분류</label>

          <select
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          >
            {adminInquiryCategoryMockList.map((category) => (
              <option key={category.code} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>답변 상태</label>

          <select
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
          >
            {adminInquiryStatusMockList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="inquiry-search-button">
          🔍 검색
        </button>

        <button
          type="button"
          className="inquiry-reset-button"
          onClick={() => {
            setSearchWord("");
            setCategoryCode("");
            setStatusCode("");
          }}
        >
          초기화
        </button>
      </section>

      <section className="admin-inquiry-table-section">
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
            {filteredInquiryList.map((inquiry) => (
              <tr key={inquiry.postId}>
                <td>{inquiry.postId}</td>

                <td className="inquiry-title-cell">
                  {inquiry.title}
                </td>

                <td>
                  <span
                    className={`inquiry-category-badge ${getCategoryClassName(
                      inquiry.inquiryCategoryCode
                    )}`}
                  >
                    {inquiry.inquiryCategoryName}
                  </span>
                </td>

                <td>{inquiry.writerName}</td>

                <td>
                  <span
                    className={`inquiry-status-badge ${getStatusClassName(
                      inquiry.inquiryStatusCode
                    )}`}
                  >
                    {inquiry.inquiryStatusName}
                  </span>
                </td>

                <td>{inquiry.createdAt}</td>

                <td>
                  <Link
                    to={`/admin/board/inquiry/${inquiry.postId}`}
                    className="inquiry-detail-button"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInquiryList.length === 0 && (
          <div className="admin-inquiry-empty-message">
            검색 결과가 없습니다.
          </div>
        )}

        <div className="admin-inquiry-pagination">
          <button type="button">«</button>
          <button type="button">‹</button>

          {adminInquiryPaginationMock.pageList.map((page) => (
            <button
              type="button"
              key={page}
              className={
                page === adminInquiryPaginationMock.currentPage ? "active" : ""
              }
            >
              {page}
            </button>
          ))}

          <span>...</span>
          <button type="button">{adminInquiryPaginationMock.totalPage}</button>
          <button type="button">›</button>
          <button type="button">»</button>

          <select className="inquiry-page-size-select">
            <option>10개씩 보기</option>
            <option>20개씩 보기</option>
            <option>50개씩 보기</option>
          </select>
        </div>
      </section>
    </div>
  );
}

export default AdminInquiryManagePage;