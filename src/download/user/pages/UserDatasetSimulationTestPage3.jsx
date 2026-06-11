import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Circle, CircleMarker, GeoJSON, MapContainer, Polygon, Polyline, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest3.css";
import {
  getDatasetDownloadPageApi,
  getDatasetPreviewGeoJsonApi,
  getDatasetSimulationSummaryApi,
  measureSimulationAreaApi,
  runPointRadiusSimulationApi,
} from "../../api/userDownloadApi";

const RESULT_TABS = [
  { id: "summary", label: "요약" },
  { id: "list", label: "목록" },
];

const MAP_FILTERS = [
  { id: "all", label: "전체 데이터" },
  { id: "result", label: "반경 결과" },
  { id: "preview", label: "원본 데이터" },
  { id: "heat", label: "밀집 보기" },
];

const BASE_MAPS = [
  {
    id: "default",
    label: "기본",
    icon: "bi-map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
  {
    id: "light",
    label: "밝은",
    icon: "bi-brightness-high",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    maxZoom: 20,
  },
  {
    id: "topo",
    label: "지형",
    icon: "bi-triangle",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap",
    maxZoom: 17,
  },
  {
    id: "satellite",
    label: "위성",
    icon: "bi-globe-asia-australia",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
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

function formatCoordinate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(6);
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

function getMapFeatureKey(feature, layerId) {
  const properties = feature?.properties ?? {};
  const propertyKey =
    properties.featureId ??
    properties.id ??
    properties.rank ??
    properties.name ??
    properties.featureName ??
    properties.title ??
    properties.label;

  if (propertyKey !== undefined && propertyKey !== null && propertyKey !== "") {
    return `${layerId}-${propertyKey}`;
  }

  const geometryType = feature?.geometry?.type ?? "geometry";
  const coordinateKey = JSON.stringify(feature?.geometry?.coordinates ?? []).slice(0, 100);

  return `${layerId}-${geometryType}-${coordinateKey}`;
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

function getLayerStyleSnapshot(layer) {
  const options = layer?.options ?? {};
  const snapshot = {
    color: options.color,
    weight: options.weight,
    opacity: options.opacity,
    fillColor: options.fillColor,
    fillOpacity: options.fillOpacity,
    dashArray: options.dashArray,
  };

  if (typeof layer?.getRadius === "function") {
    snapshot.radius = layer.getRadius();
  }

  return snapshot;
}

function restoreSelectedMapLayer(layer) {
  if (!layer?._simulationOriginalStyle) {
    return;
  }

  const { radius, ...style } = layer._simulationOriginalStyle;

  if (typeof layer.setStyle === "function") {
    layer.setStyle(style);
  }

  if (radius !== undefined && typeof layer.setRadius === "function") {
    layer.setRadius(radius);
  }

  layer.getElement?.()?.classList.remove("simulation-test3-selected-layer");
  delete layer._simulationOriginalStyle;
}

function applySelectedMapLayer(layer) {
  if (!layer) {
    return;
  }

  if (!layer._simulationOriginalStyle) {
    layer._simulationOriginalStyle = getLayerStyleSnapshot(layer);
  }

  const originalRadius = layer._simulationOriginalStyle.radius;
  const originalWeight = Number(layer._simulationOriginalStyle.weight ?? 3);

  if (typeof layer.setStyle === "function") {
    layer.setStyle({
      color: "#ea580c",
      weight: Math.max(originalWeight + 2.5, 6),
      opacity: 1,
      fillColor: "#f97316",
      fillOpacity: 0.36,
      dashArray: null,
    });
  }

  if (originalRadius !== undefined && typeof layer.setRadius === "function") {
    layer.setRadius(Math.max(Number(originalRadius) + 2, 9.5));
  }

  layer.getElement?.()?.classList.add("simulation-test3-selected-layer");

  if (typeof layer.bringToFront === "function") {
    layer.bringToFront();
  }
}

function buildMapFeatureInfo(feature, layer, layerId, layerLabel) {
  const properties = feature?.properties ?? {};
  const centerCoordinate = getLayerCenterCoordinate(layer);
  const nearbyCountText = properties.nearbyCount !== undefined ? `${formatCount(properties.nearbyCount)}건` : null;
  const distanceText = properties.distanceMeters !== undefined ? formatDistance(properties.distanceMeters) : null;
  const radiusText = properties.radius !== undefined ? `${formatCount(properties.radius)}m` : null;
  const layerTypeText = properties.layerType === "radius"
    ? "반경 영역"
    : properties.layerType === "center"
      ? "중심 포인트"
      : properties.layerType === "resultPoint"
        ? "반경 내 데이터"
      : layerLabel;

  return {
    key: getMapFeatureKey(feature, layerId),
    name: getFeatureDisplayName(feature, 0),
    layerText: layerTypeText,
    geometryName: formatGeometryTypeName(feature?.geometry?.type),
    coordinateText: centerCoordinate
      ? `${Number(centerCoordinate.lat).toFixed(6)}, ${Number(centerCoordinate.lng).toFixed(6)}`
      : "-",
    nearbyCountText,
    distanceText,
    radiusText,
  };
}

function bindFeatureTooltip(feature, layer, layerId, layerLabel) {
  const featureInfo = buildMapFeatureInfo(feature, layer, layerId, layerLabel);

  const container = L.DomUtil.create("div", "simulation-test3-map-tooltip");
  const title = L.DomUtil.create("strong", "", container);
  title.textContent = featureInfo.name;

  const layerText = L.DomUtil.create("span", "", container);
  layerText.textContent = `레이어: ${featureInfo.layerText}`;

  const geometryText = L.DomUtil.create("span", "", container);
  geometryText.textContent = `공간 유형: ${featureInfo.geometryName}`;

  if (featureInfo.coordinateText !== "-") {
    const coordinateText = L.DomUtil.create("span", "", container);
    coordinateText.textContent = `대표 좌표: ${featureInfo.coordinateText}`;
  }

  if (featureInfo.nearbyCountText) {
    const countText = L.DomUtil.create("span", "", container);
    countText.textContent = `인접 개수: ${featureInfo.nearbyCountText}`;
  }

  if (featureInfo.distanceText) {
    const distance = L.DomUtil.create("span", "", container);
    distance.textContent = `기준 거리: ${featureInfo.distanceText}`;
  }

  if (featureInfo.radiusText) {
    const radius = L.DomUtil.create("span", "", container);
    radius.textContent = `분석 반경: ${featureInfo.radiusText}`;
  }

  layer.bindTooltip(container, {
    sticky: true,
    direction: "top",
    opacity: 0.96,
    className: "simulation-test3-leaflet-tooltip",
  });
}

function buildSimulationRows(tableRows) {
  return tableRows.map((row, index) => ({
    id: row.featureId ?? `result-${index}`,
    featureKey: `result-${row.featureId ?? `result-${index}`}`,
    rank: row.rank ?? index + 1,
    name: row.featureName ?? `객체 ${index + 1}`,
    type: "Point",
    metric: formatDistance(row.distanceMeters),
    nearbyCount: row.nearbyCount ?? 0,
    distanceMeters: row.distanceMeters ?? null,
    lat: row.latitude != null ? Number(row.latitude).toFixed(6) : "-",
    lng: row.longitude != null ? Number(row.longitude).toFixed(6) : "-",
    source: "반경 결과",
  }));
}

function findGeoJsonFeatureByKey(geoJsonData, layerId, targetKey) {
  if (!targetKey || !Array.isArray(geoJsonData?.features)) {
    return null;
  }

  return geoJsonData.features.find((feature) => getMapFeatureKey(feature, layerId) === targetKey) ?? null;
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

function SimulationFeatureFocus({ focusRequest, previewGeoJson, resultGeoJson }) {
  const map = useMap();

  useEffect(() => {
    const targetKey = focusRequest?.key;
    if (!targetKey) {
      return;
    }

    const layerId = targetKey.startsWith("result-") ? "result" : "preview";
    const targetFeature = layerId === "result"
      ? findGeoJsonFeatureByKey(resultGeoJson, "result", targetKey)
      : findGeoJsonFeatureByKey(previewGeoJson, "preview", targetKey);

    if (!targetFeature?.geometry) {
      return;
    }

    const layer = L.geoJSON(targetFeature);
    const bounds = layer.getBounds();

    if (!bounds.isValid()) {
      return;
    }

    const geometryType = targetFeature.geometry.type ?? "";
    const center = bounds.getCenter();

    if (geometryType.includes("Point")) {
      map.flyTo(center, Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 0.55,
      });
      return;
    }

    map.flyToBounds(bounds.pad(0.25), {
      animate: true,
      duration: 0.55,
      maxZoom: 16,
      padding: [64, 64],
    });
  }, [focusRequest, map, previewGeoJson, resultGeoJson]);

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

function SimulationPointSelectionEvents({ enabled, onSelectPoint }) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      onSelectPoint({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function SimulationLeafletMap({
  geometryType,
  selectedBaseMap,
  mapFilter,
  previewGeoJson,
  resultGeoJson,
  radius,
  selectedPoint,
  pointSelectMode,
  onSelectPoint,
  selectedFeature,
  selectedFeatureKey,
  focusRequest,
  onFeatureSelect,
  onClearFeatureSelect,
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
  const coordinateInputMode = pointSelectMode || hasMeasurement;
  const safeRadius = Math.max(Number(radius ?? 1), 1);
  const baseMap = selectedBaseMap ?? BASE_MAPS[0];
  const selectedLayerRef = useRef(null);

  const previewStyle = (feature) => {
    const isSelected = selectedFeatureKey === getMapFeatureKey(feature, "preview");

    return {
      color: isSelected ? "#ea580c" : "#2563eb",
      weight: isSelected ? 5.5 : (geometryType === "linestring" ? 4 : 2.5),
      fillColor: isSelected ? "#f97316" : "#3b82f6",
      fillOpacity: isSelected ? 0.34 : (geometryType === "polygon" ? 0.24 : 0.16),
      opacity: 1,
      bubblingMouseEvents: coordinateInputMode,
      className: isSelected ? "simulation-test3-selected-path" : "simulation-test3-preview-path",
    };
  };

  const resultStyle = (feature) => {
    const distanceMeters = Number(feature?.properties?.distanceMeters ?? 0);
    const distanceRatio = safeRadius > 0 ? distanceMeters / safeRadius : 0;
    const isSelected = selectedFeatureKey === getMapFeatureKey(feature, "result");
    const resultColor = heatMode
      ? (distanceRatio <= 0.33 ? "#ef4444" : distanceRatio <= 0.66 ? "#f97316" : "#2563eb")
      : "#16a34a";

    return {
      color: isSelected ? "#ea580c" : resultColor,
      weight: isSelected ? 5.5 : 3,
      fillColor: isSelected ? "#f97316" : resultColor,
      fillOpacity: isSelected ? 0.36 : 0.3,
      opacity: 1,
      bubblingMouseEvents: coordinateInputMode,
      className: isSelected ? "simulation-test3-selected-path" : "simulation-test3-result-path",
    };
  };

  const previewPointToLayer = (feature, latlng) => {
    const isSelected = selectedFeatureKey === getMapFeatureKey(feature, "preview");

    return L.circleMarker(latlng, {
      radius: isSelected ? 8.5 : (heatMode ? 8 : 6.5),
      fillColor: isSelected ? "#f97316" : "#2563eb",
      color: isSelected ? "#ea580c" : "#2563eb",
      weight: isSelected ? 3 : 2.4,
      opacity: 1,
      fillOpacity: isSelected ? 0.38 : 0.2,
      bubblingMouseEvents: coordinateInputMode,
      className: isSelected ? "simulation-test3-selected-point-object" : "simulation-test3-preview-point",
    });
  };

  const resultPointToLayer = (feature, latlng) => {
    const distanceMeters = Number(feature?.properties?.distanceMeters ?? 0);
    const distanceRatio = safeRadius > 0 ? distanceMeters / safeRadius : 0;
    const isSelected = selectedFeatureKey === getMapFeatureKey(feature, "result");
    const resultColor = heatMode
      ? (distanceRatio <= 0.33 ? "#ef4444" : distanceRatio <= 0.66 ? "#f97316" : "#2563eb")
      : "#16a34a";
    const markerRadius = heatMode
      ? (distanceRatio <= 0.33 ? 11 : distanceRatio <= 0.66 ? 9 : 7)
      : 8;

    return L.circleMarker(latlng, {
      radius: isSelected ? markerRadius + 1.5 : markerRadius,
      fillColor: isSelected ? "#f97316" : resultColor,
      color: isSelected ? "#ea580c" : resultColor,
      weight: isSelected ? 3 : 2.5,
      opacity: 1,
      fillOpacity: isSelected ? 0.38 : 0.24,
      bubblingMouseEvents: coordinateInputMode,
      className: isSelected ? "simulation-test3-selected-point-object" : "simulation-test3-result-point",
    });
  };

  const bindSelectableFeature = (layerId, layerLabel) => (feature, layer) => {
    if (coordinateInputMode) {
      layer.options.bubblingMouseEvents = true;
      return;
    }

    layer.options.bubblingMouseEvents = false;
    bindFeatureTooltip(feature, layer, layerId, layerLabel);

    layer.on("click", (event) => {
      if (event?.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
        L.DomEvent.preventDefault(event.originalEvent);
        event.originalEvent._stopped = true;
      }

      if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
        selectedLayerRef.current.closeTooltip?.();
        restoreSelectedMapLayer(selectedLayerRef.current);
      }

      applySelectedMapLayer(layer);
      selectedLayerRef.current = layer;
      onFeatureSelect?.(buildMapFeatureInfo(feature, layer, layerId, layerLabel));
      layer.openTooltip?.(event?.latlng);
    });
  };

  const clearSelectedFeature = () => {
    selectedLayerRef.current?.closeTooltip?.();
    restoreSelectedMapLayer(selectedLayerRef.current);
    selectedLayerRef.current = null;
    onClearFeatureSelect?.();
  };

  useEffect(() => {
    if (!selectedFeatureKey) {
      restoreSelectedMapLayer(selectedLayerRef.current);
      selectedLayerRef.current = null;
    }
  }, [selectedFeatureKey]);

  useEffect(() => {
    return () => {
      restoreSelectedMapLayer(selectedLayerRef.current);
    };
  }, []);

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
    <div className={`simulation-test3-leaflet-stage ${pointSelectMode ? "selecting-point" : ""}`}>
      <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} className="simulation-test3-leaflet-map">
        <TileLayer
          key={baseMap.id}
          url={baseMap.url}
          attribution={baseMap.attribution}
          maxZoom={baseMap.maxZoom}
        />
        <SimulationMapBoundsUpdater geoJsonData={focusGeoJson} />
        <SimulationFeatureFocus
          focusRequest={focusRequest}
          previewGeoJson={previewGeoJson}
          resultGeoJson={resultGeoJson}
        />
        <SimulationMapHomeControl geoJsonData={focusGeoJson} />
        <ZoomControl position="bottomright" />
        <SimulationMeasureEvents
          measurementType={measurementType}
          setMeasurePoints={setMeasurePoints}
          setMeasureDistance={setMeasureDistance}
          setMeasureArea={setMeasureArea}
        />
        <SimulationPointSelectionEvents
          enabled={pointSelectMode && measurementType === "none"}
          onSelectPoint={onSelectPoint}
        />
        {selectedPoint ? (
          <>
            <Circle
              center={[selectedPoint.lat, selectedPoint.lng]}
              radius={safeRadius}
              pathOptions={{
                color: "#2563eb",
                weight: 2,
                fillColor: "#60a5fa",
                fillOpacity: 0.12,
                dashArray: "8 8",
              }}
            />
            <CircleMarker
              center={[selectedPoint.lat, selectedPoint.lng]}
              radius={8}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: "#ef4444",
                fillOpacity: 1,
                className: "simulation-test3-selected-point-marker",
              }}
            />
          </>
        ) : null}
        {showPreviewLayer ? (
          <GeoJSON
            key={`preview-${mapFilter}-${geometryType}-${coordinateInputMode ? "coordinate" : "select"}-${selectedFeatureKey ?? "none"}`}
            data={previewGeoJson}
            style={previewStyle}
            pointToLayer={previewPointToLayer}
            onEachFeature={bindSelectableFeature("preview", "원본 데이터")}
          />
        ) : null}
        {showResultLayer ? (
          <GeoJSON
            key={`result-${mapFilter}-${coordinateInputMode ? "coordinate" : "select"}-${selectedFeatureKey ?? "none"}`}
            data={resultGeoJson}
            style={resultStyle}
            pointToLayer={resultPointToLayer}
            onEachFeature={bindSelectableFeature("result", "시뮬레이션 결과")}
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
        {/* <strong>범례</strong> */}
        <span><i className="preview" />원본 데이터</span>
        <span><i className="result" />반경 내 데이터</span>
        <span><i className="feature-selected" />선택 객체</span>
      </div>

      {selectedFeature ? (
        <div className="simulation-test3-selected-feature-card">
          <div className="simulation-test3-selected-feature-head">
            <div>
              <span>선택 객체</span>
              <strong>{selectedFeature.name}</strong>
            </div>
            <button type="button" onClick={clearSelectedFeature} aria-label="선택 객체 닫기">
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <dl>
            <div>
              <dt>레이어</dt>
              <dd>{selectedFeature.layerText}</dd>
            </div>
            <div>
              <dt>공간 유형</dt>
              <dd>{selectedFeature.geometryName}</dd>
            </div>
            <div>
              <dt>대표 좌표</dt>
              <dd>{selectedFeature.coordinateText}</dd>
            </div>
            {selectedFeature.distanceText ? (
              <div>
                <dt>기준 거리</dt>
                <dd>{selectedFeature.distanceText}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

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
  const [selectedBaseMapId, setSelectedBaseMapId] = useState("default");
  const [geometryType, setGeometryType] = useState("point");
  const [radius, setRadius] = useState(500);
  const [showResultLayer, setShowResultLayer] = useState(true);
  const [showPreviewLayer, setShowPreviewLayer] = useState(true);
  const [datasetPage, setDatasetPage] = useState(null);
  const [datasetErrorMessage, setDatasetErrorMessage] = useState("");
  const [datasetFeatureTotalCount, setDatasetFeatureTotalCount] = useState(null);
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
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [pointSelectMode, setPointSelectMode] = useState(false);
  const [selectedMapFeature, setSelectedMapFeature] = useState(null);
  const [mapFocusRequest, setMapFocusRequest] = useState(null);

  const dataset = datasetPage?.dataset;
  const datasetTitle = dataset?.title ?? "데이터셋";
  const datasetSubtitle =
    dataset?.description ??
    "지도에서 공간 데이터를 확인하고 반경 기준 시뮬레이션을 실행합니다.";
  const previewFeatures = useMemo(
    () => (Array.isArray(previewGeoJson?.features) ? previewGeoJson.features : []),
    [previewGeoJson],
  );
  const simulationRows = useMemo(() => buildSimulationRows(simulationTableRows), [simulationTableRows]);
  const hasSimulationResult = Boolean(simulationSummary);
  const resultRows = hasSimulationResult ? simulationRows : [];
  const currentMapFilter = mapFilter === "result" && !hasSimulationResult ? "all" : mapFilter;
  const matchedPointCount = Number(simulationSummary?.matchedPointCount ?? simulationSummary?.hotspotCount ?? 0);
  const selectedBaseMap = BASE_MAPS.find((baseMap) => baseMap.id === selectedBaseMapId) ?? BASE_MAPS[0];
  const canAdjustRadius = Boolean(selectedPoint);
  const totalFeatureCount = Number.isFinite(Number(datasetFeatureTotalCount))
    ? Number(datasetFeatureTotalCount)
    : previewFeatures.length;

  const summaryStats = hasSimulationResult
    ? [
        { label: "전체 포인트", value: `${formatCount(simulationSummary?.totalPointCount ?? totalFeatureCount)}건` },
        { label: "포함 데이터", value: `${formatCount(matchedPointCount)}건` },
        { label: "평균 거리", value: matchedPointCount > 0 ? formatDistance(simulationSummary?.averageDistanceMeters) : "-" },
        { label: "가장 가까움", value: matchedPointCount > 0 ? formatDistance(simulationSummary?.nearestDistanceMeters) : "-" },
      ]
    : [
        { label: "전체 객체", value: `${formatCount(totalFeatureCount)}건` },
        { label: "공간 유형", value: GEOMETRY_LABELS[geometryType] ?? "-" },
        { label: "기준 지점", value: selectedPoint ? "선택 완료" : "미선택" },
        { label: "분석 반경", value: canAdjustRadius ? `${formatCount(radius)}m` : "지점 선택 후 설정" },
      ];

  const noticeText =
    simulationErrorMessage ||
    simulationRunMessage ||
    (geometryType === "point"
      ? (selectedPoint
        ? "반경을 설정하고 실행하면 기준 지점 주변 데이터를 찾습니다."
        : "지도에서 기준 지점을 선택한 뒤 반경 분석을 실행하세요.")
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

    const fetchDatasetSimulationSummary = async () => {
      if (!datasetId) {
        setDatasetFeatureTotalCount(null);
        return;
      }

      try {
        const response = await getDatasetSimulationSummaryApi(datasetId);

        if (!cancelled) {
          setDatasetFeatureTotalCount(response?.data?.totalFeatureCount ?? null);
        }
      } catch {
        if (!cancelled) {
          setDatasetFeatureTotalCount(null);
        }
      }
    };

    fetchDatasetSimulationSummary();

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
        setSelectedPoint(null);
        setPointSelectMode(false);
        setSelectedMapFeature(null);
        setMapFocusRequest(null);
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

    if (!selectedPoint) {
      setSimulationErrorMessage("지도에서 분석 기준 지점을 먼저 선택해주세요.");
      setIsResultOpen(true);
      return;
    }

    try {
      setSimulationLoading(true);
      setSimulationErrorMessage("");
      setSimulationRunMessage("");
      setActiveTab("summary");
      setSelectedMapFeature(null);
      setMapFocusRequest(null);

      const response = await runPointRadiusSimulationApi(datasetId, {
        radius,
        lat: selectedPoint.lat,
        lng: selectedPoint.lng,
      });
      const responseData = response?.data ?? {};
      const resultGeoJson = parseGeoJson(responseData.resultGeoJson);
      const resultCount = Number(responseData.summary?.matchedPointCount ?? responseData.summary?.hotspotCount ?? 0);

      setSimulationSummary(responseData.summary ?? null);
      setSimulationTableRows(Array.isArray(responseData.table) ? responseData.table : []);
      setSimulationResultGeoJson(resultGeoJson);
      setSimulationRunMessage(
        resultCount > 0
          ? `선택 지점 반경 ${formatCount(radius)}m 안에서 ${formatCount(resultCount)}건을 찾았습니다.`
          : `선택 지점 반경 ${formatCount(radius)}m 안에 포함 데이터가 없습니다. 반경을 넓히거나 기준 지점을 바꿔보세요.`
      );
      setMapFilter(Array.isArray(resultGeoJson?.features) && resultGeoJson.features.length > 0 ? "result" : "all");
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
        setSimulationErrorMessage("기준 지점, 반경 설정 또는 데이터 유형을 다시 확인해주세요.");
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
    setSelectedPoint(null);
    setPointSelectMode(false);
    setSelectedMapFeature(null);
    setMapFocusRequest(null);
  };

  const handleMeasurementTypeChange = (nextType) => {
    setPointSelectMode(false);
    setSelectedMapFeature(null);
    setMeasurementType((prev) => (prev === nextType ? "none" : nextType));
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
    setMeasureAreaError("");
  };

  const handlePointSelectMode = () => {
    setMeasurementType("none");
    setMeasurePoints([]);
    setMeasureDistance(null);
    setMeasureArea(null);
    setMeasureAreaError("");
    setPointSelectMode((prev) => !prev);
    setSelectedMapFeature(null);
    setMapFocusRequest(null);
    setSimulationErrorMessage("");
  };

  const handleMapPointSelect = (point) => {
    setSelectedPoint(point);
    setPointSelectMode(false);
    setSimulationSummary(null);
    setSimulationTableRows([]);
    setSimulationResultGeoJson(null);
    setSimulationRunMessage("");
    setSimulationErrorMessage("");
    setSelectedMapFeature(null);
    setMapFocusRequest(null);
    setMapFilter("all");
  };

  const handleResultRowSelect = (item) => {
    if (!item?.featureKey) {
      return;
    }

    setSelectedMapFeature({
      key: item.featureKey,
      name: item.name,
      layerText: "반경 내 데이터",
      geometryName: item.type,
      coordinateText: item.lat !== "-" && item.lng !== "-" ? `${item.lat}, ${item.lng}` : "-",
      distanceText: item.metric,
      nearbyCountText: item.nearbyCount ? `${formatCount(item.nearbyCount)}건` : null,
    });
    setMapFocusRequest({
      key: item.featureKey,
      requestedAt: Date.now(),
    });
    setMapFilter("result");
  };

  return (
    <div className="simulation-test3-page">
      <div className={`simulation-test3-map-shell ${isSettingOpen ? "setting-open" : ""} ${isResultOpen ? "result-open" : ""}`}>
        <main className="simulation-test3-map-canvas" aria-label="시뮬레이션 지도">
          <SimulationLeafletMap
            geometryType={geometryType}
            selectedBaseMap={selectedBaseMap}
            mapFilter={currentMapFilter}
            previewGeoJson={showPreviewLayer ? previewGeoJson : null}
            resultGeoJson={showResultLayer ? simulationResultGeoJson : null}
            radius={radius}
            selectedPoint={selectedPoint}
            pointSelectMode={pointSelectMode}
            onSelectPoint={handleMapPointSelect}
            selectedFeature={selectedMapFeature}
            selectedFeatureKey={selectedMapFeature?.key}
            focusRequest={mapFocusRequest}
            onFeatureSelect={setSelectedMapFeature}
            onClearFeatureSelect={() => setSelectedMapFeature(null)}
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

          <div className="simulation-test3-base-map-control" aria-label="지도 유형 선택">
            <span>지도 유형</span>
            <div>
              {BASE_MAPS.map((baseMap) => (
                <button
                  key={baseMap.id}
                  type="button"
                  className={selectedBaseMapId === baseMap.id ? "active" : ""}
                  aria-pressed={selectedBaseMapId === baseMap.id}
                  title={`${baseMap.label} 지도`}
                  onClick={() => setSelectedBaseMapId(baseMap.id)}
                >
                  <i className={`bi ${baseMap.icon}`} />
                  <em>{baseMap.label}</em>
                </button>
              ))}
            </div>
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
              <strong>{canAdjustRadius ? `${formatCount(radius)}m` : "미설정"}</strong>
            </div>
            <div>
              <span>{hasSimulationResult ? "포함" : "기준 지점"}</span>
              <strong>{hasSimulationResult ? `${formatCount(matchedPointCount)}건` : (selectedPoint ? "선택됨" : "미선택")}</strong>
            </div>
            <div>
              <span>{hasSimulationResult ? "평균 거리" : "공간 유형"}</span>
              <strong>{hasSimulationResult ? (matchedPointCount > 0 ? formatDistance(simulationSummary?.averageDistanceMeters) : "-") : GEOMETRY_LABELS[geometryType]}</strong>
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
            <span className="simulation-test3-label">기준 지점</span>
            <button
              type="button"
              className={`simulation-test3-select-point-button ${pointSelectMode ? "active" : ""}`}
              onClick={handlePointSelectMode}
              disabled={geometryType !== "point"}
            >
              <i className="bi bi-geo-alt" />
              {pointSelectMode ? "지도에서 선택 중" : "지도에서 지점 선택"}
            </button>
            <div className={`simulation-test3-selected-point ${selectedPoint ? "selected" : ""}`}>
              {selectedPoint ? (
                <>
                  <span>선택 좌표</span>
                  <strong>{formatCoordinate(selectedPoint.lat)}, {formatCoordinate(selectedPoint.lng)}</strong>
                </>
              ) : (
                "지도에서 분석 기준 지점을 선택해주세요."
              )}
            </div>
          </div>

          <div className="simulation-test3-field">
            <div className="simulation-test3-range-head">
              <label htmlFor="simulation-test3-radius">분석 반경</label>
              <strong>{canAdjustRadius ? `${formatCount(radius)}m` : "지점 선택 후 설정"}</strong>
            </div>
            <input
              id="simulation-test3-radius"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              disabled={!canAdjustRadius}
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
            <button
              type="button"
              className="simulation-test3-button primary"
              onClick={handleRun}
              disabled={simulationLoading || geometryType !== "point" || !selectedPoint}
            >
              {simulationLoading ? "실행 중..." : selectedPoint ? "실행" : "지점 선택 필요"}
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
                    <button
                      type="button"
                      key={`${item.id}-${index}`}
                      className={selectedMapFeature?.key === item.featureKey ? "active" : ""}
                      aria-pressed={selectedMapFeature?.key === item.featureKey}
                      onClick={() => handleResultRowSelect(item)}
                    >
                      <span>
                        <strong>{hasSimulationResult ? `${item.rank}. ${item.name}` : item.name}</strong>
                        <small>{item.type} · {item.source} · {item.lat}, {item.lng}</small>
                      </span>
                      <em>{item.metric}</em>
                    </button>
                  ))
                ) : (
                  <div className="simulation-test3-empty-result">
                    {hasSimulationResult
                      ? "반경 안에 표시할 결과가 없습니다."
                      : "시뮬레이션 실행 후 반경 내 데이터 목록이 표시됩니다."}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default UserDatasetSimulationTestPage3;
