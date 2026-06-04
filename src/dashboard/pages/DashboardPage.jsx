import { useCallback, useEffect, useRef, useState } from "react";
import DashboardMap from "../components/DashboardMap";
import {
    DashboardInsightChartsPanel,
    DashboardInsightSummaryPanel,
} from "../components/DashboardInsightsPanel";
import { useDashboardInsights } from "../hooks/useDashboardInsights";
import PopulationPanel from "../components/PopulationPanel";
import { getAreaPopulation } from "../api/dashBoardApi";
import "./DashboardPage.css";

function formatDashboardTimestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    return [
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    ].join(" ");
}

function getSelectedAreaName(selectedArea) {
    return selectedArea?.fullName ?? selectedArea?.name ?? "전국";
}

const MAP_LEVEL_CONTROLS = [
    { level: "SIDO", label: "시도" },
    { level: "SIGUNGU", label: "시군구" },
    { level: "EUPMYEONDONG", label: "행정동" },
];

function DashboardControlBar({ selectedArea, mapLevel, insightState, loading, onRefresh }) {
    const selectedAreaName = getSelectedAreaName(selectedArea);
    const isRefreshing = loading || Boolean(insightState?.loading);

    return (
        <section className="dashboard-controlbar" aria-label="대시보드 지도 제어">
            <div className="dashboard-control-left">
                <span className="dashboard-control-select">
                    <i className="bi bi-diagram-3" />
                    지역
                </span>
                <span className="dashboard-control-time">{formatDashboardTimestamp()} KST</span>
                <button
                    type="button"
                    className="dashboard-control-button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="대시보드 데이터 새로고침"
                >
                    <i className={`bi ${isRefreshing ? "bi-arrow-repeat" : "bi-arrow-clockwise"}`} />
                    {isRefreshing ? "갱신 중" : "갱신"}
                </button>
            </div>

            <div className="dashboard-control-mid">
                {MAP_LEVEL_CONTROLS.map((control) => (
                    <span
                        key={control.level}
                        className={`dashboard-control-pill ${mapLevel === control.level ? "active" : ""}`}
                    >
                        {control.label}
                    </span>
                ))}
            </div>

            <div className="dashboard-control-right">
                <span className="dashboard-control-location">
                    <i className="bi bi-crosshair" />
                    {selectedAreaName}
                </span>
            </div>
        </section>
    );
}

function DashboardSidePanel({
    selectedArea,
    populationData,
    queryDate,
    populationNotice,
    loading,
    error,
    insightState,
    isOpen,
    onClearSelection,
}) {
    return (
        <aside
            className={`dashboard-side-panel ${isOpen ? "open" : "closed"}`}
            aria-hidden={!isOpen}
            aria-label="선택 지역 상세 정보"
        >
            <div className="dashboard-side-head">
                <div>
                    <span>선택 지역</span>
                    <h3>{getSelectedAreaName(selectedArea)}</h3>
                    <p>
                        {selectedArea
                            ? `${selectedArea.levelLabel ?? selectedArea.level} / 지역코드 ${selectedArea.areaCode}`
                            : "지도에서 Polygon을 선택하세요."}
                    </p>
                </div>
                <button
                    type="button"
                    className="dashboard-icon-button"
                    onClick={onClearSelection}
                    disabled={!selectedArea || !isOpen}
                    aria-label="통계 패널 닫기"
                    title="통계 패널 닫기"
                >
                    <i className="bi bi-x-lg" />
                </button>
            </div>

            <div className="dashboard-side-tabs" aria-label="대시보드 상세 구분">
                <span className="active">요약</span>
                <span>생활인구</span>
                <span>지표</span>
            </div>

            <div className="dashboard-side-section">
                <DashboardInsightSummaryPanel
                    selectedArea={selectedArea}
                    populationData={populationData}
                    populationLoading={loading}
                    populationError={error}
                    insightState={insightState}
                />
            </div>

            <div className="dashboard-side-section">
                <PopulationPanel
                    selectedArea={selectedArea}
                    populationData={populationData}
                    queryDate={queryDate}
                    notice={populationNotice}
                    loading={loading}
                    error={error}
                />
            </div>

            <div className="dashboard-side-section">
                <DashboardInsightChartsPanel
                    selectedArea={selectedArea}
                    insightState={insightState}
                />
            </div>
        </aside>
    );
}

