import { useMemo } from "react";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useDashboardInsights } from "../hooks/useDashboardInsights";
import { INSIGHT_DATASETS } from "./dashboardInsightDefinitions";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const chartColors = [
    "#2563eb",
    "#14b8a6",
    "#f97316",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f59e0b",
];

function toNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}

function formatNumber(value, { decimals = 0, signed = false } = {}) {
    const numberValue = toNumber(value);
    if (numberValue === null) {
        return "-";
    }

    const formatted = numberValue.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
    });

    if (signed && numberValue > 0) {
        return `+${formatted}`;
    }

    return formatted;
}

function formatValue(item, definition) {
    if (!item) {
        return "-";
    }

    return `${formatNumber(item.value, {
        decimals: definition.decimals ?? 0,
        signed: definition.signed ?? false,
    })}${item.unit ?? ""}`;
}

function getPrimaryItem(stats, definition, selectedAreaName) {
    const items = stats?.items ?? [];
    if (items.length === 0) {
        return null;
    }

    if (definition.kpiAggregation === "sum" || definition.kpiAggregation === "average") {
        const total = toNumber(stats?.totalNumericValue);
        const count = toNumber(stats?.totalRowCount);
        if (total !== null && (definition.kpiAggregation === "sum" || (count !== null && count > 0))) {
            return {
                ...items[0],
                label: selectedAreaName ?? items[0]?.label,
                metricName: stats?.metricName ?? items[0]?.metricName,
                unit: stats?.unit ?? items[0]?.unit,
                value: definition.kpiAggregation === "average" ? total / count : total,
            };
        }
    }

    if (definition.preferredLabels?.length) {
        const preferred = items.find((item) => {
            const label = `${item.label ?? ""} ${item.metricName ?? ""}`;
            return definition.preferredLabels.some((keyword) => label.includes(keyword));
        });

        if (preferred) {
            return preferred;
        }
    }

    return items[0];
}

function getPopulationTotal(populationData) {
    const total = toNumber(populationData?.totalPopulation);
    if (total !== null) {
        return total;
    }

    const rows =
        populationData?.SPOP_LOCAL_RESD_DONG?.row ??
        populationData?.SPOP_LOCAL_RESD_JACHI?.row;
    const row = Array.isArray(rows) ? rows[0] : rows;

    return toNumber(row?.TOT_LVPOP_CO);
}

function createObservationChartData(stats, definition) {
    const items = (stats?.items ?? []).slice(0, 8);

    return {
        labels: items.map((item) => item.label ?? item.metricName ?? item.sourceAreaCode ?? "-"),
        datasets: [
            {
                label: stats?.metricName ?? definition.title,
                data: items.map((item) => Number(item.value ?? 0)),
                units: items.map((item) => item.unit ?? stats?.unit ?? ""),
                metricNames: items.map((item) => item.metricName ?? stats?.metricName ?? definition.title),
                backgroundColor: items.map((_, index) => chartColors[index % chartColors.length]),
                borderColor: "#ffffff",
                borderWidth: 1,
                borderRadius: 7,
            },
        ],
    };
}

function createObservationChartOptions(definition) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const metricName = context.dataset.metricNames?.[context.dataIndex] ?? context.dataset.label;
                        const unit = context.dataset.units?.[context.dataIndex] ?? "";
                        return `${metricName}: ${formatNumber(context.raw, {
                            decimals: definition.decimals ?? 0,
                            signed: definition.signed ?? false,
                        })}${unit}`;
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
                    color: "#94a3b8",
                    maxRotation: 40,
                    minRotation: 0,
                },
            },
            y: {
                beginAtZero: definition.key !== "populationChange",
                grid: {
                    color: "rgba(148, 163, 184, 0.16)",
                },
                ticks: {
                    color: "#94a3b8",
                    callback: (value) => formatNumber(value, {
                        decimals: definition.decimals ?? 0,
                        signed: definition.signed ?? false,
                    }),
                },
            },
        },
    };
}

function tableRowKey(item, index) {
    return [
        item?.label,
        item?.metricName,
        item?.value,
        item?.unit,
        item?.baseDate,
        item?.baseHour,
    ].filter(Boolean).join(":") || `row-${index}`;
}

function getTableRows(stats) {
    const seen = new Set();
    const rows = [];

    for (const item of stats?.items ?? []) {
        const key = tableRowKey(item, rows.length);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        rows.push(item);
        if (rows.length >= 8) {
            break;
        }
    }

    return rows;
}

function formatBaseTime(item, stats) {
    const baseDate = item?.baseDate ?? stats?.baseDate;
    const baseHour = item?.baseHour ?? stats?.baseHour;
    if (!baseDate && !baseHour) {
        return "-";
    }
    return `${baseDate ?? ""}${baseHour ? ` ${baseHour}시` : ""}`.trim();
}

function DashboardKpiCard({ label, value, meta, icon, tone, loading, error }) {
    return (
        <div className={`dashboard-insight-kpi ${tone ?? "blue"}`}>
            <div className="dashboard-insight-kpi-icon">
                <i className={`bi ${icon}`} />
            </div>
            <div>
                <span>{label}</span>
                <strong>{loading ? "조회 중" : error ? "확인 필요" : value}</strong>
                <em>{error ?? meta}</em>
            </div>
        </div>
    );
}

function DatasetValueTableCard({ definition, stats, loading, error }) {
    const rows = useMemo(() => getTableRows(stats), [stats]);
    const hasItems = rows.length > 0;

    return (
        <section className={`dashboard-insight-chart-card ${definition.tone}`}>
            <div className="dashboard-insight-chart-head">
                <div>
                    <strong>{definition.title}</strong>
                    <p>{definition.description}</p>
                </div>
                <span>
                    {stats?.baseDate ?? "-"}
                    {stats?.baseHour ? ` ${stats.baseHour}시` : ""}
                </span>
            </div>

            {loading && (
                <div className="dashboard-insight-empty">지표를 불러오는 중...</div>
            )}

            {error && (
                <div className="dashboard-insight-empty warning">{error}</div>
            )}

            {!loading && !error && stats?.notice && (
                <div className="dashboard-insight-notice">{stats.notice}</div>
            )}

            {!loading && !error && hasItems && (
                <div className="dashboard-insight-value-table-wrap">
                    <table className="dashboard-insight-value-table">
                        <thead>
                            <tr>
                                <th>항목</th>
                                <th>값</th>
                                <th>기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item, index) => (
                                <tr key={`${definition.key}-${tableRowKey(item, index)}`}>
                                    <td>
                                        <strong>{item.label ?? item.metricName ?? "-"}</strong>
                                        <span>{item.sourceAreaCode ?? item.areaLevel ?? ""}</span>
                                    </td>
                                    <td>
                                        {formatValue(item, definition)}
                                    </td>
                                    <td>{formatBaseTime(item, stats)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && !hasItems && (
                <div className="dashboard-insight-empty">표시할 최신 지표가 없습니다.</div>
            )}
        </section>
    );
}

function DatasetChartCard({ definition, stats, loading, error }) {
    const hasItems = Boolean(stats?.items?.length);
    const chartData = useMemo(
        () => createObservationChartData(stats, definition),
        [definition, stats]
    );
    const chartOptions = useMemo(
        () => createObservationChartOptions(definition),
        [definition]
    );

    return (
        <section className={`dashboard-insight-chart-card ${definition.tone}`}>
            <div className="dashboard-insight-chart-head">
                <div>
                    <strong>{definition.title}</strong>
                    <p>{definition.description}</p>
                </div>
                <span>
                    {stats?.baseDate ?? "-"}
                    {stats?.baseHour ? ` ${stats.baseHour}시` : ""}
                </span>
            </div>

            {loading && (
                <div className="dashboard-insight-empty">지표를 불러오는 중...</div>
            )}

            {error && (
                <div className="dashboard-insight-empty warning">{error}</div>
            )}

            {!loading && !error && stats?.notice && (
                <div className="dashboard-insight-notice">{stats.notice}</div>
            )}

            {!loading && !error && hasItems && (
                <div className="dashboard-insight-chart-body">
                    <div className="dashboard-insight-chart-wrap">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    <div className="dashboard-insight-rank-list">
                        {(stats.items ?? []).slice(0, 5).map((item, index) => (
                            <div className="dashboard-insight-rank-item" key={`${definition.key}-${item.label}-${index}`}>
                                <span>{index + 1}</span>
                                <strong>{item.label ?? item.metricName ?? "-"}</strong>
                                <em>{formatValue(item, definition)}</em>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !error && !hasItems && (
                <div className="dashboard-insight-empty">표시할 최신 지표가 없습니다.</div>
            )}
        </section>
    );
}

export function DashboardInsightSummaryPanel({
    selectedArea,
    populationData,
    populationLoading,
    populationError,
    insightState,
}) {
    const insights = insightState?.insights ?? {};
    const loading = Boolean(insightState?.loading);
    const errorByDataset = insightState?.errorByDataset ?? {};
    const selectedAreaName = selectedArea?.fullName ?? selectedArea?.name ?? "전국";
    const populationTotal = getPopulationTotal(populationData);

    const kpiCards = [
        {
            key: "population",
            label: "생활인구",
            value: selectedArea
                ? populationTotal === null
                    ? "-"
                    : `${formatNumber(populationTotal)}명`
                : "지역 선택",
            meta: selectedArea
                ? populationData?.baseDate
                    ? `기준일 ${populationData.baseDate}`
                    : selectedAreaName
                : "지도에서 지역을 선택하면 표시",
            icon: "bi-people",
            tone: "navy",
            loading: populationLoading,
            error: selectedArea ? populationError : null,
        },
        ...INSIGHT_DATASETS.map((definition) => {
            const stats = insights[definition.key];
            const item = getPrimaryItem(stats, definition, selectedAreaName);

            return {
                key: definition.key,
                label: definition.kpiLabel,
                value: formatValue(item, definition),
                meta: item?.label ?? stats?.notice ?? stats?.baseDate ?? "최신 저장값",
                icon: definition.icon,
                tone: definition.tone,
                loading,
                error: errorByDataset[definition.key],
            };
        }),
    ];

    return (
        <div className="dashboard-insight-panel">
            <div className="dashboard-insight-header">
                <div>
                    <h5>지역 주요 현황</h5>
                    <p>
                        {selectedAreaName} 기준으로 생활인구, 세대, 평균연령, 인구 증감, 날씨와 대기질을 바로 확인합니다.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-light text-secondary"
                    onClick={insightState?.refresh}
                    disabled={loading}
                    title="주요 현황 새로고침"
                >
                    <i className={`bi ${loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"} me-1`} />
                    새로고침
                </button>
            </div>

            <div className="dashboard-insight-kpi-grid">
                {kpiCards.map((card) => (
                    <DashboardKpiCard
                        key={card.key}
                        label={card.label}
                        value={card.value}
                        meta={card.meta}
                        icon={card.icon}
                        tone={card.tone}
                        loading={card.loading}
                        error={card.error}
                    />
                ))}
            </div>
        </div>
    );
}

export function DashboardInsightChartsPanel({ insightState }) {
    const insights = insightState?.insights ?? {};
    const loading = Boolean(insightState?.loading);
    const errorByDataset = insightState?.errorByDataset ?? {};

    return (
        <div className="dashboard-insight-panel">
            <div className="dashboard-insight-header">
                <div>
                    <h5>주요 지표 상세</h5>
                    <p>저장된 최신 공공데이터를 차트와 수치 표로 확인합니다.</p>
                </div>
            </div>
            <div className="dashboard-insight-chart-grid">
                {INSIGHT_DATASETS.map((definition) => {
                    const DetailCard = definition.detailDisplay === "table"
                        ? DatasetValueTableCard
                        : DatasetChartCard;

                    return (
                        <DetailCard
                            key={definition.key}
                            definition={definition}
                            stats={insights[definition.key]}
                            loading={loading}
                            error={errorByDataset[definition.key]}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function DashboardInsightsPanel(props) {
    const insightState = useDashboardInsights(props.selectedArea);

    return (
        <div className="dashboard-insight-stack">
            <DashboardInsightSummaryPanel {...props} insightState={insightState} />
            <DashboardInsightChartsPanel insightState={insightState} />
        </div>
    );
}

export default DashboardInsightsPanel;
