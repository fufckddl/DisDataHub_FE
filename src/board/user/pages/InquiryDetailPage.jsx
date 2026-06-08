import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInquiryDetailApi,
  deleteMyInquiryApi,
} from "../../api/inquiryApi";
import "../css/InquiryDetailPage.css";

function InquiryDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const hasFetchedRef = useRef(false);

  const [inquiry, setInquiry] = useState(null);
  const [isOwner, setOwner] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const getInquiryDetail = async () => {
    try {
      setLoading(true);

      const data = await getInquiryDetailApi(postId);

      console.log("문의 상세 응답:", data);

      if (data.result === "success") {
        setInquiry(data.inquiryDetail);
        setOwner(data.isOwner === true);
      }
    } catch (error) {
      console.error("문의 상세 조회 실패:", error);
      alert("문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
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
    getInquiryDetail();
  }, [postId]);

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  const getInquiryStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "접수완료";
    if (statusCode === "CHECKING") return "확인중";
    if (statusCode === "ANSWERED") return "답변완료";
    return statusCode ?? "-";
  };

  const getInquiryCategoryName = (categoryCode) => {
    if (categoryCode === "SYSTEM_USE") return "시스템 이용";
    if (categoryCode === "DATA") return "데이터 문의";
    if (categoryCode === "ERROR") return "오류 문의";
    if (categoryCode === "ETC") return "기타 문의";
    return categoryCode ?? "-";
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return visibilityStatus ?? "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleMoveEdit = () => {
    if (!isOwner) {
      alert("작성자 본인만 수정할 수 있습니다.");
      return;
    }

    navigate(`/board/inquiry/edit/${postId}`);
  };

  const handleDelete = async () => {
    if (!isOwner) {
      alert("작성자 본인만 삭제할 수 있습니다.");
      return;
    }

    const isConfirm = window.confirm("정말 이 문의글을 삭제하시겠습니까?");

    if (!isConfirm) {
      return;
    }

    try {
      setDeleting(true);

      const data = await deleteMyInquiryApi(postId);

      if (data.result === "success") {
        alert("문의글이 삭제되었습니다.");
        navigate("/board/inquiry");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid px-4 py-3 inquiry-detail-page">
        <div className="inquiry-detail-container">
          <section className="inquiry-not-found">
            <p>문의 상세 정보를 불러오는 중입니다.</p>
          </section>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container-fluid px-4 py-3 inquiry-detail-page">
        <div className="inquiry-detail-container">
          <section className="inquiry-not-found">
            <p>문의 게시글을 찾을 수 없습니다.</p>
            <p>비공개 글인 경우 작성자 본인만 확인할 수 있습니다.</p>

            <button type="button" onClick={() => navigate("/board/inquiry")}>
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  const hasAnswer =
    inquiry.inquiryStatusCode === "ANSWERED" &&
    inquiry.answerContent &&
    inquiry.answerContent.trim() !== "";

  return (
    <div className="container-fluid px-4 py-3 inquiry-detail-page">
      <div className="inquiry-detail-container">
        <section className="inquiry-detail-header">
          <div className="inquiry-detail-badge-area">
            <span className="inquiry-category-badge">
              {getInquiryCategoryName(inquiry.inquiryCategoryCode)}
            </span>

            <span
              className={`inquiry-status-badge ${getStatusClassName(
                inquiry.inquiryStatusCode
              )}`}
            >
              {getInquiryStatusName(inquiry.inquiryStatusCode)}
            </span>

            <span className="inquiry-visibility-badge">
              {getVisibilityName(inquiry.visibilityStatus)}
            </span>
          </div>

          <h1>{inquiry.title || "제목 없음"}</h1>
          <p>등록된 문의 내용과 답변 상태를 확인할 수 있습니다.</p>

          {isOwner && (
            <div className="inquiry-owner-button-area">
              <button
                type="button"
                className="inquiry-edit-button"
                onClick={handleMoveEdit}
              >
                수정
              </button>

              <button
                type="button"
                className="inquiry-delete-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          )}
        </section>

        <section className="inquiry-detail-meta">
          <div>
            <span>작성자</span>
            <strong>
              {inquiry.writerName ||
                inquiry.nickname ||
                `사용자 ${inquiry.userId ?? "-"}`}
            </strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(inquiry.createdAt)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{inquiry.viewCount ?? 0}</strong>
          </div>
        </section>

        <section className="inquiry-detail-content">
          <h2>문의 내용</h2>
          <p>{inquiry.content || "등록된 문의 내용이 없습니다."}</p>
        </section>

        <section className="inquiry-answer-section">
          <h2>관리자 답변</h2>

          {hasAnswer ? (
            <div className="answer-complete-box">
              <div className="answer-meta">
                <strong>{inquiry.replyWriterName || "관리자"}</strong>
                <span>{formatDate(inquiry.answeredAt)}</span>
              </div>

              <p>{inquiry.answerContent}</p>
            </div>
          ) : (
            <div className="answer-waiting-box">
              <strong>아직 답변이 등록되지 않았습니다.</strong>
              <p>관리자가 문의 내용을 확인한 후 답변을 등록할 예정입니다.</p>
            </div>
          )}
        </section>

        <section className="inquiry-detail-button-area">
          <button type="button">이전글</button>

          <button type="button" onClick={() => navigate("/board/inquiry")}>
            목록으로
          </button>

          <button type="button">다음글</button>
        </section>
      </div>
    </div>
  );
}

export default InquiryDetailPage;