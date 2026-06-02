import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosinstance";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// 지도 카메라를 데이ㅓ 바운더리에 딱 맞게 줌인/이동시켜주는 전담 카메라맨
function FitBoundsToData({ data }) {
    const map = useMap();   // 현재 지도의 조종간을 가져옴

    useEffect(() => {
        if (data && data.features.length > 0) {
            // GeoJSON 데이터를 바탕으로 동서남북 끄트머리 (Bounds)를 계산함
            const geoJsonLayer = L.geoJSON(data);
            const bounds = geoJsonLayer.getBounds();

            // 계산된 바운더리가 유효하다면 카메라 이동
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        }
    }, [data, map]);

    return null;
}

function AdminApprovalDetailPage() {
    const navigate = useNavigate();
    const { datasetId } = useParams();

    // =====================================================================
    // 1. 상태(State) 관리
    // =====================================================================
    const [datasetInfo, setDatasetInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);    
    
    // 지도 데이터를 담을 State
    const [mapData, setMapData] = useState(null);   // 가공된 GeoJSON 데이터
    const [isMapLoading, setIsMapLoading] = useState(true); // 지도 전용 로딩
    
    // 승인 처리 중 버튼 비활성화를 위한 상태
    const [isApproving, setIsApproving] = useState(false); 

    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");

    // 반려 처리 중 버튼 비활성화를 위한 상태
    const [isRejecting, setIsRejecting] = useState(false);

    // =====================================================================
    // 2. 백엔드 API에서 데이터 가져오기 (useEffect)
    // =====================================================================
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsMapLoading(true);
            
            try {
                // 1. 기존 데이터셋 상세 정보 가져오기
                const detailResponse = await axiosInstance.get(`/api/admin/approvals/${datasetId}`);
                setDatasetInfo(detailResponse.data);

                // 2. 지도 시각화 데이터 가져오기
                const mapResponse = await axiosInstance.get(`/api/admin/approvals/${datasetId}/map-data`);
                const rawFeatures = mapResponse.data;

                // 3. SHP, TIFF처럼 데이터가 0개면 null로 처리 (미리보기 미지원)
                if (rawFeatures.length === 0) {
                    setMapData(null);
                } else {
                    // 백엔드에서 온 500개의 문자열 데이터를 Leaflet 표준 규격(FeatureCollection)으로 강제 조립
                    const geoJsonCollection = {
                        type: "FeatureCollection",
                        features: rawFeatures.map(item => ({
                            type: "Feature",
                            properties: {
                                featureName: item.featureName,
                                spatialType: item.spatialType
                            },
                            // 문자열을 찐 JSON 객체로 변환!
                            geometry: JSON.parse(item.geoJson) 
                        }))
                    };
                    setMapData(geoJsonCollection);
                }
                
                setError(null);
            } catch (err) {
                console.error("데이터 조회 실패:", err);
                if (err.response && err.response.status === 403) {
                    alert(err.response.data || "로그인이 필요합니다."); 
                    navigate("/login"); 
                    return; 
                } else if (err.response && err.response.status === 404) {
                    setError("해당 데이터셋을 찾을 수 없거나 이미 처리되었습니다.");
                } else {
                    setError("데이터를 불러오는 중 에러가 발생했습니다.");
                }
            } finally {
                setIsLoading(false);
                setIsMapLoading(false);
            }
        };

        fetchData();
    }, [datasetId, navigate]);

    // =====================================================================
    // 🚀 3. [핵심] 최종 승인 연동 로직
    // =====================================================================
    const handleApprove = async () => {
        if (window.confirm("정말 이 데이터셋을 최종 승인하시겠습니까?")) {
            setIsApproving(true); // 💡 로딩 스피너 작동 및 버튼 비활성화 (따닥 방어 1차)
            
            try {
                // 백엔드의 무결점 승인 파이프라인 호출! (토큰은 axiosInstance가 알아서 싣고 감)
                const response = await axiosInstance.post(`/api/admin/approvals/${datasetId}/approve`);
                
                // 백엔드에서 보낸 성공 메시지("데이터셋이 성공적으로...") 출력
                alert(`✅ ${response.data}`); 
                navigate("/upload/admin/approveList"); // 목록으로 쿨하게 이동

            } catch (err) {
                console.error("최종 승인 에러:", err);
                
                if (err.response) {
                    // 백엔드 컨트롤러가 잡아낸 400(논리적 에러) 또는 500(DB 에러) 메시지를 그대로 띄움
                    alert(`🚨 승인 실패: ${err.response.data}`);
                    
                    // 만약 400 에러("이미 처리되었거나...")라면 새로고침해서 상태를 동기화
                    if (err.response.status === 400) {
                        window.location.reload();
                    }
                } else {
                    alert("🚨 서버와 통신 중 문제가 발생했습니다.");
                }
            } finally {
                setIsApproving(false); // 💡 스피너 종료
            }
        }
    };

    // (반려 로직은 추후 반려 API를 만들면 같은 방식으로 연결해주면 됩니다!)
    const toggleRejectForm = () => {
        setShowRejectForm(!showRejectForm);
        setRejectError("");
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) {
            setRejectError("반려 사유를 반드시 작성해야 합니다.");
            return;
        }
        setRejectError("");
        if (window.confirm("사유를 첨부하여 정말 반려하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 임시 데이터가 삭제됩니다.")) {
            setIsRejecting(true);   // 스피너 작동 및 버튼 비활성화

            try {
                // 백엔드로 POST 요청 발송 (JSON 바디에 반려 사유 포함)
                const response = await axiosInstance.post(
                    `/api/admin/approvals/${datasetId}/reject`, 
                    { rejectReason: rejectReason }
                );

                alert(`✅ ${response.data}`);
                navigate("/upload/admin/approveList");
            } catch (err) {
                console.error("반려 처리 에러: ", err);

                if (err.response) {
                    alert(`🚨 반려 실패: ${err.response.data}`);

                    // 이미 처리된 상태라면 새로고침해서 상태 동기화
                    if (err.response.status === 400) {
                        window.location.reload();
                    }
                } else {
                    alert("🚨 서버와 통신 중 문제가 발생했습니다.");
                }
            } finally {
                setIsRejecting(false); // 스피너 종료
            }
        }
    };

    // =====================================================================
    // 4. 에러 및 로딩 화면 가드
    // =====================================================================
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger d-inline-block px-5 py-4 rounded-4 shadow-sm" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3"></i>
                    <h5 className="fw-bold">{error}</h5>
                    <button className="btn btn-outline-danger mt-3" onClick={() => navigate(-1)}>뒤로 가기</button>
                </div>
            </div>
        );
    }

    if (!datasetInfo) return null;

    // =====================================================================
    // 5. 화면 UI
    // =====================================================================
    return (
        <div className="container py-5" style={{ maxWidth: '68.75rem' }}>
            
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                <button 
                    className="btn btn-light border-0 me-3 rounded-circle p-2 d-flex align-items-center justify-content-center"
                    onClick={() => navigate(-1)}
                    style={{ width: '3rem', height: '3rem' }}
                    title="목록으로 돌아가기"
                >
                    <i className="bi bi-arrow-left fs-4"></i>
                </button>
                <div>
                    <h2 className="fw-bolder text-dark mb-1" style={{ fontSize: '1.75rem' }}>데이터 상세 검토</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>업로드된 데이터의 공간 정보와 상세 내역을 확인하고 승인/반려를 결정합니다.</p>
                </div>
            </div>

            {/* 데이터셋 요약 정보 카드 */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4 border-bottom pb-2" style={{ fontSize: '1.25rem' }}>데이터셋 요약 정보</h5>
                    <div className="row g-4">
                        <div className="col-md-3">
                            <span className="d-block text-muted small mb-1" style={{ fontSize: '0.875rem' }}>요청자 (소속)</span>
                            <span className="fw-bold text-dark" style={{ fontSize: '1.125rem' }}>{datasetInfo?.username} <span className="fw-normal text-secondary" style={{ fontSize: '0.9rem' }}>({datasetInfo?.organization})</span></span>
                        </div>
                        <div className="col-md-5">
                            <span className="d-block text-muted small mb-1" style={{ fontSize: '0.875rem' }}>데이터셋 제목</span>
                            <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '1.125rem' }}>{datasetInfo?.title}</span>
                        </div>
                        <div className="col-md-2">
                            <span className="d-block text-muted small mb-1" style={{ fontSize: '0.875rem' }}>총 건수</span>
                            <span className="fw-bold text-primary" style={{ fontSize: '1.125rem' }}>{datasetInfo?.successCount?.toLocaleString()} <span className="text-muted" style={{ fontSize: '0.9rem' }}>건</span></span>
                        </div>
                        <div className="col-md-2">
                            <span className="d-block text-muted small mb-1" style={{ fontSize: '0.875rem' }}>신청 일자</span>
                            <span className="text-dark" style={{ fontSize: '1rem' }}>{datasetInfo?.createdAt?.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 시각화 카드 */}
            <div className="card shadow-sm border-0 rounded-4 mb-5">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>공간 데이터 시각화 검증</h5>
                        <span className="badge bg-secondary" style={{ fontSize: '0.875rem' }}>EPSG:4326</span>
                    </div>

                    {/* 🚀 지도가 들어갈 25rem짜리 컨테이너 (여백 밖으로 안 삐져나가게 overflow-hidden) */}
                    <div className="bg-light rounded-3 border overflow-hidden position-relative" style={{ height: '25rem', zIndex: 0 }}>
                        
                        {/* Case 1: 로딩 중일 때 */}
                        {isMapLoading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                <span className="text-muted fw-bold">지도 데이터를 불러오는 중입니다...</span>
                            </div>
                        ) : 
                        
                        /* Case 2: SHP, TIFF처럼 프리패스되어 그릴 데이터가 아예 없을 때 */
                        !mapData ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                <i className="bi bi-map-fill text-secondary opacity-25 mb-3" style={{ fontSize: '4rem' }}></i>
                                <h6 className="fw-bold text-secondary mb-1">지도 미리보기를 지원하지 않는 포맷입니다.</h6>
                                <span className="text-muted small">SHP(ZIP) 또는 GeoTIFF 파일은 별도의 데스크톱 GIS 소프트웨어를 통해 확인해 주세요.</span>
                            </div>
                        ) : 
                        
                        /* Case 3: 정상적인 GeoJSON 데이터가 있을 때 (대망의 렌더링!) */
                        (
                            <MapContainer 
                                center={[37.5665, 126.9780]} // 기본 중앙값 (서울 시청) -> 어차피 FitBounds가 덮어씌움
                                zoom={8} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                {/* 1. 배경 지도 (오픈스트리트맵 타일) */}
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                
                                {/* 2. 아까 만든 카메라맨 (자동 줌인) */}
                                <FitBoundsToData data={mapData} />

                                {/* 3. 500개의 데이터를 그려주는 핵심 컴포넌트 */}
                                <GeoJSON 
                                    data={mapData}
                                    
                                    // [디테일 1] 점(POINT) 데이터를 예쁜 파란색 동그라미(Circle)로 그려주는 옵션 (성능 최적화)
                                    pointToLayer={(feature, latlng) => {
                                        return L.circleMarker(latlng, {
                                            radius: 6,
                                            fillColor: "#0d6efd", // 부트스트랩 프라이머리 블루
                                            color: "#ffffff",
                                            weight: 2,
                                            opacity: 1,
                                            fillOpacity: 0.8
                                        });
                                    }}
                                    
                                    // [디테일 2] 선이나 면을 예쁜 파란색으로 그려주는 스타일
                                    style={{
                                        color: "#0d6efd",
                                        weight: 3,
                                        opacity: 0.7,
                                        fillColor: "#0d6efd",
                                        fillOpacity: 0.2
                                    }}

                                    // [디테일 3] 각각의 객체를 클릭했을 때 이름이 말풍선(Popup)으로 뜨게 하는 설정
                                    onEachFeature={(feature, layer) => {
                                        if (feature.properties && feature.properties.featureName) {
                                            layer.bindPopup(
                                                `<div class="text-center">
                                                    <span class="badge bg-primary mb-1">${feature.properties.spatialType}</span><br/>
                                                    <strong style="font-size: 1.1rem;">${feature.properties.featureName}</strong>
                                                </div>`
                                            );
                                        }
                                    }}
                                />
                            </MapContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* 🚀 버튼 영역 (isApproving 상태에 따라 스피너 및 비활성화 적용) */}
            <div className="d-flex justify-content-end gap-3 border-top pt-4">
                <button 
                    className={`btn px-4 py-2 fw-bold ${showRejectForm ? 'btn-secondary' : 'btn-outline-danger'}`} 
                    style={{ fontSize: '1.125rem' }}
                    onClick={toggleRejectForm}
                    disabled={isApproving}
                >
                    {showRejectForm ? '반려 취소' : '반려 처리'}
                </button>
                <button 
                    className="btn btn-primary px-5 py-2 fw-bold d-flex align-items-center justify-content-center" 
                    style={{ fontSize: '1.125rem', minWidth: '160px' }}
                    onClick={handleApprove}
                    disabled={showRejectForm || isApproving}
                >
                    {isApproving ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            승인 중...
                        </>
                    ) : (
                        "최종 승인"
                    )}
                </button>
            </div>

            {/* 반려 사유 작성 폼 */}
            {showRejectForm && (
                <div className="card border-danger mt-4 bg-danger bg-opacity-10 rounded-4 shadow-sm" style={{ animation: 'fadeInDown 0.3s ease-out' }}>
                    <div className="card-body p-4">
                        <h6 className="fw-bold text-danger mb-3" style={{ fontSize: '1.125rem' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>반려 사유 작성 (필수)
                        </h6>
                        <textarea 
                            className={`form-control ${rejectError ? 'is-invalid' : ''}`}
                            rows="4"
                            placeholder="연구자에게 전달할 반려 사유를 상세하게 적어주세요. (예: 데이터의 위치가 한국 영토를 벗어납니다.)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{ fontSize: '1rem', resize: 'none' }}
                        ></textarea>
                        
                        {rejectError && (
                            <div className="text-danger mt-2 fw-bold" style={{ fontSize: '0.9rem' }}>
                                {rejectError}
                            </div>
                        )}

                        <div className="text-end mt-3">
                            <button 
                                className="btn btn-danger px-4 fw-bold"
                                onClick={submitReject}
                                disabled={isApproving || isRejecting}
                            >
                                {isRejecting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        처리 중...
                                    </>
                                ) : (
                                    "사유 확인 및 반려 확정"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            
        </div>
    );
}

export default AdminApprovalDetailPage;