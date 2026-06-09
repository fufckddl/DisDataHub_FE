import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoticeDetailApi } from "../../api/noticeApi";
import "../css/NoticeDetailPage.css";

function NoticeDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [noticeDetail, setNoticeDetail] = useState(null);
  const [previousPostId, setPreviousPostId] = useState(null);
  const [nextPostId, setNextPostId] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const getNoticeDetail = async () => {
    try {
      setLoading(true);

      const data = await getNoticeDetailApi(postId);

      if (data.result === "success") {
        setNoticeDetail(data.noticeDetail);
        setPreviousPostId(data.previousPostId ?? null);
        setNextPostId(data.nextPostId ?? null);
      }
    } catch (error) {
      console.error("공지사항 상세 조회 실패:", error);
      alert("공지사항 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [postId]);

  useEffect(() => {
    if (!postId) {
      return;
    }

    setNoticeDetail(null);
    setPreviousPostId(null);
    setNextPostId(null);

    getNoticeDetail();
  }, [postId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleMovePrevious = () => {
    if (!previousPostId) {
      alert("이전 글이 없습니다.");
      return;
    }

    navigate(`/board/notice/${previousPostId}`);
  };

  const handleMoveNext = () => {
    if (!nextPostId) {
      alert("다음 글이 없습니다.");
      return;
    }

    navigate(`/board/notice/${nextPostId}`);
  };

  if (isLoading && !noticeDetail) {
    return (
      <div className="container-fluid px-4 py-3 notice-detail-page">
        <div className="notice-detail-container">
          <section className="notice-detail-empty">
            공지사항을 불러오는 중입니다.
          </section>
        </div>
      </div>
    );
  }

  if (!noticeDetail) {
    return (
      <div className="container-fluid px-4 py-3 notice-detail-page">
        <div className="notice-detail-container">
          <section className="notice-detail-empty">
            공지사항 정보를 찾을 수 없습니다.
          </section>

          <section className="notice-detail-button-area">
            <button
              type="button"
              className="notice-list-button"
              onClick={() => navigate("/board/notice")}
            >
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3 notice-detail-page">
      <div className="notice-detail-container">
        <section className="notice-detail-board">
          <div className="notice-detail-top">
            <div className="notice-detail-badge-area">
              <span className="notice-detail-category">공지사항</span>

              {noticeDetail.pinnedYn === "Y" && (
                <span className="notice-detail-pin">중요 공지</span>
              )}
            </div>

            <h1>{noticeDetail.title || "제목 없음"}</h1>

            <div className="notice-detail-info-row">
              <span>
                <em>작성자</em>
                <strong>관리자</strong>
              </span>

              <span>
                <em>작성일</em>
                <strong>{formatDate(noticeDetail.createdAt)}</strong>
              </span>

              <span>
                <em>조회수</em>
                <strong>{noticeDetail.viewCount ?? 0}</strong>
              </span>
            </div>
          </div>

          <div className="notice-detail-body">
            <div className="notice-detail-body-title">내용</div>

            <p>{noticeDetail.content || "등록된 공지 내용이 없습니다."}</p>
          </div>

          <div className="notice-detail-files">
            <h2>첨부파일</h2>

            <div className="notice-file-item">첨부파일이 없습니다.</div>
          </div>

          <div className="notice-detail-button-area">
            <button
              type="button"
              className="notice-list-button"
              onClick={() => navigate("/board/notice")}
            >
              목록으로
            </button>

            <div className="notice-move-button-group">
              <button
                type="button"
                className="notice-move-button"
                onClick={handleMovePrevious}
              >
                이전글
              </button>

              <button
                type="button"
                className="notice-move-button"
                onClick={handleMoveNext}
              >
                다음글
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NoticeDetailPage;