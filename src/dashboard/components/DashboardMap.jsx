import { useCallback, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { getCenter } from "ol/extent.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat, transformExtent } from "ol/proj.js";
import VectorSource from "ol/source/Vector.js";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import axiosInstance from "../../commons/api/axiosinstance.js";

const KOREA_CENTER = fromLonLat([127.8, 36.2]);
const KOREA_BBOX = "124.50,32.80,132.20,39.60";
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

function getViewTitle(viewState) {
    if (!viewState.parentArea) {
        return "전국 도/특별시/광역시 단위";
    }

    return `${viewState.parentArea.fullName ?? viewState.parentArea.name} 하위 ${getLevelLabel(viewState.level, viewState.parentArea)} 단위`;
}

function getFeatureArea(feature) {
    const level = feature.get("level");
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
        childLevel: feature.get("childLevel") ?? NEXT_LEVEL_BY_LEVEL[level],
        canDrillDown: feature.get("canDrillDown") ?? Boolean(NEXT_LEVEL_BY_LEVEL[level]),
        bbox: getFeatureBbox(feature),
    };

    return {
        ...area,
        levelLabel: getLevelLabel(area.level, area),
    };
}

function getBoundaryStyle(feature, selectedFeature) {
    const isSelected = feature === selectedFeature;
    const level = feature.get("level");
    const name = feature.get("name") ?? "";
    const labelFont = level === "EUPMYEONDONG"
        ? "600 10px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        : "600 11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    return [
        new Style({
            fill: new Fill({
                color: isSelected ? "rgba(245, 158, 11, 0.18)" : "rgba(14, 165, 233, 0.045)",
            }),
            stroke: new Stroke({
                color: isSelected ? "#f59e0b" : "#1d4ed8",
                width: isSelected ? 3 : 1.7,
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
                    color: "rgba(255, 255, 255, 0.92)",
                    width: 3,
                }),
                offsetY: -2,
            }),
        }),
    ];
}

