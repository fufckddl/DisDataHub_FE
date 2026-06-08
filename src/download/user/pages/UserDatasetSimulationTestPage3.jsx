import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CircleMarker, GeoJSON, MapContainer, Polygon, Polyline, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest3.css";
import {
  getDatasetDownloadPageApi,
  getDatasetPreviewGeoJsonApi,
  measureSimulationAreaApi,
  runPointRadiusSimulationApi,
} from "../../api/userDownloadApi";

const RESULT_TABS = [
  { id: "summary", label: "요약" },
  { id: "list", label: "목록" },
  { id: "chart", label: "분포" },
];

const MAP_FILTERS = [
  { id: "all", label: "전체 데이터" },
  { id: "result", label: "반경 결과" },
  { id: "preview", label: "원본 데이터" },
  { id: "heat", label: "밀집 보기" },
];

const GEOMETRY_LABELS = {
  point: "포인트",
  linestring: "라인",
  polygon: "폴리곤",
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

function inferSimulationGeometryType(geoJsonData) {
  const firstGeometryType = geoJsonData?.features?.find((feature) => feature?.geometry?.type)?.geometry?.type;

  if (!firstGeometryType) return "point";
  if (firstGeometryType.includes("Point")) return "point";
  if (firstGeometryType.includes("LineString")) return "linestring";
  if (firstGeometryType.includes("Polygon")) return "polygon";

  return "point";
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

function getFeatureDisplayName(feature, index) {
  const properties = feature?.properties ?? {};

  return (
    properties.featureName ??
    properties.name ??
    properties.title ??
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
  const featureName = getFeatureDisplayName(feature, 0);
  const geometryName = formatGeometryTypeName(feature?.geometry?.type);
  const centerCoordinate = getLayerCenterCoordinate(layer);
  const nearbyCountText = properties.nearbyCount !== undefined ? `${formatCount(properties.nearbyCount)}건` : null;

  const container = L.DomUtil.create("div", "simulation-test3-map-tooltip");
  const title = L.DomUtil.create("strong", "", container);
  title.textContent = featureName;

  const layerText = L.DomUtil.create("span", "", container);
  layerText.textContent = `레이어: ${layerLabel}`;

  const geometryText = L.DomUtil.create("span", "", container);
  geometryText.textContent = `공간 유형: ${geometryName}`;

  if (centerCoordinate) {
    const coordinateText = L.DomUtil.create("span", "", container);
    coordinateText.textContent = `좌표: ${Number(centerCoordinate.lat).toFixed(6)}, ${Number(centerCoordinate.lng).toFixed(6)}`;
  }

  if (nearbyCountText) {
    const countText = L.DomUtil.create("span", "", container);
    countText.textContent = `인접 개수: ${nearbyCountText}`;
  }

  layer.bindTooltip(container, {
    sticky: true,
    direction: "top",
    opacity: 0.96,
    className: "simulation-test3-leaflet-tooltip",
  });
}

function buildPreviewRows(features) {
  return features.slice(0, 20).map((feature, index) => {
    const coordinateText = getPointCoordinateText(feature);

    return {
      id: feature?.properties?.featureId ?? feature?.properties?.id ?? `preview-${index}`,
      name: getFeatureDisplayName(feature, index),
      type: formatGeometryTypeName(feature?.geometry?.type),
      metric: "-",
      lat: coordinateText.lat,
      lng: coordinateText.lng,
      source: "미리보기",
    };
  });
}

function buildSimulationRows(tableRows) {
  return tableRows.map((row, index) => ({
    id: row.featureId ?? `result-${index}`,
    rank: row.rank ?? index + 1,
    name: row.featureName ?? `객체 ${index + 1}`,
    type: "Point",
    metric: `${formatCount(row.nearbyCount)}건`,
    nearbyCount: row.nearbyCount ?? 0,
    lat: row.latitude != null ? Number(row.latitude).toFixed(6) : "-",
    lng: row.longitude != null ? Number(row.longitude).toFixed(6) : "-",
    source: "분석 결과",
  }));
}

function buildDistributionRows(rows) {
  if (rows.length === 0) {
    return [
      { label: "결과 없음", count: 0, width: "0%" },
    ];
  }

  const maxNearbyCount = Math.max(...rows.map((row) => Number(row.nearbyCount ?? 0)), 1);
  const high = rows.filter((row) => Number(row.nearbyCount ?? 0) >= maxNearbyCount * 0.75).length;
  const middle = rows.filter((row) => {
    const value = Number(row.nearbyCount ?? 0);
    return value >= maxNearbyCount * 0.4 && value < maxNearbyCount * 0.75;
  }).length;
  const low = rows.filter((row) => Number(row.nearbyCount ?? 0) < maxNearbyCount * 0.4).length;
  const total = Math.max(rows.length, 1);

  return [
    { label: "높은 밀집", count: high, width: `${Math.round((high / total) * 100)}%` },
    { label: "보통 밀집", count: middle, width: `${Math.round((middle / total) * 100)}%` },
    { label: "낮은 밀집", count: low, width: `${Math.round((low / total) * 100)}%` },
  ];
}

function SimulationMapBoundsUpdater({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonData) return;

    const layer = L.geoJSON(geoJsonData);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36] });
    }
  }, [geoJsonData, map]);

  return null;
}

