import { Link, useNavigate, useParams } from "react-router-dom";
import TopTitle from "../../components/TopTitle";
import "../../style/download.css";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import { useEffect, useState } from "react";
import { datasetDetailDummy } from "../../dummy/datasetDetailDummy";
import {MapContainer, TileLayer, GeoJSON, useMap} from "react-leaflet"
import L from "leaflet"
import { dummyCctvGeoJson } from "../../geojson/dummyCctvGeoJson";
import { downloadFileApi, getDatasetDownloadPageApi, uploadTempTestFileApi, getDatasetPreviewGeoJsonApi, downloadDatasetByFormatApi } from "../../api/userDownloadApi";

function DatasetSummaryCard({dataset, stats, sourceFile}){

    // 날짜 형식 변환
    const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
    };    

    const formatSrid = (value) => {
        if (!value) return "-";

        // 좌표계 형식 변환
        const sridMap = {
            4326: "EPSG:4326 (WGS84)",
            5179: "EPSG:5179 (Korea 2000 / Unified CS)",
            5181: "EPSG:5181 (Korea 2000 / Central Belt)",
            5186: "EPSG:5186 (Korea 2000 / Central Belt 2010)",
            5187: "EPSG:5187 (Korea 2000 / East Belt 2010)",
            5188: "EPSG:5188 (Korea 2000 / East Sea Belt 2010)",
        };

        return sridMap[value] ?? `EPSG:${value}`;
    };        

    const datasetSummaryInfo = [
        { title: "등록일", content: formatDate(dataset?.createdAt) ?? "-", icon: "bi-calendar-event" },
        { title: "제공기관", content: dataset?.provider ?? "-", icon: "bi-building" },
        { title: "좌표계", content: formatSrid(dataset?.storageSrid) ?? "-", icon: "bi-bullseye" },
        { title: "원본 형식", content: sourceFile?.fileExtension ?? "-", icon: "bi-file-earmark" },
        { title: "다운로드 수", content: stats?.downloadCount ?? 0, icon: "bi-download" },
    ];


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
                        <div className="fw-bold dataset-summary-value" >{content}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

// 데이터 개요
function DatasetInfoCard({dataset, stats, sourceFile}){

    const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
    };    

    // 파일 크기 형식변환
    const formatFileSize = (value) => {
        if (value == null || value === "") return "-";

        const bytes = Number(value);
        if (Number.isNaN(bytes)) return value;

        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };
    
    const formatSrid = (value) => {
        return `EPSG:${value}`;
    }
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

                        <div className="col">
                            <DatasetInfoPairRow
                                leftTitle="데이터명" leftContent={dataset?.title ?? "-"} 
                                rightTitle="조회수" rightContent={stats?.viewCount ?? "-"} top={true}
                            /> 
                            <DatasetInfoPairRow
                                leftTitle="제공기관" leftContent={dataset?.provider ?? "-"}
                                rightTitle="데이터유형" rightContent={dataset?.category ?? "-"}
                            />
                            <DatasetInfoPairRow
                                leftTitle="지역" leftContent="서울시"
                                rightTitle="좌표계" rightContent={formatSrid(dataset?.storageSrid) ?? "-"}
                            />
                            <DatasetInfoPairRow
                                leftTitle="등록일" leftContent={formatDateTime(dataset?.createdAt)}
                                rightTitle="파일 크기" rightContent={formatFileSize(sourceFile?.fileSize)}
                            />
                            <DatasetInfoPairRow
                                leftTitle="업데이트일" leftContent={formatDateTime(dataset?.updatedAt)}
                                rightTitle="형식" rightContent={sourceFile?.fileExtension ?? "-"}
                            />

                        </div>
                

                        {/* 추가 부분 */}
                        

                    </div>    
                    <div className="row mb-2">
                        <div className="col-12">
                            <div className="row border-bottom dataset-content">
                                <div className="col-2 bg-light fw-bold p-2" style={{fontSize: "10px"}}>설명</div>
                                <div className="col-10 dataset-text-gray p-2 fw-bold line-clamp-2">{dataset?.description ?? "-"}</div>{/* [sd_gis_dataset]description */}
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
                <div className="col-8 dataset-text-gray p-2 fw-bold dataset-value-wrap">{content}</div>
            </div>       
        </>
    )
}

