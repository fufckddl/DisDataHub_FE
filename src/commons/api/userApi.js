import axiosInstance from "./axiosinstance"

export const loginApi = async (data) => {
    return await axiosInstance.post("/api/users/login", data);
}
export const registerUserApi = (data) => {
    return axiosInstance.post("/api/users/join", data);
}
export const getUserInfoFromTokenApi = () => {
    return axiosInstance.get("/api/users/me");
};