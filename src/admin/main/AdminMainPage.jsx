import { useState } from "react";
import { useNavigate } from "react-router-dom"

function TopCard ( {title, value, unit, description, icon, descriptionIcon, descriptionText} ) {
    return (
        <>
            <div className="top-card border rounded px-3 pt-3 my-2">
                <div className="d-flex align-items-center">
                    <div className={`${icon} fs-3 m-1 rounded-circle bg-primary-subtle d-flex justify-content-center align-items-center`}
                        style={{
                            width: "60px",
                            height: "60px"
                        }}
                    />
                    <div className="px-2">
                        <div>{title}</div>
                        <div>
                            <span className="fw-bold fs-3">{value}</span >
                            <span>{unit}</span>
                        </div>
                    </div>
                </div>
                <p className="d-flex align-items-center ms-3 mb-0">
                    <span className="d-flex align-items-center fw-bold">
                        <i className={`${descriptionIcon} fs-4 me-1`}></i>
                        <span className={descriptionText}>{description}</span>
                    </span>
                    <span className="text-secondary ms-1">
                        (전일 대비)
                    </span>
                </p>
            </div>
        </>
    )
}

function TotalTopCard () {
    return (
        <>
            <div className="row">
                <div className="col">
                    <TopCard title="전체 사용자" value="&nbsp;231" unit=" 명" description=" 8명" icon={"bi bi-person-lines-fill"} descriptionIcon={"bi bi-arrow-up-short text-success"} descriptionText={"text-success"}/>
                </div>
                <div className="col">
                    <TopCard title="전체 데이터셋" value="&nbsp;913" unit=" 개" description=" 54개" icon={"bi bi-database-fill"} descriptionIcon={"bi bi-arrow-up-short text-success"} descriptionText={"text-success"} />
                </div>
                <div className="col">
                    <TopCard title="권한 요청 건수" value="&nbsp;311" unit=" 건" description="12건" icon={"bi bi-shield-lock-fill"} descriptionIcon={"bi bi-arrow-down-short text-danger"} descriptionText={"text-danger"} />
                </div>
                <div className="col">
                    <TopCard title="업로드 요청 건수" value="&nbsp;53" unit=" 건" description="3건" icon={"bi bi-cloud-arrow-up-fill"} descriptionIcon={"bi bi-arrow-up-short text-success"} descriptionText={"text-success"} />
                </div>
                <div className="col">
                    <TopCard title="오늘 다운로드" value="&nbsp;423" unit=" 회" description="29회" icon={"bi bi-download"} descriptionIcon={"bi bi-arrow-down-short text-danger"} descriptionText={"text-danger"} />
                </div>
            </div>
        </>
    )
}

