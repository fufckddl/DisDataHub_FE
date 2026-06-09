import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/NoticeListPage.css";
import { getNoticeListApi } from "../../api/noticeApi";

function NoticeListPage() {
  const navigate = useNavigate();

  const [noticeList, setNoticeList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [noticeType, setNoticeType] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const noticeTypeList = [
    { code: "", name: "전체 공지" },
    { code: "PINNED", name: "중요 공지" },
    { code: "NORMAL", name: "일반 공지" },
  ];

  const getNoticeList = async () => {
    try {
      const data = await getNoticeListApi();

      if (data.result === "success") {
        setNoticeList(data.noticeList ?? []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("공지사항 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    getNoticeList();
  }, []);

  const filteredNoticeList = noticeList.filter((notice) => {
    const title = notice.title ?? "";

    const matchSearch = title
      .toLowerCase()
      .includes(searchWord.toLowerCase());

    const matchType =
      noticeType === "" ||
      (noticeType === "PINNED" && notice.pinnedYn === "Y") ||
      (noticeType === "NORMAL" && notice.pinnedYn !== "Y");

    return matchSearch && matchType;
  });

  const totalPage = Math.ceil(filteredNoticeList.length / pageSize);

  const pageList = Array.from({ length: totalPage }, (_, index) => index + 1);

  const currentPageNoticeList = filteredNoticeList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchWord, noticeType]);

  useEffect(() => {
    if (totalPage > 0 && currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [currentPage, totalPage]);

  const handleNoticeRowClick = (postId) => {
    navigate(`/board/notice/${postId}`);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage >= totalPage) return;
    setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleResetSearch = () => {
    setSearchWord("");
    setNoticeType("");
    setCurrentPage(1);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const getNoticeTypeName = (notice) => {
    if (notice.pinnedYn === "Y") return "중요 공지";
    return "일반 공지";
  };

  return (
    <div className="container-fluid px-4 py-3 notice-page">
      <div className="notice-header">
        <div>
          <h1>공지사항</h1>
          <p>서비스 운영 및 데이터 관련 주요 공지를 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="notice-layout">
        <main className="notice-main">
          <div className="notice-board-panel">
            <section className="notice-search-section">
              <input
                type="text"
                placeholder="공지사항 제목을 검색하세요"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
              />

              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
              >
                {noticeTypeList.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </select>

              <button type="button" onClick={getNoticeList}>
                새로고침
              </button>

              <button
                type="button"
                className="notice-reset-button"
                onClick={handleResetSearch}
              >
                초기화
              </button>
            </section>

            <section className="notice-list-section">
              <div className="notice-list-toolbar">
                <div className="notice-list-count">
                  총 <strong>{filteredNoticeList.length}</strong>건
                </div>
              </div>

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
                  {currentPageNoticeList.map((notice) => (
                    <tr
                      key={notice.postId}
                      className={
                        notice.pinnedYn === "Y"
                          ? "notice-row pinned"
                          : "notice-row"
                      }
                      onClick={() => handleNoticeRowClick(notice.postId)}
                    >
                      <td>{notice.pinnedYn === "Y" ? "📌" : notice.postId}</td>

                      <td className="notice-title-cell">
                        {notice.title || "제목 없음"}
                      </td>

                      <td>
                        <span
                          className={
                            notice.pinnedYn === "Y"
                              ? "notice-type-badge pinned"
                              : "notice-type-badge normal"
                          }
                        >
                          {getNoticeTypeName(notice)}
                        </span>
                      </td>

                      <td>{formatDate(notice.createdAt)}</td>
                      <td>{notice.viewCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredNoticeList.length === 0 && (
                <div className="notice-empty-message">
                  등록된 공지사항이 없습니다.
                </div>
              )}

              {filteredNoticeList.length > 0 && (
                <div className="notice-list-bottom">
                  <div className="notice-pagination">
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                    >
                      ‹
                    </button>

                    {pageList.map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={page === currentPage ? "active" : ""}
                        onClick={() => handlePageClick(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPage || totalPage === 0}
                    >
                      ›
                    </button>
                  </div>

                  <div className="notice-page-info">
                    총 {filteredNoticeList.length}건 / {currentPage}
                    {totalPage > 0 ? ` / ${totalPage}페이지` : " / 0페이지"}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NoticeListPage;