function DashboardMap({ onAreaSelect }) {
    const onAreaSelectRef = useRef(onAreaSelect);
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const boundaryLayerRef = useRef(null);
    const boundarySourceRef = useRef(null);
    const selectedFeatureRef = useRef(null);
    const abortControllerRef = useRef(null);
    const lastRequestKeyRef = useRef("");
    const currentViewRef = useRef(createInitialView());
    const loadBoundariesRef = useRef(null);
    const [viewState, setViewState] = useState(() => createInitialView());
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [drillDownNotice, setDrillDownNotice] = useState(null);

    const resetToSidoView = useCallback(() => {
        const initialView = createInitialView();
        selectedFeatureRef.current = null;
        boundaryLayerRef.current?.changed();
        onAreaSelectRef.current?.(null);
        void loadBoundariesRef.current?.(initialView, { force: true });
    }, []);

    const navigateToStackIndex = useCallback((targetIndex) => {
        if (targetIndex < 0) {
            resetToSidoView();
            return;
        }

        const nextStack = currentViewRef.current.stack.slice(0, targetIndex + 1);
        const parentArea = nextStack[targetIndex];
        const nextLevel = parentArea.childLevel ?? NEXT_LEVEL_BY_LEVEL[parentArea.level];

        if (!nextLevel) {
            onAreaSelectRef.current?.(parentArea);
            return;
        }

        selectedFeatureRef.current = null;
        boundaryLayerRef.current?.changed();
        onAreaSelectRef.current?.(parentArea);

        void loadBoundariesRef.current?.({
            level: nextLevel,
            parentArea,
            bbox: parentArea.bbox ?? currentViewRef.current.bbox,
            stack: nextStack,
        }, { force: true });
    }, [resetToSidoView]);

    const goToParentView = useCallback(() => {
        const stack = currentViewRef.current.stack;
        if (stack.length <= 1) {
            resetToSidoView();
            return;
        }

        navigateToStackIndex(stack.length - 2);
    }, [navigateToStackIndex, resetToSidoView]);

    useEffect(() => {
        onAreaSelectRef.current = onAreaSelect;
    }, [onAreaSelect]);

    useEffect(() => {
        if (!mapElementRef.current) return undefined;

        let isMounted = true;
        const boundarySource = new VectorSource();
        const boundaryLayer = new VectorLayer({
            source: boundarySource,
            style: (feature) => getBoundaryStyle(feature, selectedFeatureRef.current),
        });

        const map = new Map({
            target: mapElementRef.current,
            layers: [boundaryLayer],
            view: new View({
                center: KOREA_CENTER,
                zoom: 6.25,
                minZoom: 5.2,
                maxZoom: 13,
            }),
        });

        async function loadBoundaries(nextView, options = {}) {
            const normalizedView = {
                ...nextView,
                stack: nextView.stack ?? [],
            };
            const requestKey = [
                normalizedView.level,
                normalizedView.parentArea?.areaCode ?? "ROOT",
                normalizedView.bbox,
            ].join(":");

            if (!options.force && requestKey === lastRequestKeyRef.current) return;
            lastRequestKeyRef.current = requestKey;

            abortControllerRef.current?.abort();
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            if (isMounted) {
                setIsLoading(true);
                setLoadError(null);
                setDrillDownNotice(null);
            }

            try {
                const params = {
                    level: normalizedView.level,
                    bbox: normalizedView.bbox,
                };

                if (normalizedView.parentArea?.areaCode) {
                    params.parentAreaCode = normalizedView.parentArea.areaCode;
                }
                if (normalizedView.parentArea?.sidoCode) {
                    params.sidoCode = normalizedView.parentArea.sidoCode;
                }

                const response = await axiosInstance.get("/api/dashboard/area-boundaries", {
                    params,
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) return;

                const features = geoJsonFormat.readFeatures(response.data);

                if (features.length === 0 && options.preserveOnEmpty) {
                    lastRequestKeyRef.current = "";
                    boundaryLayer.changed();
                    if (isMounted) {
                        setDrillDownNotice(options.emptyMessage ?? "하위 지도 경계 데이터가 없어 현재 지도를 유지합니다.");
                    }
                    return;
                }

                boundarySource.clear();
                boundarySource.addFeatures(features);
                selectedFeatureRef.current = null;
                boundaryLayer.changed();
                currentViewRef.current = normalizedView;

                if (isMounted) {
                    setViewState(normalizedView);
                }

                if (features.length > 0) {
                    map.getView().fit(boundarySource.getExtent(), {
                        padding: [28, 28, 28, 28],
                        maxZoom: normalizedView.level === "JIPGYEGU"
                            ? 13
                            : normalizedView.level === "EUPMYEONDONG"
                              ? 12
                              : 9,
                        duration: 250,
                    });
                    return;
                }
            } catch (error) {
                if (abortController.signal.aborted) return;
                lastRequestKeyRef.current = "";
                console.error(error);
                if (isMounted) {
                    setLoadError("지도 경계 데이터를 불러오지 못했습니다.");
                }
            } finally {
                if (abortControllerRef.current === abortController && isMounted) {
                    setIsLoading(false);
                }
            }
        }

        function handleFeatureClick(feature) {
            setDrillDownNotice(null);
            selectedFeatureRef.current = feature;
            const area = getFeatureArea(feature);
            boundaryLayer.changed();
            onAreaSelectRef.current?.(area);

            const nextLevel = area.childLevel ?? NEXT_LEVEL_BY_LEVEL[area.level];
            if (!area.canDrillDown || !nextLevel) {
                return;
            }

            const nextView = {
                level: nextLevel,
                parentArea: area,
                bbox: area.bbox,
                stack: [...currentViewRef.current.stack, area],
            };
            void loadBoundaries(nextView, {
                force: true,
                preserveOnEmpty: true,
                emptyMessage: `${area.name} 하위 ${getLevelLabel(nextLevel, area)} 경계 데이터가 없어 현재 지도를 유지합니다.`,
            });
        }

        map.on("singleclick", (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (item) => item);

            if (!(feature instanceof Feature)) {
                setDrillDownNotice(null);
                selectedFeatureRef.current = null;
                boundaryLayer.changed();
                return;
            }

            handleFeatureClick(feature);
        });

        map.on("pointermove", (event) => {
            map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel) ? "pointer" : "";
        });

        mapRef.current = map;
        boundaryLayerRef.current = boundaryLayer;
        boundarySourceRef.current = boundarySource;
        loadBoundariesRef.current = loadBoundaries;
        void loadBoundaries(createInitialView(), { force: true });

        return () => {
            isMounted = false;
            abortControllerRef.current?.abort();
            map.setTarget(undefined);
            mapRef.current = null;
            boundaryLayerRef.current = null;
            boundarySourceRef.current = null;
            selectedFeatureRef.current = null;
            abortControllerRef.current = null;
            loadBoundariesRef.current = null;
            lastRequestKeyRef.current = "";
        };
    }, []);

    const canGoParent = viewState.stack.length > 0;
    const isSidoView = viewState.level === "SIDO" && viewState.stack.length === 0;

    return (
        <div className="card shadow-sm dashboard-map-card">
            <div className="card-body">
                <div className="dashboard-map-header">
                    <div>
                        <h5 className="fw-semibold mb-1">지도</h5>
                        <p className="text-secondary small mb-0">
                            {getViewTitle(viewState)}를 보고 있습니다. 지역을 클릭하면 하위 단계로 이동합니다.
                        </p>
                    </div>
                    <div className="dashboard-map-actions">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={goToParentView}
                            disabled={!canGoParent || isLoading}
                        >
                            <i className="bi bi-arrow-up-short me-1" />
                            상위 지역
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={resetToSidoView}
                            disabled={isSidoView || isLoading}
                        >
                            <i className="bi bi-globe-asia-australia me-1" />
                            도 단위 보기
                        </button>
                    </div>
                </div>

                <nav className="dashboard-map-breadcrumb" aria-label="지도 단계 이동">
                    <button
                        type="button"
                        className="dashboard-breadcrumb-button"
                        onClick={resetToSidoView}
                        disabled={isSidoView || isLoading}
                    >
                        전국
                    </button>
                    {viewState.stack.map((area, index) => (
                        <span className="dashboard-breadcrumb-item" key={`${area.areaCode}-${index}`}>
                            <span className="dashboard-breadcrumb-separator">/</span>
                            <button
                                type="button"
                                className="dashboard-breadcrumb-button"
                                onClick={() => navigateToStackIndex(index)}
                                disabled={index === viewState.stack.length - 1 || isLoading}
                            >
                                {area.name}
                            </button>
                        </span>
                    ))}
                </nav>

                {loadError && (
                    <div className="alert alert-danger py-2 small my-2">{loadError}</div>
                )}
                {drillDownNotice && !loadError && (
                    <div className="alert alert-info py-2 small my-2">{drillDownNotice}</div>
                )}

                <div className="dashboard-map-wrap">
                    <div ref={mapElementRef} className="dashboard-map" />
                    {isLoading && (
                        <div className="dashboard-map-loading">
                            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            <span>지도 경계 불러오는 중...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardMap;
