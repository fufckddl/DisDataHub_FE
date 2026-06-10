import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosInstance";
import "../../css/AdminUserManagement.css";

function UserDetailTitle({ navigate }) {
    return (
        <div className="admin-user-title-row">
            <div>
                <h1 className="admin-user-title">
                    사용자 상세 정보
                </h1>

                <p className="admin-user-description">
                    사용자 기본 정보와 활동 내역을 확인할 수 있습니다.
                </p>
            </div>

            <button
                className="admin-user-home-button bi bi-house-door"
                onClick={() => {
                    navigate("/admin/mainPage");
                }}
            >
                &nbsp;메인화면
            </button>
        </div>
    )
}

function UserSummaryCard({ userDetail, getRoleText, getStatusClassName, getStatusText }) {
    return (
        <div className="admin-user-detail-summary-card">
            <div>
                <div className="admin-user-detail-name">
                    {userDetail.username}
                </div>

                <div className="admin-user-detail-email">
                    {userDetail.email}
                </div>
            </div>

            <div>
                <span className="badge text-bg-primary fs-6 me-2">
                    {getRoleText(userDetail.role)}
                </span>

                <span className={`${getStatusClassName(userDetail.status)} fs-6`}>
                    {getStatusText(userDetail.status)}
                </span>
            </div>
        </div>
    )
}

