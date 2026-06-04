import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSystemSettingConfigLogApi } from "../../api/adminUserApi";

function SettingUpdateTitle({ navigate }) {
    return (
        <>
            <div className="row mb-4 mt-3 align-items-center">
                <div className="col">
                    <h3 className="fw-bold mb-1">시스템 설정 변경</h3>
                    <div className="text-secondary">
                        GIS 데이터 플랫폼의 운영 정책 및 시스템 환경을 관리하는 페이지입니다. 시스템의 핵심이 되는 설정은 관리자에 의해 보호되며, 수정이 제한됩니다.
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

function UploadPolicyCard({ settingData, changeSettingData }) {
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

                    <div className="text-secondary small mt-1">
                        단일 파일 기준 최대 업로드 가능 크기입니다.
                    </div>
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

                    <div className="text-secondary small mt-1">
                        쉼표(,) 기준으로 파일 확장자를 구분하여 입력합니다.
                    </div>
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
                    <select className="form-select shadow-none" value={settingData.defaultSaveCoordinate} disabled>
                        <option>EPSG:4326</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">기본 분석 좌표계</label>
                    <select className="form-select shadow-none" value={settingData.defaultAnalysisCoordinate} disabled>
                        <option>EPSG:5179</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">지도 기본 중심 좌표</label>
                    <input
                        type="text"
                        className="form-control shadow-none"
                        value={settingData.defaultMapCenter}
                        disabled
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">다운로드 로그인 필수 여부</label>

                    <div className="form-check form-switch">
                        <input
                            className="form-check-input shadow-none"
                            type="checkbox"
                            checked={settingData.downloadLoginRequired}
                            disabled
                        />

                        <label className="form-check-label">
                            로그인 사용자만 다운로드 허용
                        </label>
                    </div>
                </div>

                <div>
                    <label className="form-label fw-bold">미리보기 최대 피쳐 수</label>

                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control shadow-none"
                            value={settingData.maxPreviewFeatureCount}
                            disabled
                        />

                        <span className="input-group-text">건</span>
                    </div>
                </div>

                <div className="text-secondary small mt-4">
                    <span style={{color: "#f57d7d"}}>*</span>
                    시스템의 핵심 설정입니다. 변경할 수 없습니다.
                </div>
            </SettingCard>
        </div>
    )
}

function DownloadPolicyCard({ settingData, changeSettingData }) {
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

                    <div className="text-secondary small mt-1">
                        일반 사용자의 하루 최대 다운로드 가능 횟수입니다.
                    </div>
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
                            <th className="table-light text-secondary">다운로드 로그인 필수 여부</th>
                            <td>{settingData.downloadLoginRequired ? "활성" : "비활성"}</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">일반 사용자 일일 다운로드 제한</th>
                            <td>{settingData.dailyDownloadLimit}회</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">지도 기본 중심 좌표</th>
                            <td>{settingData.defaultMapCenter}</td>
                        </tr>
                        <tr>
                            <th className="table-light text-secondary">미리보기 최대 피쳐 수</th>
                            <td>{settingData.maxPreviewFeatureCount}건</td>
                        </tr>
                    </tbody>
                </table>
            </SettingCard>
        </div>
    )
}

function SettingButtonSection({ navigate, settingData }) {

    const saveSystemSettingLog = async () => {

        const logData = {
            adminUserId: 1,
            settingKey: "maxUploadFileSize",
            beforeValue: "300",
            afterValue: String(settingData.maxUploadFileSize),
            description: "최대 업로드 파일 크기 변경"
        };

        const response = await registerSystemSettingConfigLogApi(logData);

        if(response.data.result === true) {
            alert("시스템 설정이 저장되었습니다.");
            navigate("/admin/system/settingList");
            return;
        }

        alert("설정 저장에 실패했습니다.");
    };

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

                <div className="col d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                            navigate("/admin/system/settingList");
                        }}
                    >
                        취소
                    </button>

                    <button
                        className="btn btn-outline-primary"
                        onClick={saveSystemSettingLog}
                    >
                        설정 저장
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
        downloadLoginRequired: true,
        dailyDownloadLimit: 20,
        defaultMapCenter: "서울",
        maxPreviewFeatureCount: 1000
    });

    const changeSettingData = (event) => {

        const settingName = event.target.name;
        const settingValue = event.target.value;

        setSettingData({
            ...settingData,
            [settingName]: settingValue
        });

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
                        />

                        <CoordinatePolicyCard
                            settingData={settingData}
                        />
                    </div>

                    <div className="row mb-3">
                        <DownloadPolicyCard
                            settingData={settingData}
                            changeSettingData={changeSettingData}
                        />

                        <SettingPreviewCard
                            settingData={settingData}
                        />
                    </div>

                    <SettingButtonSection
                        navigate={navigate}
                        settingData={settingData}
                    />
                </div>
            </div>
        </>
    )
}

export default SystemSettingUpdatePage;