import { useParams, useNavigate } from "react-router-dom";
import { inquiryMockList } from "../../mock/inquiryMockData";
import "../css/InquiryDetailPage.css";

function InquiryDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const inquiry = inquiryMockList.find(
        (item) => item.postId === Number(postId)
    );

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

    const getStatusClassName = (statusCode) => {
        if (statusCode === "RECEIVED") return "status-received";
        if (statusCode === "CHECKING") return "status-checking";
        if (statusCode === "ANSWERED") return "status-answered";
        return "";
    };

    return (
        <div className="inquiry-detail-page">
            <div className="inquiry-detail-container">
                <section className="inquiry-detail-header">
                <div className="inquiry-detail-badge-area">
                    <span className="inquiry-category-badge">
                    {inquiry.inquiryCategoryName}
                    </span>

                    <span
                    className={`inquiry-status-badge ${getStatusClassName(
                        inquiry.inquiryStatusCode
                    )}`}
                    >
                    {inquiry.inquiryStatusName}
                    </span>
                </div>

                <h1>{inquiry.title}</h1>
                <p>등록된 문의 내용과 답변 상태를 확인할 수 있습니다.</p>
                </section>

                <section className="inquiry-detail-meta">
                <div>
                    <span>작성자</span>
                    <strong>{inquiry.writerName}</strong>
                </div>

                <div>
                    <span>작성일</span>
                    <strong>{inquiry.createdAt}</strong>
                </div>

                <div>
                    <span>조회수</span>
                    <strong>{inquiry.viewCount}</strong>
                </div>
                </section>

                <section className="inquiry-detail-content">
                <h2>문의 내용</h2>
                <p>{inquiry.content}</p>
                </section>

                <section className="inquiry-answer-section">
                <h2>관리자 답변</h2>

                {inquiry.inquiryStatusCode === "ANSWERED" ? (
                    <div className="answer-complete-box">
                    <div className="answer-meta">
                        <strong>관리자</strong>
                        <span>{inquiry.answeredAt || "2026-05-18"}</span>
                    </div>

                    <p>
                        {inquiry.answerContent ||
                        "문의하신 내용 확인 후 처리 완료되었습니다."}
                    </p>
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