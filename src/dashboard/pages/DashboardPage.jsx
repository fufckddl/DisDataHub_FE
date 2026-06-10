import { useCallback, useEffect, useRef, useState } from "react";
import DashboardMap from "../components/DashboardMap";
import {
    DashboardInsightChartsPanel,
    DashboardInsightSummaryPanel,
} from "../components/DashboardInsightsPanel";
import { useDashboardInsights } from "../hooks/useDashboardInsights";
import PopulationPanel from "../components/PopulationPanel";
import { getAreaPopulation, getDashboardGisDatasets } from "../api/dashBoardApi";
import "./DashboardPage.css";

const DEFAULT_MAP_DATASET_CODE = "STANDARD_LIBRARY_MAIN";
const MAP_LAYER_DATASET_CODES = [
    "STANDARD_LIBRARY_MAIN",
    "STANDARD_URBAN_PARK_MAIN",
    "STANDARD_BUS_STOP_MAIN",
];
const FALLBACK_MAP_LAYER = {
    datasetCode: DEFAULT_MAP_DATASET_CODE,
    datasetName: "전국도서관표준데이터",
    layerType: "POINT",
    featureCount: 0,
};

function toMapLayer(dataset) {
    if (!dataset) {
        return FALLBACK_MAP_LAYER;
    }

    return {
        datasetCode: dataset.datasetCode,
        datasetName: dataset.datasetName,
        layerType: dataset.dashboardLayerType ?? dataset.layerType ?? "POINT",
        featureCount: Number(dataset.featureCount ?? 0),
    };
}

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

function DashboardControlBar({
    selectedArea,
    mapLevel,
    gisLayer,
    gisLayerOptions,
    insightState,
    loading,
    onRefresh,
    onGisLayerChange,
}) {
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
                <label className="dashboard-control-layer" title="지도 GIS 포인트 레이어">
                    <span>
                        <i className="bi bi-geo-alt-fill" />
                        GIS
                    </span>
                    <select
                        value={gisLayer?.datasetCode ?? DEFAULT_MAP_DATASET_CODE}
                        onChange={(event) => onGisLayerChange(event.target.value)}
                        aria-label="지도 GIS 포인트 레이어 선택"
                    >
                        {gisLayerOptions.map((dataset) => (
                            <option
                                key={dataset.datasetCode}
                                value={dataset.datasetCode}
                                disabled={Number(dataset.featureCount ?? 0) <= 0}
                            >
                                {dataset.datasetName} ({Number(dataset.featureCount ?? 0).toLocaleString()}건)
                            </option>
                        ))}
                    </select>
                </label>
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
    const [gisLayer, setGisLayer] = useState(FALLBACK_MAP_LAYER);
    const [gisLayerOptions, setGisLayerOptions] = useState([FALLBACK_MAP_LAYER]);
    const closeStatsTimerRef = useRef(null);
    const insightState = useDashboardInsights(selectedArea);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialMapLayer() {
            try {
                const datasets = await getDashboardGisDatasets({
                    layerType: "POINT",
                    activeOnly: true,
                });

                if (cancelled) {
                    return;
                }

                const pointDatasets = (datasets ?? []).filter((dataset) => {
                    const layerType = dataset.dashboardLayerType ?? dataset.layerType;
                    return layerType === "POINT" && MAP_LAYER_DATASET_CODES.includes(dataset.datasetCode);
                }).sort(
                    (left, right) => MAP_LAYER_DATASET_CODES.indexOf(left.datasetCode)
                        - MAP_LAYER_DATASET_CODES.indexOf(right.datasetCode)
                );
                setGisLayerOptions(pointDatasets.length ? pointDatasets : [FALLBACK_MAP_LAYER]);

                const selectedDataset = pointDatasets.find(
                    (dataset) => dataset.datasetCode === DEFAULT_MAP_DATASET_CODE
                        && Number(dataset.featureCount ?? 0) > 0
                ) ?? pointDatasets.find((dataset) => Number(dataset.featureCount ?? 0) > 0);

                if (!selectedDataset) {
                    setGisLayer(FALLBACK_MAP_LAYER);
                    return;
                }

                setGisLayer(toMapLayer(selectedDataset));
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setGisLayerOptions([FALLBACK_MAP_LAYER]);
                    setGisLayer(FALLBACK_MAP_LAYER);
                }
            }
        }

        void loadInitialMapLayer();

        return () => {
            cancelled = true;
        };
    }, []);

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

    const handleGisLayerChange = useCallback((datasetCode) => {
        const selectedDataset = gisLayerOptions.find((dataset) => dataset.datasetCode === datasetCode);
        if (!selectedDataset || Number(selectedDataset.featureCount ?? 0) <= 0) {
            return;
        }
        setGisLayer(toMapLayer(selectedDataset));
    }, [gisLayerOptions]);

    return (
        <div className="dashboard-ops-shell">
            <DashboardControlBar
                selectedArea={selectedArea}
                mapLevel={mapLevel}
                gisLayer={gisLayer}
                gisLayerOptions={gisLayerOptions}
                insightState={insightState}
                loading={loading}
                onRefresh={handleRefreshDashboard}
                onGisLayerChange={handleGisLayerChange}
            />

            <div className={`dashboard-workspace ${isStatsPanelOpen ? "stats-open" : "stats-closed"}`}>
                <main className="dashboard-map-stage" aria-label="행정구역 Polygon 지도">
                    <DashboardMap
                        selectedArea={selectedArea}
                        gisLayer={gisLayer}
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
                            선택 시도 경계
                        </div>
                        <div>
                            <span className="legend-point" />
                            GIS 포인트
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
