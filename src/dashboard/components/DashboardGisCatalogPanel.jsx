import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    getDashboardGisDataSources,
    getDashboardGisDatasets,
    getDashboardGisMetrics,
} from "../api/dashBoardApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RESIDENT_POPULATION_DATASET_CODE = "MOIS_ADMM_SEXD_AGE_PPLTN_MAIN";

const PRIORITY_OPTIONS = [
    { label: "전체", value: null },
    { label: "1순위", value: 1 },
    { label: "2순위", value: 2 },
    { label: "3순위", value: 3 },
    { label: "4순위", value: 4 },
];

const DIFFICULTY_LABELS = {
    LOW: "낮음",
    MEDIUM: "중",
    HIGH: "높음",
};

const LAYER_TYPE_LABELS = {
    CHOROPLETH: "색상지도",
    POINT: "점",
    HEATMAP: "히트맵",
    LINE: "라인",
    POLYGON: "폴리곤",
    RASTER: "래스터",
    RANKING: "랭킹",
    TIME_SERIES: "시계열",
    TABLE: "테이블",
};

const populationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                boxWidth: 12,
                boxHeight: 12,
            },
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: ${formatNumber(context.raw)}명`,
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxRotation: 45,
                minRotation: 0,
            },
        },
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => `${Number(value).toLocaleString()}명`,
            },
        },
    },
};

function formatNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue.toLocaleString() : "0";
}

function sourceStatusLabel(status) {
    if (status === "CANDIDATE") {
        return "후보";
    }
    if (status === "VERIFIED") {
        return "검증";
    }
    return status ?? "-";
}

function createPopulationChartData(populationData) {
    return {
        labels: populationData?.labels ?? [],
        datasets: (populationData?.datasets ?? []).map((dataset, index) => ({
            ...dataset,
            backgroundColor:
                dataset.backgroundColor ??
                (index === 0 ? "rgba(37, 99, 235, 0.72)" : "rgba(236, 72, 153, 0.68)"),
            borderColor:
                dataset.borderColor ??
                (index === 0 ? "#2563eb" : "#ec4899"),
            borderWidth: 1,
            borderRadius: 6,
        })),
    };
}

function DashboardGisCatalogPanel({
    selectedArea,
    populationData,
    populationLoading,
    populationError,
}) {
    const [sources, setSources] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [preferredSourceCode, setPreferredSourceCode] = useState(null);
    const [preferredDatasetCode, setPreferredDatasetCode] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailError, setDetailError] = useState(null);

    const loadSources = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getDashboardGisDataSources({ activeOnly: true });
            setSources(data ?? []);
        } catch (err) {
            console.error(err);
            setSources([]);
            setPreferredSourceCode(null);
            setError("대시보드 GIS 데이터 카탈로그를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadSources();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [loadSources]);

    const categories = useMemo(() => {
        return [...new Set(sources.map((source) => source.sourceCategory).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "ko"));
    }, [sources]);

    const visibleSources = useMemo(() => {
        return sources.filter((source) => {
            const categoryMatched = !selectedCategory || source.sourceCategory === selectedCategory;
            const priorityMatched = !selectedPriority || source.priority === selectedPriority;
            return categoryMatched && priorityMatched;
        });
    }, [sources, selectedCategory, selectedPriority]);

    const selectedSourceCode = useMemo(() => {
        if (visibleSources.length === 0) {
            return null;
        }
        if (visibleSources.some((source) => source.sourceCode === preferredSourceCode)) {
            return preferredSourceCode;
        }
        return visibleSources[0].sourceCode;
    }, [preferredSourceCode, visibleSources]);

    useEffect(() => {
        let cancelled = false;
        const timerId = window.setTimeout(() => {
            async function loadDetails() {
                if (!selectedSourceCode) {
                    setDatasets([]);
                    setMetrics([]);
                    setDetailError(null);
                    return;
                }

                setDetailLoading(true);
                setDetailError(null);

                try {
                    const [datasetData, metricData] = await Promise.all([
                        getDashboardGisDatasets({ sourceCode: selectedSourceCode, activeOnly: true }),
                        getDashboardGisMetrics({ sourceCode: selectedSourceCode }),
                    ]);

                    if (!cancelled) {
                        setDatasets(datasetData ?? []);
                        setMetrics(metricData ?? []);
                    }
                } catch (err) {
                    console.error(err);
                    if (!cancelled) {
                        setDatasets([]);
                        setMetrics([]);
                        setDetailError("선택한 원천의 데이터셋/지표 정보를 불러오지 못했습니다.");
                    }
                } finally {
                    if (!cancelled) {
                        setDetailLoading(false);
                    }
                }
            }

            loadDetails();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [selectedSourceCode]);

    const selectedSource = useMemo(() => {
        return sources.find((source) => source.sourceCode === selectedSourceCode) ?? null;
    }, [selectedSourceCode, sources]);

    const selectedDataset = useMemo(() => {
        if (datasets.length === 0) {
            return null;
        }
        return datasets.find((dataset) => dataset.datasetCode === preferredDatasetCode) ?? datasets[0];
    }, [datasets, preferredDatasetCode]);

    const selectedMetrics = useMemo(() => {
        if (!selectedDataset) {
            return [];
        }
        return metrics.filter((metric) => metric.datasetCode === selectedDataset.datasetCode);
    }, [metrics, selectedDataset]);

    const populationChartData = useMemo(() => {
        if (selectedDataset?.datasetCode !== RESIDENT_POPULATION_DATASET_CODE) {
            return null;
        }
        if (!populationData?.labels || !populationData?.datasets) {
            return null;
        }
        return createPopulationChartData(populationData);
    }, [populationData, selectedDataset]);

    const hasPopulationChartData = Boolean(
        populationChartData?.labels?.length && populationChartData?.datasets?.length
    );

    const summary = useMemo(() => {
        return {
            sourceCount: sources.length,
            datasetCount: sources.reduce((sum, source) => sum + Number(source.datasetCount ?? 0), 0),
            metricCount: sources.reduce((sum, source) => sum + Number(source.metricCount ?? 0), 0),
            categoryCount: categories.length,
        };
    }, [categories.length, sources]);

    return (
        <div className="card shadow-sm dashboard-gis-catalog-card">
            <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                        <h5 className="fw-semibold mb-1">GIS 데이터 카탈로그</h5>
                        <p className="text-secondary small mb-0">
                            신규 대시보드 GIS 테이블에 등록된 전국 공공데이터 원천, 데이터셋, 지표를 표시합니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-secondary"
                        onClick={loadSources}
                        disabled={loading}
                        title="GIS 데이터 카탈로그 새로고침"
                    >
                        <i className={`bi ${loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"} me-1`} />
                        새로고침
                    </button>
                </div>

                <div className="dashboard-gis-summary-grid mb-3">
                    <div className="dashboard-gis-summary-card primary">
                        <span>데이터 원천</span>
                        <strong>{formatNumber(summary.sourceCount)}개</strong>
                    </div>
                    <div className="dashboard-gis-summary-card">
                        <span>데이터셋</span>
                        <strong>{formatNumber(summary.datasetCount)}개</strong>
                    </div>
                    <div className="dashboard-gis-summary-card">
                        <span>지표</span>
                        <strong>{formatNumber(summary.metricCount)}개</strong>
                    </div>
                    <div className="dashboard-gis-summary-card">
                        <span>분야</span>
                        <strong>{formatNumber(summary.categoryCount)}개</strong>
                    </div>
                </div>

                <div className="dashboard-gis-filter-bar mb-3">
                    <div className="dashboard-gis-priority-tabs" aria-label="데이터 우선순위 필터">
                        {PRIORITY_OPTIONS.map((option) => (
                            <button
                                type="button"
                                key={option.label}
                                className={`dashboard-gis-tab ${selectedPriority === option.value ? "active" : ""}`}
                                onClick={() => setSelectedPriority(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <select
                        className="form-select form-select-sm dashboard-gis-category-select"
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                        aria-label="GIS 데이터 분야 필터"
                    >
                        <option value="">전체 분야</option>
                        {categories.map((category) => (
                            <option value={category} key={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="text-secondary small">GIS 데이터 카탈로그를 불러오는 중...</div>
                )}

                {error && (
                    <div className="alert alert-danger py-2 small mb-0">{error}</div>
                )}

                {!loading && !error && (
                    <div className="dashboard-gis-catalog-grid">
                        <div className="dashboard-gis-source-panel">
                            <div className="dashboard-gis-panel-title">
                                <strong>원천 목록</strong>
                                <span>{formatNumber(visibleSources.length)}건</span>
                            </div>

                            {visibleSources.length === 0 ? (
                                <div className="text-secondary small">조건에 맞는 데이터 원천이 없습니다.</div>
                            ) : (
                                <div className="dashboard-gis-source-list">
                                    {visibleSources.map((source) => (
                                        <button
                                            type="button"
                                            key={source.sourceCode}
                                            className={`dashboard-gis-source-item ${source.sourceCode === selectedSourceCode ? "active" : ""}`}
                                            onClick={() => setPreferredSourceCode(source.sourceCode)}
                                        >
                                            <div className="dashboard-gis-source-head">
                                                <strong>{source.sourceName}</strong>
                                                <span>{source.priority}순위</span>
                                            </div>
                                            <div className="dashboard-gis-source-meta">
                                                {source.sourceCategory} · {source.providerName} · {DIFFICULTY_LABELS[source.collectionDifficulty] ?? source.collectionDifficulty}
                                            </div>
                                            <div className="dashboard-gis-source-footer">
                                                <span>{source.apiType}</span>
                                                <span>{source.updateCycle ?? "갱신주기 미정"}</span>
                                                <span>데이터셋 {formatNumber(source.datasetCount)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dashboard-gis-detail-panel">
                            <div className="dashboard-gis-panel-title">
                                <strong>선택 원천 상세</strong>
                                {detailLoading && <span>조회 중</span>}
                            </div>

                            {!selectedSource && (
                                <div className="text-secondary small">원천을 선택하세요.</div>
                            )}

                            {selectedSource && (
                                <>
                                    <div className="dashboard-gis-detail-head mb-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">{selectedSource.sourceName}</h6>
                                            <div className="small text-secondary">{selectedSource.sourceCode}</div>
                                        </div>
                                        <span className="dashboard-gis-status-badge">
                                            {sourceStatusLabel(selectedSource.verificationStatus)}
                                        </span>
                                    </div>

                                    <div className="dashboard-gis-detail-tags mb-3">
                                        <span>{selectedSource.providerName}</span>
                                        <span>{selectedSource.sourceCategory}</span>
                                        <span>{selectedSource.spatialGranularity ?? "공간키 미정"}</span>
                                        <span>{selectedSource.hasGeometry ? "공간데이터" : "행정구역 조인"}</span>
                                    </div>

                                    {selectedSource.officialUrl && (
                                        <a
                                            href={selectedSource.officialUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="dashboard-gis-official-link mb-3"
                                        >
                                            공식 데이터 페이지 열기
                                            <i className="bi bi-box-arrow-up-right ms-1" />
                                        </a>
                                    )}

                                    {detailError && (
                                        <div className="alert alert-danger py-2 small">{detailError}</div>
                                    )}

                                    <div className="dashboard-gis-dataset-list mb-3">
                                        <div className="small fw-semibold text-secondary mb-2">데이터셋</div>
                                        {datasets.length === 0 && !detailLoading ? (
                                            <div className="text-secondary small">등록된 데이터셋이 없습니다.</div>
                                        ) : datasets.map((dataset) => (
                                            <button
                                                type="button"
                                                className={`dashboard-gis-dataset-item ${selectedDataset?.datasetCode === dataset.datasetCode ? "active" : ""}`}
                                                key={dataset.datasetCode}
                                                onClick={() => setPreferredDatasetCode(dataset.datasetCode)}
                                            >
                                                <div>
                                                    <strong>{dataset.datasetName}</strong>
                                                    <div className="small text-secondary">{dataset.datasetCode}</div>
                                                </div>
                                                <div className="dashboard-gis-dataset-badges">
                                                    <span>{LAYER_TYPE_LABELS[dataset.dashboardLayerType] ?? dataset.dashboardLayerType}</span>
                                                    <span>지표 {formatNumber(dataset.metricCount)}</span>
                                                    <span>관측 {formatNumber(dataset.observationCount)}</span>
                                                    <span>피처 {formatNumber(dataset.featureCount)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="dashboard-gis-visual-panel mb-3">
                                        <div className="dashboard-gis-visual-head">
                                            <strong>데이터셋 시각화</strong>
                                            {selectedDataset && (
                                                <span>
                                                    {LAYER_TYPE_LABELS[selectedDataset.dashboardLayerType] ?? selectedDataset.dashboardLayerType}
                                                </span>
                                            )}
                                        </div>

                                        {!selectedDataset && (
                                            <div className="text-secondary small">데이터셋을 선택하세요.</div>
                                        )}

                                        {selectedDataset?.datasetCode === RESIDENT_POPULATION_DATASET_CODE && (
                                            <>
                                                {!selectedArea && (
                                                    <div className="alert alert-info py-2 small mb-0">
                                                        지도 polygon을 클릭하면 선택 지역 기준 주민등록 인구 그래프가 이 영역에 표시됩니다.
                                                    </div>
                                                )}

                                                {selectedArea && populationLoading && (
                                                    <div className="text-secondary small">선택 지역 인구 그래프를 불러오는 중...</div>
                                                )}

                                                {selectedArea && populationError && (
                                                    <div className="alert alert-warning py-2 small mb-0">
                                                        {populationError}
                                                    </div>
                                                )}

                                                {selectedArea && !populationLoading && !populationError && hasPopulationChartData && (
                                                    <div className="dashboard-gis-population-preview">
                                                        <div className="dashboard-gis-population-summary">
                                                            <div>
                                                                <span>선택 지역</span>
                                                                <strong>{selectedArea.fullName ?? selectedArea.name}</strong>
                                                            </div>
                                                            <div>
                                                                <span>전체</span>
                                                                <strong>{formatNumber(populationData.totalPopulation)}명</strong>
                                                            </div>
                                                            <div>
                                                                <span>남성</span>
                                                                <strong>{formatNumber(populationData.malePopulation)}명</strong>
                                                            </div>
                                                            <div>
                                                                <span>여성</span>
                                                                <strong>{formatNumber(populationData.femalePopulation)}명</strong>
                                                            </div>
                                                        </div>
                                                        <div className="dashboard-gis-population-chart">
                                                            <Bar data={populationChartData} options={populationChartOptions} />
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedArea && !populationLoading && !populationError && !hasPopulationChartData && (
                                                    <div className="text-secondary small">
                                                        선택 지역에 표시할 인구 그래프 데이터가 없습니다.
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {selectedDataset && selectedDataset.datasetCode !== RESIDENT_POPULATION_DATASET_CODE && (
                                            <div className="dashboard-gis-empty-visual">
                                                <div className="dashboard-gis-empty-icon">
                                                    <i className="bi bi-database-dash" />
                                                </div>
                                                <div>
                                                    <strong>아직 지도/그래프에 표시할 수집 데이터가 없습니다.</strong>
                                                    <p className="mb-0">
                                                        현재 이 데이터셋의 관측값은 {formatNumber(selectedDataset.observationCount)}건,
                                                        공간 피처는 {formatNumber(selectedDataset.featureCount)}건입니다.
                                                        수집기가 연결되어 값이 저장되면 지도 레이어 또는 차트로 표시할 수 있습니다.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="small fw-semibold text-secondary mb-2">지표</div>
                                        <div className="dashboard-gis-metric-list">
                                            {selectedMetrics.length === 0 && !detailLoading ? (
                                                <span className="text-secondary small">등록된 지표가 없습니다.</span>
                                            ) : selectedMetrics.map((metric) => (
                                                <span className="dashboard-gis-metric-chip" key={`${metric.datasetCode}-${metric.metricCode}`}>
                                                    {metric.metricName}
                                                    {metric.unit ? ` (${metric.unit})` : ""}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardGisCatalogPanel;
