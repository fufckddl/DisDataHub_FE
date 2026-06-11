import { Link, useNavigate } from "react-router-dom";
import "../../style/download.css";
import TopTitle from "../../components/TopTitle";
import { useCallback, useEffect, useState } from "react";
import { getDatasetDownloadPageApi, getDownloadDatasetMainPageApi } from "../../api/userDownloadApi";
import useAuthStore from "../../../commons/auth/useAuthStore";

const DEFAULT_SEARCH_FILTERS = {
    keyword: "",
    provider: "",
    fileFormat: "",
    categoryId: "",
    startDate: "",
    endDate: "",
};

const SORT_OPTIONS = [
    { value: "default", label: "기본순" },
    { value: "viewCount", label: "조회순" },
    { value: "downloadCount", label: "다운로드순" },
    { value: "updatedAt", label: "최신수정일순" },
    { value: "title", label: "제목순" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function isFavoriteDataset(item) {
    return item.favorite === true || item.favorite === "true";
}

function formatNumber(value) {
    return new Intl.NumberFormat("ko-KR").format(value ?? 0);
}

function formatFileFormatLabel(value) {
    if (!value) return "-";

    const upperValue = String(value).replace(".", "").toUpperCase();
    const labelMap = {
        CSV: "CSV",
        GEOJSON: "GeoJSON",
        JSON: "GeoJSON",
        SHP: "SHP",
        ZIP: "SHP",
        XLSX: "XLSX",
        XLS: "XLSX",
        TIFF: "TIFF",
        TIF: "TIFF",
    };

    return labelMap[upperValue] ?? value;
}

function mapDataset(item) {
    return {
        id: String(item.datasetId),
        title: item.title ?? "-",
        description: item.description ?? "-",
        provider: item.provider ?? "-",
        categoryNameKo: item.categoryNameKo ?? "-",
        createAt: item.createdAt ? String(item.createdAt).slice(0, 10) : "-",
        isPublic: item.isPublic,
        fileExtension: item.fileExtension ?? "-",
        downloadCount: item.downloadCount ?? 0,
        viewCount: item.viewCount ?? 0,
        favorite: isFavoriteDataset(item),
    };
}

function SearchForm({ title, children }) {
    return (
        <div className="download-main-search-field">
            <label>{title}</label>
            {children}
        </div>
    );
}

function Search({ filters, setFilters, options, onSearch, onReset }) {
    const updateFilter = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch();
    };

    return (
        <div className="row mb-3">
            <div className="col">
                <form className="card download-main-search-card" onSubmit={handleSubmit}>
                    <div className="download-main-search-grid">
                        <SearchForm title="검색">
                            <div className="download-main-search-input">
                                <input
                                    type="text"
                                    placeholder="데이터명 또는 제공기관 검색"
                                    value={filters.keyword}
                                    onChange={(event) => updateFilter("keyword", event.target.value)}
                                />
                                <i className="bi bi-search"></i>
                            </div>
                        </SearchForm>

                        <SearchForm title="제공기관">
                            <select
                                className="form-select"
                                value={filters.provider}
                                onChange={(event) => updateFilter("provider", event.target.value)}
                            >
                                <option value="">전체 제공기관</option>
                                {options.providers.map((provider) => (
                                    <option key={provider} value={provider}>{provider}</option>
                                ))}
                            </select>
                        </SearchForm>

                        <SearchForm title="파일 형식">
                            <select
                                className="form-select"
                                value={filters.fileFormat}
                                onChange={(event) => updateFilter("fileFormat", event.target.value)}
                            >
                                <option value="">전체</option>
                                {options.fileFormats.map((format) => (
                                    <option key={format} value={format}>{formatFileFormatLabel(format)}</option>
                                ))}
                            </select>
                        </SearchForm>

                        <SearchForm title="데이터 유형">
                            <select
                                className="form-select"
                                value={filters.categoryId}
                                onChange={(event) => updateFilter("categoryId", event.target.value)}
                            >
                                <option value="">전체</option>
                                {options.categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryNameKo}
                                    </option>
                                ))}
                            </select>
                        </SearchForm>

                        <SearchForm title="등록일">
                            <div className="download-date-range">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.startDate}
                                    onChange={(event) => updateFilter("startDate", event.target.value)}
                                />
                                <span>~</span>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.endDate}
                                    onChange={(event) => updateFilter("endDate", event.target.value)}
                                />
                            </div>
                        </SearchForm>

                    </div>

                    <div className="download-main-search-actions">
                        <button className="btn btn-primary fw-bold">
                            <i className="bi bi-search me-2"></i>
                            검색
                        </button>

                        <button
                            type="button"
                            className="btn btn-light border fw-bold"
                            onClick={onReset}
                        >
                            <i className="bi bi-arrow-repeat me-2"></i>
                            초기화
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DatasetList({ datasetList, loading, pagination, sort, onSortChange, onPageChange, onSizeChange }) {
    return (
        <div className="row">
            <div className="col">
                <div className="card shadow-sm overflow-hidden">
                    <div className="download-list-toolbar">
                        <div className="download-list-total">전체 {formatNumber(pagination.totalCount)}건</div>

                        <div className="download-list-controls">
                            <select
                                className="form-select form-select-sm"
                                value={sort}
                                aria-label="정렬 선택"
                                onChange={(event) => onSortChange(event.target.value)}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                            <select
                                className="form-select form-select-sm"
                                value={pagination.size}
                                aria-label="페이지당 목록 수"
                                onChange={(event) => onSizeChange(Number(event.target.value))}
                            >
                                {PAGE_SIZE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}개씩 보기</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <table className="table table-hover align-middle download-main-table">
                        <thead className="table-light">
                            <tr>
                                {/* <th className="col-2 ps-3">데이터셋 명</th> */}
                                <th className="col-3 ps-3">제목</th>
                                <th className="col-3">설명</th>
                                <th className="col-1 text-center">제공 기관</th>
                                <th className="col-1 text-center">등록일</th>
                                <th className="col-1 text-center">파일 형식</th>
                                <th className="col-1 text-center">다운로드 수</th>
                                <th className="col-1 text-center">조회 수</th>
                                {/* <th className="col-2 text-center">액션</th> */}
                                <th className="col-1 text-center">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasetList.length > 0 ? (
                                datasetList.map((dataset) => (
                                    <DatasetForm
                                        key={dataset.id}
                                        dataset={dataset}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-secondary">
                                        {loading ? "목록을 불러오는 중입니다." : "표시할 데이터셋이 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <Paging
                        pagination={pagination}
                        onPageChange={onPageChange}
                    />
                </div>
            </div>
        </div>
    );
}

function DatasetForm({ dataset }) {
    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);

    const handleDetailPageClick = async (isPublic) => {
        if (!isPublic) {
            if (userInfo == null) {
                if (confirm("비공개 데이터셋입니다. 로그인 페이지로 이동하시겠습니까?")) {
                    navigate("/login");
                }
                return;
            }

            try {
                await getDatasetDownloadPageApi(dataset.id);
            } catch (error) {
                if (error?.response?.status === 403) {
                    alert("같은 소속기관 사용자만 접근할 수 있습니다.");
                    return;
                }

                alert("데이터셋 정보를 불러올 수 없습니다.");
                return;
            }
        }

        navigate(`/download/user/${dataset.id}`);
    };

    return (
        <tr>
            <td className="col-2 text-primary fw-bold ps-3" style={{ fontSize: "15px" }}>
                <Link
                    to="#"
                    onClick={(event) => {
                        event.preventDefault();
                        handleDetailPageClick(dataset.isPublic);
                    }}
                    className="text-decoration-none download-table-title-link"
                    title={dataset.title}
                >
                    <span className="download-table-title-text">{dataset.title}</span>
                    {dataset.favorite && (
                        <i className="bi bi-star-fill text-warning download-list-favorite-star" aria-label="관심 데이터"></i>
                    )}
                </Link>
            </td>

            <td className="col-3 sm-text text-secondary">
                <span className="download-table-ellipsis" title={dataset.description}>{dataset.description}</span>
            </td>
            <td className="col-1 sm-text text-secondary text-center">
                <span className="download-table-ellipsis" title={dataset.provider}>{dataset.provider}</span>
            </td>
            <td className="col-1 sm-text text-secondary text-center">{dataset.createAt}</td>
            <td className="col-1 text-center">
                <span className="badge bg-success-subtle text-success border border-success-subtle me-1">
                    {formatFileFormatLabel(dataset.fileExtension)}
                </span>
            </td>
            <td className="col-1 sm-text text-secondary text-center">{formatNumber(dataset.downloadCount)}</td>
            <td className="col-1 sm-text text-secondary text-center">{formatNumber(dataset.viewCount)}</td>
            <td className="col-2 sm-text text-center">
                <button
                    className="btn btn-light btn-sm sm-text border text-secondary "
                    onClick={() => handleDetailPageClick(dataset.isPublic)}
                >
                    상세보기
                </button>
                {/* <button className="btn btn-primary btn-sm" style={{ fontSize: "13px" }}>
                    다운로드
                </button> */}
            </td>
        </tr>
    );
}

function CardForm({ children, color, title, content, caption, onClick, isCompactContent = false }) {
    const isClickable = typeof onClick === "function";

    return (
        <div className="col">
            <div
                className={`card shadow-sm p-4 h-100 download-summary-card ${isClickable ? "download-summary-card-clickable" : ""}`}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={onClick}
                onKeyDown={(event) => {
                    if (isClickable && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        onClick();
                    }
                }}
            >
                {isClickable && (
                    <span className="download-summary-card-action" aria-hidden="true">
                        <i className="bi bi-arrow-up-right"></i>
                    </span>
                )}
                <div className="row flex-nowrap align-items-start">
                    <div
                        className={`col-2 rounded-circle bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
                        style={{ width: "56px", height: "56px", flex: "0 0 56px" }}
                    >
                        {children}
                    </div>
                    <div className="col" style={{ minWidth: 0 }}>
                        <div className="fw-bold download-summary-card-title">{title}</div>
                        <div
                            className={`fw-bold download-summary-card-content ${isCompactContent ? "download-summary-card-content-clamp" : ""}`}
                            title={typeof content === "string" ? content : undefined}
                        >
                            {content}
                        </div>
                        <div className="text-secondary fw-bold" style={{ fontSize: "12px" }}>
                            {caption}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DownloadTrendCaption({ yesterdayCount, rate }) {
    const numericRate = Number(rate ?? 0);
    const tone = numericRate > 0 ? "up" : numericRate < 0 ? "down" : "flat";
    const marker = numericRate > 0 ? "▲" : numericRate < 0 ? "▼" : "-";

    return (
        <span>
            전일 대비,
            <span className={`download-trend ${tone}`}> {marker} {Math.abs(numericRate).toFixed(1)}%</span>
            <span className="download-trend-base"> 전날 {formatNumber(yesterdayCount)}건</span>
        </span>
    );
}

function getPageNumbers(currentPage, totalPages) {
    if (totalPages <= 0) return [];

    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function Paging({ pagination, onPageChange }) {
    const { page, totalPages } = pagination;
    const pageNumbers = getPageNumbers(page, totalPages);
    const hasPrevious = page > 1;
    const hasNext = totalPages > 0 && page < totalPages;

    return (
        <div className="download-pagination-bar">
            <div className="download-pagination-center">
                <button
                    type="button"
                    className={`download-pagination-arrow ${!hasPrevious ? "disabled" : ""}`}
                    aria-label="첫 페이지"
                    disabled={!hasPrevious}
                    onClick={() => onPageChange(1)}
                >
                    <i className="bi bi-chevron-double-left"></i>
                </button>
                <button
                    type="button"
                    className={`download-pagination-arrow ${!hasPrevious ? "disabled" : ""}`}
                    aria-label="이전 페이지"
                    disabled={!hasPrevious}
                    onClick={() => onPageChange(page - 1)}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>

                {pageNumbers[0] > 1 && (
                    <>
                        <button type="button" className="download-pagination-number" onClick={() => onPageChange(1)}>1</button>
                        <span className="download-pagination-ellipsis">...</span>
                    </>
                )}

                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        className={`download-pagination-number ${pageNumber === page ? "active" : ""}`}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        <span className="download-pagination-ellipsis">...</span>
                        <button
                            type="button"
                            className="download-pagination-number"
                            onClick={() => onPageChange(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    type="button"
                    className={`download-pagination-arrow ${!hasNext ? "disabled" : ""}`}
                    aria-label="다음 페이지"
                    disabled={!hasNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
                <button
                    type="button"
                    className={`download-pagination-arrow ${!hasNext ? "disabled" : ""}`}
                    aria-label="마지막 페이지"
                    disabled={!hasNext}
                    onClick={() => onPageChange(totalPages)}
                >
                    <i className="bi bi-chevron-double-right"></i>
                </button>
            </div>
        </div>
    );
}

function UserDownloadMainPage() {
    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);

    const [apiDatasetList, setApiDatasetList] = useState([]);
    const [searchFilters, setSearchFilters] = useState(DEFAULT_SEARCH_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_SEARCH_FILTERS);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [sort, setSort] = useState("default");
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const datasetList = apiDatasetList ?? [];
    const optionsData = pageData?.options ?? {};
    const options = {
        providers: optionsData.providers ?? [],
        fileFormats: optionsData.fileFormats ?? [],
        categories: optionsData.categories ?? [],
    };
    const summary = pageData?.summary ?? {};
    const pagination = {
        page: pageData?.page ?? page,
        size: pageData?.size ?? size,
        totalCount: pageData?.totalCount ?? 0,
        totalPages: pageData?.totalPages ?? 0,
    };

    const popularDataset = summary.popularDataset ? mapDataset(summary.popularDataset) : null;

    const handlePopularDatasetClick = async () => {
        if (!popularDataset) {
            return;
        }

        if (!popularDataset.isPublic) {
            if (userInfo == null) {
                if (confirm("비공개 데이터셋입니다. 로그인 페이지로 이동하시겠습니까?")) {
                    navigate("/login");
                }
                return;
            }

            try {
                await getDatasetDownloadPageApi(popularDataset.id);
            } catch (error) {
                if (error?.response?.status === 403) {
                    alert("같은 소속기관 사용자만 접근할 수 있습니다.");
                    return;
                }

                alert("데이터셋 정보를 불러올 수 없습니다.");
                return;
            }
        }

        navigate(`/download/user/${popularDataset.id}`);
    };

    const summaryCards = [
        {
            color: "primary",
            title: "전체 데이터 수",
            content: `${formatNumber(summary.totalDatasetCount ?? 0)}건`,
            caption: "승인된 데이터 기준",
            icon: "bi-layers-fill",
        },
        {
            color: "success",
            title: "오늘 다운로드 수",
            content: `${formatNumber(summary.todayDownloadCount ?? 0)}건`,
            caption: (
                <DownloadTrendCaption
                    yesterdayCount={summary.yesterdayDownloadCount ?? 0}
                    rate={summary.downloadChangeRate ?? 0}
                />
            ),
            icon: "bi-download",
        },
        {
            color: "warning",
            title: "지원 파일 형식",
            content: `${formatNumber(summary.supportedFormatCount ?? 0)}종`,
            caption: (summary.supportedFormats ?? []).map(formatFileFormatLabel).join(", ") || "등록된 형식 없음",
            icon: "bi-file-earmark-text-fill",
        },
        {
            color: "danger",
            title: "인기 데이터",
            content: popularDataset?.title ?? "-",
            caption: popularDataset
                ? `누적 다운로드 ${formatNumber(Number(popularDataset.downloadCount ?? 0))}건`
                : "다운로드 데이터 없음",
            icon: "bi-fire",
            onClick: popularDataset ? handlePopularDatasetClick : undefined,
            isCompactContent: true,
        },
    ];

    const fetchDatasetList = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const params = {
                page,
                size,
                sort,
                keyword: appliedFilters.keyword || undefined,
                provider: appliedFilters.provider || undefined,
                fileFormat: appliedFilters.fileFormat || undefined,
                categoryId: appliedFilters.categoryId || undefined,
                startDate: appliedFilters.startDate || undefined,
                endDate: appliedFilters.endDate || undefined,
            };
            const response = await getDownloadDatasetMainPageApi(params);
            const responseData = response.data ?? {};
            const mappedList = (responseData.datasetList ?? []).map(mapDataset);

            setApiDatasetList(mappedList);
            setPageData(responseData);
        } catch {
            setApiDatasetList([]);
            setPageData(null);
            setErrorMessage("데이터셋 목록을 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, page, size, sort]);

    const handleSearch = () => {
        setAppliedFilters({ ...searchFilters });
        setPage(1);
    };

    const handleReset = () => {
        setSearchFilters({ ...DEFAULT_SEARCH_FILTERS });
        setAppliedFilters({ ...DEFAULT_SEARCH_FILTERS });
        setPage(1);
        setSize(10);
        setSort("default");
    };

    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || (pagination.totalPages > 0 && nextPage > pagination.totalPages)) {
            return;
        }

        setPage(nextPage);
    };

    const handleSizeChange = (nextSize) => {
        setSize(nextSize);
        setPage(1);
    };

    const handleSortChange = (nextSort) => {
        setSort(nextSort);
        setPage(1);
    };

    useEffect(() => {
        const timerId = window.setTimeout(fetchDatasetList, 0);
        return () => window.clearTimeout(timerId);
    }, [fetchDatasetList]);

    return (
        <div className="container-fluid px-4 py-3">
            <TopTitle
                title="GIS 데이터 다운로드"
                subTitle="승인된 공공 GIS 데이터를 조회하고 파일을 다운로드할 수 있습니다."
                showGuide={true}
            />

            {/* 검색 */}
            <Search
                filters={searchFilters}
                setFilters={setSearchFilters}
                options={options}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            {errorMessage && (
                <div className="alert alert-danger py-2" role="alert">
                    {errorMessage}
                </div>
            )}

            {/* 카드 */}
            <div className="row mb-3">
                {summaryCards.map((card, index) => (
                    <CardForm
                        key={index}
                        color={card.color}
                        title={card.title}
                        content={card.content}
                        caption={card.caption}
                        onClick={card.onClick}
                        isCompactContent={card.isCompactContent}
                    >
                        <i className={`bi ${card.icon} fs-3`}></i>
                    </CardForm>
                ))}
            </div>

            {/* 승인 데이터셋 */}
            <DatasetList
                datasetList={datasetList}
                loading={loading}
                pagination={pagination}
                sort={sort}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
            />
        </div>
    );
}

export default UserDownloadMainPage;
