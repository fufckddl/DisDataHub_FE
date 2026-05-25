import { useState } from "react";
import TopTitle from "../../components/TopTitle";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import "../../style/simulationTest3.css";

const datasetInfo = [
    { label: "데이터셋", value: "서울시 CCTV 위치 데이터" },
    { label: "제공 기관", value: "서울시 열린데이터광장" },
    { label: "데이터 범위", value: "서울시 전역" },
    { label: "최종 업데이트", value: "2024.12" },
];

const regionOptions = ["서울시 전역", "강남구", "영등포구", "서초구", "마포구", "송파구"];
const densityOptions = ["보통 (10-30개)", "낮음 (1-10개)", "높음 (30개 이상)"];

const viewModes = [
    { id: "radius", label: "반경 분석" },
    { id: "heat", label: "HeatMap" },
    { id: "coverage", label: "커버리지" },
];

const tableTabs = [
    { id: "result", label: "결과 목록" },
    { id: "attribute", label: "속성 결과" },
    { id: "stats", label: "통계 비교" },
];

const areaLabels = [
    { name: "은평구", left: "16%", top: "18%" },
    { name: "도봉구", left: "55%", top: "10%" },
    { name: "강북구", left: "49%", top: "18%" },
    { name: "서대문구", left: "25%", top: "34%" },
    { name: "종로구", left: "46%", top: "35%" },
    { name: "동대문구", left: "61%", top: "38%" },
    { name: "마포구", left: "26%", top: "48%" },
    { name: "중구", left: "44%", top: "49%" },
    { name: "용산구", left: "43%", top: "58%" },
    { name: "영등포구", left: "21%", top: "67%" },
    { name: "관악구", left: "42%", top: "84%" },
    { name: "강남구", left: "63%", top: "75%" },
];

const scenarioOptions = [
    {
        id: "night-patrol",
        badge: "추천",
        name: "야간 순찰 최적화",
        summary: "심야 시간대 신고 밀집 구역을 중심으로 순찰 동선과 CCTV 관제 반경을 재설계합니다.",
        impact: "위험도 18% 감소",
        metrics: [
            { label: "예상 위험도 감소", value: "18%", helper: "현재 기준 대비", tone: "blue" },
            { label: "우선 조치 권역", value: "4개", helper: "즉시 반영 가능", tone: "amber" },
            { label: "응답 시간 단축", value: "6분", helper: "순찰 재배치 반영", tone: "emerald" },
        ],
        priorityZones: [
            { name: "강남역 상권", score: 92.1, detail: "심야 유동 인구 + 신고 이력 집중", width: "92%", tone: "high" },
            { name: "영등포 생활권", score: 78.4, detail: "환승 구간과 골목권 밀집", width: "78%", tone: "high" },
            { name: "서초역 상권", score: 71.6, detail: "상업 지역 집중", width: "71%", tone: "mid" },
            { name: "마포 야간권", score: 59.3, detail: "주말 집중도 상승", width: "59%", tone: "normal" },
        ],
        timeline: [
            { time: "00:00", title: "기준 데이터 병합", status: "완료", detail: "신고 이력, 유동 인구, 관제 반경을 시간대 기준으로 통합" },
            { time: "00:42", title: "취약지 점수화", status: "완료", detail: "사각지대와 체류 인구를 반영해 권역별 위험도 재계산" },
            { time: "01:18", title: "순찰 동선 재배치", status: "진행중", detail: "심야 시간 기준 최단 대응 경로와 중첩 반경 조정" },
            { time: "02:05", title: "운영안 요약", status: "예정", detail: "권역별 실행 우선순위와 반경 조정 결과 출력" },
        ],
        comparisonBars: [
            { label: "강남역 서측", before: 88, after: 61, note: "사각지대 해소 효과 큼" },
            { label: "영등포 환승권", before: 76, after: 58, note: "동선 재배치 효과" },
            { label: "서초역 상권", before: 69, after: 57, note: "상업 밀집 구간 안정화" },
            { label: "마포 야간권", before: 61, after: 54, note: "주말 집중도 완화" },
        ],
        actionItems: [
            "강남역 서측 골목 CCTV 반경을 80m 확장하고 순찰차 1대를 추가 배치합니다.",
            "영등포 환승권은 심야 23시 이후 관제 모니터링 빈도를 높이는 것이 효과적입니다.",
            "서초역 상권은 이동형 카메라보다 순찰 동선 재설계 효과가 더 크게 나타납니다.",
        ],
        resultRows: [
            { rank: "1", district: "강남구", count: "1,856", density: "92.1", level: "높음", note: "역삼·삼성 상권 밀집" },
            { rank: "2", district: "영등포구", count: "1,523", density: "78.4", level: "높음", note: "여의도·환승권 밀집" },
            { rank: "3", district: "서초구", count: "1,312", density: "71.6", level: "보통", note: "교대·서초역 상권" },
            { rank: "4", district: "마포구", count: "987", density: "59.3", level: "보통", note: "홍대·합정 야간권" },
            { rank: "5", district: "송파구", count: "842", density: "52.7", level: "낮음", note: "잠실 생활권" },
        ],
        attributeRows: [
            { id: "CCTV-001", name: "강남역 11번 출구", district: "강남구", radius: "500m", status: "정상" },
            { id: "CCTV-014", name: "여의도 환승센터", district: "영등포구", radius: "450m", status: "정상" },
            { id: "CCTV-028", name: "교대역 교차로", district: "서초구", radius: "420m", status: "점검" },
            { id: "CCTV-043", name: "홍대입구 8번 출구", district: "마포구", radius: "380m", status: "정상" },
        ],
        statRows: [
            { metric: "핫스팟 수", baseline: "31", current: "36", change: "+5", result: "증가" },
            { metric: "응답 시간", baseline: "18분", current: "12분", change: "-6분", result: "개선" },
            { metric: "위험도 평균", baseline: "74.2", current: "60.8", change: "-13.4", result: "감소" },
            { metric: "반경 재설계 구간", baseline: "2개", current: "4개", change: "+2", result: "확대" },
        ],
        mapZones: [
            { left: "28%", top: "66%", size: 250, tone: "high", tag: "강남역" },
            { left: "21%", top: "72%", size: 200, tone: "mid", tag: "영등포" },
            { left: "47%", top: "42%", size: 220, tone: "mid", tag: "서초역" },
            { left: "33%", top: "49%", size: 170, tone: "normal", tag: "마포" },
        ],
        mapPoints: [
            { left: "29%", top: "63%", tone: "high" },
            { left: "31%", top: "69%", tone: "high" },
            { left: "22%", top: "69%", tone: "mid" },
            { left: "24%", top: "74%", tone: "mid" },
            { left: "46%", top: "39%", tone: "mid" },
            { left: "49%", top: "45%", tone: "mid" },
            { left: "33%", top: "46%", tone: "normal" },
            { left: "34%", top: "52%", tone: "normal" },
        ],
    },
    {
        id: "school-safety",
        badge: "안전",
        name: "통학권 안전 보강",
        summary: "학교 주변 생활권의 보행 동선과 CCTV 관제 구간을 중심으로 통학 시간대 안전성을 높입니다.",
        impact: "위험권역 3개 축소",
        metrics: [
            { label: "보행 취약구간 감소", value: "15%", helper: "통학 시간대 기준", tone: "blue" },
            { label: "학교 주변 권역", value: "6개", helper: "우선 분석 구간", tone: "amber" },
            { label: "추가 점검 지점", value: "9곳", helper: "현장 확인 필요", tone: "emerald" },
        ],
        priorityZones: [
            { name: "강서 통학권", score: 81.3, detail: "초등학교 밀집 + 횡단보도 연계", width: "81%", tone: "high" },
            { name: "노원 학원권", score: 73.9, detail: "저녁 시간 보행 집중", width: "73%", tone: "mid" },
            { name: "송파 초중권", score: 68.4, detail: "보행 동선 분산 필요", width: "68%", tone: "mid" },
            { name: "마포 통학권", score: 54.8, detail: "주요 사거리 집중", width: "54%", tone: "normal" },
        ],
        timeline: [
            { time: "00:00", title: "학교 반경 데이터 로드", status: "완료", detail: "학교 위치와 CCTV 반경을 500m 기준으로 병합" },
            { time: "00:37", title: "보행 동선 분석", status: "완료", detail: "횡단보도와 주요 보행축 기준 위험도 계산" },
            { time: "01:05", title: "관제 중첩 구간 비교", status: "진행중", detail: "중복 관제와 공백 구간을 동시에 비교" },
            { time: "01:42", title: "안전 보강안 생성", status: "예정", detail: "통학 시간대 우선순위와 점검 지점 출력" },
        ],
        comparisonBars: [
            { label: "강서 통학권", before: 82, after: 67, note: "횡단보도 연결 구간 보강" },
            { label: "노원 학원권", before: 75, after: 60, note: "저녁 시간대 분산 효과" },
            { label: "송파 초중권", before: 69, after: 57, note: "보행 축 커버리지 개선" },
            { label: "마포 통학권", before: 58, after: 49, note: "주요 사거리 점검 필요" },
        ],
        actionItems: [
            "강서 통학권은 횡단보도 연결 구간에 우선 반경 보강이 필요합니다.",
            "노원 학원권은 저녁 18시 이후 관제 집중도를 높이는 편이 효율적입니다.",
            "송파 초중권은 기존 장비 유지 상태 점검과 표지 개선을 병행하는 것이 좋습니다.",
        ],
        resultRows: [
            { rank: "1", district: "강서구", count: "1,428", density: "81.3", level: "높음", note: "초등학교 통학권 집중" },
            { rank: "2", district: "노원구", count: "1,214", density: "73.9", level: "보통", note: "학원가 야간 보행권" },
            { rank: "3", district: "송파구", count: "1,086", density: "68.4", level: "보통", note: "잠실 통학권" },
            { rank: "4", district: "마포구", count: "905", density: "54.8", level: "낮음", note: "주요 교차로 위주" },
            { rank: "5", district: "서대문구", count: "764", density: "49.7", level: "낮음", note: "생활권 분산형" },
        ],
        attributeRows: [
            { id: "SCH-011", name: "등굣길 교차로 A", district: "강서구", radius: "500m", status: "정상" },
            { id: "SCH-024", name: "학원가 보행축 B", district: "노원구", radius: "430m", status: "정상" },
            { id: "SCH-038", name: "초중 연계권 C", district: "송파구", radius: "410m", status: "점검" },
            { id: "SCH-044", name: "생활권 사거리 D", district: "마포구", radius: "360m", status: "정상" },
        ],
        statRows: [
            { metric: "통학권 위험구간", baseline: "14", current: "11", change: "-3", result: "감소" },
            { metric: "보행 취약도 평균", baseline: "69.1", current: "58.7", change: "-10.4", result: "감소" },
            { metric: "우선 점검 지점", baseline: "5", current: "9", change: "+4", result: "증가" },
            { metric: "반경 보강 권역", baseline: "2개", current: "3개", change: "+1", result: "확대" },
        ],
        mapZones: [
            { left: "18%", top: "58%", size: 230, tone: "high", tag: "강서" },
            { left: "56%", top: "19%", size: 220, tone: "mid", tag: "노원" },
            { left: "73%", top: "70%", size: 240, tone: "mid", tag: "송파" },
            { left: "34%", top: "47%", size: 160, tone: "normal", tag: "마포" },
        ],
        mapPoints: [
            { left: "18%", top: "55%", tone: "high" },
            { left: "21%", top: "60%", tone: "high" },
            { left: "56%", top: "17%", tone: "mid" },
            { left: "58%", top: "22%", tone: "mid" },
            { left: "73%", top: "67%", tone: "mid" },
            { left: "75%", top: "73%", tone: "mid" },
            { left: "33%", top: "45%", tone: "normal" },
            { left: "36%", top: "49%", tone: "normal" },
        ],
    },
    {
        id: "event-flow",
        badge: "이벤트",
        name: "행사 유동 인구 분산",
        summary: "대형 행사 종료 시점에 맞춰 출구별 유동 인구와 관제 밀도를 비교하고 혼잡 해소안을 설계합니다.",
        impact: "체류 혼잡도 22% 감소",
        metrics: [
            { label: "체류 혼잡도 감소", value: "22%", helper: "행사 종료 30분 기준", tone: "blue" },
            { label: "핵심 출구 권역", value: "3개", helper: "즉시 조정 필요", tone: "amber" },
            { label: "유도 인력 제안", value: "4명", helper: "운영팀 기준", tone: "emerald" },
        ],
        priorityZones: [
            { name: "코엑스 동문", score: 90.5, detail: "행사 종료 직후 체류 밀집", width: "90%", tone: "high" },
            { name: "삼성역 남측", score: 80.1, detail: "승하차 집중 구간", width: "80%", tone: "high" },
            { name: "봉은사역 연결권", score: 69.3, detail: "보행 축 분산 필요", width: "69%", tone: "mid" },
            { name: "무역센터 순환권", score: 57.6, detail: "대기열 정리 필요", width: "57%", tone: "normal" },
        ],
        timeline: [
            { time: "00:00", title: "행사 정보 로드", status: "완료", detail: "행사 종료 시각과 예상 퇴장 인원 반영" },
            { time: "00:21", title: "유동 인구 예측", status: "완료", detail: "출구별 체류 인원과 이동 방향 예측" },
            { time: "00:58", title: "분산 시나리오 계산", status: "진행중", detail: "유도 동선과 관제 밀집도 동시 비교" },
            { time: "01:34", title: "운영안 출력", status: "예정", detail: "출구 우선순위와 인력 배치안 생성" },
        ],
        comparisonBars: [
            { label: "코엑스 동문", before: 91, after: 64, note: "행사 종료 직후 완화" },
            { label: "삼성역 남측", before: 80, after: 60, note: "승하차 집중도 감소" },
            { label: "봉은사 연결권", before: 70, after: 58, note: "보행 분산 효과" },
            { label: "무역센터 순환권", before: 58, after: 49, note: "대기열 정리 필요" },
        ],
        actionItems: [
            "코엑스 동문은 행사 종료 직후 15분 동안 유도 인력을 집중 배치해야 합니다.",
            "삼성역 남측은 안내 사인보다 출구 분산 동선 설계가 더 큰 효과를 냅니다.",
            "봉은사 연결권은 인파가 몰리는 시점에 가변 안내 메시지 적용이 유효합니다.",
        ],
        resultRows: [
            { rank: "1", district: "강남구", count: "1,744", density: "90.5", level: "높음", note: "코엑스 동문 집중" },
            { rank: "2", district: "강남구", count: "1,512", density: "80.1", level: "높음", note: "삼성역 남측 집중" },
            { rank: "3", district: "강남구", count: "1,188", density: "69.3", level: "보통", note: "봉은사 연결축" },
            { rank: "4", district: "강남구", count: "932", density: "57.6", level: "보통", note: "무역센터 순환권" },
            { rank: "5", district: "서초구", count: "618", density: "43.2", level: "낮음", note: "영향권 외곽" },
        ],
        attributeRows: [
            { id: "EVT-008", name: "코엑스 동문 광장", district: "강남구", radius: "520m", status: "정상" },
            { id: "EVT-016", name: "삼성역 남측 출구", district: "강남구", radius: "480m", status: "정상" },
            { id: "EVT-023", name: "봉은사역 연결권", district: "강남구", radius: "430m", status: "점검" },
            { id: "EVT-037", name: "무역센터 순환권", district: "강남구", radius: "390m", status: "정상" },
        ],
        statRows: [
            { metric: "혼잡 출구 수", baseline: "9", current: "6", change: "-3", result: "감소" },
            { metric: "평균 체류 시간", baseline: "24분", current: "18분", change: "-6분", result: "개선" },
            { metric: "유도 인력 필요", baseline: "2명", current: "4명", change: "+2", result: "증가" },
            { metric: "핵심 조정 권역", baseline: "2개", current: "3개", change: "+1", result: "확대" },
        ],
        mapZones: [
            { left: "63%", top: "72%", size: 250, tone: "high", tag: "코엑스" },
            { left: "68%", top: "63%", size: 200, tone: "high", tag: "삼성역" },
            { left: "58%", top: "58%", size: 170, tone: "mid", tag: "봉은사" },
            { left: "72%", top: "54%", size: 150, tone: "normal", tag: "무역센터" },
        ],
        mapPoints: [
            { left: "63%", top: "69%", tone: "high" },
            { left: "66%", top: "74%", tone: "high" },
            { left: "68%", top: "60%", tone: "high" },
            { left: "58%", top: "56%", tone: "mid" },
            { left: "60%", top: "61%", tone: "mid" },
            { left: "73%", top: "52%", tone: "normal" },
            { left: "71%", top: "57%", tone: "normal" },
        ],
    },
];

