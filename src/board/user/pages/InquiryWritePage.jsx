import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInquiryApi } from "../../api/inquiryApi";
import "../css/InquiryWritePage.css";

function InquiryWritePage() {
  const navigate = useNavigate();

  const [inquiryCategoryCode, setInquiryCategoryCode] = useState("SYSTEM_USE");
  const [visibilityStatus, setVisibilityStatus] = useState("PUBLIC");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const inquiryCategoryList = [
    { code: "SYSTEM_USE", name: "시스템 이용" },
    { code: "DATA", name: "데이터 문의" },
    { code: "ERROR", name: "오류 문의" },
    { code: "ETC", name: "기타 문의" },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("문의 제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    const userId = Number(localStorage.getItem("qwer")) || 1;

    const requestData = {
      userId,
      title,
      content,
      visibilityStatus,
      inquiryCategoryCode,
    };

    try {
      setSubmitting(true);

      const data = await createInquiryApi(requestData);

      if (data.result === "success") {
        alert("문의가 등록되었습니다.");
        navigate("/board/inquiry");
      } else {
        alert("문의 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 등록 실패:", error);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-3 inquiry-write-page">
      <div className="inquiry-write-container">
        <section className="inquiry-write-header">

          <div>
            <h1>문의 작성</h1>
            <p>
              시스템 이용, 데이터 조회, 오류 관련 문의 내용을 작성할 수
              있습니다.
            </p>
          </div>
        </section>

        <section className="inquiry-write-form-card">
          <section className="inquiry-form-section">
            <div className="inquiry-form-row">
              <label>문의 분류</label>

              <select
                value={inquiryCategoryCode}
                onChange={(e) => setInquiryCategoryCode(e.target.value)}
              >
                {inquiryCategoryList.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="inquiry-form-row">
              <label>공개 여부</label>

              <select
                value={visibilityStatus}
                onChange={(e) => setVisibilityStatus(e.target.value)}
              >
                <option value="PUBLIC">공개</option>
                <option value="PRIVATE">비공개</option>
              </select>
            </div>

            <div className="inquiry-form-row">
              <label>제목</label>

              <input
                type="text"
                placeholder="문의 제목을 입력해주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="inquiry-form-row textarea-row">
              <label>내용</label>

              <textarea
                placeholder="문의 내용을 자세히 입력해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </section>

          <section className="inquiry-write-guide">
            <h2>문의 작성 안내</h2>

            <ul>
              <li>문의 분류를 정확히 선택하면 답변이 더 빨라질 수 있습니다.</li>
              <li>
                오류 문의는 발생 화면, 오류 메시지, 사용 환경을 함께
                적어주세요.
              </li>
              <li>
                답변 완료 시 문의 상세 페이지에서 관리자 답변을 확인할 수
                있습니다.
              </li>
            </ul>
          </section>

          <div className="inquiry-write-button-area">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/board/inquiry")}
            >
              취소
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InquiryWritePage;