function BasicInfoCard({ userDetail, getRoleText, getStatusClassName, getStatusText }) {
    return (
        <div className="col-6">
            <div className="admin-user-detail-card">
                <h5 className="admin-user-detail-card-title">
                    기본 정보
                </h5>

                <table className="admin-user-detail-table">
                    <tbody>
                        <tr>
                            <th>사용자 ID</th>
                            <td>{userDetail.id}</td>
                        </tr>

                        <tr>
                            <th>사용자명</th>
                            <td>{userDetail.username}</td>
                        </tr>

                        <tr>
                            <th>이메일</th>
                            <td>{userDetail.email}</td>
                        </tr>

                        <tr>
                            <th>역할</th>
                            <td>{getRoleText(userDetail.role)}</td>
                        </tr>

                        <tr>
                            <th>상태</th>
                            <td>
                                <span className={getStatusClassName(userDetail.status)}>
                                    {getStatusText(userDetail.status)}
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <th>소속</th>
                            <td>{userDetail.organization}</td>
                        </tr>

                        <tr>
                            <th>가입일</th>
                            <td>{userDetail.created_at?.substring(0, 10)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function getRoleActivityList(userDetail) {

    if(userDetail.role === "ADMIN") {
        return [
            { title: "사용자 관리", value: userDetail.userManageCount ?? 18, unit: "회" },
            { title: "게시글 관리", value: userDetail.boardManageCount ?? 27, unit: "회" },
            { title: "권한 변경 승인", value: userDetail.roleApproveCount ?? 9, unit: "건" },
            { title: "데이터 접근 승인", value: userDetail.dataAccessApproveCount ?? 14, unit: "건" },
            { title: "카테고리 관리", value: userDetail.categoryManageCount ?? 6, unit: "회" }
        ];
    }

    if(userDetail.role === "RESEARCHER") {
        return [
            { title: "데이터 업로드", value: userDetail.uploadCount, unit: "건" },
            { title: "데이터 다운로드", value: userDetail.downloadCount, unit: "회" },
            { title: "접근 요청", value: userDetail.requestCount, unit: "건" },
            { title: "분석 데이터 열람", value: userDetail.viewCount ?? 43, unit: "회" },
            { title: "반려된 요청", value: userDetail.rejectCount ?? 2, unit: "건" }
        ];
    }

    return [
        { title: "데이터 열람", value: userDetail.viewCount, unit: "회" },
        { title: "데이터 다운로드", value: userDetail.downloadCount, unit: "회" },
        { title: "접근 요청", value: userDetail.requestCount, unit: "건" },
        { title: "데이터 조회", value: userDetail.viewCount ?? 31, unit: "회" },
        { title: "문의 등록", value: userDetail.qnaCount ?? 3, unit: "건" }
    ];
}

function ActivityInfoCard({ userDetail }) {

    const activityList = getRoleActivityList(userDetail);

    return (
        <div className="col-6">
            <div className="admin-user-detail-card">
                <h5 className="admin-user-detail-card-title">
                    활동 정보
                </h5>

                <table className="admin-user-detail-table text-center">
                    <thead>
                        <tr>
                            <th>활동 항목</th>
                            <th>수치</th>
                        </tr>
                    </thead>

                    <tbody>
                        {activityList.map((activityData) => (
                            <tr key={activityData.title}>
                                <td className="admin-user-detail-muted">
                                    {activityData.title}
                                </td>

                                <td>
                                    <span className="admin-user-detail-count">
                                        {activityData.value}
                                    </span>
                                    <span className="ms-1">
                                        {activityData.unit}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="admin-user-detail-guide">
                    최근 30일 기준 사용자 역할별 활동 통계입니다.
                </div>
            </div>
        </div>
    )
}

function DetailInfoSection({ userDetail, getRoleText, getStatusClassName, getStatusText }) {
    return (
        <div className="row mb-3">
            <BasicInfoCard
                userDetail={userDetail}
                getRoleText={getRoleText}
                getStatusClassName={getStatusClassName}
                getStatusText={getStatusText}
            />

            <ActivityInfoCard
                userDetail={userDetail}
            />
        </div>
    )
}

function DetailButtonSection({ navigate }) {
    return (
        <div className="admin-user-detail-button-row">
            <button
                className="admin-user-home-button bi bi-chevron-left"
                onClick={() => {
                    navigate("/admin/users/userList");
                }}
            >
                &nbsp;목록으로
            </button>

            <div className="d-flex gap-2">
                <button
                    className="admin-user-danger-button"
                    onClick={() => {
                        alert("정말 이 작업을 실행하시겠습니까? 복구할 수 없습니다.");
                        navigate("/admin/users/userList");
                    }}
                >
                    계정 삭제
                </button>

                <button
                    className="admin-user-primary-button"
                    data-bs-toggle="modal"
                    data-bs-target="#userManageModal"
                >
                    사용자 관리
                </button>
            </div>
        </div>
    )
}

function UserManageModal({ userDetail, loadUserDetail }) {

    const [selectedStatus, setSelectedStatus] = useState("ACTIVATE");
    const [description, setDescription] = useState("");

    return (
        <div
            className="modal fade"
            id="userManageModal"
            tabIndex="-1"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">
                            사용자 상태 변경
                        </h5>

                        <button
                            type="button"
                            className="btn-close shadow-none"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>

                    <div className="modal-body">
                        <div className="admin-user-modal-target">
                            <div className="fw-bold">
                                {userDetail.username}
                            </div>

                            <div className="text-secondary small">
                                {userDetail.email}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                적용할 관리
                            </label>
                            <select
                                className="form-select shadow-none"
                                value={selectedStatus}
                                onChange={(e) => {setSelectedStatus(e.target.value)}}
                            >
                                <option value="ACTIVATE">활성</option>
                                <option value="INACTIVATE">비활성</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label fw-bold">
                                관리 사유
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) => {setDescription(e.target.value)}}
                                style={{resize: "none"}}
                                className="form-control shadow-none"
                                rows="5"
                                placeholder="관리 적용 사유를 입력하세요."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-dismiss="modal"
                            onClick={async () => {
                                const statusTypeIdMap = {
                                    ACTIVATE: 1,
                                    INACTIVATE: 2
                                };

                                const requestData = {
                                    targetUserId: userDetail.id,
                                    typeId: statusTypeIdMap[selectedStatus],
                                    description: description
                                };

                                const response = await axiosInstance.post(
                                    `/api/admin/users/applyUserManagement?status=${selectedStatus}`,
                                    requestData
                                );

                                if(response.data.result === "success") {
                                    alert("사용자 관리가 적용되었습니다.");
                                    loadUserDetail();
                                }
                            }}
                        >
                            적용
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

function EmptyUserDetail({ navigate }) {
    return (
        <div className="admin-user-page">
            <div className="admin-user-card admin-user-empty-detail">
                <div className="text-secondary">
                    사용자 정보를 찾을 수 없습니다.
                </div>

                <button
                    className="admin-user-home-button mt-3"
                    onClick={() => {
                        navigate("/admin/users/userList");
                    }}
                >
                    목록으로
                </button>
            </div>
        </div>
    )
}

function UserDetailPage () {

    const params = useParams();
    const navigate = useNavigate();

    const id = params.id;

    const [userDetail, setUserDetail] = useState(null);

    useEffect(() => {
        loadUserDetail();
    }, []);

    const loadUserDetail = async () => {
        const response = await axiosInstance.get(`/api/admin/users/userDetail/${id}`);
        setUserDetail(response.data.user);

    };

    const getRoleText = (role) => {
        if(role === "ADMIN") return "관리자";
        if(role === "RESEARCHER") return "연구자";
        return "사용자";
    };

    const getStatusClassName = (status) => {
        if(status === "ACTIVATE") return "badge text-bg-success";
        if(status === "INACTIVATE") return "badge text-bg-danger";

        return "badge text-bg-secondary";
    };

    const getStatusText = (status) => {
        if(status === "ACTIVATE") return "활성";
        if(status === "INACTIVATE") return "비활성";

        return status;
    };

    if(userDetail === null) {
        return (
            <EmptyUserDetail navigate={navigate} />
        )
    }

    return (
        <div className="admin-user-page">
            <UserDetailTitle navigate={navigate} />

            <UserSummaryCard
                userDetail={userDetail}
                getRoleText={getRoleText}
                getStatusClassName={getStatusClassName}
                getStatusText={getStatusText}
            />

            <DetailInfoSection
                userDetail={userDetail}
                getRoleText={getRoleText}
                getStatusClassName={getStatusClassName}
                getStatusText={getStatusText}
            />

            <DetailButtonSection navigate={navigate} />

            <UserManageModal
                userDetail={userDetail}
                loadUserDetail={loadUserDetail}
            />
        </div>
    )
}

export default UserDetailPage;