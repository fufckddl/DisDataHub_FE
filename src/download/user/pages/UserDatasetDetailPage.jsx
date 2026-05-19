import { Link } from "react-router-dom";
import TopTitle from "../../components/TopTitle";
import "../../style/download.css";

function FileCardForm(){
    return(
        <>
            <div className="col-6 mb-2">
                <div className="card p-2">
                    <div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle me-1">CSV</span>
                        <span className="sm-text">(크기)</span>
                    </div>
                </div>
            </div>        
        </>
    )
}



function DatasetSummaryCard({children, title, content, borderShow = true}){
    return(
        <>
            <div className={`col ${borderShow && "border-end"}`}>
                <div className="row">
                    <div className="col-2 text-primary d-flex align-items-center fs-5">
                        {children}
                    </div>
                    <div className="col">
                        <div className="sm-text fw-bold">{title}</div>
                        <div className="fw-bold" style={{fontSize: "13px"}}>{content}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

function DatasetForm({title, content, type, top = false}){
    return(
        <>
            <div className={`row border-bottom ${type == "left" ? "me-0" : "ms-0"} ${top && "border-top"}`} >
                <div className="col-4 bg-light fw-bold p-2" style={{fontSize: "10px"}}>{title}</div>
                <div className="col-8 dataset-text p-2 fw-bold">{content}</div>
            </div>       
        </>
    )
}

function MapOptionButton(){
    return(
        <>

            {/* <div className="row">
                <div className="col">
                    <button className="btn btn-sm border border-end-0 rounded-end-0 ">마커</button>
                    <button className="btn btn-sm border border-end-0 border-start-0 rounded-0">HeatMap</button>
                    <button className="btn btn-sm border border-start-0 rounded-start-0 ">영역표시</button>
                </div>  
                <div className="col text-end">
                    <button className="btn btn-sm border sm-text me-2"><i className="bi bi-layers me-1"></i>레이어</button>
                    <button className="btn btn-sm border sm-text me-2"><i className="bi bi-funnel me-1"></i>필터</button>
                    <button className="btn btn-sm border sm-text"><i className="bi bi-fullscreen"></i></button>
                </div>
            </div> */}


            <div className="row mb-2">
                <div className="col">
                    <div className="btn-group" role="group" aria-label="Basic radio toggle button group">

                        <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" defaultChecked />
                        <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio1">마커</label>

                        <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                        <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio2">HeatMap</label>

                        <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                        <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio3">영역표시</label>
                    </div>
                </div>  
                <div className="col text-end">
                    <button className="btn btn-sm border sm-text me-2"><i className="bi bi-layers me-1"></i>레이어</button>
                    <button className="btn btn-sm border sm-text me-2"><i className="bi bi-funnel me-1"></i>필터</button>
                    <button className="btn btn-sm border sm-text"><i className="bi bi-fullscreen"></i></button>
                </div>
            </div>        
        </>
    )
}

function UserDatasetDetailPage(){

    const datasetInfo = {
        title: "서울시 CCTV 위치 데이터",
        subTitle: "서울시 관내에 설치된 CCTV의 위치 및 속성 정보를 제공합니다. 도시 안전, 방범, 교통 관리 등 다양한 정책 및 서비스에 활용할 수 있습니다."
    };

    const handleLoginClick = () =>{
        console.log("클릭")
    }

    return(
        <>
            <div className="container-fluid px-4 py-3">
                <div className="row">

                    {/* 죄측 */}
                    <div className="col-9">
                        {/* 상단 제목 */}
                        <div className="row mb-2">
                            <div className="col">
                                <TopTitle title={datasetInfo.title} subTitle={datasetInfo.subTitle} showGuide={false}/>
                            </div>
                        </div>

                        {/* 데이터셋 요약 정보 */}
                        <div className="row mb-2">
                            <div className="col">
                                <div className="card px-3 py-3">
                                    <div className="row">
                                        <DatasetSummaryCard title="등록일" content="2026-05-18">
                                            <i className="bi bi-calendar-event "></i>
                                        </DatasetSummaryCard>
                                        <DatasetSummaryCard title="제공기간" content="서울특별시">
                                            <i className="bi bi-building"></i>
                                        </DatasetSummaryCard>
                                        <DatasetSummaryCard title="좌표계" content="EPSG:4326">
                                            <i className="bi bi-bullseye"></i>
                                        </DatasetSummaryCard>
                                        <DatasetSummaryCard title="지역정보" content="서울시">
                                            <i className="bi bi-geo-alt"></i>
                                        </DatasetSummaryCard>
                                        <DatasetSummaryCard title="다운로드 수" content="12,345" borderShow={false}>
                                            <i className="bi bi-download"></i>
                                        </DatasetSummaryCard>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        

                        <div className="row mb-3">
                            {/* 데이터 개요 */}
                            <div className="col-6">
                                <div className="card px-3 py-2">
                                    <div className="row mb-2">
                                        <div className="col">
                                            <div className="fw-bold">데이터 개요</div>
                                        </div>
                                    </div>   
                                    <div className="row g-0 d-flex align-items-center ">
                                        <div className="col-6">

                                            <DatasetForm type="left" top={true} title="데이터 명" content="서울시 CCTV 위치 데이터"/>
                                            <DatasetForm type="left" title="제공기간" content="서울특별시"/>
                                            <DatasetForm type="left" title="지역" content="서울시"/>
                                            <DatasetForm type="left" title="등록일" content="2024-05-20"/>
                                            <DatasetForm type="left" title="업데이트일" content="2024-05-21"/>

                                        </div>
                                        <div className="col-6 border-start">
                                            
                                            <DatasetForm type="right" top={true} title="조회수" content="123"/>
                                            <DatasetForm type="right" title="데이터 유형" content="시설물 / 보안"/>
                                            <DatasetForm type="right" title="좌표계" content="EPSG:4326 (WGS 84)"/>
                                            <DatasetForm type="right" title="파일 크기" content="12.4 MB"/>
                                            <DatasetForm type="right" title="형식" content="CSV"/>

                                        </div>
                                    </div>    
                                    <div className="row mb-2">
                                        <div className="col-12">
                                            <div className="row border-bottom dataset-content">
                                                <div className="col-2 bg-light fw-bold p-2" style={{fontSize: "10px"}}>설명</div>
                                                <div className="col-10 dataset-text p-2 fw-bold line-clamp-2">12311111111111111111111111111111111123123123</div>
                                            </div>                                            
                                        </div>
                                    </div>                             
                                </div>
                            </div>

                     
                  


                            




                            {/* 지도 시각화 */}
                            <div className="col-6">
                                <div className="card px-3 py-2 h-100">
                                    <div className="row mb-2">
                                        <div className="col">
                                            <div className="fw-bold">지도 시각화</div>
                                        </div>
                                    </div>
                                    {/* 각기 버튼 표현 */}
                                    <MapOptionButton />

                                    {/* 지도 이미지 */}
                                    <div className="row">
                                        <div className="col">
                                            <img src="..." className="rounded mx-auto d-block" alt="..."/>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>


                        <div className="row">
                            {/* 속성 데이터 미리보기 */}
                            <div className="col-5">
                                <div className="card px-3 py-2">
                                    <div className="row">
                                        <div className="col">
                                            <div className="fw-bold">속성 데이터 미리보기</div>
                                        </div>
                                    </div>                                    
                                </div>
                            </div>

                            {/* 활용 예시 / 통계 */}
                            <div className="col-7">
                                <div className="card px-3 py-2">
                                    <div className="row">
                                        <div className="col">
                                            <div className="fw-bold">활용 예시 / 통계</div>
                                        </div>
                                    </div>                                    
                                </div>
                            </div>
                        </div>

                        
                        

                    </div>

                    





                    {/* 우측 다운로드 기능 */}
                    <div className="col-3">
                        {/* 파일 형식, 다운로드 */}
                        <div className="row mb-3">
                            <div className="col">
                                <div className="card px-3 py-2">
                                    <div className="row mb-3">
                                        <div className="col">
                                            <div className="fw-bold ">
                                                <span>파일 다운로드</span>
                                                <i className="bi bi-info-circle ms-2 text-secondary "></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col sm-text fw-bold">
                                            지원 형식
                                        </div>
                                    </div>
                                    
                                    {/* 파일 형식 목록 */}
                                    <div className="row">
                                        <div className="col">
                                            <div className="row g-2 mb-2">
                                                <FileCardForm></FileCardForm>
                                                <FileCardForm></FileCardForm>
                                                <FileCardForm></FileCardForm>
                                                <FileCardForm></FileCardForm>
                                                <FileCardForm></FileCardForm>
                                            </div>
                                        </div>       
                                    </div>

                                    {/* 다운로드 버튼 */}
                                    <div className="row mb-4">
                                        <div className="col">
                                            <button className="btn btn-primary form-control">
                                                <i className="bi bi-download me-2"></i>
                                                다운로드
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                        {/* 다운로드 안내 */}
                        <div className="row">
                            <div className="col">
                                <div className="card px-3 py-3 bg-primary-subtle border-0">
                                    <div className="row mb-2">
                                        <div className="col">
                                            <div style={{fontSize: "13px"}} className="fw-bold">
                                                <i className="bi bi-info-circle me-2 text-primary"></i>
                                                <span >다운로드 안내</span>
                                            </div>              
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="sm-text">
                                                <span>데이터 다운로드는 로그인 없이 가능하며, 이력 저장 혹은 특정 파일은 </span>
                                                <Link to="/login" className="text-decoration-none">로그인</Link>
                                                <span>이 필요할 수 있습니다.</span>
                                            </div>
                                        </div>
                                    </div>
                      
                                </div>
                            </div>
                        </div>

                    </div>




                </div>
                


            </div>
            
        </>
    )
}

export default UserDatasetDetailPage;