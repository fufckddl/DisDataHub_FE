import { useState } from "react";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest2.css";

const datasetInfo = [
    { label: "총 데이터 수", value: "2,847개" },
    { label: "데이터 유형", value: "좌표 기반" },
    { label: "지역 범위", value: "서울시 전역" },
    { label: "최종 업데이트", value: "2024.12" },
];

const detailInfo = [
    { label: "제공 기관", value: "서울시 열린데이터광장" },
    { label: "갱신 주기", value: "월 1회" },
    { label: "파일 형식", value: "CSV / GeoJSON" },
    { label: "좌표계", value: "EPSG:4326" },
];

const regionOptions = ["서울시 전역", "강남구", "영등포구", "서초구", "마포구", "송파구"];
const densityOptions = ["보통 (10-30개)", "낮음 (1-10개)", "높음 (30개 이상)"];
const viewModes = [
    { id: "radius", label: "반경 분석" },
    { id: "heat", label: "HeatMap" },
    { id: "cluster", label: "클러스터" },
];

const summaryCards = [
    { label: "분석 지점", value: "36개", helper: "현재 화면 기준" },
    { label: "고밀도 구역", value: "4개", helper: "주의 필요" },
    { label: "평균 반경", value: "620m", helper: "선택 옵션 반영" },
];

const hotspotBars = [
    { name: "강남구", value: 92, tone: "high" },
    { name: "영등포구", value: 78, tone: "mid" },
    { name: "서초구", value: 74, tone: "mid" },
    { name: "마포구", value: 58, tone: "normal" },
];

const resultRows = [
    {
        rank: "1",
        district: "강남구",
        cctv: "1,856",
        density: "92.1",
        level: "높음",
        note: "역삼·삼성 상권 집중",
    },
    {
        rank: "2",
        district: "영등포구",
        cctv: "1,523",
        density: "78.4",
        level: "높음",
        note: "여의도·영등포역 권역",
    },
    {
        rank: "3",
        district: "서초구",
        cctv: "1,312",
        density: "74.2",
        level: "보통",
        note: "교대·서초역 상권",
    },
    {
        rank: "4",
        district: "마포구",
        cctv: "987",
        density: "58.6",
        level: "보통",
        note: "홍대·상암 권역",
    },
    {
        rank: "5",
        district: "송파구",
        cctv: "842",
        density: "55.3",
        level: "낮음",
        note: "잠실 생활권",
    },
];

const mapZones = [
    { id: "a", left: "29%", top: "52%", size: 300, tone: "normal" },
    { id: "b", left: "61%", top: "34%", size: 226, tone: "normal" },
    { id: "c", left: "73%", top: "69%", size: 262, tone: "high" },
    { id: "d", left: "43%", top: "78%", size: 182, tone: "normal" },
];

const mapPoints = [
    { id: "p1", left: "27%", top: "48%", tone: "normal" },
    { id: "p2", left: "32%", top: "57%", tone: "normal" },
    { id: "p3", left: "59%", top: "32%", tone: "normal" },
    { id: "p4", left: "57%", top: "27%", tone: "normal" },
    { id: "p5", left: "70%", top: "64%", tone: "high" },
    { id: "p6", left: "73%", top: "72%", tone: "high" },
    { id: "p7", left: "42%", top: "76%", tone: "normal" },
    { id: "p8", left: "44%", top: "81%", tone: "normal" },
];

const clusterBadges = [
    { id: "c1", left: "31%", top: "49%", value: "12" },
    { id: "c2", left: "60%", top: "31%", value: "9" },
    { id: "c3", left: "73%", top: "67%", value: "15" },
    { id: "c4", left: "44%", top: "77%", value: "6" },
];

function ToggleRow({ label, checked, onChange }) {
    return (
        <div className="simulation-test2-toggle-row">
            <span>{label}</span>
            <button
                type="button"
                className={`simulation-test2-switch ${checked ? "active" : ""}`}
                onClick={onChange}
                aria-pressed={checked}
            >
                <span></span>
            </button>
        </div>
    );
}

function SummaryCard({ item }) {
    return (
        <div className="simulation-test2-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
        </div>
    );
}

function ResultChip({ level }) {
    const chipClass =
        level === "높음" ? "high" : level === "보통" ? "mid" : "low";

    return <span className={`simulation-test2-chip ${chipClass}`}>{level}</span>;
}

