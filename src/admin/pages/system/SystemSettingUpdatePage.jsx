import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateSystemSettingApi } from "../../api/adminUserApi";

function SettingUpdateTitle({ navigate }) {
    return (
        <>
            <div className="row mb-4 mt-3 align-items-center">
                <div className="col">
                    <h3 className="fw-bold mb-1">시스템 설정 변경</h3>
                    <div className="text-secondary">
                        GIS 데이터 플랫폼의 운영 정책 및 시스템 환경을 관리하는 페이지입니다.
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

function SettingCard({ title, description, children }) {
    return (
        <div className="border rounded p-4 h-100">
            <h5 className="fw-bold mb-1">{title}</h5>
            <div className="text-secondary small mb-4">{description}</div>
            {children}
        </div>
    )
}

function UploadPolicyCard({ settingData, changeSettingData, saveSystemSetting }) {
    return (
        <div className="col-6">
            <SettingCard
                title="파일 업로드 정책"
                description="업로드 가능한 파일 형식 및 파일 크기 제한 정책을 설정합니다."
            >
                <div className="mb-4">
                    <label className="form-label fw-bold">최대 업로드 파일 크기</label>

                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control shadow-none"
                            name="maxUploadFileSize"
                            value={settingData.maxUploadFileSize}
                            onChange={changeSettingData}
                        />
                        <span className="input-group-text">MB</span>
                    </div>

                    <button
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => {
                            saveSystemSetting(
                                "maxUploadFileSize",
                                settingData.maxUploadFileSize,
                                "최대 업로드 파일 크기 변경"
                            );
                        }}
                    >
                        저장
                    </button>
                </div>

                <div>
                    <label className="form-label fw-bold">허용 파일 확장자</label>

                    <input
                        type="text"
                        className="form-control shadow-none"
                        name="allowedFileExtension"
                        value={settingData.allowedFileExtension}
                        onChange={changeSettingData}
                    />

                    <button
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => {
                            saveSystemSetting(
                                "allowedFileExtension",
                                settingData.allowedFileExtension,
                                "허용 파일 확장자 변경"
                            );
                        }}
                    >
                        저장
                    </button>
                </div>
            </SettingCard>
        </div>
    )
}

function DownloadPolicyCard({ settingData, changeSettingData, saveSystemSetting }) {
    return (
        <div className="col-6">
            <SettingCard
                title="다운로드 정책"
                description="일반 사용자 대상 다운로드 제한 정책을 설정합니다."
            >
                <div>
                    <label className="form-label fw-bold">
                        일반 사용자 일일 다운로드 제한
                    </label>

                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control shadow-none"
                            name="dailyDownloadLimit"
                            value={settingData.dailyDownloadLimit}
                            onChange={changeSettingData}
                        />
                        <span className="input-group-text">회</span>
                    </div>

                    <button
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => {
                            saveSystemSetting(
                                "dailyDownloadLimit",
                                settingData.dailyDownloadLimit,
                                "일반 사용자 일일 다운로드 제한 변경"
                            );
                        }}
                    >
                        저장
                    </button>
                </div>
            </SettingCard>
        </div>
    )
}

function CoordinatePolicyCard({ settingData }) {
    return (
        <div className="col-6">
            <SettingCard
                title="좌표계 및 지도 설정"
                description="시스템 핵심 좌표계 및 지도 기준 정보를 확인합니다."
            >
                <div className="mb-3">
                    <label className="form-label fw-bold">기본 저장 좌표계</label>
                    <input
                        type="text"
                        className="form-control shadow-none"
                        value={settingData.defaultSaveCoordinate}
                        disabled
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">기본 분석 좌표계</label>
                    <input
                        type="text"
                        className="form-control shadow-none"
                        value={settingData.defaultAnalysisCoordinate}
                        disabled
                    />
                </div>

                <div>
                    <label className="form-label fw-bold">지도 기본 중심 좌표</label>
                    <input
                        type="text"
                        className="form-control shadow-none"
                        value={settingData.defaultMapCenter}
                        disabled
                    />
                </div>

                <div className="text-secondary small mt-4">
                    <span style={{ color: "#f57d7d" }}>*</span>
                    좌표계 및 지도 기준 설정은 변경할 수 없습니다.
                </div>
            </SettingCard>
        </div>
    )
}

function SettingPreviewCard({ settingData }) {
    return (
        <div className="col-6">
            <SettingCard
                title="설정 미리보기"
                description="현재 입력된 시스템 설정값을 확인합니다."
            >
                <table className="table table-bordered align-middle mb-0">
                    <tbody>
                        <tr>
                            <th className="table-light text-secondary w-50">최대 업로드 파일 크기</th>
                            <td>{settingData.maxUploadFileSize}MB</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">허용 파일 확장자</th>
                            <td>{settingData.allowedFileExtension}</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">기본 저장 좌표계</th>
                            <td>{settingData.defaultSaveCoordinate}</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">기본 분석 좌표계</th>
                            <td>{settingData.defaultAnalysisCoordinate}</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">일반 사용자 일일 다운로드 제한</th>
                            <td>{settingData.dailyDownloadLimit}회</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">지도 기본 중심 좌표</th>
                            <td>{settingData.defaultMapCenter}</td>
                        </tr>
                    </tbody>
                </table>
            </SettingCard>
        </div>
    )
}

function SettingButtonSection({ navigate }) {
    return (
        <>
            <div className="row">
                <div className="col">
                    <button
                        className="btn btn-outline-secondary border-2 text-black bi bi-chevron-left"
                        onClick={() => {
                            navigate("/admin/system/settingList");
                        }}
                    >
                        &nbsp;목록으로
                    </button>
                </div>
            </div>
        </>
    )
}

function SystemSettingUpdatePage() {

    const navigate = useNavigate();

    const [settingData, setSettingData] = useState({
        maxUploadFileSize: 300,
        allowedFileExtension: "csv, xlsx, geojson, zip",
        defaultSaveCoordinate: "EPSG:4326",
        defaultAnalysisCoordinate: "EPSG:5179",
        dailyDownloadLimit: 20,
        defaultMapCenter: "서울"
    });

    const changeSettingData = (event) => {

        const settingName = event.target.name;
        const settingValue = event.target.value;

        setSettingData({
            ...settingData,
            [settingName]: settingValue
        });

    };

    const saveSystemSetting = async (settingKey, afterValue, description) => {

        const requestData = {
            settingKey: settingKey,
            afterValue: String(afterValue),
            description: description
        };

        const response = await updateSystemSettingApi(requestData);

        if(response.data.result === "success") {
            alert("시스템 설정이 저장되었습니다.");
            return;
        }

        alert("설정 저장에 실패했습니다.");
    };

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-8">
                    <SettingUpdateTitle navigate={navigate} />

                    <div className="row mb-3">
                        <UploadPolicyCard
                            settingData={settingData}
                            changeSettingData={changeSettingData}
                            saveSystemSetting={saveSystemSetting}
                        />

                        <DownloadPolicyCard
                            settingData={settingData}
                            changeSettingData={changeSettingData}
                            saveSystemSetting={saveSystemSetting}
                        />
                    </div>

                    <div className="row mb-3">
                        <CoordinatePolicyCard
                            settingData={settingData}
                        />

                        <SettingPreviewCard
                            settingData={settingData}
                        />
                    </div>

                    <SettingButtonSection
                        navigate={navigate}
                    />
                </div>
            </div>
        </>
    )
}

export default SystemSettingUpdatePage;