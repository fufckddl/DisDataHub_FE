import { useState } from "react";
import TopTitle from "../../components/TopTitle";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import "../../style/simulationTest.css";

const datasetInfo = [
    { label: "총 데이터 수", value: "2,847개" },
    { label: "데이터 유형", value: "좌표 기반" },
    { label: "지역 범위", value: "서울시 전역" },
    { label: "최종 업데이트", value: "2024.12." },
];

const regionOptions = ["서울시 전역", "강남구", "영등포구", "서초구", "마포구", "송파구"];
const densityOptions = ["보통 (10-30개)", "낮음 (1-10개)", "높음 (30개 이상)"];

const mapModes = [
    { id: "marker", label: "마커" },
    { id: "heat", label: "HeatMap" },
    { id: "zone", label: "영역표시" },
];

const resultTabs = [
    { id: "result", label: "결과 목록" },
    { id: "attribute", label: "속성 결과" },
    { id: "stats", label: "통계" },
];

const summaryStats = [
    { label: "총 CCTV 수", value: "12,345", tone: "default" },
    { label: "핫스팟 구역", value: "36", tone: "default" },
    { label: "평균 밀집도", value: "24.7대", tone: "default" },
    { label: "상태", value: "정상", tone: "success" },
];

const hotspotRanking = [
    { district: "강남구", score: 92.1, width: "92%" },
    { district: "영등포구", score: 78.4, width: "78%" },
    { district: "서초구", score: 74.2, width: "74%" },
    { district: "마포구", score: 58.6, width: "58%" },
    { district: "송파구", score: 55.3, width: "55%" },
];

const tableData = {
    result: {
        columns: [
            { key: "rank", label: "순위" },
            { key: "district", label: "자치구" },
            { key: "count", label: "CCTV 수" },
            { key: "density", label: "평균 밀집도 (대)" },
            { key: "hotspot", label: "핫스팟 여부" },
            { key: "note", label: "비고" },
        ],
        rows: [
            {
                rank: "1",
                district: "강남구",
                count: "1,856",
                density: "92.1",
                hotspot: "핫스팟",
                note: "역삼·삼성·코엑스 일대 밀집",
            },
            {
                rank: "2",
                district: "영등포구",
                count: "1,523",
                density: "78.4",
                hotspot: "핫스팟",
                note: "여의도·영등포역 주변 밀집",
            },
            {
                rank: "3",
                district: "서초구",
                count: "1,312",
                density: "74.2",
                hotspot: "핫스팟",
                note: "교대·서초역 상권 밀집",
            },
            {
                rank: "4",
                district: "마포구",
                count: "987",
                density: "58.6",
                hotspot: "주의",
                note: "홍대·상암 지역 밀집",
            },
            {
                rank: "5",
                district: "송파구",
                count: "842",
                density: "55.3",
                hotspot: "일반",
                note: "잠실·가락시장 일대",
            },
        ],
    },
    attribute: {
        columns: [
            { key: "id", label: "시설 ID" },
            { key: "name", label: "설치명" },
            { key: "district", label: "자치구" },
            { key: "lat", label: "위도" },
            { key: "lng", label: "경도" },
            { key: "status", label: "상태" },
        ],
        rows: [
            {
                id: "CCTV-001",
                name: "강남역 11번 출구",
                district: "강남구",
                lat: "37.4979",
                lng: "127.0276",
                status: "정상",
            },
            {
                id: "CCTV-014",
                name: "여의도 환승센터",
                district: "영등포구",
                lat: "37.5219",
                lng: "126.9246",
                status: "정상",
            },
            {
                id: "CCTV-028",
                name: "교대역 교차로",
                district: "서초구",
                lat: "37.4931",
                lng: "127.0142",
                status: "점검",
            },
            {
                id: "CCTV-043",
                name: "홍대입구 8번 출구",
                district: "마포구",
                lat: "37.5563",
                lng: "126.9236",
                status: "정상",
            },
            {
                id: "CCTV-057",
                name: "잠실새내 메인거리",
                district: "송파구",
                lat: "37.5117",
                lng: "127.0850",
                status: "정상",
            },
        ],
    },
    stats: {
        columns: [
            { key: "metric", label: "지표" },
            { key: "current", label: "현재값" },
            { key: "baseline", label: "기준값" },
            { key: "change", label: "변화" },
            { key: "result", label: "판정" },
        ],
        rows: [
            {
                metric: "총 CCTV 수",
                current: "12,345",
                baseline: "12,010",
                change: "+335",
                result: "증가",
            },
            {
                metric: "평균 밀집도",
                current: "24.7대",
                baseline: "21.5대",
                change: "+3.2",
                result: "상승",
            },
            {
                metric: "핫스팟 구역",
                current: "36",
                baseline: "31",
                change: "+5",
                result: "증가",
            },
            {
                metric: "분석 반경",
                current: "500m",
                baseline: "300m",
                change: "+200m",
                result: "확장",
            },
            {
                metric: "클러스터링",
                current: "사용",
                baseline: "미사용",
                change: "ON",
                result: "활성",
            },
        ],
    },
};

