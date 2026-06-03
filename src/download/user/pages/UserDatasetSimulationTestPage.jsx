import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest.css";
import { getDatasetPreviewGeoJsonApi } from "../../api/userDownloadApi";

const RESULT_TABS = [
  { id: "result", label: "결과 목록" },
  { id: "attribute", label: "속성 정보" },
  { id: "stats", label: "통계" },
];

const SIMULATION_PROFILES = {
  point: {
    label: "포인트",
    title: "포인트 시뮬레이션",
    subtitle: "포인트 공간 데이터를 실제 지도 위에서 확인하고 기본 속성을 살펴봅니다.",
    defaultMapMode: "marker",
    defaultRegion: "전체 영역",
    defaultDensity: "보통",
    defaultRadius: 500,
    mapModes: [
      { id: "marker", label: "마커" },
      { id: "heat", label: "강조" },
      { id: "zone", label: "영역" },
    ],
    regionOptions: ["전체 영역", "동부 권역", "서부 권역", "남부 권역", "북부 권역"],
    densityOptions: ["낮음", "보통", "높음"],
    toggleLabels: {
      heatmap: "강조 표시",
      clustering: "클러스터 표시",
      boundary: "경계선 표시",
    },
    statusText: "공간 데이터를 불러오면 시뮬레이션 지도가 표시됩니다.",
  },
  linestring: {
    label: "라인",
    title: "라인 시뮬레이션",
    subtitle: "라인 공간 데이터를 실제 지도 위에서 확인하고 기본 속성을 살펴봅니다.",
    defaultMapMode: "flow",
    defaultRegion: "주요 구간",
    defaultDensity: "보통",
    defaultRadius: 800,
    mapModes: [
      { id: "flow", label: "흐름" },
      { id: "heat", label: "강조" },
      { id: "zone", label: "구간" },
    ],
    regionOptions: ["주요 구간", "동측 축", "서측 축", "중심 축"],
    densityOptions: ["낮음", "보통", "높음"],
    toggleLabels: {
      heatmap: "강조 표시",
      clustering: "노드 표시",
      boundary: "경계선 표시",
    },
    statusText: "라인 공간 데이터를 불러오면 시뮬레이션 지도가 표시됩니다.",
  },
  polygon: {
    label: "폴리곤",
    title: "폴리곤 시뮬레이션",
    subtitle: "폴리곤 공간 데이터를 실제 지도 위에서 확인하고 기본 속성을 살펴봅니다.",
    defaultMapMode: "fill",
    defaultRegion: "전체 구역",
    defaultDensity: "보통",
    defaultRadius: 1000,
    mapModes: [
      { id: "fill", label: "채움" },
      { id: "heat", label: "강조" },
      { id: "zone", label: "경계" },
    ],
    regionOptions: ["전체 구역", "핵심 구역", "생활 구역", "행정 구역"],
    densityOptions: ["낮음", "보통", "높음"],
    toggleLabels: {
      heatmap: "강조 표시",
      clustering: "중심 구역 표시",
      boundary: "경계선 표시",
    },
    statusText: "폴리곤 공간 데이터를 불러오면 시뮬레이션 지도가 표시됩니다.",
  },
};

function formatCount(value) {
  return new Intl.NumberFormat("ko-KR").format(value ?? 0);
}

function getGeometryLabel(geometryType) {
  const labels = {
    point: "포인트",
    linestring: "라인",
    polygon: "폴리곤",
  };

  return labels[geometryType] ?? "-";
}

function formatGeometryTypeName(geometryType) {
  const labels = {
    Point: "포인트",
    MultiPoint: "멀티포인트",
    LineString: "라인",
    MultiLineString: "멀티라인",
    Polygon: "폴리곤",
    MultiPolygon: "멀티폴리곤",
  };

  return labels[geometryType] ?? geometryType ?? "-";
}

