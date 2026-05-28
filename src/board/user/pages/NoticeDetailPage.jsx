// src/board/user/pages/NoticeDetailPage.jsx

import { useNavigate } from "react-router-dom";
import "../css/NoticeDetailPage.css";

function NoticeDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="notice-detail-page">
      <div className="notice-detail-container">
        {/* 공지사항 제목, 분류, 중요 공지 뱃지 */}
        <section className="notice-detail-header">
          <div>
            <div className="notice-detail-badge-area">
              <span className="notice-detail-category">운영공지</span>
              <span className="notice-detail-pin">중요 공지</span>
            </div>

            <h1>시스템 점검 안내</h1>
            <p>서비스 운영 및 데이터 관련 주요 공지사항입니다.</p>
          </div>
        </section>

        {/* 작성자, 작성일, 조회수 */}
        <section className="notice-detail-meta">
          <div>
            <span>작성자</span>
            <strong>관리자</strong>
          </div>

          <div>
            <span>작성일</span>
            <strong>2026-05-12</strong>
          </div>

          <div>
            <span>조회수</span>
            <strong>245</strong>
          </div>
        </section>

        {/* 실제 공지 본문 내용 */}
        <section className="notice-detail-content">
          <h2>공지 내용</h2>
          <p>
            보다 안정적인 서비스 제공을 위해 시스템 점검을 진행할 예정입니다.
            점검 시간 동안 일부 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>

        {/* 첨부파일 목록, 이미지/파일 다운로드 영역 */}
        <section className="notice-detail-file-section">
          <h2>첨부파일</h2>

          <div className="notice-file-item">📎 시스템_점검_안내.pdf</div>
        </section>

        {/* 목록으로, 이전글, 다음글, 수정/삭제 버튼 자리 */}
        <section className="notice-detail-button-area">
          <button type="button">이전글</button>

          <button type="button" onClick={() => navigate("/board/notice")}>
            목록으로
          </button>

          <button type="button">다음글</button>
        </section>
      </div>
    </div>
  );
}

export default NoticeDetailPage;