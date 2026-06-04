import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoticeDetailApi } from "../../api/noticeApi";
import "../css/NoticeDetailPage.css";

function NoticeDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const hasFetchedRef = useRef(false);

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
    if (!postId) {
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    getNoticeDetail();
  }, [postId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  if (isLoading) {
    return (
      <div className="notice-detail-page">
        <div className="notice-detail-container">
          <div className="notice-detail-content">
            공지사항을 불러오는 중입니다.
          </div>
        </div>
      </div>
    );
  }

  if (!noticeDetail) {
    return (
      <div className="notice-detail-page">
        <div className="notice-detail-container">
          <div className="notice-detail-content">
            공지사항 정보를 찾을 수 없습니다.
          </div>

          <section className="notice-detail-button-area">
            <button type="button" onClick={() => navigate("/board/notice")}>
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-detail-page">
      <div className="notice-detail-container">
        <section className="notice-detail-header">
          <div>
            <div className="notice-detail-badge-area">
              <span className="notice-detail-category">공지사항</span>

              {noticeDetail.pinnedYn === "Y" && (
                <span className="notice-detail-pin">중요 공지</span>
              )}
            </div>

            <h1>{noticeDetail.title}</h1>
            <p>서비스 운영 및 데이터 관련 주요 공지사항입니다.</p>
          </div>
        </section>

        <section className="notice-detail-meta">
          <div>
            <span>작성자</span>
            <strong>관리자</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(noticeDetail.createdAt)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{noticeDetail.viewCount}</strong>
          </div>
        </section>

        <section className="notice-detail-content">
          <h2>공지 내용</h2>
          <p>{noticeDetail.content}</p>
        </section>

        <section className="notice-detail-file-section">
          <h2>첨부파일</h2>

          <div className="notice-file-item">첨부파일이 없습니다.</div>
        </section>

        <section className="notice-detail-button-area">
          <button type="button">이전글</button>

          <button type="button" onClick={() => navigate("/board/notice")}>
            목록으로
          </button>

          <button type="button">다음글</button>
        </section>
      </div>
    </div>
  );
}

export default NoticeDetailPage;