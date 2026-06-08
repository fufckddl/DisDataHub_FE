import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/inquiries";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const getInquiryListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findInquiryList`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 문의 상세 조회
export const getInquiryDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 문의 작성
export const createInquiryApi = async (inquiryData) => {
  const response = await axios.post(`${BASE_URL}/createInquiry`, inquiryData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 문의 목록 조회
export const getAdminInquiryListApi = async () => {
  const response = await axios.get(`${BASE_URL}/adminInquiryList`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 관리자 문의 상세 조회
export const getAdminInquiryDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/adminInquiryDetail/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const saveAdminInquiryAnswerApi = async (postId, answerData) => {
  const response = await axios.post(`${BASE_URL}/${postId}/answer`, answerData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 본인 문의 수정
export const updateMyInquiryApi = async (postId, inquiryData) => {
  const response = await axios.put(`${BASE_URL}/${postId}`, inquiryData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 사용자 본인 문의 삭제
export const deleteMyInquiryApi = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};