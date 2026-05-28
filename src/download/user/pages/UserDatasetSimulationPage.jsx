import TopTitle from "../../components/TopTitle";
import mapPreviewImg from "../../../assets/images/map-preview.png";
import "leaflet/dist/leaflet.css"
import {MapContainer, TileLayer, GeoJSON} from "react-leaflet";
import { dummyCctvGeoJson } from "../../geojson/dummyCctvGeoJson";
import { dummyFloodRiskGeoJson } from "../../geojson/dummyFloodRiskGeoJson";
import { dummyGeojsonCopy } from "../../geojson/dummyGeojsonCopy";

// 시뮬레이션 설정
function SimulationControlPanel(){
    return(
        <>

            <div className="card p-2">
                <div className="fw-bold mb-2">시물레이션 설정</div>
                <div className="row">
                    <div className="col">
                        <div className="sm-text mb-1">시각화 방식</div>
                        <div className="mb-2">
                            <div className="btn-group w-100" role="group" aria-label="Basic radio toggle button group">

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" defaultChecked />
                                <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio1">마커</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                                <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio2">HeatMap</label>

                                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                                <label className="btn btn-outline-primary btn-sm" htmlFor="btnradio3">영역표시</label>
                            </div>
                        </div> 
                    </div>
                </div>

                <div className="row mb-2">
                    <div className="col">
                        <div className="sm-text fw-bold">레이어 설정</div>
                        <div className="row">
                            <div className="col">
                                <input type="checkBox" className="me-2" />
                                <span className="sm-text">CCTV 위치</span>
                            </div>
                            <div className="col">
                                <input type="checkBox" className="me-2" />
                                <span className="sm-text">행정구역</span>
                            </div>
                            <div className="col">
                                <input type="checkBox" className="me-2" />
                                <span className="sm-text">주요도로</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="row mb-2">
                    <div className="col">
                        <div className="sm-text-black mb-2">필터 설정</div>
                        <div className="row mb-2">
                            <div className="col-4">
                                <span className="sm-text">자치구</span>
                            </div>
                            <div className="col-8">
                                <select className="form-select select" name="" id="">
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-4">
                                <span className="sm-text">운영 상태</span>
                            </div>
                            <div className="col-8">
                                <select className="form-select select" name="" id="">
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-4">
                                <span className="sm-text">설치유형</span>
                            </div>
                            <div className="col-8">
                                <select className="form-select select" name="" id="">
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                    <option value="1">1</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-2">
                    <div className="col">
                        <div className="sm-text-black mb-2">분석 파라미터</div>
                        <div className="row mb-2">
                            <div className="col">
                                <div className="sm-text">밀집도 반경</div>
                                <div className="row">
                                    <div className="col-8">
                                        <input type="range" className="w-100" />
                                    </div>
                                    <div className="col-4">
                                        <div className="card p-2">
                                            <span className="sm-text">500m</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="sm-text">CCTV 수</div>
                                <div className="row">
                                    <div className="col-8">
                                        <input type="range" className="w-100" />
                                    </div>
                                    <div className="col-4">
                                        <div className="card p-2">
                                            <span className="sm-text">500m</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col pe-1">
                        <button className="form-control btn btn-primary" style={{fontSize: "13px"}}>
                            <i className="bi bi-caret-right me-2"></i>
                            시뮬레이션 실행
                        </button>
                    </div>
                    <div className="col ps-1">
                        <button className="form-control btn btn-light border" style={{fontSize: "13px"}}>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            초기화
                        </button>
                    </div>
                </div>
            </div>          
        </>
    )
}

// 지도 결과
function SimulationMapView(){


    // export const dummyCctvGeoJson = {
    //     type: "FeatureCollection",
    //     features: [
    //         {
    //             type: "Feature",
    //             geometry: {
    //                 type: "Point",
    //                 coordinates: [127.027621, 37.497942]
    //             },
    //             properties: {
    //                 name: "강남역 CCTV",
    //                 district: "강남구",
    //                 status: "운영중"
    //             }
    //         }
    //     ]
    // };    

    return(
        <>
            <div className="col-8">
                <div className="card p-2">
                    <div className="row mb-2">
                        <div className="col">
                            <div className="fw-bold">지도 결과</div>
                        </div>
                        <div className="col text-end">
                            <button className="btn btn-sm border sm-text me-2"><i className="bi bi-layers me-1"></i>레이어</button>
                            <button className="btn btn-sm border sm-text me-2"><i className="bi bi-funnel me-1"></i>범례</button>
                            <button className="btn btn-sm border sm-text"><i className="bi bi-fullscreen"></i></button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                                {/* <img src={mapPreviewImg} alt="" className="img-fluid rounded w-100 h-100 object-fit-cover" /> */}

                                {/* leaflet */}
                                {/* MapContainer => 지도 영역 생성 */}
                                <MapContainer 
                                    center={[37.5665, 126.9780]}
                                    zoom={10}
                                    style={{ height: "465px", width: "100%" }}
                                    className="rounded"
                                    
                                > {/* TileLayer => 지도 그림(영약) 불러오기 */}           
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />

                                    {/* <GeoJSON data={dummyFloodRiskGeoJson} /> */}
                                    <GeoJSON data={dummyGeojsonCopy} />
                                </MapContainer>


                        </div>
                    </div>
                </div>
            </div>        
        </>
    )
}

// 분석 요약
function SimulationResultSummary(){
    return(
        <>
            <div className="col-4">
                <div className="card p-2 mb-2">
                    <div className="fw-bold">분석 요약</div>
                </div>
                <div className="card p-2 mb-2">
                    <div className="fw-bold">차트(상위~)</div>
                </div>
            </div>        
        </>
    )
}

// 분석 결과 테이블
function SimulationResultTable(){
    return(
        <>
            <div className="row">
                <div className="col">
                    <div className="card p-2">
                        <div className="fw-bold mb-2">분석 결과 테이블</div>
                        <table className="table table-bordered">
                            <thead className="bg-light">
                                <tr>
                                    <th>1</th>
                                    <th>1</th>
                                    <th>1</th>
                                    <th>1</th>
                                    <th>1</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>        
        </>
    )
}

function UserDatasetSimulationPage(){
    return(
        <>
            <div className="container-fluid px-4 py-3">
                {/* 상단 */}
                <div className="row mb-2">
                    <div className="col">
                        <TopTitle title="서울시 CCTV 위치 데이터 시뮬레이션"  subTitle="지도 시각화와 필터ㆍ분석을 통해 CCTV 분포와 밀집도를 확인할 수 있습니다." />
                    </div>
                </div>


                <div className="row">
                    {/* 왼쪽 요소 */}
                    <div className="col-3">
                        {/* 시물레이션 설정 */}
                        <SimulationControlPanel></SimulationControlPanel>
                    </div>

                    {/* 오른쪽 요소 */}
                    <div className="col-9">
                        <div className="row mb-2">
                            {/* 지도 결과 */}
                            <SimulationMapView></SimulationMapView>
                            {/* 분석요약*/}
                            <SimulationResultSummary></SimulationResultSummary>
                        </div> 
                        
                        {/* 분석 결과 테이블 */}
                        <SimulationResultTable></SimulationResultTable>
                    </div>
                </div>                
            </div>

        </>
    )
}

export default UserDatasetSimulationPage;