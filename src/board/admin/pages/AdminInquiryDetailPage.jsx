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
      } else {
        setInquiry(null);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SERVICE") return "category-service";
    if (categoryCode === "SYSTEM") return "category-system";
    if (categoryCode === "SYSTEM_USE") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    if (categoryCode === "ERROR") return "category-error";
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

  const getWriterDisplayName = (inquiryData) => {
    return (
      inquiryData?.writerName ||
      inquiryData?.name ||
      inquiryData?.userName ||
      inquiryData?.memberName ||
      inquiryData?.nickname ||
      inquiryData?.writerNickname ||
      `사용자 ${inquiryData?.userId ?? "-"}`
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const handleSaveAnswer = async () => {
    if (inquiry?.deletedYn === "Y") {
      alert("삭제된 문의 게시글은 답변을 저장할 수 없습니다.");
      return;
    }

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
      <div className="container-fluid px-4 py-3 admin-inquiry-detail-page">
        <div className="admin-inquiry-detail-loading">
          문의 상세 정보를 불러오는 중입니다.
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container-fluid px-4 py-3 admin-inquiry-detail-page">
        <section className="admin-inquiry-detail-header">
          <div>
            <h1>문의 상세</h1>
            <p>문의 정보를 확인합니다.</p>
          </div>
        </section>

        <div className="admin-inquiry-detail-empty">
          문의 게시글을 찾을 수 없습니다.
        </div>

        <div className="admin-inquiry-detail-bottom">
          <button
            type="button"
            className="admin-inquiry-list-button"
            onClick={() => navigate("/admin/board/inquiry")}
          >
            목록으로
          </button>

          <button
            type="button"
            className="admin-inquiry-save-button"
            disabled
          >
            답변 저장
          </button>
        </div>
      </div>
    );
  }

  const isDeleted = inquiry.deletedYn === "Y";

  return (
    <div className="container-fluid px-4 py-3 admin-inquiry-detail-page">
      <section className="admin-inquiry-detail-header">
        <div>
          <h1>문의 상세</h1>
          <p>사용자 문의 내용과 답변 상태를 관리합니다.</p>
        </div>
      </section>

      <section className="admin-inquiry-detail-card">
        <div className="admin-inquiry-title-area">
          <div className="admin-inquiry-detail-badges">
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

            {isDeleted && (
              <span className="admin-inquiry-deleted-badge">삭제됨</span>
            )}
          </div>

          <h2>{inquiry.title}</h2>
        </div>

        <div className="admin-inquiry-info-bar">
          <div>
            <span>작성자</span>
            <strong>{getWriterDisplayName(inquiry)}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{formatDate(inquiry.createdAt)}</strong>
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
            <strong>{inquiry.viewCount ?? 0}</strong>
          </div>
        </div>

        <div className="admin-inquiry-content-section">
          <div className="admin-inquiry-content-title">문의 내용</div>

          <div className="admin-inquiry-detail-content">
            {inquiry.content || "등록된 문의 내용이 없습니다."}
          </div>
        </div>

        <div className="admin-inquiry-answer-section">
          <div className="admin-inquiry-content-title">관리자 답변</div>

          <div className="admin-answer-form-row">
            <label>답변 상태</label>

            <select
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value)}
              disabled={isDeleted}
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
                placeholder={
                  isDeleted
                    ? "삭제된 문의 게시글은 답변을 수정할 수 없습니다."
                    : "답변 내용을 입력해주세요."
                }
                value={answerContent}
                maxLength={2000}
                onChange={(e) => setAnswerContent(e.target.value)}
                disabled={isDeleted}
              />

              <span>{answerContent.length} / 2000</span>
            </div>
          </div>
        </div>

        <div className="admin-inquiry-detail-bottom">
          <button
            type="button"
            className="admin-inquiry-list-button"
            onClick={() => navigate("/admin/board/inquiry")}
          >
            목록으로
          </button>

          <button
            type="button"
            className="admin-inquiry-save-button"
            onClick={handleSaveAnswer}
            disabled={isSaving || isDeleted}
          >
            {isSaving ? "저장 중..." : "답변 저장"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminInquiryDetailPage;