import { Link } from "react-router-dom";
import TopTitle from "../../components/TopTitle";
import "../../style/download.css";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import { useState } from "react";
import { datasetDetailDummy } from "../../dummy/datasetDetailDummy";
import {MapContainer, TileLayer, GeoJSON} from "react-leaflet"
import { dummyCctvGeoJson } from "../../geojson/dummyCctvGeoJson";

function DatasetSummaryCard(){

    const datasetSummaryInfo = datasetDetailDummy.datasetSummary

    return(
        <>
            <div className="col">
                <div className="card px-3 py-3">
                    <div className="row">
                        {
                            datasetSummaryInfo.map((item, index) => (
                                <DatasetSummaryCardCol
                                    key={index}
                                    title={item.title}
                                    content={item.content}
                                    borderShow={index !== datasetSummaryInfo.length - 1}
                                >
                                    <i className={`bi ${item.icon}`}></i>
                                </DatasetSummaryCardCol>
                            ))
                        }
                    </div>
                </div>
            </div>        
        </>
    )
}

function DatasetSummaryCardCol({children, title, content, borderShow}){
    return(
        <>
            <div className={`col ${borderShow ? "border-end" : ""}`}>
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

// 데이터 개요
function DatasetInfoCard(){
    return(
        <>
            <div className="col-5 pe-0">
                <div className="card px-3 py-2 h-100">
                    <div className="row mb-2">
                        <div className="col">
                            <div className="fw-bold">데이터 개요</div>
                        </div>
                    </div>   
                    <div className="row g-0 d-flex align-items-center ">
                        <div className="col-6">

                            <DatasetInfoRow type="left" top={true} title="데이터 명" content="서울시 CCTV 위치 데이터"/>{/* [sd_gis_dataset]title */}
                            <DatasetInfoRow type="left" title="제공기관" content="서울특별시"/>{/* [sd_gis_dataset]provider */}
                            <DatasetInfoRow type="left" title="지역" content="서울시"/>{/*  */}
                            <DatasetInfoRow type="left" title="등록일" content="2024-05-20"/>{/* [sd_gis_dataset]created_at */}
                            <DatasetInfoRow type="left" title="업데이트일" content="2024-05-21"/>{/* [sd_gis_dataset]updated_at */}

                        </div>
                        <div className="col-6 border-start">
                            
                            <DatasetInfoRow type="right" top={true} title="조회수" content="123"/>{/* [sd_dataset_stat]view_count */}
                            <DatasetInfoRow type="right" title="데이터유형" content="시설물 / 보안"/>{/* [sd_data_category]category_name */}
                            <DatasetInfoRow type="right" title="좌표계" content="EPSG:4326 (WGS 84)"/>{/* [sd_gis_dataset]storage_srid */}
                            <DatasetInfoRow type="right" title="파일 크기" content="12.4 MB"/>{/* [sd_gis_dataset_file]file_size */}
                            <DatasetInfoRow type="right" title="형식" content="CSV"/>{/* [sd_gis_dataset_file]file_extension */}

                        </div>
                    </div>    
                    <div className="row mb-2">
                        <div className="col-12">
                            <div className="row border-bottom dataset-content">
                                <div className="col-2 bg-light fw-bold p-2" style={{fontSize: "10px"}}>설명</div>
                                <div className="col-10 dataset-text-gray p-2 fw-bold line-clamp-2">12311111111111111123123</div>{/* [sd_gis_dataset]description */}
                            </div>                                            
                        </div>
                    </div>          

                </div>
            </div>        
        </>
    )
}


function DatasetInfoRow({title, content, type, top = false}){
    return(
        <>
            <div className={`row border-bottom ${type == "left" ? "me-0" : "ms-0"} ${top ? "border-top" : ""}`} >
                <div className="col-4 bg-light dataset-text p-2" >{title}</div>
                <div className="col-8 dataset-text-gray p-2 fw-bold">{content}</div>
            </div>       
        </>
    )
}

// 지도 시각화
function MapVisualizationCard(){
    return(
        <>
            <div className="col-7">
                <div className="card px-3 py-2 h-100">
                    <div className="row mb-2">
                        <div className="col">
                            <div className="fw-bold">지도 시각화</div>
                        </div>
                    </div>
                    {/* 각기 버튼 표현 */}
                    <MapOptionButton />

                    {/* 지도 이미지 */}
                    <div className="row mb-2">
                        <div className="col">
                            <div className="map-preview-box">
                                {
                                    true ?
                                    <>
                                        {/* <img    src={mapPreviewImg} 
                                                alt="지도 미리보기" 
                                                className="img-fluid rounded w-100 h-100 object-fit-cover"/>
                                        <MapControlButton /> */}

                                        <MapContainer
                                            center={[37.5665, 126.9780]}
                                            zoom={10}
                                            className="w-100 h-100 rounded"
                                            
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution="&copy; OpenStreetMap contributors"
                                            />                                            
                                            <GeoJSON data={dummyCctvGeoJson} />
                                        </MapContainer>
                                    </>
                                    :
                                    <div className="d-flex align-items-center h-100 w-100 justify-content-center">
                                        지도 정보가 없습니다.
                                        <i className="bi bi-map fs-1 text-secondary mb-2"></i>
                                    </div>                                                    
                                }                                                
                            </div>
                        </div>
                    </div>
                    {/* 시뮬레이션 이동 버튼 */}
                    <div className="row">
                        <div className="col">
                            <div className="card bg-primary-subtle border-0 px-2 py-1">
                                <div className="row">
                                    <div className="col d-flex align-items-center">
                                        <span><i className="bi bi-info-circle text-primary mx-1" style={{fontSize: "15px"}}></i></span>
                                        <span className="dataset-text-gray">이 데이터를 시뮬레이션 페이지에서 분석을 진행할 수 있습니다.</span>
                                    </div>
                                    <div className="col-auto text-end">
                                        {/*[sd_gis_dataset]is_spatial(공간 데이터 유무) 가 "T"인가 확인 필요*/}
                                        <Link to="simulation" className="btn btn-primary btn-sm">
                                            <i className="bi bi-bar-chart me-2"></i>
                                            시뮬레이션으로 이동                                                                                       
                                        </Link>
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

function MapOptionButton(){
    return(
        <>

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

function MapControlButton(){
    return(
        <>
            <div className="map-control-group">
                <button className="btn btn-light btn-sm border rounded-2"><i className="bi bi-house-door"></i></button>
                <button className="btn btn-light btn-sm border rounded-top-2 rounded-bottom-0"><i className="bi bi-plus-lg"></i></button>
                <button className="btn btn-light btn-sm border rounded-bottom-2 rounded-top-0"><i className="bi bi-dash-lg"></i></button>
                <button className="btn btn-light btn-sm border rounded-2"><i className="bi bi-crosshair"></i></button>                                                            
            </div>        
        </>
    )
}

// 속성 데이터
function AttributePreviewCard(){
    return(
        <>
            <div className="col-12 ">
                <div className="card px-3 py-2">
                    <div className="row mb-1">
                        <div className="col">
                            <div className="fw-bold">속성 데이터 미리보기</div>
                        </div>
                    </div>    

                    <div className="row">
                        <div className="col">
                            {/* 나중에 API로 파일의 rows, columns를 받아서 map을 통해 출력하는 식으로 구현 */}
                            <div className="card overflow-hidden">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="col-1 dataset-text">ID</th>
                                            <th className="col-3 dataset-text">시설명</th>
                                            <th className="col-2 text-center dataset-text">자치구</th>
                                            <th className="col-2 text-center dataset-text">위도</th>
                                            <th className="col-2 text-center dataset-text">경도</th>
                                            <th className="col-1 text-center dataset-text">설치유형</th>
                                            <th className="col-1 text-center dataset-text">상태</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AttributePreviewRow />
                                        <AttributePreviewRow />
                                        <AttributePreviewRow />
                                        <AttributePreviewRow />
                                        <AttributePreviewRow />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>                                
                </div>
            </div>        
        </>
    )
}

function AttributePreviewRow(){
    return(
        <>
            <tr>
                <td className="col-1 dataset-text-gray">1</td>
                <td className="col-3 dataset-text-gray">강남역 사거리</td>
                <td className="col-2 text-center dataset-text-gray">강남구</td>
                <td className="col-2 text-center dataset-text-gray">37.123</td>
                <td className="col-2 text-center dataset-text-gray">127.123</td>
                <td className="col-1 text-center dataset-text-gray">고정형</td>
                <td className="col-1 text-center dataset-text-gray">운영중</td>
            </tr>
        </>
    )
}

// 파일 다운로드
function FileDownloadCard(){

    const [selectFileFormat, setSelectFileFormat] = useState("");

    const downloadFileInfo = datasetDetailDummy.files;



    // 다운로드 버튼 클릭했을 때 기능 넣기
    const downloadButtonClick = () => {
        console.log(selectFileFormat, "다운로드버튼 클릭"); 
    }
    return(
        <>
            <div className="row mb-2">
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
                                    {downloadFileInfo.map((item, index) => (
                                        <FileSelectButton 
                                            key={index}
                                            type={item.type}
                                            color={item.color}
                                            size={item.size}
                                            selectFileFormat={selectFileFormat}
                                            setSelectFileFormat={setSelectFileFormat}     
                                        />
                                    ))}
                                </div>
                            </div>       
                        </div>

                        {/* 다운로드 버튼 */}
                        <div className="row mb-4">
                            <div className="col">
                                <button className="btn btn-primary form-control" onClick={downloadButtonClick}>
                                    <i className="bi bi-download me-2"></i>
                                    다운로드
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>        
        </>
    )
}

function FileSelectButton({type, color, size, selectFileFormat, setSelectFileFormat}){
    

    // const fileFormatButtonClick = async () => {
    //     await setSelectFileFormat(type)
    //     console.log(selectFileFormat, "파일 형식 클릭");
    // }

    return(
        <>
            <div className="col-6 mb-2">
                <button className={`btn border w-100 p-2 text-start pe-0 
                        ${selectFileFormat === type ? `border-${color} border-2 bg-${color}-subtle` : ""}
                        `} 
                        onClick={() => setSelectFileFormat(type)}>
                    <div>
                        <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle me-1`}>{type}</span>
                        <span className="fw-bold text-secondary" style={{fontSize: "12px"}}>({size})</span>
                    </div>
                </button>
            </div>        
        </>
    )
}


// 다운로드 안내
function DownloadNoticeCard(){
    return(
        <>
            <div className="row mb-2">
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
                                <div className="dataset-text-gray">
                                    <span>데이터 다운로드는 로그인 없이 가능하며, 이력 저장 혹은 특정 파일은 </span>
                                    <Link to="/login" className="text-decoration-none">로그인</Link>
                                    <span>이 필요할 수 있습니다.</span>
                                </div>
                            </div>
                        </div>
            
                    </div>
                </div>
            </div>        
        </>
    )
}


// 관련데이터
function RelatedDatasetCard(){
    const relatedDatasetInfo = datasetDetailDummy.relatedDatasets

    return(
        <>
            <div className="row">
                <div className="col">
                    <div className="card p-3 pb-1">
                        <div className="row mb-3">
                            <div className="col">
                                <div className="fw-bold">관련 데이터</div>
                            </div>
                        </div>
                        <div className="row">                            
                            {relatedDatasetInfo.map((item, index) => (
                                <RelatedDatasetCardRow 
                                    key={index}
                                    id={item.id}
                                    title={item.title}
                                    borderShow={index !== relatedDatasetInfo.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>        
        </>
    )
}

function RelatedDatasetCardRow({id, title, borderShow = true}){
    return(
        <>  
            <div className="col-12 mb-3">
                <Link to={`../${id}`} className="text-decoration-none">
                    <div className={`${borderShow ? "border-bottom pb-3" : ""}  `} style={{fontSize: "13px"}}>
                        <div className="row">
                            <div className="col text-primary fw-bold">
                                {title}    
                            </div>
                            <div className="col-auto">
                                <span className="text-dark"><i className="bi bi-chevron-right"></i></span>
                            </div>
                        </div>
                    </div>                
                </Link>
            </div>        
        </>
    )
}

// 빠른 기능 버튼
function QuickActionCard(){
    return(
        <>
            <div className="row mt-2">
                <div className="col">
                    <div className="card p-3 pb-0">
                        <QuickActionButton content="관심 데이터 담기">
                            <i className="bi bi-star me-2"></i>
                        </QuickActionButton>
                        <QuickActionButton content="목록으로">
                            <i className="bi bi-list-task me-2"></i>
                        </QuickActionButton>                        
                    </div>
                </div>
            </div>        
        </>
    )
}


function QuickActionButton({children, content, onClick}){
    return(
        <>
            <button className="form-control p-2 text-center mb-3"
                    onClick={onClick}>
                <div className="fw-bold text-secondary">
                    {children}
                    {content}
                </div>
            </button>        
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
                            <div className="col text-end">
                                <Link to="../main">목록으로</Link>
                            </div>
                        </div>

                        {/* 데이터셋 요약 정보 */}
                        <div className="row mb-2">
                            <DatasetSummaryCard />
                        </div>
                        
                        <div className="row mb-3">
                            {/* 데이터 개요 */}
                            <DatasetInfoCard />
                            {/* 지도 시각화 */}
                            <MapVisualizationCard />
                        </div>

                        <div className="row">
                            {/* 속성 데이터 미리보기 */}
                            <AttributePreviewCard />
                        </div>
                    </div>

                    
                    {/* 우측 다운로드 기능 */}
                    <div className="col-3">
                        {/* 파일 형식, 다운로드 */}
                        <FileDownloadCard />

                        {/* 다운로드 안내 */}
                        <DownloadNoticeCard />

                        {/* 관련 데이터 */}
                        <RelatedDatasetCard />
                        
                        {/* 빠른 기능 버튼 */}
                        <QuickActionCard />
                    </div>




                </div>
            </div>
            <Link to="simulationTest">시뮬레이션 테스트</Link><br />
            <Link to="simulationTest2">시뮬레이션 테스트2</Link><br />
            <Link to="simulationTest3">시뮬레이션 테스트3</Link>
        </>
    )
}

export default UserDatasetDetailPage;