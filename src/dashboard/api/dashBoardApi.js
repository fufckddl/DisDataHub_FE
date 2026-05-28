import axiosInstance from "../../commons/api/axiosinstance";

// DB에 저장된 생활인구 데이터를 조회합니다.
export const getAreaPopulation = async ({ areaCode, date, hour = "00" }) => {
    const params = { hour, areaCode };
    if (date) {
        params.date = date;
    }

    const response = await axiosInstance.get("/api/dashboard/population", {
        params,
    });

    return response.data;
};
