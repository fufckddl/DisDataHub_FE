import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/gis-reports";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// 사용자 GIS 오류제보 목록 조회
export const getGisReportListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findGisReportList`);
  return response.data;
};

// 사용자 GIS 오류제보 작성
export const createGisReportApi = async (gisReportData) => {
  const response = await axios.post(`${BASE_URL}/createGisReport`, gisReportData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 GIS 오류제보 상세 조회
// 중요: isOwner 판단을 위해 토큰을 같이 보냄
export const getGisReportDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 본인 GIS 오류제보 수정
export const updateMyGisReportApi = async (postId, gisReportData) => {
  const response = await axios.put(`${BASE_URL}/${postId}`, gisReportData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 본인 GIS 오류제보 삭제
export const deleteMyGisReportApi = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 GIS 오류제보 목록 조회
export const getAdminGisReportListApi = async () => {
  const response = await axios.get(`${BASE_URL}/admin/list`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 GIS 오류제보 상세 조회
export const getAdminGisReportDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/admin/detail/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 GIS 오류제보 상태 변경 + 처리 내용 저장
export const saveAdminGisReportProcessApi = async (postId, processData) => {
  const response = await axios.put(
    `${BASE_URL}/admin/process/${postId}`,
    processData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// 관리자 GIS 오류제보 삭제
export const deleteAdminGisReportApi = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/admin/delete/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};