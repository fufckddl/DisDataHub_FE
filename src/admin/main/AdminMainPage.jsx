import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../commons/api/axiosInstance";

function TopCard({ title, value, unit, description, icon, descriptionIcon, descriptionText }) {
    return (
        <div className="top-card border rounded px-3 pt-3 my-2">
            <div className="d-flex align-items-center">
                <div
                    className={`${icon} fs-3 m-1 rounded-circle bg-primary-subtle d-flex justify-content-center align-items-center`}
                    style={{ width: "60px", height: "60px" }}
                />
                <div className="px-2">
                    <div>{title}</div>
                    <div>
                        <span className="fw-bold fs-3">&nbsp;{value}</span>
                        <span>{unit}</span>
                    </div>
                </div>
            </div>

            <p className="d-flex align-items-center ms-3 mb-0">
                <span className="d-flex align-items-center fw-bold">
                    <i className={`${descriptionIcon} fs-4 me-1`}></i>
                    <span className={descriptionText}>{description}</span>
                </span>
                <span className="text-secondary ms-1">(전일 대비)</span>
            </p>
        </div>
    )
}

function TotalTopCard() {
    return (
        <div className="row">
            <div className="col">
                <TopCard
                    title="전체 사용자"
                    value="231"
                    unit=" 명"
                    description="8명"
                    icon="bi bi-person-lines-fill"
                    descriptionIcon="bi bi-arrow-up-short text-success"
                    descriptionText="text-success"
                />
            </div>

            <div className="col">
                <TopCard
                    title="전체 데이터셋"
                    value="913"
                    unit=" 개"
                    description="54개"
                    icon="bi bi-database-fill"
                    descriptionIcon="bi bi-arrow-up-short text-success"
                    descriptionText="text-success"
                />
            </div>

            <div className="col">
                <TopCard
                    title="권한 요청 건수"
                    value="311"
                    unit=" 건"
                    description="12건"
                    icon="bi bi-shield-lock-fill"
                    descriptionIcon="bi bi-arrow-down-short text-danger"
                    descriptionText="text-danger"
                />
            </div>

            <div className="col">
                <TopCard
                    title="업로드 요청 건수"
                    value="53"
                    unit=" 건"
                    description="3건"
                    icon="bi bi-cloud-arrow-up-fill"
                    descriptionIcon="bi bi-arrow-up-short text-success"
                    descriptionText="text-success"
                />
            </div>

            <div className="col">
                <TopCard
                    title="오늘 다운로드"
                    value="423"
                    unit=" 회"
                    description="29회"
                    icon="bi bi-download"
                    descriptionIcon="bi bi-arrow-down-short text-danger"
                    descriptionText="text-danger"
                />
            </div>
        </div>
    )
}

function BoardCard({ title, sortReason, movePath, children }) {
    const navigate = useNavigate();

    return (
        <div className="border rounded px-4 py-2 my-1 align-items-center" style={{ minHeight: "16em" }}>
            <div className="row align-items-center">
                <div className="col-auto p-0 fw-bold" style={{ fontSize: "1.1em" }}>
                    {title}
                </div>

                <span className="col">
                    {sortReason}
                </span>

                {movePath && (
                    <button
                        onClick={() => navigate(movePath)}
                        className="col-auto btn btn-outline-primary px-2 py-1"
                        style={{ fontSize: "0.7em" }}
                    >
                        자세히 보기
                    </button>
                )}
            </div>

            <div className="mt-2 overflow-auto">
                {children}
            </div>
        </div>
    )
}