function DatasetInfoPairRow({ leftTitle, leftContent, rightTitle, rightContent, top = false }) {
    return (
        <>
        <div className={`row  border-bottom ${top ? "border-top" : ""}`}>
            <div className="col-2 bg-light dataset-text p-2">{leftTitle}</div>
            <div className="col-4 dataset-text-gray p-2 fw-bold dataset-value-wrap">{leftContent}</div>
            <div className="col-2 bg-light dataset-text p-2 border-start">{rightTitle}</div>
            <div className="col-4 dataset-text-gray p-2 fw-bold dataset-value-wrap">{rightContent}</div>
        </div>        
        </>
    );
}

// 지도 시각화
function MapVisualizationCard({previewGeoJson, dataset}){
    
    const isSpatialDataset = Boolean(dataset.isSpatial);

    const hasPreviewFeatures =
        Array.isArray(previewGeoJson?.features) &&
        previewGeoJson.features.some((feature) => feature?.geometry);

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
                                {!isSpatialDataset?(
                                    <div className="d-flex align-items-center h-100 w-100 justify-content-center">
                                        공간 데이터가 아니므로 지도 시각화를 제공할 수 없습니다
                                    </div>
                                ):!hasPreviewFeatures ?(
                                    <div className="d-flex align-items-center h-100 w-100 justify-content-center">
                                        표시할 수 있는 공간 좌표 데이터가 없습니다.
                                    </div>
                                ):(
                                    <MapContainer
                                        center={[36.5, 127.8]}
                                        zoom={7}
                                        className="w-100 h-100 rounded"
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap contributors"
                                        />
                                        {previewGeoJson && <MapBoundsUpdater geoJsonData={previewGeoJson} />} {/* 코드 안에서 계산/조작 하기 위한 용도 */}
                                        {previewGeoJson && <GeoJSON data={previewGeoJson} />}  {/* 지도를 실제로 그리는 기술 */}
                                        
                                    </MapContainer>
                                )}           
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
                                        <span className="dataset-text-gray">
                                            {dataset.isSpatial ?
                                                "이 데이터를 시뮬레이션 페이지에서 분석을 진행할 수 있습니다."
                                                :
                                                "공간 데이터가 아니므로 시뮬레이션을 사용할 수 없습니다."
                                            }
                                        </span>

                                        
                                    </div>
                                    <div className="col-auto text-end">
                                        {
                                            isSpatialDataset ? (
                                                <Link to="simulationTest" className="btn btn-primary btn-sm">
                                                    <i className="bi bi-bar-chart me-2"></i>
                                                    시뮬레이션으로 이동                                                                                       
                                                </Link>
                                            ):(
                                                <span title="공간 데이터가 아닌 경우 시뮬레이션을 사용할 수 없습니다.">
                                                    <button className="btn btn-secondary btn-sm" disabled>
                                                        <i className="bi bi-bar-chart me-2"></i>
                                                        시뮬레이션으로 이동
                                                    </button>
                                                </span>
                                            )
                                        }
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

// 지도 중심 잡기위한 컴포넌트
function MapBoundsUpdater({ geoJsonData }) {
    const map = useMap();

    useEffect(() => {
        if (!geoJsonData) return;

        const layer = L.geoJSON(geoJsonData);
        const bounds = layer.getBounds();  
        // -> 레이어가 차지하는 최대/최소 좌표 범위 측정 
        // -> 동서남북 가장 끝 값

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] }); 
            // -> bounds를 기준으로 화면에 다 보이도록 자동 조정
        }
    }, [geoJsonData, map]);

    return null;
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
function FileDownloadCard({ availableFormats, sourceFile, dataset }){

    const [selectFileFormat, setSelectFileFormat] = useState("");

  

    const formatColorMap = {
        CSV: "success",
        GeoJSON: "warning",
        SHP: "info",
        // GeoTIFF: "primary",
        KML: "danger",
    };

    


    // const downloadButtonClick = async () => {
    //     if (!sourceFile?.filePath || !sourceFile?.storedFilename || !sourceFile?.originalFilename) {
    //         alert("다운로드할 원본 파일 정보가 없습니다.");
    //         return;
    //     }
        
    //     try{
    //         const response = await downloadFileApi({
    //             filePath: sourceFile.filePath,
    //             storedFilename: sourceFile.storedFilename,
    //             originalFilename: sourceFile.originalFilename,
    //         });

    //         const blob = response.data; // blob = 웹 프론트엔드에서 파일 데이터 자체를 담는 객체
    //         const url = window.URL.createObjectURL(blob); // Blob을 브라우저가 읽을 수 있는 URL로 변환

    //         const a = document.createElement("a"); // a태그 생성
    //         a.href = url;  // href 에 url 넣기
    //         a.download = sourceFile.originalFilename;

            
    //         document.body.appendChild(a);
    //         a.click();
    //         document.body.removeChild(a);

    //         window.URL.revokeObjectURL(url);
    //     }catch(e){
    //         if(e.response.status == "404"){
    //             alert("다운로드할 파일을 찾을 수 없습니다.(S3연동되면 해결)")
    //             return;
    //         }

    //         if(e.response.status == "403"){
    //             alert("다운로드 할 권한이 없습니다.")
    //             return;
    //         }

    //         alert("파일 다운로드 중 오류가 발생했습니다.")
    //     }

    // };    

const downloadButtonClick = async () => {
    // 1. 먼저 형식을 고르기
    if (!selectFileFormat) {
        alert("다운로드 형식을 먼저 선택해주세요.");
        return;
    }

    try {
        // 2. 프론트는 파일 형식(원본인지, 변환인지)을 상관하지 않고 항상 같은 API 호출
        // 원본, 변환은 백에서 판단
        const response = await downloadDatasetByFormatApi(dataset.datasetId, selectFileFormat);

        const blob = response.data;
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        // 파일명은 응답 헤더에서 받는 게 더 정확하지만,
        // 1차는 형식 기반 기본 파일명으로 내려도 됨
        a.download = `${dataset.title}.${selectFileFormat.toLowerCase()}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
    } catch (e) {
        // 원본 형식인데 S3에 파일이 없을 때
        if (e?.response?.status === 404) {
            alert("원본 파일 또는 변환 대상 데이터를 찾을 수 없습니다.(S3연동 시 업로드 된 원본파일 다운로드 가능)");
            return;
        }

        // 지원하지 않는 형식
        if (e?.response?.status === 400) {
            alert("지원하지 않는 다운로드 형식입니다.");
            return;
        }

        if(e?.response?.stauts == 501){
            alert("해당 형식은 아직 준비 중입니다.")
            return;
        }
        if(e?.response?.stauts == 403){
            alert("다운로드 권한이 없습니다.");
            return;
        }

        alert("파일 다운로드 중 오류가 발생했습니다.");
    }
};    

    // 파일 크기 형식변환
    const formatFileSize = (value) => {
        if (value == null || value === "") return "-";

        const bytes = Number(value);
        if (Number.isNaN(bytes)) return value;

        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };    



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
                                    {availableFormats.map((format) => (
                                        <FileSelectButton
                                        key={format}
                                        type={format}
                                        color={formatColorMap[format] ?? "secondary"}
                                        size={formatFileSize(sourceFile?.fileSize) ?? "-"}
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
function RelatedDatasetCard({ relatedDatasets }){

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
                            {relatedDatasets.map((item, index) => (
                                <RelatedDatasetCardRow 
                                    key={index}
                                    id={item.id}
                                    title={item.title}
                                    borderShow={index !== relatedDatasets.length - 1}
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
    

    const datasetTitleInfo = {
        title: "서울시 CCTV 위치 데이터",
        subTitle: "서울시 관내에 설치된 CCTV의 위치 및 속성 정보를 제공합니다. 도시 안전, 방범, 교통 관리 등 다양한 정책 및 서비스에 활용할 수 있습니다."
    };

    const handleLoginClick = () =>{
        console.log("클릭")
    }




    const uploadFile = async () => {
        const response = await uploadTempTestFileApi();
        console.log("업로드 응답:", response.data);
        window.lastUpload = response.data;
    };



    const downloadFile = async () => {
        if (!window.lastUpload) {
            console.log("먼저 업로드를 실행하세요.");
            alert("파일을 업로드 후 다운로드를 진행해 주세요")
            return;
        }

        const response = await downloadFileApi({
            filePath: window.lastUpload.filePath,
            storedFilename: window.lastUpload.storedFilename,
            originalFilename: window.lastUpload.originalFilename,
        });

        const text = await response.data.text();
        console.log("다운로드 내용:", text);

        const blob = response.data;
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = window.lastUpload.originalFilename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);        
    };

    const { datasetId } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);  //로딩중일때를 확인하기 위한 상태
    const [errorMessage, setErrorMessage] = useState("");
    const [accessDenied, setAccessDenied] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [previewGeoJson, setPreviewGeoJson] = useState(null);
    

    const navigate = useNavigate();
    
    console.log("pageData : ",pageData);
    useEffect(() => {
    const fetchPageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            // 상세정보 API
            const response = await getDatasetDownloadPageApi(datasetId);
            setPageData(response.data);

            try{
                // GeoJson 지도 정보 API
                const previewResponse = await getDatasetPreviewGeoJsonApi(datasetId);

                const previewData =
                    typeof previewResponse.data === "string"
                        ? JSON.parse(previewResponse.data)
                        : previewResponse.data;

                setPreviewGeoJson(previewData);
            }catch(previewError){
                console.error("지도 미리보기 로드 실패:", previewError);
                setPreviewGeoJson(null);
            }
        } catch (e) {
            // 권한 오류
            if(e?.response?.status === 403){
                setAccessDenied(true);
                setErrorMessage("페이지를 확인할 수 있는 권한이 존재하지 않습니다.");
                return;
            }
            // 페이지 부제 오류
            if(e?.response?.status === 404){
                setNotFound(true);
                console.log("404 오류 발생")
                setErrorMessage("존재하지 않는 데이터셋입니다.");
                navigate("/download/user/main")
                return;
            }            
            // 위의 에러가 아닐 경우 에러
            setErrorMessage("상세 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    fetchPageData();
    }, [datasetId, navigate]);


    // console.log(loading)
    const viewData = pageData;

    //  초반 로딩중일 때
    if(loading){
        return(
            <div className="container-fluid px-4 py-3">
                <div>
                    상세 데이터를 불러오는 중입니다...
                </div>                
            </div>
        )
    }


    if (!viewData) {
        return (
            <div className="container-fluid px-4 py-3">
                <div className="alert alert-warning">
                    {errorMessage || "상세 데이터를 불러오지 못했습니다."}
                </div>
                <Link to="/download/user/main">목록으로 돌아가기</Link>
            </div>
        );
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
                                {/* <TopTitle title={datasetTitleInfo.title} subTitle={datasetTitleInfo.subTitle} showGuide={false}/> */}
                                <TopTitle title={viewData.dataset.title} subTitle={viewData.dataset.description} showGuide={false}/>
                            </div>
                            <div className="col text-end">
                                <Link to="../main">목록으로</Link>
                            </div>
                        </div>

                        {/* 데이터셋 요약 정보 */}
                        <div className="row mb-2">
                            <DatasetSummaryCard 
                                dataset={viewData.dataset}
                                stats={viewData.stats}
                                sourceFile={viewData.sourceFile}                            
                            />
                        </div>
                        
                        <div className="row mb-3">
                            {/* 데이터 개요 */}
                            <DatasetInfoCard 
                                dataset={viewData.dataset}
                                stats={viewData.stats}
                                sourceFile={viewData.sourceFile}                             
                            />
                            {/* 지도 시각화 */}
                            <MapVisualizationCard 
                                previewGeoJson={previewGeoJson}
                                dataset={viewData.dataset}
                            />
                        </div>

                        <div className="row">
                            {/* 속성 데이터 미리보기 */}
                            <AttributePreviewCard />
                        </div>
                    </div>

                    
                    {/* 우측 다운로드 기능 */}
                    <div className="col-3">
                        {/* 파일 형식, 다운로드 */}
                        <FileDownloadCard 
                            availableFormats={viewData.availableFormats}
                            sourceFile={viewData.sourceFile}                        
                            dataset={viewData.dataset}                        
                        />

                        {/* 다운로드 안내 */}
                        <DownloadNoticeCard />

                        {/* 관련 데이터 */}
                        <RelatedDatasetCard relatedDatasets={datasetDetailDummy.relatedDatasets} />
                        
                        {/* 빠른 기능 버튼 */}
                        <QuickActionCard />
                    </div>




                </div>
            </div>
            <Link to="simulation">초기 시물레이션</Link><br />
            <Link to="simulationTest">시뮬레이션 테스트</Link><br />
            <Link to="simulationTest2">시뮬레이션 테스트2</Link><br />
            <Link to="simulationTest3">시뮬레이션 테스트3</Link><br />
            

            <button onClick={uploadFile}>파일업로드</button>
            <button onClick={downloadFile}>파일다운로드</button>

        </>
    )
}

export default UserDatasetDetailPage;