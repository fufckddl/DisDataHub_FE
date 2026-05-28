import { useState } from "react";
import TopTitle from "../../components/TopTitle";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import "../../style/simulationTest.css";

const RESULT_TABS = [
  { id: "result", label: "결과 목록" },
  { id: "attribute", label: "속성 결과" },
  { id: "stats", label: "통계" },
];

const DISTRICT_LABELS = [
  { name: "은평구", left: "18%", top: "18%" },
  { name: "노원구", left: "57%", top: "10%" },
  { name: "강북구", left: "53%", top: "20%" },
  { name: "서대문구", left: "28%", top: "34%" },
  { name: "종로구", left: "49%", top: "35%" },
  { name: "동대문구", left: "64%", top: "36%" },
  { name: "마포구", left: "31%", top: "46%" },
  { name: "중구", left: "47%", top: "48%" },
  { name: "용산구", left: "45%", top: "58%" },
  { name: "영등포구", left: "22%", top: "67%" },
  { name: "관악구", left: "44%", top: "84%" },
  { name: "강남구", left: "64%", top: "76%" },
];

// 하나의 페이지 레이아웃을 유지한 채 geometry 타입에 따라
// 제어 옵션, 지도 요소, 요약 카드, 결과 테이블만 바뀌도록 구성합니다.
const SIMULATION_PROFILES = {
  point: {
    label: "Point",
    title: "서울시 CCTV 위치 데이터 시뮬레이션",
    subtitle: "지도 시각화와 조건 설정을 통해 CCTV 분포와 밀집도를 확인할 수 있습니다.",
    defaultMapMode: "heat",
    defaultRegion: "서울시 전역",
    defaultDensity: "보통 (10-30개)",
    defaultRadius: 500,
    mapModes: [
      { id: "marker", label: "마커" },
      { id: "heat", label: "히트맵" },
      { id: "zone", label: "영역 표시" },
    ],
    regionOptions: ["서울시 전역", "강남구", "영등포구", "서초구", "마포구", "송파구"],
    densityOptions: ["보통 (10-30개)", "낮음 (1-10개)", "높음 (30개 이상)"],
    toggleLabels: {
      heatmap: "히트맵 표시",
      clustering: "클러스터 표시",
      boundary: "반경 범위 표시",
    },
    datasetInfo: [
      { label: "원본 데이터 수", value: "2,847개" },
      { label: "데이터 유형", value: "점(Point)" },
      { label: "분석 범위", value: "서울시 전역" },
      { label: "최종 업데이트", value: "2026.05" },
    ],
    statusText: "조건을 조정한 뒤 시뮬레이션을 실행해 주세요.",
    summaryStats: [
      { label: "총 CCTV 수", value: "12,345", tone: "default" },
      { label: "밀집 구역", value: "36", tone: "default" },
      { label: "평균 밀도", value: "24.7/km²", tone: "default" },
      { label: "상태", value: "정상", tone: "success" },
    ],
    hotspotRanking: [
      { district: "강남구", score: 92.1, width: "92%" },
      { district: "영등포구", score: 78.4, width: "78%" },
      { district: "서초구", score: 74.2, width: "74%" },
      { district: "마포구", score: 58.6, width: "58%" },
      { district: "송파구", score: 55.3, width: "55%" },
    ],
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "district", label: "자치구" },
          { key: "count", label: "CCTV 수" },
          { key: "density", label: "밀도" },
          { key: "hotspot", label: "핫스팟" },
          { key: "note", label: "비고" },
        ],
        rows: [
          { rank: "1", district: "강남구", count: "1,856", density: "92.1", hotspot: "핫스팟", note: "역세권 주변 밀집도가 높습니다." },
          { rank: "2", district: "영등포구", count: "1,523", density: "78.4", hotspot: "핫스팟", note: "상업지 중심으로 높은 점수가 유지됩니다." },
          { rank: "3", district: "서초구", count: "1,312", density: "74.2", hotspot: "핫스팟", note: "학군 밀집 지역에 고르게 분포합니다." },
          { rank: "4", district: "마포구", count: "987", density: "58.6", hotspot: "주의", note: "대학가 주변 밀도가 다소 불균형합니다." },
          { rank: "5", district: "송파구", count: "842", density: "55.3", hotspot: "일반", note: "주거 지역 중심으로 안정적인 분포입니다." },
        ],
      },
      attribute: {
        columns: [
          { key: "id", label: "시설 ID" },
          { key: "name", label: "설치 위치" },
          { key: "district", label: "자치구" },
          { key: "lat", label: "위도" },
          { key: "lng", label: "경도" },
          { key: "status", label: "상태" },
        ],
        rows: [
          { id: "PT-001", name: "강남역 11번 출구", district: "강남구", lat: "37.4979", lng: "127.0276", status: "정상" },
          { id: "PT-014", name: "여의도 중심부", district: "영등포구", lat: "37.5219", lng: "126.9246", status: "정상" },
          { id: "PT-028", name: "서초 학군 밀집 지역", district: "서초구", lat: "37.4931", lng: "127.0142", status: "주의" },
          { id: "PT-043", name: "홍대입구역 인근", district: "마포구", lat: "37.5563", lng: "126.9236", status: "정상" },
          { id: "PT-057", name: "잠실 메인 거리", district: "송파구", lat: "37.5117", lng: "127.0850", status: "정상" },
        ],
      },
      stats: {
        columns: [
          { key: "metric", label: "지표" },
          { key: "current", label: "현재값" },
          { key: "baseline", label: "기준값" },
          { key: "change", label: "변화량" },
          { key: "result", label: "판정" },
        ],
        rows: [
          { metric: "총 CCTV 수", current: "12,345", baseline: "12,010", change: "+335", result: "증가" },
          { metric: "평균 밀도", current: "24.7/km²", baseline: "21.5/km²", change: "+3.2", result: "개선" },
          { metric: "밀집 구역 수", current: "36", baseline: "31", change: "+5", result: "증가" },
          { metric: "분석 반경", current: "500m", baseline: "300m", change: "+200m", result: "확장" },
          { metric: "클러스터 표시", current: "사용", baseline: "미사용", change: "ON", result: "활성" },
        ],
      },
    },
    map: {
      markerDots: [
        { left: "11%", top: "46%" }, { left: "14%", top: "29%" }, { left: "15%", top: "75%" }, { left: "18%", top: "61%" },
        { left: "20%", top: "23%" }, { left: "21%", top: "43%" }, { left: "22%", top: "68%" }, { left: "24%", top: "51%" },
        { left: "26%", top: "35%" }, { left: "27%", top: "57%" }, { left: "29%", top: "76%" }, { left: "32%", top: "22%" },
        { left: "33%", top: "48%" }, { left: "35%", top: "64%" }, { left: "37%", top: "82%" }, { left: "40%", top: "31%" },
        { left: "42%", top: "43%" }, { left: "44%", top: "58%" }, { left: "46%", top: "73%" }, { left: "49%", top: "28%" },
        { left: "51%", top: "40%" }, { left: "53%", top: "52%" }, { left: "55%", top: "66%" }, { left: "57%", top: "22%" },
        { left: "59%", top: "35%" }, { left: "61%", top: "47%" }, { left: "63%", top: "63%" }, { left: "66%", top: "30%" },
        { left: "68%", top: "51%" }, { left: "70%", top: "72%" }, { left: "73%", top: "24%" }, { left: "75%", top: "43%" },
        { left: "77%", top: "60%" }, { left: "79%", top: "78%" }, { left: "81%", top: "33%" }, { left: "84%", top: "56%" },
        { left: "86%", top: "71%" }, { left: "88%", top: "46%" }, { left: "90%", top: "25%" },
      ],
      heatSpots: [
        { left: "15%", top: "44%", size: "sm" }, { left: "22%", top: "72%", size: "sm" }, { left: "35%", top: "66%", size: "lg" },
        { left: "38%", top: "52%", size: "sm" }, { left: "43%", top: "37%", size: "md" }, { left: "48%", top: "39%", size: "sm" },
        { left: "57%", top: "73%", size: "lg" }, { left: "61%", top: "78%", size: "md" }, { left: "64%", top: "24%", size: "sm" },
        { left: "79%", top: "69%", size: "md" }, { left: "83%", top: "50%", size: "sm" }, { left: "87%", top: "79%", size: "sm" },
      ],
      clusterBubbles: [
        { left: "27%", top: "74%", value: "24" },
        { left: "44%", top: "56%", value: "18" },
        { left: "61%", top: "61%", value: "31" },
        { left: "78%", top: "39%", value: "12" },
      ],
      boundaryZones: [
        { left: "30%", top: "65%", width: "17%", height: "14%", rotate: "-10deg" },
        { left: "47%", top: "44%", width: "18%", height: "15%", rotate: "8deg" },
        { left: "61%", top: "74%", width: "14%", height: "12%", rotate: "-18deg" },
        { left: "80%", top: "70%", width: "16%", height: "14%", rotate: "14deg" },
      ],
      legend: { type: "gradient", title: "CCTV 밀집도" },
    },
  },
  linestring: {
    label: "LineString",
    title: "도로/노선 흐름 시뮬레이션",
    subtitle: "선형 데이터 기준으로 주요 연결축과 구간별 흐름을 비교하는 예시 화면입니다.",
    defaultMapMode: "flow",
    defaultRegion: "중심 연결축",
    defaultDensity: "보통 (5-15개)",
    defaultRadius: 800,
    mapModes: [
      { id: "flow", label: "흐름" },
      { id: "heat", label: "히트맵" },
      { id: "zone", label: "구간 강조" },
    ],
    regionOptions: ["중심 연결축", "강남 축", "한강 변", "서부 환승 축"],
    densityOptions: ["보통 (5-15개)", "낮음 (1-5개)", "혼잡 (15개 이상)"],
    toggleLabels: {
      heatmap: "혼잡도 히트맵",
      clustering: "노드 라벨 표시",
      boundary: "구간 범위 표시",
    },
    datasetInfo: [
      { label: "구간 수", value: "1,164개" },
      { label: "데이터 유형", value: "선(LineString)" },
      { label: "분석 범위", value: "주요 간선 축" },
      { label: "최종 업데이트", value: "2026.04" },
    ],
    statusText: "선택한 구간의 흐름과 중첩 구간을 비교할 수 있습니다.",
    summaryStats: [
      { label: "추적 노선", value: "418", tone: "default" },
      { label: "중첩 구간", value: "14", tone: "default" },
      { label: "평균 흐름 점수", value: "81.2", tone: "default" },
      { label: "상태", value: "정상", tone: "success" },
    ],
    hotspotRanking: [
      { district: "강남 축", score: 95.4, width: "95%" },
      { district: "용산 연결 구간", score: 84.1, width: "84%" },
      { district: "마포 유입 축", score: 72.6, width: "72%" },
      { district: "중구 중심 축", score: 67.9, width: "67%" },
      { district: "서부 환승 축", score: 61.8, width: "61%" },
    ],
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "corridor", label: "구간명" },
          { key: "segments", label: "세부 구간 수" },
          { key: "coverage", label: "흐름 점수" },
          { key: "hotspot", label: "우선도" },
          { key: "note", label: "비고" },
        ],
        rows: [
          { rank: "1", corridor: "강남 축", segments: "76", coverage: "95.4", hotspot: "핫스팟", note: "출퇴근 시간대 중첩이 가장 큽니다." },
          { rank: "2", corridor: "용산 연결 구간", segments: "63", coverage: "84.1", hotspot: "핫스팟", note: "환승 수요가 꾸준히 증가합니다." },
          { rank: "3", corridor: "마포 유입 축", segments: "51", coverage: "72.6", hotspot: "주의", note: "교량 진입부 지연이 커집니다." },
          { rank: "4", corridor: "중구 중심 축", segments: "44", coverage: "67.9", hotspot: "주의", note: "도심 회전 구간이 불안정합니다." },
          { rank: "5", corridor: "서부 환승 축", segments: "39", coverage: "61.8", hotspot: "일반", note: "야간 수요는 안정적입니다." },
        ],
      },
      attribute: {
        columns: [
          { key: "id", label: "노선 ID" },
          { key: "name", label: "노선명" },
          { key: "district", label: "자치구" },
          { key: "length", label: "길이" },
          { key: "speed", label: "평균 속도" },
          { key: "status", label: "상태" },
        ],
        rows: [
          { id: "LN-101", name: "강남 메인 축", district: "강남구", length: "8.4km", speed: "31km/h", status: "정상" },
          { id: "LN-114", name: "용산 연결 노선", district: "용산구", length: "6.7km", speed: "28km/h", status: "주의" },
          { id: "LN-128", name: "마포 경계 축", district: "마포구", length: "5.9km", speed: "34km/h", status: "정상" },
          { id: "LN-143", name: "중구 중심 노선", district: "중구", length: "4.8km", speed: "25km/h", status: "주의" },
          { id: "LN-157", name: "서부 환승 축", district: "구로구", length: "7.1km", speed: "37km/h", status: "정상" },
        ],
      },
      stats: {
        columns: [
          { key: "metric", label: "지표" },
          { key: "current", label: "현재값" },
          { key: "baseline", label: "기준값" },
          { key: "change", label: "변화량" },
          { key: "result", label: "판정" },
        ],
        rows: [
          { metric: "추적 노선 수", current: "418", baseline: "401", change: "+17", result: "증가" },
          { metric: "평균 흐름 점수", current: "81.2", baseline: "76.8", change: "+4.4", result: "개선" },
          { metric: "중첩 구간 수", current: "14", baseline: "11", change: "+3", result: "증가" },
          { metric: "분석 반경", current: "800m", baseline: "600m", change: "+200m", result: "확장" },
          { metric: "노드 라벨", current: "사용", baseline: "미사용", change: "ON", result: "활성" },
        ],
      },
    },
    map: {
      routes: [
        { left: "22%", top: "74%", width: "34%", rotate: "-18deg", tone: "primary" },
        { left: "42%", top: "52%", width: "30%", rotate: "8deg", tone: "accent" },
        { left: "61%", top: "45%", width: "28%", rotate: "-26deg", tone: "primary" },
        { left: "73%", top: "69%", width: "26%", rotate: "14deg", tone: "accent" },
      ],
      nodes: [
        { left: "25%", top: "72%", value: "A1" },
        { left: "39%", top: "56%", value: "B2" },
        { left: "58%", top: "41%", value: "C4" },
        { left: "72%", top: "67%", value: "D6" },
        { left: "49%", top: "49%", value: "X" },
      ],
      boundaryZones: [
        { left: "29%", top: "68%", width: "21%", height: "11%", rotate: "-18deg" },
        { left: "49%", top: "50%", width: "22%", height: "10%", rotate: "10deg" },
        { left: "70%", top: "58%", width: "18%", height: "10%", rotate: "16deg" },
      ],
      heatSpots: [
        { left: "28%", top: "70%", size: "md" },
        { left: "48%", top: "50%", size: "lg" },
        { left: "68%", top: "60%", size: "md" },
      ],
      legend: {
        type: "list",
        title: "구간 범례",
        items: [
          { tone: "primary-line", label: "주요 흐름" },
          { tone: "accent-line", label: "보조 흐름" },
          { tone: "node", label: "환승 노드" },
        ],
      },
    },
  },
  polygon: {
    label: "Polygon",
    title: "권역/구역 면적 시뮬레이션",
    subtitle: "면형 데이터 기준으로 권역별 우선순위와 위험 등급을 비교하는 예시 화면입니다.",
    defaultMapMode: "fill",
    defaultRegion: "위험 권역",
    defaultDensity: "보통 (B등급)",
    defaultRadius: 1200,
    mapModes: [
      { id: "fill", label: "채움" },
      { id: "heat", label: "히트맵" },
      { id: "zone", label: "경계 강조" },
    ],
    regionOptions: ["위험 권역", "침수 예상 지역", "학군 권역", "재개발 구역"],
    densityOptions: ["보통 (B등급)", "저위험 (A등급)", "고위험 (C등급 이상)"],
    toggleLabels: {
      heatmap: "위험도 채움",
      clustering: "중심 라벨 표시",
      boundary: "경계선 강조",
    },
    datasetInfo: [
      { label: "권역 수", value: "286개" },
      { label: "데이터 유형", value: "면(Polygon)" },
      { label: "분석 범위", value: "행정/생활 권역" },
      { label: "최종 업데이트", value: "2026.03" },
    ],
    statusText: "권역별 채움과 경계 강조를 바꿔가며 비교할 수 있습니다.",
    summaryStats: [
      { label: "분석 권역 수", value: "286", tone: "default" },
      { label: "주의 권역", value: "9", tone: "default" },
      { label: "평균 위험 등급", value: "B+", tone: "default" },
      { label: "상태", value: "검토 완료", tone: "success" },
    ],
    hotspotRanking: [
      { district: "동측 침수 권역", score: 96.2, width: "96%" },
      { district: "학군 권역 A", score: 83.4, width: "83%" },
      { district: "산업 지대", score: 77.1, width: "77%" },
      { district: "재개발 3구역", score: 69.8, width: "69%" },
      { district: "강변 남측 권역", score: 62.9, width: "62%" },
    ],
    tableData: {
      result: {
        columns: [
          { key: "rank", label: "순위" },
          { key: "zone", label: "권역명" },
          { key: "area", label: "면적" },
          { key: "grade", label: "위험 등급" },
          { key: "hotspot", label: "우선도" },
          { key: "note", label: "비고" },
        ],
        rows: [
          { rank: "1", zone: "동측 침수 권역", area: "3.8km²", grade: "A+", hotspot: "핫스팟", note: "침수 위험도가 가장 높습니다." },
          { rank: "2", zone: "학군 권역 A", area: "2.9km²", grade: "A", hotspot: "핫스팟", note: "보행 밀집이 지속적으로 발생합니다." },
          { rank: "3", zone: "산업 지대", area: "4.6km²", grade: "B+", hotspot: "주의", note: "교대 시간대 위험도가 상승합니다." },
          { rank: "4", zone: "재개발 3구역", area: "1.8km²", grade: "B", hotspot: "주의", note: "공사 구간 접근성이 자주 변동됩니다." },
          { rank: "5", zone: "강변 남측 권역", area: "3.1km²", grade: "B-", hotspot: "일반", note: "주말에는 비교적 안정적입니다." },
        ],
      },
      attribute: {
        columns: [
          { key: "id", label: "권역 ID" },
          { key: "name", label: "권역명" },
          { key: "district", label: "자치구" },
          { key: "area", label: "면적" },
          { key: "grade", label: "등급" },
          { key: "status", label: "상태" },
        ],
        rows: [
          { id: "PG-011", name: "동측 침수 권역", district: "송파구", area: "3.8km²", grade: "A+", status: "정상" },
          { id: "PG-024", name: "학군 권역 A", district: "서초구", area: "2.9km²", grade: "A", status: "정상" },
          { id: "PG-033", name: "산업 지대", district: "영등포구", area: "4.6km²", grade: "B+", status: "주의" },
          { id: "PG-046", name: "재개발 3구역", district: "마포구", area: "1.8km²", grade: "B", status: "정상" },
          { id: "PG-057", name: "강변 남측 권역", district: "용산구", area: "3.1km²", grade: "B-", status: "정상" },
        ],
      },
      stats: {
        columns: [
          { key: "metric", label: "지표" },
          { key: "current", label: "현재값" },
          { key: "baseline", label: "기준값" },
          { key: "change", label: "변화량" },
          { key: "result", label: "판정" },
        ],
        rows: [
          { metric: "분석 권역 수", current: "286", baseline: "275", change: "+11", result: "증가" },
          { metric: "주의 권역 수", current: "9", baseline: "7", change: "+2", result: "증가" },
          { metric: "평균 위험 등급", current: "B+", baseline: "B", change: "+1", result: "개선" },
          { metric: "분석 반경", current: "1200m", baseline: "1000m", change: "+200m", result: "확장" },
          { metric: "경계 강조", current: "사용", baseline: "미사용", change: "ON", result: "활성" },
        ],
      },
    },
    map: {
      polygons: [
        { left: "27%", top: "66%", width: "18%", height: "15%", rotate: "-12deg", tone: "high", label: "A+" },
        { left: "46%", top: "49%", width: "16%", height: "14%", rotate: "7deg", tone: "medium", label: "B+" },
        { left: "64%", top: "73%", width: "17%", height: "13%", rotate: "-16deg", tone: "low", label: "B" },
        { left: "75%", top: "38%", width: "15%", height: "12%", rotate: "12deg", tone: "high", label: "A" },
      ],
      clusterBubbles: [
        { left: "27%", top: "66%", value: "A+" },
        { left: "46%", top: "49%", value: "B+" },
        { left: "64%", top: "73%", value: "B" },
        { left: "75%", top: "38%", value: "A" },
      ],
      boundaryZones: [
        { left: "27%", top: "66%", width: "20%", height: "17%", rotate: "-12deg" },
        { left: "46%", top: "49%", width: "18%", height: "16%", rotate: "7deg" },
        { left: "64%", top: "73%", width: "19%", height: "15%", rotate: "-16deg" },
        { left: "75%", top: "38%", width: "17%", height: "14%", rotate: "12deg" },
      ],
      heatSpots: [
        { left: "29%", top: "66%", size: "lg" },
        { left: "48%", top: "49%", size: "md" },
        { left: "74%", top: "38%", size: "lg" },
      ],
      legend: {
        type: "list",
        title: "권역 범례",
        items: [
          { tone: "fill-high", label: "고위험 권역" },
          { tone: "fill-medium", label: "중위험 권역" },
          { tone: "fill-low", label: "기준 권역" },
        ],
      },
    },
  },
};

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="simulation-test-toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`simulation-test-switch ${checked ? "active" : ""}`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <span></span>
      </button>
    </div>
  );
}

