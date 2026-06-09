import axios from "axios";

export const getSidoListApi = async () => {
  const response = await axios.get("/api/regions/sido");
  return response.data;
};

export const getSigunguListApi = async (sidoCode) => {
  const response = await axios.get("/api/regions/sigungu", {
    params: { sidoCode },
  });
  return response.data;
};

export const getEupmyeondongListApi = async (sigunguCode) => {
  const response = await axios.get("/api/regions/eupmyeondong", {
    params: { sigunguCode },
  });
  return response.data;
};