import axiosInstance from "../../commons/api/axiosinstance";

const BASE_URL = "/api/board/notices";

// 사용자 공지사항 목록 조회
export const getNoticeListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/findNoticeList`);
  return response.data;
};

// 사용자 공지사항 상세 조회
// 이 API를 호출해야 백엔드에서 조회수 증가 로직이 실행됨
export const getNoticeDetailApi = async (postId) => {
  const response = await axiosInstance.get(`${BASE_URL}/${postId}`);
  return response.data;
};

// 공지사항 작성
export const createNoticeApi = async (noticeData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/createNotice`,
    noticeData
  );

  return response.data;
};

// 관리자 공지사항 목록 조회
export const getAdminNoticeListApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/adminNoticeList`);
  return response.data;
};

// 관리자 공지사항 상세 조회
// 관리자는 조회수 증가시키면 안 되므로 별도 API 사용
// 삭제된 게시글도 이 API로 조회 가능해야 함
export const getAdminNoticeDetailApi = async (postId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/adminNoticeDetail/${postId}`
  );

  return response.data;
};

// 공지사항 수정
export const updateNoticeApi = async (postId, noticeData) => {
  const response = await axiosInstance.put(`${BASE_URL}/${postId}`, noticeData);

  return response.data;
};

// 공지사항 삭제
export const deleteNoticeApi = async (postId) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${postId}`);

  return response.data;
};

// 공지사항 삭제 취소
export const restoreNoticeApi = async (postId) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${postId}/restore`);

  return response.data;
};