import { useState } from "react";
import TopTitle from "../../components/TopTitle";
import "../../style/simulationTest2.css";

const BASE_REGION_OPTIONS = ["All Seoul", "Gangnam-gu", "Yeongdeungpo-gu", "Seocho-gu", "Mapo-gu", "Songpa-gu"];

// Geometry-specific screen profiles for temporary simulation previews.
const SIMULATION_PROFILES = {
  point: {
    label: "Point",
    title: "Point Dataset Simulation",
    subtitle: "Preview a point-based simulation with density, radius, and cluster style outputs.",
    datasetInfo: [
      { label: "Dataset count", value: "2,847 rows" },
      { label: "Spatial type", value: "point" },
      { label: "Coverage", value: "All Seoul" },
      { label: "Last update", value: "2026.05" },
    ],
    detailInfo: [
      { label: "Provider", value: "Seoul Open Data" },
      { label: "Refresh cycle", value: "Monthly" },
      { label: "Format", value: "CSV / GeoJSON" },
      { label: "CRS", value: "EPSG:4326" },
    ],
    regionOptions: BASE_REGION_OPTIONS,
    densityOptions: ["Low density", "Medium density", "High density"],
    defaultRegion: "Gangnam-gu",
    defaultDensity: "Medium density",
    defaultViewMode: "radius",
    viewModes: [
      { id: "radius", label: "Radius" },
      { id: "heat", label: "Heat" },
      { id: "cluster", label: "Cluster" },
    ],
    toggleLabels: {
      heatmap: "Heat overlay",
      cluster: "Cluster badge",
    },
    summaryCards: [
      { label: "Active zones", value: "36", helper: "Current viewport" },
      { label: "Hotspot zones", value: "4", helper: "Needs review" },
      { label: "Average radius", value: "620m", helper: "Live option result" },
    ],
    hotspotBars: [
      { name: "Gangnam-gu", value: 92, tone: "high" },
      { name: "Yeongdeungpo-gu", value: 78, tone: "mid" },
      { name: "Seocho-gu", value: 74, tone: "mid" },
      { name: "Mapo-gu", value: 58, tone: "normal" },
    ],
    table: {
      columns: [
        { key: "rank", label: "Rank" },
        { key: "district", label: "District" },
        { key: "count", label: "Point count" },
        { key: "density", label: "Density" },
        { key: "level", label: "Level", chip: true },
        { key: "note", label: "Note" },
      ],
      rows: [
        { rank: "1", district: "Gangnam-gu", count: "1,856", density: "92.1", level: "High", note: "Core hotspot around major roads" },
        { rank: "2", district: "Yeongdeungpo-gu", count: "1,523", density: "78.4", level: "High", note: "Strong cluster near station area" },
        { rank: "3", district: "Seocho-gu", count: "1,312", density: "74.2", level: "Medium", note: "Stable but broad spread" },
        { rank: "4", district: "Mapo-gu", count: "987", density: "58.6", level: "Medium", note: "Urban mixed coverage" },
        { rank: "5", district: "Songpa-gu", count: "842", density: "55.3", level: "Low", note: "Lower concentration than average" },
      ],
    },
    map: {
      zones: [
        { id: "a", left: "29%", top: "52%", size: 300, tone: "normal" },
        { id: "b", left: "61%", top: "34%", size: 226, tone: "normal" },
        { id: "c", left: "73%", top: "69%", size: 262, tone: "high" },
        { id: "d", left: "43%", top: "78%", size: 182, tone: "normal" },
      ],
      points: [
        { id: "p1", left: "27%", top: "48%", tone: "normal" },
        { id: "p2", left: "32%", top: "57%", tone: "normal" },
        { id: "p3", left: "59%", top: "32%", tone: "normal" },
        { id: "p4", left: "57%", top: "27%", tone: "normal" },
        { id: "p5", left: "70%", top: "64%", tone: "high" },
        { id: "p6", left: "73%", top: "72%", tone: "high" },
        { id: "p7", left: "42%", top: "76%", tone: "normal" },
        { id: "p8", left: "44%", top: "81%", tone: "normal" },
      ],
      clusters: [
        { id: "c1", left: "31%", top: "49%", value: "12" },
        { id: "c2", left: "60%", top: "31%", value: "9" },
        { id: "c3", left: "73%", top: "67%", value: "15" },
        { id: "c4", left: "44%", top: "77%", value: "6" },
      ],
      legend: [
        { type: "dot-normal", label: "Normal point" },
        { type: "dot-high", label: "High density point" },
        { type: "zone", label: "Radius zone" },
      ],
    },
  },
  linestring: {
    label: "LineString",
    title: "LineString Dataset Simulation",
    subtitle: "Preview corridor-based flow and segment priority for line geometry datasets.",
    datasetInfo: [
      { label: "Dataset count", value: "184 routes" },
      { label: "Spatial type", value: "linestring" },
      { label: "Coverage", value: "Major roads" },
      { label: "Last update", value: "2026.05" },
    ],
    detailInfo: [
      { label: "Provider", value: "Road Traffic Lab" },
      { label: "Refresh cycle", value: "Weekly" },
      { label: "Format", value: "GeoJSON / SHP" },
      { label: "CRS", value: "EPSG:5186" },
    ],
    regionOptions: BASE_REGION_OPTIONS,
    densityOptions: ["Light traffic", "Normal traffic", "Heavy traffic"],
    defaultRegion: "Mapo-gu",
    defaultDensity: "Normal traffic",
    defaultViewMode: "corridor",
    viewModes: [
      { id: "corridor", label: "Corridor" },
      { id: "flow", label: "Flow" },
      { id: "segment", label: "Segment" },
    ],
    toggleLabels: {
      heatmap: "Traffic glow",
      cluster: "Node labels",
    },
    summaryCards: [
      { label: "Route sections", value: "18", helper: "Selected region" },
      { label: "Critical links", value: "5", helper: "Priority watch" },
      { label: "Mean length", value: "1.8km", helper: "Loaded segments" },
    ],
    hotspotBars: [
      { name: "Gangnam axis", value: 88, tone: "high" },
      { name: "Mapo loop", value: 76, tone: "mid" },
      { name: "Seocho bridge", value: 63, tone: "mid" },
      { name: "Songpa link", value: 47, tone: "normal" },
    ],
    table: {
      columns: [
        { key: "rank", label: "Rank" },
        { key: "route", label: "Route" },
        { key: "length", label: "Length" },
        { key: "load", label: "Flow score" },
        { key: "priority", label: "Priority", chip: true },
        { key: "note", label: "Note" },
      ],
      rows: [
        { rank: "1", route: "Gangnam axis", length: "3.4 km", load: "88.4", priority: "High", note: "Peak congestion corridor" },
        { rank: "2", route: "Mapo loop", length: "2.9 km", load: "76.1", priority: "High", note: "Strong commuter overlap" },
        { rank: "3", route: "Seocho bridge", length: "2.1 km", load: "63.2", priority: "Medium", note: "Steady but broad impact" },
        { rank: "4", route: "Songpa link", length: "1.7 km", load: "47.8", priority: "Low", note: "Lower stress corridor" },
      ],
    },
    map: {
      routes: [
        { id: "r1", left: "18%", top: "60%", width: "34%", rotate: "-18deg", tone: "normal" },
        { id: "r2", left: "38%", top: "42%", width: "42%", rotate: "16deg", tone: "mid" },
        { id: "r3", left: "57%", top: "70%", width: "28%", rotate: "-24deg", tone: "high" },
        { id: "r4", left: "63%", top: "34%", width: "26%", rotate: "8deg", tone: "normal" },
      ],
      nodes: [
        { id: "n1", left: "28%", top: "55%", tone: "normal", label: "N4" },
        { id: "n2", left: "45%", top: "47%", tone: "mid", label: "N9" },
        { id: "n3", left: "67%", top: "63%", tone: "high", label: "N2" },
        { id: "n4", left: "73%", top: "37%", tone: "normal", label: "N7" },
      ],
      legend: [
        { type: "route-normal", label: "Normal route" },
        { type: "route-high", label: "Heavy route" },
        { type: "node", label: "Node label" },
      ],
    },
  },
  polygon: {
    label: "Polygon",
    title: "Polygon Dataset Simulation",
    subtitle: "Preview area-based zoning, fill intensity, and risk segmentation for polygon datasets.",
    datasetInfo: [
      { label: "Dataset count", value: "94 zones" },
      { label: "Spatial type", value: "polygon" },
      { label: "Coverage", value: "District blocks" },
      { label: "Last update", value: "2026.05" },
    ],
    detailInfo: [
      { label: "Provider", value: "Urban Safety Office" },
      { label: "Refresh cycle", value: "Quarterly" },
      { label: "Format", value: "GeoJSON / GPKG" },
      { label: "CRS", value: "EPSG:5181" },
    ],
    regionOptions: BASE_REGION_OPTIONS,
    densityOptions: ["Light fill", "Balanced fill", "Strong fill"],
    defaultRegion: "Seocho-gu",
    defaultDensity: "Balanced fill",
    defaultViewMode: "zone",
    viewModes: [
      { id: "zone", label: "Zone" },
      { id: "fill", label: "Fill" },
      { id: "compare", label: "Compare" },
    ],
    toggleLabels: {
      heatmap: "Risk fill",
      cluster: "Zone labels",
    },
    summaryCards: [
      { label: "Visible areas", value: "24", helper: "Current bounds" },
      { label: "Critical polygons", value: "6", helper: "High score areas" },
      { label: "Mean coverage", value: "71%", helper: "Selected region score" },
    ],
    hotspotBars: [
      { name: "Seocho block", value: 91, tone: "high" },
      { name: "Gangnam block", value: 82, tone: "mid" },
      { name: "Mapo block", value: 69, tone: "mid" },
      { name: "Songpa block", value: 52, tone: "normal" },
    ],
    table: {
      columns: [
        { key: "rank", label: "Rank" },
        { key: "zone", label: "Zone" },
        { key: "area", label: "Area" },
        { key: "coverage", label: "Coverage" },
        { key: "grade", label: "Grade", chip: true },
        { key: "note", label: "Note" },
      ],
      rows: [
        { rank: "1", zone: "Seocho-A", area: "2.8 km2", coverage: "91%", grade: "High", note: "Strong concentration area" },
        { rank: "2", zone: "Gangnam-B", area: "2.1 km2", coverage: "82%", grade: "High", note: "High overlap with service zones" },
        { rank: "3", zone: "Mapo-C", area: "1.7 km2", coverage: "69%", grade: "Medium", note: "Stable polygon spread" },
        { rank: "4", zone: "Songpa-D", area: "1.3 km2", coverage: "52%", grade: "Low", note: "Lower concentration block" },
      ],
    },
    map: {
      polygons: [
        { id: "g1", left: "26%", top: "38%", width: "22%", height: "20%", tone: "normal", clipPath: "polygon(8% 18%, 82% 0%, 100% 40%, 74% 100%, 0% 82%)", label: "A1" },
        { id: "g2", left: "55%", top: "28%", width: "20%", height: "18%", tone: "mid", clipPath: "polygon(10% 0%, 100% 14%, 86% 84%, 18% 100%, 0% 36%)", label: "B3" },
        { id: "g3", left: "66%", top: "58%", width: "24%", height: "22%", tone: "high", clipPath: "polygon(0% 26%, 64% 0%, 100% 34%, 84% 100%, 18% 88%)", label: "C2" },
        { id: "g4", left: "34%", top: "72%", width: "18%", height: "16%", tone: "normal", clipPath: "polygon(16% 0%, 100% 24%, 86% 100%, 0% 78%, 4% 22%)", label: "D4" },
      ],
      legend: [
        { type: "fill-normal", label: "Normal zone" },
        { type: "fill-mid", label: "Medium zone" },
        { type: "fill-high", label: "High zone" },
      ],
    },
  },
};

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="simulation-test2-toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`simulation-test2-switch ${checked ? "active" : ""}`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <span></span>
      </button>
    </div>
  );
}

