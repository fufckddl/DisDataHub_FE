import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  importantNoticeMock,
  noticeCategoryMockList,
  noticeSummaryMock,
  recentNoticeMockList,
} from "../../mock/boardMockData";

import "../css/NoticeListPage.css";
import { getNoticeListApi } from "../../api/noticeApi";

function NoticeListPage() {
  const navigate = useNavigate();

  const [noticeList, setNoticeList] = useState([]);

  const getNoticeList = async () => {
    try {
      const data = await getNoticeListApi();

      if (data.result === "success") {
        setNoticeList(data.noticeList ?? []);
      }
    } catch (error) {
      console.error("공지사항 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    getNoticeList();
  }, []);

  const handleNoticeRowClick = (postId) => {
    navigate(`/board/notice/${postId}`);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  return (
    <div className="notice-page">
      <div className="notice-header">
        <div className="notice-header-icon">📢</div>

        <div>
          <h1>공지사항</h1>
          <p>서비스 운영 및 데이터 관련 주요 공지를 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="notice-layout">
        <main className="notice-main">
          <section className="notice-search-section">
            <input type="text" placeholder="공지사항 제목을 검색하세요" />

            <select>
              {noticeCategoryMockList.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>

            <button type="button">검색</button>
          </section>

          <section className="notice-important-section">
            <div className="important-label">중요 공지</div>

            <div className="important-content">
              <div className="important-icon">📢</div>

              <div>
                <h2>{importantNoticeMock.title}</h2>
                <p>{importantNoticeMock.content}</p>

                <div className="important-meta">
                  <span>
                    📅 {importantNoticeMock.startAt} ~{" "}
                    {importantNoticeMock.endAt}
                  </span>
                  <span>{importantNoticeMock.categoryName}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="notice-list-section">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>분류</th>
                  <th>작성일</th>
                  <th>조회수</th>
                </tr>
              </thead>

              <tbody>
                {noticeList.map((notice) => (
                  <tr
                    key={notice.postId}
                    className="notice-row"
                    onClick={() => handleNoticeRowClick(notice.postId)}
                  >
                    <td>{notice.pinnedYn === "Y" ? "📌" : notice.postId}</td>
                    <td>{notice.title}</td>
                    <td>공지사항</td>
                    <td>{formatDate(notice.createdAt)}</td>
                    <td>{notice.viewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>

        <aside className="notice-sidebar">
          <section className="notice-summary-section">
            <h3>공지사항 요약</h3>

            <div className="summary-item">
              <p>전체 공지</p>
              <strong>{noticeSummaryMock.totalCount}건</strong>
            </div>

            <div className="summary-item">
              <p>중요 공지</p>
              <strong>{noticeSummaryMock.importantCount}건</strong>
            </div>

            <div className="summary-item">
              <p>오늘 조회수</p>
              <strong>{noticeSummaryMock.todayViewCount}</strong>
            </div>
          </section>

          <section className="notice-recent-section">
            <h3>최근 업데이트</h3>

            {recentNoticeMockList.map((notice) => (
              <div
                className="recent-item"
                key={notice.postId}
                onClick={() => handleNoticeRowClick(notice.postId)}
              >
                <p>{notice.title}</p>
                <span>{notice.createdAt}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default NoticeListPage;