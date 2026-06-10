import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminNoticeDetailApi,
  deleteNoticeApi,
  restoreNoticeApi,
} from "../../api/noticeApi";
import "../css/AdminNoticeDetailPage.css";

function AdminNoticeDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [noticeDetail, setNoticeDetail] = useState(null);
  const [previousPostId, setPreviousPostId] = useState(null);
  const [nextPostId, setNextPostId] = useState(null);

  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);

  const getNoticeDetail = async () => {
    try {
      setLoading(true);

      const data = await getAdminNoticeDetailApi(postId);

      if (data.result === "success") {
        setNoticeDetail(data.adminNoticeDetail ?? data.noticeDetail ?? null);
        setPreviousPostId(data.previousPostId ?? null);
        setNextPostId(data.nextPostId ?? null);
      } else {
        setNoticeDetail(null);
      }
    } catch (error) {
      console.error("관리자 공지사항 상세 조회 실패:", error);
      alert("공지사항 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNoticeDetail();
  }, [postId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "-";
  };

  const handleDelete = async () => {
    const isConfirm = window.confirm(
      `${noticeDetail?.postId}번 공지사항을 삭제하시겠습니까?`
    );

    if (!isConfirm) {
      return;
    }

    try {
      setDeleting(true);

      const data = await deleteNoticeApi(postId);

      if (data.result === "success") {
        alert("공지사항이 삭제되었습니다.");
        getNoticeDetail();
      } else {
        alert("공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    const isConfirm = window.confirm(
      `${noticeDetail?.postId}번 공지사항의 삭제 상태를 취소하시겠습니까?`
    );

    if (!isConfirm) {
      return;
    }

    try {
      setRestoring(true);

      const data = await restoreNoticeApi(postId);

      if (data.result === "success") {
        alert("공지사항 삭제가 취소되었습니다.");
        getNoticeDetail();
      } else {
        alert("공지사항 삭제 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 삭제 취소 실패:", error);
      alert("공지사항 삭제 취소 중 오류가 발생했습니다.");
    } finally {
      setRestoring(false);
    }
  };

  const handleMovePrevious = () => {
    if (!previousPostId) {
      alert("이전 글이 없습니다.");
      return;
    }

    navigate(`/admin/board/notice/${previousPostId}`);
  };

  const handleMoveNext = () => {
    if (!nextPostId) {
      alert("다음 글이 없습니다.");
      return;
    }

    navigate(`/admin/board/notice/${nextPostId}`);
  };

  if (isLoading) {
    return (
      <div className="container-fluid px-4 py-3 admin-notice-detail-page">
        <div className="admin-notice-detail-loading">
          공지사항을 불러오는 중입니다.
        </div>
      </div>
    );
  }

  if (!noticeDetail) {
    return (
      <div className="container-fluid px-4 py-3 admin-notice-detail-page">
        <section className="admin-notice-detail-header">
          <div>
            <h1>공지사항 상세</h1>
            <p>공지사항 정보를 확인합니다.</p>
          </div>
        </section>

        <div className="admin-notice-detail-empty">
          공지사항 정보를 찾을 수 없습니다.
        </div>

        <div className="admin-notice-detail-bottom">
          <button
            type="button"
            className="admin-notice-list-button"
            onClick={() => navigate("/admin/board/notice")}
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const isDeleted = noticeDetail.deletedYn === "Y";

  return (
    <div className="container-fluid px-4 py-3 admin-notice-detail-page">
      <section className="admin-notice-detail-header">
        <div>
          <h1>공지사항 상세</h1>
          <p>공지사항 내용과 게시 상태를 확인합니다.</p>
        </div>

        <div className="admin-notice-detail-header-actions">
          {!isDeleted && (
            <button
              type="button"
              className="admin-notice-edit-button"
              onClick={() =>
                navigate(`/admin/board/notice/edit/${noticeDetail.postId}`)
              }
            >
              수정
            </button>
          )}

          {isDeleted ? (
            <button
              type="button"
              className="admin-notice-restore-button"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring ? "복구 중..." : "삭제 취소"}
            </button>
          ) : (
            <button
              type="button"
              className="admin-notice-delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          )}
        </div>
      </section>

      <section className="admin-notice-detail-card">
        <div className="admin-notice-detail-title-area">
          <div className="admin-notice-detail-badges">
            <span className="admin-notice-type-badge">공지사항</span>

            {noticeDetail.pinnedYn === "Y" && (
              <span className="admin-notice-status-badge active">
                상단 고정
              </span>
            )}

            {noticeDetail.visibilityStatus && (
              <span className="admin-notice-status-badge">
                {getVisibilityName(noticeDetail.visibilityStatus)}
              </span>
            )}

            {isDeleted && (
              <span className="admin-notice-deleted-badge">삭제됨</span>
            )}
          </div>

          <h2>{noticeDetail.title}</h2>
        </div>

        <div className="admin-notice-info-bar">
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
            <strong>{noticeDetail.viewCount ?? 0}</strong>
          </div>

          <div>
            <span>고정 여부</span>
            <strong>{noticeDetail.pinnedYn === "Y" ? "고정" : "일반"}</strong>
          </div>

          <div>
            <span>삭제 여부</span>
            <strong>{isDeleted ? "삭제됨" : "정상"}</strong>
          </div>
        </div>

        <div className="admin-notice-content-section">
          <div className="admin-notice-content-title">본문 내용</div>

          <div className="admin-notice-detail-content">
            {noticeDetail.content}
          </div>
        </div>

        <div className="admin-notice-detail-bottom">
          <button
            type="button"
            className="admin-notice-list-button"
            onClick={() => navigate("/admin/board/notice")}
          >
            목록으로
          </button>

          <div className="admin-notice-move-button-group">
            <button
              type="button"
              className="admin-notice-move-button"
              onClick={handleMovePrevious}
            >
              이전글
            </button>

            <button
              type="button"
              className="admin-notice-move-button next"
              onClick={handleMoveNext}
            >
              다음글
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminNoticeDetailPage;