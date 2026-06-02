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

// 대시보드에 표시할 GIS/통계 데이터 원천 카탈로그를 조회합니다.
export const getDashboardGisDataSources = async ({ sourceCategory, priority, activeOnly = true } = {}) => {
    const params = { activeOnly };
    if (sourceCategory) {
        params.sourceCategory = sourceCategory;
    }
    if (priority) {
        params.priority = priority;
    }

    const response = await axiosInstance.get("/api/dashboard/gis-data-sources", {
        params,
    });

    return response.data;
};

// 특정 GIS/통계 원천에서 대시보드에 노출할 데이터셋을 조회합니다.
export const getDashboardGisDatasets = async ({ sourceCode, layerType, activeOnly = true } = {}) => {
    const params = { activeOnly };
    if (sourceCode) {
        params.sourceCode = sourceCode;
    }
    if (layerType) {
        params.layerType = layerType;
    }

    const response = await axiosInstance.get("/api/dashboard/gis-datasets", {
        params,
    });

    return response.data;
};

// 특정 GIS/통계 데이터셋의 지표 사전을 조회합니다.
export const getDashboardGisMetrics = async ({ sourceCode, datasetCode } = {}) => {
    const params = {};
    if (sourceCode) {
        params.sourceCode = sourceCode;
    }
    if (datasetCode) {
        params.datasetCode = datasetCode;
    }

    const response = await axiosInstance.get("/api/dashboard/gis-metrics", {
        params,
    });

    return response.data;
};

// 특정 GIS 데이터셋의 지도 표시용 point/polygon 피처를 GeoJSON으로 조회합니다.
export const getDashboardGisFeatures = async ({ datasetCode, bbox, areaCode, limit = 500 } = {}) => {
    const params = { datasetCode, limit };
    if (bbox) {
        params.bbox = bbox;
    }
    if (areaCode) {
        params.areaCode = areaCode;
    }

    const response = await axiosInstance.get("/api/dashboard/gis-features", {
        params,
    });

    return response.data;
};

// GIS 피처성 데이터의 원천 전체 건수 기준 시도별 통계를 조회합니다.
export const getDashboardGisRegionStats = async ({ datasetCode } = {}) => {
    const response = await axiosInstance.get("/api/dashboard/gis-region-stats", {
        params: { datasetCode },
    });

    return response.data;
};
