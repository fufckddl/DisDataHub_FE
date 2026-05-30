import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminNoticeDetailApi } from "../../api/noticeApi";
import "../css/AdminNoticeDetailPage.css";

function AdminNoticeDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [noticeDetail, setNoticeDetail] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const getAdminNoticeDetail = async () => {
    try {
      setLoading(true);

      const data = await getAdminNoticeDetailApi(postId);

      if (data.result === "success") {
        setNoticeDetail(data.adminNoticeDetail);
      }
    } catch (error) {
      console.error("관리자 공지사항 상세 조회 실패:", error);
      alert("공지사항 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminNoticeDetail();
  }, [postId]);

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "-";
  };

  const getPinnedName = (pinnedYn) => {
    if (pinnedYn === "Y") return "상단 고정";
    if (pinnedYn === "N") return "일반 공지";
    return "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  if (isLoading) {
    return (
      <div className="admin-notice-detail-page">
        <div className="admin-notice-detail-loading">
          공지사항 상세 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  if (!noticeDetail) {
    return (
      <div className="admin-notice-detail-page">
        <div className="admin-notice-detail-empty">
          공지사항 정보를 찾을 수 없습니다.
        </div>

        <button
          type="button"
          className="detail-list-button"
          onClick={() => navigate("/admin/board/notice")}
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="admin-notice-detail-page">
      <section className="admin-notice-detail-header">
        <div>
          <h1>공지사항 상세</h1>
          <p>등록된 공지사항의 상세 내용을 확인하고 관리할 수 있습니다.</p>
        </div>

        <div className="admin-notice-detail-header-actions">
          <button
            type="button"
            className="detail-list-button"
            onClick={() => navigate("/admin/board/notice")}
          >
            목록
          </button>

          <button
            type="button"
            className="detail-edit-button"
            onClick={() => navigate(`/admin/board/notice/edit/${postId}`)}
          >
            수정
          </button>

          <button
            type="button"
            className="detail-delete-button"
            onClick={() => alert("삭제 기능은 다음 단계에서 연결합니다.")}
          >
            삭제
          </button>
        </div>
      </section>

      <section className="admin-notice-detail-card">
        <div className="notice-detail-title-area">
          <div className="notice-detail-badges">
            <span className="notice-type-badge">공지사항</span>

            <span
              className={
                noticeDetail.visibilityStatus === "PUBLIC"
                  ? "notice-visibility-badge visibility-public"
                  : "notice-visibility-badge visibility-private"
              }
            >
              {getVisibilityName(noticeDetail.visibilityStatus)}
            </span>

            <span
              className={
                noticeDetail.pinnedYn === "Y"
                  ? "notice-pinned-badge pinned-active"
                  : "notice-pinned-badge"
              }
            >
              {getPinnedName(noticeDetail.pinnedYn)}
            </span>
          </div>

          <h2>{noticeDetail.title}</h2>
        </div>

        <div className="notice-detail-meta">
          <div>
            <span>게시글 번호</span>
            <strong>{noticeDetail.postId}</strong>
          </div>

          <div>
            <span>작성자 ID</span>
            <strong>{noticeDetail.userId}</strong>
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

export default AdminNoticeDetailPage;