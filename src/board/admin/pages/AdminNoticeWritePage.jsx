import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNoticeApi } from "../../api/noticeApi";
import useAuthStore from "../../../commons/store/useAuthStore";
import "../css/AdminNoticeWritePage.css";

function AdminNoticeWritePage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);

  const [title, setTitle] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("PUBLIC");
  const [pinnedYn, setPinnedYn] = useState("N");
  const [content, setContent] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    const userId = userInfo?.userId ?? userInfo?.id;

    if (!userId) {
      alert("로그인한 사용자 정보를 찾을 수 없습니다.");
      return;
    }

    const requestData = {
      userId,
      title,
      content,
      visibilityStatus,
      pinnedYn,
    };

    try {
      setSubmitting(true);

      const data = await createNoticeApi(requestData);

      if (data.result === "success") {
        alert("공지사항이 등록되었습니다.");
        navigate("/admin/board/notice");
      }
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      alert("공지사항 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
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
          <label>공개 여부 *</label>

          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="visibilityStatus"
                value="PUBLIC"
                checked={visibilityStatus === "PUBLIC"}
                onChange={(e) => setVisibilityStatus(e.target.value)}
              />

              <span>공개</span>
            </label>

            <label className="radio-item">
              <input
                type="radio"
                name="visibilityStatus"
                value="PRIVATE"
                checked={visibilityStatus === "PRIVATE"}
                onChange={(e) => setVisibilityStatus(e.target.value)}
              />

              <span>비공개</span>
            </label>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminNoticeWritePage;