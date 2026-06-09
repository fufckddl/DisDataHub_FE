import { useState } from "react";
import "../../style/simulationTest2.css";

const RESULT_TABS = [
  { id: "summary", label: "요약" },
  { id: "list", label: "목록" },
  { id: "chart", label: "분포" },
];

const TARGET_FEATURES = [
  { id: 1, name: "수원시 CCTV 214", distance: "128m", score: 92 },
  { id: 2, name: "버스정류장 38", distance: "246m", score: 74 },
  { id: 3, name: "어린이보호구역 12", distance: "391m", score: 58 },
  { id: 4, name: "공공와이파이 07", distance: "472m", score: 46 },
];

function UserDatasetSimulationTestPage2() {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [radius, setRadius] = useState(500);

  return (
    <div className="simulation-test2-page">
      <div className={`simulation-test2-map-shell ${isPanelCollapsed ? "panel-collapsed" : ""} ${isResultOpen ? "result-open" : ""}`}>
        <aside className="simulation-test2-sidebar" aria-label="시뮬레이션 실행 설정">
          <div className="simulation-test2-sidebar-head">
            <div>
              <span className="simulation-test2-kicker">GIS Simulation</span>
              <h2>공간 시뮬레이션</h2>
              <p>지도에서 기준점을 선택하고 반경 안의 데이터를 확인합니다.</p>
            </div>
            <button
              type="button"
              className="simulation-test2-icon-button"
              onClick={() => setIsPanelCollapsed(true)}
              aria-label="실행 패널 접기"
            >
              <i className="bi bi-chevron-left" />
            </button>
          </div>

          <div className="simulation-test2-dataset-card">
            <span>선택 데이터셋</span>
            <strong>서울시 CCTV 위치 데이터</strong>
            <small>Point · CSV · 승인 데이터</small>
          </div>

          <div className="simulation-test2-form-section">
            <label className="simulation-test2-label" htmlFor="simulation-keyword">
              기준 위치 검색
            </label>
            <div className="simulation-test2-search-box">
              <i className="bi bi-search" />
              <input id="simulation-keyword" type="text" placeholder="주소, 장소, 좌표 검색" />
            </div>
          </div>

          <div className="simulation-test2-form-section">
            <span className="simulation-test2-label">중심점 선택 방식</span>
            <div className="simulation-test2-segmented">
              <button type="button" className="active">지도 클릭</button>
              <button type="button">검색 위치</button>
              <button type="button">현재 중심</button>
            </div>
          </div>

          <div className="simulation-test2-form-section">
            <div className="simulation-test2-range-head">
              <label className="simulation-test2-label" htmlFor="simulation-radius">
                분석 반경
              </label>
              <strong>{radius.toLocaleString("ko-KR")}m</strong>
            </div>
            <input
              id="simulation-radius"
              type="range"
              min="100"
              max="1500"
              step="100"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
            <div className="simulation-test2-range-labels">
              <span>100m</span>
              <span>1.5km</span>
            </div>
          </div>

          <div className="simulation-test2-form-section">
            <span className="simulation-test2-label">표시 옵션</span>
            <div className="simulation-test2-check-list">
              <label>
                <input type="checkbox" defaultChecked />
                반경 영역 표시
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                포함 데이터 강조
              </label>
              <label>
                <input type="checkbox" />
                밀집 구간 보기
              </label>
            </div>
          </div>

          <div className="simulation-test2-mini-summary">
            <div>
              <span>예상 포함 데이터</span>
              <strong>42건</strong>
            </div>
            <div>
              <span>평균 거리</span>
              <strong>286m</strong>
            </div>
          </div>

          <div className="simulation-test2-action-row">
            <button type="button" className="simulation-test2-button secondary">
              초기화
            </button>
            <button type="button" className="simulation-test2-button primary" onClick={() => setIsResultOpen(true)}>
              시뮬레이션 실행
            </button>
          </div>
        </aside>

        {isPanelCollapsed && (
          <button
            type="button"
            className="simulation-test2-panel-open"
            onClick={() => setIsPanelCollapsed(false)}
            aria-label="실행 패널 열기"
          >
            <i className="bi bi-sliders" />
            실행 설정
          </button>
        )}

        <main className="simulation-test2-map-area" aria-label="시뮬레이션 지도">
          <div className="simulation-test2-map-toolbar">
            <button type="button" className="active">
              전체 데이터
            </button>
            <button type="button">포함 데이터</button>
            <button type="button">제외 데이터</button>
            <button type="button">밀집 보기</button>
          </div>

          <div className="simulation-test2-layer-switcher" aria-label="지도 유형">
            <button type="button" className="active">일반지도</button>
            <button type="button">위성지도</button>
            <button type="button">공간격자</button>
          </div>

          <div className="simulation-test2-right-tools" aria-label="지도 도구">
            <button type="button"><i className="bi bi-crosshair" /><span>반경</span></button>
            <button type="button"><i className="bi bi-bounding-box" /><span>면적</span></button>
            <button type="button"><i className="bi bi-rulers" /><span>거리</span></button>
            <button type="button" onClick={() => setIsResultOpen(true)}><i className="bi bi-bar-chart" /><span>결과</span></button>
          </div>

          <div className="simulation-test2-zoom-tools" aria-label="지도 확대 축소">
            <button type="button">+</button>
            <button type="button">-</button>
          </div>

          <div className="simulation-test2-map-grid" aria-hidden="true">
            <span className="road road-a" />
            <span className="road road-b" />
            <span className="road road-c" />
            <span className="road road-d" />
            <span className="road road-e" />
            <span className="park park-main">매탄공원</span>
            <span className="block block-a">공공청사</span>
            <span className="block block-b">주거단지</span>
            <span className="block block-c">학교</span>
            <span className="map-label label-a">매영로</span>
            <span className="map-label label-b">산남로</span>
            <span className="map-label label-c">매탄4동</span>
            <span className="map-label label-d">영통구</span>
          </div>

          <div className="simulation-test2-radius-zone" style={{ "--radius-size": `${Math.max(230, radius / 2.2)}px` }}>
            <span className="simulation-test2-radius-circle" />
            <span className="simulation-test2-center-pin">
              <i className="bi bi-geo-alt-fill" />
            </span>
            <span className="simulation-test2-radius-label">{radius.toLocaleString("ko-KR")}m</span>
          </div>

          <span className="simulation-test2-marker marker-1 included">CCTV</span>
          <span className="simulation-test2-marker marker-2 included">정류장</span>
          <span className="simulation-test2-marker marker-3 included">WiFi</span>
          <span className="simulation-test2-marker marker-4 excluded">CCTV</span>
          <span className="simulation-test2-marker marker-5 excluded">시설</span>

          <div className="simulation-test2-floating-summary">
            <div>
              <span>분석 반경</span>
              <strong>{radius.toLocaleString("ko-KR")}m</strong>
            </div>
            <div>
              <span>포함 데이터</span>
              <strong>42건</strong>
            </div>
            <div>
              <span>밀집도</span>
              <strong>보통</strong>
            </div>
          </div>
        </main>

        <section className="simulation-test2-result-drawer" aria-label="시뮬레이션 결과">
          <div className="simulation-test2-result-head">
            <div>
              <span className="simulation-test2-kicker">Analysis Result</span>
              <h3>분석 결과</h3>
            </div>
            <button type="button" className="simulation-test2-icon-button" onClick={() => setIsResultOpen(false)} aria-label="결과 패널 닫기">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="simulation-test2-tab-row">
            {RESULT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "summary" && (
            <div className="simulation-test2-result-content">
              <div className="simulation-test2-stat-grid">
                <div>
                  <span>포함 데이터</span>
                  <strong>42건</strong>
                </div>
                <div>
                  <span>제외 데이터</span>
                  <strong>18건</strong>
                </div>
                <div>
                  <span>평균 거리</span>
                  <strong>286m</strong>
                </div>
                <div>
                  <span>최단 거리</span>
                  <strong>48m</strong>
                </div>
              </div>
              <div className="simulation-test2-insight-card">
                <strong>분석 메모</strong>
                <p>선택한 중심점 기준 {radius.toLocaleString("ko-KR")}m 반경 안에 데이터가 집중되어 있습니다. 지도에서 포함 객체를 선택하면 속성 정보를 확인하는 흐름으로 확장할 수 있습니다.</p>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="simulation-test2-result-content">
              <div className="simulation-test2-result-list">
                {TARGET_FEATURES.map((feature) => (
                  <button type="button" key={feature.id}>
                    <span>
                      <strong>{feature.name}</strong>
                      <small>{feature.distance}</small>
                    </span>
                    <em>{feature.score}</em>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chart" && (
            <div className="simulation-test2-result-content">
              <div className="simulation-test2-bar-chart">
                <div style={{ "--bar-width": "92%" }}><span>100m 이내</span><strong>12</strong></div>
                <div style={{ "--bar-width": "74%" }}><span>300m 이내</span><strong>18</strong></div>
                <div style={{ "--bar-width": "52%" }}><span>500m 이내</span><strong>9</strong></div>
                <div style={{ "--bar-width": "28%" }}><span>500m 초과</span><strong>3</strong></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserDatasetSimulationTestPage2;
