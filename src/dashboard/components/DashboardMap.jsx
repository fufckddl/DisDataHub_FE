import { useCallback, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { defaults as defaultControls } from "ol/control/defaults.js";
import { createEmpty, extend, getCenter } from "ol/extent.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Point from "ol/geom/Point.js";
import { defaults as defaultInteractions } from "ol/interaction/defaults.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat, transformExtent } from "ol/proj.js";
import Cluster from "ol/source/Cluster.js";
import VectorSource from "ol/source/Vector.js";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style.js";
import axiosInstance from "../../commons/api/axiosinstance.js";

const KOREA_CENTER = fromLonLat([127.8, 36.2]);
const KOREA_BBOX = "124.50,32.80,132.20,39.60";
const INITIAL_ZOOM = 7.4;
const MIN_ZOOM = 7.4;
const MAX_ZOOM = 13;
const SIGUNGU_MIN_ZOOM = 7.6;
const EUPMYEONDONG_MIN_ZOOM = 10.4;
const CLUSTER_DISTANCE = 36;
const CLUSTER_MIN_DISTANCE = 14;
const CLUSTER_BREAK_ZOOM = 11.6;
const REGION_AGGREGATE_METRIC_CODE = "FEATURE_COUNT";
const BOUNDARY_CACHE_LEVELS = ["SIDO", "SIGUNGU", "EUPMYEONDONG"];
const BOUNDARY_FALLBACK_ORDER = ["EUPMYEONDONG", "SIGUNGU", "SIDO"];
const LEVEL_Z_INDEX = {
    SIDO: 1,
    SIGUNGU: 2,
    EUPMYEONDONG: 3,
};
const NEXT_LEVEL_BY_LEVEL = {
    SIDO: "SIGUNGU",
    SIGUNGU: "EUPMYEONDONG",
    EUPMYEONDONG: "JIPGYEGU",
};
const GIS_LAYER_THEMES = {
    STANDARD_LIBRARY_MAIN: {
        color: "#7c3aed",
        glow: "rgba(124, 58, 237, 0.26)",
        icon: "bi-book",
    },
    STANDARD_URBAN_PARK_MAIN: {
        color: "#16a34a",
        glow: "rgba(22, 163, 74, 0.26)",
        icon: "bi-tree",
    },
    STANDARD_BUS_STOP_MAIN: {
        color: "#0284c7",
        glow: "rgba(2, 132, 199, 0.26)",
        icon: "bi-bus-front",
    },
};
const DEFAULT_GIS_LAYER_THEME = {
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.28)",
    icon: "bi-geo-alt-fill",
};

const geoJsonFormat = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
});

function createInitialView() {
    return {
        level: "SIDO",
        parentArea: null,
        bbox: KOREA_BBOX,
        stack: [],
        zoom: INITIAL_ZOOM,
    };
}

function isRenderableExtent(extent) {
    return Array.isArray(extent)
        && extent.length === 4
        && extent.every((value) => Number.isFinite(value));
}

function fitMapToExtent(map, extent, options = {}) {
    if (!map || !isRenderableExtent(extent)) {
        return false;
    }

    map.updateSize();
    map.getView().fit(extent, {
        padding: [64, 64, 64, 64],
        maxZoom: options.maxZoom ?? INITIAL_ZOOM,
        duration: options.duration ?? 0,
    });
    return true;
}

function getLevelForZoom(zoom) {
    const safeZoom = Number.isFinite(zoom) ? zoom : INITIAL_ZOOM;

    if (safeZoom >= EUPMYEONDONG_MIN_ZOOM) {
        return "EUPMYEONDONG";
    }

    if (safeZoom >= SIGUNGU_MIN_ZOOM) {
        return "SIGUNGU";
    }

    return "SIDO";
}

function formatBboxFromMap(map) {
    const size = map.getSize();
    if (!size) {
        return KOREA_BBOX;
    }

    const extent = map.getView().calculateExtent(size);
    return transformExtent(extent, "EPSG:3857", "EPSG:4326")
        .map((value) => value.toFixed(4))
        .join(",");
}

function createViewFromMap(map, levelOverride = null) {
    const zoom = map.getView().getZoom() ?? INITIAL_ZOOM;
    const bbox = formatBboxFromMap(map);

    return {
        level: levelOverride ?? getLevelForZoom(zoom),
        parentArea: null,
        bbox,
        stack: [],
        zoom,
    };
}

function getLabelPoint(feature) {
    const cachedPoint = feature.get("labelPoint");
    if (cachedPoint) {
        return cachedPoint;
    }

    const geometry = feature.getGeometry();
    let coordinate = getCenter(geometry.getExtent());

    if (geometry.getType() === "Polygon") {
        coordinate = geometry.getInteriorPoint().getCoordinates();
    }

    if (geometry.getType() === "MultiPolygon") {
        const largestPolygon = geometry
            .getPolygons()
            .reduce((largest, polygon) => (!largest || polygon.getArea() > largest.getArea() ? polygon : largest), null);
        coordinate = largestPolygon?.getInteriorPoint().getCoordinates() ?? coordinate;
    }

    const labelPoint = new Point(coordinate);
    feature.set("labelPoint", labelPoint, true);
    return labelPoint;
}

