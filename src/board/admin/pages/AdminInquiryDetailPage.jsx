import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  adminInquiryMockList,
  adminInquiryStatusMockList,
} from "../../mock/adminInquiryMockData";

import "../css/AdminInquiryDetailPage.css";

function AdminInquiryDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const inquiry = adminInquiryMockList.find(
    (item) => item.postId === Number(postId)
  );

  const [answerStatus, setAnswerStatus] = useState(
    inquiry?.inquiryStatusCode || "RECEIVED"
  );

  const [answerContent, setAnswerContent] = useState(
    inquiry?.answerContent || ""
  );

  const getCategoryClassName = (categoryCode) => {
    if (categoryCode === "SERVICE") return "category-service";
    if (categoryCode === "SYSTEM") return "category-system";
    if (categoryCode === "DATA") return "category-data";
    return "category-etc";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "CHECKING") return "status-checking";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  const handleSaveAnswer = () => {
    const requestData = {
      postId: inquiry.postId,
      answerStatus,
      answerContent,
    };

    console.log("관리자 문의 답변 저장 데이터:", requestData);
    alert("현재는 디자인 단계입니다. 답변 저장 API는 나중에 연결합니다.");
  };

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
              {inquiry.inquiryCategoryName}
            </span>

            <span
              className={`admin-inquiry-status-badge ${getStatusClassName(
                inquiry.inquiryStatusCode
              )}`}
            >
              {inquiry.inquiryStatusName}
            </span>
          </div>

          <h1>{inquiry.title}</h1>
          <p>사용자 문의 내용을 확인하고 관리자 답변을 등록할 수 있습니다.</p>
        </section>

        <section className="admin-inquiry-detail-meta">
          <div>
            <span>작성자</span>
            <strong>{inquiry.writerName}</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>{inquiry.createdAt}</strong>
          </div>

          <div>
            <span>문의 분류</span>
            <strong>{inquiry.inquiryCategoryName}</strong>
          </div>
        </section>

        <section className="admin-inquiry-content-section">
          <h2>문의 내용</h2>

          <p>
            {inquiry.content ||
              `안녕하세요.

시스템 이용 중 문제가 발생하여 문의드립니다.
현재 해당 기능을 실행하면 정상적으로 결과가 표시되지 않습니다.

확인 후 답변 부탁드립니다.`}
          </p>
        </section>

        <section className="admin-inquiry-file-section">
          <h2>첨부파일</h2>

          {inquiry.attachmentName ? (
            <div className="admin-inquiry-file-item">
              <span>📎 {inquiry.attachmentName}</span>
              <button type="button">다운로드</button>
            </div>
          ) : (
            <div className="admin-inquiry-file-empty">
              첨부파일이 없습니다.
            </div>
          )}
        </section>

        <section className="admin-inquiry-answer-section">
          <h2>관리자 답변</h2>

          <div className="admin-answer-form-row">
            <label>답변 상태</label>

            <select
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value)}
            >
              {adminInquiryStatusMockList
                .filter((status) => status.code !== "")
                .map((status) => (
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
          >
            답변 저장
          </button>
        </section>
      </div>
    </div>
  );
}

export default AdminInquiryDetailPage;