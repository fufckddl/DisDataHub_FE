import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    getDashboardGisDataSources,
    getDashboardGisDatasets,
    getDashboardGisFeatures,
    getDashboardGisMetrics,
    getDashboardGisObservations,
    getDashboardGisRegionStats,
} from "../api/dashBoardApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const RESIDENT_POPULATION_SOURCE_CODE = "MOIS_ADMM_SEXD_AGE_PPLTN";
const RESIDENT_POPULATION_DATASET_CODE = "MOIS_ADMM_SEXD_AGE_PPLTN_MAIN";
const EV_CHARGER_DATASET_CODE = "KECO_EV_CHARGER_MAIN";
const OBSERVATION_TABLE_DATASET_CODES = new Set([
    "KMA_VILAGE_FCST_MAIN",
    "AIRKOREA_AIR_QUALITY_MAIN",
]);
const MAP_FEATURE_LAYER_TYPES = new Set(["POINT", "HEATMAP"]);
const REGION_CHART_COLORS = [
    "#2563eb", "#f97316", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4",
    "#f59e0b", "#84cc16", "#ef4444", "#14b8a6", "#6366f1", "#a855f7",
    "#22c55e", "#eab308", "#0ea5e9", "#fb7185", "#64748b",
];

const PRIORITY_OPTIONS = [
    { label: "전체", value: null },
    { label: "1순위", value: 1 },
    { label: "2순위", value: 2 },
    { label: "3순위", value: 3 },
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

const AREA_LEVEL_LABELS = {
    SIDO: "시·도",
    SIGUNGU: "시·군·구",
    LEGAL_DONG: "법정동",
    EUPMYEONDONG: "읍·면·동",
    TONG_BAN: "통·반",
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

const evChargerRegionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "58%",
    plugins: {
        legend: {
            position: "right",
            labels: {
                boxWidth: 10,
                boxHeight: 10,
                font: {
                    size: 11,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const item = context.dataset.regionItems?.[context.dataIndex];
                    const label = context.label ?? "";
                    const count = formatNumber(context.raw);
                    const percent = item?.percent ?? 0;
                    return `${label}: ${count}기 (${Number(percent).toFixed(2)}%)`;
                },
            },
        },
    },
};

const observationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const label = context.dataset.metricNames?.[context.dataIndex] ?? context.dataset.label;
                    const unit = context.dataset.units?.[context.dataIndex] ?? context.dataset.unit ?? "";
                    return `${label}: ${formatNumber(context.raw)}${unit}`;
                },
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
                callback: (value) => formatNumber(value),
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

function createEvChargerRegionChartData(regionStats) {
    const items = regionStats?.items ?? [];

    return {
        labels: items.map((item) => item.areaName ?? item.fullName ?? item.areaCode),
        datasets: [
            {
                label: "충전기 수",
                data: items.map((item) => Number(item.count ?? 0)),
                regionItems: items,
                backgroundColor: items.map((_, index) => REGION_CHART_COLORS[index % REGION_CHART_COLORS.length]),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };
}

function createObservationChartData(observationStats) {
    const items = observationStats?.items ?? [];
    const unit = observationStats?.unit ?? items[0]?.unit ?? "";

    return {
        labels: items.map((item) => item.label ?? item.sourceAreaCode ?? item.metricName ?? "-"),
        datasets: [
            {
                label: observationStats?.metricName ?? items[0]?.metricName ?? "관측값",
                data: items.map((item) => Number(item.value ?? 0)),
                unit,
                units: items.map((item) => item.unit ?? unit),
                metricNames: items.map((item) => item.metricName ?? observationStats?.metricName ?? "관측값"),
                backgroundColor: items.map((_, index) => REGION_CHART_COLORS[index % REGION_CHART_COLORS.length]),
                borderColor: "#ffffff",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };
}

function observationRowKey(item, index) {
    return [
        item?.label,
        item?.metricName,
        item?.value,
        item?.unit,
        item?.baseDate,
        item?.baseHour,
    ].filter(Boolean).join(":") || `row-${index}`;
}

function getObservationTableRows(observationStats, limit = 10) {
    const seen = new Set();
    const rows = [];

    for (const item of observationStats?.items ?? []) {
        const key = observationRowKey(item, rows.length);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        rows.push(item);
        if (rows.length >= limit) {
            break;
        }
    }

    return rows;
}

function formatObservationBaseTime(item, observationStats) {
    const baseDate = item?.baseDate ?? observationStats?.baseDate;
    const baseHour = item?.baseHour ?? observationStats?.baseHour;
    if (!baseDate && !baseHour) {
        return "-";
    }
    return `${baseDate ?? ""}${baseHour ? ` ${baseHour}시` : ""}`.trim();
}

function getFeatureRows(geoJson) {
    return (geoJson?.features ?? [])
        .map((feature) => feature.properties ?? {})
        .filter((properties) => properties.featureName || properties.address || properties.externalId);
}

function DashboardGisCollectionSummary({ dataset }) {
    const observationCount = Number(dataset?.observationCount ?? 0);
    const metricCount = Number(dataset?.metricCount ?? 0);
    const hasObservations = observationCount > 0;
    const areaLevelLabel = AREA_LEVEL_LABELS[dataset?.defaultAreaLevel] ?? dataset?.defaultAreaLevel ?? "-";

    return (
        <div className={`dashboard-gis-collection-summary ${hasObservations ? "has-data" : ""}`}>
            <div className="dashboard-gis-collection-message">
                <i className={`bi ${hasObservations ? "bi-check-circle-fill" : "bi-exclamation-circle"} me-2`} />
                <div>
                    <strong>
                        {hasObservations
                            ? "수집 데이터가 저장되어 있습니다."
                            : "아직 수집된 관측값이 없습니다."}
                    </strong>
                    <p className="mb-0">
                        지도 polygon을 클릭하면 선택 지역 기준 차트로 바로 확인할 수 있습니다.
                    </p>
                </div>
            </div>
            <div className="dashboard-gis-collection-stats">
                <div>
                    <span>저장 관측값</span>
                    <strong>{formatNumber(observationCount)}건</strong>
                </div>
                <div>
                    <span>지표</span>
                    <strong>{formatNumber(metricCount)}개</strong>
                </div>
                <div>
                    <span>기본 단위</span>
                    <strong>{areaLevelLabel}</strong>
                </div>
                <div>
                    <span>표시 방식</span>
                    <strong>{LAYER_TYPE_LABELS[dataset?.dashboardLayerType] ?? dataset?.dashboardLayerType ?? "-"}</strong>
                </div>
            </div>
        </div>
    );
}

function DashboardGisCatalogPanel({
    selectedArea,
    populationData,
    populationLoading,
    populationError,
    onGisLayerChange,
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
    const [featureLoading, setFeatureLoading] = useState(false);
    const [featureGeoJson, setFeatureGeoJson] = useState(null);
    const [regionStatsLoading, setRegionStatsLoading] = useState(false);
    const [regionStats, setRegionStats] = useState(null);
    const [observationStatsLoading, setObservationStatsLoading] = useState(false);
    const [observationStats, setObservationStats] = useState(null);
    const [error, setError] = useState(null);
    const [detailError, setDetailError] = useState(null);
    const [featureError, setFeatureError] = useState(null);
    const [regionStatsError, setRegionStatsError] = useState(null);
    const [observationStatsError, setObservationStatsError] = useState(null);

    const loadSources = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getDashboardGisDataSources({ activeOnly: true });
            const loadedSources = (data ?? []).filter((source) => source.priority !== 4);
            setSources(loadedSources);
            setPreferredSourceCode((currentSourceCode) => {
                if (currentSourceCode && loadedSources.some((source) => source.sourceCode === currentSourceCode)) {
                    return currentSourceCode;
                }
                if (loadedSources.some((source) => source.sourceCode === RESIDENT_POPULATION_SOURCE_CODE)) {
                    return RESIDENT_POPULATION_SOURCE_CODE;
                }
                return loadedSources[0]?.sourceCode ?? null;
            });
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

    const canRenderFeatureLayer = Boolean(
        selectedDataset
        && MAP_FEATURE_LAYER_TYPES.has(selectedDataset.dashboardLayerType)
        && Number(selectedDataset.featureCount ?? 0) > 0
    );

    const canRenderObservationData = Boolean(
        selectedDataset
        && selectedDataset.datasetCode !== RESIDENT_POPULATION_DATASET_CODE
        && !canRenderFeatureLayer
        && Number(selectedDataset.observationCount ?? 0) > 0
    );
    const shouldRenderObservationTable = Boolean(
        selectedDataset && OBSERVATION_TABLE_DATASET_CODES.has(selectedDataset.datasetCode)
    );

    useEffect(() => {
        let cancelled = false;
        const timerId = window.setTimeout(() => {
            setFeatureGeoJson(null);
            setFeatureError(null);

            if (!canRenderFeatureLayer) {
                setFeatureLoading(false);
                onGisLayerChange?.(null);
                return;
            }

            setFeatureLoading(true);
            onGisLayerChange?.({
                datasetCode: selectedDataset.datasetCode,
                datasetName: selectedDataset.datasetName,
                layerType: selectedDataset.dashboardLayerType,
                featureCount: selectedDataset.featureCount,
            });

            async function loadFeatures() {
                try {
                    const geoJson = await getDashboardGisFeatures({
                        datasetCode: selectedDataset.datasetCode,
                        limit: 500,
                    });

                    if (cancelled) {
                        return;
                    }

                    setFeatureGeoJson(geoJson);
                } catch (err) {
                    console.error(err);
                    if (!cancelled) {
                        setFeatureGeoJson(null);
                        setFeatureError("지도에 표시할 피처 데이터를 불러오지 못했습니다.");
                    }
                } finally {
                    if (!cancelled) {
                        setFeatureLoading(false);
                    }
                }
            }

            loadFeatures();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [canRenderFeatureLayer, onGisLayerChange, selectedDataset]);

    useEffect(() => {
        let cancelled = false;
        const timerId = window.setTimeout(() => {
            setRegionStats(null);
            setRegionStatsError(null);

            if (selectedDataset?.datasetCode !== EV_CHARGER_DATASET_CODE) {
                setRegionStatsLoading(false);
                return;
            }

            setRegionStatsLoading(true);

            async function loadRegionStats() {
                try {
                    const data = await getDashboardGisRegionStats({
                        datasetCode: selectedDataset.datasetCode,
                    });

                    if (!cancelled) {
                        setRegionStats(data);
                    }
                } catch (err) {
                    console.error(err);
                    if (!cancelled) {
                        setRegionStats(null);
                        setRegionStatsError("시도별 전체 충전소 통계를 불러오지 못했습니다.");
                    }
                } finally {
                    if (!cancelled) {
                        setRegionStatsLoading(false);
                    }
                }
            }

            loadRegionStats();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [selectedDataset?.datasetCode]);

    useEffect(() => {
        let cancelled = false;
        const timerId = window.setTimeout(() => {
            setObservationStats(null);
            setObservationStatsError(null);

            if (!canRenderObservationData) {
                setObservationStatsLoading(false);
                return;
            }

            setObservationStatsLoading(true);

            async function loadObservationStats() {
                try {
                    const data = await getDashboardGisObservations({
                        datasetCode: selectedDataset.datasetCode,
                        areaCode: selectedArea?.areaCode,
                        limit: 12,
                    });

                    if (!cancelled) {
                        setObservationStats(data);
                    }
                } catch (err) {
                    console.error(err);
                    if (!cancelled) {
                        setObservationStats(null);
                        setObservationStatsError("저장된 최신 관측값을 불러오지 못했습니다.");
                    }
                } finally {
                    if (!cancelled) {
                        setObservationStatsLoading(false);
                    }
                }
            }

            loadObservationStats();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [canRenderObservationData, selectedArea?.areaCode, selectedDataset?.datasetCode]);

    const featureRows = useMemo(() => getFeatureRows(featureGeoJson), [featureGeoJson]);
    const evChargerRegionChartData = useMemo(
        () => createEvChargerRegionChartData(regionStats),
        [regionStats]
    );
    const hasEvChargerRegionStats = Boolean(regionStats?.items?.length);
    const observationChartData = useMemo(
        () => createObservationChartData(observationStats),
        [observationStats]
    );
    const observationTableRows = useMemo(
        () => getObservationTableRows(observationStats),
        [observationStats]
    );
    const hasObservationStats = Boolean(observationStats?.items?.length);

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
                                                <DashboardGisCollectionSummary dataset={selectedDataset} />

                                                {!selectedArea && (
                                                    <div className="alert alert-info py-2 small mb-0 mt-3">
                                                        현재는 데이터 저장 현황만 표시 중입니다. 지도 polygon을 클릭하면 선택 지역 기준 주민등록 인구 그래프가 이 영역에 표시됩니다.
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
                                            <>
                                                {canRenderFeatureLayer ? (
                                                    <div className="dashboard-gis-feature-preview">
                                                        <DashboardGisCollectionSummary dataset={selectedDataset} />

                                                        {featureLoading && (
                                                            <div className="text-secondary small mt-3">
                                                                지도 레이어 피처를 불러오는 중...
                                                            </div>
                                                        )}

                                                        {featureError && (
                                                            <div className="alert alert-warning py-2 small mb-0 mt-3">
                                                                {featureError}
                                                            </div>
                                                        )}

                                                        {!featureLoading && !featureError && (
                                                            <div className="dashboard-gis-feature-box mt-3">
                                                                <div className="dashboard-gis-feature-head">
                                                                    <div>
                                                                        <strong>지도에 표시 중</strong>
                                                                        <p className="mb-0">
                                                                            저장된 충전소 중 현재 지도 범위에 포함되는 좌표만 주황색 점으로 표시합니다.
                                                                        </p>
                                                                    </div>
                                                                    <span>{formatNumber(featureRows.length)}건</span>
                                                                </div>

                                                                {featureRows.length > 0 && (
                                                                    <div className="dashboard-gis-feature-list">
                                                                        {featureRows.slice(0, 5).map((feature) => (
                                                                            <div className="dashboard-gis-feature-item" key={feature.externalId}>
                                                                                <strong>{feature.featureName ?? feature.externalId}</strong>
                                                                                <span>{feature.address ?? feature.roadAddress ?? "주소 없음"}</span>
                                                                                <em>
                                                                                    {[feature.output ? `${feature.output}kW` : null, feature.useTime, feature.businessCall]
                                                                                        .filter(Boolean)
                                                                                        .join(" · ")}
                                                                                </em>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedDataset.datasetCode === EV_CHARGER_DATASET_CODE && (
                                                            <div className="dashboard-gis-region-stats mt-3">
                                                                <div className="dashboard-gis-region-stats-head">
                                                                    <div>
                                                                        <strong>시도별 충전기 비율</strong>
                                                                        <p className="mb-0">
                                                                            지도는 최대 500건만 표시하고, 통계는 원천 API 전체 건수 기준으로 계산합니다.
                                                                        </p>
                                                                    </div>
                                                                    {regionStats?.totalCount && (
                                                                        <span>전체 {formatNumber(regionStats.totalCount)}기</span>
                                                                    )}
                                                                </div>

                                                                {regionStatsLoading && (
                                                                    <div className="text-secondary small">전체 기준 시도별 통계를 불러오는 중...</div>
                                                                )}

                                                                {regionStatsError && (
                                                                    <div className="alert alert-warning py-2 small mb-0">
                                                                        {regionStatsError}
                                                                    </div>
                                                                )}

                                                                {!regionStatsLoading && !regionStatsError && hasEvChargerRegionStats && (
                                                                    <div className="dashboard-gis-region-stats-body">
                                                                        <div className="dashboard-gis-region-chart">
                                                                            <Doughnut data={evChargerRegionChartData} options={evChargerRegionChartOptions} />
                                                                        </div>
                                                                        <div className="dashboard-gis-region-rank">
                                                                            {(regionStats.items ?? []).slice(0, 6).map((item) => (
                                                                                <div className="dashboard-gis-region-rank-item" key={item.areaCode}>
                                                                                    <span>{item.areaName}</span>
                                                                                    <strong>
                                                                                        {formatNumber(item.count)}기 · {Number(item.percent ?? 0).toFixed(2)}%
                                                                                    </strong>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {!regionStatsLoading && !regionStatsError && !hasEvChargerRegionStats && (
                                                                    <div className="text-secondary small">
                                                                        아직 전체 기준 시도별 통계가 수집되지 않았습니다. 수집 후 원형 그래프가 표시됩니다.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : canRenderObservationData ? (
                                                    <div className="dashboard-gis-observation-preview">
                                                        <DashboardGisCollectionSummary dataset={selectedDataset} />

                                                        <div className="dashboard-gis-observation-box mt-3">
                                                            <div className="dashboard-gis-observation-head">
                                                                <div>
                                                                    <strong>{shouldRenderObservationTable ? "최신 관측값 표" : "최신 관측값 차트"}</strong>
                                                                    <p className="mb-0">
                                                                        DB에 저장된 최신 기준일/시간의 값을 {shouldRenderObservationTable ? "수치 표로" : "차트로"} 표시합니다.
                                                                    </p>
                                                                </div>
                                                                {observationStats?.totalRowCount ? (
                                                                    <span>{formatNumber(observationStats.totalRowCount)}건</span>
                                                                ) : null}
                                                            </div>

                                                            {observationStatsLoading && (
                                                                <div className="text-secondary small">최신 관측값을 불러오는 중...</div>
                                                            )}

                                                            {observationStatsError && (
                                                                <div className="alert alert-warning py-2 small mb-0">
                                                                    {observationStatsError}
                                                                </div>
                                                            )}

                                                            {!observationStatsLoading && !observationStatsError && observationStats?.notice && (
                                                                <div className="alert alert-info py-2 small mb-3">
                                                                    {observationStats.notice}
                                                                </div>
                                                            )}

                                                            {!observationStatsLoading && !observationStatsError && hasObservationStats && shouldRenderObservationTable && (
                                                                <div className="dashboard-gis-observation-table-wrap">
                                                                    <table className="dashboard-gis-observation-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>항목/지역</th>
                                                                                <th>값</th>
                                                                                <th>기준</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {observationTableRows.map((item, index) => (
                                                                                <tr key={`${item.sourceAreaCode ?? item.label}-${observationRowKey(item, index)}`}>
                                                                                    <td>
                                                                                        <strong>{item.label ?? item.metricName ?? "-"}</strong>
                                                                                        <span>{item.sourceAreaCode ?? item.areaLevel ?? ""}</span>
                                                                                    </td>
                                                                                    <td>
                                                                                        {formatNumber(item.value)}{item.unit ?? observationStats.unit ?? ""}
                                                                                    </td>
                                                                                    <td>{formatObservationBaseTime(item, observationStats)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}

                                                            {!observationStatsLoading && !observationStatsError && hasObservationStats && !shouldRenderObservationTable && (
                                                                <div className="dashboard-gis-observation-body">
                                                                    <div className="dashboard-gis-observation-chart">
                                                                        <Bar data={observationChartData} options={observationChartOptions} />
                                                                    </div>
                                                                    <div className="dashboard-gis-observation-rank">
                                                                        {(observationStats.items ?? []).slice(0, 6).map((item, index) => (
                                                                            <div className="dashboard-gis-observation-rank-item" key={`${item.sourceAreaCode ?? item.label}-${index}`}>
                                                                                <span>{item.label}</span>
                                                                                <strong>
                                                                                    {formatNumber(item.value)}{item.unit ?? observationStats.unit ?? ""}
                                                                                </strong>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!observationStatsLoading && !observationStatsError && !hasObservationStats && (
                                                                <div className="text-secondary small">
                                                                    저장된 관측값은 있지만 최신 차트로 표시할 숫자값이 없습니다.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
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
                                            </>
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
