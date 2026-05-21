import { useState } from "react";
import { Link } from "react-router-dom";

import {
  adminNoticeMockList,
  adminNoticeCategoryMockList,
  adminNoticeVisibilityMockList,
  adminNoticePaginationMock,
} from "../../mock/adminNoticeMockData";

import "../css/AdminNoticeManagePage.css";

function AdminNoticeManagePage() {
  const [searchWord, setSearchWord] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("");

  const filteredNoticeList = adminNoticeMockList.filter((notice) => {
    const matchSearch = notice.title.includes(searchWord);

    const matchCategory =
      categoryCode === "" || notice.categoryCode === categoryCode;

    const matchVisibility =
      visibilityStatus === "" || notice.visibilityStatus === visibilityStatus;

    return matchSearch && matchCategory && matchVisibility;
  });

  const totalCount = adminNoticeMockList.length;

  const pinnedCount = adminNoticeMockList.filter(
    (notice) => notice.pinnedYn === "Y"
  ).length;

  const publicCount = adminNoticeMockList.filter(
    (notice) => notice.visibilityStatus === "PUBLIC"
  ).length;

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SYSTEM") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    if (categoryCode === "SERVICE") return "category-service";
    if (categoryCode === "POLICY") return "category-policy";
    return "category-etc";
  };

  const getVisibilityClassName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "visibility-public";
    if (visibilityStatus === "PRIVATE") return "visibility-private";
    return "";
  };

  const handleDelete = (postId) => {
    alert(`${postId}번 공지사항 삭제 기능은 나중에 연결합니다.`);
  };

  return (
    <div className="admin-notice-manage-page">
      <section className="admin-notice-header">
        <div>
          <h1>공지사항 관리</h1>
          <p>공지사항을 등록하고 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-notice-summary-section">
        <div className="admin-notice-summary-card">
          <div className="summary-icon">📄</div>

          <div>
            <p>전체 공지</p>
            <strong>{totalCount}건</strong>
            <span>전체 등록된 공지사항</span>
          </div>
        </div>

        <div className="admin-notice-summary-card">
          <div className="summary-icon">⭐</div>

          <div>
            <p>중요 공지</p>
            <strong>{pinnedCount}건</strong>
            <span>상단 고정된 중요 공지</span>
          </div>
        </div>

        <div className="admin-notice-summary-card">
          <div className="summary-icon">📢</div>

          <div>
            <p>공개 공지</p>
            <strong>{publicCount}건</strong>
            <span>현재 공개 중인 공지</span>
          </div>
        </div>
      </section>

      <section className="admin-notice-filter-section">
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
          <label>분류</label>

          <select
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          >
            {adminNoticeCategoryMockList.map((category) => (
              <option key={category.code} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>공개 여부</label>

          <select
            value={visibilityStatus}
            onChange={(e) => setVisibilityStatus(e.target.value)}
          >
            {adminNoticeVisibilityMockList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="notice-search-button">
          🔍 검색
        </button>

        <Link to="/admin/board/notice/write" className="notice-write-button">
          ✎ 공지 작성
        </Link>
      </section>

      <section className="admin-notice-table-section">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>분류</th>
              <th>상단고정</th>
              <th>공개여부</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {filteredNoticeList.map((notice) => (
              <tr key={notice.postId}>
                <td>{notice.postId}</td>

                <td className="notice-title-cell">{notice.title}</td>

                <td>
                  <span
                    className={`notice-category-badge ${getCategoryClassName(
                      notice.categoryCode
                    )}`}
                  >
                    {notice.categoryName}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      notice.pinnedYn === "Y"
                        ? "notice-pinned-star active"
                        : "notice-pinned-star"
                    }
                  >
                    {notice.pinnedYn === "Y" ? "★" : "☆"}
                  </span>
                </td>

                <td>
                  <span
                    className={`notice-visibility-badge ${getVisibilityClassName(
                      notice.visibilityStatus
                    )}`}
                  >
                    {notice.visibilityName}
                  </span>
                </td>

                <td>{notice.createdAt}</td>

                <td>
                  <div className="notice-action-buttons">
                    <button type="button" className="notice-edit-button">
                      수정
                    </button>

                    <button
                      type="button"
                      className="notice-delete-button"
                      onClick={() => handleDelete(notice.postId)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredNoticeList.length === 0 && (
          <div className="admin-notice-empty-message">
            검색 결과가 없습니다.
          </div>
        )}

        <div className="admin-notice-pagination">
          <button type="button">«</button>
          <button type="button">‹</button>

          {adminNoticePaginationMock.pageList.map((page) => (
            <button
              type="button"
              key={page}
              className={
                page === adminNoticePaginationMock.currentPage ? "active" : ""
              }
            >
              {page}
            </button>
          ))}

          <span>...</span>
          <button type="button">{adminNoticePaginationMock.totalPage}</button>
          <button type="button">›</button>
          <button type="button">»</button>

          <select className="notice-page-size-select">
            <option>10개씩 보기</option>
            <option>20개씩 보기</option>
            <option>50개씩 보기</option>
          </select>
        </div>
      </section>
    </div>
  );
}

export default AdminNoticeManagePage;