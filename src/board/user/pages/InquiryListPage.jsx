import { Link } from "react-router-dom";
import { inquiryCategoryMockList, inquiryGuideMockList, inquiryMockList, inquiryStatusMockList, inquirySummaryMock, recentAnswerMockList } from "../../mock/inquiryMockData";
import "../css/InquiryListPage.css";

function InquiryListPage() {
    const getStatusClassName = (statusCode) => {
        if (statusCode === "RECEIVED") return "status-received";
        if (statusCode === "CHECKING") return "status-checking";
        if (statusCode === "ANSWERED") return "status-answered";
        return "";
    };

    return (
        <div>
            <div className="Inquiry-header">
                <div className="Inquiry-header-icon"></div>
            </div>

            <div>
                <h1>질문 / 문의 게시판</h1>
                <p>시스템 이용, 데이터 조회, 오류 관련 문의를 등록하고 답변 상태를 확인할 수 있습니다.</p>
            </div>

            <div className="Inquiry-layout">
                <main className="Inquiry-main">
                    {/* 검색창 구간 */}
                    <section className="Inquiry-search-section">
                        <input type="text" placeholder="공지사항 제목을 검색하세요"/>

                        <select>
                            {inquiryCategoryMockList.map((category) => (
                                <option key={category.code} value={category.code}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select>
                            {inquiryStatusMockList.map((status) => (
                                <option key={status.code} value={status.code}>
                                    {status.name}
                                </option>
                            ))}
                        </select>

                        <button>검색</button>
                    </section>
                    {/* 게시글 목록 리스트 */}
                    <section className="Inquiry-list-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>제목</th>
                                    <th>문의 분류</th>
                                    <th>상태</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>

                            <tbody>
                                {inquiryMockList.map((inquiry) => (
                                    <tr key={inquiry.postId}>
                                        <td>{inquiry.isPinned ? "📌" : inquiry.postId}</td>
                                        <td>
                                            <Link to={`/board/inquiry/${inquiry.postId}`}>
                                                {inquiry.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {inquiry.inquiryCategoryName}
                                            </span>
                                            </td>

                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClassName(
                                                    inquiry.inquiryStatusCode
                                                )}`}
                                            >
                                                {inquiry.inquiryStatusName}
                                            </span>
                                        </td>

                                        <td>{inquiry.createdAt}</td>

                                        <td>
                                            <Link 
                                                className="detail-link"
                                                to={`/board/inquiry/${inquiry.postId}`}
                                            >
                                                ›
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button type="button">«</button>
                            <button type="button">‹</button>
                            <button type="button" className="active">
                                1
                            </button>
                            <button type="button">2</button>
                            <button type="button">3</button>
                            <button type="button">4</button>
                            <button type="button">5</button>
                            <button type="button">›</button>
                            <button type="button">»</button>
                        </div>
                    </section>
                    
                    {/* 가이드라인 */}
                    <section className="Inquiry-guide-section">
                        <div className="guide-left">
                            <div className="guide-icon">?</div>
                            <div>
                                <h3>문의 전 확인해 주세요</h3>
                                <p>자주 묻는 질문(FAQ)을 확인하시면 빠르게 해결할 수 있습니다</p>
                                <button type="button">FAQ 바로가기</button>
                            </div>
                        </div>

                        <div className="guide-right">
                            <h3>문의 작성 가이드</h3>

                            {inquiryGuideMockList.map((guide, index) => (
                                <p key={index}>✓ {guide}</p>
                            ))}
                        </div>
                    </section>
                </main>
                
                <aside className="Inquiry-sidebar">
                     {/* 문의 작성버튼 */}
                    <section className="inquiry-sidebar">
                        <Link to="/board/inquiry/write">
                            <button type="button">✎ 문의 작성</button>
                        </Link>
                    </section>

                    {/* 문의 현황 표시 */}
                    <section className="Inquiry-summary-section">
                        <h3>문의 현황</h3>

                        <div className="summary-item">
                            <div className="summary-icon bule">📄</div>
                            <div>
                                <p>접수</p>
                                <strong>{inquirySummaryMock.receivedCount}건</strong>
                            </div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-icon orange">⏱</div>
                            <div>
                                <p>확인 중</p>
                                <strong>{inquirySummaryMock.checkingCount}건</strong>
                            </div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-icon green">✓</div>
                            <div>
                                <p>답변 완료</p>
                                <strong>{inquirySummaryMock.answeredCount}건</strong>
                            </div>
                        </div>
                    </section>
                    {/* 최근답변 게시판 */}
                    <section className="Inquiry-answer-section">
                        <h3>최근 답변</h3>

                        {recentAnswerMockList.map((answer) => (
                            <div className="recent-answer-item" key={answer.postId}>
                                <div>
                                    <span className="staus-badge status-answered">
                                        {answer.statusName}
                                    </span>

                                    <p>{answer.title}</p>
                                    <small>{answer.answerPreview}</small>
                                </div>

                                <span>{answer.answeredAt}</span>
                            </div>
                        ))}

                        <button type="button" className="all-answer-button">
                            전체 답변 보기 ›
                        </button>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default InquiryListPage;