const districtLabels = [
    { name: "은평구", left: "18%", top: "18%" },
    { name: "도봉구", left: "57%", top: "10%" },
    { name: "강북구", left: "53%", top: "20%" },
    { name: "서대문구", left: "28%", top: "34%" },
    { name: "종로구", left: "49%", top: "35%" },
    { name: "동대문구", left: "64%", top: "36%" },
    { name: "마포구", left: "31%", top: "46%" },
    { name: "중구", left: "47%", top: "48%" },
    { name: "용산구", left: "45%", top: "58%" },
    { name: "영등포구", left: "22%", top: "67%" },
    { name: "관악구", left: "44%", top: "84%" },
    { name: "강남구", left: "64%", top: "76%" },
];

const markerDots = [
    { left: "11%", top: "46%" }, { left: "14%", top: "29%" }, { left: "15%", top: "75%" },
    { left: "18%", top: "61%" }, { left: "20%", top: "23%" }, { left: "21%", top: "43%" },
    { left: "22%", top: "68%" }, { left: "24%", top: "51%" }, { left: "26%", top: "35%" },
    { left: "27%", top: "57%" }, { left: "29%", top: "76%" }, { left: "32%", top: "22%" },
    { left: "33%", top: "48%" }, { left: "35%", top: "64%" }, { left: "37%", top: "82%" },
    { left: "40%", top: "31%" }, { left: "42%", top: "43%" }, { left: "44%", top: "58%" },
    { left: "46%", top: "73%" }, { left: "49%", top: "28%" }, { left: "51%", top: "40%" },
    { left: "53%", top: "52%" }, { left: "55%", top: "66%" }, { left: "57%", top: "22%" },
    { left: "59%", top: "35%" }, { left: "61%", top: "47%" }, { left: "63%", top: "63%" },
    { left: "66%", top: "30%" }, { left: "68%", top: "51%" }, { left: "70%", top: "72%" },
    { left: "73%", top: "24%" }, { left: "75%", top: "43%" }, { left: "77%", top: "60%" },
    { left: "79%", top: "78%" }, { left: "81%", top: "33%" }, { left: "84%", top: "56%" },
    { left: "86%", top: "71%" }, { left: "88%", top: "46%" }, { left: "90%", top: "25%" },
];

const heatSpots = [
    { left: "15%", top: "44%", size: "sm" },
    { left: "22%", top: "72%", size: "sm" },
    { left: "35%", top: "66%", size: "lg" },
    { left: "38%", top: "52%", size: "sm" },
    { left: "43%", top: "37%", size: "md" },
    { left: "48%", top: "39%", size: "sm" },
    { left: "57%", top: "73%", size: "lg" },
    { left: "61%", top: "78%", size: "md" },
    { left: "64%", top: "24%", size: "sm" },
    { left: "79%", top: "69%", size: "md" },
    { left: "83%", top: "50%", size: "sm" },
    { left: "87%", top: "79%", size: "sm" },
];

const clusterBubbles = [
    { left: "27%", top: "74%", value: "24" },
    { left: "44%", top: "56%", value: "18" },
    { left: "61%", top: "61%", value: "31" },
    { left: "78%", top: "39%", value: "12" },
];

const boundaryZones = [
    { left: "30%", top: "65%", width: "17%", height: "14%", rotate: "-10deg" },
    { left: "47%", top: "44%", width: "18%", height: "15%", rotate: "8deg" },
    { left: "61%", top: "74%", width: "14%", height: "12%", rotate: "-18deg" },
    { left: "80%", top: "70%", width: "16%", height: "14%", rotate: "14deg" },
];

function ToggleRow({ label, checked, onChange }) {
    return (
        <div className="simulation-test-toggle-row">
            <span>{label}</span>
            <button
                type="button"
                className={`simulation-test-switch ${checked ? "active" : ""}`}
                onClick={onChange}
                aria-pressed={checked}
            >
                <span></span>
            </button>
        </div>
    );
}

