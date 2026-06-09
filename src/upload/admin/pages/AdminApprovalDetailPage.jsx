import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosinstance";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

function FitBoundsToData({ data }) {
    const map = useMap();

    useEffect(() => {
        if (data && data.features.length > 0) {
            const geoJsonLayer = L.geoJSON(data);
            const bounds = geoJsonLayer.getBounds();
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

    const [datasetInfo, setDatasetInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);    
    const [mapData, setMapData] = useState(null);   
    const [isMapLoading, setIsMapLoading] = useState(true); 
    const [isApproving, setIsApproving] = useState(false); 
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    
    // 🚀 다운로드 로딩 상태 추가
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsMapLoading(true);
            
            try {
                const detailResponse = await axiosInstance.get(`/api/admin/approvals/${datasetId}`);
                setDatasetInfo(detailResponse.data);

                const fileFormat = detailResponse.data.fileFormat;
                if (fileFormat !== 'SHP' && fileFormat !== 'TIFF') {
                    const mapResponse = await axiosInstance.get(`/api/admin/approvals/${datasetId}/map-data`);
                    const rawFeatures = mapResponse.data;

                    if (rawFeatures.length === 0) {
                        setMapData(null);
                    } else {
                        const geoJsonCollection = {
                            type: "FeatureCollection",
                            features: rawFeatures.map(item => ({
                                type: "Feature",
                                properties: {
                                    featureName: item.featureName,
                                    spatialType: item.spatialType
                                },
                                geometry: JSON.parse(item.geoJson) 
                            }))
                        };
                        setMapData(geoJsonCollection);
                    }
                } else {
                    setMapData(null);
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
    // 🚀 [신규 추가] 원본 파일 다운로드 핸들러
    // =====================================================================
    const handleDownloadOriginal = async () => {
        setIsDownloading(true);
        try {
            // blob 타입으로 받아와야 파일이 깨지지 않습니다.
            const response = await axiosInstance.get(`/api/admin/approvals/${datasetId}/download`, {
                responseType: 'blob'
            });
            
            // 파일명 추출 (백엔드에서 넘겨준 이름)
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `${datasetInfo.title}_원본데이터`; 
            
            if (contentDisposition && contentDisposition.includes('filename=')) {
                fileName = decodeURIComponent(contentDisposition.split('filename=')[1].replace(/['"]/g, ''));
            } else {
                fileName += datasetInfo.fileFormat ? `.${datasetInfo.fileFormat.toLowerCase()}` : '.zip';
            }

            // 가상의 다운로드 링크를 만들어 클릭 이벤트를 발생시킴
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("다운로드 실패:", err);
            alert("파일 다운로드에 실패했습니다. 관리자에게 문의하세요.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleApprove = async () => {
        if (window.confirm("정말 이 데이터셋을 최종 승인하시겠습니까?")) {
            setIsApproving(true); 
            try {
                const response = await axiosInstance.post(`/api/admin/approvals/${datasetId}/approve`);
                alert(`✅ ${response.data}`); 
                navigate("/upload/admin/approveList"); 
            } catch (err) {
                console.error("최종 승인 에러:", err);
                if (err.response) {
                    alert(`🚨 승인 실패: ${err.response.data}`);
                    if (err.response.status === 400) window.location.reload();
                } else {
                    alert("🚨 서버와 통신 중 문제가 발생했습니다.");
                }
            } finally {
                setIsApproving(false); 
            }
        }
    };

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
            setIsRejecting(true);
            try {
                const response = await axiosInstance.post(
                    `/api/admin/approvals/${datasetId}/reject`, 
                    { rejectReason: rejectReason }
                );
                alert(`✅ ${response.data}`);
                navigate("/upload/admin/approveList");
            } catch (err) {
                if (err.response) {
                    alert(`🚨 반려 실패: ${err.response.data}`);
                    if (err.response.status === 400) window.location.reload();
                } else {
                    alert("🚨 서버와 통신 중 문제가 발생했습니다.");
                }
            } finally {
                setIsRejecting(false); 
            }
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger d-inline-block px-5 py-4 rounded-4 shadow-sm">
                    <i className="bi bi-exclamation-triangle-fill fs-1 text-danger d-block mb-3"></i>
                    <h5 className="fw-bold">{error}</h5>
                    <button className="btn btn-outline-danger mt-3" onClick={() => navigate(-1)}>뒤로 가기</button>
                </div>
            </div>
        );
    }

    if (!datasetInfo) return null;

    return (
        <div className="container-fluid px-4 py-3" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            
            {/* 🚀 상단 타이틀 영역 (우측 끝에 다운로드 버튼 배치) */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center">
                    <button 
                        className="btn btn-light border me-3 d-flex align-items-center justify-content-center"
                        onClick={() => navigate(-1)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    >
                        <i className="bi bi-arrow-left fs-5"></i>
                    </button>
                    <div>
                        <h2 className="fw-bolder text-dark mb-1" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                            {datasetInfo.title}
                        </h2>
                        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                            업로드된 데이터의 공간 정보와 상세 내역을 검토하고 승인/반려를 결정합니다.
                        </p>
                    </div>
                </div>
                
                {/* 🚀 원본 다운로드 버튼 */}
                <div>
                    <button 
                        className="btn btn-dark fw-bold rounded-3 shadow-sm px-4 py-2 d-flex align-items-center"
                        onClick={handleDownloadOriginal}
                        disabled={isDownloading}
                        style={{ transition: 'all 0.2s' }}
                    >
                        {isDownloading ? (
                            <><span className="spinner-border spinner-border-sm me-2 text-warning" role="status" aria-hidden="true"></span>가져오는 중...</>
                        ) : (
                            <><i className="bi bi-cloud-arrow-down-fill text-warning me-2 fs-5"></i>원본 데이터 다운로드</>
                        )}
                    </button>
                </div>
            </div>

            {/* 메인 2단 레이아웃 */}
            <div className="row g-4">
                {/* 좌측: 데이터 개요 (col-lg-4) */}
                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
                            <h5 className="fw-bold mb-0 text-dark">데이터 개요</h5>
                        </div>
                        <div className="card-body p-4">
                            <table className="table table-borderless mb-0">
                                <tbody>
                                    <tr className="border-bottom">
                                        <td className="text-secondary fw-bold" style={{ width: '40%', fontSize: '0.9rem' }}>데이터셋 제목</td>
                                        <td className="text-dark fw-semibold" style={{ fontSize: '0.95rem' }}>{datasetInfo.title}</td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>요청자</td>
                                        <td className="text-dark" style={{ fontSize: '0.95rem' }}>{datasetInfo.username}</td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>소속 기관</td>
                                        <td className="text-dark" style={{ fontSize: '0.95rem' }}>{datasetInfo.organization || '-'}</td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>파일 포맷</td>
                                        <td>
                                            <span className="badge bg-light text-secondary border border-secondary border-opacity-25 px-2 py-1 font-monospace">
                                                {datasetInfo.fileFormat || '알 수 없음'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="border-bottom">
                                        <td className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>데이터 건수</td>
                                        <td className="text-primary fw-bold" style={{ fontSize: '1.05rem' }}>
                                            {(datasetInfo.fileFormat === 'SHP' || datasetInfo.fileFormat === 'TIFF') ? '원본 유지' : `${datasetInfo.successCount?.toLocaleString()} 건`}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>신청 일시</td>
                                        <td className="text-dark" style={{ fontSize: '0.95rem' }}>{datasetInfo.createdAt}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 우측: 시각화 및 검증 (col-lg-8) */}
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark">공간 데이터 검증</h5>
                            <span className="badge bg-secondary">EPSG:4326</span>
                        </div>
                        
                        <div className="card-body p-4 pt-2">
                            {/* 시각화 컨테이너 */}
                            <div className="rounded-3 border overflow-hidden position-relative" style={{ height: '35rem', zIndex: 0, backgroundColor: '#E9ECEF' }}>
                                
                                {isMapLoading ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <div className="spinner-border text-primary mb-3" role="status"></div>
                                        <span className="text-muted fw-bold">데이터를 불러오는 중입니다...</span>
                                    </div>
                                ) : datasetInfo.fileFormat === 'TIFF' ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-dark text-white text-center p-5">
                                        <i className="bi bi-image text-secondary opacity-50 mb-3" style={{ fontSize: '5rem' }}></i>
                                        <h4 className="fw-bold mb-2">TIFF 이미지 데이터</h4>
                                        <p className="text-light opacity-75 small mb-4" style={{ maxWidth: '400px' }}>
                                            웹 브라우저의 제약으로 인해 원본 TIFF 포맷의 렌더링이 제한됩니다. <br/>원본 파일 무결성 검사는 백엔드에서 완료되었습니다.
                                        </p>
                                        <span className="badge bg-secondary bg-opacity-25 border border-secondary px-3 py-2 rounded-pill">
                                            <i className="bi bi-hdd-fill me-2"></i>클라우드에 안전하게 보관 중
                                        </span>
                                    </div>
                                ) : datasetInfo.fileFormat === 'SHP' ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5" style={{ backgroundColor: '#F8FAFC' }}>
                                        <i className="bi bi-layers-fill text-primary opacity-25 mb-3" style={{ fontSize: '5rem' }}></i>
                                        <h4 className="fw-bold text-dark mb-2">벡터 데이터 (SHP)</h4>
                                        <p className="text-muted small mb-4" style={{ maxWidth: '400px' }}>
                                            다중 파일(zip)로 구성된 Shapefile은 상단의 <strong className="text-primary">원본 다운로드</strong> 버튼을 통해 내려받은 후 외부 GIS 프로그램에서 검수해 주세요.
                                        </p>
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">
                                            <i className="bi bi-check-circle-fill me-2"></i>필수 파일 무결성 검증 완료
                                        </span>
                                    </div>
                                ) : !mapData ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <i className="bi bi-map-fill text-secondary opacity-25 mb-3" style={{ fontSize: '4rem' }}></i>
                                        <h6 className="fw-bold text-secondary mb-1">시각화 데이터를 찾을 수 없습니다.</h6>
                                    </div>
                                ) : (
                                    <MapContainer center={[37.5665, 126.9780]} zoom={8} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <FitBoundsToData data={mapData} />
                                        <GeoJSON 
                                            data={mapData}
                                            pointToLayer={(feature, latlng) => L.circleMarker(latlng, { radius: 6, fillColor: "#0d6efd", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8 })}
                                            style={{ color: "#0d6efd", weight: 3, opacity: 0.7, fillColor: "#0d6efd", fillOpacity: 0.2 }}
                                            onEachFeature={(feature, layer) => {
                                                if (feature.properties && feature.properties.featureName) {
                                                    layer.bindPopup(`<div class="text-center"><span class="badge bg-primary mb-1">${feature.properties.spatialType}</span><br/><strong style="font-size: 1.1rem;">${feature.properties.featureName}</strong></div>`);
                                                }
                                            }}
                                        />
                                    </MapContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 승인/반려 액션 영역 */}
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4 d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-4">
                        {showRejectForm ? (
                            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 p-3 w-100" style={{ animation: 'fadeIn 0.3s' }}>
                                <h6 className="fw-bold text-danger mb-2"><i className="bi bi-exclamation-triangle-fill me-1"></i>반려 사유 작성</h6>
                                <textarea 
                                    className={`form-control ${rejectError ? 'is-invalid' : ''}`}
                                    rows="2" placeholder="연구자에게 전달할 반려 사유를 적어주세요."
                                    value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={{ resize: 'none' }}
                                ></textarea>
                                {rejectError && <div className="text-danger small mt-1 fw-bold">{rejectError}</div>}
                                <div className="mt-2 text-end">
                                    <button className="btn btn-sm btn-outline-secondary me-2 fw-bold" onClick={toggleRejectForm}>작성 취소</button>
                                    <button className="btn btn-sm btn-danger fw-bold px-3" onClick={submitReject} disabled={isRejecting}>
                                        {isRejecting ? '처리 중...' : '사유 첨부 및 반려 확정'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h6 className="fw-bold text-dark mb-1">최종 의사 결정</h6>
                                <p className="text-muted small mb-0">데이터 검토가 완료되었다면 우측 버튼을 통해 승인하거나 반려해 주세요.</p>
                            </div>
                        )}
                    </div>

                    {!showRejectForm && (
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-danger fw-bold px-4 py-2" onClick={toggleRejectForm} disabled={isApproving}>
                                반려 처리
                            </button>
                            <button className="btn btn-primary fw-bold px-5 py-2 shadow-sm" onClick={handleApprove} disabled={isApproving}>
                                {isApproving ? '승인 중...' : '최종 승인'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}

export default AdminApprovalDetailPage;