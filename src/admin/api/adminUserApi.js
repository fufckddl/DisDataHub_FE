import axiosInstance from "../../commons/api/axiosinstance";

export const getAdminUserListApi = () => {
    return axiosInstance.get("/api/admin/users");
};

export const getAdminUserDetailApi = (userId) => {
    return axiosInstance.get(`/api/admin/users/${userId}`);
};

// 사용자 제재 유형 목록 조회
export const getUserManagementTypeListApi = () => {
    return axiosInstance.get("/api/admin/user-management/types");
};

// 사용자 제재 등록
export const registerUserManagementLogApi = (data) => {
    return axiosInstance.post(
        "/api/admin/user-management/log",
        data
    );
};

// 시스템 설정 변경
export const updateSystemSettingApi = (data) => {
    return axiosInstance.post(
        "/api/admin/systemSetting/update",
        data
    );
};