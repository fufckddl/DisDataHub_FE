import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInquiryDetailApi } from "../../api/inquiryApi";
import "../css/InquiryDetailPage.css";

function InquiryDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const hasFetchedRef = useRef(false);

  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const getInquiryDetail = async () => {
    try {
      setLoading(true);

      const data = await getInquiryDetailApi(postId);

      if (data.result === "success") {
        setInquiry(data.inquiryDetail);
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

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  if (isLoading) {
    return (
      <div className="inquiry-detail-page">
        <div className="inquiry-detail-container">
          <p>문의 상세 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="inquiry-detail-page">
        <div className="inquiry-detail-container">
          <p>문의 게시글을 찾을 수 없습니다.</p>

          <button type="button" onClick={() => navigate("/board/inquiry")}>
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const hasAnswer =
    inquiry.inquiryStatusCode === "ANSWERED" &&
    inquiry.answerContent &&
    inquiry.answerContent.trim() !== "";

  return (
    <div className="inquiry-detail-page">
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
          </div>

          <h1>{inquiry.title}</h1>
          <p>등록된 문의 내용과 답변 상태를 확인할 수 있습니다.</p>
        </section>

        <section className="inquiry-detail-meta">
          <div>
            <span>작성자</span>
            <strong>{inquiry.userId}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(inquiry.createdAt)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{inquiry.viewCount}</strong>
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