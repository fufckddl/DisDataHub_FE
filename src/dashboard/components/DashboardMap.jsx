import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat } from "ol/proj.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import XYZ from "ol/source/XYZ.js";
import { Fill, Stroke, Style } from "ol/style.js";
import axiosInstance from "../../commons/api/axiosinstance.js";

const SEOUL_CENTER = fromLonLat([126.978, 37.5665]);
const SEOUL_BBOX = "126.76400,37.41300,127.18400,37.71500";
const VWORLD_KEY = import.meta.env.VITE_VWORLD_KEY;
const BOUNDARY_LOAD_DELAY_MS = 300;
const EUPMYEONDONG_MIN_ZOOM = 12;

const geoJsonFormat = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
});

function createBaseLayer() {
    if (!VWORLD_KEY) {
        return new TileLayer({
            source: new OSM(),
        });
    }

    return new TileLayer({
        source: new XYZ({
            url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`,
            crossOrigin: "anonymous",
            attributions: "VWorld",
        }),
    });
}

function createBoundaryStyle(feature, selectedFeature) {
    const isSelected = feature === selectedFeature;

    return new Style({
        fill: new Fill({
            color: isSelected ? "rgba(245, 158, 11, 0.38)" : "rgba(37, 99, 235, 0.18)",
        }),
        stroke: new Stroke({
            color: isSelected ? "#f59e0b" : "#2563eb",
            width: isSelected ? 3 : 1.5,
        }),
    });
}

function getBoundaryLevel(zoom) {
    return zoom >= EUPMYEONDONG_MIN_ZOOM ? "EUPMYEONDONG" : "SIGUNGU";
}

function createBboxParam() {
    return SEOUL_BBOX;
}

function DashboardMap({ onAreaSelect }) {
    const onAreaSelectRef = useRef(onAreaSelect);
    onAreaSelectRef.current = onAreaSelect;
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const boundarySourceRef = useRef(null);
    const selectedFeatureRef = useRef(null);
    const abortControllerRef = useRef(null);
    const loadTimerRef = useRef(null);
    const lastRequestKeyRef = useRef("");
    const [selectedArea, setSelectedArea] = useState(null);
    const [mapStatus, setMapStatus] = useState("행정경계 데이터를 불러오는 중입니다.");

    useEffect(() => {
        if (!mapElementRef.current) return undefined;

        const boundarySource = new VectorSource();
        const boundaryLayer = new VectorLayer({
            source: boundarySource,
            style: (feature) => createBoundaryStyle(feature, selectedFeatureRef.current),
        });

        // 초기 화면 서울 중심
        const map = new Map({
            target: mapElementRef.current,
            layers: [createBaseLayer(), boundaryLayer],
            view: new View({
                center: SEOUL_CENTER,
                zoom: 11,
                minZoom: 6,
                maxZoom: 18,
            }),
        });

        // 행정구 Polygon 클릭
        map.on("singleclick", (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (item) => item);

            if (!(feature instanceof Feature)) {
                selectedFeatureRef.current = null;
                setSelectedArea(null);
                boundaryLayer.changed();
                onAreaSelectRef.current?.(null);
                return;
            }

            selectedFeatureRef.current = feature;
            const area = {
                areaCode: feature.get("areaCode"),
                sigunguCode: feature.get("sigunguCode"),
                eupmyeondongCode: feature.get("eupmyeondongCode"),
                name: feature.get("name"),
                fullName: feature.get("fullName"),
                level: feature.get("level"),
            };
            setSelectedArea(area);
            boundaryLayer.changed();
            onAreaSelectRef.current?.(area);
        });

        map.on("pointermove", (event) => {
            map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel) ? "pointer" : "";
        });

        mapRef.current = map;
        boundarySourceRef.current = boundarySource;

        async function loadBoundaries() {
            const bbox = createBboxParam();
            if (!bbox) return;

            const zoom = map.getView().getZoom() ?? 0;
            const level = getBoundaryLevel(zoom);
            const requestKey = `${level}:${bbox}`;
            if (requestKey === lastRequestKeyRef.current) return;
            lastRequestKeyRef.current = requestKey;

            abortControllerRef.current?.abort();
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            setMapStatus("현재 화면 행정경계 불러오는 중...");

            try {
                const response = await axiosInstance.get("/api/dashboard/area-boundaries", {
                    params: {
                        level,
                        bbox,
                    },
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) return;

                const features = geoJsonFormat.readFeatures(response.data);
                boundarySource.clear();
                boundarySource.addFeatures(features);
                selectedFeatureRef.current = null;
                setSelectedArea(null);
                boundaryLayer.changed();
                onAreaSelectRef.current?.(null);

                const levelLabel = level === "EUPMYEONDONG" ? "읍면동" : "시군구";
                setMapStatus(`서울 ${levelLabel} 행정경계 ${features.length.toLocaleString()}건 표시 중`);
            } catch (error) {
                if (abortController.signal.aborted) return;
                lastRequestKeyRef.current = "";
                setMapStatus("행정경계 API 호출 실패: 화면 범위를 줄이거나 서버 상태를 확인하세요.");
                console.error(error);
            }
        }

        function scheduleBoundaryLoad() {
            if (loadTimerRef.current) {
                clearTimeout(loadTimerRef.current);
            }

            loadTimerRef.current = window.setTimeout(() => {
                loadBoundaries();
            }, BOUNDARY_LOAD_DELAY_MS);
        }

        map.on("moveend", scheduleBoundaryLoad);
        loadBoundaries();

        return () => {
            map.un("moveend", scheduleBoundaryLoad);
            abortControllerRef.current?.abort();
            if (loadTimerRef.current) {
                clearTimeout(loadTimerRef.current);
            }
            map.setTarget(undefined);
            mapRef.current = null;
            boundarySourceRef.current = null;
            selectedFeatureRef.current = null;
            abortControllerRef.current = null;
            loadTimerRef.current = null;
            lastRequestKeyRef.current = "";
        };
    }, []);

    return (
        <div className="card shadow-sm dashboard-map-card">
            <div className="card-body">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3">
                    <div>
                        <h5 className="fw-semibold mb-1">서울 행정경계 지도</h5>
                        <div className="text-secondary small">
                            임시로 서울 범위의 PostgreSQL/PostGIS Polygon만 표시합니다.
                        </div>
                    </div>
                    <span className="badge text-bg-light border">{mapStatus}</span>
                </div>

                {!VWORLD_KEY && (
                    <div className="alert alert-warning py-2 small mb-3">
                        <strong>VITE_VWORLD_KEY</strong>가 없어서 현재는 OSM 배경지도로 대체 표시합니다.
                        VWorld 키를 설정하면 VWorld WMTS 배경지도로 전환됩니다.
                    </div>
                )}

                <div className="dashboard-map-wrap">
                    <div ref={mapElementRef} className="dashboard-map" />
                    <div className="dashboard-map-info">
                        <div className="small text-secondary mb-1">선택 지역</div>
                        {selectedArea ? (
                            <>
                                <div className="fw-bold">{selectedArea.fullName ?? selectedArea.name}</div>
                                <div className="small text-secondary">
                                    지역코드 {selectedArea.areaCode} / 시군구코드 {selectedArea.sigunguCode}
                                </div>
                            </>
                        ) : (
                            <div className="small text-secondary">지도에서 행정구역 경계를 클릭하세요.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardMap;
