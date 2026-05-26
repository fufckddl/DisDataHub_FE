import { useCallback, useState } from "react";
import DashboardMap from "../components/DashboardMap";
import PopulationPanel from "../components/PopulationPanel";
import { getAreaPopulation } from "../api/dashBoardApi";
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
            const data = await getAreaPopulation({
                hour: "00",
                areaCode: area.areaCode,
            });

            setQueryDate(data.baseDate);
            setPopulationData(data);
        } catch (err) {
            console.error(err);
            setPopulationData(null);
            if (err.response?.status === 404) {
                setError(`DB에 저장된 생활인구 데이터가 없습니다. (areaCode=${area.areaCode})`);
                return;
            }
            setError("생활인구 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

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
