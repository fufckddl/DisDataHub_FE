import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../../commons/api/axiosInstance";
import { dummyUserList } from "../../data/dummyUserList";

function UserListTitle({ navigate }) {
    return(
        <>
            <div className="row align-items-center mb-4">
                <div className="col">
                    <h3 className="mt-3 fw-bold">사용자 관리</h3>
                    <div className="text-secondary">
                        전체 사용자를 조회하고 역할별로 관리할 수 있습니다.
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

function UserListSearch({ searchType, changeSearchType, searchWord, changeSearchWord }) {
    return (
        <>
            <div className="col-auto">
                <select
                    className="form-select shadow-none"
                    value={searchType}
                    onChange={changeSearchType}
                >
                    <option value="userId">사용자 ID</option>
                    <option value="userName">사용자명</option>
                </select>
            </div>

            <div className="col">
                <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="검색어 입력"
                    value={searchWord}
                    onChange={changeSearchWord}
                />
            </div>
        </>
    )
}

function UserListFilter({ roleFilter, changeRoleFilter }) {
    return(
        <>
            <div className="col-auto d-flex align-items-center gap-3 me-2">
                <div className="form-check">
                    <input
                        className="form-check-input shadow-none"
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
                        className="form-check-input shadow-none"
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
                        className="form-check-input shadow-none"
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
        </>
    )
}

function UserListTopContent({ searchType, changeSearchType, searchWord, changeSearchWord, roleFilter, changeRoleFilter }) {
    return(
        <>
            <div className="row mb-3">
                <UserListSearch
                    searchType={searchType}
                    changeSearchType={changeSearchType}
                    searchWord={searchWord}
                    changeSearchWord={changeSearchWord}
                />

                <UserListFilter
                    roleFilter={roleFilter}
                    changeRoleFilter={changeRoleFilter}
                />
            </div>
        </>
    )
}

function UserListContent({ userList, navigate }) {
    return(
        <>
            <div className="col">
                <table className="table table-hover align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>사용자 ID</th>
                            <th>사용자명</th>
                            <th>이메일</th>
                            <th>역할</th>
                            <th>상태</th>
                            <th>가입일</th>
                            <th>최근 접속일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {userList.map((userData) => (
                            <tr
                                key={userData.userId}
                                onClick={() => {
                                    navigate(`/admin/users/detail/${userData.userId}`);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <td>{userData.userId}</td>
                                <td>{userData.userName}</td>
                                <td>{userData.email}</td>
                                <td>{userData.role}</td>
                                <td>{userData.status}</td>
                                <td>{userData.createdAt}</td>
                                <td>{userData.lastLoginAt}</td>
                            </tr>
                        ))}

                        {userList.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center text-secondary py-4">
                                    조회된 사용자가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function UserListPaging({ currentPage, totalPage, changeCurrentPage }) {

    const pageNumberList = [];

    for(let i = 1; i <= totalPage; i++) {
        pageNumberList.push(i);
    }

    if(totalPage === 0) {
        return null;
    }

    return (
        <>
            <div className="row mt-3 mb-4">
                <div className="col d-flex justify-content-center">
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link shadow-none"
                                onClick={() => {
                                    changeCurrentPage(currentPage - 1);
                                }}
                            >
                                이전
                            </button>
                        </li>

                        {pageNumberList.map((pageNumber) => (
                            <li
                                key={pageNumber}
                                className={`page-item ${currentPage === pageNumber ? "active" : ""}`}
                            >
                                <button
                                    className="page-link shadow-none"
                                    onClick={() => {
                                        changeCurrentPage(pageNumber);
                                    }}
                                >
                                    {pageNumber}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPage ? "disabled" : ""}`}>
                            <button
                                className="page-link shadow-none"
                                onClick={() => {
                                    changeCurrentPage(currentPage + 1);
                                }}
                            >
                                다음
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

function UserListPage() {

    const navigate = useNavigate();

    const [userList, setUserList] = useState([]);
    const [searchType, setSearchType] = useState("userId");
    const [searchWord, setSearchWord] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const rowCountPerPage = 10;

    const [roleFilter, setRoleFilter] = useState({
        USER: false,
        RESEARCHER: false,
        ADMIN: false
    });

    useEffect(() => {
        loadUserList();
    }, []);

    const loadUserList = async () => {

        // 현재는 발표용 더미 데이터 사용
        setUserList(dummyUserList);



        // 나중에 실제 DB 연동할 때는 아래 코드 사용
        // const response = await axiosInstance.get("/api/admin/users");
        // setUserList(response.data.userList);

    };

    const changeSearchType = (event) => {
        setSearchType(event.target.value);
        setCurrentPage(1);
    };

    const changeSearchWord = (event) => {
        setSearchWord(event.target.value);
        setCurrentPage(1);
    };

    const changeRoleFilter = (event) => {

        const roleName = event.target.value;
        const isChecked = event.target.checked;

        setRoleFilter({
            ...roleFilter,
            [roleName]: isChecked
        });

        setCurrentPage(1);

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

    const totalPage = Math.ceil(filteredUserList.length / rowCountPerPage);

    const startIndex = (currentPage - 1) * rowCountPerPage;
    const endIndex = startIndex + rowCountPerPage;

    const pagedUserList = filteredUserList.slice(startIndex, endIndex);

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-8">
                    <UserListTitle navigate={navigate} />

                    <UserListTopContent
                        searchType={searchType}
                        changeSearchType={changeSearchType}
                        searchWord={searchWord}
                        changeSearchWord={changeSearchWord}
                        roleFilter={roleFilter}
                        changeRoleFilter={changeRoleFilter}
                    />

                    <div className="row">
                        <UserListContent
                            userList={pagedUserList}
                            navigate={navigate}
                        />
                    </div>

                    <UserListPaging
                        currentPage={currentPage}
                        totalPage={totalPage}
                        changeCurrentPage={setCurrentPage}
                    />
                </div>
            </div>
        </>
    )
}

export default UserListPage;