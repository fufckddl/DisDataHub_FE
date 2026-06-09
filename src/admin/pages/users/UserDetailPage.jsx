import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosInstance";

function UserDetailTitle({ navigate }) {
    return (
        <>
            <div className="row mb-4">
                <div className="col">
                    <h3 className="fw-bold mb-1">
                        사용자 상세 정보
                    </h3>

                    <div className="text-secondary">
                        사용자 기본 정보와 활동 내역을 확인할 수 있습니다.
                    </div>
                </div>

                <div className="col-auto d-flex align-items-center">
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

function UserSummaryCard({ userDetail, getRoleText, getStatusClassName }) {
    return (
        <div className="row mb-3">
            <div className="col">
                <div className="border rounded p-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <div className="fs-4 fw-bold">
                                {userDetail.username}
                            </div>

                            <div className="text-secondary">
                                {userDetail.email}
                            </div>
                        </div>

                        <div>
                            <span className="badge text-bg-primary fs-6 me-2">
                                {getRoleText(userDetail.role)}
                            </span>

                            <span className={`${getStatusClassName(userDetail.status)} fs-6`}>
                                {userDetail.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BasicInfoCard({ userDetail, getRoleText }) {
    return (
        <div className="col-6">
            <div className="border rounded p-4 h-100">
                <h5 className="fw-bold mb-3">
                    기본 정보
                </h5>

                <table className="table table-bordered align-middle mb-0">
                    <tbody>
                        <tr>
                            <th className="table-light text-secondary w-25">사용자 ID</th>
                            <td>{userDetail.id}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">사용자명</th>
                            <td>{userDetail.username}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">이메일</th>
                            <td>{userDetail.email}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">역할</th>
                            <td>{getRoleText(userDetail.role)}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">상태</th>
                            <td>{userDetail.status}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">소속</th>
                            <td>{userDetail.organization}</td>
                        </tr>

                        <tr>
                            <th className="table-light text-secondary">가입일</th>
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
            <div className="border rounded px-4 pt-4 pb-1 h-100">
                <h5 className="fw-bold mb-3">
                    활동 정보
                </h5>

                <table className="table table-bordered align-middle mb-0 text-center">
                    <thead className="table-light">
                        <tr>
                            <th>활동 항목</th>
                            <th>수치</th>
                        </tr>
                    </thead>

                    <tbody>
                        {activityList.map((activityData) => (
                            <tr key={activityData.title}>
                                <td className="text-secondary">
                                    {activityData.title}
                                </td>

                                <td>
                                    <span className="fw-bold fs-5">
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

                <div className="text-secondary text-center small mt-4">
                    최근 30일 기준 사용자 역할별 활동 통계입니다.
                </div>
            </div>
        </div>
    )
}

function DetailInfoSection({ userDetail, getRoleText }) {
    return (
        <div className="row mb-3">
            <BasicInfoCard
                userDetail={userDetail}
                getRoleText={getRoleText}
            />

            <ActivityInfoCard
                userDetail={userDetail}
            />
        </div>
    )
}

function DetailButtonSection({ navigate }) {
    return (
        <div className="row">
            <div className="col-auto">
                <button
                    className="btn btn-outline-secondary border-2 text-black bi bi-chevron-left"
                    onClick={() => {
                        navigate("/admin/users/userList");
                    }}
                >
                    &nbsp;목록으로
                </button>
            </div>
            <div className="col d-flex gap-2 justify-content-end">
                <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                        alert("정말 이 작업을 실행하시겠습니까? 복구할 수 없습니다.");
                        navigate("/admin/users/userList");
                    }}
                >
                    계정 삭제
                </button>

                <button
                    className="btn btn-outline-primary"
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
                        <div className="border rounded p-3 mb-3 bg-light">
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
        <div className="py-4">
            <div className="text-secondary">
                사용자 정보를 찾을 수 없습니다.
            </div>

            <button
                className="btn btn-outline-secondary mt-3"
                onClick={() => {
                    navigate("/admin/users/userList");
                }}
            >
                목록으로
            </button>
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

    if(userDetail === null) {
        return (
            <EmptyUserDetail navigate={navigate} />
        )
    }

    return (
        
        <>
        <div className="row justify-content-center py-3">
            <div className="col-8">
                <UserSummaryCard userDetail={userDetail} getRoleText={getRoleText} getStatusClassName={getStatusClassName} />
                <DetailInfoSection userDetail={userDetail} getRoleText={getRoleText} />
                <DetailButtonSection navigate={navigate} />
                <UserManageModal userDetail={userDetail} loadUserDetail={loadUserDetail} />
            </div>
        </div>
        </>
    )
}

export default UserDetailPage;