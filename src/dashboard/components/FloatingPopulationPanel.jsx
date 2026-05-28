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
import { getAreaFloatingPopulation } from "../api/dashBoardApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function toNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value) {
    return toNumber(value).toLocaleString();
}

function createChartData(response) {
    return {
        labels: response?.labels ?? [],
        datasets: (response?.datasets ?? []).map((dataset) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor ?? "rgba(20, 184, 166, 0.72)",
            borderColor: dataset.borderColor ?? "#0f766e",
            borderWidth: 1,
            borderRadius: 7,
            maxBarThickness: 42,
        })),
    };
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                title: (items) => items[0]?.label ?? "",
                label: (context) => `방문자 수: ${formatNumber(context.raw)}명`,
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxRotation: 0,
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

function FloatingPopulationPanel({ selectedArea }) {
    const [floatingData, setFloatingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadVisitorData = useCallback(async () => {
        if (!selectedArea?.areaCode) {
            setFloatingData(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getAreaFloatingPopulation({
                areaCode: selectedArea.areaCode,
                areaLevel: selectedArea.level,
            });
            setFloatingData(data);
        } catch (err) {
            console.error(err);
            setFloatingData(null);
            if (err.response?.status === 404) {
                setError(`DB에 저장된 유동인구 데이터가 없습니다. (${selectedArea.levelLabel ?? selectedArea.level}, areaCode=${selectedArea.areaCode})`);
                return;
            }
            setError("유동인구 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [selectedArea]);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            loadVisitorData();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [loadVisitorData]);

    const chartData = useMemo(() => createChartData(floatingData), [floatingData]);
    const rankings = floatingData?.rankings ?? [];
    const hasChartData = chartData.labels.length > 0 && chartData.datasets.length > 0;

    return (
        <div className="card shadow-sm dashboard-floating-card">
            <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                        <h5 className="fw-semibold mb-1">유동인구</h5>
                        <p className="text-secondary small mb-0">
                            선택한 자치구, 행정동, 집계구의 DB 저장 S-DoT 유동인구를 Chart.js로 표시합니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-secondary"
                        onClick={loadVisitorData}
                        disabled={loading || !selectedArea}
                        title="유동인구 새로고침"
                    >
                        <i className={`bi ${loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`} />
                    </button>
                </div>

                {selectedArea ? (
                    <div className="mb-3">
                        <div className="small text-secondary">선택 지역</div>
                        <div className="fw-bold">{selectedArea.fullName ?? selectedArea.name}</div>
                        <div className="small text-secondary">
                            {selectedArea.levelLabel ?? selectedArea.level} / 지역코드 {selectedArea.areaCode}
                        </div>
                    </div>
                ) : (
                    <div className="text-secondary small mb-3">지도에서 행정구역을 클릭하세요.</div>
                )}

                {loading && (
                    <div className="text-secondary small">유동인구 데이터를 불러오는 중...</div>
                )}

                {error && (
                    <div className="alert alert-danger py-2 small mb-0">{error}</div>
                )}

                {!loading && !error && floatingData?.notice && (
                    <div className="alert alert-warning py-2 small mb-3">{floatingData.notice}</div>
                )}

                {!loading && !error && selectedArea && !hasChartData && (
                    <div className="text-secondary small">표시할 유동인구 데이터가 없습니다.</div>
                )}

                {!loading && !error && hasChartData && (
                    <div className="floating-panel-grid">
                        <div className="floating-metric-column">
                            <div className="floating-summary-grid">
                                <div className="floating-summary-card primary">
                                    <span>총 방문자 수</span>
                                    <strong>{formatNumber(floatingData.totalVisitorCount)}명</strong>
                                </div>
                                <div className="floating-summary-card">
                                    <span>수집 건수</span>
                                    <strong>{formatNumber(floatingData.rowCount)}건</strong>
                                </div>
                                <div className="floating-summary-card">
                                    <span>측정 센서</span>
                                    <strong>{formatNumber(floatingData.sensorCount)}개</strong>
                                </div>
                            </div>

                            <div className="floating-rank-list">
                                {rankings.map((rank, index) => (
                                    <div className="floating-rank-item" key={rank.label}>
                                        <span>{index + 1}</span>
                                        <strong>{rank.label}</strong>
                                        <em>{formatNumber(rank.visitorCount)}명</em>
                                    </div>
                                ))}
                            </div>

                            <div className="small text-secondary">
                                기준일 {floatingData.baseDate ?? "-"} / 시간대 {floatingData.hour ?? "-"}시
                            </div>
                        </div>

                        <div className="floating-chart-wrap">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FloatingPopulationPanel;
