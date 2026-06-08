import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CircleMarker, GeoJSON, MapContainer, Polygon, Polyline, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest.css";
import {
  getDatasetDownloadPageApi,
  getDatasetPreviewGeoJsonApi,
  measureSimulationAreaApi,
  runPointRadiusSimulationApi,
} from "../../api/userDownloadApi";

const RESULT_TABS = [
  { id: "result", label: "결과 목록" },
  { id: "attribute", label: "속성 정보" },
  { id: "stats", label: "통계" },
];

const SIMULATION_PROFILES = {
  point: {
    label: "포인트",
    subtitle: "포인트 공간 데이터를 기준으로 반경 시뮬레이션 결과를 확인합니다.",
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
    statusText: "반경 값을 조절한 뒤 실행 버튼을 눌러 포인트 시뮬레이션 결과를 확인하세요.",
  },
  linestring: {
    label: "라인",
    subtitle: "라인 데이터 화면입니다. 현재 1차 시뮬레이션 API는 포인트 데이터만 연결되어 있습니다.",
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
    statusText: "현재 1차 시뮬레이션 API는 포인트 데이터만 연결되어 있습니다.",
  },
  polygon: {
    label: "폴리곤",
    subtitle: "폴리곤 데이터 화면입니다. 현재 1차 시뮬레이션 API는 포인트 데이터만 연결되어 있습니다.",
    defaultMapMode: "fill",
    defaultRegion: "전체 구역",
    defaultDensity: "보통",
    defaultRadius: 1000,
    mapModes: [
      { id: "fill", label: "채움" },
      { id: "heat", label: "강조" },
      { id: "zone", label: "경계" },
    ],
    regionOptions: ["전체 구역", "주거 구역", "생활 구역", "행정 구역"],
    densityOptions: ["낮음", "보통", "높음"],
    toggleLabels: {
      heatmap: "강조 표시",
      clustering: "중심 구역 표시",
      boundary: "경계선 표시",
    },
    statusText: "현재 1차 시뮬레이션 API는 포인트 데이터만 연결되어 있습니다.",
  },
};

function formatCount(value) {
  return new Intl.NumberFormat("ko-KR").format(value ?? 0);
}

function formatDecimal(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(2);
}

function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined || Number.isNaN(Number(distanceMeters))) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    return `${(Number(distanceMeters) / 1000).toFixed(2)}km`;
  }

  return `${Math.round(Number(distanceMeters))}m`;
}

function formatArea(areaSquareMeters) {
  if (areaSquareMeters === null || areaSquareMeters === undefined || Number.isNaN(Number(areaSquareMeters))) {
    return "-";
  }

  return `${Math.round(Number(areaSquareMeters)).toLocaleString("ko-KR")}㎡`;
}

