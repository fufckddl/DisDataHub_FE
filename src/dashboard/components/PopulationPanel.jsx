import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AGE_GROUPS = [
    { label: "0~9세", maleKey: "MALE_F0T9_LVPOP_CO", femaleKey: "FEMALE_F0T9_LVPOP_CO" },
    { label: "10~14세", maleKey: "MALE_F10T14_LVPOP_CO", femaleKey: "FEMALE_F10T14_LVPOP_CO" },
    { label: "15~19세", maleKey: "MALE_F15T19_LVPOP_CO", femaleKey: "FEMALE_F15T19_LVPOP_CO" },
    { label: "20~24세", maleKey: "MALE_F20T24_LVPOP_CO", femaleKey: "FEMALE_F20T24_LVPOP_CO" },
    { label: "25~29세", maleKey: "MALE_F25T29_LVPOP_CO", femaleKey: "FEMALE_F25T29_LVPOP_CO" },
    { label: "30~34세", maleKey: "MALE_F30T34_LVPOP_CO", femaleKey: "FEMALE_F30T34_LVPOP_CO" },
    { label: "35~39세", maleKey: "MALE_F35T39_LVPOP_CO", femaleKey: "FEMALE_F35T39_LVPOP_CO" },
    { label: "40~44세", maleKey: "MALE_F40T44_LVPOP_CO", femaleKey: "FEMALE_F40T44_LVPOP_CO" },
    { label: "45~49세", maleKey: "MALE_F45T49_LVPOP_CO", femaleKey: "FEMALE_F45T49_LVPOP_CO" },
    { label: "50~54세", maleKey: "MALE_F50T54_LVPOP_CO", femaleKey: "FEMALE_F50T54_LVPOP_CO" },
    { label: "55~59세", maleKey: "MALE_F55T59_LVPOP_CO", femaleKey: "FEMALE_F55T59_LVPOP_CO" },
    { label: "60~64세", maleKey: "MALE_F60T64_LVPOP_CO", femaleKey: "FEMALE_F60T64_LVPOP_CO" },
    { label: "65~69세", maleKey: "MALE_F65T69_LVPOP_CO", femaleKey: "FEMALE_F65T69_LVPOP_CO" },
    { label: "70~74세", maleKey: "MALE_F70T74_LVPOP_CO", femaleKey: "FEMALE_F70T74_LVPOP_CO" },
];

function toNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatPopulation(value) {
    return Math.round(toNumber(value)).toLocaleString();
}

function getPopulationRow(populationData) {
    const rows =
        populationData?.SPOP_LOCAL_RESD_DONG?.row ??
        populationData?.SPOP_LOCAL_RESD_JACHI?.row;
    if (Array.isArray(rows)) {
        return rows[0] ?? null;
    }

    return rows ?? null;
}

function createChartData(row) {
    const labels = AGE_GROUPS.map((group) => group.label);
    const maleData = AGE_GROUPS.map((group) => toNumber(row[group.maleKey]));
    const femaleData = AGE_GROUPS.map((group) => toNumber(row[group.femaleKey]));

    return {
        labels,
        datasets: [
            {
                label: "남성",
                data: maleData,
                backgroundColor: "rgba(37, 99, 235, 0.72)",
                borderColor: "#2563eb",
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: "여성",
                data: femaleData,
                backgroundColor: "rgba(236, 72, 153, 0.68)",
                borderColor: "#ec4899",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };
}

function createChartDataFromResponse(response) {
    return {
        labels: response.labels ?? [],
        datasets: (response.datasets ?? []).map((dataset, index) => ({
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

const chartOptions = {
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
                label: (context) => `${context.dataset.label}: ${formatPopulation(context.raw)}명`,
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxRotation: 60,
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

function PopulationPanel({ selectedArea, populationData, queryDate, notice, loading, error }) {
    const chartResponse = populationData?.labels && populationData?.datasets ? populationData : null;
    const populationRow = chartResponse ? null : getPopulationRow(populationData);
    const chartData = chartResponse
        ? createChartDataFromResponse(chartResponse)
        : populationRow
          ? createChartData(populationRow)
          : null;
    const totalPopulation = chartResponse?.totalPopulation ?? populationRow?.TOT_LVPOP_CO;
    const maleTotal = chartResponse?.malePopulation ?? (populationRow
        ? AGE_GROUPS.reduce((sum, group) => sum + toNumber(populationRow[group.maleKey]), 0)
        : 0);
    const femaleTotal = chartResponse?.femalePopulation ?? (populationRow
        ? AGE_GROUPS.reduce((sum, group) => sum + toNumber(populationRow[group.femaleKey]), 0)
        : 0);
    const baseDate = chartResponse?.baseDate ?? populationRow?.STDR_DE_ID ?? queryDate;
    const hour = chartResponse?.hour ?? populationRow?.TMZON_PD_SE;

    return (
        <div className="card shadow-sm h-100 dashboard-population-card">
            <div className="card-body d-flex flex-column">
                <h5 className="fw-semibold mb-1">생활인구</h5>
                <p className="text-secondary small mb-3">
                    지도에서 구 또는 동을 클릭하면 서울 생활인구 데이터를 Chart.js로 표시합니다.
                </p>

                {selectedArea ? (
                    <div className="mb-3">
                        <div className="small text-secondary">선택 지역</div>
                        <div className="fw-bold">{selectedArea.fullName ?? selectedArea.name}</div>
                        <div className="small text-secondary">
                            지역코드 {selectedArea.areaCode}
                        </div>
                        {selectedArea.level && (
                            <div className="small text-secondary">
                                경계 단계 {selectedArea.level === "SIGUNGU" ? "구" : "동"}
                            </div>
                        )}
                        {queryDate && (
                            <div className="small text-secondary mt-1">
                                조회 기준일 {queryDate}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-secondary small mb-3">지도에서 행정구역을 클릭하세요.</div>
                )}

                {loading && (
                    <div className="text-secondary small">데이터를 불러오는 중...</div>
                )}

                {error && (
                    <div className="alert alert-danger py-2 small mb-0">{error}</div>
                )}

                {notice && !error && (
                    <div className="alert alert-warning py-2 small mb-3">{notice}</div>
                )}

                {!loading && !error && chartData && (
                    <div className="flex-grow-1 d-flex flex-column gap-3">
                        <div className="population-summary-grid">
                            <div className="population-summary-card">
                                <span>전체</span>
                                <strong>{formatPopulation(totalPopulation)}명</strong>
                            </div>
                            <div className="population-summary-card male">
                                <span>남성</span>
                                <strong>{formatPopulation(maleTotal)}명</strong>
                            </div>
                            <div className="population-summary-card female">
                                <span>여성</span>
                                <strong>{formatPopulation(femaleTotal)}명</strong>
                            </div>
                        </div>

                        <div className="population-chart-wrap">
                            <Bar data={chartData} options={chartOptions} />
                        </div>

                        <div className="small text-secondary">
                            기준일 {baseDate ?? "-"} / 시간대 {hour ?? "-"}시
                        </div>
                    </div>
                )}

                {!loading && !error && selectedArea && !chartData && (
                    <div className="text-secondary small">
                        표시할 생활인구 데이터가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

export default PopulationPanel;
