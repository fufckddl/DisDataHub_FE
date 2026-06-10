import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDashboardSummaryApi,
    getSystemSettingConfigLogListApi,
    getUserManagementLogListApi
} from "../api/adminUserApi";
import "../css/AdminMainPage.css";

function SummaryCard({ title, value, unit, description, icon }) {
    return (
        <div className="admin-main-summary-card">
            <div className="admin-main-summary-icon-box">
                <i className={`${icon} admin-main-summary-icon`}></i>
            </div>

            <div>
                <div className="admin-main-summary-title">{title}</div>

                <div>
                    <span className="admin-main-summary-value">{value}</span>
                    <span className="admin-main-summary-unit">{unit}</span>
                </div>

                <div className="admin-main-summary-description">
                    {description}
                </div>
            </div>
        </div>
    )
}

function SummarySection({ dashboardSummary }) {
    return (
        <div className="row mb-4">
            <div className="col-3">
                <SummaryCard
                    title="전체 사용자"
                    value={dashboardSummary.totalUserCount}
                    unit="명"
                    description="전체 등록된 사용자 수"
                    icon="bi bi-person"
                />
            </div>

            <div className="col-3">
                <SummaryCard
                    title="전체 데이터셋"
                    value={dashboardSummary.totalDatasetCount}
                    unit="개"
                    description="전체 등록된 데이터셋 수"
                    icon="bi bi-database"
                />
            </div>

            <div className="col-3">
                <SummaryCard
                    title="업로드 요청 건수"
                    value={dashboardSummary.uploadRequestCount}
                    unit="건"
                    description="승인 대기 중인 업로드 요청"
                    icon="bi bi-cloud-arrow-up"
                />
            </div>

            <div className="col-3">
                <SummaryCard
                    title="다운로드 건수"
                    value={dashboardSummary.downloadCount}
                    unit="회"
                    description="전체 다운로드 수"
                    icon="bi bi-download"
                />
            </div>
        </div>
    )
}

function FeatureCard({ title, description, icon, movePath }) {
    const navigate = useNavigate();

    return (
        <div className="col-3 mb-3">
            <div className="admin-main-feature-card">
                <div>
                    <div className="admin-main-feature-icon-box">
                        <i className={`${icon} admin-main-feature-icon`}></i>
                    </div>

                    <h5 className="admin-main-feature-title">
                        {title}
                    </h5>

                    <div className="admin-main-feature-description">
                        {description}
                    </div>
                </div>

                <div className="admin-main-feature-button-row">
                    <button
                        className="admin-main-outline-button"
                        onClick={() => {
                            navigate(movePath);
                        }}
                    >
                        바로가기&nbsp;
                        <i className="bi bi-arrow-right" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function FeatureSection() {
    return (
        <div className="admin-main-card">
            <h5 className="admin-main-section-title">
                관리 기능 바로가기
            </h5>

            <div className="row">
                <FeatureCard
                    title="사용자 관리"
                    description="사용자 계정, 권한, 상태를 관리합니다."
                    icon="bi bi-people"
                    movePath="/admin/users/userList"
                />

                <FeatureCard
                    title="데이터 승인 관리"
                    description="업로드된 데이터의 승인 및 반려 처리를 관리합니다."
                    icon="bi bi-clipboard-check"
                    movePath="/upload/admin/approveList"
                />

                <FeatureCard
                    title="데이터 상세 검토"
                    description="업로드된 데이터의 상세 내용을 확인, 검토합니다."
                    icon="bi bi-file-earmark-text"
                    movePath="/upload/admin/approveList/89"
                />

                <FeatureCard
                    title="외부연계 API"
                    description="외부 시스템 연계 API 정보를 관리합니다."
                    icon="bi bi-diagram-3"
                    movePath="/admin/api"
                />

                <FeatureCard
                    title="공지사항 관리"
                    description="공지사항 등록, 수정, 삭제를 관리합니다."
                    icon="bi bi-megaphone"
                    movePath="/admin/board/notice"
                />

                <FeatureCard
                    title="문의사항 목록"
                    description="사용자 문의사항을 확인하고 답변을 관리합니다."
                    icon="bi bi-chat-dots"
                    movePath="/admin/board/inquiry"
                />

                <FeatureCard
                    title="GIS 데이터 오류 제보"
                    description="GIS 데이터 오류 제보 내역을 확인하고 처리합니다."
                    icon="bi bi-exclamation-triangle"
                    movePath="/admin/board/gis-report"
                />

                <FeatureCard
                    title="시스템 설정"
                    description="시스템 환경 설정 및 기본 정책을 관리합니다."
                    icon="bi bi-gear"
                    movePath="/admin/system/settingList"
                />
            </div>
        </div>
    )
}

function UserManagementLogPreviewTable({ userManagementLogList }) {
    const previewLogList = userManagementLogList.slice(0, 5);

    return (
        <table className="admin-main-log-table">
            <thead>
                <tr>
                    <th>로그 ID</th>
                    <th>대상 사용자</th>
                    <th>관리 유형</th>
                    <th>처리 관리자</th>
                    <th>관리 사유</th>
                    <th>처리 일시</th>
                </tr>
            </thead>

            <tbody>
                {previewLogList.map((logData) => (
                    <tr key={logData.logId}>
                        <td>{logData.logId}</td>
                        <td>{logData.targetUsername}</td>
                        <td>{logData.typeName}</td>
                        <td>{logData.adminUsername}</td>
                        <td>{logData.description}</td>
                        <td>{logData.createdAt?.substring(0, 10)}</td>
                    </tr>
                ))}

                {previewLogList.length === 0 && (
                    <tr>
                        <td colSpan="6" className="admin-main-empty">
                            조회된 사용자 관리 로그가 없습니다.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

function SystemSettingLogPreviewTable({ systemSettingConfigLogList }) {
    const previewLogList = systemSettingConfigLogList.slice(0, 5);

    return (
        <table className="admin-main-log-table">
            <thead>
                <tr>
                    <th>로그 ID</th>
                    <th>설정 키</th>
                    <th>변경 전</th>
                    <th>변경 후</th>
                    <th>처리 관리자</th>
                    <th>변경 사유</th>
                    <th>처리 일시</th>
                </tr>
            </thead>

            <tbody>
                {previewLogList.map((logData) => (
                    <tr key={logData.logId}>
                        <td>{logData.logId}</td>
                        <td>{logData.settingKey}</td>
                        <td>{logData.beforeValue}</td>
                        <td>{logData.afterValue}</td>
                        <td>{logData.adminUsername}</td>
                        <td>{logData.description}</td>
                        <td>{logData.createdAt?.substring(0, 10)}</td>
                    </tr>
                ))}

                {previewLogList.length === 0 && (
                    <tr>
                        <td colSpan="7" className="admin-main-empty">
                            조회된 시스템 설정 로그가 없습니다.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

function LogPreviewSection({
    selectedLogType,
    changeSelectedLogType,
    userManagementLogList,
    systemSettingConfigLogList
}) {
    const navigate = useNavigate();

    const moveLogPage = () => {
        if(selectedLogType === "user") {
            navigate("/admin/log/userManagement");
            return;
        }

        if(selectedLogType === "system") {
            navigate("/admin/log/systemSetting");
            return;
        }
    };

    return (
        <div className="admin-main-card">
            <div className="admin-main-log-header">
                <div>
                    <h5 className="admin-main-section-title mb-1">
                        로그 관리
                    </h5>
                    <div className="admin-main-section-description">
                        사용자 관리 및 시스템 설정 변경 이력을 확인합니다.
                    </div>
                </div>

                <button
                    className="admin-main-outline-button"
                    onClick={moveLogPage}
                >
                    로그 전체보기
                </button>
            </div>

            <div className="admin-main-tab-group">
                <button
                    className={
                        selectedLogType === "user"
                            ? "admin-main-tab-button active"
                            : "admin-main-tab-button"
                    }
                    onClick={() => {
                        changeSelectedLogType("user");
                    }}
                >
                    사용자 관리 로그
                </button>

                <button
                    className={
                        selectedLogType === "system"
                            ? "admin-main-tab-button active"
                            : "admin-main-tab-button"
                    }
                    onClick={() => {
                        changeSelectedLogType("system");
                    }}
                >
                    시스템 설정 로그
                </button>
            </div>

            <div className="admin-main-table-wrapper">
                {selectedLogType === "user" && (
                    <UserManagementLogPreviewTable
                        userManagementLogList={userManagementLogList}
                    />
                )}

                {selectedLogType === "system" && (
                    <SystemSettingLogPreviewTable
                        systemSettingConfigLogList={systemSettingConfigLogList}
                    />
                )}
            </div>
        </div>
    )
}

function AdminMainPage() {

    const [selectedLogType, setSelectedLogType] = useState("user");
    const [userManagementLogList, setUserManagementLogList] = useState([]);
    const [systemSettingConfigLogList, setSystemSettingConfigLogList] = useState([]);

    const [dashboardSummary, setDashboardSummary] = useState({
        totalUserCount: 0,
        totalDatasetCount: 0,
        uploadRequestCount: 0,
        downloadCount: 0
    });

    useEffect(() => {
        loadLogData();
        loadDashboardSummary();
    }, []);

    const loadLogData = async () => {
        const userLogResponse = await getUserManagementLogListApi();
        setUserManagementLogList(userLogResponse.data.userManagementLogList);

        const systemLogResponse = await getSystemSettingConfigLogListApi();
        setSystemSettingConfigLogList(systemLogResponse.data.systemSettingConfigLogList);
    };

    const loadDashboardSummary = async () => {
        const response = await getDashboardSummaryApi();
        setDashboardSummary(response.data.dashboardSummary);
    };

    return (
        <div className="admin-main-page">
            <div className="admin-main-title-area">
                <h1 className="admin-main-title">
                    관리자 대시보드
                </h1>
                <p className="admin-main-description">
                    시스템 현황을 확인하고 주요 관리 기능으로 이동할 수 있습니다.
                </p>
            </div>

            <SummarySection
                dashboardSummary={dashboardSummary}
            />

            <FeatureSection />

            <LogPreviewSection
                selectedLogType={selectedLogType}
                changeSelectedLogType={setSelectedLogType}
                userManagementLogList={userManagementLogList}
                systemSettingConfigLogList={systemSettingConfigLogList}
            />
        </div>
    )
}

export default AdminMainPage;