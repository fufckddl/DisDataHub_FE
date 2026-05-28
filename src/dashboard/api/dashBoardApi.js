import axiosInstance from "../../commons/api/axiosinstance";

// DB에 저장된 생활인구 데이터를 조회합니다.
export const getAreaPopulation = async ({ areaCode, areaLevel, date, hour = "00" }) => {
    const params = { hour, areaCode };
    if (areaLevel) {
        params.areaLevel = areaLevel;
    }
    if (date) {
        params.date = date;
    }

    const response = await axiosInstance.get("/api/dashboard/population", {
        params,
    });

    return response.data;
};

// DB에 저장된 S-DoT 유동인구 데이터를 조회합니다.
export const getAreaFloatingPopulation = async ({ areaCode, areaLevel, date, hour } = {}) => {
    const params = { areaCode };
    if (areaLevel) {
        params.areaLevel = areaLevel;
    }
    if (date) {
        params.date = date;
    }
    if (hour) {
        params.hour = hour;
    }

    const response = await axiosInstance.get("/api/dashboard/floating-population", {
        params,
    });

    return response.data;
};

// 서울 S-DoT 유동인구 OpenAPI 데이터를 조회합니다.
export const getSdotVisitorCount = async ({ start = 1, end = 200 } = {}) => {
    const response = await axiosInstance.get("/api/opendata/collect/sdot/visitor", {
        params: { start, end },
    });

    return response.data;
};
