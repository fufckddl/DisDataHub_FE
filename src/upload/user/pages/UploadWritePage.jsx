import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../commons/api/axiosinstance';

function UploadWritePage() {
    const { 
        register, 
        handleSubmit, 
        watch,
        formState: { errors } 
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            originalSrid: '4326', // 기본값이 있어도 선택 안 하고 지우면 에러 뜨게 세팅
            fileFormat: 'CSV',
            spatialType: 'POINT',
            lonColumnName: '',
            latColumnName: '',
            wktColumnName: '',
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

    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 업로드 성공 완료 상태 저장 state
    const [isSuccess, setIsSuccess] = useState(false);
    // 성공한 개수를 담을 state
    const [successCount, setSuccessCount] = useState(0);

    // 업로드 실패 및 에러 리스트 상태
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorList, setErrorList] = useState([]); // 에러 상세 내역 배열

    const onSubmit = async (data) => {
        if (!file) {
            return alert("데이터 파일을 첨부해주세요!");
        }

        // =====================================================================
        // 🚀 [추가할 부분] Phase 1: 프론트엔드 파일 확장자 및 용량 1차 방어막
        // =====================================================================
        const fileSize = file.size; // 바이트 단위 용량
        const fileName = file.name.toLowerCase(); // 소문자로 변환한 파일명
        const selectedFormat = data.fileFormat; // 사용자가 선택한 포맷 ('CSV', 'GEOJSON', 'SHP')

        let isAllowedExtension = false;
        let maxSizeBytes = 0;
        let maxSizeString = "";

        // 1. 포맷별 용량 및 확장자 기준 세팅
        if (selectedFormat === 'CSV' || selectedFormat === 'GEOJSON') {
            // 경량 포맷: 30MB 제한
            isAllowedExtension = (selectedFormat === 'CSV' && fileName.endsWith('.csv')) || 
                                 (selectedFormat === 'GEOJSON' && fileName.endsWith('.geojson'));
            maxSizeBytes = 30 * 1024 * 1024; // 30MB
            maxSizeString = "30MB";
        } else if (selectedFormat === 'SHP') {
            // 대용량 포맷: 2GB 제한 (보통 SHP는 .zip으로 묶어서 올리거나 .shp 파일 자체를 올림)
            isAllowedExtension = fileName.endsWith('.zip') || fileName.endsWith('.shp');
            maxSizeBytes = 2 * 1024 * 1024 * 1024; // 2GB
            maxSizeString = "2GB";
        }

        // 2. 확장자 검사 (시나리오: 미지원 확장자 Alert 표출 후 즉시 종료)
        if (!isAllowedExtension) {
            return alert(`❌ 선택하신 데이터 포맷(${selectedFormat})과 파일의 확장자가 일치하지 않습니다.`);
        }

        // 3. 용량 검사 (시나리오: 30MB 또는 2GB 초과 시 Alert 표출 후 즉시 종료)
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
            
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            const isLightFormat = data.fileFormat === 'CSV' || data.fileFormat === 'GEOJSON';
            formData.append("formatGroup", isLightFormat ? "LIGHT" : "HEAVY");

            console.log("서버로 데이터 전송 시작...");
            const response = await axiosInstance.post('/api/upload/data', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessCount(Number(response.data));
            setIsSuccess(true);
            
        } catch (error) {
            console.error("업로드 실패: ", error);
            
            // 🚨 어떤 에러든 일단 빨간 박스를 무조건 켭니다! (이전 버그 방지 핵심)
            setIsError(true); 

            if (error.response && error.response.data) {
                const responseData = error.response.data;
                const status = error.response.status; // HTTP 상태 코드로 완벽하게 구분

                // 🚀 [Case 1] 400 에러: 데이터 검증 실패 (오답 노트가 JSON 객체로 예쁘게 올 때)
                if (status === 400 && responseData.uploadId) {
                    setErrorMessage(responseData.message || "데이터 검증에 실패했습니다.");
                    try {
                        const errorRes = await axiosInstance.get(`/api/upload/errors/${responseData.uploadId}`);
                        setErrorList(errorRes.data);
                    } catch (detailError) {
                        console.error("에러 상세 내역 조회 실패:", detailError);
                        setErrorList([]); // 실패 시 안전하게 표 비우기
                    }
                } 
                // 🚀 [Case 2] 500 에러: 중복 파일, WKT 파괴 등 시스템 에러 (보통 순수 문자열로 올 때)
                else {
                    // 백엔드가 던진 데이터가 문자열이면 그대로 꺼내 쓰고, 아니면 message를 찾습니다.
                    const errorMsg = typeof responseData === 'string' 
                                        ? responseData 
                                        : (responseData.message || "서버 처리 중 오류가 발생했습니다.");
                    
                    setErrorMessage(`🚨 업로드 불가: ${errorMsg}`);
                    setErrorList([]); // 오답 노트 표를 그릴 게 없으므로 완벽하게 비워줍니다! (버그 방지)
                }
            } else {
                // 아예 서버가 꺼져있을 때
                setErrorMessage("❌ 서버와 통신할 수 없습니다. 네트워크 상태나 서버 구동 여부를 확인하세요.");
                setErrorList([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '900px' }}>
            
            {/* 페이지 타이틀 영역 */}
            <div className="mb-4 pb-2 border-bottom">
                <h2 className="fw-bolder text-dark mb-2">신규 데이터 업로드</h2>
                <p className="text-muted">
                    데이터셋의 기본 정보와 메타데이터를 입력하고 파일을 업로드해 주세요. 
                    <span className="text-danger fw-bold ms-1">*</span> 표시는 시스템 적재를 위한 필수 입력 항목입니다.
                </p>
            </div>

            {/* 1. 기본 정보 섹션 (모든 필드 필수값 처리 완료) */}
            <div className="card shadow-sm mb-4 border-0">
                <div className="card-body p-4 p-md-5">
                    <h5 className="card-title fw-bold mb-4 d-flex align-items-center">
                        <span className="badge bg-primary rounded-pill me-2">1</span> 
                        기본 정보 (Dataset)
                    </h5>
                    
                    <div className="row g-4">
                        <div className="col-12">
                            <label className="form-label fw-semibold">데이터셋 제목 <span className="text-danger">*</span></label>
                            <input 
                                type="text" 
                                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                {...register("title", { required: "데이터셋 제목을 필수로 입력해 주세요!" })} 
                                placeholder="예: 2026년 수원시 약국 위치 정보" 
                            />
                            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                        </div>
                        
                        <div className="col-12">
                            <label className="form-label fw-semibold">상세 설명 <span className="text-danger">*</span></label>
                            <textarea 
                                className={`form-control ${errors.description ? 'is-invalid' : ''}`} 
                                {...register("description", { required: "상세 설명을 작성해 주세요!"})} 
                                rows="3" 
                                placeholder="데이터에 대한 배경, 목적, 구조 등을 상세히 설명해 주세요." 
                                style={{ resize: 'none' }}
                            ></textarea>
                            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">카테고리 <span className="text-danger">*</span></label>
                            <select 
                                className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`} 
                                {...register("categoryId", { required: "카테고리를 선택해 주세요!" })}
                            >
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
                            <label className="form-label fw-semibold">원본 좌표계 (SRID) <span className="text-danger">*</span></label>
                            <select 
                                className={`form-select ${errors.originalSrid ? 'is-invalid' : ''}`} 
                                {...register("originalSrid", { required: "원본 좌표계를 선택해 주세요!" })}
                            >
                                <option value="">선택해 주세요</option>
                                <option value="4326">4326 (WGS84 - GPS 위경도)</option>
                                <option value="5179">5179 (UTM-K - 네이버/카카오)</option>
                                <option value="5181">5181 (중부원점 - 다음지도)</option>
                            </select>
                            {errors.originalSrid && <div className="invalid-feedback">{errors.originalSrid.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">데이터 포맷 <span className="text-danger">*</span></label>
                            <select 
                                className={`form-select ${errors.fileFormat ? 'is-invalid' : ''}`} 
                                {...register("fileFormat", { required: "데이터 포맷을 선택해 주세요!" })}
                            >
                                <option value="">선택해 주세요</option>
                                <option value="CSV">CSV (좌표 포함 텍스트)</option>
                                <option value="SHP">Shapefile (SHP ZIP 압축)</option>
                                <option value="GEOJSON">GeoJSON</option>
                            </select>
                            {errors.fileFormat && <div className="invalid-feedback">{errors.fileFormat.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">공간 데이터 타입 <span className="text-danger">*</span></label>
                            <select 
                                className={`form-select ${errors.spatialType ? 'is-invalid' : ''}`} 
                                {...register("spatialType", { required: "공간 데이터 타입을 선택해 주세요!" })}
                            >
                                <option value="">선택해 주세요</option>
                                <option value="POINT">점 (POINT - 예: 약국, 가로등)</option>
                                <option value="LINESTRING">선 (LINESTRING - 예: 도로, 하천)</option>
                                <option value="POLYGON">면 (POLYGON - 예: 행정구역, 건물)</option>
                                <option value="MIXED">혼합 (MIXED - 점, 선, 면 포함)</option>
                                <option value="NONE">공간 데이터 없음</option>
                            </select>
                            {errors.spatialType && <div className="invalid-feedback">{errors.spatialType.message}</div>}
                        </div>

                        {/* ===================================================================== */}
                        {/* 🚀 [신규] 공간 데이터 타입에 따른 동적 컬럼 매핑 필드 */}
                        {/* ===================================================================== */}

                        {/* 1. POINT(점) 또는 MIXED(혼합) 선택 시: 위도/경도 컬럼명 입력 */}
                        {(watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') && (
                            <div className="col-12 mt-2">
                                <div className="p-3 bg-light rounded border border-primary border-opacity-25">
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="bi bi-geo-alt-fill me-2"></i>포인트 좌표 컬럼 설정 (CSV 기준)
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">경도(Longitude/X) 컬럼명 <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className={`form-control form-control-sm ${errors.lonColumnName ? 'is-invalid' : ''}`}
                                                {...register("lonColumnName", { required: (watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') ? "경도 컬럼명을 입력해주세요." : false })} 
                                                placeholder="예: longitude, 경도, x"
                                            />
                                            {errors.lonColumnName && <div className="invalid-feedback">{errors.lonColumnName.message}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">위도(Latitude/Y) 컬럼명 <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className={`form-control form-control-sm ${errors.latColumnName ? 'is-invalid' : ''}`}
                                                {...register("latColumnName", { required: (watchSpatialType === 'POINT' || watchSpatialType === 'MIXED') ? "위도 컬럼명을 입력해주세요." : false })} 
                                                placeholder="예: latitude, 위도, y"
                                            />
                                            {errors.latColumnName && <div className="invalid-feedback">{errors.latColumnName.message}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. LINESTRING/POLYGON 또는 MIXED(혼합) 선택 시: WKT 컬럼명 입력 */}
                        {(watchSpatialType === 'LINESTRING' || watchSpatialType === 'POLYGON' || watchSpatialType === 'MIXED') && (
                            <div className="col-12 mt-2">
                                <div className="p-3 bg-light rounded border border-primary border-opacity-25">
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="bi bi-bounding-box me-2"></i>공간 텍스트(WKT) 컬럼 설정 (CSV 기준)
                                    </h6>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">WKT 컬럼명 <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control form-control-sm ${errors.wktColumnName ? 'is-invalid' : ''}`}
                                            {...register("wktColumnName", { required: (watchSpatialType === 'LINESTRING' || watchSpatialType === 'POLYGON' || watchSpatialType === 'MIXED') ? "WKT 컬럼명을 입력해주세요." : false })} 
                                            placeholder="예: wkt, geom_wkt"
                                        />
                                        {errors.wktColumnName && <div className="invalid-feedback">{errors.wktColumnName.message}</div>}
                                    </div>
                                </div>
                            </div>
                        )}



                        <div className="col-md-6">
                            <label className="form-label fw-semibold">제공 기관/출처 <span className="text-danger">*</span></label>
                            <input 
                                type="text" 
                                className={`form-control ${errors.provider ? 'is-invalid' : ''}`} 
                                {...register("provider", { required: "제공 기관/출처를 입력해 주세요!" })} 
                                placeholder="예: 수원시청, 국토교통부" 
                            />
                            {errors.provider && <div className="invalid-feedback">{errors.provider.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">수집 방식 <span className="text-danger">*</span></label>
                            <select 
                                className={`form-select ${errors.sourceType ? 'is-invalid' : ''}`} 
                                {...register("sourceType", { required: "수집 방식을 선택해 주세요!" })}
                            >
                                <option value="">선택해 주세요</option>
                                <option value="FILE_UPLOAD">파일 직접 업로드</option>
                                <option value="API">외부 API 연동</option>
                            </select>
                            {errors.sourceType && <div className="invalid-feedback">{errors.sourceType.message}</div>}
                        </div>

                        <div className="col-12 mt-4">
                            <label className="form-label fw-semibold d-block">공개 여부 <span className="text-danger">*</span></label>
                            <div className="form-check form-check-inline">
                                <input 
                                    className={`form-check-input ${errors.isPublic ? 'is-invalid' : ''}`} 
                                    type="radio" 
                                    id="publicAll" 
                                    value="true" 
                                    {...register("isPublic", { required: "공개 여부를 선택해 주세요!" })} 
                                />
                                <label className="form-check-label" htmlFor="publicAll">전체 공개</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input 
                                    className={`form-check-input ${errors.isPublic ? 'is-invalid' : ''}`} 
                                    type="radio" 
                                    id="publicPrivate" 
                                    value="false" 
                                    {...register("isPublic", { required: "공개 여부를 선택해 주세요!" })} 
                                />
                                <label className="form-check-label" htmlFor="publicPrivate">비공개 (내부 연구용)</label>
                            </div>
                            {errors.isPublic && <div className="text-danger small mt-1">{errors.isPublic.message}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 상세 메타데이터 섹션 (선택 입력) */}
            <div className="card shadow-sm mb-4 border-0">
                <div className="card-body p-4 p-md-5">
                    <h5 className="card-title fw-bold mb-4 d-flex align-items-center">
                        <span className="badge bg-primary rounded-pill me-2">2</span> 
                        상세 메타데이터 (Metadata) 
                        <span className="text-muted fw-normal fs-6 ms-2">- 선택 입력</span>
                    </h5>

                    <div className="row g-4">
                        <div className="col-12">
                            <label className="form-label fw-semibold">검색 태그 (keywords)</label>
                            <input type="text" className="form-control" {...register("keywords")} placeholder="예: #수원, #약국, #보건 (쉼표로 구분)" />
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">데이터 수집 시작일 (data_start_date)</label>
                            <input type="date" className="form-control" {...register("dataStartDate")} />
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">데이터 수집 종료일 (data_end_date)</label>
                            <input type="date" className="form-control" {...register("dataEndDate")} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">시간적 범위 (temporal_coverage)</label>
                            <input type="text" className="form-control" {...register("temporalCoverage")} placeholder="예: 2025.01 ~ 2026.12 또는 '조선시대'" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">공간적 범위 (spatial_coverage)</label>
                            <input type="text" className="form-control" {...register("spatialCoverage")} placeholder="예: 경기도 수원시 전체" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">업데이트 주기 (update_cycle)</label>
                            <select className="form-select" {...register("updateCycle")}>
                                <option value="ON_DEMAND">수시 (On-demand)</option>
                                <option value="DAILY">매일 (Daily)</option>
                                <option value="MONTHLY">매월 (Monthly)</option>
                                <option value="YEARLY">매년 (Yearly)</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">라이선스 (license)</label>
                            <input type="text" className="form-control" {...register("license")} placeholder="예: 공공누리 제1유형, 사내 대외비" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">품질 등급 (quality_grade)</label>
                            <select className="form-select" {...register("qualityGrade")}>
                                <option value="">등급 선택 (미정)</option>
                                <option value="A">A등급 (초정밀/검증완료)</option>
                                <option value="B">B등급 (일반 활용 가능)</option>
                                <option value="C">C등급 (단순 참고용)</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">품질 상세 설명 (quality_description)</label>
                            <input type="text" className="form-control" {...register("qualityDescription")} placeholder="예: GPS 측량 오차 1m 이내" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">담당자 이름 (contact_person)</label>
                            <input type="text" className="form-control" {...register("contactPerson")} placeholder="예: 홍길동 연구원" />
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">담당자 이메일 (contact_email)</label>
                            <input type="email" className="form-control" {...register("contactEmail")} placeholder="예: example@sri.re.kr" />
                        </div>

                        <div className="col-12 pt-3 border-top mt-4">
                            <label className="form-label fw-semibold">기타 확장 메타데이터 (extra_metadata JSONB)</label>
                            <textarea className="form-control font-monospace bg-light" {...register("extraMetadata")} rows="2" placeholder='예: {"sensor_model": "DJI-Mavic-3", "resolution": "5cm"}'></textarea>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 파일 첨부 섹션 */}
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-body p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title fw-bold mb-0 d-flex align-items-center">
                            <span className="badge bg-primary rounded-pill me-2">3</span> 
                            파일 첨부 <span className="text-danger ms-1">*</span>
                        </h5>
                        <div className="d-flex align-items-center bg-light px-3 py-1 rounded border">
                            <span className="text-muted small fw-semibold me-2">인코딩:</span>
                            <select className="form-select form-select-sm border-0 bg-transparent text-primary fw-bold p-0 pe-3" {...register("encoding")} style={{width: 'auto'}}>
                                <option value="UTF-8">UTF-8 (기본)</option>
                                <option value="EUC-KR">EUC-KR (공공 CSV)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-5 text-center bg-light border rounded-3 border-secondary border-opacity-25" style={{ borderStyle: 'dashed !important' }}>
                        <i className="bi bi-cloud-arrow-up text-secondary mb-3" style={{ fontSize: '3rem' }}></i>
                        <h6 className="fw-bold text-dark">데이터 파일을 선택해 주세요</h6>
                        <p className="text-muted small mb-4">지원 포맷: CSV, SHP(ZIP 압축), GeoJSON</p>
                        <div className="w-50 mx-auto">
                            <input className="form-control" type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </div>
                        {file && <p className="mt-3 text-success fw-bold">선택된 파일: {file.name}</p>}
                    </div>
                </div>
            </div>

            {/* 제출 버튼 */}
            <div className="d-flex justify-content-center mb-5">
                <button 
                    className="btn btn-primary btn-lg px-5 py-3 fw-bold shadow-sm" 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    style={{ minWidth: '300px' }}
                >
                    {isLoading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>전송 중...</span>
                    ) : (
                        <span><i className="bi bi-check-circle me-2"></i>데이터 업로드 및 검증 시작</span>
                    )}
                </button>
            </div>

            {/* ===================================================================== */}
            {/* 🚀 [신규 추가] 시스템 처리 결과 화면 (isSuccess가 true일 때만 노출) */}
            {/* ===================================================================== */}
            {isSuccess && (
                <div className="mt-4 p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5' }}>
                    <div className="d-flex align-items-start">
                        {/* 왼쪽 초록색 체크 아이콘 */}
                        <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                            <i className="bi bi-check-lg fs-4"></i>
                        </div>
                        
                        {/* 오른쪽 텍스트 영역 */}
                        <div>
                            <h5 className="fw-bold mb-3" style={{ color: '#047857' }}>검증 완료 및 관리자 승인 대기</h5>
                            <p className="text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                총 <strong>{successCount.toLocaleString()}</strong>건의 데이터가 형식 에러 없이 시스템 검증을 통과하여 <strong>임시 저장 및 관리자 승인 대기</strong> 상태로 전환되었습니다.
                            </p>
                            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
                                관리자의 최종 위치/내용 검토 후 정식 데이터셋에 적재됩니다.
                            </p>
                            
                            {/* 이동 버튼 */}
                            <button 
                                className="btn fw-bold px-4 py-2 rounded-3" 
                                style={{ backgroundColor: '#D1FAE5', color: '#047857', border: 'none' }}
                                onClick={() => alert("목록 페이지로 이동하는 로직을 나중에 연결하세요!")}
                            >
                                데이터셋 목록으로 이동
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================================== */}
            {/* 🚨 [신규 추가] 시스템 에러 결과 화면 (isError가 true일 때만 노출) */}
            {/* ===================================================================== */}
            {isError && (
                <div className="mt-4 p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <div className="d-flex align-items-start">
                        {/* 왼쪽 빨간색 X 아이콘 */}
                        <div className="bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                            <i className="bi bi-x-lg fs-5"></i>
                        </div>
                        
                        {/* 오른쪽 텍스트 및 테이블 영역 */}
                        <div className="w-100">
                            <h5 className="fw-bold mb-2" style={{ color: '#991B1B' }}>검증 실패 (승인 요청 불가)</h5>
                            {/* 🚀 2. 내용 변경: 표가 있을 때와 없을 때(중복 에러일 때) 보여주는 문구를 다르게 처리! */}
                            <p className="text-danger mb-4" style={{ fontSize: '0.95rem' }}>
                                {errorList.length > 0 ? (
                                    <>
                                        업로드한 데이터 중 오류가 발견되어 승인 요청이 취소되었습니다. <br/>
                                        아래 상세 에러 내역을 확인하고 원본 파일을 수정한 뒤 다시 업로드해 주세요.
                                    </>
                                ) : (
                                    // 표가 없을 때(중복 파일 500 에러 등)는 백엔드가 보낸 에러 메시지를 쾅 찍어줍니다!
                                    <span className="fw-bold fs-6">{errorMessage}</span>
                                )}
                            </p>
                            
                            {/* 🚀 스크롤 가능한 에러 리스트 테이블 영역 (에러 리스트가 있을 때만 렌더링) */}
                            {errorList.length > 0 && (
                                <div className="bg-white rounded-3 border" style={{ borderColor: '#FECACA' }}>
                                    
                                    {/* 👇 여기가 스크롤을 만들어주는 마법의 CSS입니다 (높이 300px 고정) */}
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="rounded-3">
                                        <table className="table table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                                            {/* sticky-top: 스크롤을 내려도 제목줄은 천장에 딱 붙어있게 만듭니다 */}
                                            <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                                                <tr>
                                                    <th className="text-center py-3" style={{ color: '#991B1B', width: '15%' }}>행 번호</th>
                                                    <th className="text-center py-3" style={{ color: '#991B1B', width: '25%' }}>컬럼명</th>
                                                    <th className="py-3" style={{ color: '#991B1B', width: '60%' }}>상세 에러 메시지</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {errorList.map((err, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center fw-bold align-middle">
                                                            Line {err.rowNumber}
                                                        </td>
                                                        <td className="text-center text-muted font-monospace align-middle">
                                                            {err.columnName}
                                                        </td>
                                                        <td className="align-middle text-danger">
                                                            <div className="fw-semibold">{err.errorMessage}</div>
                                                            {/* 입력값이 있으면 표시 (사진의 "입력값: 삼십칠도" 처럼) */}
                                                            {err.rawValue && (
                                                                <div className="small text-muted mt-1">
                                                                    (입력값: {err.rawValue})
                                                                </div>
                                                            )}
                                                            {/* 시스템 로그용 에러 타입 추가 */}
                                                            <div className="small" style={{ color: '#d1d5db' }}>
                                                                [코드: {err.errorType}]
                                                            </div>
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

        </div>
    );
}

export default UploadWritePage;