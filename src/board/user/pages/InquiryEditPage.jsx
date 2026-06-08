import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getInquiryDetailApi,
  updateMyInquiryApi,
} from "../../api/inquiryApi";
import "../css/InquiryWritePage.css";

function InquiryEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [inquiryCategoryCode, setInquiryCategoryCode] = useState("SYSTEM_USE");
  const [visibilityStatus, setVisibilityStatus] = useState("PUBLIC");

  const [isOwner, setOwner] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const getInquiryDetail = async () => {
    try {
      setLoading(true);

      const data = await getInquiryDetailApi(postId);

      console.log("문의 수정용 상세 응답:", data);

      if (data.result === "success") {
        if (data.isOwner !== true) {
          alert("작성자 본인만 수정할 수 있습니다.");
          navigate(`/board/inquiry/${postId}`);
          return;
        }

        const detail = data.inquiryDetail;

        if (!detail) {
          alert("수정할 문의글을 찾을 수 없습니다.");
          navigate("/board/inquiry");
          return;
        }

        setOwner(data.isOwner === true);
        setTitle(detail.title ?? "");
        setContent(detail.content ?? "");
        setInquiryCategoryCode(detail.inquiryCategoryCode ?? "SYSTEM_USE");
        setVisibilityStatus(detail.visibilityStatus ?? "PUBLIC");
      }
    } catch (error) {
      console.error("문의 수정용 상세 조회 실패:", error);
      alert("수정할 문의 정보를 불러오는 중 오류가 발생했습니다.");
      navigate("/board/inquiry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    getInquiryDetail();
  }, [postId]);

  const handleSubmit = async () => {
    if (!isOwner) {
      alert("작성자 본인만 수정할 수 있습니다.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    const requestData = {
      title,
      content,
      visibilityStatus,
      inquiryCategoryCode,
    };

    try {
      setSubmitting(true);

      const data = await updateMyInquiryApi(postId, requestData);

      if (data.result === "success") {
        alert("문의글이 수정되었습니다.");
        navigate(`/board/inquiry/${postId}`);
      } else {
        alert("문의글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 수정 실패:", error);
      alert("수정 중 오류가 발생했습니다. 작성자 본인인지 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid px-4 py-3 inquiry-write-page">
        <section className="inquiry-write-header">
          <h1>문의 수정 정보를 불러오는 중입니다.</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3 inquiry-write-page">
      <section className="inquiry-write-header">
        <div className="inquiry-write-icon">?</div>

        <div>
          <h1>문의글 수정</h1>
          <p>등록한 문의 내용을 수정할 수 있습니다.</p>
        </div>
      </section>

      <section className="inquiry-write-form-card">
        <div className="inquiry-form-row">
          <label>문의 유형</label>

          <select
            value={inquiryCategoryCode}
            onChange={(e) => setInquiryCategoryCode(e.target.value)}
          >
            <option value="SYSTEM_USE">시스템 이용</option>
            <option value="DATA">데이터 문의</option>
            <option value="ERROR">오류 문의</option>
            <option value="ETC">기타 문의</option>
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
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="inquiry-form-row textarea-row">
          <label>문의 내용</label>

          <textarea
            placeholder="문의 내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="inquiry-write-button-area">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/board/inquiry/${postId}`)}
          >
            취소
          </button>

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default InquiryEditPage;