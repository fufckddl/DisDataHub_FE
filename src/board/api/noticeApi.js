import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/notices";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// 사용자 공지사항 목록 조회
export const getNoticeListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findNoticeList`);
  return response.data;
};

// 사용자 공지사항 상세 조회
// 이 API를 호출해야 백엔드에서 조회수 증가 로직이 실행됨
export const getNoticeDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`);
  return response.data;
};

// 공지사항 작성
export const createNoticeApi = async (noticeData) => {
  const response = await axios.post(`${BASE_URL}/createNotice`, noticeData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 공지사항 목록 조회
export const getAdminNoticeListApi = async () => {
  const response = await axios.get(`${BASE_URL}/adminNoticeList`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 공지사항 상세 조회
// 관리자는 조회수 증가시키면 안 되므로 별도 API 사용
export const getAdminNoticeDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/adminNoticeDetail/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 공지사항 수정
export const updateNoticeApi = async (postId, noticeData) => {
  const response = await axios.put(`${BASE_URL}/${postId}`, noticeData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 공지사항 삭제
export const deleteNoticeApi = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};