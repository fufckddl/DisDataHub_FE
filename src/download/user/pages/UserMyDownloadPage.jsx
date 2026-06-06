import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopTitle from "../../components/TopTitle";
import "../../style/myDownload.css";

const DOWNLOAD_HISTORY = [
    {
        id: 1,
        datasetId: 101,
        title: "서울시 CCTV 위치 데이터",
        provider: "서울특별시",
        category: "안전",
        format: "CSV",
        size: "12.4MB",
        downloadedAt: "2026-06-05 14:22",
        status: "완료",
    },
    {
        id: 2,
        datasetId: 102,
        title: "부산 해양 수질 관측 데이터",
        provider: "부산광역시",
        category: "해양",
        format: "GeoJSON",
        size: "28.8MB",
        downloadedAt: "2026-06-04 10:11",
        status: "완료",
    },
    {
        id: 3,
        datasetId: 103,
        title: "전국 항만 시설 공간 데이터",
        provider: "해양수산부",
        category: "시설",
        format: "SHP",
        size: "86.1MB",
        downloadedAt: "2026-06-02 17:40",
        status: "변환 가능",
    },
    {
        id: 4,
        datasetId: 104,
        title: "제주 연안 침식 위험 구역",
        provider: "제주특별자치도",
        category: "환경",
        format: "KML",
        size: "9.7MB",
        downloadedAt: "2026-05-30 09:18",
        status: "기간 만료 예정",
    },
];

const FAVORITE_DATASETS = [
    { id: 201, title: "인천 항로 안전 표지 데이터", provider: "인천광역시", format: "GeoJSON" },
    { id: 202, title: "남해 해상 풍속 관측 데이터", provider: "기상청", format: "CSV" },
    { id: 203, title: "전국 해양 보호구역 경계", provider: "해양수산부", format: "SHP" },
];

const SUMMARY_ITEMS = [
    { label: "다운로드 이력", value: "18건", caption: "최근 다운로드 기준", icon: "bi-download", color: "primary" },
    { label: "최근 30일", value: "7건", caption: "전월 대비 2건 증가", icon: "bi-calendar-check", color: "success" },
    { label: "관심 데이터", value: "3건", caption: "나중에 볼 데이터", icon: "bi-star", color: "warning" },
    { label: "재다운로드 가능", value: "15건", caption: "만료 전 파일 기준", icon: "bi-arrow-repeat", color: "info" },
];

function getStatusClass(status) {
    if (status === "완료") return "success";
    if (status === "변환 가능") return "primary";
    return "warning";
}

function UserMyDownloadPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("history");
    const [keyword, setKeyword] = useState("");

    const filteredHistory = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        if (!normalizedKeyword) {
            return DOWNLOAD_HISTORY;
        }

        return DOWNLOAD_HISTORY.filter((item) => (
            item.title.toLowerCase().includes(normalizedKeyword)
            || item.provider.toLowerCase().includes(normalizedKeyword)
            || item.format.toLowerCase().includes(normalizedKeyword)
        ));
    }, [keyword]);

    return (
        <div className="container-fluid px-4 py-3 my-download-page">
            <TopTitle
                title="나의 다운로드"
                subTitle="다운로드 이력과 관심 데이터를 한곳에서 확인할 수 있습니다."
                showGuide={false}
            />

            <div className="my-download-header-actions">
                <button type="button" className="btn btn-light border fw-bold" onClick={() => navigate("/download/user/main")}>
                    <i className="bi bi-chevron-left me-2"></i>
                    다운로드 목록
                </button>
            </div>

            <div className="row g-3 mb-3">
                {SUMMARY_ITEMS.map((item) => (
                    <div className="col-12 col-md-6 col-xl-3" key={item.label}>
                        <div className="card shadow-sm my-download-summary-card">
                            <div className={`my-download-summary-icon text-${item.color} bg-${item.color}-subtle`}>
                                <i className={`bi ${item.icon}`}></i>
                            </div>
                            <div>
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                                <small>{item.caption}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-12 col-xl-8">
                    <div className="card shadow-sm my-download-card">
                        <div className="my-download-card-head">
                            <div>
                                <h5>다운로드 관리</h5>
                                <p>최근 다운로드한 데이터와 재다운로드 상태를 확인합니다.</p>
                            </div>
                            <div className="my-download-tabs" aria-label="나의 다운로드 보기">
                                <button
                                    type="button"
                                    className={activeTab === "history" ? "active" : ""}
                                    onClick={() => setActiveTab("history")}
                                >
                                    이력
                                </button>
                                <button
                                    type="button"
                                    className={activeTab === "favorites" ? "active" : ""}
                                    onClick={() => setActiveTab("favorites")}
                                >
                                    관심
                                </button>
                            </div>
                        </div>

                        <div className="my-download-filter-bar">
                            <div className="my-download-search">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    value={keyword}
                                    placeholder="데이터명, 제공기관, 형식 검색"
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>
                            <select className="form-select form-select-sm" aria-label="다운로드 상태 선택">
                                <option>전체 상태</option>
                                <option>완료</option>
                                <option>변환 가능</option>
                                <option>기간 만료 예정</option>
                            </select>
                            <select className="form-select form-select-sm" aria-label="다운로드 기간 선택">
                                <option>최근 30일</option>
                                <option>최근 3개월</option>
                                <option>전체 기간</option>
                            </select>
                        </div>

                        {activeTab === "history" ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle my-download-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>데이터셋명</th>
                                            <th className="text-center">제공기관</th>
                                            <th className="text-center">형식</th>
                                            <th className="text-center">크기</th>
                                            <th className="text-center">다운로드일</th>
                                            <th className="text-center">상태</th>
                                            <th className="text-center">액션</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="my-download-title-button"
                                                        onClick={() => navigate(`/download/user/${item.datasetId}`)}
                                                    >
                                                        {item.title}
                                                    </button>
                                                    <div className="my-download-table-sub">{item.category}</div>
                                                </td>
                                                <td className="text-center sm-text text-secondary">{item.provider}</td>
                                                <td className="text-center">
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                        {item.format}
                                                    </span>
                                                </td>
                                                <td className="text-center sm-text text-secondary">{item.size}</td>
                                                <td className="text-center sm-text text-secondary">{item.downloadedAt}</td>
                                                <td className="text-center">
                                                    <span className={`my-download-status ${getStatusClass(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" className="btn btn-light btn-sm border fw-bold">
                                                        재다운로드
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="my-download-favorite-list">
                                {FAVORITE_DATASETS.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        className="my-download-favorite-row"
                                        onClick={() => navigate(`/download/user/${item.id}`)}
                                    >
                                        <span>
                                            <strong>{item.title}</strong>
                                            <small>{item.provider}</small>
                                        </span>
                                        <em>{item.format}</em>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="card shadow-sm my-download-card my-download-side-card">
                        <div className="my-download-card-head compact">
                            <div>
                                <h5>관심 데이터</h5>
                                <p>나중에 구현할 관심 데이터 영역입니다.</p>
                            </div>
                        </div>

                        <div className="my-download-side-list">
                            {FAVORITE_DATASETS.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => navigate(`/download/user/${item.id}`)}
                                >
                                    <span>{item.title}</span>
                                    <small>{item.provider}</small>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card shadow-sm my-download-card my-download-side-card mt-3">
                        <div className="my-download-card-head compact">
                            <div>
                                <h5>다운로드 안내</h5>
                                <p>UI 확인용 고정 안내입니다.</p>
                            </div>
                        </div>

                        <div className="my-download-guide-list">
                            <div>
                                <i className="bi bi-check2-circle"></i>
                                <span>다운로드 이력은 로그인 사용자 기준으로 연결 예정입니다.</span>
                            </div>
                            <div>
                                <i className="bi bi-check2-circle"></i>
                                <span>관심 데이터는 별도 테이블이 생기면 같은 화면에서 표시할 수 있습니다.</span>
                            </div>
                            <div>
                                <i className="bi bi-check2-circle"></i>
                                <span>재다운로드 버튼은 나중에 실제 파일 다운로드 API와 연결하면 됩니다.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserMyDownloadPage;
