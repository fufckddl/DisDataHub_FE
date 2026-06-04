import { useEffect, useState } from "react";
import axiosInstance from "../../../commons/api/axiosinstance";

function UserManagementPage() {
    const [userList, setUserList] = useState([]);
    const [searchType, setSearchType] = useState("userId");
    const [searchWord, setSearchWord] = useState("");

    const [roleFilter, setRoleFilter] = useState({
        USER: false,
        RESEARCHER: false,
        ADMIN: false
    });

    useEffect(() => {
        loadUserList();
    }, []);

    const loadUserList = async () => {
        const response = await axiosInstance.get("/api/management/users");

        setUserList(response.data.userList);
    };

    const changeSearchType = (event) => {
        setSearchType(event.target.value);
    };

    const changeSearchWord = (event) => {
        setSearchWord(event.target.value);
    };

    const changeRoleFilter = (event) => {
        const roleName = event.target.value;
        const isChecked = event.target.checked;

        setRoleFilter({
            ...roleFilter,
            [roleName]: isChecked
        });
    };

    const checkedRoleList = Object.keys(roleFilter).filter((roleName) => {
        return roleFilter[roleName] === true;
    });

    const filteredUserList = userList.filter((userData) => {
        const isSearchMatched =
            searchWord === "" ||
            (
                searchType === "userId" &&
                userData.userId.toString().includes(searchWord)
            ) ||
            (
                searchType === "userName" &&
                userData.userName.includes(searchWord)
            );

        const isRoleMatched =
            checkedRoleList.length === 0 ||
            checkedRoleList.includes(userData.role);

        return isSearchMatched && isRoleMatched;
    });

    return (
        <div className="container-fluid">
            <div className="row mb-4">
                <div className="col">
                    <h3 className="fw-bold">사용자 관리</h3>
                    <div className="text-secondary">
                        전체 사용자를 조회하고 역할별로 관리할 수 있습니다.
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-2">
                    <select
                        className="form-select"
                        value={searchType}
                        onChange={changeSearchType}
                    >
                        <option value="userId">사용자 ID</option>
                        <option value="userName">사용자명</option>
                    </select>
                </div>

                <div className="col-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="검색어 입력"
                        value={searchWord}
                        onChange={changeSearchWord}
                    />
                </div>

                <div className="col d-flex align-items-center gap-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value="USER"
                            id="checkRoleUser"
                            checked={roleFilter.USER}
                            onChange={changeRoleFilter}
                        />
                        <label className="form-check-label" htmlFor="checkRoleUser">
                            사용자
                        </label>
                    </div>

                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value="RESEARCHER"
                            id="checkRoleResearcher"
                            checked={roleFilter.RESEARCHER}
                            onChange={changeRoleFilter}
                        />
                        <label className="form-check-label" htmlFor="checkRoleResearcher">
                            연구자
                        </label>
                    </div>

                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value="ADMIN"
                            id="checkRoleAdmin"
                            checked={roleFilter.ADMIN}
                            onChange={changeRoleFilter}
                        />
                        <label className="form-check-label" htmlFor="checkRoleAdmin">
                            관리자
                        </label>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>사용자 ID</th>
                                <th>사용자명</th>
                                <th>이메일</th>
                                <th>역할</th>
                                <th>가입일</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUserList.map((userData) => (
                                <tr key={userData.userId}>
                                    <td>{userData.userId}</td>
                                    <td>{userData.userName}</td>
                                    <td>{userData.email}</td>
                                    <td>{userData.role}</td>
                                    <td>{userData.createdAt}</td>
                                </tr>
                            ))}

                            {filteredUserList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-secondary py-4">
                                        조회된 사용자가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UserManagementPage;