function UserDatasetSimulationTestPage2() {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState("강남구");
    const [radius, setRadius] = useState(500);
    const [densityLevel, setDensityLevel] = useState("보통 (10-30개)");
    const [viewMode, setViewMode] = useState("radius");
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showCluster, setShowCluster] = useState(false);
    const [statusText, setStatusText] = useState("조건을 조정한 뒤 시뮬레이션을 실행해 주세요.");

    const handleReset = () => {
        setSelectedRegion("강남구");
        setRadius(500);
        setDensityLevel("보통 (10-30개)");
        setViewMode("radius");
        setShowHeatmap(true);
        setShowCluster(false);
        setStatusText("조건을 조정한 뒤 시뮬레이션을 실행해 주세요.");
    };

    const handleRun = () => {
        setStatusText(`${selectedRegion} / 반경 ${radius}m 기준 시뮬레이션 결과가 반영되었습니다.`);
    };

    return (
        <div className="container-fluid px-4 py-3 simulation-test2-page">
            <div className="row mb-3">
                <div className="col">
                    <TopTitle
                        title="서울시 CCTV 위치 데이터 시뮬레이션"
                        subTitle="시뮬레이션 설정 패널과 지도 중심 분석 화면을 통해 CCTV 분포와 밀집 반경을 확인할 수 있습니다."
                        showGuide={false}
                    />
                </div>
            </div>

            <div className={`simulation-test2-workspace ${isPanelOpen ? "panel-open" : "panel-collapsed"}`}>
                <aside className="simulation-test2-sidebar">
                    <div className="simulation-test2-side-card">
                        <div className="simulation-test2-section">
                            <div className="simulation-test2-section-title">
                                <i className="bi bi-layers"></i>
                                <span>데이터셋 정보</span>
                            </div>

                            <div className="simulation-test2-info-list">
                                {datasetInfo.map((item) => (
                                    <div key={item.label} className="simulation-test2-info-row">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="simulation-test2-divider"></div>

                        <div className="simulation-test2-section">
                            <div className="simulation-test2-section-title">
                                <i className="bi bi-funnel"></i>
                                <span>분석 조건 설정</span>
                            </div>

                            <div className="simulation-test2-field-block">
                                <label className="simulation-test2-label">분석 지역</label>
                                <select
                                    className="form-select simulation-test2-select"
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

                            <div className="simulation-test2-field-block">
                                <div className="simulation-test2-range-head">
                                    <span className="simulation-test2-label mb-0">분석 반경 (미터)</span>
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
                                <div className="simulation-test2-range-labels">
                                    <span>100m</span>
                                    <span>500m</span>
                                    <span>5000m</span>
                                </div>
                            </div>

                            <div className="simulation-test2-field-block">
                                <label className="simulation-test2-label">밀도 임계값</label>
                                <select
                                    className="form-select simulation-test2-select"
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

                            <div className="simulation-test2-field-block">
                                <div className="simulation-test2-label">표현 방식</div>
                                <div className="simulation-test2-mode-group">
                                    {viewModes.map((mode) => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            className={`simulation-test2-mode-button ${viewMode === mode.id ? "active" : ""}`}
                                            onClick={() => setViewMode(mode.id)}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="simulation-test2-field-block">
                                <div className="simulation-test2-label">표시 옵션</div>
                                <div className="simulation-test2-toggle-list">
                                    <ToggleRow
                                        label="히트맵 표시"
                                        checked={showHeatmap}
                                        onChange={() => setShowHeatmap((previous) => !previous)}
                                    />
                                    <ToggleRow
                                        label="클러스터링"
                                        checked={showCluster}
                                        onChange={() => setShowCluster((previous) => !previous)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="simulation-test2-status-box">
                            <i className="bi bi-info-circle-fill"></i>
                            <span>{statusText}</span>
                        </div>

                        <div className="row g-2 simulation-test2-action-row">
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100 simulation-test2-action-button"
                                    onClick={handleRun}
                                >
                                    <i className="bi bi-play-fill me-2"></i>
                                    실행
                                </button>
                            </div>
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-light border w-100 simulation-test2-action-button secondary"
                                    onClick={handleReset}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="simulation-test2-map-column">
                    <section className="simulation-test2-map-card">
                        <button
                            type="button"
                            className={`simulation-test2-panel-toggle ${isPanelOpen ? "is-open" : "is-collapsed"}`}
                            onClick={() => setIsPanelOpen((previous) => !previous)}
                            aria-label={isPanelOpen ? "설정 패널 닫기" : "설정 패널 열기"}
                        >
                            <i className={`bi ${isPanelOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
                        </button>

                        <div className="simulation-test2-map-toolbar">
                            <div>
                                <div className="simulation-test2-map-title">지도 중심 분석</div>
                                <div className="simulation-test2-map-subtitle">
                                    선택한 조건을 기준으로 반경과 밀집도를 시각화합니다.
                                </div>
                            </div>
                            <div className="simulation-test2-map-chips">
                                <span>{selectedRegion}</span>
                                <span>{radius}m</span>
                                <span>{densityLevel}</span>
                            </div>
                        </div>

                        <div className={`simulation-test2-map-stage mode-${viewMode}`}>
                            <div className="simulation-test2-map-grid"></div>

                            {mapZones.map((zone) => (
                                <div
                                    key={zone.id}
                                    className={`simulation-test2-zone ${zone.tone} ${showHeatmap ? "show-zone" : "soft-zone"}`}
                                    style={{
                                        left: zone.left,
                                        top: zone.top,
                                        width: `${zone.size}px`,
                                        height: `${zone.size}px`,
                                    }}
                                ></div>
                            ))}

                            {mapPoints.map((point) => (
                                <div
                                    key={point.id}
                                    className={`simulation-test2-point ${point.tone}`}
                                    style={{ left: point.left, top: point.top }}
                                ></div>
                            ))}

                            {showCluster &&
                                clusterBadges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="simulation-test2-cluster-badge"
                                        style={{ left: badge.left, top: badge.top }}
                                    >
                                        {badge.value}
                                    </div>
                                ))}

                            <div className="simulation-test2-map-controls">
                                <button type="button"><i className="bi bi-plus-lg"></i></button>
                                <button type="button"><i className="bi bi-dash-lg"></i></button>
                                <button type="button"><i className="bi bi-crosshair"></i></button>
                            </div>

                            <div className="simulation-test2-legend">
                                <div className="simulation-test2-legend-title">범례</div>
                                <div className="simulation-test2-legend-row">
                                    <span className="dot normal"></span>
                                    <span>정상 밀도</span>
                                </div>
                                <div className="simulation-test2-legend-row">
                                    <span className="dot high"></span>
                                    <span>높은 밀도</span>
                                </div>
                                <div className="simulation-test2-legend-row">
                                    <span className="circle"></span>
                                    <span>분석 반경</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="simulation-test2-bottom-grid">
                        <section className="simulation-test2-bottom-card">
                            <div className="simulation-test2-bottom-title">
                                <i className="bi bi-info-circle"></i>
                                <span>데이터 요약</span>
                            </div>
                            <div className="simulation-test2-detail-list">
                                {detailInfo.map((item) => (
                                    <div key={item.label} className="simulation-test2-detail-row">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="simulation-test2-bottom-card">
                            <div className="simulation-test2-bottom-title">
                                <i className="bi bi-bar-chart-line"></i>
                                <span>핫스팟 분포</span>
                            </div>
                            <div className="simulation-test2-chart-list">
                                {hotspotBars.map((item) => (
                                    <div key={item.name} className="simulation-test2-chart-row">
                                        <div className="simulation-test2-chart-head">
                                            <span>{item.name}</span>
                                            <strong>{item.value}</strong>
                                        </div>
                                        <div className="simulation-test2-chart-track">
                                            <div
                                                className={`simulation-test2-chart-bar ${item.tone}`}
                                                style={{ width: `${item.value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="simulation-test2-bottom-card">
                            <div className="simulation-test2-bottom-title">
                                <i className="bi bi-graph-up"></i>
                                <span>결과 요약</span>
                            </div>
                            <div className="simulation-test2-summary-grid">
                                {summaryCards.map((item) => (
                                    <SummaryCard key={item.label} item={item} />
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="simulation-test2-table-card">
                        <div className="simulation-test2-table-header">
                            <div className="simulation-test2-bottom-title mb-0">
                                <i className="bi bi-table"></i>
                                <span>분석 결과 테이블</span>
                            </div>
                            <button type="button" className="btn btn-light border simulation-test2-export-button">
                                <i className="bi bi-download me-2"></i>
                                CSV 내보내기
                            </button>
                        </div>

                        <div className="simulation-test2-table-wrap">
                            <table className="table simulation-test2-table mb-0">
                                <thead>
                                    <tr>
                                        <th>순위</th>
                                        <th>자치구</th>
                                        <th>CCTV 수</th>
                                        <th>평균 밀집도</th>
                                        <th>밀집 수준</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultRows.map((row) => (
                                        <tr key={row.rank}>
                                            <td>{row.rank}</td>
                                            <td>{row.district}</td>
                                            <td>{row.cctv}</td>
                                            <td>{row.density}</td>
                                            <td><ResultChip level={row.level} /></td>
                                            <td>{row.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default UserDatasetSimulationTestPage2;