function parseGeoJson(data) {
  if (!data) return null;

  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
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
    properties.featureName ??
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

function getLayerCenterCoordinate(layer) {
  if (layer && typeof layer.getLatLng === "function") {
    return layer.getLatLng();
  }

  if (layer && typeof layer.getBounds === "function") {
    const bounds = layer.getBounds();
    if (bounds?.isValid?.()) {
      return bounds.getCenter();
    }
  }

  return null;
}

function bindFeatureTooltip(feature, layer, layerLabel) {
  const properties = feature?.properties ?? {};
  const featureName =
    properties.featureName ??
    properties.name ??
    properties.title ??
    properties.label ??
    properties.id ??
    "이름 없음";
  const geometryName = formatGeometryTypeName(feature?.geometry?.type);
  const centerCoordinate = getLayerCenterCoordinate(layer);
  const latText = centerCoordinate ? Number(centerCoordinate.lat).toFixed(6) : "-";
  const lngText = centerCoordinate ? Number(centerCoordinate.lng).toFixed(6) : "-";
  const nearbyCountText = properties.nearbyCount !== undefined ? formatCount(properties.nearbyCount) : null;

  const tooltipHtml = `
    <div class="simulation-test-map-tooltip">
      <strong>${featureName}</strong>
      <span>레이어: ${layerLabel}</span>
      <span>공간 유형: ${geometryName}</span>
      <span>위도: ${latText}</span>
      <span>경도: ${lngText}</span>
      ${nearbyCountText !== null ? `<span>인접 개수: ${nearbyCountText}개</span>` : ""}
    </div>
  `;

  layer.bindTooltip(tooltipHtml, {
    sticky: true,
    direction: "top",
    opacity: 0.96,
    className: "simulation-test-leaflet-tooltip",
  });

  layer.on({
    mouseover: () => layer.openTooltip(),
    mouseout: () => layer.closeTooltip(),
  });
}

function buildPreviewData(features, geometryType, radius, selectedRegion, showHeatmap, useClustering, showBoundary) {
  const featureCount = features.length;
  const visibleFeatures = features.slice(0, 5);

  const datasetInfo = [
    { label: "기준 데이터", value: featureCount > 0 ? "미리보기 데이터" : "대기 중" },
    { label: "공간 유형", value: getGeometryLabel(geometryType) },
    { label: "객체 수", value: `${formatCount(featureCount)}개` },
    { label: "반경", value: `${radius}m` },
  ];

  const summaryStats = [
    { label: "미리보기 객체", value: formatCount(featureCount), tone: "default" },
    { label: "공간 유형", value: getGeometryLabel(geometryType), tone: "default" },
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
    status: "미리보기",
    note: `속성 ${Object.keys(feature?.properties ?? {}).length}개 / 반경 ${radius}m`,
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
      metric: "표시 객체 수",
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
      metric: "선택 권역",
      current: selectedRegion,
      baseline: "기본값",
      change: "선택",
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
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "name", label: "객체명" },
          { key: "geometry", label: "공간 유형" },
          { key: "status", label: "상태" },
          { key: "note", label: "비고" },
        ],
        rows: resultRows,
      },
      attribute: {
        columns: [
          { key: "id", label: "객체 ID" },
          { key: "name", label: "객체명" },
          { key: "geometry", label: "공간 유형" },
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

function buildSimulationResultData(summary, tableRows, selectedRegion, radius) {
  const maxNearbyCount = Number(summary?.maxNearbyCount ?? 0);

  const datasetInfo = [
    { label: "기준 데이터", value: summary?.datasetTitle ?? "시뮬레이션 결과" },
    { label: "공간 유형", value: "포인트" },
    { label: "전체 포인트", value: `${formatCount(summary?.totalPointCount)}개` },
    { label: "반경", value: `${radius}m` },
  ];

  const summaryStats = [
    { label: "전체 포인트", value: formatCount(summary?.totalPointCount), tone: "default" },
    { label: "핫스팟 수", value: formatCount(summary?.hotspotCount), tone: "success" },
    { label: "평균 인접 개수", value: formatDecimal(summary?.averageNearbyCount), tone: "default" },
    { label: "최대 인접 개수", value: formatCount(summary?.maxNearbyCount), tone: "default" },
  ];

  const hotspotRanking = (tableRows.length > 0 ? tableRows : Array.from({ length: 5 })).map((row, index) => {
    const score = row
      ? Math.max(12, Math.round((Number(row.nearbyCount ?? 0) / Math.max(maxNearbyCount, 1)) * 100))
      : 0;

    return {
      district: row?.featureName ?? `객체 ${index + 1}`,
      score: row?.nearbyCount ?? 0,
      width: `${score}%`,
    };
  });

  const resultRows = tableRows.map((row) => ({
    rank: row.rank,
    name: row.featureName ?? `객체 ${row.rank}`,
    nearbyCount: `${formatCount(row.nearbyCount)}개`,
    lat: row.latitude != null ? Number(row.latitude).toFixed(6) : "-",
    lng: row.longitude != null ? Number(row.longitude).toFixed(6) : "-",
  }));

  const attributeRows = tableRows.map((row) => ({
    featureId: row.featureId ?? "-",
    name: row.featureName ?? "-",
    nearbyCount: `${formatCount(row.nearbyCount)}개`,
    lat: row.latitude != null ? Number(row.latitude).toFixed(6) : "-",
    lng: row.longitude != null ? Number(row.longitude).toFixed(6) : "-",
  }));

  const statsRows = [
    {
      metric: "전체 포인트 수",
      current: `${formatCount(summary?.totalPointCount)}개`,
      baseline: "기준값",
      change: `${formatCount(summary?.hotspotCount)}개`,
      result: "핫스팟",
    },
    {
      metric: "반경",
      current: `${radius}m`,
      baseline: `${radius}m`,
      change: "0m",
      result: "확인",
    },
    {
      metric: "평균 인접 개수",
      current: formatDecimal(summary?.averageNearbyCount),
      baseline: "-",
      change: `${formatCount(summary?.maxNearbyCount)}개`,
      result: "분석",
    },
    {
      metric: "선택 권역",
      current: selectedRegion,
      baseline: "기본값",
      change: "선택",
      result: "확인",
    },
  ];

  return {
    datasetInfo,
    summaryStats,
    hotspotRanking,
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "name", label: "객체명" },
          { key: "nearbyCount", label: "인접 개수" },
          { key: "lat", label: "위도" },
          { key: "lng", label: "경도" },
        ],
        rows: resultRows,
      },
      attribute: {
        columns: [
          { key: "featureId", label: "객체 ID" },
          { key: "name", label: "객체명" },
          { key: "nearbyCount", label: "인접 개수" },
          { key: "lat", label: "위도" },
          { key: "lng", label: "경도" },
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
    const tone = value === "핫스팟" || value === "활성" || value === "분석"
      ? "success"
      : value === "유지" || value === "확인"
        ? "warning"
        : "danger";

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
  simulationLoading,
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
              disabled={simulationLoading}
            >
              {simulationLoading ? "실행 중..." : "실행"}
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn btn-light border w-100 simulation-test-action-button secondary"
              onClick={handleReset}
              disabled={simulationLoading}
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulationLegend({ hasResultLayer }) {
  return (
    <div className="simulation-test-legend">
      <div className="simulation-test-legend-title">범례</div>
      <div className="simulation-test-legend-list">
        <div className="simulation-test-legend-item">
          <span className="simulation-test-legend-swatch node"></span>
          <span>원본 포인트</span>
        </div>
        {hasResultLayer ? (
          <div className="simulation-test-legend-item">
            <span className="simulation-test-legend-swatch fill-low"></span>
            <span>반경 결과</span>
          </div>
        ) : null}
      </div>
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

function SimulationMapHomeControl({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "bottomright" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar simulation-test-home-control");
      const button = L.DomUtil.create("button", "simulation-test-home-control-button", container);
      button.type = "button";
      button.innerHTML = '<i class="bi bi-crosshair"></i>';
      button.title = "중심으로 이동";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (event) => {
        L.DomEvent.preventDefault(event);
        L.DomEvent.stopPropagation(event);

        if (geoJsonData) {
          const layer = L.geoJSON(geoJsonData);
          const bounds = layer.getBounds();

          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [24, 24] });
            return;
          }
        }

        map.setView([36.5, 127.8], 7);
      });

      return container;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [geoJsonData, map]);

  return null;
}

function SimulationMeasureEvents({
  measurementType,
  setMeasurePoints,
  setMeasureDistance,
  setMeasureArea,
}) {
  useMapEvents({
    click(event) {
      if (measurementType === "none") {
        return;
      }

      setMeasurePoints((prev) => {
        const nextPoints =
          measurementType === "distance"
            ? (prev.length >= 2 ? [event.latlng] : [...prev, event.latlng])
            : [...prev, event.latlng];

        if (measurementType === "distance") {
          if (nextPoints.length === 2) {
            setMeasureDistance(nextPoints[0].distanceTo(nextPoints[1]));
          } else {
            setMeasureDistance(null);
          }
          setMeasureArea(null);
        } else {
          setMeasureDistance(null);
          setMeasureArea(null);
        }

        return nextPoints;
      });
    },
  });

  return null;
}

function SimulationMapView({
  geometryType,
  mapMode,
  selectedRegion,
  radius,
  profile,
  previewGeoJson,
  resultGeoJson,
  previewLoading,
  previewErrorMessage,
  simulationLoading,
  measurementPanelOpen,
  setMeasurementPanelOpen,
  measurementType,
  setMeasurementType,
  measurePoints,
  setMeasurePoints,
  measureDistance,
  setMeasureDistance,
  measureArea,
  setMeasureArea,
  measureAreaLoading,
  measureAreaError,
}) {
  const hasPreviewFeatures =
    Array.isArray(previewGeoJson?.features) &&
    previewGeoJson.features.some((feature) => feature?.geometry);

  const hasResultFeatures =
    Array.isArray(resultGeoJson?.features) &&
    resultGeoJson.features.some((feature) => feature?.geometry);

  const focusGeoJson = hasResultFeatures ? resultGeoJson : previewGeoJson;

  const previewStyle = {
    color: mapMode === "zone" ? "#64748b" : "#475569",
    weight: geometryType === "linestring" ? 4 : 2,
    fillColor: "#cbd5e1",
    fillOpacity: geometryType === "polygon" ? 0.18 : 0.08,
  };

  const resultStyle = {
    color: "#2563eb",
    weight: 3,
    fillColor: "#60a5fa",
    fillOpacity: 0.2,
  };

  const previewPointToLayer = (_, latlng) =>
    L.circleMarker(latlng, {
      radius: 6,
      fillColor: "#64748b",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.88,
    });

  const resultPointToLayer = (_, latlng) =>
    L.circleMarker(latlng, {
      radius: mapMode === "heat" ? 10 : 8,
      fillColor: "#2563eb",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.95,
    });

  const previewOnEachFeature = (feature, layer) => {
    bindFeatureTooltip(feature, layer, "원본 데이터");
  };

  const resultOnEachFeature = (feature, layer) => {
    bindFeatureTooltip(feature, layer, "시뮬레이션 결과");
  };

  const handleMeasurementPanelToggle = () => {
    setMeasurementPanelOpen((prev) => {
      if (prev) {
        setMeasurementType("none");
        setMeasurePoints([]);
        setMeasureDistance(null);
        setMeasureArea(null);
      }

      return !prev;
    });
  };

  const handleMeasureReset = () => {
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
  };

  const handleMeasurementTypeChange = (nextType) => {
    setMeasurementType(nextType);
    setMeasurementPanelOpen(true);
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
  };

  const hasMeasurement = measurementType !== "none";
  const measurementTitle = measurementType === "area" ? "면적 측정" : "거리 측정";
  const measurementValue =
    measurementType === "area"
      ? (measureAreaLoading ? "계산 중..." : formatArea(measureArea))
      : formatDistance(measureDistance);
  const measurementGuideText =
    measurementType === "area"
      ? "지도를 세 번 이상 클릭하면 면적이 계산됩니다."
      : "지도를 두 번 클릭하면 두 지점 사이의 직선거리를 계산합니다.";

  return (
    <div className="simulation-test-panel card simulation-test-map-panel h-100">
      <div className="simulation-test-map-header">
        <div className="simulation-test-map-header-main">
          <div className="simulation-test-panel-title mb-0">
            <i className="bi bi-map"></i>
            <span>지도 결과</span>
          </div>
          <p className="simulation-test-map-caption">시뮬레이션 결과와 공간 데이터를 지도에서 확인할 수 있습니다.</p>
        </div>

        <div className="simulation-test-map-toolbar">
          <button
            type="button"
            className={`simulation-test-map-tool-button ${measurementPanelOpen || hasMeasurement ? "active" : ""}`}
            onClick={handleMeasurementPanelToggle}
          >
            측정 도구
          </button>
          {simulationLoading ? <span>시뮬레이션 실행 중</span> : null}
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
            <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} className="simulation-test-leaflet-map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <SimulationMapBoundsUpdater geoJsonData={focusGeoJson} />
              <SimulationMapHomeControl geoJsonData={focusGeoJson} />
              <ZoomControl position="bottomright" />
              <SimulationMeasureEvents
                measurementType={measurementType}
                setMeasurePoints={setMeasurePoints}
                setMeasureDistance={setMeasureDistance}
                setMeasureArea={setMeasureArea}
              />
              <GeoJSON
                data={previewGeoJson}
                style={previewStyle}
                pointToLayer={previewPointToLayer}
                onEachFeature={previewOnEachFeature}
              />
              {hasResultFeatures ? (
                <GeoJSON
                  data={resultGeoJson}
                  style={resultStyle}
                  pointToLayer={resultPointToLayer}
                  onEachFeature={resultOnEachFeature}
                />
              ) : null}
              {measurePoints.map((point, index) => (
                <CircleMarker
                  key={`measure-point-${index}`}
                  center={point}
                  radius={7}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: index === 0 ? "#f97316" : "#2563eb",
                    fillOpacity: 1,
                  }}
                />
              ))}
              {measurePoints.length === 2 ? (
                <Polyline
                  positions={measurePoints}
                  pathOptions={{
                    color: "#f97316",
                    weight: 4,
                    dashArray: "10 8",
                  }}
                />
              ) : null}
              {measurementType === "area" && measurePoints.length >= 2 ? (
                <Polyline
                  positions={measurePoints}
                  pathOptions={{
                    color: "#0f766e",
                    weight: 3,
                    dashArray: "7 6",
                  }}
                />
              ) : null}
              {measurementType === "area" && measurePoints.length >= 3 ? (
                <Polygon
                  positions={measurePoints}
                  pathOptions={{
                    color: "#0f766e",
                    weight: 3,
                    fillColor: "#34d399",
                    fillOpacity: 0.22,
                  }}
                />
              ) : null}
            </MapContainer>
            <SimulationLegend hasResultLayer={hasResultFeatures} />
            {measurementPanelOpen ? (
              <div className="simulation-test-measure-float">
                <div className="simulation-test-measure-float-head">
                  <strong>측정 도구</strong>
                  <button type="button" onClick={handleMeasurementPanelToggle}>
                    닫기
                  </button>
                </div>

                <div className="simulation-test-measure-type-row compact">
                  <button
                    type="button"
                    className={`simulation-test-measure-type-button ${measurementType === "distance" ? "active" : ""}`}
                    onClick={() => handleMeasurementTypeChange("distance")}
                  >
                    거리
                  </button>
                  <button
                    type="button"
                    className={`simulation-test-measure-type-button ${measurementType === "area" ? "active" : ""}`}
                    onClick={() => handleMeasurementTypeChange("area")}
                  >
                    면적
                  </button>
                </div>

                <div className="simulation-test-measure-result-card compact">
                  <span className="simulation-test-measure-result-label">
                    {hasMeasurement ? measurementTitle : "측정 대기"}
                  </span>
                  <strong>{hasMeasurement ? measurementValue : "-"}</strong>
                  <small>
                    {hasMeasurement
                      ? (measurementType === "area"
                        ? (measureAreaError || (measureAreaLoading
                          ? "PostGIS 기준으로 더 정확한 면적을 계산하는 중입니다."
                          : measurementGuideText))
                        : measurementGuideText)
                      : "거리 또는 면적을 선택한 뒤 지도를 클릭해보세요."}
                  </small>
                </div>

                <button
                  type="button"
                  className="simulation-test-measure-reset-button"
                  onClick={handleMeasureReset}
                >
                  초기화
                </button>
              </div>
            ) : null}
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
          <span>상위 객체</span>
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

        <button type="button" className="btn btn-light border simulation-test-export-button" disabled>
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
        <span>현재는 최대 5개 결과를 표시합니다.</span>

        <div className="simulation-test-pagination">
          <button type="button"><i className="bi bi-chevron-left"></i></button>
          <button type="button" className="active">1</button>
          <button type="button"><i className="bi bi-chevron-right"></i></button>
        </div>

        <select className="form-select simulation-test-page-size" defaultValue="5개 보기" disabled>
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
  const [datasetTitle, setDatasetTitle] = useState("데이터셋");
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationErrorMessage, setSimulationErrorMessage] = useState("");
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [simulationTableRows, setSimulationTableRows] = useState([]);
  const [simulationResultGeoJson, setSimulationResultGeoJson] = useState(null);
  const [simulationRunMessage, setSimulationRunMessage] = useState("");
  const [measurementPanelOpen, setMeasurementPanelOpen] = useState(false);
  const [measurementType, setMeasurementType] = useState("none");
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measureDistance, setMeasureDistance] = useState(null);
  const [measureArea, setMeasureArea] = useState(null);
  const [measureAreaLoading, setMeasureAreaLoading] = useState(false);
  const [measureAreaError, setMeasureAreaError] = useState("");

  const currentProfile = SIMULATION_PROFILES[geometryType] ?? SIMULATION_PROFILES.point;
  const features = Array.isArray(previewGeoJson?.features) ? previewGeoJson.features : [];

  const previewData = useMemo(
    () => buildPreviewData(features, geometryType, radius, selectedRegion, showHeatmap, useClustering, showBoundary),
    [features, geometryType, radius, selectedRegion, showHeatmap, useClustering, showBoundary],
  );

  const simulationData = useMemo(() => {
    if (!simulationSummary) {
      return null;
    }

    return buildSimulationResultData(simulationSummary, simulationTableRows, selectedRegion, radius);
  }, [simulationSummary, simulationTableRows, selectedRegion, radius]);

  const displayData = simulationData ?? previewData;
  const activeTable = displayData.tableData[selectedTab] ?? displayData.tableData.result;

  const resetWithProfile = (profile) => {
    setMapMode(profile.defaultMapMode);
    setSelectedRegion(profile.defaultRegion);
    setRadius(profile.defaultRadius);
    setDensityLevel(profile.defaultDensity);
    setShowHeatmap(true);
    setUseClustering(true);
    setShowBoundary(false);
    setSelectedTab("result");
    setSimulationErrorMessage("");
    setSimulationRunMessage("");
    setSimulationSummary(null);
    setSimulationTableRows([]);
    setSimulationResultGeoJson(null);
    setMeasurementPanelOpen(false);
    setMeasurementType("none");
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
    setMeasureAreaLoading(false);
    setMeasureAreaError("");
  };

  const handleReset = () => {
    resetWithProfile(currentProfile);
  };

  const handleRun = async () => {
    if (!datasetId) {
      setSimulationErrorMessage("데이터셋 정보를 확인할 수 없습니다.");
      return;
    }

    if (geometryType !== "point") {
      setSimulationErrorMessage("현재 1차 시뮬레이션 API는 포인트 데이터만 지원합니다.");
      return;
    }

    try {
      setSimulationLoading(true);
      setSimulationErrorMessage("");
      setSimulationRunMessage("");
      setSelectedTab("result");

      const response = await runPointRadiusSimulationApi(datasetId, radius);
      const responseData = response?.data ?? {};
      const parsedResultGeoJson = parseGeoJson(responseData.resultGeoJson);

      setSimulationSummary(responseData.summary ?? null);
      setSimulationTableRows(Array.isArray(responseData.table) ? responseData.table : []);
      setSimulationResultGeoJson(parsedResultGeoJson);
      setSimulationRunMessage(`반경 ${radius}m 기준 시뮬레이션 결과가 반영되었습니다.`);
    } catch (error) {
      setSimulationSummary(null);
      setSimulationTableRows([]);
      setSimulationResultGeoJson(null);

      if (error?.response?.status === 403) {
        setSimulationErrorMessage("시뮬레이션 결과를 확인할 권한이 없습니다.");
      } else if (error?.response?.status === 404) {
        setSimulationErrorMessage("포인트 시뮬레이션 결과를 만들 수 있는 공간 데이터가 없습니다.");
      } else if (error?.response?.status === 400) {
        setSimulationErrorMessage("반경 설정을 다시 확인해주세요.");
      } else {
        setSimulationErrorMessage("시뮬레이션 실행 중 오류가 발생했습니다.");
      }
    } finally {
      setSimulationLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchDatasetTitle = async () => {
      try {
        const response = await getDatasetDownloadPageApi(datasetId);

        if (!cancelled) {
          setDatasetTitle(response?.data?.dataset?.title ?? "데이터셋");
        }
      } catch {
        if (!cancelled) {
          setDatasetTitle("데이터셋");
        }
      }
    };

    if (!datasetId) {
      setDatasetTitle("데이터셋");
      return undefined;
    }

    fetchDatasetTitle();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  useEffect(() => {
    let cancelled = false;

    const requestMeasureArea = async () => {
      if (measurementType !== "area") {
        setMeasureArea(null);
        setMeasureAreaLoading(false);
        setMeasureAreaError("");
        return;
      }

      if (measurePoints.length < 3) {
        setMeasureArea(null);
        setMeasureAreaLoading(false);
        setMeasureAreaError("");
        return;
      }

      if (!datasetId) {
        setMeasureArea(null);
        setMeasureAreaLoading(false);
        setMeasureAreaError("데이터셋 정보를 확인할 수 없습니다.");
        return;
      }

      try {
        setMeasureAreaLoading(true);
        setMeasureAreaError("");

        const response = await measureSimulationAreaApi(
          datasetId,
          measurePoints.map((point) => ({
            lat: point.lat,
            lng: point.lng,
          })),
        );

        if (!cancelled) {
          setMeasureArea(response?.data?.areaSquareMeters ?? null);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setMeasureArea(null);

        if (error?.response?.status === 400) {
          setMeasureAreaError("면적 계산 좌표를 다시 확인해주세요.");
        } else if (error?.response?.status === 403) {
          setMeasureAreaError("면적 계산 결과를 확인할 권한이 없습니다.");
        } else if (error?.response?.status === 404) {
          setMeasureAreaError("면적 계산 기준 데이터를 찾을 수 없습니다.");
        } else {
          setMeasureAreaError("면적 계산 중 오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) {
          setMeasureAreaLoading(false);
        }
      }
    };

    requestMeasureArea();

    return () => {
      cancelled = true;
    };
  }, [datasetId, measurementType, measurePoints]);

  useEffect(() => {
    let cancelled = false;

    const fetchPreviewGeoJson = async () => {
      try {
        setPreviewLoading(true);
        setPreviewErrorMessage("");

        const previewResponse = await getDatasetPreviewGeoJsonApi(datasetId);
        const previewData = parseGeoJson(previewResponse.data);

        if (cancelled) {
          return;
        }

        setPreviewGeoJson(previewData);

        const inferredGeometryType = inferSimulationGeometryType(previewData);
        if (inferredGeometryType && SIMULATION_PROFILES[inferredGeometryType]) {
          const nextProfile = SIMULATION_PROFILES[inferredGeometryType];
          setGeometryType(inferredGeometryType);
          setMapMode(nextProfile.defaultMapMode);
          setSelectedRegion(nextProfile.defaultRegion);
          setRadius(nextProfile.defaultRadius);
          setDensityLevel(nextProfile.defaultDensity);
          setShowHeatmap(true);
          setUseClustering(true);
          setShowBoundary(false);
          setSelectedTab("result");
        }

        setSimulationErrorMessage("");
        setSimulationRunMessage("");
        setSimulationSummary(null);
        setSimulationTableRows([]);
        setSimulationResultGeoJson(null);
        setMeasurementPanelOpen(false);
        setMeasurementType("none");
        setMeasurePoints([]);
        setMeasureDistance(null);
        setMeasureArea(null);
        setMeasureAreaLoading(false);
        setMeasureAreaError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewGeoJson(null);
        setSimulationSummary(null);
        setSimulationTableRows([]);
        setSimulationResultGeoJson(null);
        setMeasureAreaLoading(false);
        setMeasureAreaError("");

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

  const noticeText = simulationErrorMessage || simulationRunMessage || currentProfile.statusText;

  return (
    <div className="container-fluid px-4 py-3 simulation-test-page">
      <div className="row mb-3">
        <div className="col">
          <TopTitle
            title={`${datasetTitle || "데이터셋"} 시뮬레이션`}
            subTitle={currentProfile.subtitle}
            showGuide={false}
          />
        </div>
      </div>

      <div className="row g-3 simulation-test-main-row">
        <div className="col-12 col-xl-3 simulation-test-side-column">
          <div className="row g-3 simulation-test-side-stack">
            <div className="col-12">
              <SimulationDatasetInfo datasetInfo={displayData.datasetInfo} />
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
                statusText={noticeText}
                handleRun={handleRun}
                handleReset={handleReset}
                profile={currentProfile}
                simulationLoading={simulationLoading}
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
                resultGeoJson={simulationResultGeoJson}
                previewLoading={previewLoading}
                previewErrorMessage={previewErrorMessage}
                simulationLoading={simulationLoading}
                measurementPanelOpen={measurementPanelOpen}
                setMeasurementPanelOpen={setMeasurementPanelOpen}
                measurementType={measurementType}
                setMeasurementType={setMeasurementType}
                measurePoints={measurePoints}
                setMeasurePoints={setMeasurePoints}
                measureDistance={measureDistance}
                setMeasureDistance={setMeasureDistance}
                measureArea={measureArea}
                setMeasureArea={setMeasureArea}
                measureAreaLoading={measureAreaLoading}
                measureAreaError={measureAreaError}
              />
            </div>

            <div className="col-12 col-xxl-4 simulation-test-summary-column">
              <SimulationResultSummary
                summaryStats={displayData.summaryStats}
                hotspotRanking={displayData.hotspotRanking}
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