function ResultChip({ value }) {
  const chipClass =
    value === "핫스팟" ||
    value === "증가" ||
    value === "개선" ||
    value === "활성" ||
    value === "주의"
      ? "danger"
      : value === "일반" || value === "확장"
        ? "warning"
        : "success";

  return <span className={`simulation-test-chip ${chipClass}`}>{value}</span>;
}

function DataCell({ columnKey, value }) {
  if (columnKey === "hotspot" || columnKey === "status" || columnKey === "result") {
    return <ResultChip value={value} />;
  }

  if (columnKey === "change") {
    return (
      <span className={`simulation-test-change ${String(value).startsWith("+") ? "up" : ""}`}>
        {value}
      </span>
    );
  }

  return <span>{value}</span>;
}

function SimulationDatasetInfo({ datasetInfo }) {
  return (
    <div className="simulation-test-panel simulation-test-info-panel card">
      <div className="simulation-test-panel-title">
        <i className="bi bi-card-list"></i>
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
}) {
  return (
    <div className="simulation-test-panel simulation-test-control-panel card">
      <div className="simulation-test-panel-title">
        <i className="bi bi-sliders"></i>
        <span>분석 조건 설정</span>
      </div>

      <div className="simulation-test-field-block">
        <div className="simulation-test-field-label">시각화 방식</div>
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
        <label className="simulation-test-field-label">분석 지역</label>
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
        <div className="simulation-test-range-head">
          <span className="simulation-test-field-label mb-0">분석 반경</span>
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
        <div className="simulation-test-range-labels">
          <span>100m</span>
          <span>1000m</span>
          <span>5000m</span>
        </div>
      </div>

      <div className="simulation-test-field-block">
        <label className="simulation-test-field-label">밀도 기준값</label>
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
        <div className="simulation-test-field-label">표시 옵션</div>
        <div className="simulation-test-toggle-list">
          <ToggleRow
            label={profile.toggleLabels.heatmap}
            checked={showHeatmap}
            onChange={() => setShowHeatmap((previous) => !previous)}
          />
          <ToggleRow
            label={profile.toggleLabels.clustering}
            checked={useClustering}
            onChange={() => setUseClustering((previous) => !previous)}
          />
          <ToggleRow
            label={profile.toggleLabels.boundary}
            checked={showBoundary}
            onChange={() => setShowBoundary((previous) => !previous)}
          />
        </div>
      </div>

      <div className="simulation-test-notice">
        <i className="bi bi-info-circle-fill"></i>
        <span>{statusText}</span>
      </div>

      <div className="row g-2 simulation-test-action-row">
        <div className="col-6">
          <button
            type="button"
            className="btn btn-primary w-100 simulation-test-action-button"
            onClick={handleRun}
          >
            <i className="bi bi-caret-right-fill me-2"></i>
            실행
          </button>
        </div>
        <div className="col-6">
          <button
            type="button"
            className="btn btn-light border w-100 simulation-test-action-button secondary"
            onClick={handleReset}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}

function SimulationLegend({ legend }) {
  if (legend.type === "gradient") {
    return (
      <div className="simulation-test-legend">
        <div className="simulation-test-legend-title">{legend.title}</div>
        <div className="simulation-test-legend-bar"></div>
        <div className="simulation-test-legend-labels">
          <span>낮음</span>
          <span>보통</span>
          <span>높음</span>
        </div>
      </div>
    );
  }

  return (
    <div className="simulation-test-legend">
      <div className="simulation-test-legend-title">{legend.title}</div>
      <div className="simulation-test-legend-list">
        {legend.items.map((item) => (
          <div key={item.label} className="simulation-test-legend-item">
            <span className={`simulation-test-legend-swatch ${item.tone}`}></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulationMapView({
  geometryType,
  mapMode,
  selectedRegion,
  radius,
  showHeatmap,
  useClustering,
  showBoundary,
  profile,
}) {
  const mapData = profile.map;

  return (
    <div className="simulation-test-panel card simulation-test-map-panel h-100">
      <div className="simulation-test-map-header">
        <div className="simulation-test-panel-title mb-0">
          <i className="bi bi-map"></i>
          <span>지도 결과</span>
        </div>

        <div className="simulation-test-map-meta">
          <span>{profile.label}</span>
          <span>{selectedRegion}</span>
          <span>반경 {radius}m</span>
        </div>
      </div>

      <div className={`simulation-test-map-stage mode-${mapMode}`}>
        <img src={mapPreviewImg} alt="시뮬레이션 지도 미리보기" className="simulation-test-map-image" />
        <div className="simulation-test-map-overlay"></div>

        {DISTRICT_LABELS.map((item) => (
          <span
            key={item.name}
            className="simulation-test-district-label"
            style={{ left: item.left, top: item.top }}
          >
            {item.name}
          </span>
        ))}

        {geometryType === "point" &&
          mapData.markerDots.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className="simulation-test-map-dot"
              style={{ left: item.left, top: item.top }}
            ></span>
          ))}

        {geometryType === "point" &&
          showHeatmap &&
          mapData.heatSpots.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className={`simulation-test-heatspot ${item.size}`}
              style={{ left: item.left, top: item.top }}
            ></span>
          ))}

        {geometryType === "point" &&
          useClustering &&
          mapData.clusterBubbles.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className="simulation-test-cluster-bubble"
              style={{ left: item.left, top: item.top }}
            >
              {item.value}
            </span>
          ))}

        {geometryType === "linestring" &&
          mapData.routes.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className={`simulation-test-map-route ${item.tone}`}
              style={{
                left: item.left,
                top: item.top,
                width: item.width,
                transform: `translate(-50%, -50%) rotate(${item.rotate})`,
              }}
            ></span>
          ))}

        {geometryType === "linestring" &&
          showHeatmap &&
          mapData.heatSpots.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className={`simulation-test-heatspot ${item.size}`}
              style={{ left: item.left, top: item.top }}
            ></span>
          ))}

        {geometryType === "linestring" &&
          useClustering &&
          mapData.nodes.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className="simulation-test-map-node"
              style={{ left: item.left, top: item.top }}
            >
              {item.value}
            </span>
          ))}

        {geometryType === "polygon" &&
          mapData.polygons.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className={`simulation-test-map-polygon ${item.tone}`}
              style={{
                left: item.left,
                top: item.top,
                width: item.width,
                height: item.height,
                transform: `translate(-50%, -50%) rotate(${item.rotate})`,
              }}
            ></span>
          ))}

        {geometryType === "polygon" &&
          showHeatmap &&
          mapData.heatSpots.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className={`simulation-test-heatspot ${item.size}`}
              style={{ left: item.left, top: item.top }}
            ></span>
          ))}

        {geometryType === "polygon" &&
          useClustering &&
          mapData.clusterBubbles.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className="simulation-test-cluster-bubble"
              style={{ left: item.left, top: item.top }}
            >
              {item.value}
            </span>
          ))}

        {(showBoundary || mapMode === "zone") &&
          mapData.boundaryZones.map((item, index) => (
            <span
              key={`${item.left}-${item.top}-${index}`}
              className="simulation-test-boundary-zone"
              style={{
                left: item.left,
                top: item.top,
                width: item.width,
                height: item.height,
                transform: `translate(-50%, -50%) rotate(${item.rotate})`,
              }}
            ></span>
          ))}

        <div className="simulation-test-map-controls">
          <button type="button"><i className="bi bi-plus-lg"></i></button>
          <button type="button"><i className="bi bi-dash-lg"></i></button>
          <button type="button"><i className="bi bi-layers"></i></button>
          <button type="button"><i className="bi bi-fullscreen"></i></button>
        </div>

        <SimulationLegend legend={mapData.legend} />
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
          <span>우선순위 구역</span>
        </div>

        <div className="simulation-test-ranking-list">
          {hotspotRanking.map((item, index) => (
            <div key={item.district} className="simulation-test-ranking-row">
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

        <button type="button" className="btn btn-light border simulation-test-export-button">
          <i className="bi bi-download me-2"></i>
          CSV 내려받기
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
            {activeTable.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {activeTable.columns.map((column) => (
                  <td key={column.key}>
                    <DataCell columnKey={column.key} value={row[column.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="simulation-test-table-footer">
        <span>전체 25개 중 1-5 표시</span>

        <div className="simulation-test-pagination">
          <button type="button"><i className="bi bi-chevron-left"></i></button>
          <button type="button" className="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">4</button>
          <button type="button">5</button>
          <button type="button"><i className="bi bi-chevron-right"></i></button>
        </div>

        <select className="form-select simulation-test-page-size" defaultValue="5개씩 보기">
          <option>5개씩 보기</option>
          <option>10개씩 보기</option>
          <option>20개씩 보기</option>
        </select>
      </div>
    </div>
  );
}

function UserDatasetSimulationTestPage() {
  const [geometryType, setGeometryType] = useState("point");
  const currentProfile = SIMULATION_PROFILES[geometryType];

  const [mapMode, setMapMode] = useState(currentProfile.defaultMapMode);
  const [selectedRegion, setSelectedRegion] = useState(currentProfile.defaultRegion);
  const [radius, setRadius] = useState(currentProfile.defaultRadius);
  const [densityLevel, setDensityLevel] = useState(currentProfile.defaultDensity);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [useClustering, setUseClustering] = useState(true);
  const [showBoundary, setShowBoundary] = useState(false);
  const [selectedTab, setSelectedTab] = useState("result");
  const [statusText, setStatusText] = useState(currentProfile.statusText);

  const activeTable = currentProfile.tableData[selectedTab];

  const resetWithProfile = (profile) => {
    setMapMode(profile.defaultMapMode);
    setSelectedRegion(profile.defaultRegion);
    setRadius(profile.defaultRadius);
    setDensityLevel(profile.defaultDensity);
    setShowHeatmap(true);
    setUseClustering(true);
    setShowBoundary(false);
    setSelectedTab("result");
    setStatusText(profile.statusText);
  };

  const handleReset = () => {
    resetWithProfile(currentProfile);
  };

  const handleRun = () => {
    setStatusText(
      `${currentProfile.label} 타입 기준으로 ${selectedRegion} / 반경 ${radius}m 결과가 반영되었습니다.`,
    );
  };

  // Geometry 버튼을 바꾸면 각 타입에 맞는 기본 제어값과 표시 요소를 함께 초기화합니다.
  const handleGeometryChange = (nextGeometryType) => {
    const nextProfile = SIMULATION_PROFILES[nextGeometryType];
    setGeometryType(nextGeometryType);
    resetWithProfile(nextProfile);
  };

  return (
    <div className="container-fluid px-4 py-3 simulation-test-page">
      <div className="row mb-3">
        <div className="col">
          <TopTitle
            title={currentProfile.title}
            subTitle={currentProfile.subtitle}
            showGuide={false}
          />
        </div>
      </div>

      <div className="row g-3 simulation-test-main-row">
        <div className="col-12 col-xl-3 simulation-test-side-column">
          <div className="row g-3 simulation-test-side-stack">
            <div className="col-12">
              <SimulationDatasetInfo datasetInfo={currentProfile.datasetInfo} />
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
                statusText={statusText}
                handleRun={handleRun}
                handleReset={handleReset}
                profile={currentProfile}
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
                showHeatmap={showHeatmap}
                useClustering={useClustering}
                showBoundary={showBoundary}
                profile={currentProfile}
              />
            </div>

            <div className="col-12 col-xxl-4 simulation-test-summary-column">
              <SimulationResultSummary
                summaryStats={currentProfile.summaryStats}
                hotspotRanking={currentProfile.hotspotRanking}
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
              <span>도형 타입 전환</span>
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
