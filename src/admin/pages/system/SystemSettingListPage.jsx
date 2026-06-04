import { useNavigate } from "react-router-dom";

function SettingTitle({ navigate }) {
    return(
        <>
            <div className="row mb-4 mt-3 align-items-center">
                <div className="col">
                    <h3 className="fw-bold mb-1">시스템 설정</h3>
                    <div className="text-secondary">
                        GIS 데이터 플랫폼의 기본 운영 정책을 확인하고 관리합니다.
                    </div>
                </div>
                <div className="col-auto">
                    <button
                        className="btn border-0 text-black bi bi-house-door"
                        onClick={() => {
                            navigate("/admin/mainPage");
                        }}
                    >
                        &nbsp;메인화면
                    </button>
                </div>
            </div>
        </>
    )
}

function SystemSettingList ({ settingList }) {

    return(
        <>
            <div className="row justify-content-center">
                <div className="col">

                    <div className="row">
                        <div className="col">
                            <div className="border rounded py-4 px-5">
                                <table className="table align-middle mb-0">
                                    <thead className="table">
                                        <tr style={{borderTop : "3px solid #000000"}}>
                                            <th style={{width : "20em"}}>설정 항목</th>
                                            <th style={{borderLeft: "1px solid #2e303191", borderRight: "1px solid #2e303191"}}>현재 값</th>
                                            <th>설명</th>
                                        </tr>
                                    </thead>

                                    <tbody className="table-group-divider">
                                        {settingList.map((settingData) => (
                                            <tr key={settingData.settingName} style={{borderBottom: "1px solid #6d6e6e91"}}>
                                                <td className="fw-bold">{settingData.settingName}</td>
                                                <td style={{borderLeft: "1px solid #2e303191", borderRight: "1px solid #2e303191"}}>{settingData.settingValue}</td>
                                                <td className="text-secondary">{settingData.settingDescription}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function SettingListButtomButton ({ navigate }) {
    return(
        <>
            <div className="row mt-2">
                <div className="col d-flex justify-content-end gap-2">

                    <button
                        className="btn btn-outline-primary border-2"
                        onClick={() => {

                            // 나중에 실제 DB 연동 시 사용 예정
                            // axiosInstance.post("/api/admin/system/setting/update", settingData);

                            navigate("/admin/system/settingUpdate");
                        }}
                    >
                        설정 변경
                    </button>
                </div>
            </div>
        </>
    )
}

function SystemSettingListPage () {

    const navigate = useNavigate();

    const settingList = [
        {
            settingName: "최대 업로드 파일 크기",
            settingValue: "300MB",
            settingDescription: "사용자가 업로드할 수 있는 단일 파일의 최대 크기"
        },
        {
            settingName: "허용 파일 확장자",
            settingValue: "csv, xlsx, geojson, zip",
            settingDescription: "시스템에서 업로드를 허용하는 파일 형식"
        },
        {
            settingName: "기본 저장 좌표계",
            settingValue: "EPSG:4326",
            settingDescription: "데이터 저장 시 기본으로 적용되는 좌표계"
        },
        {
            settingName: "기본 분석 좌표계",
            settingValue: "EPSG:5179",
            settingDescription: "공간 분석 시 기본으로 적용되는 좌표계"
        },
        {
            settingName: "다운로드 로그인 필수 여부",
            settingValue: "true",
            settingDescription: "비로그인 사용자의 다운로드 가능 여부"
        },
        {
            settingName: "일반 사용자 일일 다운로드 제한",
            settingValue: "20회",
            settingDescription: "일반 사용자의 하루 최대 다운로드 횟수"
        },
        {
            settingName: "지도 기본 중심 좌표",
            settingValue: "서울",
            settingDescription: "지도 최초 진입 시 표시되는 기본 중심 위치"
        },
        {
            settingName: "미리보기 최대 피쳐 수",
            settingValue: "1000건",
            settingDescription: "데이터 미리보기 시 표시 가능한 최대 피쳐 수"
        }
    ];

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-8">
                    <SettingTitle navigate={navigate} />
                    <SystemSettingList settingList={settingList}/>
                    <SettingListButtomButton navigate={navigate}/>
                </div>
            </div>
        </>
    )
}

export default SystemSettingListPage;