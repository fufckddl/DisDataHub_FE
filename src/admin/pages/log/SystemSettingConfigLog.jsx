import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSystemSettingConfigLogListApi } from "../../api/adminUserApi";
import "../../css/AdminLog.css";

function SystemSettingConfigLog() {

    const navigate = useNavigate();

    const [systemSettingConfigLogList, setSystemSettingConfigLogList] = useState([]);

    useEffect(() => {
        loadSystemSettingConfigLogList();
    }, []);

    const loadSystemSettingConfigLogList = async () => {
        const response = await getSystemSettingConfigLogListApi();
        setSystemSettingConfigLogList(response.data.systemSettingConfigLogList);
    };

    return (
        <div className="admin-log-page">

            <div className="admin-log-title-row">
                <div>
                    <h1 className="admin-log-title">
                        시스템 설정 로그
                    </h1>

                    <p className="admin-log-description">
                        시스템 설정값 변경 내역과 처리 관리자를 확인합니다.
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
                            <th>설정 키</th>
                            <th>변경 전</th>
                            <th>변경 후</th>
                            <th>처리 관리자</th>
                            <th>변경 사유</th>
                            <th>처리 일시</th>
                        </tr>
                    </thead>

                    <tbody>

                        {systemSettingConfigLogList.map((logData) => (
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

                        {systemSettingConfigLogList.length === 0 && (
                            <tr>
                                <td colSpan="7" className="admin-log-empty">
                                    조회된 시스템 설정 로그가 없습니다.
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    )
}

export default SystemSettingConfigLog;