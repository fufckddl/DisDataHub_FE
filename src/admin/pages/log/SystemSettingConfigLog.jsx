import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LogListTitle({ navigate }) {
    return (
        <>
            <div className="row align-items-center mb-4">
                <div className="col">
                    <h3 className="mt-3 fw-bold">
                        시스템 설정 변경 로그
                    </h3>

                    <div className="text-secondary">
                        시스템 설정 변경 이력을 조회합니다.
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
                    <option value="settingName">설정명</option>
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

function LogListContent({ logList }) {
    return (
        <>
            <div className="col">
                <table className="table table-hover align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>로그ID</th>
                            <th>설정명</th>
                            <th>변경 전</th>
                            <th>변경 후</th>
                            <th>처리 관리자</th>
                            <th>사유</th>
                            <th>처리일</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logList.map((logData) => (
                            <tr key={logData.logId}>
                                <td>{logData.logId}</td>
                                <td>{logData.settingName}</td>
                                <td>{logData.beforeValue}</td>
                                <td>{logData.afterValue}</td>
                                <td>{logData.adminUserName}</td>
                                <td>{logData.description}</td>
                                <td>{logData.createdAt}</td>
                            </tr>
                        ))}

                        {logList.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center text-secondary py-4">
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

function SystemSettingConfigLog() {
    const navigate = useNavigate();

    const [logList, setLogList] = useState([]);
    const [searchType, setSearchType] = useState("settingName");
    const [searchWord, setSearchWord] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const rowCountPerPage = 10;

    useEffect(() => {
        loadLogList();
    }, []);

    const loadLogList = async () => {
        const dummyLogList = [
            {
                logId: 1,
                settingKey: "maxUploadFileSize",
                settingName: "최대 업로드 파일 크기",
                beforeValue: "300MB",
                afterValue: "500MB",
                adminUserName: "관리자",
                description: "대용량 공간 데이터 업로드 요청 증가로 인한 제한 변경",
                createdAt: "2026-06-04"
            },
            {
                logId: 2,
                settingKey: "dailyDownloadLimit",
                settingName: "일반 사용자 일일 다운로드 제한",
                beforeValue: "10회",
                afterValue: "20회",
                adminUserName: "관리자",
                description: "일반 사용자 다운로드 제한 완화",
                createdAt: "2026-06-03"
            },
            {
                logId: 3,
                settingKey: "allowedFileExtension",
                settingName: "허용 파일 확장자",
                beforeValue: "csv, xlsx",
                afterValue: "csv, xlsx, geojson, zip",
                adminUserName: "관리자",
                description: "공간 데이터 파일 형식 지원 확대",
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

    const filteredLogList = logList.filter((logData) => {
        const isSearchMatched =
            searchWord === "" ||
            (
                searchType === "settingName" &&
                logData.settingName.includes(searchWord)
            ) ||
            (
                searchType === "adminUserName" &&
                logData.adminUserName.includes(searchWord)
            );

        return isSearchMatched;
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

                    <div className="row mb-3">
                        <LogListSearch
                            searchType={searchType}
                            changeSearchType={changeSearchType}
                            searchWord={searchWord}
                            changeSearchWord={changeSearchWord}
                        />
                    </div>

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

export default SystemSettingConfigLog;