import { useCallback, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { defaults as defaultControls } from "ol/control/defaults.js";
import { getCenter } from "ol/extent.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Point from "ol/geom/Point.js";
import { defaults as defaultInteractions } from "ol/interaction/defaults.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat, transformExtent } from "ol/proj.js";
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
    const labelFont = level === "EUPMYEONDONG"
        ? "700 10px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        : "800 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    return [
        new Style({
            fill: new Fill({
                color: isSelected ? "rgba(249, 115, 22, 0.24)" : "rgba(37, 99, 235, 0.1)",
            }),
            stroke: new Stroke({
                color: isSelected ? "#f97316" : "#2563eb",
                width: isSelected ? 3.2 : 1.55,
            }),
        }),
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
    ];
}

function getGisFeatureStyle(feature) {
    const output = Number(feature.get("output") ?? 0);
    const radius = output >= 100 ? 8 : output >= 50 ? 7 : 6;

    return new Style({
        image: new CircleStyle({
            radius,
            fill: new Fill({
                color: "rgba(249, 115, 22, 0.88)",
            }),
            stroke: new Stroke({
                color: "#ffffff",
                width: 2,
            }),
        }),
    });
}

function formatGisFeatureNotice(feature) {
    const name = feature.get("featureName") ?? "GIS 피처";
    const address = feature.get("address") ?? feature.get("roadAddress") ?? "";
    const output = feature.get("output");
    const useTime = feature.get("useTime");
    const businessCall = feature.get("businessCall");
    const details = [
        output ? `${output}kW` : null,
        useTime,
        businessCall,
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

function DashboardMap({ onAreaSelect, gisLayer, onViewLevelChange, clearSelectionSignal = 0 }) {
    const onAreaSelectRef = useRef(onAreaSelect);
    const onViewLevelChangeRef = useRef(onViewLevelChange);
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const boundaryLayersRef = useRef({});
    const boundarySourcesRef = useRef({});
    const gisSourceRef = useRef(null);
    const selectedFeatureRef = useRef(null);
    const boundaryAbortControllerRef = useRef(null);
    const gisAbortControllerRef = useRef(null);
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
            return;
        }

        selectedFeatureRef.current = null;
        setHoverArea(null);
        Object.values(boundaryLayersRef.current).forEach((layer) => layer.changed());
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

        const gisFeatureSource = new VectorSource();
        const gisFeatureLayer = new VectorLayer({
            source: gisFeatureSource,
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
            layers: [...Object.values(boundaryLayers), gisFeatureLayer],
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

            if (options.clearSelection || changed) {
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
                const activeLevel = setActiveBoundaryLevel(requestedLevel);
                const nextView = createViewFromMap(map, activeLevel);
                currentViewRef.current = nextView;
                setViewState(nextView);
            }, 80);
        };

        function handleFeatureClick(feature) {
            if (feature.get("datasetCode")) {
                setGisFeatureNotice(formatGisFeatureNotice(feature));
                return;
            }

            setMapNotice(null);
            setGisFeatureNotice(null);
            selectedFeatureRef.current = feature;
            const area = getFeatureArea(feature);
            changeBoundaryLayerStyles();
            onAreaSelectRef.current?.(area);
        }

        map.on("singleclick", (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (item) => item);

            if (!(feature instanceof Feature)) {
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
                    layerFilter: (layer) => Object.values(boundaryLayers).includes(layer) && layer.getVisible(),
                },
            );

            map.getTargetElement().style.cursor = feature instanceof Feature ? "pointer" : "";

            if (!(feature instanceof Feature)) {
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
        gisSourceRef.current = gisFeatureSource;
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
            gisSourceRef.current = null;
            selectedFeatureRef.current = null;
            setHoverArea(null);
            boundaryAbortControllerRef.current = null;
            gisAbortControllerRef.current = null;
            boundaryCacheLoadedRef.current = false;
            activeBoundaryLevelRef.current = "SIDO";
            setActiveBoundaryLevelRef.current = null;
            lastGisRequestKeyRef.current = "";
        };
    }, []);

    useEffect(() => {
        const source = gisSourceRef.current;
        if (!source) {
            return undefined;
        }

        let cancelled = false;
        const timerId = window.setTimeout(() => {
            gisAbortControllerRef.current?.abort();
            source.clear(true);
            setGisFeatureNotice(null);
            setGisLoadError(null);
            setVisibleGisFeatureCount(0);

            if (!gisLayer?.datasetCode) {
                setIsGisLoading(false);
                lastGisRequestKeyRef.current = "";
                return;
            }

            const filterAreaCode = viewState.parentArea?.areaCode ?? null;
            const requestKey = [gisLayer.datasetCode, viewState.bbox, filterAreaCode ?? "ROOT"].join(":");
            if (requestKey === lastGisRequestKeyRef.current) {
                return;
            }
            lastGisRequestKeyRef.current = requestKey;

            const abortController = new AbortController();
            gisAbortControllerRef.current = abortController;
            setIsGisLoading(true);

            axiosInstance.get("/api/dashboard/gis-features", {
                params: {
                    datasetCode: gisLayer.datasetCode,
                    bbox: viewState.bbox,
                    areaCode: filterAreaCode,
                    limit: 500,
                },
                signal: abortController.signal,
            }).then((response) => {
                if (cancelled || abortController.signal.aborted) {
                    return;
                }

                const features = geoJsonFormat.readFeatures(response.data);
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
                setGisLoadError("선택한 지도 레이어 데이터를 불러오지 못했습니다.");
            }).finally(() => {
                if (!cancelled && gisAbortControllerRef.current === abortController) {
                    setIsGisLoading(false);
                }
            });
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
            gisAbortControllerRef.current?.abort();
        };
    }, [gisLayer?.datasetCode, viewState.bbox, viewState.parentArea?.areaCode]);

    const isSidoView = viewState.level === "SIDO" && viewState.stack.length === 0;
    const storedGisFeatureCount = Number(gisLayer?.featureCount ?? 0);
    const gisLayerCountLabel = isGisLoading
        ? "현재 지도 범위 조회 중"
        : `현재 범위 ${visibleGisFeatureCount.toLocaleString()}건 표시`
            + (storedGisFeatureCount > visibleGisFeatureCount
                ? ` · 저장 ${storedGisFeatureCount.toLocaleString()}건`
                : "");

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
                                <i className="bi bi-ev-station me-1" />
                                {gisFeatureNotice}
                            </span>
                        )}
                        {gisLoadError && !loadError && <span>{gisLoadError}</span>}
                    </div>
                )}

                {gisLayer?.datasetName && (
                    <div className="dashboard-map-layer-badge">
                        <span className="dashboard-map-layer-dot" />
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