function getFeatureBbox(feature) {
    const extent = feature.getGeometry().getExtent();
    const [minLon, minLat, maxLon, maxLat] = transformExtent(extent, "EPSG:3857", "EPSG:4326");
    const lonPadding = Math.max((maxLon - minLon) * 0.08, 0.01);
    const latPadding = Math.max((maxLat - minLat) * 0.08, 0.01);

    return [
        minLon - lonPadding,
        minLat - latPadding,
        maxLon + lonPadding,
        maxLat + latPadding,
    ].map((value) => value.toFixed(5)).join(",");
}

function getLevelLabel(level, area) {
    if (level === "SIDO") {
        return "도/특별시/광역시";
    }
    if (level === "SIGUNGU") {
        return area?.sidoCode === "11" ? "자치구" : "시군구";
    }
    if (level === "EUPMYEONDONG") {
        return "행정동";
    }
    if (level === "JIPGYEGU") {
        return "집계구";
    }

    return "행정구역";
}

function getFeatureArea(feature) {
    const level = feature.get("level");
    const childLevel = NEXT_LEVEL_BY_LEVEL[level] ?? null;
    const area = {
        areaCode: feature.get("areaCode"),
        sidoCode: feature.get("sidoCode"),
        sigunguCode: feature.get("sigunguCode"),
        eupmyeondongCode: feature.get("eupmyeondongCode"),
        name: feature.get("name"),
        fullName: feature.get("fullName"),
        level,
        parentAreaCode: feature.get("parentAreaCode"),
        parentAreaName: feature.get("parentAreaName"),
        parentLevel: feature.get("parentLevel"),
        childLevel,
        canDrillDown: Boolean(childLevel),
        bbox: getFeatureBbox(feature),
    };

    return {
        ...area,
        levelLabel: getLevelLabel(area.level, area),
    };
}

function getFeatureHoverInfo(feature) {
    const level = feature.get("level");
    const area = {
        level,
        sidoCode: feature.get("sidoCode"),
    };

    return {
        areaCode: feature.get("areaCode"),
        name: feature.get("fullName") ?? feature.get("name") ?? "지역",
        levelLabel: getLevelLabel(level, area),
    };
}

function getBoundaryStyle(feature, selectedFeature) {
    const isSelected = feature === selectedFeature;
    const level = feature.get("level");
    const name = feature.get("name") ?? "";
    const showLabel = typeof window === "undefined" || window.innerWidth >= 640;
    const labelFont = level === "EUPMYEONDONG"
        ? "700 10px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        : "800 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    const styles = [
        new Style({
            fill: new Fill({
                color: isSelected ? "rgba(37, 99, 235, 0.16)" : "rgba(37, 99, 235, 0.1)",
            }),
            stroke: new Stroke({
                color: isSelected ? "#1d4ed8" : "#2563eb",
                width: isSelected ? 2.2 : 1.55,
            }),
        }),
    ];

    if (!showLabel) {
        return styles;
    }

    styles.push(
        new Style({
            geometry: (item) => getLabelPoint(item),
            text: new Text({
                text: name,
                font: labelFont,
                fill: new Fill({
                    color: "#0f172a",
                }),
                stroke: new Stroke({
                    color: "rgba(255, 255, 255, 0.96)",
                    width: 3.4,
                }),
                offsetY: -2,
            }),
        }),
    );

    return styles;
}

function isSelectedSidoBoundary(feature, selectedFeature) {
    if (!selectedFeature) {
        return false;
    }

    const featureSidoCode = feature.get("sidoCode");
    const selectedSidoCode = selectedFeature.get("sidoCode");
    return Boolean(featureSidoCode && selectedSidoCode && featureSidoCode === selectedSidoCode);
}

function getSidoContextBoundaryStyle(feature, selectedFeature) {
    const isSelectedSido = isSelectedSidoBoundary(feature, selectedFeature);

    return new Style({
        fill: new Fill({
            color: "rgba(255, 255, 255, 0)",
        }),
        stroke: new Stroke({
            color: isSelectedSido ? "rgba(249, 115, 22, 0.96)" : "rgba(30, 64, 175, 0.56)",
            width: isSelectedSido ? 3.2 : 1.8,
        }),
    });
}

function getGisLayerTheme(datasetCode) {
    return GIS_LAYER_THEMES[datasetCode] ?? DEFAULT_GIS_LAYER_THEME;
}

function getGisClusterFeatures(feature) {
    const clusteredFeatures = feature?.get?.("features");
    return Array.isArray(clusteredFeatures) ? clusteredFeatures : null;
}

function formatNumberValue(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        return null;
    }
    return numberValue.toLocaleString();
}

function getClusterDistanceForZoom(zoom) {
    if (!Number.isFinite(zoom)) {
        return CLUSTER_DISTANCE;
    }
    if (zoom >= CLUSTER_BREAK_ZOOM) {
        return 0;
    }
    if (zoom >= EUPMYEONDONG_MIN_ZOOM) {
        return CLUSTER_MIN_DISTANCE;
    }
    return CLUSTER_DISTANCE;
}

function getFeaturesExtent(features) {
    const extent = createEmpty();
    features.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (geometry) {
            extend(extent, geometry.getExtent());
        }
    });
    return extent;
}

function getComparableAreaName(value) {
    return String(value ?? "")
        .replace(/특별자치도|특별자치시|광역시|특별시|자치도|도|시/g, "")
        .trim();
}

function findRegionBoundaryFeature(boundaryFeatures, regionStat) {
    const areaCode = regionStat.areaCode;
    const sourceAreaCode = regionStat.sourceAreaCode;
    const regionNames = [
        regionStat.fullName,
        regionStat.areaName,
    ].map(getComparableAreaName).filter(Boolean);

    return boundaryFeatures.find((feature) => feature.get("areaCode") === areaCode)
        ?? boundaryFeatures.find((feature) => sourceAreaCode && feature.get("sidoCode") === sourceAreaCode)
        ?? boundaryFeatures.find((feature) => {
            const featureNames = [
                feature.get("fullName"),
                feature.get("name"),
            ].map(getComparableAreaName);
            return regionNames.some((name) => featureNames.includes(name));
        })
        ?? null;
}

function createRegionAggregateFeature(regionStat, boundaryFeature, datasetCode) {
    const count = Number(regionStat.count ?? 0);
    const percent = Number(regionStat.percent ?? 0);
    const coordinate = getLabelPoint(boundaryFeature).getCoordinates();
    const feature = new Feature({
        geometry: new Point(coordinate),
    });

    feature.setProperties({
        datasetCode,
        metricCode: REGION_AGGREGATE_METRIC_CODE,
        isRegionAggregate: true,
        aggregateAreaCode: boundaryFeature.get("areaCode"),
        aggregateAreaName: boundaryFeature.get("fullName") ?? boundaryFeature.get("name"),
        featureName: `${boundaryFeature.get("name") ?? regionStat.areaName} ${count.toLocaleString()}건`,
        featureCategory: "시도별 집계",
        sourceAreaCode: regionStat.sourceAreaCode,
        sourceAreaName: regionStat.areaName,
        regionCount: count,
        regionPercent: percent,
    }, true);

    return feature;
}

function getGisFeatureStyle(feature) {
    const clusteredFeatures = getGisClusterFeatures(feature);
    const clusterSize = clusteredFeatures?.length ?? 1;
    const sourceFeature = clusteredFeatures?.[0] ?? feature;
    const datasetCode = sourceFeature.get("datasetCode");
    const theme = getGisLayerTheme(datasetCode);
    const isRegionAggregate = Boolean(sourceFeature.get("isRegionAggregate"));
    const isCluster = clusterSize > 1;
    const regionCount = Number(sourceFeature.get("regionCount") ?? 0);
    const radius = isRegionAggregate
        ? Math.min(30, 15 + Math.log10(Math.max(regionCount, 1)) * 6)
        : isCluster
        ? Math.min(24, 13 + Math.log10(clusterSize) * 6)
        : datasetCode === "STANDARD_BUS_STOP_MAIN" ? 4.8 : 6.4;
    const text = isRegionAggregate
        ? regionCount.toLocaleString()
        : isCluster ? clusterSize.toLocaleString() : null;

    return new Style({
        image: new CircleStyle({
            radius,
            fill: new Fill({
                color: isCluster || isRegionAggregate ? theme.glow.replace(/0\.\d+\)/, "0.86)") : theme.color,
            }),
            stroke: new Stroke({
                color: "#ffffff",
                width: 2,
            }),
        }),
        text: text
            ? new Text({
                text,
                font: "800 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fill: new Fill({ color: "#ffffff" }),
                stroke: new Stroke({ color: "rgba(15, 23, 42, 0.28)", width: 2 }),
            })
            : undefined,
    });
}

function formatGisFeatureNotice(feature) {
    if (feature.get("isRegionAggregate")) {
        const count = Number(feature.get("regionCount") ?? 0);
        const percent = Number(feature.get("regionPercent") ?? 0);
        const areaName = feature.get("aggregateAreaName") ?? feature.get("sourceAreaName") ?? "지역";
        return `${areaName} / 저장 피처 ${count.toLocaleString()}건 / 전국 대비 ${percent.toLocaleString()}%`;
    }

    const name = feature.get("featureName") ?? "GIS 피처";
    const address = feature.get("address") ?? feature.get("roadAddress") ?? "";
    const openTime = feature.get("openTime");
    const closeTime = feature.get("closeTime");
    const phoneNumber = feature.get("phoneNumber");
    const managerName = feature.get("managerName");
    const areaSize = feature.get("areaSize");
    const featureCategory = feature.get("featureCategory");
    const sourceAreaName = feature.get("sourceAreaName");
    const baseDate = feature.get("baseDate");
    const timeRange = openTime || closeTime ? `${openTime ?? "?"}-${closeTime ?? "?"}` : null;
    const areaSizeLabel = formatNumberValue(areaSize);
    const details = [
        featureCategory,
        sourceAreaName,
        areaSizeLabel ? `면적 ${areaSizeLabel}㎡` : null,
        timeRange,
        phoneNumber,
        managerName,
        baseDate ? `기준 ${baseDate}` : null,
    ].filter(Boolean).join(" · ");

    return [name, address, details].filter(Boolean).join(" / ");
}

function normalizeBoundaryCachePayload(payload) {
    if (typeof payload === "string") {
        try {
            return JSON.parse(payload);
        } catch {
            return {};
        }
    }

    return payload ?? {};
}

function emptyFeatureCollection() {
    return {
        type: "FeatureCollection",
        features: [],
    };
}

function DashboardMap({ selectedArea, onAreaSelect, gisLayer, onViewLevelChange, clearSelectionSignal = 0 }) {
    const onAreaSelectRef = useRef(onAreaSelect);
    const onViewLevelChangeRef = useRef(onViewLevelChange);
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const boundaryLayersRef = useRef({});
    const boundarySourcesRef = useRef({});
    const sidoContextLayerRef = useRef(null);
    const gisSourceRef = useRef(null);
    const gisClusterSourceRef = useRef(null);
    const gisLayerRef = useRef(null);
    const selectedFeatureRef = useRef(null);
    const boundaryAbortControllerRef = useRef(null);
    const gisAbortControllerRef = useRef(null);
    const gisAggregateModeRef = useRef(false);
    const boundaryCacheLoadedRef = useRef(false);
    const activeBoundaryLevelRef = useRef("SIDO");
    const setActiveBoundaryLevelRef = useRef(null);
    const lastGisRequestKeyRef = useRef("");
    const currentViewRef = useRef(createInitialView());
    const [viewState, setViewState] = useState(() => createInitialView());
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [mapNotice, setMapNotice] = useState(null);
    const [gisFeatureNotice, setGisFeatureNotice] = useState(null);
    const [gisLoadError, setGisLoadError] = useState(null);
    const [isGisLoading, setIsGisLoading] = useState(false);
    const [visibleGisFeatureCount, setVisibleGisFeatureCount] = useState(0);
    const [hoverArea, setHoverArea] = useState(null);
    const [boundaryCacheVersion, setBoundaryCacheVersion] = useState(0);

    const resetToNationalView = useCallback(() => {
        const initialView = createInitialView();
        const map = mapRef.current;
        selectedFeatureRef.current = null;
        setActiveBoundaryLevelRef.current?.("SIDO", { clearSelection: true });
        currentViewRef.current = initialView;
        setViewState(initialView);
        setMapNotice(null);
        setGisFeatureNotice(null);
        setHoverArea(null);
        const fitted = fitMapToExtent(map, boundarySourcesRef.current.SIDO?.getExtent(), {
            duration: 220,
        });
        if (!fitted) {
            map?.getView().animate({
                center: KOREA_CENTER,
                zoom: INITIAL_ZOOM,
                duration: 220,
            });
        }
        onAreaSelectRef.current?.(null);
    }, []);

    const changeZoom = useCallback((delta) => {
        const view = mapRef.current?.getView();
        if (!view) return;

        const currentZoom = view.getZoom() ?? INITIAL_ZOOM;
        const minZoom = view.getMinZoom() ?? MIN_ZOOM;
        const maxZoom = view.getMaxZoom() ?? MAX_ZOOM;
        const nextZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom + delta));

        view.animate({ zoom: nextZoom, duration: 180 });
    }, []);

    useEffect(() => {
        onAreaSelectRef.current = onAreaSelect;
    }, [onAreaSelect]);

    useEffect(() => {
        onViewLevelChangeRef.current = onViewLevelChange;
    }, [onViewLevelChange]);

    useEffect(() => {
        onViewLevelChangeRef.current?.(viewState.level);
    }, [viewState.level]);

    useEffect(() => {
        if (clearSelectionSignal === 0) {
            return undefined;
        }

        selectedFeatureRef.current = null;
        Object.values(boundaryLayersRef.current).forEach((layer) => layer.changed());
        sidoContextLayerRef.current?.changed();
        const timerId = window.setTimeout(() => {
            setHoverArea(null);
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [clearSelectionSignal]);

    useEffect(() => {
        if (!mapElementRef.current) return undefined;

        let isMounted = true;
        const boundarySources = {};
        const boundaryLayers = {};

        BOUNDARY_CACHE_LEVELS.forEach((level) => {
            const source = new VectorSource();
            const layer = new VectorLayer({
                source,
                visible: level === "SIDO",
                style: (feature) => getBoundaryStyle(feature, selectedFeatureRef.current),
            });
            layer.setZIndex(LEVEL_Z_INDEX[level] ?? 1);
            boundarySources[level] = source;
            boundaryLayers[level] = layer;
        });
        const sidoContextBoundaryLayer = new VectorLayer({
            source: boundarySources.SIDO,
            visible: false,
            style: (feature) => getSidoContextBoundaryStyle(feature, selectedFeatureRef.current),
        });
        sidoContextBoundaryLayer.setZIndex(8);

        const gisFeatureSource = new VectorSource();
        const gisClusterSource = new Cluster({
            distance: CLUSTER_DISTANCE,
            minDistance: 0,
            source: gisFeatureSource,
        });
        const gisFeatureLayer = new VectorLayer({
            source: gisClusterSource,
            style: getGisFeatureStyle,
        });
        gisFeatureLayer.setZIndex(10);

        const map = new Map({
            target: mapElementRef.current,
            controls: defaultControls({
                attribution: false,
                rotate: false,
                zoom: false,
            }),
            interactions: defaultInteractions(),
            layers: [...Object.values(boundaryLayers), sidoContextBoundaryLayer, gisFeatureLayer],
            view: new View({
                center: KOREA_CENTER,
                zoom: INITIAL_ZOOM,
                minZoom: MIN_ZOOM,
                maxZoom: MAX_ZOOM,
            }),
        });

        let resizeFrameId = null;
        function scheduleMapSizeUpdate() {
            if (resizeFrameId !== null) {
                window.cancelAnimationFrame(resizeFrameId);
            }
            resizeFrameId = window.requestAnimationFrame(() => {
                resizeFrameId = null;
                if (isMounted) {
                    map.updateSize();
                }
            });
        }

        const resizeObserver = typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(scheduleMapSizeUpdate)
            : null;
        resizeObserver?.observe(mapElementRef.current);
        window.addEventListener("resize", scheduleMapSizeUpdate);
        scheduleMapSizeUpdate();

        function changeBoundaryLayerStyles() {
            Object.values(boundaryLayers).forEach((layer) => layer.changed());
            sidoContextBoundaryLayer.changed();
        }

        function resolveAvailableLevel(requestedLevel) {
            if (!boundaryCacheLoadedRef.current) {
                return boundaryLayers[requestedLevel] ? requestedLevel : "SIDO";
            }

            if (boundarySources[requestedLevel]?.getFeatures().length > 0) {
                return requestedLevel;
            }

            const fallbackStartIndex = Math.max(BOUNDARY_FALLBACK_ORDER.indexOf(requestedLevel), 0);
            const fallbackLevels = BOUNDARY_FALLBACK_ORDER.slice(fallbackStartIndex + 1);
            return fallbackLevels.find((level) => boundarySources[level]?.getFeatures().length > 0) ?? "SIDO";
        }

        function setActiveBoundaryLevel(requestedLevel, options = {}) {
            const nextLevel = resolveAvailableLevel(requestedLevel);
            const changed = activeBoundaryLevelRef.current !== nextLevel;
            activeBoundaryLevelRef.current = nextLevel;

            Object.entries(boundaryLayers).forEach(([level, layer]) => {
                layer.setVisible(level === nextLevel);
            });
            sidoContextBoundaryLayer.setVisible(
                nextLevel !== "SIDO" && (boundarySources.SIDO?.getFeatures().length ?? 0) > 0
            );

            if (options.clearSelection || (changed && !options.preserveSelection)) {
                selectedFeatureRef.current = null;
                setHoverArea(null);
                onAreaSelectRef.current?.(null);
            }

            changeBoundaryLayerStyles();
            return nextLevel;
        }

        async function loadBoundaryCache() {
            boundaryAbortControllerRef.current?.abort();
            const abortController = new AbortController();
            boundaryAbortControllerRef.current = abortController;

            if (isMounted) {
                setIsLoading(true);
                setLoadError(null);
                setMapNotice(null);
            }

            try {
                const response = await axiosInstance.get("/api/dashboard/area-boundary-cache", {
                    params: {
                        levels: BOUNDARY_CACHE_LEVELS.join(","),
                    },
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) return;

                const cachePayload = normalizeBoundaryCachePayload(response.data);
                BOUNDARY_CACHE_LEVELS.forEach((level) => {
                    const collection = cachePayload[level] ?? emptyFeatureCollection();
                    const features = geoJsonFormat.readFeatures(collection);
                    boundarySources[level].clear(true);
                    boundarySources[level].addFeatures(features);
                });

                boundaryCacheLoadedRef.current = true;
                setBoundaryCacheVersion((version) => version + 1);
                const activeLevel = setActiveBoundaryLevel(currentViewRef.current.level);
                fitMapToExtent(map, boundarySources[activeLevel]?.getExtent());
                const nextView = createViewFromMap(map, activeLevel);
                currentViewRef.current = nextView;

                if (isMounted) {
                    setViewState(nextView);
                }
            } catch (error) {
                if (abortController.signal.aborted || error.name === "CanceledError") return;
                console.error(error);
                if (isMounted) {
                    setLoadError("지도 경계 캐시를 불러오지 못했습니다.");
                }
            } finally {
                if (boundaryAbortControllerRef.current === abortController && isMounted) {
                    setIsLoading(false);
                }
            }
        }

        let moveEndTimerId = null;
        const handleMoveEnd = () => {
            window.clearTimeout(moveEndTimerId);
            moveEndTimerId = window.setTimeout(() => {
                const requestedLevel = getLevelForZoom(map.getView().getZoom() ?? INITIAL_ZOOM);
                gisClusterSource.setDistance(
                    gisAggregateModeRef.current
                        ? 0
                        : getClusterDistanceForZoom(map.getView().getZoom() ?? INITIAL_ZOOM)
                );
                const activeLevel = setActiveBoundaryLevel(requestedLevel, { preserveSelection: true });
                const nextView = createViewFromMap(map, activeLevel);
                currentViewRef.current = nextView;
                setViewState(nextView);
            }, 80);
        };

        function selectRegionAggregateFeature(feature) {
            const areaCode = feature.get("aggregateAreaCode");
            const boundaryFeature = boundarySources.SIDO?.getFeatures()
                .find((item) => item.get("areaCode") === areaCode);
            if (!boundaryFeature) {
                return false;
            }

            const area = getFeatureArea(boundaryFeature);
            selectedFeatureRef.current = boundaryFeature;
            setMapNotice(null);
            setGisFeatureNotice(null);
            const activeLevel = setActiveBoundaryLevel("SIGUNGU", { preserveSelection: true });
            const nextView = {
                level: activeLevel,
                parentArea: area,
                bbox: area.bbox,
                stack: [],
                zoom: map.getView().getZoom() ?? INITIAL_ZOOM,
            };
            currentViewRef.current = nextView;
            setViewState(nextView);
            changeBoundaryLayerStyles();
            onAreaSelectRef.current?.(area);
            fitMapToExtent(map, boundaryFeature.getGeometry().getExtent(), {
                maxZoom: 8.8,
                duration: 220,
            });
            return true;
        }

        function handleFeatureClick(feature) {
            const clusteredFeatures = getGisClusterFeatures(feature);
            if (clusteredFeatures) {
                if (clusteredFeatures.length > 1) {
                    const extent = getFeaturesExtent(clusteredFeatures);
                    const currentZoom = map.getView().getZoom() ?? INITIAL_ZOOM;
                    const fitted = fitMapToExtent(map, extent, {
                        maxZoom: Math.min(MAX_ZOOM, currentZoom + 2),
                        duration: 180,
                    });
                    if (!fitted) {
                        map.getView().animate({
                            zoom: Math.min(MAX_ZOOM, currentZoom + 1),
                            center: feature.getGeometry()?.getCoordinates(),
                            duration: 180,
                        });
                    }
                    setMapNotice(`${clusteredFeatures.length.toLocaleString()}개 지점을 확대합니다.`);
                    setGisFeatureNotice(null);
                    return;
                }

                if (clusteredFeatures[0].get("isRegionAggregate") && selectRegionAggregateFeature(clusteredFeatures[0])) {
                    return;
                }

                setMapNotice(null);
                setGisFeatureNotice(formatGisFeatureNotice(clusteredFeatures[0]));
                return;
            }

            if (feature.get("datasetCode")) {
                if (feature.get("isRegionAggregate") && selectRegionAggregateFeature(feature)) {
                    return;
                }

                setMapNotice(null);
                setGisFeatureNotice(formatGisFeatureNotice(feature));
                return;
            }

            setMapNotice(null);
            setGisFeatureNotice(null);
            selectedFeatureRef.current = feature;
            const area = getFeatureArea(feature);
            changeBoundaryLayerStyles();
            onAreaSelectRef.current?.(area);
            fitMapToExtent(map, feature.getGeometry().getExtent(), {
                maxZoom: area.level === "SIDO" ? 8.8 : area.level === "SIGUNGU" ? 10.8 : 12.6,
                duration: 220,
            });
        }

        map.on("singleclick", (event) => {
            const clickedFeatures = map.getFeaturesAtPixel(event.pixel, {
                hitTolerance: 4,
                layerFilter: (layer) => (
                    layer === gisFeatureLayer
                    || (Object.values(boundaryLayers).includes(layer) && layer.getVisible())
                ),
            });
            const gisFeature = clickedFeatures.find((item) => getGisClusterFeatures(item) || item.get("datasetCode"));
            const feature = gisFeature ?? clickedFeatures.find((item) => !item.get("datasetCode"));

            if (!feature || typeof feature.get !== "function") {
                setMapNotice(null);
                setGisFeatureNotice(null);
                setHoverArea(null);
                selectedFeatureRef.current = null;
                changeBoundaryLayerStyles();
                onAreaSelectRef.current?.(null);
                return;
            }

            handleFeatureClick(feature);
        });

        map.on("pointermove", (event) => {
            if (event.dragging) {
                setHoverArea(null);
                return;
            }

            const feature = map.forEachFeatureAtPixel(
                event.pixel,
                (item) => item,
                {
                    layerFilter: (layer) => (
                        layer === gisFeatureLayer
                        || (Object.values(boundaryLayers).includes(layer) && layer.getVisible())
                    ),
                },
            );

            map.getTargetElement().style.cursor = feature instanceof Feature ? "pointer" : "";

            if (!(feature instanceof Feature) || getGisClusterFeatures(feature) || feature.get("datasetCode")) {
                setHoverArea(null);
                return;
            }

            const [mapWidth = 0, mapHeight = 0] = map.getSize() ?? [];
            const tooltipX = Math.min(
                Math.max(event.pixel[0] + 14, 14),
                Math.max(14, mapWidth - 300),
            );
            const tooltipY = Math.min(
                Math.max(event.pixel[1] + 14, 14),
                Math.max(14, mapHeight - 88),
            );

            setHoverArea({
                ...getFeatureHoverInfo(feature),
                x: tooltipX,
                y: tooltipY,
            });
        });
        map.on("moveend", handleMoveEnd);

        mapRef.current = map;
        boundaryLayersRef.current = boundaryLayers;
        boundarySourcesRef.current = boundarySources;
        sidoContextLayerRef.current = sidoContextBoundaryLayer;
        gisSourceRef.current = gisFeatureSource;
        gisClusterSourceRef.current = gisClusterSource;
        gisLayerRef.current = gisFeatureLayer;
        setActiveBoundaryLevelRef.current = setActiveBoundaryLevel;
        void loadBoundaryCache();

        return () => {
            isMounted = false;
            window.clearTimeout(moveEndTimerId);
            boundaryAbortControllerRef.current?.abort();
            gisAbortControllerRef.current?.abort();
            resizeObserver?.disconnect();
            window.removeEventListener("resize", scheduleMapSizeUpdate);
            if (resizeFrameId !== null) {
                window.cancelAnimationFrame(resizeFrameId);
            }
            map.setTarget(undefined);
            mapRef.current = null;
            boundaryLayersRef.current = {};
            boundarySourcesRef.current = {};
            sidoContextLayerRef.current = null;
            gisSourceRef.current = null;
            gisClusterSourceRef.current = null;
            gisLayerRef.current = null;
            selectedFeatureRef.current = null;
            gisAggregateModeRef.current = false;
            setHoverArea(null);
            boundaryAbortControllerRef.current = null;
            gisAbortControllerRef.current = null;
            boundaryCacheLoadedRef.current = false;
            activeBoundaryLevelRef.current = "SIDO";
            setActiveBoundaryLevelRef.current = null;
            lastGisRequestKeyRef.current = "";
        };
    }, []);

    const selectedAreaCode = selectedArea?.areaCode ?? null;
    const effectiveGisRequestBbox = selectedArea?.bbox ?? null;
    const gisRequestBbox = effectiveGisRequestBbox ?? viewState.bbox;
    const useRegionAggregateLayer = !selectedAreaCode && viewState.level === "SIDO";
    const gisRequestScopeLabel = selectedAreaCode
        ? "선택 지역"
        : useRegionAggregateLayer ? "시도 집계" : "현재 지도";

    useEffect(() => {
        const source = gisSourceRef.current;
        if (!source) {
            return undefined;
        }

        const requestBbox = gisRequestBbox;
        const selectedAreaGeometry = selectedFeatureRef.current?.getGeometry() ?? null;
        const boundarySources = boundarySourcesRef.current;
        let cancelled = false;
        let effectAbortController = null;
        const timerId = window.setTimeout(() => {
            if (!gisLayer?.datasetCode || !requestBbox) {
                gisAbortControllerRef.current?.abort();
                source.clear(true);
                setGisFeatureNotice(null);
                setGisLoadError(null);
                setVisibleGisFeatureCount(0);
                setIsGisLoading(false);
                setMapNotice(null);
                lastGisRequestKeyRef.current = "";
                return;
            }

            const requestMode = useRegionAggregateLayer ? "SIDO_AGGREGATE" : selectedAreaCode ?? "VIEW";
            const requestKey = [gisLayer.datasetCode, requestMode, requestBbox].join(":");
            if (requestKey === lastGisRequestKeyRef.current) {
                return;
            }
            lastGisRequestKeyRef.current = requestKey;

            gisAbortControllerRef.current?.abort();
            source.clear(true);
            setGisFeatureNotice(null);
            setGisLoadError(null);
            setMapNotice(null);
            setVisibleGisFeatureCount(0);

            const abortController = new AbortController();
            effectAbortController = abortController;
            gisAbortControllerRef.current = abortController;
            setIsGisLoading(true);

            if (useRegionAggregateLayer) {
                gisAggregateModeRef.current = true;
                gisClusterSourceRef.current?.setDistance(0);

                axiosInstance.get("/api/dashboard/gis-region-stats", {
                    params: {
                        datasetCode: gisLayer.datasetCode,
                    },
                    signal: abortController.signal,
                }).then((response) => {
                    if (cancelled || abortController.signal.aborted) {
                        return;
                    }

                    const regionStats = Array.isArray(response.data?.items) ? response.data.items : [];
                    const sidoFeatures = boundarySources.SIDO?.getFeatures() ?? [];
                    const aggregateFeatures = regionStats
                        .filter((item) => Number(item.count ?? 0) > 0)
                        .map((item) => {
                            const boundaryFeature = findRegionBoundaryFeature(sidoFeatures, item);
                            return boundaryFeature
                                ? createRegionAggregateFeature(item, boundaryFeature, gisLayer.datasetCode)
                                : null;
                        })
                        .filter(Boolean);
                    const totalCount = Number(response.data?.totalCount ?? 0);
                    const aggregateTotal = aggregateFeatures.reduce(
                        (sum, feature) => sum + Number(feature.get("regionCount") ?? 0),
                        0
                    );

                    source.clear(true);
                    source.addFeatures(aggregateFeatures);
                    setVisibleGisFeatureCount(totalCount || aggregateTotal);
                }).catch((error) => {
                    if (cancelled || abortController.signal.aborted || error.name === "CanceledError") {
                        return;
                    }
                    console.error(error);
                    lastGisRequestKeyRef.current = "";
                    source.clear(true);
                    setVisibleGisFeatureCount(0);
                    setGisLoadError("시도별 지도 레이어 집계를 불러오지 못했습니다.");
                }).finally(() => {
                    if (!cancelled && gisAbortControllerRef.current === abortController) {
                        setIsGisLoading(false);
                    }
                });
                return;
            }

            gisAggregateModeRef.current = false;
            gisClusterSourceRef.current?.setDistance(
                getClusterDistanceForZoom(mapRef.current?.getView().getZoom() ?? INITIAL_ZOOM)
            );

            axiosInstance.get("/api/dashboard/gis-features", {
                params: {
                    datasetCode: gisLayer.datasetCode,
                    bbox: requestBbox,
                    limit: 500,
                },
                signal: abortController.signal,
            }).then((response) => {
                if (cancelled || abortController.signal.aborted) {
                    return;
                }

                const features = geoJsonFormat.readFeatures(response.data)
                    .filter((feature) => {
                        if (!selectedAreaGeometry) {
                            return true;
                        }
                        const geometry = feature.getGeometry();
                        if (geometry?.getType?.() !== "Point") {
                            return true;
                        }
                        return selectedAreaGeometry.intersectsCoordinate(geometry.getCoordinates());
                    });
                source.clear(true);
                source.addFeatures(features);
                setVisibleGisFeatureCount(features.length);
            }).catch((error) => {
                if (cancelled || abortController.signal.aborted || error.name === "CanceledError") {
                    return;
                }
                console.error(error);
                lastGisRequestKeyRef.current = "";
                source.clear(true);
                setVisibleGisFeatureCount(0);
                setGisLoadError("지도 레이어 데이터를 불러오지 못했습니다.");
            }).finally(() => {
                if (!cancelled && gisAbortControllerRef.current === abortController) {
                    setIsGisLoading(false);
                }
            });
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
            if (effectAbortController && gisAbortControllerRef.current === effectAbortController) {
                effectAbortController.abort();
            }
        };
    }, [gisLayer?.datasetCode, selectedAreaCode, gisRequestBbox, useRegionAggregateLayer, boundaryCacheVersion]);

    const isSidoView = viewState.level === "SIDO" && viewState.stack.length === 0;
    const storedGisFeatureCount = Number(gisLayer?.featureCount ?? 0);
    const gisLayerTheme = getGisLayerTheme(gisLayer?.datasetCode);
    const gisLayerCountLabel = isGisLoading
        ? `${gisRequestScopeLabel} 조회 중`
        : selectedAreaCode
            ? [
                `선택 지역 표시 ${visibleGisFeatureCount.toLocaleString()}건`,
                storedGisFeatureCount > 0 ? `저장 전체 ${storedGisFeatureCount.toLocaleString()}건` : null,
                visibleGisFeatureCount >= 500 ? "최대 500건 샘플" : null,
            ].filter(Boolean).join(" / ")
            : useRegionAggregateLayer
                ? [
                    `시도별 집계 ${visibleGisFeatureCount.toLocaleString()}건`,
                    storedGisFeatureCount > 0 ? `저장 전체 ${storedGisFeatureCount.toLocaleString()}건` : null,
                ].filter(Boolean).join(" / ")
            : [
                `현재 지도 표시 ${visibleGisFeatureCount.toLocaleString()}건`,
                storedGisFeatureCount > 0 ? `저장 전체 ${storedGisFeatureCount.toLocaleString()}건` : null,
                visibleGisFeatureCount >= 500 ? "최대 500건 샘플" : null,
            ].filter(Boolean).join(" / ");

    return (
        <div className="dashboard-map-card">
            <div className="dashboard-map-wrap">
                <div ref={mapElementRef} className="dashboard-map" />

                {hoverArea && (
                    <div
                        className="dashboard-map-hover-tooltip"
                        style={{
                            left: hoverArea.x,
                            top: hoverArea.y,
                        }}
                    >
                        <strong>{hoverArea.name}</strong>
                        <span>{hoverArea.levelLabel} / {hoverArea.areaCode}</span>
                    </div>
                )}

                <div className="dashboard-map-top-overlay">
                    <nav className="dashboard-map-breadcrumb" aria-label="지도 단계 이동">
                        <button
                            type="button"
                            className="dashboard-breadcrumb-button"
                            onClick={resetToNationalView}
                            disabled={isSidoView || isLoading}
                        >
                            전국
                        </button>
                        <span className="dashboard-breadcrumb-item">
                            <span className="dashboard-breadcrumb-separator">/</span>
                            <span className="dashboard-breadcrumb-current">
                                {getLevelLabel(viewState.level)} 표시
                            </span>
                        </span>
                    </nav>

                    <div className="dashboard-map-actions">
                        <button
                            type="button"
                            className="dashboard-map-control"
                            onClick={() => changeZoom(1)}
                            title="확대"
                            aria-label="확대"
                        >
                            <i className="bi bi-plus-lg" />
                        </button>
                        <button
                            type="button"
                            className="dashboard-map-control"
                            onClick={() => changeZoom(-1)}
                            title="축소"
                            aria-label="축소"
                        >
                            <i className="bi bi-dash-lg" />
                        </button>
                        <button
                            type="button"
                            className="dashboard-map-control"
                            onClick={resetToNationalView}
                            title="전국 보기"
                            aria-label="전국 보기"
                        >
                            <i className="bi bi-globe-asia-australia" />
                        </button>
                    </div>
                </div>

                {(loadError || mapNotice || gisFeatureNotice || gisLoadError) && (
                    <div className="dashboard-map-notice">
                        {loadError && <span className="danger">{loadError}</span>}
                        {mapNotice && !loadError && <span>{mapNotice}</span>}
                        {gisFeatureNotice && !loadError && (
                            <span>
                                <i className={`bi ${gisLayerTheme.icon} me-1`} />
                                {gisFeatureNotice}
                            </span>
                        )}
                        {gisLoadError && !loadError && <span>{gisLoadError}</span>}
                    </div>
                )}

                {gisLayer?.datasetName && (
                    <div className="dashboard-map-layer-badge">
                        <span
                            className="dashboard-map-layer-dot"
                            style={{
                                backgroundColor: gisLayerTheme.color,
                                boxShadow: `0 0 0 2px ${gisLayerTheme.glow}`,
                            }}
                        />
                        <div>
                            <strong>{gisLayer.datasetName}</strong>
                            <span>{gisLayerCountLabel}</span>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="dashboard-map-loading">
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        <span>지도 경계 캐시 불러오는 중...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardMap;
