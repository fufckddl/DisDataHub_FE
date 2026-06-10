import { useNavigate } from "react-router-dom";
import "../../css/AdminSystemSetting.css";

function SettingTitle({ navigate }) {
    return(
        <div className="admin-system-title-row">
            <div>
                <h1 className="admin-system-title">시스템 설정</h1>
                <p className="admin-system-description">
                    GIS 데이터 플랫폼의 기본 운영 정책을 확인하고 관리합니다.
                </p>
            </div>

            <button
                className="admin-system-home-button bi bi-house-door"
                onClick={() => {
                    navigate("/admin/mainPage");
                }}
            >
                &nbsp;메인화면
            </button>
        </div>
    )
}

function SystemSettingList({ settingList }) {
    return(
        <div className="admin-system-card">
            <table className="admin-system-table">
                <thead>
                    <tr>
                        <th style={{ width: "24%" }}>설정 항목</th>
                        <th style={{ width: "24%" }}>현재 값</th>
                        <th>설명</th>
                    </tr>
                </thead>

                <tbody>
                    {settingList.map((settingData) => (
                        <tr key={settingData.settingName}>
                            <td className="admin-system-setting-name">
                                {settingData.settingName}
                            </td>
                            <td>{settingData.settingValue}</td>
                            <td className="admin-system-setting-description">
                                {settingData.settingDescription}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function SettingListButtomButton({ navigate }) {
    return(
        <div className="admin-system-button-row">
            <button
                className="admin-system-primary-button"
                onClick={() => {
                    navigate("/admin/system/settingUpdate");
                }}
            >
                설정 변경
            </button>
        </div>
    )
}

function SystemSettingListPage() {

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
        <div className="admin-system-page">
            <SettingTitle navigate={navigate} />
            <SystemSettingList settingList={settingList}/>
            <SettingListButtomButton navigate={navigate}/>
        </div>
    )
}

export default SystemSettingListPage;