import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../commons/api/axiosinstance';
// import axiosInstance from '../../../commons/api/axiosinstance'; // 백엔드 연결 시 주석 해제

function MyUploadListPage() {
    const navigate = useNavigate();
    
    const [datasetList, setDatasetList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 반려 사유 모달(Modal) 상태 관리
    const [showModal, setShowModal] = useState(false);
    const [selectedRejection, setSelectedRejection] = useState(null);

    // =====================================================================
    // 1. 임시 가짜 데이터 세팅 (백엔드 완성 전까지 UI 테스트용)
    // =====================================================================
    useEffect(() => {
        const fetchMyUploads = async () => {
            setIsLoading(true)

            try {
                const response = await axiosInstance.get('/api/upload/my-uploads');

                // 백엔드가 포장해준 데이터(MyUploadResponseDto 리스트)를 State에 저장
                setDatasetList(response.data);
            } catch (err) {
                console.error("업로드 내역 조회 실패:", err);
                if (err.response && err.response.status === 401) {
                    alert("로그인이 만료되었습니다.");
                    navigate("/login");
                } else {
                    alert("데이터를 불러오는 중 문제가 발생했습니다.");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchMyUploads();
    }, [navigate]);

    // =====================================================================
    // 2. 상태별 뱃지(Badge) 색상 및 텍스트 렌더링 함수
    // =====================================================================
    const getStatusBadge = (status) => {
        switch (status) {
            case 'REQUEST':
                return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">심사 대기중</span>;
            case 'APPROVED':
                return <span className="badge bg-success px-3 py-2 rounded-pill">승인 완료</span>;
            case 'REJECTED':
                return <span className="badge bg-danger px-3 py-2 rounded-pill">반려됨</span>;
            default:
                return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
        }
    };

    // =====================================================================
    // 3. 반려 사유 모달 열기/닫기 함수
    // =====================================================================
    const openRejectionModal = (rejectionDetails) => {
        setSelectedRejection(rejectionDetails);
        setShowModal(true);
    };

    const closeRejectionModal = () => {
        setShowModal(false);
        setSelectedRejection(null);
    };

    // =====================================================================
    // 4. 화면 UI
    // =====================================================================
    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            
            {/* 상단 헤더 영역 */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bolder text-dark mb-2">나의 데이터 업로드 내역</h2>
                    <p className="text-muted mb-0">
                        내가 요청한 데이터셋의 처리 상태를 확인하고, 반려된 경우 사유를 조회할 수 있습니다.
                    </p>
                </div>
                <button className="btn btn-primary fw-bold px-4" onClick={() => navigate('/upload')}>
                    <i className="bi bi-plus-lg me-2"></i>신규 데이터 업로드
                </button>
            </div>

            {/* 리스트 영역 */}
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : datasetList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                            업로드한 데이터 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th className="py-3">No.</th>
                                        <th className="py-3 text-start">데이터셋 제목</th>
                                        <th className="py-3">카테고리</th>
                                        <th className="py-3">포맷</th>
                                        <th className="py-3">업로드 일시</th>
                                        <th className="py-3">상태</th>
                                        <th className="py-3">비고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasetList.map((item, index) => (
                                        <tr key={item.datasetId}>
                                            <td className="text-muted">{item.datasetId}</td>
                                            <td className="text-start fw-bold text-dark">{item.title}</td>
                                            <td>{item.category}</td>
                                            <td><span className="badge bg-light text-secondary border">{item.fileFormat}</span></td>
                                            <td className="text-muted small">{item.createdAt.split(' ')[0]}</td>
                                            <td>{getStatusBadge(item.status)}</td>
                                            <td>
                                                {/* 상태가 REJECTED일 때만 '사유 보기' 버튼 활성화 */}
                                                {item.status === 'REJECTED' ? (
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger fw-bold"
                                                        onClick={() => openRejectionModal(item.rejectionDetails)}
                                                    >
                                                        <i className="bi bi-search me-1"></i>사유 보기
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ===================================================================== */}
            {/* 🚨 반려 사유 조회 모달 (showModal 상태에 따라 표시) */}
            {/* ===================================================================== */}
            {showModal && selectedRejection && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 rounded-4 shadow-lg">
                                <div className="modal-header bg-danger bg-opacity-10 border-bottom-0 pt-4 px-4">
                                    <h5 className="modal-title fw-bold text-danger">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>승인 반려 사유
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeRejectionModal}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="bg-light p-3 rounded-3 mb-3 border">
                                        <p className="mb-2 text-dark" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                                            {selectedRejection.rejectReason}
                                        </p>
                                    </div>
                                    <div className="d-flex justify-content-between text-muted small px-1">
                                        <span><i className="bi bi-person-fill me-1"></i>심사관: {selectedRejection.adminName}</span>
                                        <span><i className="bi bi-clock-fill me-1"></i>반려 일시: {selectedRejection.rejectedAt}</span>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-secondary fw-bold w-100" onClick={closeRejectionModal}>
                                        확인
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default MyUploadListPage;