function inferSimulationGeometryType(geoJsonData) {
  const firstGeometryType = geoJsonData?.features?.find((feature) => feature?.geometry?.type)?.geometry?.type;

  if (!firstGeometryType) return null;
  if (firstGeometryType.includes("Point")) return "point";
  if (firstGeometryType.includes("LineString")) return "linestring";
  if (firstGeometryType.includes("Polygon")) return "polygon";

  return null;
}

function getFeatureDisplayName(feature, index) {
  const properties = feature?.properties ?? {};

  return (
    properties.name ??
    properties.title ??
    properties.district ??
    properties.label ??
    properties.id ??
    `객체 ${index + 1}`
  );
}

function getPointCoordinateText(feature) {
  const geometry = feature?.geometry;
  const coordinates = geometry?.coordinates;

  if (!geometry || !Array.isArray(coordinates)) {
    return { lat: "-", lng: "-" };
  }

  if (geometry.type === "Point" && coordinates.length >= 2) {
    return {
      lat: Number(coordinates[1]).toFixed(6),
      lng: Number(coordinates[0]).toFixed(6),
    };
  }

  if (geometry.type === "MultiPoint" && Array.isArray(coordinates[0]) && coordinates[0].length >= 2) {
    return {
      lat: Number(coordinates[0][1]).toFixed(6),
      lng: Number(coordinates[0][0]).toFixed(6),
    };
  }

  return { lat: "-", lng: "-" };
}

function buildSimulationData(features, geometryType, radius, statusText, showHeatmap, useClustering, showBoundary) {
  const featureCount = features.length;
  const visibleFeatures = features.slice(0, 5);

  const datasetInfo = [
    { label: "데이터셋", value: featureCount > 0 ? "연결됨" : "대기 중" },
    { label: "공간 타입", value: getGeometryLabel(geometryType) },
    { label: "객체 수", value: `${formatCount(featureCount)}개` },
    { label: "반경", value: `${radius}m` },
  ];

  const summaryStats = [
    { label: "공간 객체", value: formatCount(featureCount), tone: "default" },
    { label: "유형", value: getGeometryLabel(geometryType), tone: "default" },
    { label: "반경", value: `${radius}m`, tone: "default" },
    { label: "상태", value: featureCount > 0 ? "준비 완료" : "대기 중", tone: featureCount > 0 ? "success" : "default" },
  ];

  const hotspotRanking = (visibleFeatures.length > 0 ? visibleFeatures : Array.from({ length: 5 })).map((feature, index) => {
    const score = Math.max(100 - index * 9, 58);

    return {
      district: feature ? getFeatureDisplayName(feature, index) : `객체 ${index + 1}`,
      score,
      width: `${score}%`,
    };
  });

  const resultRows = visibleFeatures.map((feature, index) => ({
    rank: String(index + 1),
    name: getFeatureDisplayName(feature, index),
    geometry: formatGeometryTypeName(feature?.geometry?.type),
    status: "표시됨",
    note: `속성 ${Object.keys(feature?.properties ?? {}).length}개 / ${radius}m`,
  }));

  const attributeRows = visibleFeatures.map((feature, index) => {
    const coordinateText = getPointCoordinateText(feature);

    return {
      id: feature?.properties?.id ?? feature?.properties?.featureId ?? `FT-${index + 1}`,
      name: getFeatureDisplayName(feature, index),
      geometry: formatGeometryTypeName(feature?.geometry?.type),
      lat: coordinateText.lat,
      lng: coordinateText.lng,
      propertyCount: `${Object.keys(feature?.properties ?? {}).length}개`,
    };
  });

  const statsRows = [
    {
      metric: "공간 객체 수",
      current: `${formatCount(featureCount)}개`,
      baseline: `${formatCount(Math.max(featureCount - 3, 0))}개`,
      change: featureCount > 0 ? `+${Math.min(featureCount, 3)}` : "0",
      result: featureCount > 0 ? "증가" : "유지",
    },
    {
      metric: "반경",
      current: `${radius}m`,
      baseline: `${Math.max(radius - 200, 0)}m`,
      change: `${radius - Math.max(radius - 200, 0)}m`,
      result: "확인",
    },
    {
      metric: "강조 표시",
      current: showHeatmap ? "사용" : "미사용",
      baseline: "기본값",
      change: showHeatmap ? "ON" : "OFF",
      result: showHeatmap ? "활성" : "비활성",
    },
    {
      metric: "클러스터 표시",
      current: useClustering ? "사용" : "미사용",
      baseline: "기본값",
      change: useClustering ? "ON" : "OFF",
      result: useClustering ? "활성" : "비활성",
    },
    {
      metric: "경계선 표시",
      current: showBoundary ? "사용" : "미사용",
      baseline: "기본값",
      change: showBoundary ? "ON" : "OFF",
      result: showBoundary ? "활성" : "비활성",
    },
  ];

  return {
    datasetInfo,
    summaryStats,
    hotspotRanking,
    statusText: featureCount > 0 ? statusText : "공간 데이터를 불러오면 시뮬레이션 결과가 표시됩니다.",
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "name", label: "객체명" },
          { key: "geometry", label: "공간 타입" },
          { key: "status", label: "상태" },
          { key: "note", label: "비고" },
        ],
        rows: resultRows,
      },
      attribute: {
        columns: [
          { key: "id", label: "객체 ID" },
          { key: "name", label: "객체명" },
          { key: "geometry", label: "공간 타입" },
          { key: "lat", label: "위도" },
          { key: "lng", label: "경도" },
          { key: "propertyCount", label: "속성 수" },
        ],
        rows: attributeRows,
      },
      stats: {
        columns: [
          { key: "metric", label: "지표" },
          { key: "current", label: "현재값" },
          { key: "baseline", label: "기준값" },
          { key: "change", label: "변화량" },
          { key: "result", label: "판정" },
        ],
        rows: statsRows,
      },
    },
  };
}

function DataCell({ columnKey, value }) {
  if (columnKey === "status") {
    return <span className="simulation-test-chip success">{value}</span>;
  }

  if (columnKey === "result") {
    const tone = value === "증가" || value === "활성" ? "success" : value === "유지" ? "warning" : "danger";
    return <span className={`simulation-test-chip ${tone}`}>{value}</span>;
  }

  if (columnKey === "change") {
    const tone = String(value).startsWith("+") ? "up" : "";
    return <span className={`simulation-test-change ${tone}`}>{value}</span>;
  }

  return value ?? "-";
}

function SimulationDatasetInfo({ datasetInfo }) {
  return (
    <div className="simulation-test-panel simulation-test-info-panel card">
      <div className="simulation-test-panel-title">
        <i className="bi bi-database"></i>
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

function ToggleButton({ active, label, onClick }) {
  return (
    <div className="simulation-test-toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`simulation-test-switch ${active ? "active" : ""}`}
        onClick={onClick}
      >
        <span></span>
      </button>
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
  profile,
}) {
  return (
    <div className="simulation-test-panel simulation-test-control-panel card">
      <div className="simulation-test-panel-title">
        <i className="bi bi-sliders"></i>
        <span>시뮬레이션 설정</span>
      </div>

      <div className="simulation-test-field-block">
        <label className="simulation-test-field-label">지도 표현 방식</label>
        <div className="simulation-test-mode-group">
          {profile.mapModes.map((mode) => (
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
        <label className="simulation-test-field-label">영역 선택</label>
        <select
          className="form-select simulation-test-select"
          value={selectedRegion}
          onChange={(event) => setSelectedRegion(event.target.value)}
        >
          {profile.regionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="simulation-test-field-block">
        <label className="simulation-test-field-label">밀도 기준</label>
        <select
          className="form-select simulation-test-select"
          value={densityLevel}
          onChange={(event) => setDensityLevel(event.target.value)}
        >
          {profile.densityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="simulation-test-field-block">
        <div className="simulation-test-range-head">
          <label className="simulation-test-field-label mb-0">반경</label>
          <strong>{radius}m</strong>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={radius}
          onChange={(event) => setRadius(Number(event.target.value))}
        />
        <div className="simulation-test-range-labels">
          <span>100m</span>
          <span>2000m</span>
        </div>
      </div>

      <div className="simulation-test-field-block">
        <label className="simulation-test-field-label">표시 옵션</label>
        <div className="simulation-test-toggle-list">
          <ToggleButton
            active={showHeatmap}
            label={profile.toggleLabels.heatmap}
            onClick={() => setShowHeatmap((prev) => !prev)}
          />
          <ToggleButton
            active={useClustering}
            label={profile.toggleLabels.clustering}
            onClick={() => setUseClustering((prev) => !prev)}
          />
          <ToggleButton
            active={showBoundary}
            label={profile.toggleLabels.boundary}
            onClick={() => setShowBoundary((prev) => !prev)}
          />
        </div>
      </div>

      <div className="simulation-test-notice">
        <i className="bi bi-info-circle"></i>
        <span>{statusText}</span>
      </div>

      <div className="simulation-test-action-row">
        <div className="row g-2">
          <div className="col-6">
            <button
              type="button"
              className="btn btn-primary w-100 simulation-test-action-button"
              onClick={handleRun}
            >
              실행
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn btn-light border w-100 simulation-test-action-button secondary"
              onClick={handleReset}
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulationLegend({ geometryType }) {
  return (
    <div className="simulation-test-legend">
      <div className="simulation-test-legend-title">범례</div>

      {geometryType === "linestring" ? (
        <div className="simulation-test-legend-list">
          <div className="simulation-test-legend-item">
            <span className="simulation-test-legend-swatch primary-line"></span>
            <span>라인 객체</span>
          </div>
        </div>
      ) : geometryType === "polygon" ? (
        <div className="simulation-test-legend-list">
          <div className="simulation-test-legend-item">
            <span className="simulation-test-legend-swatch fill-low"></span>
            <span>폴리곤 객체</span>
          </div>
        </div>
      ) : (
        <div className="simulation-test-legend-list">
          <div className="simulation-test-legend-item">
            <span className="simulation-test-legend-swatch node"></span>
            <span>포인트 객체</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SimulationMapBoundsUpdater({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonData) return;

    const layer = L.geoJSON(geoJsonData);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [geoJsonData, map]);

  return null;
}

function SimulationMapView({
  geometryType,
  mapMode,
  selectedRegion,
  radius,
  profile,
  previewGeoJson,
  previewLoading,
  previewErrorMessage,
}) {
  const hasPreviewFeatures =
    Array.isArray(previewGeoJson?.features) &&
    previewGeoJson.features.some((feature) => feature?.geometry);

  const geoJsonStyle = {
    color: mapMode === "zone" ? "#0f766e" : "#2563eb",
    weight: geometryType === "linestring" ? 5 : 3,
    fillColor: mapMode === "fill" || geometryType === "polygon" ? "#60a5fa" : "#93c5fd",
    fillOpacity: geometryType === "polygon" ? 0.32 : 0.18,
  };

  const pointRadius = mapMode === "heat" ? 9 : 7;

  const pointToLayer = (_, latlng) =>
    L.circleMarker(latlng, {
      radius: pointRadius,
      fillColor: "#2563eb",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.95,
    });

  return (
    <div className="simulation-test-panel card simulation-test-map-panel h-100">
      <div className="simulation-test-map-header">
        <div className="simulation-test-panel-title mb-0">
          <i className="bi bi-map"></i>
          <span>지도 결과</span>
        </div>

        <div className="simulation-test-map-meta">
          <span>{profile.label}</span>
          <span>{selectedRegion}</span>
          <span>반경 {radius}m</span>
        </div>
      </div>

      <div className={`simulation-test-map-stage mode-${mapMode}`}>
        {previewLoading ? (
          <div className="simulation-test-map-empty">공간 데이터를 불러오는 중입니다.</div>
        ) : previewErrorMessage ? (
          <div className="simulation-test-map-empty">{previewErrorMessage}</div>
        ) : !hasPreviewFeatures ? (
          <div className="simulation-test-map-empty">표시할 공간 좌표 데이터가 없습니다.</div>
        ) : (
          <>
            <MapContainer
              center={[36.5, 127.8]}
              zoom={7}
              className="simulation-test-leaflet-map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <SimulationMapBoundsUpdater geoJsonData={previewGeoJson} />
              <GeoJSON
                data={previewGeoJson}
                style={geoJsonStyle}
                pointToLayer={pointToLayer}
              />
            </MapContainer>
            <SimulationLegend geometryType={geometryType} />
          </>
        )}
      </div>
    </div>
  );
}

function SimulationResultSummary({ summaryStats, hotspotRanking }) {
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
              <strong className={item.tone === "success" ? "success" : ""}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="simulation-test-panel simulation-test-summary-panel card">
        <div className="simulation-test-panel-title">
          <i className="bi bi-bar-chart"></i>
          <span>대표 객체</span>
        </div>

        <div className="simulation-test-ranking-list">
          {hotspotRanking.map((item, index) => (
            <div key={`${item.district}-${index}`} className="simulation-test-ranking-row">
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
          내보내기
        </button>
      </div>

      <div className="simulation-test-tab-row">
        {RESULT_TABS.map((tab) => (
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
            {activeTable.rows.length > 0 ? (
              activeTable.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {activeTable.columns.map((column) => (
                    <td key={column.key}>
                      <DataCell columnKey={column.key} value={row[column.key]} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTable.columns.length} className="text-center py-4 text-secondary">
                  표시할 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="simulation-test-table-footer">
        <span>현재 탭 기준 최대 5개 결과를 표시합니다.</span>

        <div className="simulation-test-pagination">
          <button type="button"><i className="bi bi-chevron-left"></i></button>
          <button type="button" className="active">1</button>
          <button type="button"><i className="bi bi-chevron-right"></i></button>
        </div>

        <select className="form-select simulation-test-page-size" defaultValue="5개 보기">
          <option>5개 보기</option>
          <option>10개 보기</option>
          <option>20개 보기</option>
        </select>
      </div>
    </div>
  );
}

function UserDatasetSimulationTestPage() {
  const { datasetId } = useParams();
  const [geometryType, setGeometryType] = useState("point");
  const [mapMode, setMapMode] = useState(SIMULATION_PROFILES.point.defaultMapMode);
  const [selectedRegion, setSelectedRegion] = useState(SIMULATION_PROFILES.point.defaultRegion);
  const [radius, setRadius] = useState(SIMULATION_PROFILES.point.defaultRadius);
  const [densityLevel, setDensityLevel] = useState(SIMULATION_PROFILES.point.defaultDensity);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [useClustering, setUseClustering] = useState(true);
  const [showBoundary, setShowBoundary] = useState(false);
  const [selectedTab, setSelectedTab] = useState("result");
  const [previewGeoJson, setPreviewGeoJson] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewErrorMessage, setPreviewErrorMessage] = useState("");

  const currentProfile = SIMULATION_PROFILES[geometryType] ?? SIMULATION_PROFILES.point;
  const features = Array.isArray(previewGeoJson?.features) ? previewGeoJson.features : [];
  const simulationData = buildSimulationData(
    features,
    geometryType,
    radius,
    currentProfile.statusText,
    showHeatmap,
    useClustering,
    showBoundary,
  );
  const activeTable = simulationData.tableData[selectedTab];

  const resetWithProfile = (profile) => {
    setMapMode(profile.defaultMapMode);
    setSelectedRegion(profile.defaultRegion);
    setRadius(profile.defaultRadius);
    setDensityLevel(profile.defaultDensity);
    setShowHeatmap(true);
    setUseClustering(true);
    setShowBoundary(false);
    setSelectedTab("result");
  };

  const handleReset = () => {
    resetWithProfile(currentProfile);
  };

  const handleRun = () => {
    setSelectedTab("result");
  };

  useEffect(() => {
    let cancelled = false;

    const fetchPreviewGeoJson = async () => {
      try {
        setPreviewLoading(true);
        setPreviewErrorMessage("");

        const previewResponse = await getDatasetPreviewGeoJsonApi(datasetId);
        const previewData =
          typeof previewResponse.data === "string"
            ? JSON.parse(previewResponse.data)
            : previewResponse.data;

        if (cancelled) {
          return;
        }

        setPreviewGeoJson(previewData);

        const inferredGeometryType = inferSimulationGeometryType(previewData);
        if (inferredGeometryType && SIMULATION_PROFILES[inferredGeometryType]) {
          const nextProfile = SIMULATION_PROFILES[inferredGeometryType];
          setGeometryType(inferredGeometryType);
          resetWithProfile(nextProfile);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewGeoJson(null);

        if (error?.response?.status === 403) {
          setPreviewErrorMessage("공간 데이터를 확인할 권한이 없습니다.");
        } else if (error?.response?.status === 404) {
          setPreviewErrorMessage("공간 데이터를 찾을 수 없습니다.");
        } else {
          setPreviewErrorMessage("공간 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    if (!datasetId) {
      setPreviewGeoJson(null);
      setPreviewLoading(false);
      setPreviewErrorMessage("데이터셋 정보를 확인할 수 없습니다.");
      return undefined;
    }

    fetchPreviewGeoJson();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  const handleGeometryChange = (nextGeometryType) => {
    const nextProfile = SIMULATION_PROFILES[nextGeometryType];
    setGeometryType(nextGeometryType);
    resetWithProfile(nextProfile);
  };

  return (
    <div className="container-fluid px-4 py-3 simulation-test-page">
      <div className="row mb-3">
        <div className="col">
          <TopTitle
            title={currentProfile.title}
            subTitle={currentProfile.subtitle}
            showGuide={false}
          />
        </div>
      </div>

      <div className="row g-3 simulation-test-main-row">
        <div className="col-12 col-xl-3 simulation-test-side-column">
          <div className="row g-3 simulation-test-side-stack">
            <div className="col-12">
              <SimulationDatasetInfo datasetInfo={simulationData.datasetInfo} />
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
                statusText={simulationData.statusText}
                handleRun={handleRun}
                handleReset={handleReset}
                profile={currentProfile}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-9 simulation-test-content-column">
          <div className="row g-3 simulation-test-content-top-row mb-1">
            <div className="col-12 col-xxl-8 simulation-test-map-column">
              <SimulationMapView
                geometryType={geometryType}
                mapMode={mapMode}
                selectedRegion={selectedRegion}
                radius={radius}
                profile={currentProfile}
                previewGeoJson={previewGeoJson}
                previewLoading={previewLoading}
                previewErrorMessage={previewErrorMessage}
              />
            </div>

            <div className="col-12 col-xxl-4 simulation-test-summary-column">
              <SimulationResultSummary
                summaryStats={simulationData.summaryStats}
                hotspotRanking={simulationData.hotspotRanking}
              />
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

      <div className="row mt-3">
        <div className="col-12">
          <div className="simulation-test-panel simulation-test-geometry-switch-card card">
            <div className="simulation-test-panel-title mb-0">
              <i className="bi bi-bezier2"></i>
              <span>공간 타입 전환</span>
            </div>

            <div className="simulation-test-geometry-switch-grid">
              {Object.entries(SIMULATION_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  type="button"
                  className={`simulation-test-geometry-switch-button ${geometryType === key ? "active" : ""}`}
                  onClick={() => handleGeometryChange(key)}
                >
                  <strong>{profile.label}</strong>
                  <span>{profile.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDatasetSimulationTestPage;
