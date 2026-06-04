

import "../css/SystemIntroPage.css";

const mainFeatures = [
  {
    no: "01",
    title: "대시보드",
    desc: "지역별 현황과 주요 지표를 지도와 차트로 시각화합니다.",
    detail: "지역별 통계 · 행정구역 비교 · 데이터 요약",
  },
  {
    no: "02",
    title: "데이터 조회",
    desc: "공공데이터와 GIS 데이터를 조건별로 검색하고 상세 조회합니다.",
    detail: "키워드 검색 · 카테고리 필터 · 상세 조회 / 다운로드",
  },
  {
    no: "03",
    title: "업로드",
    desc: "기간과 조건에 따른 데이터 변화를 분석하고 결과를 시각화합니다.",
    detail: "기간별 변화 · 지역별 비교 · 차트 / 지도 시각화",
  },
  {
    no: "04",
    title: "게시판",
    desc: "공지사항, 문의, GIS 데이터 오류 제보를 통해 시스템 운영을 지원합니다.",
    detail: "공지사항 · 문의 게시판 · 위치 기반 오류 제보",
  },
];

const gisKeywords = [
  "지도 마커 표시",
  "행정구역 검색",
  "현재 지도 영역 검색",
  "반경 검색",
  "오류 위치 제보",
];

const dataRows = [
  ["GIS 데이터", "행정구역, 위치 좌표, 공간 객체, 지형·지물 데이터"],
  ["교통 데이터", "도로, 대중교통, 교통량, 주차장 등 교통 관련 데이터"],
  ["인구 데이터", "인구 통계, 연령별 인구, 가구, 유동인구 데이터"],
  ["환경 데이터", "기상, 대기질, 수질, 녹지 등 환경 관련 데이터"],
];

const effects = [
  "데이터 접근성 향상",
  "공간 분석 강화",
  "운영 효율성 향상",
  "데이터 품질 개선",
];

function SystemIntroHeader() {
  return (
    <header className="system-intro-header">
      <div className="system-intro-header-inner">
        <div className="system-intro-logo-wrap">
          <div className="system-intro-logo">◎</div>
          <span className="system-intro-brand">GIS Research Data Hub</span>
        </div>

        <nav className="system-intro-nav">
          <a href="#purpose">서비스 목적</a>
          <a href="#feature">주요 기능</a>
          <a href="#gis">GIS 기능</a>
          <a href="#data">활용 데이터</a>
        </nav>

        <div className="system-intro-auth">
          <button type="button" className="system-intro-login-btn">
            로그인
          </button>
          <button type="button" className="system-intro-signup-btn">
            회원가입
          </button>
        </div>
      </div>
    </header>
  );
}

function SectionHead({ label, title, desc }) {
  return (
    <div className="system-section-head">
      <p className="system-section-label">{label}</p>
      <div>
        <h2 className="system-section-title">{title}</h2>
        {desc && <p className="system-section-desc">{desc}</p>}
      </div>
    </div>
  );
}

function MapVisual() {
  return (
    <div className="map-visual">
      <div className="map-grid-bg" />
      <div className="map-blur map-blur-blue" />
      <div className="map-blur map-blur-cyan" />

      <div className="map-board">
        <div className="map-board-inner">
          <div className="building building-1" />
          <div className="building building-2" />
          <div className="building building-3" />
          <div className="building building-4" />
          <div className="road road-1" />
          <div className="road road-2" />
          <div className="map-marker">⌖</div>
        </div>
      </div>

      <div className="map-data-card">
        <p>REAL-TIME DATA</p>
        <strong>12,540</strong>
        <div className="bar-chart">
          <span className="bar bar-1" />
          <span className="bar bar-2" />
          <span className="bar bar-3" />
          <span className="bar bar-4" />
        </div>
      </div>

      <div className="map-layer-card">
        <p>MAP LAYER</p>
        <div className="layer-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function SystemIntroPage() {
  return (
    <main className="system-intro-page">
      <SystemIntroHeader />

      <section id="hero" className="system-hero-section">
        <div className="system-hero-bg" />

        <div className="system-hero-inner">
          <div className="system-hero-text">
            <p className="system-hero-label">GIS DATA PLATFORM</p>

            <h1 className="system-hero-title">
              GIS Research
              <br />
              Data Hub
            </h1>

            <p className="system-hero-desc">
              공공 GIS 데이터와 교통·인구·환경 데이터를 지도 기반으로
              조회하고 분석할 수 있는 공간정보 데이터 활용 플랫폼입니다.
            </p>

            <div className="system-hero-actions">
              <a href="#purpose" className="system-primary-link">
                프로젝트 소개 보기
              </a>
              <a href="#feature" className="system-text-link">
                주요 기능 확인
              </a>
            </div>
          </div>

          <MapVisual />
        </div>
      </section>

      <section id="purpose" className="system-section">
        <div className="system-container">
          <SectionHead
            label="Purpose"
            title="분산된 공공 GIS 데이터를 하나의 플랫폼에서 더 쉽게 활용합니다."
            desc="GIS Research Data Hub는 여러 기관과 형식으로 흩어져 있는 공간 데이터를 통합하고, 지도 기반 시각화를 통해 지역별 현황과 공간적 분포를 직관적으로 이해할 수 있도록 지원합니다."
          />

          <div className="purpose-list">
            <div className="purpose-item">
              <p>01</p>
              <h3>공공데이터 통합</h3>
              <span>분산된 GIS 및 공공데이터를 하나의 시스템에서 통합 조회합니다.</span>
            </div>

            <div className="purpose-item">
              <p>02</p>
              <h3>지도 기반 시각화</h3>
              <span>지역별 현황과 공간적 분포를 지도 위에서 직관적으로 확인합니다.</span>
            </div>

            <div className="purpose-item">
              <p>03</p>
              <h3>사용자 참여</h3>
              <span>게시판을 통해 문의, 공지사항 확인, GIS 데이터 오류 제보를 지원합니다.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="feature" className="system-section system-feature-section">
        <div className="system-container">
          <SectionHead
            label="Feature"
            title="데이터 조회부터 분석과 제보까지 하나의 흐름으로 연결합니다."
            desc="주요 기능은 서로 분리된 화면이 아니라, 데이터를 찾고 이해하고 개선하는 흐름 안에서 동작하도록 구성됩니다."
          />

          <div className="feature-list">
            {mainFeatures.map((feature) => (
              <div className="feature-row" key={feature.no}>
                <p className="feature-no">{feature.no}</p>
                <h3>{feature.title}</h3>
                <div>
                  <p className="feature-desc">{feature.desc}</p>
                  <p className="feature-detail">{feature.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gis" className="system-section">
        <div className="system-container">
          <SectionHead
            label="GIS Feature"
            title="지도 위에서 데이터를 탐색하고, 위치 기반으로 제보합니다."
            desc="GIS 특화 기능은 단순 목록 조회가 아니라 현재 위치, 지도 영역, 행정구역, 반경 조건을 기준으로 데이터를 다룰 수 있게 합니다."
          />

          <div className="gis-keyword-list">
            {gisKeywords.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="data" className="system-section system-data-section">
        <div className="system-container">
          <SectionHead
            label="Data"
            title="공간 분석에 필요한 데이터를 영역별로 제공합니다."
            desc="GIS 데이터와 정적 데이터를 함께 활용하여 지역별 현황, 변화 흐름, 공간적 차이를 분석할 수 있습니다."
          />

          <div className="data-row-list">
            {dataRows.map(([title, desc]) => (
              <div className="data-row" key={title}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="effect" className="system-section">
        <div className="system-container">
          <SectionHead
            label="Effect"
            title="공공데이터의 접근성과 활용성을 높이는 것이 목표입니다."
            desc="사용자는 데이터를 더 쉽게 찾고, 관리자는 오류 제보와 운영 게시판을 통해 데이터 품질을 지속적으로 개선할 수 있습니다."
          />

          <div className="effect-list">
            {effects.map((effect, index) => (
              <div className="effect-item" key={effect}>
                <p>0{index + 1}</p>
                <h3>{effect}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default SystemIntroPage;