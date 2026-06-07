import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../commons/auth/useAuthStore";
import { getMyDownloadHistoryApi } from "../../api/userDownloadApi";
import TopTitle from "../../components/TopTitle";
import "../../style/myDownload.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const FORMAT_OPTIONS = ["전체", "CSV", "GeoJSON", "SHP", "KML"];
const FORMAT_COLORS = ["#4f6df5", "#52b46f", "#7758d9", "#f0b436", "#38bdf8", "#94a3b8"];
const PAGE_SIZE = 5;

function formatNumber(value) {
    return Number(value ?? 0).toLocaleString();
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    const date = Array.isArray(value)
        ? new Date(value[0], value[1] - 1, value[2], value[3] ?? 0, value[4] ?? 0)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatDate(value) {
    const dateTime = formatDateTime(value);
    return dateTime === "-" ? "-" : dateTime.slice(0, 10);
}

function formatFileSize(value) {
    const bytes = Number(value ?? 0);
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "-";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatFileFormatLabel(value) {
    const normalized = String(value ?? "").replace(".", "").toUpperCase();

    if (normalized === "GEOJSON") {
        return "GeoJSON";
    }

    return normalized || "-";
}

function mapHistoryItem(item) {
    return {
        id: item.downloadId,
        datasetId: item.datasetId,
        title: item.title ?? "-",
        category: item.categoryNameKo ?? item.provider ?? "-",
        format: formatFileFormatLabel(item.downloadFormat),
        size: formatFileSize(item.fileSize),
        downloadedAt: formatDateTime(item.downloadedAt),
    };
}

function mapDatasetItem(item) {
    return {
        id: item.datasetId,
        title: item.title ?? "-",
        category: item.categoryNameKo ?? item.provider ?? "-",
        format: formatFileFormatLabel(item.fileExtension),
        date: formatDate(item.createdAt),
    };
}

function mapFormatStats(items) {
    const totalCount = items.reduce((sum, item) => sum + Number(item.count ?? 0), 0);

    return items.map((item, index) => {
        const count = Number(item.count ?? 0);
        return {
            label: formatFileFormatLabel(item.format),
            count,
            percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
            color: FORMAT_COLORS[index % FORMAT_COLORS.length],
        };
    });
}

function buildPaginationItems(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    if (currentPage <= 2) {
        pages.add(3);
    }
    if (currentPage >= totalPages - 1) {
        pages.add(totalPages - 2);
    }

    const sortedPages = Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    return sortedPages.reduce((items, page, index) => {
        if (index > 0 && page - sortedPages[index - 1] > 1) {
            items.push(`ellipsis-${sortedPages[index - 1]}-${page}`);
        }
        items.push(page);
        return items;
    }, []);
}

function UserMyDownloadPage() {
    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);
    const redirectedRef = useRef(false);
    const [activeTab, setActiveTab] = useState("history");
    const [keyword, setKeyword] = useState("");
    const [appliedKeyword, setAppliedKeyword] = useState("");
    const [period, setPeriod] = useState("all");
    const [format, setFormat] = useState("전체");
    const [sort, setSort] = useState("latest");
    const [historyPage, setHistoryPage] = useState(1);
    const [favoritePage, setFavoritePage] = useState(1);
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const hasToken = Boolean(localStorage.getItem("token"));
        if (!hasToken && !userInfo && !redirectedRef.current) {
            redirectedRef.current = true;
            const wantsLogin = confirm("로그인이 필요한 페이지입니다 로그인 하시겠습니까?");
            navigate(wantsLogin ? "/login" : "/download/user/main", { replace: true });
        }
    }, [navigate, userInfo]);

    const hasAccess = Boolean(userInfo || localStorage.getItem("token"));
    const currentPage = activeTab === "history" ? historyPage : favoritePage;

    const resetPages = () => {
        setHistoryPage(1);
        setFavoritePage(1);
    };

    const fetchMyDownloadHistory = useCallback(async () => {
        if (!hasAccess) {
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const response = await getMyDownloadHistoryApi({
                keyword: appliedKeyword.trim() || undefined,
                period,
                fileFormat: format === "전체" ? undefined : format,
                sort,
                page: currentPage,
                size: PAGE_SIZE,
            });

            setPageData(response.data ?? {});
        } catch (error) {
            if (error?.response?.status === 401) {
                const wantsLogin = confirm("로그인이 필요한 페이지입니다 로그인 하시겠습니까?");
                navigate(wantsLogin ? "/login" : "/download/user/main", { replace: true });
                return;
            }

            setPageData(null);
            setErrorMessage("나의 다운로드 정보를 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    }, [appliedKeyword, currentPage, format, hasAccess, navigate, period, sort]);

    useEffect(() => {
        const timerId = window.setTimeout(fetchMyDownloadHistory, 0);
        return () => window.clearTimeout(timerId);
    }, [fetchMyDownloadHistory]);

    const historyList = useMemo(
        () => (pageData?.historyList ?? []).map(mapHistoryItem),
        [pageData]
    );
    const favoriteList = useMemo(
        () => (pageData?.favoriteList ?? []).map(mapDatasetItem),
        [pageData]
    );
    const recentList = useMemo(
        () => (pageData?.recentList ?? []).map(mapDatasetItem),
        [pageData]
    );
    const formatStats = useMemo(
        () => mapFormatStats(pageData?.formatStats ?? []),
        [pageData]
    );

    const summary = pageData?.summary ?? {};
    const latestDownload = summary.latestDownload ?? {};
    const historyTotalCount = pageData?.historyTotalCount ?? 0;
    const favoriteTotalCount = pageData?.favoriteTotalCount ?? 0;

    const summaryItems = [
        {
            label: "총 다운로드 수",
            value: `${formatNumber(summary.totalDownloadCount)}건`,
            caption: "누적 다운로드 기준",
            icon: "bi-download",
            color: "primary",
        },
        {
            label: "관심 데이터 수",
            value: `${formatNumber(summary.favoriteCount)}건`,
            caption: "저장한 관심 데이터",
            icon: "bi-heart",
            color: "success",
        },
        {
            label: "최근 다운로드",
            value: latestDownload.downloadedAt ? formatDate(latestDownload.downloadedAt) : "-",
            caption: latestDownload.title ?? "다운로드 내역 없음",
            icon: "bi-calendar-check",
            color: "warning",
            onClick: latestDownload.datasetId
                ? () => navigate(`/download/user/${latestDownload.datasetId}`)
                : undefined,
        },
        {
            label: "자주 사용하는 형식",
            value: formatFileFormatLabel(summary.mostUsedFormat),
            caption: "최근 30일 기준",
            icon: "bi-file-earmark",
            color: "secondary",
        },
    ];

    const handleReset = () => {
        setKeyword("");
        setAppliedKeyword("");
        setPeriod("all");
        setFormat("전체");
        setSort("latest");
        resetPages();
    };

    const handleSearch = () => {
        resetPages();
        setAppliedKeyword(keyword);
    };

    const handleSortChange = (value) => {
        resetPages();
        setSort(value);
    };

    if (!hasAccess) {
        return null;
    }

    return (
        <div className="container-fluid px-4 py-3 my-download-page">
            <TopTitle
                title="나의 다운로드"
                subTitle="다운로드 내역과 관심 데이터를 한곳에서 확인할 수 있습니다."
                showGuide={false}
            />

            <div className="row mb-3">
                {summaryItems.map((item) => (
                    <MyDownloadSummaryCard key={item.label} item={item} />
                ))}
            </div>

            {errorMessage && (
                <div className="alert alert-danger py-2" role="alert">
                    {errorMessage}
                </div>
            )}

            <div className="row g-3 my-download-content-row">
                <div className="col-12 col-xl-9">
                    <div className="card shadow-sm my-download-card">
                        <div className="my-download-tabs" aria-label="나의 다운로드 보기">
                            <button
                                type="button"
                                className={activeTab === "history" ? "active" : ""}
                                onClick={() => setActiveTab("history")}
                            >
                                다운로드 내역
                            </button>
                            <button
                                type="button"
                                className={activeTab === "favorites" ? "active" : ""}
                                onClick={() => setActiveTab("favorites")}
                            >
                                관심 데이터
                            </button>
                        </div>

                        <div className="my-download-filter-bar">
                            <div className="my-download-field search">
                                <label>검색</label>
                                <div className="my-download-search">
                                    <input
                                        type="text"
                                        value={keyword}
                                        placeholder="데이터명 검색"
                                        onChange={(event) => setKeyword(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <i className="bi bi-search"></i>
                                </div>
                            </div>
                            <div className="my-download-field">
                                <label>기간</label>
                                <select
                                    className="form-select"
                                    value={period}
                                    onChange={(event) => {
                                        resetPages();
                                        setPeriod(event.target.value);
                                    }}
                                >
                                    <option value="all">전체 기간</option>
                                    <option value="30">최근 30일</option>
                                    <option value="90">최근 3개월</option>
                                </select>
                            </div>
                            <div className="my-download-field">
                                <label>파일 형식</label>
                                <select
                                    className="form-select"
                                    value={format}
                                    onChange={(event) => {
                                        resetPages();
                                        setFormat(event.target.value);
                                    }}
                                >
                                    {FORMAT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="my-download-filter-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary fw-bold"
                                    onClick={handleSearch}
                                >
                                    <i className="bi bi-search me-2"></i>
                                    검색
                                </button>
                                <button type="button" className="btn btn-light border fw-bold" onClick={handleReset}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    초기화
                                </button>
                            </div>
                        </div>

                        {activeTab === "history" ? (
                            <DownloadHistoryTable
                                items={historyList}
                                totalCount={historyTotalCount}
                                loading={loading}
                                navigate={navigate}
                                sort={sort}
                                onSortChange={handleSortChange}
                                currentPage={historyPage}
                                pageSize={PAGE_SIZE}
                                onPageChange={setHistoryPage}
                            />
                        ) : (
                            <FavoriteDatasetTable
                                items={favoriteList}
                                totalCount={favoriteTotalCount}
                                loading={loading}
                                navigate={navigate}
                                sort={sort}
                                onSortChange={handleSortChange}
                                currentPage={favoritePage}
                                pageSize={PAGE_SIZE}
                                onPageChange={setFavoritePage}
                            />
                        )}
                    </div>
                </div>

                <div className="col-12 col-xl-3 my-download-side-column">
                    <SideCard title="최근 본 데이터" actionLabel="전체 보기" className="my-download-recent-card">
                        <div className="my-download-recent-list">
                            {recentList.length > 0 ? recentList.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => navigate(`/download/user/${item.id}`)}
                                >
                                    <i className="bi bi-clock-history"></i>
                                    <span>{item.title}</span>
                                    <small>{item.date}</small>
                                </button>
                            )) : (
                                <div className="my-download-empty-side">최근 본 데이터가 없습니다.</div>
                            )}
                        </div>
                    </SideCard>

                    <SideCard title="다운로드 형식 통계" caption="최근 30일" className="mt-3">
                        <DownloadFormatChart stats={formatStats} />
                    </SideCard>
                </div>
            </div>
        </div>
    );
}

function MyDownloadSummaryCard({ item }) {
    const isClickable = typeof item.onClick === "function";

    return (
        <div className="col">
            <div
                className={`card shadow-sm p-4 h-100 my-download-summary-card ${isClickable ? "my-download-summary-card-clickable" : ""}`}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={item.onClick}
                onKeyDown={(event) => {
                    if (isClickable && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        item.onClick();
                    }
                }}
            >
                <div className="row flex-nowrap align-items-start">
                    <div
                        className={`col-2 rounded-circle bg-${item.color}-subtle text-${item.color} d-flex align-items-center justify-content-center my-download-summary-icon`}
                    >
                        <i className={`bi ${item.icon} fs-3`}></i>
                    </div>
                    <div className="col" style={{ minWidth: 0 }}>
                        <div className="fw-bold my-download-summary-title">{item.label}</div>
                        <div className="fw-bold my-download-summary-value">{item.value}</div>
                        <div className="text-secondary fw-bold my-download-summary-caption" title={item.caption}>{item.caption}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ListSectionHead({ title, count, sort, onSortChange }) {
    return (
        <div className="my-download-list-head">
            <div>
                <h5>{title}</h5>
                <span>전체 {formatNumber(count)}건</span>
            </div>
            <select
                className="form-select"
                aria-label="정렬 선택"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
            >
                <option value="latest">최신순</option>
                <option value="title">제목순</option>
            </select>
        </div>
    );
}

function DownloadHistoryTable({
    items,
    totalCount,
    loading,
    navigate,
    sort,
    onSortChange,
    currentPage,
    pageSize,
    onPageChange,
}) {
    return (
        <div className="my-download-list-card">
            <ListSectionHead
                title="다운로드 내역"
                count={totalCount}
                sort={sort}
                onSortChange={onSortChange}
            />
            <div className="table-responsive">
                <table className="table table-hover align-middle my-download-table">
                    <thead className="table-light">
                        <tr>
                            <th>데이터명</th>
                            <th className="text-center">형식</th>
                            <th className="text-center">다운로드일</th>
                            <th className="text-center">파일 크기</th>
                            <th className="text-center">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="text-center text-secondary py-4">불러오는 중입니다.</td>
                            </tr>
                        )}
                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-secondary py-4">다운로드 내역이 없습니다.</td>
                            </tr>
                        )}
                        {!loading && items.map((item) => (
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
                                <td className="text-center">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                        {item.format}
                                    </span>
                                </td>
                                <td className="text-center sm-text text-secondary">{item.downloadedAt}</td>
                                <td className="text-center sm-text text-secondary">{item.size}</td>
                                <td className="text-center">
                                    <div className="my-download-action-group">
                                        <button type="button" className="btn btn-light btn-sm border fw-bold">
                                            <i className="bi bi-download me-1"></i>
                                            재다운로드
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm border fw-bold"
                                            onClick={() => navigate(`/download/user/${item.datasetId}`)}
                                        >
                                            상세보기
                                            <i className="bi bi-box-arrow-up-right ms-1"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationFooter
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function FavoriteDatasetTable({
    items,
    totalCount,
    loading,
    navigate,
    sort,
    onSortChange,
    currentPage,
    pageSize,
    onPageChange,
}) {
    return (
        <div className="my-download-list-card">
            <ListSectionHead
                title="관심 데이터"
                count={totalCount}
                sort={sort}
                onSortChange={onSortChange}
            />
            <div className="table-responsive">
                <table className="table table-hover align-middle my-download-table favorite">
                    <thead className="table-light">
                        <tr>
                            <th>데이터명</th>
                            <th className="text-center">분류</th>
                            <th className="text-center">형식</th>
                            <th className="text-center">등록일</th>
                            <th className="text-center">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="text-center text-secondary py-4">불러오는 중입니다.</td>
                            </tr>
                        )}
                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-secondary py-4">관심 데이터가 없습니다.</td>
                            </tr>
                        )}
                        {!loading && items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <span className="my-download-favorite-title">
                                        <i className="bi bi-star-fill"></i>
                                        {item.title}
                                    </span>
                                </td>
                                <td className="text-center sm-text text-secondary">{item.category}</td>
                                <td className="text-center">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                        {item.format}
                                    </span>
                                </td>
                                <td className="text-center sm-text text-secondary">{item.date}</td>
                                <td className="text-center">
                                    <div className="my-download-action-group">
                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm border fw-bold"
                                            onClick={() => navigate(`/download/user/${item.id}`)}
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            상세보기
                                        </button>
                                        <button type="button" className="btn btn-light btn-sm border fw-bold">
                                            <i className="bi bi-trash me-1"></i>
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationFooter
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                loading={loading}
                onPageChange={onPageChange}
            />
        </div>
    );
}

function PaginationFooter({ totalCount, currentPage, pageSize, loading, onPageChange }) {
    const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const pageItems = buildPaginationItems(safeCurrentPage, totalPages);
    const canMovePrev = safeCurrentPage > 1 && !loading;
    const canMoveNext = safeCurrentPage < totalPages && !loading;

    return (
        <div className="my-download-pagination">
            <div className="my-download-page-buttons">
                <button
                    type="button"
                    className="btn btn-sm btn-light border"
                    disabled={!canMovePrev}
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                {pageItems.map((item) => (
                    typeof item === "string" ? (
                        <span key={item}>...</span>
                    ) : (
                        <button
                            type="button"
                            key={item}
                            className={`btn btn-sm ${item === safeCurrentPage ? "btn-primary" : "btn-light border"}`}
                            disabled={loading || item === safeCurrentPage}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </button>
                    )
                ))}
                <button
                    type="button"
                    className="btn btn-sm btn-light border"
                    disabled={!canMoveNext}
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>
            <span>전체 {formatNumber(totalCount)}건</span>
        </div>
    );
}

function SideCard({ title, caption, actionLabel, className = "", children }) {
    return (
        <div className={`card shadow-sm my-download-side-card ${className}`}>
            <div className="my-download-side-head">
                <div>
                    <h5>{title}</h5>
                    {caption && <small>{caption}</small>}
                </div>
                {actionLabel && (
                    <button type="button">
                        {actionLabel}
                        <i className="bi bi-chevron-right"></i>
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

function DownloadFormatChart({ stats }) {
    const totalCount = stats.reduce((sum, item) => sum + item.count, 0);
    const chartData = {
        labels: stats.map((item) => item.label),
        datasets: [
            {
                data: stats.map((item) => item.count),
                backgroundColor: stats.map((item) => item.color),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 4,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = Number(context.raw ?? 0);
                        const percent = totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
                        return `${context.label}: ${value}건 (${percent}%)`;
                    },
                },
            },
        },
    };

    if (totalCount === 0) {
        return <div className="my-download-empty-side">최근 30일 다운로드 통계가 없습니다.</div>;
    }

    return (
        <div className="my-download-chart-wrap">
            <div className="my-download-doughnut-box">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="my-download-chart-center">
                    <span>총</span>
                    <strong>{formatNumber(totalCount)}건</strong>
                </div>
            </div>
            <div className="my-download-chart-legend">
                {stats.map((item) => (
                    <div key={item.label}>
                        <span style={{ backgroundColor: item.color }}></span>
                        <p>
                            <strong>{item.label}</strong>
                            <em>{formatNumber(item.count)}건 ({item.percent}%)</em>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserMyDownloadPage;
