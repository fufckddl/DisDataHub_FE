import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosinstance";

// 🚨 팀원분의 커스텀 CSS 파일 임포트 (경로는 MyUploadListPage와 동일하게 맞췄습니다)
import '../../../download/style/download.css';

function AdminApprovalListPage() {
    const navigate = useNavigate();

    // 🛑 기존 상태 관리
    const [approvalList, setApprovalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
    const generalCount = totalPending - spatialCount; // 나머지(CSV, EXCEL, GeoJSON)

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

    // 검색/필터 변경 시 무조건 1페이지로 리셋
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

    // 🚀 [팀원 코드 이식] 생략 표시(...)를 포함한 고급 페이징 번호 계산 로직
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
        <div className="container-fluid px-4 py-3">
            
            {/* 페이지 상단 타이틀 영역 */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
                <div>
                    <h2 className="fw-bolder text-dark mb-2">데이터셋 승인 관리</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                        연구원들이 업로드한 데이터 중 1차 검증을 통과한 대기 목록을 심사하고 최종 승인합니다.
                    </p>
                </div>
            </div>

            {/* 관리자용 다중 검색 및 필터바 */}
            {!isLoading && !error && approvalList.length > 0 && (
                <div className="card shadow-sm rounded-2 mb-4" style={{ backgroundColor: '#ffffff' }}>
                    <div className="card-body p-3 p-md-4">
                        <div className="row g-3 align-items-end">
                            <div className="col-lg-6 col-md-12">
                                <label className="form-label small fw-bold text-secondary mb-1">통합 검색 (제목, 연구자, 소속기관)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="검색어 입력..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <label className="form-label small fw-bold text-secondary mb-1">파일 포맷 필터</label>
                                <select className="form-select text-dark" value={searchFormat} onChange={(e) => setSearchFormat(e.target.value)}>
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
                                    className="btn btn-outline-secondary w-100 fw-bold" 
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
                        <div className="card shadow-sm p-4" style={{ borderLeft: '5px solid #0D6EFD !important' }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-inbox-fill fs-3"></i>
                                </div>
                                <div>
                                    <p className="text-muted fw-bold mb-0" style={{ fontSize: '0.85rem' }}>전체 승인 대기</p>
                                    <h3 className="fw-black text-dark mb-0">{totalPending.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-bell-fill fs-3"></i>
                                </div>
                                <div>
                                    <p className="text-muted fw-bold mb-0" style={{ fontSize: '0.85rem' }}>오늘 신규 접수</p>
                                    <h3 className="fw-black text-danger mb-0">{newTodayCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-layers-fill fs-3"></i>
                                </div>
                                <div>
                                    <p className="text-muted fw-bold mb-0" style={{ fontSize: '0.85rem' }}>
                                        대용량 공간 파일 <span className="small fw-normal">(SHP 등)</span>
                                    </p>
                                    <h3 className="fw-black text-dark mb-0">{spatialCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card shadow-sm p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-file-earmark-check-fill fs-3"></i>
                                </div>
                                <div>
                                    <p className="text-muted fw-bold mb-0" style={{ fontSize: '0.85rem' }}>
                                        정밀 검증 데이터 <span className="small fw-normal">(CSV 등)</span>
                                    </p>
                                    <h3 className="fw-black text-dark mb-0">{generalCount.toLocaleString()}<span className="fs-6 text-muted ms-1 fw-normal">건</span></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 로딩 및 에러 처리 */}
            {isLoading && <div className="text-center py-5" style={{ minHeight: '300px' }}><div className="spinner-border text-primary" role="status"></div></div>}

            {!isLoading && error && (
                <div className="alert alert-danger text-center py-5 rounded-4 shadow-sm" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
                    <h5 className="fw-bold">{error}</h5>
                </div>
            )}

            {/* 메인 테이블 영역 */}
            {!isLoading && !error && (
                <div className="card shadow-sm rounded-2 overflow-hidden">
                    
                    {/* 🚀 팀원 UI와 100% 동일한 커스텀 툴바 (전체 건수 & 보기 개수) */}
                    {filteredList.length > 0 && (
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
                        {filteredList.length === 0 ? (
                            <div className="text-center py-5 text-muted" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <i className="bi bi-inbox text-secondary opacity-25 d-block mb-3" style={{ fontSize: '4rem' }}></i>
                                <h5 className="fw-bold text-dark mb-1">승인 대기 중인 항목이 없습니다.</h5>
                                {approvalList.length > 0 && <p className="small">검색 조건에 맞는 데이터가 없습니다.</p>}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: '1000px' }}>
                                    <thead className="table-light text-secondary fw-bold text-center" style={{ fontSize: '0.9rem' }}>
                                        <tr>
                                            <th className="py-3" style={{ width: '5%' }}>No.</th>
                                            <th className="py-3 text-start" style={{ width: '15%' }}>요청자 (소속)</th>
                                            <th className="py-3 text-start" style={{ width: '45%' }}>데이터셋 제목</th>
                                            <th className="py-3" style={{ width: '8%' }}>포맷</th>
                                            <th className="py-3" style={{ width: '9%' }}>데이터 건수</th>
                                            <th className="py-3" style={{ width: '10%' }}>신청 일시</th>
                                            <th className="py-3" style={{ width: '8%' }}>심사</th>
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
                                                            <span className="fw-bold text-primary" style={{ fontSize: '1.05rem' }}>
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
                                                        className="btn btn-outline-primary btn-sm px-3 fw-bold rounded-3 text-nowrap"
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

                    {/* 🚀 팀원 UI와 100% 동일한 커스텀 페이징 영역 */}
                    {!isLoading && !error && filteredList.length > 0 && (
                        <div className="download-pagination-bar border-top-0">
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
        </div>
    );
}

export default AdminApprovalListPage;