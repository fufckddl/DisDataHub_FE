import axiosInstance from "../../commons/api/axiosinstance";

const BASE_URL = "/api/board/inquiries";

// 사용자 문의 목록 조회
export const getInquiryListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/findInquiryList`);

  return response.data;
};

// 사용자 문의 상세 조회
export const getInquiryDetailApi = async (postId) => {
  const response = await axiosInstance.get(`${BASE_URL}/${postId}`);

  return response.data;
};

// 사용자 문의 작성
export const createInquiryApi = async (inquiryData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/createInquiry`,
    inquiryData
  );

  return response.data;
};

// 사용자 본인 문의 수정
export const updateMyInquiryApi = async (postId, inquiryData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${postId}`,
    inquiryData
  );

  return response.data;
};

// 사용자 본인 문의 삭제
export const deleteMyInquiryApi = async (postId) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${postId}`);

  return response.data;
};

// 관리자 문의 목록 조회
export const getAdminInquiryListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/adminInquiryList`);

  return response.data;
};

// 관리자 문의 상세 조회
export const getAdminInquiryDetailApi = async (postId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/adminInquiryDetail/${postId}`
  );

  return response.data;
};

// 관리자 답변 저장
export const saveAdminInquiryAnswerApi = async (postId, answerData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/${postId}/answer`,
    answerData
  );

  return response.data;
};