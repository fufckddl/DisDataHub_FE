import { useCallback, useState } from "react";
import DashboardMap from "../components/DashboardMap";
import PopulationPanel from "../components/PopulationPanel";
import {
    getSeoulLivingPopulationByDongLatest,
    getSeoulLivingPopulationBySigunguLatest,
} from "../api/dashBoardApi";
import { getOpenDataEmptyMessage } from "../utils/openDataResponse";
import "./DashboardPage.css";

function TopTitle() {
    return (
        <>
            <div className="row align-items-center mb-3">
                <div className="col">
                    <div className="row">
                        <div className="col">
                            <h2 className="fw-bold mb-2">대시보드</h2>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-light text-secondary">
                                <i className="bi bi-arrow-clockwise me-2" />
                                새로고침
                            </button>
                        </div>
                    </div>
                    <div className="text-secondary" style={{ fontSize: "12px" }}>
                        서울 열린데이터광장 연동 현황과 주요 GIS 데이터 지표를 한눈에 확인할 수 있습니다.
                    </div>
                </div>
            </div>
        </>
    );
}

function DashboardPage() {
    const [selectedArea, setSelectedArea] = useState(null);
    const [populationData, setPopulationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [queryDate, setQueryDate] = useState(null);
    const [populationNotice, setPopulationNotice] = useState(null);

    const fetchSigunguPopulation = useCallback((area) => {
        return getSeoulLivingPopulationBySigunguLatest({
            hour: "00",
            sigunguCode: area.sigunguCode,
        });
    }, []);

    const handleAreaSelect = useCallback(async (area) => {
        setSelectedArea(area);

        if (!area) {
            setPopulationData(null);
            setError(null);
            setQueryDate(null);
            setPopulationNotice(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setQueryDate(null);
        setPopulationNotice(null);

        try {
            let result;

            if (area.level === "SIGUNGU") {
                result = await fetchSigunguPopulation(area);
            } else {
                result = await getSeoulLivingPopulationByDongLatest({
                    hour: "00",
                    areaCode: area.eupmyeondongCode ?? area.areaCode,
                });

                const dongEmptyMessage = getOpenDataEmptyMessage(result.data);
                if (dongEmptyMessage) {
                    result = await fetchSigunguPopulation(area);
                    setPopulationNotice(
                        "선택한 동 경계는 법정동 기준입니다. 행정동 생활인구 코드와 직접 매칭되지 않아 소속 자치구 데이터로 표시합니다."
                    );
                }
            }

            const { data, date } = result;

            const emptyMessage = getOpenDataEmptyMessage(data);
            if (emptyMessage) {
                setPopulationData(null);
                setQueryDate(date);
                setPopulationNotice(null);
                setError(
                    `${emptyMessage} (최근 7일 내 데이터 없음, areaCode=${area.areaCode})`
                );
                return;
            }

            setQueryDate(date);
            setPopulationData(data);
        } catch (err) {
            console.error(err);
            setPopulationData(null);
            setError("생활인구 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [fetchSigunguPopulation]);

    return (
        <>
            <div className="container-fluid px-4 py-3">
                <TopTitle />

                <div className="row mb-3 g-3">
                    <div className="col-lg-8">
                        <DashboardMap onAreaSelect={handleAreaSelect} />
                    </div>
                    <div className="col-lg-4">
                        <PopulationPanel
                            selectedArea={selectedArea}
                            populationData={populationData}
                            queryDate={queryDate}
                            notice={populationNotice}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default DashboardPage;
