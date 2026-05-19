function TopTitle() {
    return (
        <>
            <div className="row align-items-center mb-3">
                <div className="col">
                    <div className="row">
                        <div className="col">
                            <h2 className="fw-bold mb-2">대시보드</h2>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-light text-secondary">
                                <i className="bi bi-arrow-clockwise me-2" />
                                새로고침
                            </button>
                        </div>
                    </div>
                    <div className="text-secondary" style={{ fontSize: "12px" }}>
                        서울 열린데이터광장 연동 현황과 주요 GIS 데이터 지표를 한눈에 확인할 수 있습니다.
                    </div>
                </div>
            </div>
        </>
    );
}

function CardForm({ color, title, content, children }) {
    return (
        <div className="col">
            <div className="card shadow-sm p-4">
                <div className="row">
                    <div
                        className={`col-2 rounded-circle bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
                        style={{ width: "56px", height: "56px" }}
                    >
                        {children}
                    </div>
                    <div className="col">
                        <div className="fw-bold" style={{ fontSize: "14px" }}>
                            {title}
                        </div>
                        <div className="fw-bold">{content}</div>
                        <div className="text-secondary" style={{ fontSize: "12px" }}>
                            연동 API 기준
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpenDataPlaceholder() {
    return (
        <>
            <div className="row mb-3">
                <div className="col">
                    <h5 className="fw-semibold mb-0">서울 열린데이터광장 데이터</h5>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm overflow-hidden">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="col-3 ps-3">데이터셋 명</th>
                                    <th className="col-4">설명</th>
                                    <th className="col-2 text-center">카테고리</th>
                                    <th className="col-2 text-center">갱신일</th>
                                    <th className="col-1 text-center">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={5} className="text-center text-secondary py-5">
                                        {/* TODO: 서울 열린데이터광장 API 연동 후 목록 표시 */}
                                        데이터를 불러오는 중입니다.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function DashboardPage() {
    return (
        <>
            <div className="container-fluid px-4 py-3">
                <TopTitle />

                <div className="row mb-3">
                    <CardForm color="primary" title="연동 데이터셋" content="-">
                        <i className="bi bi-database-fill fs-3" />
                    </CardForm>
                    <CardForm color="success" title="카테고리" content="-">
                        <i className="bi bi-tags-fill fs-3" />
                    </CardForm>
                    <CardForm color="warning" title="최근 갱신" content="-">
                        <i className="bi bi-calendar-event-fill fs-3" />
                    </CardForm>
                    <CardForm color="info" title="API 연동 상태" content="대기">
                        <i className="bi bi-plug-fill fs-3" />
                    </CardForm>
                </div>

                <OpenDataPlaceholder />
            </div>
        </>
    );
}

export default DashboardPage;