function SummaryCard({ item }) {
  return (
    <div className="simulation-test2-summary-card">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.helper}</small>
    </div>
  );
}

function getChipTone(value) {
  if (value === "High") {
    return "high";
  }
  if (value === "Medium") {
    return "mid";
  }
  return "low";
}

function ResultChip({ level }) {
  return <span className={`simulation-test2-chip ${getChipTone(level)}`}>{level}</span>;
}

function LegendItem({ item }) {
  return (
    <div className="simulation-test2-legend-row">
      {item.type === "dot-normal" && <span className="dot normal"></span>}
      {item.type === "dot-high" && <span className="dot high"></span>}
      {item.type === "zone" && <span className="circle"></span>}
      {item.type === "route-normal" && <span className="route normal"></span>}
      {item.type === "route-high" && <span className="route high"></span>}
      {item.type === "node" && <span className="node"></span>}
      {item.type === "fill-normal" && <span className="fill normal"></span>}
      {item.type === "fill-mid" && <span className="fill mid"></span>}
      {item.type === "fill-high" && <span className="fill high"></span>}
      <span>{item.label}</span>
    </div>
  );
}

function GeometryMapStage({ geometryType, profile, viewMode, showHeatmap, showCluster }) {
  return (
    <div className={`simulation-test2-map-stage mode-${viewMode} geometry-${geometryType}`}>
      <div className="simulation-test2-map-grid"></div>

      {geometryType === "point" && (
        <>
          {profile.map.zones.map((zone) => (
            <div
              key={zone.id}
              className={`simulation-test2-zone ${zone.tone} ${showHeatmap ? "show-zone" : "soft-zone"}`}
              style={{
                left: zone.left,
                top: zone.top,
                width: `${zone.size}px`,
                height: `${zone.size}px`,
              }}
            ></div>
          ))}

          {profile.map.points.map((point) => (
            <div
              key={point.id}
              className={`simulation-test2-point ${point.tone}`}
              style={{ left: point.left, top: point.top }}
            ></div>
          ))}

          {showCluster &&
            profile.map.clusters.map((badge) => (
              <div
                key={badge.id}
                className="simulation-test2-cluster-badge"
                style={{ left: badge.left, top: badge.top }}
              >
                {badge.value}
              </div>
            ))}
        </>
      )}

      {geometryType === "linestring" && (
        <>
          {profile.map.routes.map((route) => (
            <div
              key={route.id}
              className={`simulation-test2-route ${route.tone} ${showHeatmap ? "emphasis" : ""}`}
              style={{
                left: route.left,
                top: route.top,
                width: route.width,
                transform: `translate(-50%, -50%) rotate(${route.rotate})`,
              }}
            ></div>
          ))}

          {showCluster &&
            profile.map.nodes.map((node) => (
              <div
                key={node.id}
                className={`simulation-test2-node ${node.tone}`}
                style={{ left: node.left, top: node.top }}
              >
                {node.label}
              </div>
            ))}
        </>
      )}

      {geometryType === "polygon" && (
        <>
          {profile.map.polygons.map((polygon) => (
            <div
              key={polygon.id}
              className={`simulation-test2-polygon ${polygon.tone} ${showHeatmap ? "filled" : ""}`}
              style={{
                left: polygon.left,
                top: polygon.top,
                width: polygon.width,
                height: polygon.height,
                clipPath: polygon.clipPath,
              }}
            >
              {showCluster && <span className="simulation-test2-polygon-label">{polygon.label}</span>}
            </div>
          ))}
        </>
      )}

      <div className="simulation-test2-map-controls">
        <button type="button"><i className="bi bi-plus-lg"></i></button>
        <button type="button"><i className="bi bi-dash-lg"></i></button>
        <button type="button"><i className="bi bi-crosshair"></i></button>
      </div>

      <div className="simulation-test2-legend">
        <div className="simulation-test2-legend-title">Legend</div>
        {profile.map.legend.map((item) => (
          <LegendItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function UserDatasetSimulationTestPage2() {
  const [geometryType, setGeometryType] = useState("point");
  const currentProfile = SIMULATION_PROFILES[geometryType];

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(currentProfile.defaultRegion);
  const [radius, setRadius] = useState(500);
  const [densityLevel, setDensityLevel] = useState(currentProfile.defaultDensity);
  const [viewMode, setViewMode] = useState(currentProfile.defaultViewMode);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCluster, setShowCluster] = useState(false);
  const [statusText, setStatusText] = useState("Adjust options and run the temporary simulation preview.");

  // Keep the temporary preview consistent when the user switches geometry type.
  const handleGeometryChange = (nextType) => {
    const nextProfile = SIMULATION_PROFILES[nextType];
    setGeometryType(nextType);
    setSelectedRegion(nextProfile.defaultRegion);
    setRadius(500);
    setDensityLevel(nextProfile.defaultDensity);
    setViewMode(nextProfile.defaultViewMode);
    setShowHeatmap(true);
    setShowCluster(false);
    setStatusText(`${nextProfile.label} preview is ready. Run to refresh the mock analysis.`);
  };

  const handleReset = () => {
    setSelectedRegion(currentProfile.defaultRegion);
    setRadius(500);
    setDensityLevel(currentProfile.defaultDensity);
    setViewMode(currentProfile.defaultViewMode);
    setShowHeatmap(true);
    setShowCluster(false);
    setStatusText("Adjust options and run the temporary simulation preview.");
  };

  const handleRun = () => {
    setStatusText(`${currentProfile.label} / ${selectedRegion} / ${radius}m preview has been refreshed.`);
  };

  return (
    <div className="container-fluid px-4 py-3 simulation-test2-page">
      <div className="row mb-3">
        <div className="col">
          <TopTitle
            title={currentProfile.title}
            subTitle={currentProfile.subtitle}
            showGuide={false}
          />
        </div>
      </div>

      <div className={`simulation-test2-workspace ${isPanelOpen ? "panel-open" : "panel-collapsed"}`}>
        <aside className="simulation-test2-sidebar">
          <div className="simulation-test2-side-card">
            <div className="simulation-test2-section">
              <div className="simulation-test2-section-title">
                <i className="bi bi-layers"></i>
                <span>Dataset Info</span>
              </div>

              <div className="simulation-test2-info-list">
                {currentProfile.datasetInfo.map((item) => (
                  <div key={item.label} className="simulation-test2-info-row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="simulation-test2-divider"></div>

            <div className="simulation-test2-section">
              <div className="simulation-test2-section-title">
                <i className="bi bi-funnel"></i>
                <span>Simulation Controls</span>
              </div>

              <div className="simulation-test2-field-block">
                <label className="simulation-test2-label">Region</label>
                <select
                  className="form-select simulation-test2-select"
                  value={selectedRegion}
                  onChange={(event) => setSelectedRegion(event.target.value)}
                >
                  {currentProfile.regionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="simulation-test2-field-block">
                <div className="simulation-test2-range-head">
                  <span className="simulation-test2-label mb-0">Radius (meter)</span>
                  <strong>{radius}m</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                />
                <div className="simulation-test2-range-labels">
                  <span>100m</span>
                  <span>500m</span>
                  <span>5000m</span>
                </div>
              </div>

              <div className="simulation-test2-field-block">
                <label className="simulation-test2-label">Density level</label>
                <select
                  className="form-select simulation-test2-select"
                  value={densityLevel}
                  onChange={(event) => setDensityLevel(event.target.value)}
                >
                  {currentProfile.densityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="simulation-test2-field-block">
                <div className="simulation-test2-label">View mode</div>
                <div className="simulation-test2-mode-group">
                  {currentProfile.viewModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={`simulation-test2-mode-button ${viewMode === mode.id ? "active" : ""}`}
                      onClick={() => setViewMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="simulation-test2-field-block">
                <div className="simulation-test2-label">Display options</div>
                <div className="simulation-test2-toggle-list">
                  <ToggleRow
                    label={currentProfile.toggleLabels.heatmap}
                    checked={showHeatmap}
                    onChange={() => setShowHeatmap((previous) => !previous)}
                  />
                  <ToggleRow
                    label={currentProfile.toggleLabels.cluster}
                    checked={showCluster}
                    onChange={() => setShowCluster((previous) => !previous)}
                  />
                </div>
              </div>
            </div>

            <div className="simulation-test2-status-box">
              <i className="bi bi-info-circle-fill"></i>
              <span>{statusText}</span>
            </div>

            <div className="row g-2 simulation-test2-action-row">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-primary w-100 simulation-test2-action-button"
                  onClick={handleRun}
                >
                  <i className="bi bi-play-fill me-2"></i>
                  Run
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-light border w-100 simulation-test2-action-button secondary"
                  onClick={handleReset}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="simulation-test2-map-column">
          <section className="simulation-test2-map-card">
            <button
              type="button"
              className={`simulation-test2-panel-toggle ${isPanelOpen ? "is-open" : "is-collapsed"}`}
              onClick={() => setIsPanelOpen((previous) => !previous)}
              aria-label={isPanelOpen ? "Close control panel" : "Open control panel"}
            >
              <i className={`bi ${isPanelOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
            </button>

            <div className="simulation-test2-map-toolbar">
              <div>
                <div className="simulation-test2-map-title">{currentProfile.label} Simulation View</div>
                <div className="simulation-test2-map-subtitle">
                  Temporary visual preview for {currentProfile.label.toLowerCase()} datasets.
                </div>
              </div>
              <div className="simulation-test2-map-chips">
                <span>{currentProfile.label}</span>
                <span>{selectedRegion}</span>
                <span>{radius}m</span>
                <span>{densityLevel}</span>
              </div>
            </div>

            <GeometryMapStage
              geometryType={geometryType}
              profile={currentProfile}
              viewMode={viewMode}
              showHeatmap={showHeatmap}
              showCluster={showCluster}
            />
          </section>

          <div className="simulation-test2-bottom-grid">
            <section className="simulation-test2-bottom-card">
              <div className="simulation-test2-bottom-title">
                <i className="bi bi-info-circle"></i>
                <span>Dataset Summary</span>
              </div>
              <div className="simulation-test2-detail-list">
                {currentProfile.detailInfo.map((item) => (
                  <div key={item.label} className="simulation-test2-detail-row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="simulation-test2-bottom-card">
              <div className="simulation-test2-bottom-title">
                <i className="bi bi-bar-chart-line"></i>
                <span>Hotspot Distribution</span>
              </div>
              <div className="simulation-test2-chart-list">
                {currentProfile.hotspotBars.map((item) => (
                  <div key={item.name} className="simulation-test2-chart-row">
                    <div className="simulation-test2-chart-head">
                      <span>{item.name}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="simulation-test2-chart-track">
                      <div
                        className={`simulation-test2-chart-bar ${item.tone}`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="simulation-test2-bottom-card">
              <div className="simulation-test2-bottom-title">
                <i className="bi bi-graph-up"></i>
                <span>Result Summary</span>
              </div>
              <div className="simulation-test2-summary-grid">
                {currentProfile.summaryCards.map((item) => (
                  <SummaryCard key={item.label} item={item} />
                ))}
              </div>
            </section>
          </div>

          <section className="simulation-test2-table-card">
            <div className="simulation-test2-table-header">
              <div className="simulation-test2-bottom-title mb-0">
                <i className="bi bi-table"></i>
                <span>Simulation Result Table</span>
              </div>
              <button type="button" className="btn btn-light border simulation-test2-export-button">
                <i className="bi bi-download me-2"></i>
                Export CSV
              </button>
            </div>

            <div className="simulation-test2-table-wrap">
              <table className="table simulation-test2-table mb-0">
                <thead>
                  <tr>
                    {currentProfile.table.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentProfile.table.rows.map((row) => (
                    <tr key={`${geometryType}-${row.rank}`}>
                      {currentProfile.table.columns.map((column) => (
                        <td key={column.key}>
                          {column.chip ? <ResultChip level={row[column.key]} /> : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="simulation-test2-geometry-switch-card">
            <div className="simulation-test2-bottom-title mb-0">
              <i className="bi bi-bezier2"></i>
              <span>Temporary Geometry Switch</span>
            </div>
            <div className="simulation-test2-geometry-switch-grid">
              {Object.entries(SIMULATION_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  type="button"
                  className={`simulation-test2-geometry-switch-button ${geometryType === key ? "active" : ""}`}
                  onClick={() => handleGeometryChange(key)}
                >
                  {profile.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default UserDatasetSimulationTestPage2;