function UserManagementCard({ userList }) {
    const recentUserList = [...userList]
        .sort((firstUser, secondUser) => secondUser.id - firstUser.id)
        .slice(0, 4);

    const getRoleText = (role) => {
        if(role === "ADMIN") return "관리자";
        if(role === "RESEARCHER") return "연구자";
        return "사용자";
    };

    return (
        <BoardCard title="사용자 관리" sortReason="(최근 가입 순)" movePath="/admin/users/userList">
            <table className="table table-sm text-center m-0 small">
                <thead className="bg-primary-subtle">
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>역할</th>
                        <th>가입일</th>
                    </tr>
                </thead>

                <tbody>
                    {recentUserList.map((userData) => (
                        <tr key={userData.id}>
                            <td>{userData.id}</td>
                            <td>{userData.username}</td>
                            <td>{getRoleText(userData.role)}</td>
                            <td>{userData.created_at?.substring(0, 10)}</td>
                        </tr>
                    ))}

                    {recentUserList.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-secondary py-4">
                                조회된 사용자가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </BoardCard>
    )
}

function SystemSettingCard({ systemSettingList }) {
    const previewSettingList = systemSettingList.slice(0, 4);

    const getEditableBadge = (isEditable) => {

        if(isEditable) {
            return (
                <span className="badge text-bg-success">
                    변경 가능
                </span>
            );
        }

        return (
            <span className="badge text-bg-danger">
                변경 불가
            </span>
        );

    };

    return (
        <BoardCard title="시스템 설정" movePath="/admin/system/settingList">
            <table className="table table-sm text-center m-0 small">
                <thead className="bg-primary-subtle">
                    <tr>
                        <th>설정명</th>
                        <th>설정 값</th>
                        <th>변경</th>
                    </tr>
                </thead>

                <tbody>
                    {previewSettingList.map((settingData) => (
                        <tr key={settingData.settingKey}>
                            <td>{settingData.settingName}</td>
                            <td>{settingData.settingValue}</td>
                            <td>{getEditableBadge(settingData.isEditable)}</td>
                        </tr>
                    ))}

                    {previewSettingList.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-secondary py-4">
                                조회된 설정이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </BoardCard>
    )
}

function EmptyBoardCard({ title, sortReason, text }) {
    return (
        <BoardCard title={title} sortReason={sortReason}>
            <div className="text-secondary py-5 text-center">
                {text}
            </div>
        </BoardCard>
    )
}

function TotalBoardCard({ userList, systemSettingList }) {
    return (
        <>
            <div className="row">
                <div className="col-4">
                    <UserManagementCard userList={userList} />
                </div>

                <div className="col-4">
                    <EmptyBoardCard title="게시판 관리" sortReason="(추후 연동)" text="게시판 관리 데이터는 추후 연동 예정입니다." />
                </div>

                <div className="col-4">
                    <EmptyBoardCard title="단어표준 관리" sortReason="(추후 연동)" text="단어표준 관리 데이터는 추후 연동 예정입니다." />
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <SystemSettingCard systemSettingList={systemSettingList} />
                </div>

                <div className="col-4">
                    <EmptyBoardCard title="외부연계 API" sortReason="(추후 연동)" text="외부연계 API 데이터는 추후 연동 예정입니다." />
                </div>

                <div className="col-4">
                    <EmptyBoardCard title="요청 관리" sortReason="(추후 연동)" text="요청 관리 데이터는 추후 연동 예정입니다." />
                </div>
            </div>
        </>
    )
}

function LogBoardCard({ moveLogPage, children }) {
    return (
        <div className="border rounded px-4 py-2 my-1 align-items-center" style={{ minHeight: "16em" }}>
            <div className="row align-items-center">
                <div className="col-auto p-0 fw-bold" style={{ fontSize: "1.1em" }}>
                    로그 관리
                </div>

                <span className="col">
                    (최근 활동 순)
                </span>

                <button
                    onClick={moveLogPage}
                    className="col-auto btn btn-outline-primary px-2 py-1"
                    style={{ fontSize: "0.7em" }}
                >
                    로그 전체보기
                </button>
            </div>

            <div className="mt-2 overflow-auto">
                {children}
            </div>
        </div>
    )
}

function TotalLogBoardCard() {
    const navigate = useNavigate();

    const [selectedLogType, setSelectedLogType] = useState("user");

    const moveLogPage = () => {
        if(selectedLogType === "user") {
            navigate("/admin/log/userManagement");
            return;
        }

        if(selectedLogType === "system") {
            navigate("/admin/log/systemSetting");
            return;
        }

        if(selectedLogType === "download") {
            navigate("/admin/log/download");
            return;
        }
    };

    return (
        <div className="row">
            <div className="col-12">
                <LogBoardCard moveLogPage={moveLogPage}>
                    <div className="btn-group mb-3" role="group">
                        <button
                            className={`btn btn-sm rounded-0 ${selectedLogType === "user" ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => setSelectedLogType("user")}
                        >
                            사용자 관리 로그
                        </button>

                        <button
                            className={`btn btn-sm rounded-0 ${selectedLogType === "system" ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => setSelectedLogType("system")}
                        >
                            시스템 설정 로그
                        </button>

                        <button
                            className={`btn btn-sm rounded-0 ${selectedLogType === "download" ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => setSelectedLogType("download")}
                        >
                            다운로드 로그
                        </button>
                    </div>

                    <div className="text-secondary py-4 text-center">
                        로그 미리보기는 추후 연동 예정입니다.
                    </div>
                </LogBoardCard>
            </div>
        </div>
    )
}

function AdminMainPage() {
    const [userList, setUserList] = useState([]);
    const [systemSettingList, setSystemSettingList] = useState([]);

    useEffect(() => {
        loadAdminMainData();
    }, []);

    const loadAdminMainData = async () => {
        const userResponse = await axiosInstance.get("/api/admin/users/findUserList");
        setUserList(userResponse.data.userList);

        const settingResponse = await axiosInstance.get("/api/admin/systemSetting/list");
        setSystemSettingList(settingResponse.data.systemSettingList);
    };

    return (
        <div className="row justify-content-center mt-3 mb-4">
            <div className="col-10">
                <h3 className="fs-4 fw-bold">관리자 대시보드</h3>

                <TotalTopCard userList={userList} />
                <TotalBoardCard
                    userList={userList}
                    systemSettingList={systemSettingList}
                />
                <TotalLogBoardCard />
            </div>
        </div>
    )
}

export default AdminMainPage;