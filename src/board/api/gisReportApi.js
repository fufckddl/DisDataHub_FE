import axiosInstance from "../../commons/api/axiosinstance";

const BASE_URL = "/api/board/gis-reports";

// 사용자 GIS 오류제보 목록 조회
export const getGisReportListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/findGisReportList`);
  return response.data;
};

// 사용자 GIS 오류제보 작성
export const createGisReportApi = async (gisReportData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/createGisReport`,
    gisReportData
  );

  return response.data;
};

// 사용자 GIS 오류제보 상세 조회
export const getGisReportDetailApi = async (postId) => {
  const response = await axiosInstance.get(`${BASE_URL}/${postId}`);
  return response.data;
};

// 사용자 본인 GIS 오류제보 수정
export const updateMyGisReportApi = async (postId, gisReportData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${postId}`,
    gisReportData
  );

  return response.data;
};

// 사용자 본인 GIS 오류제보 삭제
export const deleteMyGisReportApi = async (postId) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${postId}`);
  return response.data;
};

// 관리자 GIS 오류제보 목록 조회
export const getAdminGisReportListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/admin/list`);
  return response.data;
};

// 관리자 GIS 오류제보 상세 조회
export const getAdminGisReportDetailApi = async (postId) => {
  const response = await axiosInstance.get(`${BASE_URL}/admin/detail/${postId}`);
  return response.data;
};

// 관리자 GIS 오류제보 상태 변경 + 처리 내용 저장
export const saveAdminGisReportProcessApi = async (postId, processData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/admin/process/${postId}`,
    processData
  );

  return response.data;
};

// 관리자 GIS 오류제보 삭제
export const deleteAdminGisReportApi = async (postId) => {
  const response = await axiosInstance.delete(
    `${BASE_URL}/admin/delete/${postId}`
  );

  return response.data;
};

// 사용자 GIS 오류제보 검색 / 필터 / 마커 목록 조회
export const searchGisReportListApi = async (searchData) => {
  const response = await axiosInstance.post(`${BASE_URL}/search`, searchData);
  return response.data;
};