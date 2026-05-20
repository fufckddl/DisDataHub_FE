import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  adminNoticeCategoryMockList,
  adminNoticeVisibilityMockList,
} from "../../mock/adminNoticeMockData";

import "../css/AdminNoticeWritePage.css";

function AdminNoticeWritePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [categoryCode, setCategoryCode] = useState("SYSTEM");
  const [visibilityStatus, setVisibilityStatus] = useState("PUBLIC");
  const [pinnedYn, setPinnedYn] = useState("N");
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
      title,
      categoryCode,
      visibilityStatus,
      pinnedYn,
      content,
      fileName,
    };

    console.log("공지사항 등록 데이터:", requestData);
    alert("현재는 디자인 단계입니다. 등록 API는 나중에 연결합니다.");

    navigate("/admin/board/notice");
  };

  return (
    <div className="admin-notice-write-page">
      <section className="admin-notice-write-header">
        <div>
          <h1>공지사항 작성</h1>
          <p>새 공지사항을 등록할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-notice-write-form-card">
        <div className="admin-notice-form-row">
          <label>제목 *</label>

          <div className="input-with-count">
            <input
              type="text"
              placeholder="제목을 입력하세요."
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />

            <span>{title.length} / 100자</span>
          </div>
        </div>

        <div className="admin-notice-form-row">
          <label>공지 분류 *</label>

          <select
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          >
            {adminNoticeCategoryMockList
              .filter((category) => category.code !== "")
              .map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="admin-notice-form-row">
          <label>공개 여부 *</label>

          <div className="radio-group">
            {adminNoticeVisibilityMockList
              .filter((status) => status.code !== "")
              .map((status) => (
                <label key={status.code} className="radio-item">
                  <input
                    type="radio"
                    name="visibilityStatus"
                    value={status.code}
                    checked={visibilityStatus === status.code}
                    onChange={(e) => setVisibilityStatus(e.target.value)}
                  />

                  <span>{status.name}</span>
                </label>
              ))}
          </div>
        </div>

        <div className="admin-notice-form-row">
          <label>상단 고정 여부</label>

          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="pinnedYn"
                value="Y"
                checked={pinnedYn === "Y"}
                onChange={(e) => setPinnedYn(e.target.value)}
              />

              <span>고정</span>
            </label>

            <label className="radio-item">
              <input
                type="radio"
                name="pinnedYn"
                value="N"
                checked={pinnedYn === "N"}
                onChange={(e) => setPinnedYn(e.target.value)}
              />

              <span>고정하지 않음</span>
            </label>
          </div>
        </div>

        <div className="admin-notice-form-row textarea-row">
          <label>내용 *</label>

          <div className="editor-box">
            <div className="editor-toolbar">
              <select>
                <option>본문</option>
                <option>제목</option>
                <option>소제목</option>
              </select>

              <button type="button">B</button>
              <button type="button">I</button>
              <button type="button">U</button>
              <button type="button">≡</button>
              <button type="button">🔗</button>
              <button type="button">🖼</button>
            </div>

            <textarea
              placeholder="내용을 입력하세요."
              value={content}
              maxLength={5000}
              onChange={(e) => setContent(e.target.value)}
            />

            <span className="content-count">{content.length} / 5000자</span>
          </div>
        </div>

        <div className="admin-notice-file-section">
          <label>첨부파일</label>

          <div className="file-upload-area">
            <input
              id="admin-notice-file"
              type="file"
              onChange={handleFileChange}
            />

            <label htmlFor="admin-notice-file" className="file-upload-label">
              <div className="upload-icon">☁</div>
              <strong>파일을 드래그하거나 클릭하여 첨부하세요.</strong>
              <p>최대 10MB 이하, 5개까지 첨부 가능합니다.</p>
            </label>

            {fileName && (
              <div className="selected-file-item">
                <span>📎 {fileName}</span>
                <button type="button" onClick={() => setFileName("")}>
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-notice-write-button-area">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/admin/board/notice")}
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
  );
}

export default AdminNoticeWritePage;