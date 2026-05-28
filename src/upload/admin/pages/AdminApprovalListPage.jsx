import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../commons/api/axiosinstance";

function AdminApprovalListPage() {
    const navigate = useNavigate();

    const [approvalList, setApprovalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApprovalList = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/approvals');
            setApprovalList(response.data);
            setError(null);
        } catch (err) {
            console.error("승인 대기 목록 조회 실패: ", err);
            
            // 🚀 [추가된 부분] 401 에러(인증 실패) 처리 로직
            if (err.response && err.response.status === 403) {
                alert(err.response.data || "로그인이 필요합니다.");
                navigate("/login"); // 🚨 프로젝트의 실제 로그인 페이지 경로로 맞춰주세요!
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
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        // maxWidth: 1100px -> 68.75rem (1100/16)
        <div className="container py-5" style={{ maxWidth: '68.75rem' }}>
            
            {/* 페이지 상단 타이틀 영역 */}
            <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: '1.75rem' }}>데이터셋 승인 관리</h2>
                    <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
                        연구원들이 업로드한 데이터 중 PostGIS 공간 검증을 통과한 승인 대기 목록입니다.
                    </p>
                </div>
                {/* 대기 카운트 배지 - 패딩 rem 적용 */}
                <div className="bg-light px-4 py-3 rounded-3 border text-center">
                    <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.875rem' }}>대기 중인 항목</span>
                    <span className="fw-black text-primary" style={{ fontSize: '1.5rem' }}>{approvalList.length}건</span>
                </div>
            </div>

            {/* 로딩/에러/빈 데이터 처리는 기존과 동일하게 유지하되 스타일만 rem으로 보정 */}
            {isLoading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>}

            {!isLoading && error && (
                <div className="alert alert-danger text-center py-4" role="alert" style={{ fontSize: '1rem' }}>
                    <i className="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
                    {error}
                </div>
            )}

            {!isLoading && !error && approvalList.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        {/* minWidth를 rem으로 조정 (약 900px 수준) */}
                        <table className="table table-hover align-middle mb-0" style={{ minWidth: '56.25rem' }}>
                            <thead className="table-light text-secondary fw-bold text-center" style={{ fontSize: '0.9rem' }}>
                                <tr>
                                    <th className="py-3" style={{ width: '4rem' }}>번호</th>
                                    {/* 🚀 text-nowrap 추가: 제목이 길어도 헤더가 절대 안 깨지게! */}
                                    <th className="py-3 text-nowrap">연구자 (소속)</th>
                                    <th className="py-3" style={{ width: '35%' }}>데이터셋 제목</th>
                                    <th className="py-3 text-nowrap">건수</th>
                                    <th className="py-3 text-nowrap">신청일자</th>
                                    <th className="py-3 text-nowrap">현재 상태</th>
                                    <th className="py-3 text-nowrap">작업</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.95rem' }}>
                                {approvalList.map((item, index) => (
                                    <tr 
                                        key={item.datasetId} 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/upload/admin/approveList/${item.datasetId}`)}
                                    >
                                        <td className="text-center text-muted small">{index + 1}</td>
                                        
                                        {/* 🚀 text-nowrap: 이름과 소속이 한 줄에 예쁘게 나오게 함 */}
                                        <td className="text-nowrap px-3">
                                            <div className="fw-bold text-dark">{item.username || '알 수 없음'}</div>
                                            <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                                {item.organization || '소속 미지정'}
                                            </div>
                                        </td>
                                        
                                        <td className="fw-semibold text-dark text-truncate px-3 text-center" style={{ maxWidth: '20rem' }}>
                                            {item.title}
                                        </td>
                                        
                                        {/* 🚀 건수 영역 줄바꿈 방지 */}
                                        <td className="text-center text-nowrap px-3">
                                            <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                                                {item.successCount ? item.successCount.toLocaleString() : '0'}
                                            </span>
                                            <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>건</span>
                                        </td>
                                        
                                        <td className="text-center text-muted small text-nowrap px-3">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        
                                        <td className="text-center text-nowrap">
                                            <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.85rem' }}>
                                                승인 대기
                                            </span>
                                        </td>
                                        
                                        <td className="text-center text-nowrap px-3" onClick={(e) => e.stopPropagation()}>
                                            {/* 🚀 버튼도 text-nowrap을 주어 "자세히 보기"가 절대 안 잘리게 함 */}
                                            <button 
                                                className="btn btn-outline-primary btn-sm px-3 fw-bold rounded-2 text-nowrap"
                                                onClick={() => navigate(`/upload/admin/approveList/${item.datasetId}`)}
                                            >
                                                <i className="bi bi-search me-1"></i> 자세히 보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminApprovalListPage;