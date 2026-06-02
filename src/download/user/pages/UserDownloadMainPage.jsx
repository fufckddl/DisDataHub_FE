import { Link, useNavigate } from "react-router-dom";
import "../../style/download.css";
import TopTitle from "../../components/TopTitle";
import { datasetMainDummy } from "../../dummy/datasetMainDummy";
import { useEffect, useState } from "react";
import { getApprovedDownloadDatasetListApi, getDatasetDownloadPageApi } from "../../api/userDownloadApi";
import useAuthStore from "../../../commons/auth/useAuthStore";




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
                                <button className="me-3 border btn btn-light" style={{width: "150px"}}>
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
function DatasetList({datasetList, loading}){

 
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
                                    <th className="col-1 text-center">제공기관</th>
                                    <th className="col-1 text-center">등록일</th>
                                    <th className="col-1 text-center">파일 형식</th>
                                    <th className="col-1 text-center">다운로드 수</th>
                                    <th className="col-1 text-center">조회 수 </th>
                                    <th className="col-2 text-center">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasetList.length > 0 ? (
                                    datasetList.map((dataset) => (
                                        <DatasetForm
                                            key={dataset.id}
                                            dataset={dataset}
                                        />
                                    ))
                                ): (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-secondary">
                                            {loading ? "목록을 불러오는 중입니다." : "표시할 데이터셋이 없습니다."}
                                        </td>
                                    </tr>
                                )}
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

function DatasetForm({dataset}){

    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);

    const handleDetailPageClick = async (isPublic) => {
        if(!isPublic){
            if(userInfo == null){
                if(confirm("비공개 데이터셋입니다. 로그인 페이지로 이동하시겠습니까?")){
                    navigate("/login")
                }
                return;                
            }
            // alert("같은 소속기관 사용자만 접근할 수 있습니다.");
            // return;

            try {
                await getDatasetDownloadPageApi(dataset.id);
            } catch (error) {
                if (error?.response?.status === 403) {
                    alert("같은 소속기관 사용자만 접근할 수 있습니다.");
                    return;
                }

                alert("데이터셋 정보를 불러오지 못했습니다.");
                return;
            }

        }
        
        // navigate("/download/user/detail")
        navigate(`/download/user/${dataset.id}`)
    }

    return(
        <>
            <tr >
                <td className="col-2 text-primary fw-bold ps-3" style={{fontSize : "15px"}}>
                    <Link to={`/download/user/${dataset.id}`} className="text-decoration-none">{dataset.title}</Link>    
                </td>  
                
                <td className="col-3 sm-text text-secondary">{dataset.description}</td>
                <td className="col-1 sm-text text-secondary text-center">{dataset.provider}</td>
                <td className="col-1 sm-text text-secondary text-center">{dataset.createAt}</td>
                <td className="col-1 text-center">
                    <span className="badge bg-success-subtle text-success border border-success-subtle me-1">{dataset.fileExtension}</span>
                </td>
                <td className="col-1 sm-text text-secondary text-center">{dataset.downloadCount}</td>
                {/* <td className="col-1 text-center">
                    <span className="badge bg-success-subtle text-success border border-success-subtle me-1">{dataset.status}</span>
                </td> */}
                <td className="col-1 sm-text text-secondary text-center">{dataset.viewCount}</td>
                <td className="col-2 sm-text text-center">
                    {/* 상세보기 할 때 데이터 조회 권환 확인 필요 */}
                    <button className="btn btn-light btn-sm sm-text border text-secondary me-4" onClick={() => handleDetailPageClick(dataset.isPublic)}>상세보기</button>
                    <button className="btn btn-primary btn-sm" style={{fontSize: "13px"}} >다운로드</button>
                </td>
            </tr> 
        </>
    )
}

