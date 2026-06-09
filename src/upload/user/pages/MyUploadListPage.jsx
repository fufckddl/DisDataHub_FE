import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../commons/api/axiosinstance';
import '../../../download/style/download.css';

// 🚀 Chart.js 라이브러리 임포트
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// ChartJS 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

function MyUploadListPage() {
    const navigate = useNavigate();
    
    // 🛑 상태 관리
    const [datasetList, setDatasetList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRejection, setSelectedRejection] = useState(null);
    
    // 🚀 [추가됨] 이용 가이드 모달 상태
    const [showGuideModal, setShowGuideModal] = useState(false);

    // 🛑 검색 및 필터 상태 관리
    const [searchTerm, setSearchTerm] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchFormat, setSearchFormat] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    // 🛑 페이징 상태 관리
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    // =====================================================================
    // 1. 데이터 불러오기
    // =====================================================================
    const fetchMyUploads = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get('/api/upload/my-uploads');
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

    useEffect(() => {
        fetchMyUploads();
    }, [navigate]);

    // =====================================================================
    // 🚀 삭제 핸들러 로직
    // =====================================================================
    const handleDelete = async (datasetId) => {
        if (!window.confirm("정말로 이 데이터셋을 영구 삭제하시겠습니까?\n서버 및 클라우드(S3)의 원본 파일이 모두 완벽하게 파기되며 복구할 수 없습니다.")) {
            return;
        }

        try {
            await axiosInstance.delete(`/api/upload/my-uploads/${datasetId}`);
            alert("데이터셋이 성공적으로 완전히 삭제되었습니다.");
            setDatasetList(prevList => prevList.filter(item => item.datasetId !== datasetId));
            if (currentItems.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (err) {
            console.error("삭제 요청 중 오류 발생:", err);
            alert(err.response?.data || "삭제 처리 중 내부 오류가 발생했습니다.");
        }
    };

    // =====================================================================
    // 2. 다중 필터링 로직 (교집합 검색)
    // =====================================================================
    const filteredList = datasetList.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = searchCategory === "" || item.category === searchCategory;
        const matchFormat = searchFormat === "" || item.fileFormat === searchFormat;
        const matchStatus = searchStatus === "" || item.status === searchStatus;

        return matchTitle && matchCategory && matchFormat && matchStatus;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchCategory, searchFormat, searchStatus, itemsPerPage]);

    const uniqueCategories = [...new Set(datasetList.map(item => item.category).filter(Boolean))];

    // =====================================================================
    // 3. 상단 대시보드 요약 통계 계산
    // =====================================================================
    const totalUploads = datasetList.length;
    const approvedCount = datasetList.filter(item => item.status === 'APPROVED').length;
    const pendingCount = datasetList.filter(item => item.status === 'REQUEST').length;
    const rejectedCount = datasetList.filter(item => item.status === 'REJECTED').length;

    // =====================================================================
    // 🚀 [우측 사이드바용 데이터 가공] 최근 업로드 5건 & 차트 통계
    // =====================================================================
    const recentUploads = datasetList.slice(0, 5); // 가장 최신 데이터 5개 컷

    // 포맷별 개수 카운팅 (차트용)
    const formatCounts = datasetList.reduce((acc, item) => {
        const fmt = item.fileFormat || '기타';
        acc[fmt] = (acc[fmt] || 0) + 1;
        return acc;
    }, {});

    // 차트용 색상 팔레트
    const chartColors = {
        'CSV': '#4F46E5',      // 파란색
        'GEOJSON': '#10B981',  // 초록색
        'SHP': '#8B5CF6',      // 보라색
        'EXCEL': '#F59E0B',    // 노란색
        'TIFF': '#EF4444',     // 빨간색
        '기타': '#9CA3AF'      // 회색
    };

    const chartData = {
        labels: Object.keys(formatCounts),
        datasets: [
            {
                data: Object.values(formatCounts),
                backgroundColor: Object.keys(formatCounts).map(fmt => chartColors[fmt] || chartColors['기타']),
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        cutout: '75%', 
        plugins: {
            legend: { display: false }, 
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return ` ${context.label}: ${context.raw}건`;
                    }
                }
            }
        }
    };

    // =====================================================================
    // 4. 페이징 처리 로직
    // =====================================================================
    const totalFilteredCount = filteredList.length;
    const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const getPageNumbers = (currentPage, totalPages) => {
        if (totalPages <= 0) return [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    };

    const pageNumbers = getPageNumbers(currentPage, totalPages);
    const hasPrevious = currentPage > 1;
    const hasNext = totalPages > 0 && currentPage < totalPages;

    // =====================================================================
    // 5. 부가 함수 (뱃지 렌더링, 모달 처리)
    // =====================================================================
    const getStatusBadge = (status) => {
        switch (status) {
            case 'REQUEST':
                return <span className="badge bg-warning text-dark px-2 py-2 rounded-3 fw-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>심사 대기중</span>;
            case 'APPROVED':
                return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-2 rounded-3 fw-bold">승인 완료</span>;
            case 'REJECTED':
                return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-2 rounded-3 fw-bold">반려됨</span>;
            default:
                return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
        }
    };

    const openRejectionModal = (rejectionDetails) => {
        setSelectedRejection(rejectionDetails);
        setShowModal(true);
    };

    const closeRejectionModal = () => {
        setShowModal(false);
        setSelectedRejection(null);
    };

    return (
        <div className="container-fluid px-4 py-3" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            
            {/* 🚀 상단 헤더 영역 */}
            <div className="justify-content-between align-items-end pb-3">
                <div className='row'>
                    <div className='col'>
                        <h2 className="fw-bolder text-dark mb-2">나의 데이터 업로드 내역</h2>
                    </div>
                    {/* 🚀 [추가됨] 가이드 버튼 및 업로드 버튼 나란히 배치 */}
                    <div className='col-auto d-flex gap-2'>
                        <button className="btn btn-white border bg-white fw-bold rounded-2 shadow-sm text-secondary" onClick={() => setShowGuideModal(true)}>
                            <i className="bi bi-question-circle-fill text-primary me-2"></i>이용 가이드
                        </button>
                        <button className="btn btn-outline-primary fw-bold rounded-2 shadow-sm" onClick={() => navigate('/upload/user/write')}>
                            <i className="bi bi-plus-lg me-2"></i>신규 데이터 업로드
                        </button>
                    </div>
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.8rem' }}>
                        내가 요청한 데이터셋의 처리 상태를 확인하고, 반려된 경우 사유를 조회할 수 있습니다.
                    </p>
                </div>
            </div>

            {/* 🚀 상단 요약 대시보드 카드 4개 (유지) */}
            {!isLoading && (
                <div className="row g-4 mb-4">
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100">
                            <div className="d-flex align-items-start">
                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-cloud-upload-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.875em' }}>총 업로드 요청</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '1.25rem' }}>{totalUploads.toLocaleString()}<span className="fs-6 fw-normal ms-1">건</span></div>
                                    <div className="text-secondary fw-bold mt-1" style={{ fontSize: '0.75em' }}>전체 요청 내역</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100">
                            <div className="d-flex align-items-start">
                                <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-check-circle-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.875em' }}>승인 완료</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '1.25rem' }}>{approvedCount.toLocaleString()}<span className="fs-6 fw-normal ms-1">건</span></div>
                                    <div className="text-secondary fw-bold mt-1" style={{ fontSize: '0.75em' }}>정상 승인된 데이터</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100">
                            <div className="d-flex align-items-start">
                                <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-hourglass-split fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.875em' }}>심사 대기중</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '1.25rem' }}>{pendingCount.toLocaleString()}<span className="fs-6 fw-normal ms-1">건</span></div>
                                    <div className="text-secondary fw-bold mt-1" style={{ fontSize: '0.75em' }}>관리자 검토 진행 중</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100">
                            <div className="d-flex align-items-start">
                                <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-dark" style={{ fontSize: '0.875em' }}>반려됨</div>
                                    <div className="fw-bold text-dark mt-1" style={{ fontSize: '1.25rem' }}>{rejectedCount.toLocaleString()}<span className="fs-6 fw-normal ms-1">건</span></div>
                                    <div className="text-secondary fw-bold mt-1" style={{ fontSize: '0.75em' }}>반려 사유 확인 필요</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🚀 화면 좌우 2단 분리 시작 */}
            <div className="row g-4">
                
                {/* 🟢 좌측 영역 (메인 테이블 및 검색바, 9칸 차지) */}
                <div className="col-xl-9 col-lg-8">
                    
                    {/* 멀티 필터 검색바 */}
                    {!isLoading && datasetList.length > 0 && (
                        <div className="card shadow-sm rounded-2 mb-3" style={{ backgroundColor: '#ffffff' }}>
                            <div className="card-body p-3 p-md-4">
                                <div className="row g-3 align-items-end">
                                    <div className="col-lg-4 col-md-12">
                                        <label className="form-label small fw-bold text-secondary mb-1">데이터셋 검색</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                            <input 
                                                type="text" 
                                                className="form-control border-start-0 ps-0" 
                                                placeholder="데이터명 입력" 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4">
                                        <label className="form-label small fw-bold text-secondary mb-1">카테고리</label>
                                        <select className="form-select text-dark" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                            <option value="">전체</option>
                                            {uniqueCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-lg-2 col-md-4">
                                        <label className="form-label small fw-bold text-secondary mb-1">파일 포맷</label>
                                        <select className="form-select text-dark" value={searchFormat} onChange={(e) => setSearchFormat(e.target.value)}>
                                            <option value="">전체</option>
                                            <option value="CSV">CSV</option>
                                            <option value="EXCEL">EXCEL</option>
                                            <option value="GEOJSON">GeoJSON</option>
                                            <option value="SHP">SHP</option>
                                            <option value="TIFF">TIFF</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-2 col-md-4">
                                        <label className="form-label small fw-bold text-secondary mb-1">처리 상태</label>
                                        <select className="form-select text-dark" value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                                            <option value="">전체</option>
                                            <option value="REQUEST">심사 대기중</option>
                                            <option value="APPROVED">승인 완료</option>
                                            <option value="REJECTED">반려됨</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-2 col-md-12">
                                        <button 
                                            className="btn btn-outline-secondary w-100 fw-bold" 
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSearchCategory("");
                                                setSearchFormat("");
                                                setSearchStatus("");
                                            }}
                                        >
                                            <i className="bi bi-arrow-repeat me-1"></i>초기화
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 메인 리스트 영역 */}
                    <div className="card shadow-sm rounded-2 overflow-hidden mb-4">
                        
                        {/* 🚀 커스텀 툴바 */}
                        {!isLoading && filteredList.length > 0 && (
                            <div className="download-list-toolbar">
                                <div className="download-list-total">전체 {totalFilteredCount.toLocaleString()}건</div>

                                <div className="download-list-controls">
                                    <select 
                                        className="form-select form-select-sm" 
                                        aria-label="페이지당 목록 수"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="10">10개씩 보기</option>
                                        <option value="20">20개씩 보기</option>
                                        <option value="50">50개씩 보기</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="card-body p-0">
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : datasetList.length === 0 ? (
                                <div className="text-center py-5 text-muted" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <i className="bi bi-inbox text-secondary opacity-25 d-block mb-3" style={{ fontSize: '4rem' }}></i>
                                    <h5 className="fw-bold text-dark mb-1">업로드한 데이터 내역이 없습니다.</h5>
                                    <p className="small">새로운 데이터를 업로드하여 시스템에 기여해 보세요!</p>
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div className="text-center py-5 text-muted" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <i className="bi bi-search text-secondary opacity-25 d-block mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h6 className="fw-bold text-dark mb-1">조건에 맞는 검색 결과가 없습니다.</h6>
                                    <p className="small">다른 검색어나 필터를 선택해 보세요.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-center" style={{ minWidth: '800px' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 text-muted fw-bold" style={{ width: '5%' }}>No.</th>
                                                <th className="py-3 text-start fw-bold" style={{ width: '32%' }}>데이터셋 제목</th>
                                                <th className="py-3 fw-bold" style={{ width: '12%' }}>카테고리</th>
                                                <th className="py-3 fw-bold" style={{ width: '10%' }}>포맷</th>
                                                <th className="py-3 fw-bold" style={{ width: '13%' }}>업로드 일시</th>
                                                <th className="py-3 fw-bold" style={{ width: '12%' }}>상태</th>
                                                <th className="py-3 fw-bold" style={{ width: '16%' }}>비고</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((item) => (
                                                <tr key={item.datasetId}>
                                                    <td className="text-muted small">{item.datasetId}</td>
                                                    <td className="text-start">
                                                        <span className="fw-bolder text-dark" style={{ fontSize: '1.05rem' }}>{item.title}</span>
                                                    </td>
                                                    <td className="text-secondary">{item.category}</td>
                                                    <td>
                                                        <span className="badge bg-light text-secondary border px-2 py-1 font-monospace">{item.fileFormat}</span>
                                                    </td>
                                                    <td className="text-muted small">{item.createdAt.split(' ')[0]}</td>
                                                    <td>{getStatusBadge(item.status)}</td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            {item.status === 'REJECTED' && (
                                                                <button 
                                                                    className="btn btn-sm btn-outline-primary fw-bold rounded-3 px-2 text-nowrap"
                                                                    onClick={() => openRejectionModal(item.rejectionDetails)}
                                                                >
                                                                    <i className="bi bi-search me-1"></i>사유 보기
                                                                </button>
                                                            )}

                                                            {(item.status === 'REQUEST' || item.status === 'REJECTED') && (
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger fw-bold rounded-3 px-2 text-nowrap"
                                                                    onClick={() => handleDelete(item.datasetId)}
                                                                    style={{ transition: 'all 0.2s' }}
                                                                >
                                                                    <i className="bi bi-trash3-fill me-1"></i>삭제
                                                                </button>
                                                            )}

                                                            {item.status === 'APPROVED' && (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 🚀 페이징 영역 */}
                        {!isLoading && filteredList.length > 0 && (
                            <div className="download-pagination-bar mb-1 mt-3">
                                <div className="download-pagination-center">
                                    <button
                                        type="button"
                                        className={`download-pagination-arrow ${!hasPrevious ? "disabled" : ""}`}
                                        aria-label="첫 페이지"
                                        disabled={!hasPrevious}
                                        onClick={() => paginate(1)}
                                    >
                                        <i className="bi bi-chevron-double-left"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className={`download-pagination-arrow ${!hasPrevious ? "disabled" : ""}`}
                                        aria-label="이전 페이지"
                                        disabled={!hasPrevious}
                                        onClick={() => paginate(currentPage - 1)}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    {pageNumbers[0] > 1 && (
                                        <>
                                            <button type="button" className="download-pagination-number" onClick={() => paginate(1)}>1</button>
                                            <span className="download-pagination-ellipsis">...</span>
                                        </>
                                    )}

                                    {pageNumbers.map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            className={`download-pagination-number ${pageNumber === currentPage ? "active" : ""}`}
                                            onClick={() => paginate(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                                        <>
                                            <span className="download-pagination-ellipsis">...</span>
                                            <button
                                                type="button"
                                                className="download-pagination-number"
                                                onClick={() => paginate(totalPages)}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        className={`download-pagination-arrow ${!hasNext ? "disabled" : ""}`}
                                        aria-label="다음 페이지"
                                        disabled={!hasNext}
                                        onClick={() => paginate(currentPage + 1)}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className={`download-pagination-arrow ${!hasNext ? "disabled" : ""}`}
                                        aria-label="마지막 페이지"
                                        disabled={!hasNext}
                                        onClick={() => paginate(totalPages)}
                                    >
                                        <i className="bi bi-chevron-double-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🟢 우측 사이드바 영역 (최근 업로드 & 차트, 3칸 차지) */}
                <div className="col-xl-3 col-lg-4">
                    <div className="sticky-top" style={{ top: '2rem' }}>

                        {/* 2. 업로드 포맷 통계 (도넛 차트) */}
                        {datasetList.length > 0 && (
                            <div className="card shadow-sm rounded-2">
                                <div className="card-header bg-white border-bottom pt-4 pb-3 px-4">
                                    <h6 className="fw-bold text-dark mb-0"><i className="bi bi-pie-chart-fill me-2" style={{ color: '#8B5CF6' }}></i>업로드 포맷 통계</h6>
                                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.75rem' }}>전체 {totalUploads}건 기준</p>
                                </div>
                                <div className="card-body p-3 py-4">
                                    <div className="row align-items-center g-0">
                                        
                                        <div className="col-5">
                                            <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '130px' }}>
                                                <Doughnut data={chartData} options={chartOptions} />
                                                <div className="position-absolute d-flex flex-column justify-content-center align-items-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                                    <span className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>총</span>
                                                    <span className="text-dark fw-black" style={{ fontSize: '1.2rem', lineHeight: '1.1' }}>{totalUploads}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-7 ps-3">
                                            <div className="d-flex flex-column justify-content-center h-100">
                                                {Object.entries(formatCounts).sort((a, b) => b[1] - a[1]).map(([format, count], idx) => {
                                                    const percentage = Math.round((count / totalUploads) * 100);
                                                    const color = chartColors[format] || chartColors['기타'];
                                                    return (
                                                        <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                                            <div className="d-flex align-items-center">
                                                                <span className="rounded-2 me-2" style={{ width: '12px', height: '12px', backgroundColor: color }}></span>
                                                                <span className="text-dark fw-bolder" style={{ fontSize: '0.85rem' }}>{format}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <span className="text-secondary fw-semibold me-1" style={{ fontSize: '0.8rem' }}>{count}건</span>
                                                                <span className="text-muted fw-bold" style={{ fontSize: '0.8rem', width: '38px', textAlign: 'right' }}>({percentage}%)</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1. 최근 업로드 데이터 (최근 5건) */}
                        <div className="card shadow-sm rounded-2 mt-4">
                            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold text-dark mb-0"><i className="bi bi-clock-history me-2 text-primary"></i>최근 업로드 데이터</h6>
                            </div>
                            <div className="card-body p-0">
                                {recentUploads.length > 0 ? (
                                    <div className="list-group list-group-flush">
                                        {recentUploads.map((item, idx) => (
                                            <div key={idx} className="list-group-item px-4 py-3 border-bottom">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="text-dark fw-bold text-truncate" style={{ maxWidth: '70%', fontSize: '0.9rem' }}>
                                                        {item.title}
                                                    </span>
                                                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.createdAt.split(' ')[0]}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="text-muted small">{item.fileFormat}</span>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-muted small">최근 업로드 내역이 없습니다.</div>
                                )}
                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>

            {/* 🚀 [추가됨] 이용 가이드 모달 */}
            {showGuideModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            {/* 헤더 */}
                            <div className="modal-header bg-light border-bottom pt-4 px-4 pb-3">
                                <h5 className="modal-title fw-bolder text-dark d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                                        <i className="bi bi-book-half fs-5"></i>
                                    </div>
                                    연구자 데이터 업로드 이용 가이드
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowGuideModal(false)}></button>
                            </div>
                            
                            {/* 본문 */}
                            <div className="modal-body p-4 p-md-5">
                                
                                {/* 1. 심사 및 승인 */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-primary mb-3"><i className="bi bi-1-circle-fill me-2"></i>심사 및 승인 소요 시간</h6>
                                    <div className="bg-light p-3 rounded-3 border">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 업로드하신 데이터의 위치 정확도 및 내용 검수를 위한 <strong>관리자 심사는 영업일 기준 최소 1일에서 최대 3일</strong>이 소요될 수 있습니다.
                                        </p>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 정상적으로 <strong>승인 완료(APPROVED)</strong>된 데이터는 시스템에 정식 적재되어 다른 사용자들이 조회 및 다운로드할 수 있게 됩니다.
                                        </p>
                                    </div>
                                </div>

                                {/* 2. 데이터 삭제 정책 */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-danger mb-3"><i className="bi bi-2-circle-fill me-2"></i>데이터 삭제 정책</h6>
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-3 border border-danger border-opacity-25">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 원본 데이터 삭제는 상태가 <strong>'심사 대기중(REQUEST)'</strong>이거나 <strong>'반려됨(REJECTED)'</strong>일 때만 우측 버튼을 통해 가능합니다.
                                        </p>
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 삭제 시 클라우드(AWS S3)에 저장된 원본 파일과 데이터베이스 내역이 <strong>영구적으로 완벽히 파기</strong>됩니다.
                                        </p>
                                        <p className="mb-0 text-dark fw-bold" style={{ fontSize: '0.95rem' }}>
                                            • <i className="bi bi-exclamation-triangle-fill text-danger me-1"></i> 주의: 이미 '승인 완료'된 데이터는 다운로드 사용자들의 혼란을 방지하기 위해 임의로 삭제할 수 없습니다.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. 데이터 업로드 꿀팁 */}
                                <div>
                                    <h6 className="fw-bold text-success mb-3"><i className="bi bi-3-circle-fill me-2"></i>빠른 승인을 위한 업로드 팁</h6>
                                    <div className="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>CSV, Excel, GeoJSON</strong> 파일은 시스템이 최대 1,000건까지 형태와 위치를 자동 딥 검증하므로 양식(컬럼명)을 정확히 맞춰주세요.
                                        </p>
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>SHP(ZIP) 및 TIFF</strong> 같은 대용량 공간 파일은 시스템 검증 없이 즉시 원본 형태로 보존(프리패스)되어 가장 빠르게 대기 상태로 넘어갑니다.
                                        </p>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>반려(REJECTED)</strong>된 데이터는 우측의 <span className="badge bg-outline-primary border text-primary px-2">사유 보기</span> 버튼을 통해 관리자 피드백을 확인하고, 수정하여 다시 업로드해 주세요.
                                        </p>
                                    </div>
                                </div>

                            </div>
                            
                            {/* 푸터 */}
                            <div className="modal-footer border-top-0 px-4 pb-4">
                                <button type="button" className="btn btn-secondary fw-bold w-100 py-2 rounded-3" onClick={() => setShowGuideModal(false)}>
                                    확인했습니다
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 반려 사유 모달 */}
            {showModal && selectedRejection && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 rounded-2 shadow-lg">
                                <div className="modal-header bg-danger bg-opacity-10 border-bottom-0 pt-4 px-4">
                                    <h5 className="modal-title fw-bold text-danger">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>승인 반려 사유
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeRejectionModal}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="bg-light p-3 rounded-3 mb-3 border">
                                        <p className="mb-0 text-dark font-monospace" style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                            {selectedRejection.rejectReason}
                                        </p>
                                    </div>
                                    <div className="d-flex justify-content-between text-muted small px-1">
                                        <span><i className="bi bi-person-fill me-1"></i>심사관: {selectedRejection.adminName}</span>
                                        <span><i className="bi bi-clock-fill me-1"></i>반려 일시: {selectedRejection.rejectedAt}</span>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pb-4 px-4">
                                    <button type="button" className="btn btn-secondary fw-bold w-100 rounded-3 py-2" onClick={closeRejectionModal}>
                                        확인 및 닫기
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