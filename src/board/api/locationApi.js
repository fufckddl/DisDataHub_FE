import axios from "axios";

export const searchLocationApi = async (keyword) => {
  const response = await axios.get("/api/location/search", {
    params: { keyword },
  });

  return response.data;
};

export const geocodeApi = async (address) => {
  const response = await axios.get("/api/location/geocode", {
    params: { address },
  });

  return response.data;
};