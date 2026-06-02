import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoticeDetailApi } from "../../api/noticeApi";
import "../css/AdminNoticeDetailPage.css";

function NoticeDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [noticeDetail, setNoticeDetail] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const getNoticeDetail = async () => {
    try {
      setLoading(true);

      const data = await getNoticeDetailApi(postId);

      if (data.result === "success") {
        setNoticeDetail(data.noticeDetail);
      }
    } catch (error) {
      console.error("공지사항 상세 조회 실패:", error);
      alert("공지사항 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNoticeDetail();
  }, [postId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  if (isLoading) {
    return (
      <div className="notice-detail-page">
        <div className="notice-detail-loading">
          공지사항을 불러오는 중입니다.
        </div>
      </div>
    );
  }

  if (!noticeDetail) {
    return (
      <div className="notice-detail-page">
        <div className="notice-detail-empty">
          공지사항 정보를 찾을 수 없습니다.
        </div>

        <button
          type="button"
          className="notice-detail-list-button"
          onClick={() => navigate("/board/notice")}
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="notice-detail-page">
      <section className="notice-detail-header">
        <div>
          <h1>공지사항</h1>
          <p>서비스 운영 및 데이터 관련 주요 공지사항입니다.</p>
        </div>

        <button
          type="button"
          className="notice-detail-list-button"
          onClick={() => navigate("/board/notice")}
        >
          목록으로
        </button>
      </section>

      <section className="notice-detail-card">
        <div className="notice-detail-title-area">
          <div className="notice-detail-badges">
            {noticeDetail.pinnedYn === "Y" && (
              <span className="notice-pinned-badge">중요 공지</span>
            )}

            <span className="notice-type-badge">공지사항</span>
          </div>

          <h2>{noticeDetail.title}</h2>
        </div>

        <div className="notice-detail-meta">
          <div>
            <span>게시글 번호</span>
            <strong>{noticeDetail.postId}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(noticeDetail.createdAt)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{noticeDetail.viewCount}</strong>
          </div>
        </div>

        <div className="notice-detail-content">
          {noticeDetail.content}
        </div>
      </section>
    </div>
  );
}

export default NoticeDetailPage;