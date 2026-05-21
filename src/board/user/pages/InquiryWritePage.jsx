import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/InquiryWritePage.css";

import { inquiryCategoryMockList } from "../../mock/inquiryMockData";

function InquiryWritePage() {
  const navigate = useNavigate();

  const [inquiryCategoryCode, setInquiryCategoryCode] = useState("SYSTEM_USE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);
  };

  const handleSubmit = () => {
    const requestData = {
      inquiryCategoryCode,
      title,
      content,
      fileName,
    };

    console.log("문의 등록 데이터:", requestData);
    alert("현재는 디자인 단계입니다. 등록 API는 나중에 연결합니다.");

    navigate("/board/inquiry");
  };

  return (
    <div className="inquiry-write-page">
      <div className="inquiry-write-container">
        <section className="inquiry-write-header">
          <div className="inquiry-write-icon">?</div>

          <div>
            <h1>질문 / 문의 작성</h1>
            <p>
              시스템 이용, 데이터 조회, 오류 관련 문의 내용을 작성할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="inquiry-write-form-card">
          <div className="inquiry-form-row">
            <label>문의 분류</label>

            <select
              value={inquiryCategoryCode}
              onChange={(e) => setInquiryCategoryCode(e.target.value)}
            >
              {inquiryCategoryMockList
                .filter((category) => category.code !== "")
                .map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
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

          <div className="inquiry-file-section">
            <label>첨부파일</label>

            <div className="file-upload-box">
              <input
                id="inquiry-file"
                type="file"
                onChange={handleFileChange}
              />

              <label htmlFor="inquiry-file" className="file-upload-label">
                파일 선택
              </label>

              <span>{fileName || "선택된 파일이 없습니다."}</span>
            </div>

            <p>
              오류 화면 캡처나 관련 파일이 있다면 첨부해 주세요.
            </p>
          </div>

          <section className="inquiry-write-guide">
            <h2>문의 작성 안내</h2>

            <ul>
              <li>문의 분류를 정확히 선택하면 답변이 더 빨라질 수 있습니다.</li>
              <li>오류 문의는 발생 화면, 오류 메시지, 사용 환경을 함께 적어주세요.</li>
              <li>답변 완료 시 문의 상세 페이지에서 관리자 답변을 확인할 수 있습니다.</li>
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
            >
              등록
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InquiryWritePage;