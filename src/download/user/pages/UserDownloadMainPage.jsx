import { useNavigate } from "react-router-dom";
import "../../style/download.css";
import TopTitle from "../../components/TopTitle";



function SearchForm({type, title, placeholder, form, options}){


    return(
        <>
            <div className="col">
                <div className="row">
                    <div className="col">{title}</div>
                </div>
                <div className="row">
                    <div className="col">
                        {form === "select"?(
                            <select className="form-select">
                                <option>전체</option>
                                {options?.map((item, index) => (
                                    <option key={index}>{item}</option>
                                ))}
                            </select>                            
                        ):
                        (
                            <input type={type} className={`form-${form}`} placeholder={placeholder}/>
                        )}
                        
                    </div>
                </div>
            </div>        
        </>
    )
}

function Search(){
    return(
        <>
            <div className="row mb-3">
                <div className="col">
                    <div className="card p-3">
                        <div className="row mb-3">
                            <SearchForm type="text" title="검색" form="control" placeholder="데이터명 또는 지역 검색"></SearchForm>
                            <SearchForm type="text" title="지역" form="select" 
                                        options={["서울시", "부산시", "안산시"]}></SearchForm>
                            <SearchForm type="text" title="파일 형식" form="select"
                                        options={["CSV", "GeoJSON", "SHP"]}></SearchForm>
                            <SearchForm type="text" title="데이터 유형" form="select"
                                        options={["시설물", "재난", "교통"]}></SearchForm>
                            <SearchForm type="date" title="등록일" form="control"></SearchForm>
                        </div>


                        <div className="row">
                            <div className="col">
                                <button className="me-3 btn btn-light" style={{width: "150px"}}>
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    초기화
                                </button>

                                <button className=" btn btn-primary" style={{width: "150px"}}>
                                    <i  className="bi bi-search me-2"></i>    
                                    검색
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            </div>        
        </>
    )
}
function DatasetList(){
    return(
        <>
            <div className="row ">
                <div className="col">

                    <div className="card shadow-sm overflow-hidden">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="col-2 ps-3">데이터셋 명</th>
                                    <th className="col-3">설명</th>
                                    <th className="col-1 text-center">지역 정보</th>
                                    <th className="col-1 text-center">등록일</th>
                                    <th className="col-1 text-center">파일 형식</th>
                                    <th className="col-1 text-center">다운로드 수</th>
                                    <th className="col-1 text-center">상태</th>
                                    <th className="col-2 text-center">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                <DatasetForm id="1"></DatasetForm>
                                <DatasetForm id="2"></DatasetForm>
                                <DatasetForm id="3"></DatasetForm>
                                <DatasetForm id="4"></DatasetForm>
                                <DatasetForm id="5"></DatasetForm>
                                <DatasetForm id="6"></DatasetForm>
                            </tbody>
                            


                        </table>
                        
                        {/* 페이징 */}
                        <div>
                            <Paging />
                        </div>
                        
                    </div>

                </div>
            </div>        
        </>
    )
}

function DatasetForm({id}){

    const navigate = useNavigate();

    const handleDetailPageClick = () => {
        // navigate("/download/user/detail")
        navigate(`/download/user/${id}`)
    }

    return(
        <>
            <tr>
                <td className="col-2 text-primary fw-bold ps-3">서울시 CCTV 위치 데이터</td>
                <td className="col-3 sm-text">서울시 공공 CCTV 설치 위치 및 주요 속성 정보</td>
                <td className="col-1 sm-text text-center">서울시</td>
                <td className="col-1 sm-text text-center">2026-05-17</td>
                <td className="col-1 text-center">
                    <span className="badge bg-success-subtle text-success border border-success-subtle me-1">CSV</span>
                </td>
                <td className="col-1 sm-text text-center">12,345</td>
                <td className="col-1 text-center">
                    <span className="badge bg-success-subtle text-success border border-success-subtle me-1">승인됨</span>
                </td>
                <td className="col-2 sm-text text-center">
                    {/* 상세보기 할 때 데이터 조회 권환 확인 필요 */}
                    <button className="btn btn-light btn-sm me-4" onClick={handleDetailPageClick}>상세보기</button>
                    <button className="btn btn-primary btn-sm" >다운로드</button>
                </td>
            </tr> 
        </>
    )
}

function CardForm({children, color, title, content}){
    return(
        <>
            <div className="col">
                <div className="card shadow-sm p-4">
                    <div className="row">
                        <div className={`col-2 rounded-circle bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
                            style={{ width: "56px", height: "56px" }}>
                            {children}
                        </div>
                        <div className="col">
                            <div className="fw-bold" style={{fontSize: "14px"}}>{title}</div>
                            <div className="fw-bold">{content}</div>
                            <div className="text-secondary" style={{fontSize: "12px"}}>승인된 데이터 기준</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function Paging(){
    return(
        <>
            <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                    <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item"><a className="page-link" href="#">Next</a></li>
                </ul>
            </nav>        
        </>
    )
}

function UserDownloadMainPage(){
    return(
        <>

            <div className="container-fluid px-4 py-3">

                {/* 상단 제목 */}
                <TopTitle title="GIS 데이터 다운로드" subTitle="승인된 공공 GIS 데이터를 조회하고 파일을 다운로드 할 수 있습니다." showGuide={true}/>

                {/* 검색창 */}
                <Search />


                {/* 중간 데시보드 카드 */}
                <div className="row mb-3">
                    <CardForm color="primary" title="전체 데이터 수" content="1,234건">
                        <i className=" bi bi-layers-fill fs-3"></i>
                    </CardForm>
                    <CardForm color="success" title="오늘 다운로드 수" content="1,234건">
                        <i className="bi bi-download fs-3"></i>
                    </CardForm>
                    <CardForm color="warning" title="지원 파일 형식" content="5종">
                        <i className="bi bi-file-earmark-text-fill fs-3"></i>
                    </CardForm>
                    <CardForm color="danger" title="인기 데이터" content="서울시 CCTV 위치 데이터">
                        <i className="bi bi-fire fs-3"></i>
                    </CardForm>
                </div>


                {/* 승인 데이터셋 목록 */}
                <DatasetList />


              

            </div>


        </>
    )
}

export default UserDownloadMainPage;