function BoardCard ( {title, sortReason, movePath, children} ) {

    const navigate = useNavigate();

    return (
        <>
            <div className="border rounded px-4 py-2 my-1 align-items-center" style={{height: "16em"}}>
                <div className="row">
                    <div className="col-auto p-0" style={{fontWeight: "bold", fontSize: "1.1em"}}>{`${title}`}</div>
                    <span className="col">{sortReason}</span>
                    <button onClick={() => {navigate(movePath)}} className="col-auto btn btn-outline-primary px-2 py-1" style={{fontSize: "0.7em"}}>자세히 보기</button>
                </div>
                <div className="mt-2">
                    <div className="col">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

function TotalBoardCard () {
    return (
        <>
            <div className="row">
                <div className="col-4">
                    <BoardCard title="사용자 관리" sortReason={"(최근 접속일 순)"} movePath="/admin/users/userList">
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th>유저ID</th>
                                    <th>이름</th>
                                    <th>역할</th>
                                    <th>최근 접속일</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>박지연</td>
                                    <td>관리자</td>
                                    <td>2026-05-26</td>
                                </tr>
                                <tr>
                                    <td>51</td>
                                    <td>이지수</td>
                                    <td>사용자</td>
                                    <td>2026-05-26</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>김태윤</td>
                                    <td>관리자</td>
                                    <td>2026-05-25</td>
                                </tr>
                                <tr>
                                    <td>18</td>
                                    <td>신치열</td>
                                    <td>연구자</td>
                                    <td>2026-05-24</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>

                <div className="col-4">
                    <BoardCard title="게시판 관리" sortReason={"(최근 활동 순)"}>
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th>게시글ID</th>
                                    <th>제목</th>
                                    <th>작성자</th>
                                    <th>작성일</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>301</td>
                                    <td>시스템 점검 안내</td>
                                    <td>관리자</td>
                                    <td>2026-05-28</td>
                                </tr>
                                <tr>
                                    <td>298</td>
                                    <td>데이터셋 업로드 가이드</td>
                                    <td>김지훈</td>
                                    <td>2026-05-27</td>
                                </tr>
                                <tr>
                                    <td>294</td>
                                    <td>API 연동 관련 문의</td>
                                    <td>이서연</td>
                                    <td>2026-05-25</td>
                                </tr>
                                <tr>
                                    <td>287</td>
                                    <td>권한 변경 요청 안내</td>
                                    <td>박민수</td>
                                    <td>2026-05-20</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>

                <div className="col-4">
                    <BoardCard title="단어표준 관리" sortReason={"(최근 변환 순)"}>
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th>입력값</th>
                                    <th>표준명</th>
                                    <th>유형</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>latitude</td>
                                    <td>위도</td>
                                    <td>좌표</td>
                                </tr>
                                <tr>
                                    <td>lat</td>
                                    <td>위도</td>
                                    <td>좌표</td>
                                </tr>
                                <tr>
                                    <td>longitude</td>
                                    <td>경도</td>
                                    <td>좌표</td>
                                </tr>
                                <tr>
                                    <td>lon</td>
                                    <td>경도</td>
                                    <td>좌표</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <BoardCard title="시스템 설정" movePath={"/admin/system/settingList"}>
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th className="col-auto">설정명</th>
                                    <th>설정 값</th>
                                    <th>변경가능 여부</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>허용 파일 확장자</td>
                                    <td>csv, xlsx ... </td>
                                    <td>불가</td>
                                </tr>
                                <tr>
                                    <td>최대 업로드 파일 크기</td>
                                    <td>2GB</td>
                                    <td>가능</td>
                                </tr>
                                <tr>
                                    <td>기본 저장 좌표계</td>
                                    <td>EPSG:4326</td>
                                    <td>불가</td>
                                </tr>
                                <tr>
                                    <td>기본 분석 좌표계</td>
                                    <td>EPSG:5179</td>
                                    <td>불가</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>

                <div className="col-4">
                    <BoardCard title="외부연계 API" sortReason={"(최근 호출 순)"}>
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th>API명</th>
                                    <th>상태</th>
                                    <th>응답시간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>공간정보 조회 API</td>
                                    <td>정상</td>
                                    <td>120ms</td>
                                </tr>
                                <tr>
                                    <td>데이터셋 검색 API</td>
                                    <td>정상</td>
                                    <td>98ms</td>
                                </tr>
                                <tr>
                                    <td>사용자 인증 API</td>
                                    <td>정상</td>
                                    <td>85ms</td>
                                </tr>
                                <tr>
                                    <td>파일 업로드 API</td>
                                    <td>점검중</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>

                <div className="col-4">
                    <BoardCard title="요청 관리" sortReason={"(요청일 순)"}>
                        <table className="table text-center m-0">
                            <thead className="bg-primary-subtle">
                                <tr>
                                    <th>요청ID</th>
                                    <th>요청종류</th>
                                    <th>요청자</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>REQ-014</td>
                                    <td>업로드 요청</td>
                                    <td>김지훈</td>
                                    <td>대기</td>
                                </tr>
                                <tr>
                                    <td>REQ-018</td>
                                    <td>권한 변경</td>
                                    <td>이서연</td>
                                    <td>검토중</td>
                                </tr>
                                <tr>
                                    <td>REQ-021</td>
                                    <td>데이터 접근</td>
                                    <td>박민수</td>
                                    <td>승인</td>
                                </tr>
                                <tr>
                                    <td>REQ-028</td>
                                    <td>데이터 접근</td>
                                    <td>최민석</td>
                                    <td>반려</td>
                                </tr>
                            </tbody>
                        </table>
                    </BoardCard>
                </div>
            </div>
        </>
    )
}

function LogBoardCard({ selectedLogType, moveLogPage, children }) {
    return (
        <>
            <div className="border rounded px-4 py-2 my-1 align-items-center" style={{height: "16em"}}>
                <div className="row">
                    <div className="col-auto p-0" style={{fontWeight: "bold", fontSize: "1.1em"}}>
                        로그 관리
                    </div>

                    <span className="col">
                        (최근 활동 순)
                    </span>

                    <button
                        onClick={moveLogPage}
                        className="col-auto btn btn-outline-primary px-2 py-1"
                        style={{fontSize: "0.7em"}}
                    >
                        로그 전체보기
                    </button>
                </div>

                <div className="mt-2">
                    <div className="col">
                        {children}
                    </div>
                </div>
            </div>
        </>
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
        <>
            <div className="row">
                <div className="col-12">

                    <LogBoardCard moveLogPage={moveLogPage}>

                        <div className="btn-group mb-3" role="group">
                            <button
                                className={`btn btn-sm rounded-0 ${
                                    selectedLogType === "user"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => {
                                    setSelectedLogType("user");
                                }}
                            >
                                사용자 관리 로그
                            </button>

                            <button
                                className={`btn btn-sm rounded-0 ${
                                    selectedLogType === "system"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => {
                                    setSelectedLogType("system");
                                }}
                            >
                                시스템 설정 로그
                            </button>

                            <button
                                className={`btn btn-sm rounded-0 ${
                                    selectedLogType === "download"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => {
                                    setSelectedLogType("download");
                                }}
                            >
                                다운로드 로그
                            </button>
                        </div>

                        {selectedLogType === "user" && (
                            <table className="table text-center m-0">
                                <thead className="bg-primary-subtle">
                                    <tr>
                                        <th>관리ID</th>
                                        <th>대상 사용자</th>
                                        <th>관리 유형</th>
                                        <th>처리 관리자</th>
                                        <th>일시</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>김지훈</td>
                                        <td>7일 정지</td>
                                        <td>관리자</td>
                                        <td>2026-06-04</td>
                                    </tr>

                                    <tr>
                                        <td>2</td>
                                        <td>이서연</td>
                                        <td>30일 정지</td>
                                        <td>관리자</td>
                                        <td>2026-06-03</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}

                        {selectedLogType === "system" && (
                            <table className="table text-center m-0">
                                <thead className="bg-primary-subtle">
                                    <tr>
                                        <th>설정명</th>
                                        <th>변경 전</th>
                                        <th>변경 후</th>
                                        <th>처리 관리자</th>
                                        <th>일시</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>최대 업로드 파일 크기</td>
                                        <td>300MB</td>
                                        <td>500MB</td>
                                        <td>관리자</td>
                                        <td>2026-06-04</td>
                                    </tr>

                                    <tr>
                                        <td>일일 다운로드 제한</td>
                                        <td>10회</td>
                                        <td>20회</td>
                                        <td>관리자</td>
                                        <td>2026-06-03</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}

                        {selectedLogType === "download" && (
                            <table className="table text-center m-0">
                                <thead className="bg-primary-subtle">
                                    <tr>
                                        <th>다운로드ID</th>
                                        <th>사용자</th>
                                        <th>파일명</th>
                                        <th>다운로드 일시</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>DL-001</td>
                                        <td>김지훈</td>
                                        <td>행정구역.geojson</td>
                                        <td>2026-06-04</td>
                                    </tr>

                                    <tr>
                                        <td>DL-002</td>
                                        <td>이서연</td>
                                        <td>도로망.csv</td>
                                        <td>2026-06-03</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}

                    </LogBoardCard>

                </div>
            </div>
        </>
    )
}

function AdminMainPage () {

    return (
        <>
            <div className="row justify-content-center mt-3 mb-4">
                <div className="col-10">
                    <h3 className="fs-4 fw-bold">관리자 대시보드</h3>

                    <TotalTopCard />
                    <TotalBoardCard />
                    <TotalLogBoardCard />
                </div>
            </div>
        </>
    )
}

export default AdminMainPage;