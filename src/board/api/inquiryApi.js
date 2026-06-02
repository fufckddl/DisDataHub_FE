import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/inquiries";

export const getInquiryListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findInquiryList`);
  return response.data;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};

export const createInquiryApi = async (inquiryData) => {
    const response = await axios.post(`${BASE_URL}/createInquiry`, inquiryData, {
        headers: getAuthHeaders(),
    });

    return response.data;
}