function DashboardPage() {
    const [selectedArea, setSelectedArea] = useState(null);
    const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
    const [mapSelectionResetSeq, setMapSelectionResetSeq] = useState(0);
    const [mapLevel, setMapLevel] = useState("SIDO");
    const [populationData, setPopulationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [queryDate, setQueryDate] = useState(null);
    const [populationNotice, setPopulationNotice] = useState(null);
    const closeStatsTimerRef = useRef(null);
    const insightState = useDashboardInsights(selectedArea);

    const handleAreaSelect = useCallback(async (area) => {
        if (closeStatsTimerRef.current) {
            window.clearTimeout(closeStatsTimerRef.current);
            closeStatsTimerRef.current = null;
        }
        if (area) {
            setIsStatsPanelOpen(true);
        }
        setSelectedArea(area);

        if (!area) {
            setMapSelectionResetSeq((value) => value + 1);
            setPopulationData(null);
            setError(null);
            setQueryDate(null);
            setPopulationNotice(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setQueryDate(null);
        setPopulationNotice(null);

        try {
            const data = await getAreaPopulation({
                hour: "00",
                areaCode: area.areaCode,
                areaLevel: area.level,
            });

            setQueryDate(data.baseDate);
            setPopulationData(data);
        } catch (err) {
            console.error(err);
            setPopulationData(null);
            if (err.response?.status === 404) {
                setError(`DB에 저장된 생활인구 데이터가 없습니다. (${area.levelLabel ?? area.level}, areaCode=${area.areaCode})`);
                return;
            }
            setError("생활인구 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => () => {
        if (closeStatsTimerRef.current) {
            window.clearTimeout(closeStatsTimerRef.current);
        }
    }, []);

    const handleRefreshDashboard = useCallback(() => {
        insightState?.refresh?.();
        if (selectedArea) {
            void handleAreaSelect(selectedArea);
        }
    }, [handleAreaSelect, insightState, selectedArea]);

    const handleCloseStatsPanel = useCallback(() => {
        setIsStatsPanelOpen(false);
        if (closeStatsTimerRef.current) {
            window.clearTimeout(closeStatsTimerRef.current);
        }
        closeStatsTimerRef.current = window.setTimeout(() => {
            void handleAreaSelect(null);
        }, 360);
    }, [handleAreaSelect]);

    return (
        <div className="dashboard-ops-shell">
            <DashboardControlBar
                selectedArea={selectedArea}
                mapLevel={mapLevel}
                insightState={insightState}
                loading={loading}
                onRefresh={handleRefreshDashboard}
            />

            <div className={`dashboard-workspace ${isStatsPanelOpen ? "stats-open" : "stats-closed"}`}>
                <main className="dashboard-map-stage" aria-label="행정구역 Polygon 지도">
                    <DashboardMap
                        onAreaSelect={handleAreaSelect}
                        onViewLevelChange={setMapLevel}
                        clearSelectionSignal={mapSelectionResetSeq}
                    />
                    <div className="dashboard-map-legend" aria-label="지도 범례">
                        <strong>줌 기반 행정경계</strong>
                        <div>
                            <span className="legend-line base" />
                            기본 Polygon
                        </div>
                        <div>
                            <span className="legend-line selected" />
                            선택 지역
                        </div>
                    </div>
                </main>

                <DashboardSidePanel
                    selectedArea={selectedArea}
                    populationData={populationData}
                    queryDate={queryDate}
                    populationNotice={populationNotice}
                    loading={loading}
                    error={error}
                    insightState={insightState}
                    isOpen={isStatsPanelOpen}
                    onClearSelection={handleCloseStatsPanel}
                />
            </div>
        </div>
    );
}

export default DashboardPage;
