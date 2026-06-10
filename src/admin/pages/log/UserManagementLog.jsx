import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserManagementLogListApi } from "../../api/adminUserApi";
import "../../css/AdminLog.css";

function UserManagementLog() {

    const navigate = useNavigate();

    const [userManagementLogList, setUserManagementLogList] = useState([]);

    useEffect(() => {
        loadUserManagementLogList();
    }, []);

    const loadUserManagementLogList = async () => {
        const response = await getUserManagementLogListApi();
        setUserManagementLogList(response.data.userManagementLogList);
    };

    return (
        <div className="admin-log-page">

            <div className="admin-log-title-row">
                <div>
                    <h1 className="admin-log-title">
                        사용자 관리 로그
                    </h1>

                    <p className="admin-log-description">
                        관리자에 의해 처리된 사용자 상태 변경 내역을 확인합니다.
                    </p>
                </div>

                <button
                    className="admin-log-home-button bi bi-house-door"
                    onClick={() => {
                        navigate("/admin/mainPage");
                    }}
                >
                    &nbsp;메인화면
                </button>
            </div>

            <div className="admin-log-card">
                <table className="admin-log-table">

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

                        {userManagementLogList.map((logData) => (
                            <tr key={logData.logId}>
                                <td>{logData.logId}</td>
                                <td>{logData.targetUsername}</td>
                                <td>{logData.typeName}</td>
                                <td>{logData.adminUsername}</td>
                                <td>{logData.description}</td>
                                <td>{logData.createdAt?.substring(0, 10)}</td>
                            </tr>
                        ))}

                        {userManagementLogList.length === 0 && (
                            <tr>
                                <td colSpan="6" className="admin-log-empty">
                                    조회된 사용자 관리 로그가 없습니다.
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>
            </div>

        </div>
    )
}

export default UserManagementLog;