function CardForm({children, color, title, content, caption}){
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
                            {/* <div className="text-secondary" style={{fontSize: "12px"}}>승인된 데이터 기준</div> */}
                            <div className="text-secondary" style={{ fontSize: "12px" }}>
                                {caption}
                            </div>                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function Paging(){
    const pageNumbers = [1, 2, 3, 4, 5];

    return(
        <>
            {/* 페이징 하단 바 UI */}
            <div className="download-pagination-bar">
                <div className="download-pagination-total">전체 1,248건</div>

                <div className="download-pagination-center">
                    <button type="button" className="download-pagination-arrow disabled" aria-label="첫 페이지">
                        <i className="bi bi-chevron-double-left"></i>
                    </button>
                    <button type="button" className="download-pagination-arrow disabled" aria-label="이전 페이지">
                        <i className="bi bi-chevron-left"></i>
                    </button>

                    {pageNumbers.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            className={`download-pagination-number ${pageNumber === 1 ? "active" : ""}`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <span className="download-pagination-ellipsis">...</span>
                    <button type="button" className="download-pagination-number">125</button>

                    <button type="button" className="download-pagination-arrow" aria-label="다음 페이지">
                        <i className="bi bi-chevron-right"></i>
                    </button>
                    <button type="button" className="download-pagination-arrow" aria-label="마지막 페이지">
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
                </div>

                <div className="download-pagination-size">
                    <select className="form-select form-select-sm">
                        <option>10개씩 보기</option>
                        <option>20개씩 보기</option>
                        <option>50개씩 보기</option>
                    </select>
                </div>
            </div>
        </>
    )
}

function UserDownloadMainPage(){

    const [apiDatasetList, setApiDatasetList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const datasetList = apiDatasetList ?? [];

    const formatNumber = (value) => {
        return new Intl.NumberFormat("ko-KR").format(value ?? 0);
    };

    const totalDownloadCount = datasetList.reduce(
        (sum, item) => sum + Number(item.downloadCount ?? 0),
        0
    );

    const supportedFormatCount = new Set(
        datasetList
            .map((item) => item.fileExtension)
            .filter((item) => item && item !== "-")
    ).size;

    const popularDataset = datasetList.reduce((best, current) => {
        if (!best) return current;

        return Number(current.downloadCount ?? 0) > Number(best.downloadCount ?? 0)
            ? current
            : best;
    }, null);

    console.log("popularDataset : ", popularDataset)
    const summaryCards = [
        {
            color: "primary",
            title: "전체 데이터 수",
            content: `${formatNumber(datasetList.length)}건`,
            caption: "승인 데이터 기준",
            icon: "bi-layers-fill",
        },
        {
            color: "success",
            title: "오늘 다운로드 수 ",
            content: `${formatNumber(totalDownloadCount)}건`,
            caption: "전일 대비, (전날 비교)",
            icon: "bi-download",
        },
        {
            color: "warning",
            title: "지원 파일 형식",
            content: `${formatNumber(supportedFormatCount)}종`,
            caption: "목록에서 확인된 형식",
            icon: "bi-file-earmark-text-fill",
        },
        {
            color: "danger",
            title: "인기 데이터",
            content: popularDataset?.title ?? "-",
            caption: popularDataset
                ? `누적 다운로드 ${formatNumber(Number(popularDataset.downloadCount ?? 0))}건`
                : "다운로드 데이터 없음",
            icon: "bi-fire",
        },
    ];    

    // console.log("datasetList : ",datasetList);

    useEffect(() => {
        const fetchDatasetList = async () => {
            try{
                setLoading(true);
                setErrorMessage("");
                const response = await getApprovedDownloadDatasetListApi();
                console.log("response.data :" , response.data)
                const mappedList = response.data.map((item) => ({
                    id: String(item.datasetId),
                    title: item.title,
                    description: item.description,
                    provider: item.provider,
                    createAt: item.createdAt ? item.createdAt.slice(0, 10) : "-",
                    isPublic: item.isPublic,
                    fileExtension: item.fileExtension ?? "-",
                    downloadCount: item.downloadCount ?? 0,
                    viewCount: item.viewCount ?? 0,
                    
                }))

                setApiDatasetList(mappedList);
            }catch(e){
                setErrorMessage("데이터셋 목록을 불러오지 못했습니다.");
            }finally{
                setLoading(false);
            }
        };

        fetchDatasetList();
    }, [])

    return(
        <>

            <div className="container-fluid px-4 py-3">

                {/* 상단 제목 */}
                <TopTitle title="GIS 데이터 다운로드" subTitle="승인된 공공 GIS 데이터를 조회하고 파일을 다운로드 할 수 있습니다." showGuide={true}/>

                {/* 검색창 */}
                <Search />


                {/* 중간 데시보드 카드 */}
                <div className="row mb-3">
                    {summaryCards.map((card, index) => (
                        <CardForm
                            key={index}
                            color={card.color}
                            title={card.title}
                            content={card.content}
                            caption={card.caption}
                        >
                            <i className={` bi ${card.icon} fs-3`}></i>    
                        </CardForm>
                    ))}
                    {/* <CardForm color="primary" title="전체 데이터 수" content="1,234건">
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
                    </CardForm> */}
                </div>


                {/* 승인 데이터셋 목록 */}

                <DatasetList  datasetList={datasetList} loading={loading}/>


              

            </div>


        </>
    )
}

export default UserDownloadMainPage;
