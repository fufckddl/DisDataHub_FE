import axios from "axios";

export const geocodeApi = async (address) => {
  const response = await axios.get("/api/location/geocode", {
    params: { address },
  });

  return response.data;
};