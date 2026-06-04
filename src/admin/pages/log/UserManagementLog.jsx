import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LogListTitle({ navigate }) {
    return (
        <>
            <div className="row align-items-center mb-4">
                <div className="col">
                    <h3 className="mt-3 fw-bold">
                        사용자 관리 로그
                    </h3>

                    <div className="text-secondary">
                        사용자 제재 및 관리 이력을 조회합니다.
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

function LogListSearch({ searchType, changeSearchType, searchWord, changeSearchWord }) {
    return (
        <>
            <div className="col-auto">
                <select
                    className="form-select shadow-none"
                    value={searchType}
                    onChange={changeSearchType}
                >
                    <option value="targetUserName">대상 사용자</option>
                    <option value="adminUserName">처리 관리자</option>
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

function LogListFilter({ typeFilter, changeTypeFilter }) {
    return (
        <>
            <div className="col-auto d-flex align-items-center gap-3 me-2">
                <div className="form-check">
                    <input
                        className="form-check-input shadow-none"
                        type="checkbox"
                        value="7일 정지"
                        id="checkTypeSevenDays"
                        checked={typeFilter["7일 정지"]}
                        onChange={changeTypeFilter}
                    />
                    <label className="form-check-label" htmlFor="checkTypeSevenDays">
                        7일 정지
                    </label>
                </div>

                <div className="form-check">
                    <input
                        className="form-check-input shadow-none"
                        type="checkbox"
                        value="30일 정지"
                        id="checkTypeThirtyDays"
                        checked={typeFilter["30일 정지"]}
                        onChange={changeTypeFilter}
                    />
                    <label className="form-check-label" htmlFor="checkTypeThirtyDays">
                        30일 정지
                    </label>
                </div>

                <div className="form-check">
                    <input
                        className="form-check-input shadow-none"
                        type="checkbox"
                        value="영구 정지"
                        id="checkTypePermanent"
                        checked={typeFilter["영구 정지"]}
                        onChange={changeTypeFilter}
                    />
                    <label className="form-check-label" htmlFor="checkTypePermanent">
                        영구 정지
                    </label>
                </div>
            </div>
        </>
    )
}

function LogListTopContent({
    searchType,
    changeSearchType,
    searchWord,
    changeSearchWord,
    typeFilter,
    changeTypeFilter
}) {
    return (
        <>
            <div className="row mb-3">
                <LogListSearch
                    searchType={searchType}
                    changeSearchType={changeSearchType}
                    searchWord={searchWord}
                    changeSearchWord={changeSearchWord}
                />

                <LogListFilter
                    typeFilter={typeFilter}
                    changeTypeFilter={changeTypeFilter}
                />
            </div>
        </>
    )
}

function LogListContent({ logList }) {
    return (
        <>
            <div className="col">
                <table className="table table-hover align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>로그ID</th>
                            <th>대상 사용자</th>
                            <th>관리 유형</th>
                            <th>처리 관리자</th>
                            <th>사유</th>
                            <th>처리일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logList.map((logData) => (
                            <tr key={logData.logId}>
                                <td>{logData.logId}</td>
                                <td>{logData.targetUserName}</td>
                                <td>{logData.typeName}</td>
                                <td>{logData.adminUserName}</td>
                                <td>{logData.description}</td>
                                <td>{logData.createdAt}</td>
                            </tr>
                        ))}

                        {logList.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center text-secondary py-4">
                                    조회된 로그가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function LogListPaging({ currentPage, totalPage, changeCurrentPage }) {
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

function UserManagementLog() {
    const navigate = useNavigate();

    const [logList, setLogList] = useState([]);
    const [searchType, setSearchType] = useState("targetUserName");
    const [searchWord, setSearchWord] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const rowCountPerPage = 10;

    const [typeFilter, setTypeFilter] = useState({
        "7일 정지": false,
        "30일 정지": false,
        "영구 정지": false
    });

    useEffect(() => {
        loadLogList();
    }, []);

    const loadLogList = async () => {
        const dummyLogList = [
            {
                logId: 1,
                targetUserName: "김지훈",
                typeName: "7일 정지",
                adminUserName: "관리자",
                description: "반복적인 부적절한 게시글 작성",
                createdAt: "2026-06-04"
            },
            {
                logId: 2,
                targetUserName: "이서연",
                typeName: "30일 정지",
                adminUserName: "관리자",
                description: "데이터 다운로드 정책 위반",
                createdAt: "2026-06-03"
            },
            {
                logId: 3,
                targetUserName: "박민수",
                typeName: "영구 정지",
                adminUserName: "관리자",
                description: "계정 악용 및 반복 신고 누적",
                createdAt: "2026-06-02"
            }
        ];

        setLogList(dummyLogList);
    };

    const changeSearchType = (event) => {
        setSearchType(event.target.value);
        setCurrentPage(1);
    };

    const changeSearchWord = (event) => {
        setSearchWord(event.target.value);
        setCurrentPage(1);
    };

    const changeTypeFilter = (event) => {
        const typeName = event.target.value;
        const isChecked = event.target.checked;

        setTypeFilter({
            ...typeFilter,
            [typeName]: isChecked
        });

        setCurrentPage(1);
    };

    const checkedTypeList = Object.keys(typeFilter).filter((typeName) => {
        return typeFilter[typeName] === true;
    });

    const filteredLogList = logList.filter((logData) => {
        const isSearchMatched =
            searchWord === "" ||
            (
                searchType === "targetUserName" &&
                logData.targetUserName.includes(searchWord)
            ) ||
            (
                searchType === "adminUserName" &&
                logData.adminUserName.includes(searchWord)
            );

        const isTypeMatched =
            checkedTypeList.length === 0 ||
            checkedTypeList.includes(logData.typeName);

        return isSearchMatched && isTypeMatched;
    });

    const totalPage = Math.ceil(filteredLogList.length / rowCountPerPage);

    const startIndex = (currentPage - 1) * rowCountPerPage;
    const endIndex = startIndex + rowCountPerPage;

    const pagedLogList = filteredLogList.slice(startIndex, endIndex);

    return (
        <>
            <div className="row justify-content-center">
                <div className="col-8">
                    <LogListTitle navigate={navigate} />

                    <LogListTopContent
                        searchType={searchType}
                        changeSearchType={changeSearchType}
                        searchWord={searchWord}
                        changeSearchWord={changeSearchWord}
                        typeFilter={typeFilter}
                        changeTypeFilter={changeTypeFilter}
                    />

                    <div className="row">
                        <LogListContent
                            logList={pagedLogList}
                        />
                    </div>

                    <LogListPaging
                        currentPage={currentPage}
                        totalPage={totalPage}
                        changeCurrentPage={setCurrentPage}
                    />
                </div>
            </div>
        </>
    )
}

export default UserManagementLog;