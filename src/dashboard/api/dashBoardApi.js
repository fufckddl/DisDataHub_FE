import axiosInstance from "../../commons/api/axiosinstance";
import { formatYyyymmddDaysAgo } from "../utils/formatDate";
import { getOpenDataEmptyMessage } from "../utils/openDataResponse";

const LATEST_DATA_LOOKBACK_DAYS = 7;

// 서울시 행정동 별 인구 통계 (date 생략 시 백엔드가 최근 7일 역순 조회)
export const getSeoulLivingPopulationByDong = async ({ date, hour = "00", areaCode }) => {
    const params = { hour, areaCode };
    if (date) {
        params.date = date;
    }

    const response = await axiosInstance.get("/api/opendata/collect/living-population/dong", {
        params,
    });

    return response.data;
};

// 서울시 자치구 별 인구 통계 (date 생략 시 백엔드가 최근 7일 역순 조회)
export const getSeoulLivingPopulationBySigungu = async ({ date, hour = "00", sigunguCode }) => {
    const params = { hour, sigunguCode };
    if (date) {
        params.date = date;
    }

    const response = await axiosInstance.get("/api/opendata/collect/living-population/sigungu", {
        params,
    });

    return response.data;
};

/** 오늘부터 최대 7일 전까지 역순으로 조회해 가장 최근 데이터 반환 */
export const getSeoulLivingPopulationByDongLatest = async ({
    hour = "00",
    areaCode,
    maxLookbackDays = LATEST_DATA_LOOKBACK_DAYS,
}) => {
    try {
        const data = await getSeoulLivingPopulationByDong({ hour, areaCode });
        if (!getOpenDataEmptyMessage(data)) {
            return { data, date: null };
        }
    } catch (error) {
        if (error.response?.status !== 400) {
            throw error;
        }
    }

    for (let daysAgo = 0; daysAgo <= maxLookbackDays; daysAgo += 1) {
        const date = formatYyyymmddDaysAgo(daysAgo);
        const data = await getSeoulLivingPopulationByDong({ date, hour, areaCode });

        if (!getOpenDataEmptyMessage(data)) {
            return { data, date };
        }
    }

    const fallbackDate = formatYyyymmddDaysAgo(maxLookbackDays);
    const data = await getSeoulLivingPopulationByDong({
        date: fallbackDate,
        hour,
        areaCode,
    });

    return { data, date: fallbackDate };
};

/** 오늘부터 최대 7일 전까지 역순으로 조회해 가장 최근 자치구 데이터 반환 */
export const getSeoulLivingPopulationBySigunguLatest = async ({
    hour = "00",
    sigunguCode,
    maxLookbackDays = LATEST_DATA_LOOKBACK_DAYS,
}) => {
    try {
        const data = await getSeoulLivingPopulationBySigungu({ hour, sigunguCode });
        if (!getOpenDataEmptyMessage(data)) {
            return { data, date: null };
        }
    } catch (error) {
        if (error.response?.status !== 400) {
            throw error;
        }
    }

    for (let daysAgo = 0; daysAgo <= maxLookbackDays; daysAgo += 1) {
        const date = formatYyyymmddDaysAgo(daysAgo);
        const data = await getSeoulLivingPopulationBySigungu({ date, hour, sigunguCode });

        if (!getOpenDataEmptyMessage(data)) {
            return { data, date };
        }
    }

    const fallbackDate = formatYyyymmddDaysAgo(maxLookbackDays);
    const data = await getSeoulLivingPopulationBySigungu({
        date: fallbackDate,
        hour,
        sigunguCode,
    });

    return { data, date: fallbackDate };
};