function ResultChip({ value }) {
    const chipClass =
        value === "핫스팟" || value === "증가" || value === "상승" || value === "활성"
            ? "danger"
            : value === "주의" || value === "확장" || value === "점검"
              ? "warning"
              : "success";

    return <span className={`simulation-test-chip ${chipClass}`}>{value}</span>;
}

function DataCell({ columnKey, value }) {
    if (columnKey === "hotspot" || columnKey === "status" || columnKey === "result") {
        return <ResultChip value={value} />;
    }

    if (columnKey === "change") {
        return (
            <span className={`simulation-test-change ${String(value).startsWith("+") ? "up" : ""}`}>
                {value}
            </span>
        );
    }

    return <span>{value}</span>;
}

function SimulationDatasetInfo() {
    return (
        <div className="simulation-test-panel simulation-test-info-panel card">
            <div className="simulation-test-panel-title">
                <i className="bi bi-card-list"></i>
                <span>데이터셋 정보</span>
            </div>

            <div className="simulation-test-info-list">
                {datasetInfo.map((item) => (
                    <div key={item.label} className="simulation-test-info-row">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SimulationControlPanel({
    mapMode,
    setMapMode,
    selectedRegion,
    setSelectedRegion,
    radius,
    setRadius,
    densityLevel,
    setDensityLevel,
    showHeatmap,
    setShowHeatmap,
    useClustering,
    setUseClustering,
    showBoundary,
    setShowBoundary,
    statusText,
    handleRun,
    handleReset,
}) {
    return (
        <div className="simulation-test-panel simulation-test-control-panel card">
            <div className="simulation-test-panel-title">
                <i className="bi bi-sliders"></i>
                <span>분석 조건 설정</span>
            </div>

            <div className="simulation-test-field-block">
                <div className="simulation-test-field-label">시각화 방식</div>
                <div className="simulation-test-mode-group">
                    {mapModes.map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            className={`simulation-test-mode-button ${mapMode === mode.id ? "active" : ""}`}
                            onClick={() => setMapMode(mode.id)}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="simulation-test-field-block">
                <label className="simulation-test-field-label">분석 지역</label>
                <select
                    className="form-select simulation-test-select"
                    value={selectedRegion}
                    onChange={(event) => setSelectedRegion(event.target.value)}
                >
                    {regionOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className="simulation-test-field-block">
                <div className="simulation-test-range-head">
                    <span className="simulation-test-field-label mb-0">분석 반경</span>
                    <strong>{radius}m</strong>
                </div>
                <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                />
                <div className="simulation-test-range-labels">
                    <span>100m</span>
                    <span>500m</span>
                    <span>5000m</span>
                </div>
            </div>

            <div className="simulation-test-field-block">
                <label className="simulation-test-field-label">밀도 임계값</label>
                <select
                    className="form-select simulation-test-select"
                    value={densityLevel}
                    onChange={(event) => setDensityLevel(event.target.value)}
                >
                    {densityOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className="simulation-test-field-block">
                <div className="simulation-test-field-label">표시 옵션</div>
                <div className="simulation-test-toggle-list">
                    <ToggleRow
                        label="히트맵 표시"
                        checked={showHeatmap}
                        onChange={() => setShowHeatmap((previous) => !previous)}
                    />
                    <ToggleRow
                        label="클러스터링"
                        checked={useClustering}
                        onChange={() => setUseClustering((previous) => !previous)}
                    />
                    <ToggleRow
                        label="경계선 표시"
                        checked={showBoundary}
                        onChange={() => setShowBoundary((previous) => !previous)}
                    />
                </div>
            </div>

            <div className="simulation-test-notice">
                <i className="bi bi-info-circle-fill"></i>
                <span>{statusText}</span>
            </div>

            <div className="row g-2 simulation-test-action-row">
                <div className="col-6">
                    <button
                        type="button"
                        className="btn btn-primary w-100 simulation-test-action-button"
                        onClick={handleRun}
                    >
                        <i className="bi bi-caret-right-fill me-2"></i>
                        시뮬레이션 실행
                    </button>
                </div>
                <div className="col-6">
                    <button
                        type="button"
                        className="btn btn-light border w-100 simulation-test-action-button secondary"
                        onClick={handleReset}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        초기화
                    </button>
                </div>
            </div>
        </div>
    );
}

function SimulationMapView({ mapMode, selectedRegion, radius, showHeatmap, useClustering, showBoundary }) {
    return (
        <div className="simulation-test-panel card simulation-test-map-panel h-100">
            <div className="simulation-test-map-header">
                <div className="simulation-test-panel-title mb-0">
                    <i className="bi bi-map"></i>
                    <span>지도 결과</span>
                </div>

                <div className="simulation-test-map-meta">
                    <span>{selectedRegion}</span>
                    <span>반경 {radius}m</span>
                </div>
            </div>

            <div className={`simulation-test-map-stage mode-${mapMode}`}>
                <img src={mapPreviewImg} alt="시뮬레이션 지도" className="simulation-test-map-image" />
                <div className="simulation-test-map-overlay"></div>

                {districtLabels.map((item) => (
                    <span
                        key={item.name}
                        className="simulation-test-district-label"
                        style={{ left: item.left, top: item.top }}
                    >
                        {item.name}
                    </span>
                ))}

                {markerDots.map((item, index) => (
                    <span
                        key={`${item.left}-${item.top}-${index}`}
                        className="simulation-test-map-dot"
                        style={{ left: item.left, top: item.top }}
                    ></span>
                ))}

                {showHeatmap &&
                    heatSpots.map((item, index) => (
                        <span
                            key={`${item.left}-${item.top}-${index}`}
                            className={`simulation-test-heatspot ${item.size}`}
                            style={{ left: item.left, top: item.top }}
                        ></span>
                    ))}

                {useClustering &&
                    clusterBubbles.map((item, index) => (
                        <span
                            key={`${item.left}-${item.top}-${index}`}
                            className="simulation-test-cluster-bubble"
                            style={{ left: item.left, top: item.top }}
                        >
                            {item.value}
                        </span>
                    ))}

                {(showBoundary || mapMode === "zone") &&
                    boundaryZones.map((item, index) => (
                        <span
                            key={`${item.left}-${item.top}-${index}`}
                            className="simulation-test-boundary-zone"
                            style={{
                                left: item.left,
                                top: item.top,
                                width: item.width,
                                height: item.height,
                                transform: `translate(-50%, -50%) rotate(${item.rotate})`,
                            }}
                        ></span>
                    ))}

                <div className="simulation-test-map-controls">
                    <button type="button"><i className="bi bi-plus-lg"></i></button>
                    <button type="button"><i className="bi bi-dash-lg"></i></button>
                    <button type="button"><i className="bi bi-layers"></i></button>
                    <button type="button"><i className="bi bi-fullscreen"></i></button>
                </div>

                <div className="simulation-test-legend">
                    <div className="simulation-test-legend-title">CCTV 밀집도</div>
                    <div className="simulation-test-legend-bar"></div>
                    <div className="simulation-test-legend-labels">
                        <span>낮음</span>
                        <span>중간</span>
                        <span>높음</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SimulationResultSummary() {
    return (
        <div className="simulation-test-summary-stack">
            <div className="simulation-test-panel simulation-test-summary-panel card">
                <div className="simulation-test-panel-title">
                    <i className="bi bi-clipboard-data"></i>
                    <span>분석 요약</span>
                </div>

                <div className="simulation-test-stat-grid">
                    {summaryStats.map((item) => (
                        <div key={item.label} className="simulation-test-stat-card">
                            <span>{item.label}</span>
                            <strong className={item.tone === "success" ? "success" : ""}>
                                {item.value}
                            </strong>
                        </div>
                    ))}
                </div>
            </div>

            <div className="simulation-test-panel simulation-test-summary-panel card">
                <div className="simulation-test-panel-title">
                    <i className="bi bi-bar-chart"></i>
                    <span>핫스팟 상위 자치구</span>
                </div>

                <div className="simulation-test-ranking-list">
                    {hotspotRanking.map((item, index) => (
                        <div key={item.district} className="simulation-test-ranking-row">
                            <div className="simulation-test-ranking-head">
                                <span>{index + 1}.</span>
                                <strong>{item.district}</strong>
                                <em>{item.score}</em>
                            </div>
                            <div className="simulation-test-ranking-track">
                                <span style={{ width: item.width }}></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SimulationResultTable({ selectedTab, setSelectedTab, activeTable }) {
    return (
        <div className="simulation-test-panel simulation-test-table-panel card">
            <div className="simulation-test-table-header">
                <div className="simulation-test-panel-title mb-0">
                    <i className="bi bi-table"></i>
                    <span>분석 결과 테이블</span>
                </div>

                <button type="button" className="btn btn-light border simulation-test-export-button">
                    <i className="bi bi-download me-2"></i>
                    CSV 내보내기
                </button>
            </div>

            <div className="simulation-test-tab-row">
                {resultTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`simulation-test-tab-button ${selectedTab === tab.id ? "active" : ""}`}
                        onClick={() => setSelectedTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="simulation-test-table-wrap">
                <table className="table simulation-test-table mb-0">
                    <thead>
                        <tr>
                            {activeTable.columns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {activeTable.rows.map((row, rowIndex) => (
                            <tr key={`row-${rowIndex}`}>
                                {activeTable.columns.map((column) => (
                                    <td key={column.key}>
                                        <DataCell columnKey={column.key} value={row[column.key]} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="simulation-test-table-footer">
                <span>전체 25개 중 1-5 표시</span>

                <div className="simulation-test-pagination">
                    <button type="button"><i className="bi bi-chevron-left"></i></button>
                    <button type="button" className="active">1</button>
                    <button type="button">2</button>
                    <button type="button">3</button>
                    <button type="button">4</button>
                    <button type="button">5</button>
                    <button type="button"><i className="bi bi-chevron-right"></i></button>
                </div>

                <select className="form-select simulation-test-page-size" defaultValue="5개씩 보기">
                    <option>5개씩 보기</option>
                    <option>10개씩 보기</option>
                    <option>20개씩 보기</option>
                </select>
            </div>
        </div>
    );
}

function UserDatasetSimulationTestPage() {
    const [mapMode, setMapMode] = useState("heat");
    const [selectedRegion, setSelectedRegion] = useState("서울시 전역");
    const [radius, setRadius] = useState(500);
    const [densityLevel, setDensityLevel] = useState("보통 (10-30개)");
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [useClustering, setUseClustering] = useState(true);
    const [showBoundary, setShowBoundary] = useState(false);
    const [selectedTab, setSelectedTab] = useState("result");
    const [statusText, setStatusText] = useState("조건 변경 후 시뮬레이션을 실행하세요.");

    const activeTable = tableData[selectedTab];

    const handleReset = () => {
        setMapMode("heat");
        setSelectedRegion("서울시 전역");
        setRadius(500);
        setDensityLevel("보통 (10-30개)");
        setShowHeatmap(true);
        setUseClustering(true);
        setShowBoundary(false);
        setSelectedTab("result");
        setStatusText("조건 변경 후 시뮬레이션을 실행하세요.");
    };

    const handleRun = () => {
        setStatusText(`${selectedRegion} / 반경 ${radius}m 기준 결과가 반영되었습니다.`);
    };

    return (
        <div className="container-fluid px-4 py-3 simulation-test-page">
            <div className="row mb-3">
                <div className="col">
                    <TopTitle
                        title="서울시 CCTV 위치 데이터 시뮬레이션"
                        subTitle="지도 시각화와 조건 설정을 통해 CCTV 분포와 밀집도를 확인할 수 있습니다."
                        showGuide={false}
                    />
                </div>
            </div>

            <div className="row g-3 simulation-test-main-row">
                <div className="col-12 col-xl-3 simulation-test-side-column">
                    <div className="row g-3 simulation-test-side-stack">
                        <div className="col-12">
                            <SimulationDatasetInfo />
                        </div>
                        <div className="col-12">
                            <SimulationControlPanel
                                mapMode={mapMode}
                                setMapMode={setMapMode}
                                selectedRegion={selectedRegion}
                                setSelectedRegion={setSelectedRegion}
                                radius={radius}
                                setRadius={setRadius}
                                densityLevel={densityLevel}
                                setDensityLevel={setDensityLevel}
                                showHeatmap={showHeatmap}
                                setShowHeatmap={setShowHeatmap}
                                useClustering={useClustering}
                                setUseClustering={setUseClustering}
                                showBoundary={showBoundary}
                                setShowBoundary={setShowBoundary}
                                statusText={statusText}
                                handleRun={handleRun}
                                handleReset={handleReset}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-9 simulation-test-content-column">
                    <div className="row g-3 simulation-test-content-top-row mb-1">
                        <div className="col-12 col-xxl-8 simulation-test-map-column">
                            <SimulationMapView
                                mapMode={mapMode}
                                selectedRegion={selectedRegion}
                                radius={radius}
                                showHeatmap={showHeatmap}
                                useClustering={useClustering}
                                showBoundary={showBoundary}
                            />
                        </div>

                        <div className="col-12 col-xxl-4 simulation-test-summary-column">
                            <SimulationResultSummary />
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-12">
                            <SimulationResultTable
                                selectedTab={selectedTab}
                                setSelectedTab={setSelectedTab}
                                activeTable={activeTable}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDatasetSimulationTestPage;