function SimulationMapHomeControl({ geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "bottomright" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar simulation-test3-home-control");
      const button = L.DomUtil.create("button", "simulation-test3-home-control-button", container);
      button.type = "button";
      button.innerHTML = '<i class="bi bi-crosshair"></i>';
      button.title = "데이터 위치로 이동";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (event) => {
        L.DomEvent.preventDefault(event);
        L.DomEvent.stopPropagation(event);

        if (geoJsonData) {
          const layer = L.geoJSON(geoJsonData);
          const bounds = layer.getBounds();

          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [36, 36] });
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

function SimulationLeafletMap({
  geometryType,
  mapFilter,
  previewGeoJson,
  resultGeoJson,
  previewLoading,
  previewErrorMessage,
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
  const showPreviewLayer = hasPreviewFeatures && mapFilter !== "result";
  const showResultLayer = hasResultFeatures && mapFilter !== "preview";
  const heatMode = mapFilter === "heat";
  const hasMeasurement = measurementType !== "none";

  const previewStyle = {
    color: geometryType === "linestring" ? "#475569" : "#64748b",
    weight: geometryType === "linestring" ? 4 : 2,
    fillColor: "#cbd5e1",
    fillOpacity: geometryType === "polygon" ? 0.18 : 0.08,
  };

  const resultStyle = {
    color: "#2563eb",
    weight: 3,
    fillColor: "#60a5fa",
    fillOpacity: 0.22,
  };

  const previewPointToLayer = (_, latlng) =>
    L.circleMarker(latlng, {
      radius: heatMode ? 8 : 6,
      fillColor: "#64748b",
      color: "#ffffff",
      weight: 2,
      fillOpacity: heatMode ? 0.55 : 0.88,
    });

  const resultPointToLayer = (feature, latlng) => {
    const nearbyCount = Number(feature?.properties?.nearbyCount ?? 0);
    return L.circleMarker(latlng, {
      radius: heatMode ? Math.min(18, 8 + nearbyCount) : 8,
      fillColor: heatMode ? "#f97316" : "#2563eb",
      color: "#ffffff",
      weight: 2,
      fillOpacity: heatMode ? 0.68 : 0.95,
    });
  };

  const handleMeasureReset = () => {
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
  };

  const measurementTitle = measurementType === "area" ? "면적 측정" : "거리 측정";
  const measurementValue =
    measurementType === "area"
      ? (measureAreaLoading ? "계산 중..." : formatArea(measureArea))
      : formatDistance(measureDistance);

  return (
    <div className="simulation-test3-leaflet-stage">
      <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} className="simulation-test3-leaflet-map">
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
        {showPreviewLayer ? (
          <GeoJSON
            key={`preview-${mapFilter}-${geometryType}`}
            data={previewGeoJson}
            style={previewStyle}
            pointToLayer={previewPointToLayer}
            onEachFeature={(feature, layer) => bindFeatureTooltip(feature, layer, "원본 데이터")}
          />
        ) : null}
        {showResultLayer ? (
          <GeoJSON
            key={`result-${mapFilter}`}
            data={resultGeoJson}
            style={resultStyle}
            pointToLayer={resultPointToLayer}
            onEachFeature={(feature, layer) => bindFeatureTooltip(feature, layer, "시뮬레이션 결과")}
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
        {measurementType === "distance" && measurePoints.length === 2 ? (
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

      {previewLoading ? (
        <div className="simulation-test3-map-status">공간 데이터를 불러오는 중입니다.</div>
      ) : previewErrorMessage ? (
        <div className="simulation-test3-map-status error">{previewErrorMessage}</div>
      ) : !hasPreviewFeatures ? (
        <div className="simulation-test3-map-status">표시할 공간 좌표 데이터가 없습니다.</div>
      ) : null}

      <div className="simulation-test3-legend">
        <strong>범례</strong>
        <span><i className="preview" />원본 데이터</span>
        <span><i className="result" />시뮬레이션 결과</span>
      </div>

      {hasMeasurement ? (
        <div className="simulation-test3-measure-panel">
          <div className="simulation-test3-measure-head">
            <div>
              <span>측정 도구</span>
              <strong>{measurementTitle}</strong>
            </div>
            <button type="button" onClick={() => setMeasurementType("none")} aria-label="측정 닫기">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="simulation-test3-measure-value-card">
            <span>{measurementType === "area" ? "계산 면적" : "측정 거리"}</span>
            <strong>{measurementValue}</strong>
          </div>

          <p className={measureAreaError ? "error" : ""}>
            {measurementType === "area"
              ? (measureAreaError || "세 개 이상의 지점을 선택하면 면적이 계산됩니다.")
              : "두 지점을 선택하면 직선거리가 계산됩니다."}
          </p>
          <button type="button" className="simulation-test3-measure-reset" onClick={handleMeasureReset}>
            측정 초기화
          </button>
        </div>
      ) : null}
    </div>
  );
}

function UserDatasetSimulationTestPage3() {
  const { datasetId } = useParams();
  const [isSettingOpen, setIsSettingOpen] = useState(true);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [mapFilter, setMapFilter] = useState("all");
  const [geometryType, setGeometryType] = useState("point");
  const [radius, setRadius] = useState(500);
  const [showResultLayer, setShowResultLayer] = useState(true);
  const [showPreviewLayer, setShowPreviewLayer] = useState(true);
  const [datasetPage, setDatasetPage] = useState(null);
  const [datasetErrorMessage, setDatasetErrorMessage] = useState("");
  const [previewGeoJson, setPreviewGeoJson] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewErrorMessage, setPreviewErrorMessage] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationErrorMessage, setSimulationErrorMessage] = useState("");
  const [simulationRunMessage, setSimulationRunMessage] = useState("");
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [simulationTableRows, setSimulationTableRows] = useState([]);
  const [simulationResultGeoJson, setSimulationResultGeoJson] = useState(null);
  const [measurementType, setMeasurementType] = useState("none");
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measureDistance, setMeasureDistance] = useState(null);
  const [measureArea, setMeasureArea] = useState(null);
  const [measureAreaLoading, setMeasureAreaLoading] = useState(false);
  const [measureAreaError, setMeasureAreaError] = useState("");

  const dataset = datasetPage?.dataset;
  const datasetTitle = dataset?.title ?? "데이터셋";
  const datasetSubtitle =
    dataset?.description ??
    "지도에서 공간 데이터를 확인하고 반경 기준 시뮬레이션을 실행합니다.";
  const previewFeatures = useMemo(
    () => (Array.isArray(previewGeoJson?.features) ? previewGeoJson.features : []),
    [previewGeoJson],
  );
  const previewRows = useMemo(() => buildPreviewRows(previewFeatures), [previewFeatures]);
  const simulationRows = useMemo(() => buildSimulationRows(simulationTableRows), [simulationTableRows]);
  const hasSimulationResult = Boolean(simulationSummary);
  const resultRows = hasSimulationResult ? simulationRows : previewRows;
  const distributionRows = useMemo(() => buildDistributionRows(simulationRows), [simulationRows]);
  const currentMapFilter = mapFilter === "result" && !hasSimulationResult ? "all" : mapFilter;

  const summaryStats = hasSimulationResult
    ? [
        { label: "전체 포인트", value: `${formatCount(simulationSummary?.totalPointCount)}건` },
        { label: "핫스팟", value: `${formatCount(simulationSummary?.hotspotCount)}건` },
        { label: "평균 인접", value: formatDecimal(simulationSummary?.averageNearbyCount) },
        { label: "최대 인접", value: `${formatCount(simulationSummary?.maxNearbyCount)}건` },
      ]
    : [
        { label: "미리보기 객체", value: `${formatCount(previewFeatures.length)}건` },
        { label: "공간 유형", value: GEOMETRY_LABELS[geometryType] ?? "-" },
        { label: "분석 반경", value: `${formatCount(radius)}m` },
        { label: "결과 상태", value: "실행 전" },
      ];

  const noticeText =
    simulationErrorMessage ||
    simulationRunMessage ||
    (geometryType === "point"
      ? "반경을 설정한 뒤 실행하면 포인트 주변 인접 데이터를 분석합니다."
      : "현재 1차 시뮬레이션 API는 포인트 데이터셋만 지원합니다.");

  useEffect(() => {
    let cancelled = false;

    const fetchDatasetPage = async () => {
      if (!datasetId) {
        setDatasetErrorMessage("데이터셋 정보를 확인할 수 없습니다.");
        return;
      }

      try {
        setDatasetErrorMessage("");
        const response = await getDatasetDownloadPageApi(datasetId);

        if (!cancelled) {
          setDatasetPage(response?.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setDatasetPage(null);
          setDatasetErrorMessage("데이터셋 정보를 불러오지 못했습니다.");
        }
      }
    };

    fetchDatasetPage();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  useEffect(() => {
    let cancelled = false;

    const fetchPreviewGeoJson = async () => {
      if (!datasetId) {
        setPreviewGeoJson(null);
        setPreviewLoading(false);
        setPreviewErrorMessage("데이터셋 정보를 확인할 수 없습니다.");
        return;
      }

      try {
        setPreviewLoading(true);
        setPreviewErrorMessage("");

        const response = await getDatasetPreviewGeoJsonApi(datasetId);
        const parsedGeoJson = parseGeoJson(response?.data);

        if (cancelled) {
          return;
        }

        setPreviewGeoJson(parsedGeoJson);
        setGeometryType(inferSimulationGeometryType(parsedGeoJson));
        setSimulationSummary(null);
        setSimulationTableRows([]);
        setSimulationResultGeoJson(null);
        setSimulationRunMessage("");
        setSimulationErrorMessage("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewGeoJson(null);
        setSimulationSummary(null);
        setSimulationTableRows([]);
        setSimulationResultGeoJson(null);

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

    fetchPreviewGeoJson();

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
          setMeasureAreaError("면적 계산 권한이 없습니다.");
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

  const handleRun = async () => {
    if (!datasetId) {
      setSimulationErrorMessage("데이터셋 정보를 확인할 수 없습니다.");
      setIsResultOpen(true);
      return;
    }

    if (geometryType !== "point") {
      setSimulationErrorMessage("현재 1차 시뮬레이션 API는 포인트 데이터셋만 지원합니다.");
      setIsResultOpen(true);
      return;
    }

    try {
      setSimulationLoading(true);
      setSimulationErrorMessage("");
      setSimulationRunMessage("");
      setActiveTab("summary");

      const response = await runPointRadiusSimulationApi(datasetId, radius);
      const responseData = response?.data ?? {};

      setSimulationSummary(responseData.summary ?? null);
      setSimulationTableRows(Array.isArray(responseData.table) ? responseData.table : []);
      setSimulationResultGeoJson(parseGeoJson(responseData.resultGeoJson));
      setSimulationRunMessage(`반경 ${formatCount(radius)}m 기준 시뮬레이션 결과가 반영되었습니다.`);
      setMapFilter("all");
      setIsResultOpen(true);
    } catch (error) {
      setSimulationSummary(null);
      setSimulationTableRows([]);
      setSimulationResultGeoJson(null);
      setIsResultOpen(true);

      if (error?.response?.status === 403) {
        setSimulationErrorMessage("시뮬레이션 결과를 확인할 권한이 없습니다.");
      } else if (error?.response?.status === 404) {
        setSimulationErrorMessage("시뮬레이션할 포인트 공간 데이터가 없습니다.");
      } else if (error?.response?.status === 400) {
        setSimulationErrorMessage("반경 설정 또는 데이터 유형을 다시 확인해주세요.");
      } else {
        setSimulationErrorMessage("시뮬레이션 실행 중 오류가 발생했습니다.");
      }
    } finally {
      setSimulationLoading(false);
    }
  };

  const handleReset = () => {
    setRadius(500);
    setMapFilter("all");
    setShowResultLayer(true);
    setShowPreviewLayer(true);
    setActiveTab("summary");
    setSimulationErrorMessage("");
    setSimulationRunMessage("");
    setSimulationSummary(null);
    setSimulationTableRows([]);
    setSimulationResultGeoJson(null);
    setMeasurementType("none");
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
    setMeasureAreaLoading(false);
    setMeasureAreaError("");
  };

  const handleMeasurementTypeChange = (nextType) => {
    setMeasurementType((prev) => (prev === nextType ? "none" : nextType));
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
    setMeasureAreaError("");
  };

  return (
    <div className="simulation-test3-page">
      <div className={`simulation-test3-map-shell ${isSettingOpen ? "setting-open" : ""} ${isResultOpen ? "result-open" : ""}`}>
        <main className="simulation-test3-map-canvas" aria-label="시뮬레이션 지도">
          <SimulationLeafletMap
            geometryType={geometryType}
            mapFilter={currentMapFilter}
            previewGeoJson={showPreviewLayer ? previewGeoJson : null}
            resultGeoJson={showResultLayer ? simulationResultGeoJson : null}
            previewLoading={previewLoading}
            previewErrorMessage={previewErrorMessage}
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

          <div className="simulation-test3-top-tools" aria-label="지도 데이터 보기">
            {MAP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={currentMapFilter === filter.id ? "active" : ""}
                aria-pressed={currentMapFilter === filter.id}
                disabled={filter.id === "result" && !hasSimulationResult}
                onClick={() => setMapFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="simulation-test3-map-tools" aria-label="지도 도구">
            <button
              type="button"
              className={isResultOpen ? "active" : ""}
              aria-controls="simulation-test3-result-panel"
              aria-expanded={isResultOpen}
              aria-pressed={isResultOpen}
              onClick={() => setIsResultOpen(true)}
            >
              <i className="bi bi-bar-chart" />
              <span>결과</span>
            </button>
            <button
              type="button"
              className={measurementType === "distance" ? "active" : ""}
              aria-pressed={measurementType === "distance"}
              onClick={() => handleMeasurementTypeChange("distance")}
            >
              <i className="bi bi-rulers" />
              <span>거리</span>
            </button>
            <button
              type="button"
              className={measurementType === "area" ? "active" : ""}
              aria-pressed={measurementType === "area"}
              onClick={() => handleMeasurementTypeChange("area")}
            >
              <i className="bi bi-bounding-box" />
              <span>면적</span>
            </button>
          </div>

          <div className="simulation-test3-map-summary">
            <div>
              <span>반경</span>
              <strong>{formatCount(radius)}m</strong>
            </div>
            <div>
              <span>{hasSimulationResult ? "핫스팟" : "객체"}</span>
              <strong>{hasSimulationResult ? `${formatCount(simulationSummary?.hotspotCount)}건` : `${formatCount(previewFeatures.length)}건`}</strong>
            </div>
            <div>
              <span>{hasSimulationResult ? "평균 인접" : "공간 유형"}</span>
              <strong>{hasSimulationResult ? formatDecimal(simulationSummary?.averageNearbyCount) : GEOMETRY_LABELS[geometryType]}</strong>
            </div>
          </div>
        </main>

        <aside
          id="simulation-test3-setting-panel"
          className={`simulation-test3-setting-panel ${isSettingOpen ? "open" : ""}`}
          aria-label="시뮬레이션 실행 설정"
          aria-hidden={!isSettingOpen}
        >
          <div className="simulation-test3-panel-head">
            <div className="simulation-test3-title-wrap">
              <TopTitle
                title={`${datasetTitle} 시뮬레이션`}
                subTitle={datasetSubtitle}
                showGuide={false}
              />
            </div>
            <button type="button" className="simulation-test3-icon-button" onClick={() => setIsSettingOpen(false)} aria-label="설정 패널 닫기">
              <i className="bi bi-chevron-left" />
            </button>
          </div>

          <div className="simulation-test3-dataset-box">
            <span>선택 데이터셋</span>
            <strong>{datasetTitle}</strong>
            <small>
              {GEOMETRY_LABELS[geometryType] ?? "-"} · {dataset?.fileFormat ?? "-"} · {dataset?.provider ?? "제공기관 미상"}
            </small>
            {datasetErrorMessage ? <em>{datasetErrorMessage}</em> : null}
          </div>

          <div className="simulation-test3-field">
            <span className="simulation-test3-label">지도 표시</span>
            <div className="simulation-test3-segmented">
              {MAP_FILTERS.slice(0, 3).map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={currentMapFilter === filter.id ? "active" : ""}
                  aria-pressed={currentMapFilter === filter.id}
                  disabled={filter.id === "result" && !hasSimulationResult}
                  onClick={() => setMapFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="simulation-test3-field">
            <div className="simulation-test3-range-head">
              <label htmlFor="simulation-test3-radius">분석 반경</label>
              <strong>{formatCount(radius)}m</strong>
            </div>
            <input
              id="simulation-test3-radius"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
            <div className="simulation-test3-range-labels">
              <span>100m</span>
              <span>2km</span>
            </div>
          </div>

          <div className="simulation-test3-field">
            <span className="simulation-test3-label">표시 옵션</span>
            <div className="simulation-test3-check-list">
              <label>
                <input
                  type="checkbox"
                  checked={showPreviewLayer}
                  onChange={() => setShowPreviewLayer((prev) => !prev)}
                />
                원본 데이터 표시
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showResultLayer}
                  onChange={() => setShowResultLayer((prev) => !prev)}
                />
                결과 데이터 표시
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={currentMapFilter === "heat"}
                  onChange={() => setMapFilter((prev) => (prev === "heat" ? "all" : "heat"))}
                />
                밀집 강조 보기
              </label>
            </div>
          </div>

          <div className={`simulation-test3-notice ${simulationErrorMessage ? "error" : ""}`}>
            <i className="bi bi-info-circle" />
            <span>{noticeText}</span>
          </div>

          <div className="simulation-test3-setting-stats">
            {summaryStats.slice(0, 2).map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="simulation-test3-action-row">
            <button type="button" className="simulation-test3-button secondary" onClick={handleReset} disabled={simulationLoading}>
              초기화
            </button>
            <button type="button" className="simulation-test3-button primary" onClick={handleRun} disabled={simulationLoading}>
              {simulationLoading ? "실행 중..." : "실행"}
            </button>
          </div>
        </aside>

        <button
          type="button"
          className={`simulation-test3-setting-toggle ${isSettingOpen ? "open" : ""}`}
          aria-controls="simulation-test3-setting-panel"
          aria-expanded={isSettingOpen}
          onClick={() => setIsSettingOpen((prev) => !prev)}
          aria-label={isSettingOpen ? "설정 패널 닫기" : "설정 패널 열기"}
        >
          <i className={`bi ${isSettingOpen ? "bi-chevron-left" : "bi-chevron-right"}`} />
        </button>

        <section
          id="simulation-test3-result-panel"
          className={`simulation-test3-result-panel ${isResultOpen ? "open" : ""}`}
          aria-label="시뮬레이션 분석 결과"
          aria-hidden={!isResultOpen}
        >
          <div className="simulation-test3-panel-head">
            <div>
              <span className="simulation-test3-kicker">Result</span>
              <h2>분석 결과</h2>
            </div>
            <button type="button" className="simulation-test3-icon-button" onClick={() => setIsResultOpen(false)} aria-label="결과 패널 닫기">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="simulation-test3-tabs">
            {RESULT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? "active" : ""}
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "summary" && (
            <div className="simulation-test3-result-content">
              <div className="simulation-test3-stat-grid">
                {summaryStats.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className={`simulation-test3-note ${simulationErrorMessage ? "error" : ""}`}>
                <strong>{simulationErrorMessage ? "실행 오류" : hasSimulationResult ? "결과 메모" : "실행 전 안내"}</strong>
                <p>{noticeText}</p>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="simulation-test3-result-content">
              <div className="simulation-test3-result-list">
                {resultRows.length > 0 ? (
                  resultRows.map((item, index) => (
                    <button type="button" key={`${item.id}-${index}`}>
                      <span>
                        <strong>{hasSimulationResult ? `${item.rank}. ${item.name}` : item.name}</strong>
                        <small>{item.type} · {item.source} · {item.lat}, {item.lng}</small>
                      </span>
                      <em>{item.metric}</em>
                    </button>
                  ))
                ) : (
                  <div className="simulation-test3-empty-result">
                    표시할 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "chart" && (
            <div className="simulation-test3-result-content">
              <div className="simulation-test3-chart">
                {distributionRows.map((item) => (
                  <div key={item.label} style={{ "--bar": item.width }}>
                    <span>{item.label}</span>
                    <strong>{formatCount(item.count)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default UserDatasetSimulationTestPage3;
