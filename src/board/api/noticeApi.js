import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/notices";

export const getNoticeListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findNoticeList`);
  return response.data;
};

export const getNoticeDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/${postId}`);
  return response.data;
};

export const createNoticeApi = async (noticeData) => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.post(`${BASE_URL}/createNotice`, noticeData, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return response.data;
};

export const getAdminNoticeListApi = async () => {
  const response = await axios.get(`${BASE_URL}/adminNoticeList`);
  return response.data;
};

export const getAdminNoticeDetailApi = async (postId) => {
  const response = await axios.get(`${BASE_URL}/adminNoticeDetail/${postId}`);
  return response.data;
};

export const updateNoticeApi = async (postId, noticeData) => {
  const token = localStorage.getItem("token");

  console.log("수정 요청 token:", token);

  const response = await axios.put(`${BASE_URL}/${postId}`, noticeData, {
    headers: token
    ? {
      Authorization: `Bearer ${token}`,
      }
    : {},
  });

  return response.data;
};