function ScenarioButton({ item, active, onClick }) {
    return (
        <button
            type="button"
            className={`simulation-test3-scenario-button ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="simulation-test3-scenario-head">
                <strong>{item.name}</strong>
                <span>{item.badge}</span>
            </div>
            <p>{item.summary}</p>
            <div className="simulation-test3-scenario-impact">{item.impact}</div>
        </button>
    );
}

function ToggleRow({ label, checked, onChange }) {
    return (
        <div className="simulation-test3-toggle-row">
            <span>{label}</span>
            <button
                type="button"
                className={`simulation-test3-switch ${checked ? "active" : ""}`}
                onClick={onChange}
                aria-pressed={checked}
            >
                <span></span>
            </button>
        </div>
    );
}

function MetricCard({ item }) {
    return (
        <div className={`simulation-test3-metric-card tone-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
        </div>
    );
}

function PriorityRow({ item }) {
    return (
        <div className="simulation-test3-priority-row">
            <div className="simulation-test3-priority-head">
                <strong>{item.name}</strong>
                <span>{item.score}</span>
            </div>
            <div className="simulation-test3-priority-track">
                <div className={`simulation-test3-priority-bar tone-${item.tone}`} style={{ width: item.width }}></div>
            </div>
            <small>{item.detail}</small>
        </div>
    );
}

function TimelineRow({ item, isLast }) {
    return (
        <div className="simulation-test3-timeline-row">
            <div className="simulation-test3-timeline-time">{item.time}</div>
            <div className="simulation-test3-timeline-axis">
                <div className={`simulation-test3-timeline-dot status-${item.status}`}></div>
                {!isLast && <div className="simulation-test3-timeline-line"></div>}
            </div>
            <div className="simulation-test3-timeline-content">
                <div className="simulation-test3-timeline-status">{item.status}</div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
            </div>
        </div>
    );
}

function ComparisonRow({ item }) {
    return (
        <div className="simulation-test3-compare-row">
            <div className="simulation-test3-compare-head">
                <strong>{item.label}</strong>
                <span>{item.note}</span>
            </div>
            <div className="simulation-test3-compare-bars">
                <div className="simulation-test3-compare-track">
                    <div className="simulation-test3-compare-before" style={{ width: `${item.before}%` }}></div>
                </div>
                <div className="simulation-test3-compare-track">
                    <div className="simulation-test3-compare-after" style={{ width: `${item.after}%` }}></div>
                </div>
            </div>
            <div className="simulation-test3-compare-values">
                <span>전 {item.before}</span>
                <span>후 {item.after}</span>
            </div>
        </div>
    );
}

function ResultChip({ value }) {
    const chipClass =
        value === "높음" || value === "증가"
            ? "high"
            : value === "보통" || value === "개선" || value === "감소"
              ? "mid"
              : value === "정상"
                ? "normal"
                : "low";

    return <span className={`simulation-test3-chip ${chipClass}`}>{value}</span>;
}

function TableCell({ columnKey, value }) {
    if (columnKey === "level" || columnKey === "status" || columnKey === "result") {
        return <ResultChip value={value} />;
    }

    if (columnKey === "change") {
        return <span className={`simulation-test3-change ${String(value).startsWith("+") ? "up" : "down"}`}>{value}</span>;
    }

    return <span>{value}</span>;
}

function UserDatasetSimulationTestPage3() {
    const [selectedScenarioId, setSelectedScenarioId] = useState("night-patrol");
    const [selectedRegion, setSelectedRegion] = useState("서울시 전역");
    const [radius, setRadius] = useState(500);
    const [densityLevel, setDensityLevel] = useState("보통 (10-30개)");
    const [viewMode, setViewMode] = useState("radius");
    const [showLabels, setShowLabels] = useState(true);
    const [showCluster, setShowCluster] = useState(true);
    const [showPriority, setShowPriority] = useState(true);
    const [selectedTab, setSelectedTab] = useState("result");
    const [runCount, setRunCount] = useState(12);
    const [statusText, setStatusText] = useState("현재 설정을 기준으로 실행하면 지도와 결과 카드가 동시에 갱신됩니다.");

    const selectedScenario =
        scenarioOptions.find((scenario) => scenario.id === selectedScenarioId) ||
        scenarioOptions[0];

    const activeColumns =
        selectedTab === "result"
            ? [
                  { key: "rank", label: "순위" },
                  { key: "district", label: "자치구" },
                  { key: "count", label: "CCTV 수" },
                  { key: "density", label: "평균 밀집도" },
                  { key: "level", label: "밀집 수준" },
                  { key: "note", label: "비고" },
              ]
            : selectedTab === "attribute"
              ? [
                    { key: "id", label: "시설 ID" },
                    { key: "name", label: "설치명" },
                    { key: "district", label: "자치구" },
                    { key: "radius", label: "관제 반경" },
                    { key: "status", label: "상태" },
                ]
              : [
                    { key: "metric", label: "지표" },
                    { key: "baseline", label: "기준값" },
                    { key: "current", label: "현재값" },
                    { key: "change", label: "변화" },
                    { key: "result", label: "판정" },
                ];

    const activeRows =
        selectedTab === "result"
            ? selectedScenario.resultRows
            : selectedTab === "attribute"
              ? selectedScenario.attributeRows
              : selectedScenario.statRows;

    const handleReset = () => {
        setSelectedScenarioId("night-patrol");
        setSelectedRegion("서울시 전역");
        setRadius(500);
        setDensityLevel("보통 (10-30개)");
        setViewMode("radius");
        setShowLabels(true);
        setShowCluster(true);
        setShowPriority(true);
        setSelectedTab("result");
        setRunCount(12);
        setStatusText("현재 설정을 기준으로 실행하면 지도와 결과 카드가 동시에 갱신됩니다.");
    };

    const handleRun = () => {
        setRunCount((previous) => previous + 1);
        setStatusText(`${selectedScenario.name} 시나리오가 ${selectedRegion} / 반경 ${radius}m 기준으로 다시 계산되었습니다.`);
    };

    return (
        <div className="container-fluid px-4 py-3 simulation-test3-page">
            <div className="row mb-3">
                <div className="col">
                    <TopTitle
                        title="서울시 CCTV 위치 데이터 시뮬레이션"
                        subTitle="조건 설정, 지도 중심 분석, 결과 비교를 한 화면에서 이어 볼 수 있도록 설계한 시뮬레이션 워크스페이스입니다."
                        showGuide={false}
                    />
                </div>
            </div>

            <div className="simulation-test3-summary-bar">
                <div className="simulation-test3-summary-item">
                    <span>선택 시나리오</span>
                    <strong>{selectedScenario.name}</strong>
                </div>
                <div className="simulation-test3-summary-item">
                    <span>현재 지역</span>
                    <strong>{selectedRegion}</strong>
                </div>
                <div className="simulation-test3-summary-item">
                    <span>실행 횟수</span>
                    <strong>{runCount}회</strong>
                </div>
                <div className="simulation-test3-summary-item">
                    <span>예상 효과</span>
                    <strong>{selectedScenario.impact}</strong>
                </div>
            </div>

            <div className="simulation-test3-workspace">
                <aside className="simulation-test3-left-column">
                    <section className="simulation-test3-panel">
                        <div className="simulation-test3-panel-title">
                            <i className="bi bi-bezier2"></i>
                            <span>시나리오 프리셋</span>
                        </div>

                        <div className="simulation-test3-scenario-list">
                            {scenarioOptions.map((item) => (
                                <ScenarioButton
                                    key={item.id}
                                    item={item}
                                    active={selectedScenarioId === item.id}
                                    onClick={() => setSelectedScenarioId(item.id)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="simulation-test3-panel">
                        <div className="simulation-test3-panel-title">
                            <i className="bi bi-sliders"></i>
                            <span>분석 설정</span>
                        </div>

                        <div className="simulation-test3-field-block">
                            <label className="simulation-test3-label">분석 지역</label>
                            <select
                                className="form-select simulation-test3-select"
                                value={selectedRegion}
                                onChange={(event) => setSelectedRegion(event.target.value)}
                            >
                                {regionOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="simulation-test3-field-block">
                            <label className="simulation-test3-label">밀도 임계값</label>
                            <select
                                className="form-select simulation-test3-select"
                                value={densityLevel}
                                onChange={(event) => setDensityLevel(event.target.value)}
                            >
                                {densityOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="simulation-test3-field-block">
                            <div className="simulation-test3-range-head">
                                <span className="simulation-test3-label mb-0">분석 반경</span>
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
                            <div className="simulation-test3-range-labels">
                                <span>100m</span>
                                <span>500m</span>
                                <span>5000m</span>
                            </div>
                        </div>

                        <div className="simulation-test3-field-block">
                            <div className="simulation-test3-label">지도 표현 방식</div>
                            <div className="simulation-test3-mode-group">
                                {viewModes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        className={`simulation-test3-mode-button ${viewMode === mode.id ? "active" : ""}`}
                                        onClick={() => setViewMode(mode.id)}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="simulation-test3-field-block">
                            <div className="simulation-test3-label">표시 옵션</div>
                            <div className="simulation-test3-toggle-list">
                                <ToggleRow
                                    label="권역 라벨 표시"
                                    checked={showLabels}
                                    onChange={() => setShowLabels((previous) => !previous)}
                                />
                                <ToggleRow
                                    label="클러스터 표시"
                                    checked={showCluster}
                                    onChange={() => setShowCluster((previous) => !previous)}
                                />
                                <ToggleRow
                                    label="우선 권역 강조"
                                    checked={showPriority}
                                    onChange={() => setShowPriority((previous) => !previous)}
                                />
                            </div>
                        </div>

                        <div className="simulation-test3-dataset-box">
                            {datasetInfo.map((item) => (
                                <div key={item.label} className="simulation-test3-dataset-row">
                                    <span>{item.label}</span>
                                    <strong>{item.value}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="simulation-test3-status-box">
                            <i className="bi bi-info-circle-fill"></i>
                            <span>{statusText}</span>
                        </div>

                        <div className="simulation-test3-action-row">
                            <button type="button" className="btn btn-primary simulation-test3-action-button" onClick={handleRun}>
                                <i className="bi bi-play-fill me-2"></i>
                                시뮬레이션 실행
                            </button>
                            <button type="button" className="btn btn-light border simulation-test3-action-button secondary" onClick={handleReset}>
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                초기화
                            </button>
                        </div>
                    </section>
                </aside>

                <main className="simulation-test3-center-column">
                    <section className="simulation-test3-map-panel">
                        <div className="simulation-test3-map-toolbar">
                            <div>
                                <div className="simulation-test3-map-title">지도 중심 분석</div>
                                <div className="simulation-test3-map-subtitle">{selectedScenario.summary}</div>
                            </div>

                            <div className="simulation-test3-map-badges">
                                <span>{selectedScenario.badge}</span>
                                <span>{selectedRegion}</span>
                                <span>{radius}m</span>
                            </div>
                        </div>

                        <div className={`simulation-test3-map-shell mode-${viewMode}`}>
                            <img src={mapPreviewImg} alt="시뮬레이션 지도" className="simulation-test3-map-image" />
                            <div className="simulation-test3-map-overlay"></div>

                            {showLabels &&
                                areaLabels.map((item) => (
                                    <span
                                        key={item.name}
                                        className="simulation-test3-map-label"
                                        style={{ left: item.left, top: item.top }}
                                    >
                                        {item.name}
                                    </span>
                                ))}

                            {selectedScenario.mapZones.map((item) => (
                                <div
                                    key={`${selectedScenario.id}-${item.tag}`}
                                    className={`simulation-test3-map-zone tone-${item.tone} ${showPriority ? "is-emphasis" : ""}`}
                                    style={{
                                        left: item.left,
                                        top: item.top,
                                        width: `${item.size}px`,
                                        height: `${item.size}px`,
                                    }}
                                >
                                    <span>{item.tag}</span>
                                </div>
                            ))}

                            {selectedScenario.mapPoints.map((item, index) => (
                                <span
                                    key={`${selectedScenario.id}-point-${index}`}
                                    className={`simulation-test3-map-point tone-${item.tone}`}
                                    style={{ left: item.left, top: item.top }}
                                ></span>
                            ))}

                            {showCluster &&
                                selectedScenario.mapPoints.slice(0, 4).map((item, index) => (
                                    <span
                                        key={`${selectedScenario.id}-cluster-${index}`}
                                        className="simulation-test3-cluster-badge"
                                        style={{ left: item.left, top: item.top }}
                                    >
                                        {index + 4}
                                    </span>
                                ))}

                            <div className="simulation-test3-map-controls">
                                <button type="button"><i className="bi bi-plus-lg"></i></button>
                                <button type="button"><i className="bi bi-dash-lg"></i></button>
                                <button type="button"><i className="bi bi-crosshair"></i></button>
                                <button type="button"><i className="bi bi-fullscreen"></i></button>
                            </div>

                            <div className="simulation-test3-map-note">
                                <strong>{selectedScenario.name}</strong>
                                <p>{selectedScenario.impact}</p>
                            </div>

                            <div className="simulation-test3-legend">
                                <div className="simulation-test3-legend-title">범례</div>
                                <div className="simulation-test3-legend-row">
                                    <span className="dot high"></span>
                                    <span>우선 조치 권역</span>
                                </div>
                                <div className="simulation-test3-legend-row">
                                    <span className="dot mid"></span>
                                    <span>관찰 권역</span>
                                </div>
                                <div className="simulation-test3-legend-row">
                                    <span className="dot normal"></span>
                                    <span>일반 관제점</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="simulation-test3-lower-grid">
                        <section className="simulation-test3-panel">
                            <div className="simulation-test3-panel-title">
                                <i className="bi bi-journal-text"></i>
                                <span>데이터 컨텍스트</span>
                            </div>
                            <div className="simulation-test3-context-list">
                                {datasetInfo.map((item) => (
                                    <div key={item.label} className="simulation-test3-context-row">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="simulation-test3-panel">
                            <div className="simulation-test3-panel-title">
                                <i className="bi bi-bar-chart-line"></i>
                                <span>전 / 후 비교</span>
                            </div>
                            <div className="simulation-test3-compare-list">
                                {selectedScenario.comparisonBars.map((item) => (
                                    <ComparisonRow key={item.label} item={item} />
                                ))}
                            </div>
                        </section>

                        <section className="simulation-test3-panel">
                            <div className="simulation-test3-panel-title">
                                <i className="bi bi-lightbulb"></i>
                                <span>운영 제안</span>
                            </div>
                            <div className="simulation-test3-action-list">
                                {selectedScenario.actionItems.map((item) => (
                                    <div key={item} className="simulation-test3-action-item">
                                        <i className="bi bi-check2-circle"></i>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="simulation-test3-panel simulation-test3-table-panel">
                        <div className="simulation-test3-table-header">
                            <div className="simulation-test3-panel-title mb-0">
                                <i className="bi bi-table"></i>
                                <span>분석 결과 테이블</span>
                            </div>

                            <button type="button" className="btn btn-light border simulation-test3-export-button">
                                <i className="bi bi-download me-2"></i>
                                CSV 내보내기
                            </button>
                        </div>

                        <div className="simulation-test3-tab-row">
                            {tableTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`simulation-test3-tab-button ${selectedTab === tab.id ? "active" : ""}`}
                                    onClick={() => setSelectedTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="simulation-test3-table-wrap">
                            <table className="table simulation-test3-table mb-0">
                                <thead>
                                    <tr>
                                        {activeColumns.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRows.map((row, rowIndex) => (
                                        <tr key={`row-${rowIndex}`}>
                                            {activeColumns.map((column) => (
                                                <td key={column.key}>
                                                    <TableCell columnKey={column.key} value={row[column.key]} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="simulation-test3-table-footer">
                            <span>전체 25개 중 1-5 표시</span>
                            <div className="simulation-test3-pagination">
                                <button type="button"><i className="bi bi-chevron-left"></i></button>
                                <button type="button" className="active">1</button>
                                <button type="button">2</button>
                                <button type="button">3</button>
                                <button type="button">4</button>
                                <button type="button">5</button>
                                <button type="button"><i className="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="simulation-test3-right-column">
                    <section className="simulation-test3-panel">
                        <div className="simulation-test3-panel-title">
                            <i className="bi bi-stars"></i>
                            <span>결과 스냅샷</span>
                        </div>

                        <div className="simulation-test3-metric-grid">
                            {selectedScenario.metrics.map((item) => (
                                <MetricCard key={item.label} item={item} />
                            ))}
                        </div>
                    </section>

                    <section className="simulation-test3-panel">
                        <div className="simulation-test3-panel-title">
                            <i className="bi bi-geo-alt"></i>
                            <span>우선 권역</span>
                        </div>

                        <div className="simulation-test3-priority-list">
                            {selectedScenario.priorityZones.map((item) => (
                                <PriorityRow key={item.name} item={item} />
                            ))}
                        </div>
                    </section>

                    <section className="simulation-test3-panel">
                        <div className="simulation-test3-panel-title">
                            <i className="bi bi-diagram-3"></i>
                            <span>실행 타임라인</span>
                        </div>

                        <div className="simulation-test3-timeline">
                            {selectedScenario.timeline.map((item, index) => (
                                <TimelineRow
                                    key={`${item.time}-${item.title}`}
                                    item={item}
                                    isLast={index === selectedScenario.timeline.length - 1}
                                />
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default UserDatasetSimulationTestPage3;
