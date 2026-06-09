import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosinstance";

import '../../../download/style/download.css';

function AdminApprovalListPage() {
    const navigate = useNavigate();

    // 🛑 기존 상태 관리
    const [approvalList, setApprovalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚀 [추가됨] 관리자 심사 가이드 모달 상태
    const [showGuideModal, setShowGuideModal] = useState(false);

    // 검색 및 필터 상태 관리
    const [searchTerm, setSearchTerm] = useState("");
    const [searchFormat, setSearchFormat] = useState("");

    // 페이징(Pagination) 상태 관리
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    const fetchApprovalList = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/approvals');
            setApprovalList(response.data);
            setError(null);
        } catch (err) {
            console.error("승인 대기 목록 조회 실패: ", err);
            
            if (err.response && err.response.status === 403) {
                alert(err.response.data || "관리자 권한이 필요합니다.");
                navigate("/login"); 
                return;
            }

            if (err.response && err.response.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError("데이터를 통신하는 중 에러가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalList();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // =====================================================================
    // 상단 통계 데이터 계산
    // =====================================================================
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const totalPending = approvalList.length;
    const newTodayCount = approvalList.filter(item => item.createdAt && item.createdAt.startsWith(todayStr)).length;
    const spatialCount = approvalList.filter(item => item.fileFormat === 'SHP' || item.fileFormat === 'TIFF').length;
    const generalCount = totalPending - spatialCount; 

    // 심사 대기 적체율 계산
    const longPendingCount = Math.max(0, totalPending - newTodayCount); 
    const longPendingRatio = totalPending === 0 ? 0 : Math.round((longPendingCount / totalPending) * 100);
    const newTodayRatio = totalPending === 0 ? 0 : Math.round((newTodayCount / totalPending) * 100);

    // =====================================================================
    // 관리자용 다중 필터링 로직
    // =====================================================================
    const filteredList = approvalList.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const matchKeyword = 
            (item.title && item.title.toLowerCase().includes(searchLower)) ||
            (item.username && item.username.toLowerCase().includes(searchLower)) ||
            (item.organization && item.organization.toLowerCase().includes(searchLower));
        
        const matchFormat = searchFormat === "" || item.fileFormat === searchFormat;
        
        return matchKeyword && matchFormat;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchFormat, itemsPerPage]);

    // =====================================================================
    // 페이징 로직 (필터링된 결과 기준)
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

    return (
        <div className="container-fluid px-4 py-3" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            
            {/* 🚀 페이지 상단 타이틀 영역 (가이드 버튼 추가) */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                <div>
                    <div className="d-flex align-items-center mb-2">
                        <h2 className="fw-bolder text-dark mb-0 me-3">데이터셋 승인 관리</h2>
                        <span className="badge bg-dark text-warning border border-warning px-3 py-2 rounded-pill fw-bold shadow-sm" style={{ letterSpacing: '1px' }}>
                            <i className="bi bi-shield-lock-fill me-1"></i> SYSTEM ADMIN
                        </span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                        연구원들이 업로드한 데이터 중 1차 검증을 통과한 대기 목록을 심사하고 최종 승인합니다.
                    </p>
                </div>
                {/* 🚀 [추가됨] 관리자 심사 가이드 버튼 */}
                <div className="col-auto">
                    <button 
                        className="btn btn-outline-dark fw-bold rounded-2 shadow-sm d-flex align-items-center px-3" 
                        onClick={() => setShowGuideModal(true)}
                        style={{ transition: 'all 0.2s' }}
                    >
                        <i className="bi bi-journal-text me-2 fs-5"></i>관리자 심사 매뉴얼
                    </button>
                </div>
            </div>

            {/* 관리자용 다중 검색 및 필터바 */}
            {!isLoading && !error && approvalList.length > 0 && (
                <div className="card shadow-sm rounded-3 mb-4 border-0">
                    <div className="card-body p-3 p-md-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-lg-6 col-md-12">
                                <label className="form-label small fw-bold text-secondary mb-1">통합 검색 (제목, 연구자, 소속기관)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0 bg-light" 
                                        placeholder="검색어 입력..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <label className="form-label small fw-bold text-secondary mb-1">파일 포맷 필터</label>
                                <select className="form-select text-dark bg-light" value={searchFormat} onChange={(e) => setSearchFormat(e.target.value)}>
                                    <option value="">전체 포맷</option>
                                    <option value="CSV">CSV</option>
                                    <option value="EXCEL">EXCEL</option>
                                    <option value="GEOJSON">GeoJSON</option>
                                    <option value="SHP">SHP</option>
                                    <option value="TIFF">TIFF</option>
                                </select>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <button 
                                    className="btn btn-dark w-100 fw-bold shadow-sm" 
                                    onClick={() => { setSearchTerm(""); setSearchFormat(""); }}
                                >
                                    <i className="bi bi-arrow-repeat me-1"></i>조건 초기화
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 대시보드 카드 */}
            {!isLoading && !error && (
                <div className="row g-4 mb-4">
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100 border-0" style={{ borderLeft: '5px solid #212529 !important' }}>
                            <div className="d-flex align-items-start">
                                <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-inbox-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="text-dark fw-bold" style={{ fontSize: '0.875em' }}>전체 승인 대기</div>
                                    <div className="fw-black text-dark mt-1" style={{ fontSize: '1.25rem' }}>{totalPending.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100 border-0">
                            <div className="d-flex align-items-start">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-bell-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="text-dark fw-bold" style={{ fontSize: '0.875em' }}>오늘 신규 접수</div>
                                    <div className="fw-black text-warning mt-1" style={{ fontSize: '1.25rem' }}>{newTodayCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100 border-0">
                            <div className="d-flex align-items-start">
                                <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-layers-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="text-dark fw-bold" style={{ fontSize: '0.875em' }}>
                                        대용량 공간 파일 <span className="text-muted fw-normal" style={{fontSize: '0.75rem'}}>(SHP 등)</span>
                                    </div>
                                    <div className="fw-black text-dark mt-1" style={{ fontSize: '1.25rem' }}>{spatialCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4 h-100 border-0">
                            <div className="d-flex align-items-start">
                                <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-file-earmark-check-fill fs-3"></i>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="text-dark fw-bold" style={{ fontSize: '0.875em' }}>
                                        정밀 검증 데이터 <span className="text-muted fw-normal" style={{fontSize: '0.75rem'}}>(CSV 등)</span>
                                    </div>
                                    <div className="fw-black text-dark mt-1" style={{ fontSize: '1.25rem' }}>{generalCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 심사 대기 적체율 프로그레스 바 영역 */}
            {!isLoading && !error && approvalList.length > 0 && (
                <div className="mb-4 bg-white p-3 rounded-3 shadow-sm border-0">
                     <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark" style={{fontSize: '0.9rem'}}><i className="bi bi-bar-chart-steps me-2"></i>현재 심사 대기 적체 현황</span>
                        <span className="small text-muted fw-semibold">총 {totalPending}건 대기 중</span>
                     </div>
                     <div className="progress rounded-pill shadow-inner bg-light" style={{ height: '14px' }}>
                        <div 
                            className="progress-bar bg-danger progress-bar-striped progress-bar-animated" 
                            role="progressbar" 
                            style={{ width: `${longPendingRatio}%` }} 
                            title={`이전 접수 미처리: ${longPendingCount}건`}
                        >
                            {longPendingRatio > 10 && <span className="small fw-bold">{longPendingRatio}%</span>}
                        </div>
                        <div 
                            className="progress-bar bg-warning text-dark" 
                            role="progressbar" 
                            style={{ width: `${newTodayRatio}%` }} 
                            title={`오늘 신규 접수: ${newTodayCount}건`}
                        >
                             {newTodayRatio > 10 && <span className="small fw-bold">{newTodayRatio}%</span>}
                        </div>
                     </div>
                     <div className="d-flex justify-content-between mt-2 px-1">
                        <span className="text-danger small fw-bold"><i className="bi bi-exclamation-circle-fill me-1"></i>장기 대기 (이전 접수): {longPendingCount}건</span>
                        <span className="text-warning small fw-bold" style={{color: '#D97706 !important'}}><i className="bi bi-clock-fill me-1"></i>신규 대기 (오늘 접수): {newTodayCount}건</span>
                     </div>
                </div>
            )}

            {/* 로딩 및 에러 처리 */}
            {isLoading && <div className="text-center py-5" style={{ minHeight: '300px' }}><div className="spinner-border text-dark" role="status"></div></div>}

            {!isLoading && error && (
                <div className="alert alert-danger text-center py-5 rounded-4 shadow-sm" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
                    <h5 className="fw-bold">{error}</h5>
                </div>
            )}

            {/* 메인 테이블 영역 */}
            {!isLoading && !error && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
                    
                    {filteredList.length > 0 && (
                        <div className="download-list-toolbar bg-white">
                            <div className="download-list-total text-dark fw-bold">전체 {totalFilteredCount.toLocaleString()}건</div>

                            <div className="download-list-controls">
                                <select 
                                    className="form-select form-select-sm bg-light text-dark fw-bold" 
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
                        {filteredList.length === 0 ? (
                            <div className="text-center py-5 text-muted bg-white" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <i className="bi bi-inbox text-secondary opacity-25 d-block mb-3" style={{ fontSize: '4rem' }}></i>
                                <h5 className="fw-bold text-dark mb-1">승인 대기 중인 항목이 없습니다.</h5>
                                {approvalList.length > 0 && <p className="small">검색 조건에 맞는 데이터가 없습니다.</p>}
                            </div>
                        ) : (
                            <div className="table-responsive bg-white">
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                                    <thead className="table-light text-secondary fw-bold text-center" style={{ fontSize: '0.9rem' }}>
                                        <tr>
                                            <th className="py-3 border-bottom" style={{ width: '5%' }}>No.</th>
                                            <th className="py-3 text-start border-bottom" style={{ width: '15%' }}>요청자 (소속)</th>
                                            <th className="py-3 text-start border-bottom" style={{ width: '45%' }}>데이터셋 제목</th>
                                            <th className="py-3 border-bottom" style={{ width: '8%' }}>포맷</th>
                                            <th className="py-3 border-bottom" style={{ width: '9%' }}>데이터 건수</th>
                                            <th className="py-3 border-bottom" style={{ width: '10%' }}>신청 일시</th>
                                            <th className="py-3 border-bottom" style={{ width: '8%' }}>심사</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: '0.95rem' }}>
                                        {currentItems.map((item, index) => {
                                            const actualNumber = totalFilteredCount - (indexOfFirstItem + index);
                                            
                                            return (
                                            <tr 
                                                key={item.datasetId} 
                                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                onClick={() => navigate(`/upload/admin/approveList/${item.datasetId}`)}
                                            >
                                                <td className="text-center text-muted small">{actualNumber}</td>
                                                
                                                <td className="text-start px-3">
                                                    <div className="fw-bolder text-dark mb-1" style={{ fontSize: '0.95rem' }}>{item.username || '알 수 없음'}</div>
                                                    <div className="text-secondary opacity-75" style={{ fontSize: '0.8rem' }}>
                                                        <i className="bi bi-building me-1"></i>{item.organization || '소속 미지정'}
                                                    </div>
                                                </td>
                                                
                                                <td className="text-start fw-semibold text-dark px-3">
                                                    {item.title}
                                                </td>
                                                
                                                <td className="text-center">
                                                    <span className="badge bg-light text-secondary border px-2 py-1 font-monospace">{item.fileFormat}</span>
                                                </td>

                                                <td className="text-center px-3">
                                                    {(item.fileFormat === 'SHP' || item.fileFormat === 'TIFF') ? (
                                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1" style={{fontSize: '0.8rem'}}>
                                                            <i className="bi bi-hdd-fill me-1"></i>원본 유지
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                                                {item.successCount ? item.successCount.toLocaleString() : '0'}
                                                            </span>
                                                            <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>건</span>
                                                        </>
                                                    )}
                                                </td>
                                                
                                                <td className="text-center text-muted small px-3">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                                
                                                <td className="text-center px-3" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        className="btn btn-dark btn-sm px-3 fw-bold rounded-3 text-nowrap shadow-sm"
                                                        onClick={() => navigate(`/upload/admin/approveList/${item.datasetId}`)}
                                                        style={{ transition: 'all 0.2s' }}
                                                    >
                                                        심사 시작 <i className="bi bi-arrow-right-short"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {!isLoading && !error && filteredList.length > 0 && (
                        <div className="download-pagination-bar border-top-0 bg-white pt-3 pb-3">
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
            )}

            {/* 🚀 [신규 추가] 관리자 심사 가이드 모달 */}
            {showGuideModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            {/* 헤더 (관리자 전용 다크 테마) */}
                            <div className="modal-header bg-dark border-bottom-0 pt-4 px-4 pb-3">
                                <h5 className="modal-title fw-bolder text-white d-flex align-items-center">
                                    <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px' }}>
                                        <i className="bi bi-shield-lock-fill fs-5"></i>
                                    </div>
                                    관리자 전용 데이터 심사 매뉴얼
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGuideModal(false)}></button>
                            </div>
                            
                            {/* 본문 */}
                            <div className="modal-body p-4 p-md-5 bg-white">
                                
                                {/* 1. 적체율 지표 안내 */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3"><i className="bi bi-bar-chart-steps me-2 text-primary"></i>1. 심사 대기 적체율 지표 확인</h6>
                                    <div className="bg-light p-3 rounded-3 border">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 대시보드 하단의 프로그레스 바는 현재 시스템에 쌓인 <strong>업무 우선순위</strong>를 나타냅니다.
                                        </p>
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <span className="text-danger fw-bold">빨간색(장기 대기):</span> 어제 이전 접수되어 처리가 지연되고 있는 건입니다. <strong>가장 우선적으로 심사</strong>해야 합니다.
                                        </p>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <span className="text-warning fw-bold" style={{color: '#D97706 !important'}}>노란색(신규 대기):</span> 오늘 새롭게 접수된 데이터 건입니다.
                                        </p>
                                    </div>
                                </div>

                                {/* 2. 대용량 파일(SHP, TIFF) 주의사항 (핵심 경고) */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-danger mb-3"><i className="bi bi-exclamation-octagon-fill me-2"></i>2. 대용량 공간 파일(SHP, TIFF) 검증 주의사항</h6>
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-3 border border-danger border-opacity-25">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>SHP 및 TIFF 파일</strong>은 서버 메모리 폭발(OOM) 방지를 위해 시스템의 PostGIS 자동 공간 검증(딥 검증)을 생략하고 곧바로 대기 상태로 넘어옵니다.
                                        </p>
                                        <p className="mb-2 text-danger fw-bold" style={{ fontSize: '0.95rem' }}>
                                            • 따라서 '심사 시작'을 눌러도 상세 페이지에서 지도(Map) 프리뷰가 표출되지 않습니다! (에러가 아닙니다)
                                        </p>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • 해당 파일들은 우측 상단의 <strong>[원본 다운로드]</strong>를 통해 로컬 PC로 내려받은 후, QGIS 등 외부 전문 GIS 소프트웨어를 이용해 좌표계와 도형 이상 유무를 <strong>수동으로 직접 검수</strong>하셔야 합니다.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. 반려 사유 및 일반 팁 */}
                                <div>
                                    <h6 className="fw-bold text-dark mb-3"><i className="bi bi-lightbulb-fill me-2 text-warning"></i>3. 효율적인 심사 및 반려 처리 팁</h6>
                                    <div className="bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-25">
                                        <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>좌표계(SRID) 교차 검증:</strong> 연구자가 입력한 '원본 좌표계'와 실제 지도에 찍힌 핀의 위치가 어긋나 있다면(예: 한국 데이터가 바다 한가운데 찍힘) 지체 없이 반려 처리하세요.
                                        </p>
                                        <p className="mb-0 text-dark" style={{ fontSize: '0.95rem' }}>
                                            • <strong>구체적인 반려 사유 작성:</strong> 단순히 "형식 오류"라고 적기보다, <em>"SHP 압축 파일 내부에 .prj 파일이 누락되었습니다."</em> 처럼 구체적으로 기재해 주셔야 연구자가 빠르게 수정 후 재업로드할 수 있습니다.
                                        </p>
                                    </div>
                                </div>

                            </div>
                            
                            {/* 푸터 */}
                            <div className="modal-footer bg-light border-top px-4 pb-4 pt-3">
                                <button type="button" className="btn btn-dark fw-bold w-100 py-2 rounded-3" onClick={() => setShowGuideModal(false)}>
                                    내용을 숙지했습니다 (닫기)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminApprovalListPage;