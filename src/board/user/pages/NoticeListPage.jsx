import { importantNoticeMock, noticeCategoryMockList, noticeMockList, noticeSummaryMock, recentNoticeMockList } from "../../mock/boardMockData";
import BoardSearchBox from "../components/BoardSearchBox";
import "../css/NoticeListPage.css";

function NoticeListPage() {
    return (
        <div>
            <div className="notice-header">
                <div className="notice-header-icon"></div>
            </div>

            <div>
                <h1>공지사항</h1>
                <p>서비스 운영 및 데이터 관련 주요 공지를 확인할 수 있습니다.</p>
            </div>

            <div className="notice-layout">
                <main className="notice-main">
                    <section className="notice-search-section">
                        <input type="text" placeholder="공지사항 제목을 검색하세요"/>

                        <select>
                            {noticeCategoryMockList.map((category) => (
                                <option key={category.code} value={category.code}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <button>검색</button>
                    </section>
                    {/* 중요공지 카드 생성*/}
                    <section className="notice-important-section">
                        <div className="important-label">중요 공지</div>

                        <div className="important-content">
                            <div className="important-icon">📢</div>
                        
                            <div>
                                <h2>{importantNoticeMock.title}</h2>
                                <p>{importantNoticeMock.content}</p>

                                <div className="important-meta">
                                    <span>
                                        📅 {importantNoticeMock.startAt} ~ {importantNoticeMock.endAt}
                                    </span>
                                    <span>{importantNoticeMock.categoryName}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 공지사항 목록 */}
                    <section className="notice-list-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>제목</th>
                                    <th>분류</th>
                                    <th>작성일</th>
                                    <th>조회수</th>
                                </tr>
                            </thead>

                            <tbody>
                                {noticeMockList.map((notice) => (
                                    <tr key={notice.postId}>
                                        <td>{notice.isPinned ? "📌" : notice.postId}</td>
                                        <td>{notice.title}</td>
                                        <td>{notice.categoryName}</td>
                                        <td>{notice.createdAt}</td>
                                        <td>{notice.viewCount}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </section>
                </main>

                <aside className="notice-sidebar">
                    <section className="notice-summary-section">
                        <h3>공지사항 요약</h3>

                        <div>
                            <p>전체 공지</p>
                            <strong>{noticeSummaryMock.totalCount}건</strong>
                        </div>

                        <div>
                            <p>중요 공지</p>
                            <strong>{noticeSummaryMock.importantCount}건</strong>
                        </div>

                        <div>
                            <p>오늘 조회수</p>
                            <strong>{noticeSummaryMock.todayViewCount}</strong>
                        </div>
                    </section>

                    <section className="notice-recent-section">
                        <h3>최근 업데이트</h3>

                        {recentNoticeMockList.map((notice) => (
                            <div className="recent-item" key={notice.postId}>
                                <p>{notice.title}</p>
                                <span>{notice.createdAt}</span>
                            </div>
                        ))}
                    </section>
                </aside>
            </div>


        </div>

        
    );
}
export default NoticeListPage;