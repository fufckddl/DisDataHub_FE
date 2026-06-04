import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminInquiryDetailApi,
  saveAdminInquiryAnswerApi,
} from "../../api/inquiryApi";
import "../css/AdminInquiryDetailPage.css";

function AdminInquiryDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const [answerStatus, setAnswerStatus] = useState("RECEIVED");
  const [answerContent, setAnswerContent] = useState("");

  const adminInquiryStatusList = [
    { code: "RECEIVED", name: "접수완료" },
    { code: "CHECKING", name: "확인중" },
    { code: "ANSWERED", name: "답변완료" },
  ];

  const getAdminInquiryDetail = async () => {
    try {
      setLoading(true);

      const data = await getAdminInquiryDetailApi(postId);

      if (data.result === "success") {
        const detail = data.adminInquiryDetail ?? data.inquiryDetail;

        setInquiry(detail);
        setAnswerStatus(detail?.inquiryStatusCode ?? "RECEIVED");
        setAnswerContent(detail?.answerContent ?? "");
      }
    } catch (error) {
      console.error("관리자 문의 상세 조회 실패:", error);
      alert("문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminInquiryDetail();
  }, [postId]);

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SERVICE") return "category-service";
    if (categoryCode === "SYSTEM") return "category-system";
    if (categoryCode === "SYSTEM_USE") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    if (categoryCode === "ERROR") return "category-service";
    return "category-etc";
  };

  const getCategoryName = (categoryCode) => {
    if (categoryCode === "SERVICE") return "서비스 문의";
    if (categoryCode === "SYSTEM") return "시스템 문의";
    if (categoryCode === "SYSTEM_USE") return "시스템 이용";
    if (categoryCode === "DATA") return "데이터 문의";
    if (categoryCode === "ERROR") return "오류 문의";
    if (categoryCode === "ETC") return "기타 문의";
    return categoryCode ?? "-";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  const getStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "접수완료";
    if (statusCode === "CHECKING") return "확인중";
    if (statusCode === "ANSWERED") return "답변완료";
    return statusCode ?? "-";
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "-";
  };

  const getDeletedName = (deletedYn) => {
    if (deletedYn === "Y") return "삭제됨";
    if (deletedYn === "N") return "정상";
    return "-";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleSaveAnswer = async () => {
    if (answerStatus === "ANSWERED" && !answerContent.trim()) {
      alert("답변 완료 상태에서는 답변 내용을 입력해주세요.");
      return;
    }

    const requestData = {
      adminUserId: 1,
      replyWriterName: "관리자",
      inquiryStatusCode: answerStatus,
      answerContent,
    };

    try {
      setSaving(true);

      const data = await saveAdminInquiryAnswerApi(postId, requestData);

      if (data.result === "success") {
        alert("답변이 저장되었습니다.");
        getAdminInquiryDetail();
      } else {
        alert("답변 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("관리자 답변 저장 실패:", error);
      alert("답변 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-inquiry-detail-page">
        <div className="admin-inquiry-detail-container">
          <section className="admin-inquiry-not-found">
            <h1>문의 상세 정보를 불러오는 중입니다.</h1>
          </section>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="admin-inquiry-detail-page">
        <div className="admin-inquiry-detail-container">
          <section className="admin-inquiry-not-found">
            <h1>문의 게시글을 찾을 수 없습니다.</h1>

            <button
              type="button"
              onClick={() => navigate("/admin/board/inquiry")}
            >
              목록으로
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-inquiry-detail-page">
      <div className="admin-inquiry-detail-container">
        <section className="admin-inquiry-detail-header">
          <div className="admin-inquiry-badge-area">
            <span
              className={`admin-inquiry-category-badge ${getCategoryClassName(
                inquiry.inquiryCategoryCode
              )}`}
            >
              {getCategoryName(inquiry.inquiryCategoryCode)}
            </span>

            <span
              className={`admin-inquiry-status-badge ${getStatusClassName(
                inquiry.inquiryStatusCode
              )}`}
            >
              {getStatusName(inquiry.inquiryStatusCode)}
            </span>
          </div>

          <h1>{inquiry.title}</h1>
          <p>사용자 문의 내용을 확인하고 관리자 답변을 등록할 수 있습니다.</p>
        </section>

        <section className="admin-inquiry-detail-meta">
          <div>
            <span>작성자 ID</span>
            <strong>{inquiry.userId}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(inquiry.createdAt)}</strong>
          </div>

          <div>
            <span>문의 분류</span>
            <strong>{getCategoryName(inquiry.inquiryCategoryCode)}</strong>
          </div>

          <div>
            <span>공개 여부</span>
            <strong>{getVisibilityName(inquiry.visibilityStatus)}</strong>
          </div>

          <div>
            <span>삭제 여부</span>
            <strong>{getDeletedName(inquiry.deletedYn)}</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>{inquiry.viewCount}</strong>
          </div>
        </section>

        <section className="admin-inquiry-content-section">
          <h2>문의 내용</h2>

          <p>{inquiry.content || "등록된 문의 내용이 없습니다."}</p>
        </section>

        <section className="admin-inquiry-file-section">
          <h2>첨부파일</h2>

          <div className="admin-inquiry-file-empty">
            첨부파일이 없습니다.
          </div>
        </section>

        <section className="admin-inquiry-answer-section">
          <h2>관리자 답변</h2>

          <div className="admin-answer-form-row">
            <label>답변 상태</label>

            <select
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value)}
            >
              {adminInquiryStatusList.map((status) => (
                <option key={status.code} value={status.code}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-answer-form-row textarea-row">
            <label>답변 내용</label>

            <div className="answer-textarea-box">
              <textarea
                placeholder="답변 내용을 입력해주세요."
                value={answerContent}
                maxLength={2000}
                onChange={(e) => setAnswerContent(e.target.value)}
              />

              <span>{answerContent.length} / 2000</span>
            </div>
          </div>
        </section>

        <section className="admin-inquiry-detail-button-area">
          <button
            type="button"
            className="list-button"
            onClick={() => navigate("/admin/board/inquiry")}
          >
            목록으로
          </button>

          <button
            type="button"
            className="save-button"
            onClick={handleSaveAnswer}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "답변 저장"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default AdminInquiryDetailPage;