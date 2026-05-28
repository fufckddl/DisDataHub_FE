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