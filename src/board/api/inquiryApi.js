import axios from "axios";

const BASE_URL = "http://localhost:8080/api/board/inquiries";

export const getInquiryListApi = async () => {
  const response = await axios.get(`${BASE_URL}/findInquiryList`);
  return response.data;
};