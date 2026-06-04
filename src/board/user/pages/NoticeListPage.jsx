import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/NoticeListPage.css";
import { getNoticeListApi } from "../../api/noticeApi";

function NoticeListPage() {
  const navigate = useNavigate();

  const [noticeList, setNoticeList] = useState([]);
  const [searchWord, setSearchWord] = useState("");

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

  const filteredNoticeList = noticeList.filter((notice) => {
    const title = notice.title ?? "";
    return title.toLowerCase().includes(searchWord.toLowerCase());
  });

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
            <input
              type="text"
              placeholder="공지사항 제목을 검색하세요"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
            />

            <button type="button" onClick={getNoticeList}>
              새로고침
            </button>
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
                {filteredNoticeList.map((notice) => (
                  <tr
                    key={notice.postId}
                    className="notice-row"
                    onClick={() => handleNoticeRowClick(notice.postId)}
                  >
                    <td>{notice.pinnedYn === "Y" ? "📌" : notice.postId}</td>
                    <td>{notice.title}</td>
                    <td>공지사항</td>
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default NoticeListPage;