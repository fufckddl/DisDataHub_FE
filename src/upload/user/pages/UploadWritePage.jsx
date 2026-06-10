import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../commons/api/axiosinstance';

function UploadWritePage() {
    // =====================================================================
    // 🛑 로직 영역: 기존 로직 100% 유지 + setValue만 살짝 꺼내옴
    // =====================================================================
    const { 
        register, 
        handleSubmit, 
        watch,
        setValue, // 🚀 [추가] 템플릿 자동완성을 위해 꺼내온 함수 (백엔드 영향 0%)
        formState: { errors } 
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            originalSrid: '4326', 
            fileFormat: 'CSV',
            spatialType: 'POINT',
            lonColumnName: '',
            latColumnName: '',
            wktColumnName: '',
            sheetName: '',
            provider: '',
            sourceType: 'FILE_UPLOAD',
            isPublic: 'false',
            keywords: '',
            dataStartDate: '',
            dataEndDate: '',
            temporalCoverage: '',
            spatialCoverage: '',
            updateCycle: 'ON_DEMAND',
            license: '',
            qualityGrade: '',
            qualityDescription: '',
            contactPerson: '',
            contactEmail: '',
            extraMetadata: '',
            encoding: 'UTF-8'
        }
    });

    const watchSpatialType = watch("spatialType");
    const watchFileFormat = watch("fileFormat")

    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [successCount, setSuccessCount] = useState(0);

    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorList, setErrorList] = useState([]); 

    // 🚀 [신규 기능] 원클릭 템플릿 적용 함수 (순수 프론트엔드 UI 기능)
    const applyTemplate = (type) => {
        if (type === 'public') {
            setValue('categoryId', '1');
            setValue('sourceType', 'FILE_UPLOAD');
            setValue('isPublic', 'true');
            setValue('license', '공공누리 제1유형 (출처표시)');
            setValue('provider', '서울시/공공데이터포털');
        } else if (type === 'private') {
            setValue('categoryId', '1');
            setValue('sourceType', 'FILE_UPLOAD');
            setValue('isPublic', 'false'); // 비공개
            setValue('license', '사내 대외비 (유출 금지)');
            setValue('provider', '자체 수집 데이터');
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 KB';
        
        if (bytes < 1024 * 1024) {
            // 1MB(1024*1024)보다 작으면 KB로 표시 (소수점 1자리)
            return (bytes / 1024).toFixed(1) + " KB";
        } else if (bytes < 1024 * 1024 * 1024) {
            // 1GB보다 작으면 MB로 표시 (소수점 2자리)
            return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        } else {
            // 1GB 이상이면 GB로 표시 (소수점 2자리)
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        }
    };

    const onSubmit = async (data) => {
        if (!file) {
            return alert("데이터 파일을 첨부해주세요!");
        }

        const fileSize = file.size; 
        const fileName = file.name.trim().toLowerCase(); 
        const selectedFormat = (data.fileFormat || "").trim().toUpperCase(); 

        let isAllowedExtension = false;
        let maxSizeBytes = 0;
        let maxSizeString = "";

        if (selectedFormat === 'CSV' || selectedFormat === 'GEOJSON' || selectedFormat === 'EXCEL') {
            if (selectedFormat === 'CSV') {
                isAllowedExtension = fileName.endsWith('.csv');
            } else if (selectedFormat === 'GEOJSON') {
                isAllowedExtension = fileName.endsWith('.geojson') || fileName.endsWith('.json'); 
            } else if (selectedFormat === 'EXCEL') {
                isAllowedExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            }
            maxSizeBytes = 30 * 1024 * 1024; 
            maxSizeString = "30MB";
        } else if (selectedFormat === 'SHP' || selectedFormat === 'TIFF') {
            if (selectedFormat === 'SHP') {
                isAllowedExtension = fileName.endsWith('.zip') || fileName.endsWith('.shp');
            } else if (selectedFormat === 'TIFF') {
                isAllowedExtension = fileName.endsWith('.tif') || fileName.endsWith('.tiff');
            }
            maxSizeBytes = 2 * 1024 * 1024 * 1024; 
            maxSizeString = "2GB";
        }

        if (!isAllowedExtension) {
            return alert(`❌ 선택하신 데이터 포맷(${data.fileFormat})과 파일의 확장자가 일치하지 않습니다.\n(파일명: ${file.name})`);
        }

        if (fileSize > maxSizeBytes) {
            return alert(`❌ 파일 용량이 초과되었습니다! (최대 허용치: ${maxSizeString})`);
        }

        setIsLoading(true);
        setIsSuccess(false);
        setIsError(false);
        setErrorList([]);

        try {
            const formData = new FormData();
            formData.append("file", file);
            Object.keys(data).forEach(key => formData.append(key, data[key]));

            const isLightFormat = data.fileFormat === 'CSV' || data.fileFormat === 'GEOJSON';
            formData.append("formatGroup", isLightFormat ? "LIGHT" : "HEAVY");

            const response = await axiosInstance.post('/api/upload/data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessCount(Number(response.data));
            setIsSuccess(true);
            
        } catch (error) {
            console.error("업로드 실패: ", error);
            setIsError(true); 

            if (error.response && error.response.data) {
                const responseData = error.response.data;
                const status = error.response.status; 

                if (status === 400 && responseData.uploadId) {
                    setErrorMessage(responseData.message || "데이터 검증에 실패했습니다.");
                    try {
                        const errorRes = await axiosInstance.get(`/api/upload/errors/${responseData.uploadId}`);
                        setErrorList(errorRes.data);
                    } catch (detailError) {
                        setErrorList([]); 
                    }
                } else {
                    const errorMsg = typeof responseData === 'string' ? responseData : (responseData.message || "서버 처리 중 오류가 발생했습니다.");
                    setErrorMessage(`🚨 업로드 불가: ${errorMsg}`);
                    setErrorList([]); 
                }
            } else {
                setErrorMessage("❌ 서버와 통신할 수 없습니다. 네트워크 상태나 서버 구동 여부를 확인하세요.");
                setErrorList([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid px-4 py-3" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            
            {/* 상단 타이틀 영역 */}
            <div className="justify-content-between align-items-end mb-4 pb-3 border-bottom">
                <div className='row'>
                    <div className='col'>
                        <h2 className="fw-bolder text-dark mb-2">신규 데이터 업로드</h2>
                    </div>
                    <div className='col-auto'>
                        <button className="btn btn-outline-secondary btn-sm fw-bold px-3 py-2" onClick={() => window.history.back()}>
                            <i className="bi bi-arrow-left me-2"></i>목록으로 돌아가기
                        </button>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                        시스템 적재를 위한 기본 정보와 메타데이터를 입력하고 파일을 업로드해 주세요. 
                        <span className="text-danger fw-bold ms-1">*</span> 표시는 필수 입력 항목입니다.
                    </p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-2 d-none d-xl-block">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        
                        {/* 1. 퀵 네비게이션 (목차) */}
                        <h6 className="fw-bolder text-secondary mb-3 ps-1">바로가기</h6>
                        <div className="list-group mb-5 shadow-sm border-0 rounded-4 overflow-hidden">
                            <a href="#section-1" className="list-group-item list-group-item-action border-0 py-3 fw-bold text-dark custom-hover-item">
                                <i className="bi bi-1-circle-fill text-primary me-2 fs-5 align-middle"></i>기본 정보
                            </a>
                            <a href="#section-2" className="list-group-item list-group-item-action border-0 py-3 fw-bold text-dark custom-hover-item">
                                <i className="bi bi-2-circle-fill text-primary me-2 fs-5 align-middle"></i>메타데이터
                            </a>
                            <a href="#section-3" className="list-group-item list-group-item-action border-0 py-3 fw-bold text-dark custom-hover-item">
                                <i className="bi bi-3-circle-fill text-primary me-2 fs-5 align-middle"></i>파일 첨부
                            </a>
                        </div>

                        {/* 2. 자동 완성 템플릿 */}
                        <h6 className="fw-bolder text-secondary mb-3 ps-1">자동 완성 템플릿</h6>
                        <div className="d-grid gap-3">
                            <button 
                                className="btn btn-white border shadow-sm text-start py-3 rounded-4" 
                                onClick={() => applyTemplate('public')}
                                style={{ transition: 'all 0.2s', backgroundColor: '#ffffff' }}
                            >
                                <div className="d-flex align-items-center mb-1">
                                    <i className="bi bi-globe-americas text-success fs-5 me-2"></i>
                                    <span className="fw-bold text-dark">공공데이터 개방형</span>
                                </div>
                                <span className="text-muted small">외부 공개 및 표준 메타데이터 자동 입력</span>
                            </button>
                            <button 
                                className="btn btn-white border shadow-sm text-start py-3 rounded-4" 
                                onClick={() => applyTemplate('private')}
                                style={{ transition: 'all 0.2s', backgroundColor: '#ffffff' }}
                            >
                                <div className="d-flex align-items-center mb-1">
                                    <i className="bi bi-lock-fill text-danger fs-5 me-2"></i>
                                    <span className="fw-bold text-dark">내부 연구 보안형</span>
                                </div>
                                <span className="text-muted small">비공개 처리 및 대외비 라이선스 설정</span>
                            </button>
                        </div>

                    </div>
                </div>


                {/* 🚀 중앙 메인 폼 영역 (col-xl-7: 좌측 2, 우측 3을 빼고 남은 공간) */}
                <div className="col-xl-7 col-lg-8">
                    
                    {/* 1. 기본 정보 (id="section-1" 추가) */}
                    <div id="section-1" className="card shadow-sm rounded-2 mb-4" style={{ scrollMarginTop: '2rem' }}>
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 px-md-5">
                            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>1</div>
                                기본 정보 (Dataset)
                            </h5>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-4">
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>데이터셋 제목 <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control form-control-lg fs-6 ${errors.title ? 'is-invalid' : ''}`} {...register("title", { required: "데이터셋 제목을 필수로 입력해 주세요!" })} placeholder="예: 2026년 수원시 약국 위치 정보" />
                                    {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                </div>
                                
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>상세 설명 <span className="text-danger">*</span></label>
                                    <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} {...register("description", { required: "상세 설명을 작성해 주세요!"})} rows="3" placeholder="데이터에 대한 배경, 목적, 구조 등을 상세히 설명해 주세요." style={{ resize: 'none' }}></textarea>
                                    {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>카테고리 <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`} {...register("categoryId", { required: "카테고리를 선택해 주세요!" })}>
                                        <option value="">선택해 주세요</option>
                                        <option value="1">공간·지도</option>
                                        <option value="2">교통·이동</option>
                                        <option value="3">인구·생활</option>
                                        <option value="4">보건·복지</option>
                                        <option value="5">환경·기상</option>
                                        <option value="6">안전·재난</option>
                                        <option value="7">문화·관광</option>
                                        <option value="8">산업·경제</option>
                                        <option value="9">교육·행정</option>
                                        <option value="10">농림·해양·에너지</option>
                                    </select>
                                    {errors.categoryId && <div className="invalid-feedback">{errors.categoryId.message}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>원본 좌표계 (SRID) <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.originalSrid ? 'is-invalid' : ''}`} {...register("originalSrid", { required: "원본 좌표계를 선택해 주세요!" })}>
                                        <option value="">선택해 주세요</option>
                                        <option value="4326">4326 (WGS84 - GPS 위경도)</option>
                                        <option value="5179">5179 (UTM-K - 네이버/카카오)</option>
                                        <option value="5181">5181 (중부원점 - 다음지도)</option>
                                        <option value="5179">5179 (GRS80 - 네이버 지도)</option>
                                        <option value="5174">5174 (수정된 중부원점 - 네이버 지도)</option>
                                        <option value="3857">3857 (WGS 84 - 구글 맵)</option>
                                        <option value="0">원본 좌표계 없음 (파일 내장/해당 없음)</option>
                                    </select>
                                    {errors.originalSrid && <div className="invalid-feedback">{errors.originalSrid.message}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>데이터 포맷 <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.fileFormat ? 'is-invalid' : ''}`} {...register("fileFormat", { required: "데이터 포맷을 선택해 주세요!" })}>
                                        <option value="">선택해 주세요</option>
                                        <option value="CSV">CSV (좌표 포함 텍스트)</option>
                                        <option value="EXCEL">Excel (엑셀 파일 .xlsx)</option>
                                        <option value="SHP">Shapefile (SHP ZIP 압축)</option>
                                        <option value="GEOJSON">GeoJSON</option>
                                        <option value="TIFF">GeoTIFF (TIFF 이미지)</option>
                                    </select>
                                    {errors.fileFormat && <div className="invalid-feedback">{errors.fileFormat.message}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>공간 데이터 타입 <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.spatialType ? 'is-invalid' : ''}`} {...register("spatialType", { required: "공간 데이터 타입을 선택해 주세요!" })}>
                                        <option value="">선택해 주세요</option>
                                        <option value="POINT">점 (POINT - 예: 약국, 가로등)</option>
                                        <option value="LINESTRING">선 (LINESTRING - 예: 도로, 하천)</option>
                                        <option value="POLYGON">면 (POLYGON - 예: 행정구역, 건물)</option>
                                        <option value="MIXED">혼합 (MIXED - 점, 선, 면 포함)</option>
                                        <option value="NONE">공간 데이터 없음</option>
                                    </select>
                                    {errors.spatialType && <div className="invalid-feedback">{errors.spatialType.message}</div>}
                                </div>

                                {/* 동적 렌더링 영역 */}
                                {watchFileFormat === 'EXCEL' && (
                                    <div className="col-12 mt-3">
                                        <div className="p-3 bg-light rounded-3 border" style={{ borderColor: '#A7F3D0' }}>
                                            <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#059669' }}><i className="bi bi-file-earmark-spreadsheet-fill me-2 fs-5"></i>엑셀 시트 설정</h6>
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label small fw-bold text-dark">데이터가 있는 시트 이름 <span className="text-danger">*</span></label>
                                                    <input type="text" className={`form-control ${errors.sheetName ? 'is-invalid' : ''}`} {...register("sheetName", { required: watchFileFormat === 'EXCEL' ? "엑셀 시트 이름을 입력해주세요." : false })} placeholder="예: 유적지 정보, Sheet1" />
                                                    {errors.sheetName && <div className="invalid-feedback">{errors.sheetName.message}</div>}
                                                    <div className="form-text mt-2 text-secondary" style={{ fontSize: '0.85rem' }}><i className="bi bi-info-circle me-1"></i>대소문자와 띄어쓰기를 정확히 입력해 주세요. (1행은 반드시 컬럼명이어야 합니다)</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(watchFileFormat === 'CSV' || watchFileFormat === 'EXCEL') && (
                                    <>
                                        {(watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') && (
                                            <div className="col-12 mt-3">
                                                <div className="p-3 bg-light rounded-3 border" style={{ borderColor: '#BFDBFE' }}>
                                                    <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#1D4ED8' }}><i className="bi bi-geo-alt-fill me-2 fs-5"></i>포인트 좌표 컬럼 설정 (CSV / Excel 기준)</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-bold text-dark">경도(Longitude/X) 컬럼명 <span className="text-danger">*</span></label>
                                                            <input type="text" className={`form-control ${errors.lonColumnName ? 'is-invalid' : ''}`} {...register("lonColumnName", { required: (watchFileFormat === 'CSV' || watchFileFormat === 'EXCEL') && (watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') ? "경도 컬럼명을 입력해주세요." : false })} placeholder="예: longitude, 경도, x" />
                                                            {errors.lonColumnName && <div className="invalid-feedback">{errors.lonColumnName.message}</div>}
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label small fw-bold text-dark">위도(Latitude/Y) 컬럼명 <span className="text-danger">*</span></label>
                                                            <input type="text" className={`form-control ${errors.latColumnName ? 'is-invalid' : ''}`} {...register("latColumnName", { required: (watchFileFormat === 'CSV' || watchFileFormat === 'EXCEL') && (watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') ? "위도 컬럼명을 입력해주세요." : false })} placeholder="예: latitude, 위도, y" />
                                                            {errors.latColumnName && <div className="invalid-feedback">{errors.latColumnName.message}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(watchSpatialType === 'LINESTRING' || watchSpatialType === 'POLYGON' || watchSpatialType === 'MIXED') && (
                                            <div className="col-12 mt-3">
                                                <div className="p-3 bg-light rounded-3 border" style={{ borderColor: '#BFDBFE' }}>
                                                    <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#1D4ED8' }}><i className="bi bi-bounding-box me-2 fs-5"></i>공간 텍스트(WKT) 컬럼 설정 (CSV / Excel 기준)</h6>
                                                    <div className="col-12">
                                                        <label className="form-label small fw-bold text-dark">WKT 컬럼명 <span className="text-danger">*</span></label>
                                                        <input type="text" className={`form-control ${errors.wktColumnName ? 'is-invalid' : ''}`} {...register("wktColumnName", { required: (watchFileFormat === 'CSV' || watchFileFormat === 'EXCEL') && (watchSpatialType === 'LINESTRING' || watchSpatialType === 'POLYGON' || watchSpatialType === 'MIXED') ? "WKT 컬럼명을 입력해주세요." : false })} placeholder="예: wkt, geom_wkt" />
                                                        {errors.wktColumnName && <div className="invalid-feedback">{errors.wktColumnName.message}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="col-md-6 mt-4">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>제공 기관/출처 <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${errors.provider ? 'is-invalid' : ''}`} {...register("provider", { required: "제공 기관/출처를 입력해 주세요!" })} placeholder="예: 수원시청, 국토교통부" />
                                    {errors.provider && <div className="invalid-feedback">{errors.provider.message}</div>}
                                </div>

                                <div className="col-md-6 mt-4">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>수집 방식 <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.sourceType ? 'is-invalid' : ''}`} {...register("sourceType", { required: "수집 방식을 선택해 주세요!" })}>
                                        <option value="">선택해 주세요</option>
                                        <option value="FILE_UPLOAD">파일 직접 업로드</option>
                                        <option value="API">외부 API 연동</option>
                                    </select>
                                    {errors.sourceType && <div className="invalid-feedback">{errors.sourceType.message}</div>}
                                </div>

                                <div className="col-12 mt-4 pt-3 border-top">
                                    <label className="form-label fw-bold text-secondary d-block" style={{ fontSize: '0.9rem' }}>공개 여부 <span className="text-danger">*</span></label>
                                    <div className="form-check form-check-inline mt-1">
                                        <input className="form-check-input" type="radio" id="publicAll" value="true" {...register("isPublic", { required: "공개 여부를 선택해 주세요!" })} />
                                        <label className="form-check-label fw-semibold" htmlFor="publicAll">전체 공개</label>
                                    </div>
                                    <div className="form-check form-check-inline mt-1">
                                        <input className="form-check-input" type="radio" id="publicPrivate" value="false" {...register("isPublic", { required: "공개 여부를 선택해 주세요!" })} />
                                        <label className="form-check-label fw-semibold" htmlFor="publicPrivate">비공개 (내부 연구용)</label>
                                    </div>
                                    {errors.isPublic && <div className="text-danger small mt-1">{errors.isPublic.message}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 상세 메타데이터 (id="section-2" 추가) */}
                    <div id="section-2" className="card shadow-sm rounded-2 mb-4" style={{ scrollMarginTop: '2rem' }}>
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 px-md-5">
                            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>2</div>
                                상세 메타데이터 (Metadata) 
                                <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.9rem' }}>- 선택 입력란</span>
                            </h5>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-4">
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>검색 태그 (keywords)</label>
                                    <input type="text" className="form-control" {...register("keywords")} placeholder="예: #수원, #약국, #보건 (쉼표로 구분)" />
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>데이터 수집 시작일</label>
                                    <input type="date" className="form-control" {...register("dataStartDate")} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>데이터 수집 종료일</label>
                                    <input type="date" className="form-control" {...register("dataEndDate")} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>시간적 범위</label>
                                    <input type="text" className="form-control" {...register("temporalCoverage")} placeholder="예: 2025.01 ~ 2026.12 또는 '조선시대'" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>공간적 범위</label>
                                    <input type="text" className="form-control" {...register("spatialCoverage")} placeholder="예: 경기도 수원시 전체" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>업데이트 주기</label>
                                    <select className="form-select" {...register("updateCycle")}>
                                        <option value="ON_DEMAND">수시 (On-demand)</option>
                                        <option value="DAILY">매일 (Daily)</option>
                                        <option value="MONTHLY">매월 (Monthly)</option>
                                        <option value="YEARLY">매년 (Yearly)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>라이선스 (license)</label>
                                    <input type="text" className="form-control" {...register("license")} placeholder="예: 공공누리 제1유형, 사내 대외비" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>품질 등급</label>
                                    <select className="form-select" {...register("qualityGrade")}>
                                        <option value="">등급 선택 (미정)</option>
                                        <option value="A">A등급 (초정밀/검증완료)</option>
                                        <option value="B">B등급 (일반 활용 가능)</option>
                                        <option value="C">C등급 (단순 참고용)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>품질 상세 설명</label>
                                    <input type="text" className="form-control" {...register("qualityDescription")} placeholder="예: GPS 측량 오차 1m 이내" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>담당자 이름</label>
                                    <input type="text" className="form-control" {...register("contactPerson")} placeholder="예: 홍길동 연구원" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>담당자 이메일</label>
                                    <input type="email" className="form-control" {...register("contactEmail")} placeholder="예: example@sri.re.kr" />
                                </div>

                                <div className="col-12 pt-3 mt-4 border-top">
                                    <label className="form-label fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>기타 확장 메타데이터 (JSON)</label>
                                    <textarea className="form-control font-monospace text-muted" {...register("extraMetadata")} rows="3" placeholder='예: sensor_model: DJI-Mavic-3, resolution: 5cm'></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. 파일 첨부 (id="section-3" 추가) */}
                    <div id="section-3" className="card shadow-sm rounded-2 mb-4" style={{ scrollMarginTop: '2rem' }}>
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 px-md-5 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>3</div>
                                파일 첨부 <span className="text-danger ms-1">*</span>
                            </h5>
                            <div className="d-flex align-items-center bg-light px-2 py-1 rounded-2 border">
                                <span className="text-muted small fw-bold me-2">인코딩:</span>
                                <select className="form-select form-select-sm border-0 bg-transparent text-primary fw-bold p-0 pe-3" {...register("encoding")} style={{width: 'auto', cursor: 'pointer'}}>
                                    <option value="UTF-8">UTF-8 (기본)</option>
                                    <option value="EUC-KR">EUC-KR (공공 CSV)</option>
                                    <option value="">인코딩 없음</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-3">
                            <div className="p-5 text-center bg-light rounded-4" style={{ border: '2px dashed #CBD5E1', transition: 'all 0.2s ease-in-out' }}>
                                <div className="mb-3">
                                    {file ? (
                                        <i className="bi bi-file-earmark-check-fill text-success" style={{ fontSize: '3.5rem' }}></i>
                                    ) : (
                                        <i className="bi bi-cloud-arrow-up text-secondary opacity-50" style={{ fontSize: '3.5rem' }}></i>
                                    )}
                                </div>
                                <h5 className="fw-bold text-dark mb-2">데이터 파일을 이곳으로 드래그하거나 선택해 주세요</h5>
                                <p className="text-muted small mb-4">지원 포맷: CSV, SHP(ZIP 압축), GeoJSON, Excel (최대 2GB)</p>
                                
                                <div className="w-50 mx-auto position-relative">
                                    <input className="form-control" type="file" onChange={(e) => setFile(e.target.files[0])} style={{ position: 'relative', zIndex: 2, cursor: 'pointer' }} />
                                </div>

                                {file && (
                                    <div className="mt-4 d-inline-block bg-white border px-4 py-2 rounded-pill shadow-sm">
                                        <span className="text-success fw-bold me-2"><i className="bi bi-check-circle-fill me-1"></i>업로드 준비됨:</span> 
                                        <span className="text-dark font-monospace">{file.name}</span>
                                        <span className="text-muted small ms-2 fw-bold">({formatBytes(file.size)})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 성공 결과 피드백 창 */}
                    {isSuccess && (
                        <div className="mb-4 p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#F0FFF4', border: '1px solid #A7F3D0' }}>
                            <div className="d-flex align-items-start">
                                <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                    <i className="bi bi-check-lg fs-3"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bolder mb-2" style={{ color: '#047857' }}>검증 완료 및 관리자 승인 대기</h5>
                                    <p className="text-dark mb-1" style={{ fontSize: '1rem' }}>
                                        총 <strong className="text-success fs-5 mx-1">{successCount.toLocaleString()}</strong>건의 데이터가 시스템 검증을 통과하여 <strong>임시 저장</strong>되었습니다.
                                    </p>
                                    <p className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>관리자의 최종 위치/내용 검토 후 정식 데이터셋에 적재됩니다.</p>
                                    <button className="btn fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }} onClick={() => window.location.href='/upload/user/uploadList'}>
                                        <i className="bi bi-list-ul me-2"></i>업로드 내역 확인하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 에러 결과 피드백 창 */}
                    {isError && (
                        <div className="mb-4 p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <div className="d-flex align-items-start">
                                <div className="bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                    <i className="bi bi-x-lg fs-4"></i>
                                </div>
                                <div className="w-100">
                                    <h5 className="fw-bolder mb-2" style={{ color: '#B91C1C' }}>검증 실패 (승인 요청 취소)</h5>
                                    <p className="text-danger mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        {errorList.length > 0 ? (
                                            <>
                                                업로드한 데이터 중 형식이 어긋나거나 필수값이 누락된 오류가 발견되었습니다.<br/>
                                                아래 상세 에러(디버깅 로그)를 확인하고 원본 파일을 수정한 뒤 다시 업로드해 주세요.
                                            </>
                                        ) : (
                                            <span className="fw-bold fs-6">{errorMessage}</span>
                                        )}
                                    </p>
                                    
                                    {errorList.length > 0 && (
                                        <div className="bg-white rounded-3 shadow-sm border overflow-hidden" style={{ borderColor: '#FCA5A5' }}>
                                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                                <table className="table table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                                                    <thead style={{ backgroundColor: '#FEE2E2', position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <tr>
                                                            <th className="text-center py-3 fw-bold border-0" style={{ color: '#991B1B', width: '15%' }}>행 번호</th>
                                                            <th className="text-center py-3 fw-bold border-0" style={{ color: '#991B1B', width: '25%' }}>오류 컬럼</th>
                                                            <th className="py-3 fw-bold border-0" style={{ color: '#991B1B', width: '60%' }}>상세 에러 내용</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {errorList.map((err, index) => (
                                                            <tr key={index}>
                                                                <td className="text-center fw-bold align-middle text-secondary border-bottom-0">Line {err.rowNumber}</td>
                                                                <td className="text-center align-middle border-bottom-0">
                                                                    <span className="badge bg-light text-danger border border-danger border-opacity-25 px-2 py-1 font-monospace">{err.columnName}</span>
                                                                </td>
                                                                <td className="align-middle border-bottom-0 pt-3 pb-3">
                                                                    <div className="fw-bold text-danger mb-1">{err.errorMessage}</div>
                                                                    {err.rawValue && (
                                                                        <div className="small text-secondary mb-1 bg-light px-2 py-1 rounded d-inline-block">
                                                                            <span className="fw-bold me-1">입력값:</span>{err.rawValue}
                                                                        </div>
                                                                    )}
                                                                    <div className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>[ERR_CODE: {err.errorType}]</div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 제출 버튼 (가운데 정렬 반영됨) */}
                    <div className="d-flex justify-content-center mb-5 mt-4">
                        <button 
                            className="btn btn-primary btn-lg py-3 fw-bold shadow" 
                            onClick={handleSubmit(onSubmit)} 
                            disabled={isLoading}
                            style={{ minWidth: '280px', borderRadius: '12px' }}
                        >
                            {isLoading ? (
                                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>서버 전송 중...</span>
                            ) : (
                                <span><i className="bi bi-cloud-arrow-up-fill me-2 fs-5"></i>데이터 제출 완료</span>
                            )}
                        </button>
                    </div>

                </div>

                {/* 🚀 우측 사이드바 (col-xl-3): 가이드라인 */}
                <div className="col-xl-3 col-lg-4">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h6 className="fw-bolder text-secondary mb-3 ps-1">등록 안내 및 가이드</h6>
                        
                        {/* 가이드 1: 데이터 구조 주의사항 */}
                        <div className="card border-0 rounded-4 mb-3 shadow-sm" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A !important' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#B45309' }}>
                                    <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
                                    데이터 구조 주의사항
                                </h6>
                                <p className="mb-0 text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    <strong>CSV</strong>와 <strong>EXCEL</strong> 파일 업로드 시, 반드시 <strong>첫 번째 열(Column A)</strong>에 해당 공간 데이터의 대표 이름(예: 상호명, 건물명, 지점명 등)을 배치해야 시스템 파싱이 정상적으로 이루어집니다.
                                </p>
                            </div>
                        </div>

                        {/* 가이드 2: 메타데이터 작성 가이드 */}
                        <div className="card border-0 rounded-4 mb-3 shadow-sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE !important' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#1D4ED8' }}>
                                    <i className="bi bi-info-square-fill fs-5 me-2"></i>
                                    메타데이터 작성 가이드
                                </h6>
                                <ul className="mb-0 ps-3 text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                                    <li className="mb-2">
                                        <strong>검색 태그</strong>는 다른 연구자가 쉽게 찾을 수 있도록 핵심 키워드를 쉼표(,)로 구분해 입력해 주세요.
                                    </li>
                                    <li className="mb-2">
                                        <strong>라이선스와 담당자</strong> 정보를 명확히 기재하면 데이터의 공신력과 신뢰성을 보장받을 수 있습니다.
                                    </li>
                                    <li>
                                        정해진 폼이 없는 특수 정보는 하단의 <strong>기타 확장 메타데이터</strong>에 자유롭게 적어주세요. (예: <strong>'협력원: 홍길동'</strong>이라고 적기만 해도 시스템이 알아서 변환합니다!)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 가이드 3: 파일 첨부 안내 */}
                        <div className="card border-0 rounded-4 shadow-sm" style={{ backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0 !important' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#047857' }}>
                                    <i className="bi bi-folder-check fs-5 me-2"></i>
                                    파일 첨부 안내
                                </h6>
                                <ul className="mb-0 ps-3 text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                                    <li className="mb-2">파일은 백엔드 서버를 거쳐 <strong>AWS S3 클라우드로 직접 스트리밍</strong>되어 안전하게 보관됩니다.</li>
                                    <li className="mb-2">일반 파일(CSV, EXCEL, GEOJSON)은 최대 <strong>30MB</strong>까지 지원됩니다. 또한 CSV, EXCEL,GEOJSON은 행의 개수가 1000개 이하까지만 업로드 하실 수 있습니다.</li>
                                    <li>공간 데이터(SHP ZIP, TIFF)는 최대 <strong>2GB</strong>의 대용량 업로드를 지원합니다.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 가이드 4: 대용량 공간 데이터(SHP, TIFF) 전용 안내 */}
                        <div className="card border-0 rounded-4 mt-3 shadow-sm" style={{ backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE !important' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#6D28D9' }}>
                                    <i className="bi bi-layers-fill fs-5 me-2"></i>
                                    SHP / TIFF 업로드 안내
                                </h6>
                                <ul className="mb-0 ps-3 text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                                    <li className="mb-2">
                                        해당 포맷 선택 시, <strong>'원본 좌표계'</strong>와 <strong>'공간 데이터 타입'</strong>을 반드시 <strong>'없음'</strong>으로 설정해 주세요.
                                    </li>
                                    <li>
                                        대용량 원본 유지를 위해 딥 검증을 생략하고 즉시 업로드됩니다. 완료 시 <strong>"총 0건"</strong>으로 표시되어도 <strong>정상 처리된 것이니 안심하셔도 됩니다.</strong>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <style>{`
                .custom-hover-item { transition: background-color 0.2s ease-in-out; }
                .custom-hover-item:hover { background-color: #E2E8F0 !important; } 
            `}</style>
        </div>
    );
}

export default UploadWritePage;