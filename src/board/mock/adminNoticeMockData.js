export const adminNoticeMockList = [
  {
    postId: 128,
    title: "시스템 점검 안내 (2025-05-31)",
    categoryCode: "SYSTEM",
    categoryName: "시스템",
    pinnedYn: "Y",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-27 10:30",
  },
  {
    postId: 127,
    title: "신규 데이터셋 업데이트 안내",
    categoryCode: "DATA",
    categoryName: "데이터",
    pinnedYn: "N",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-26 14:20",
  },
  {
    postId: 126,
    title: "GIS 분석 도구 업데이트 안내",
    categoryCode: "SERVICE",
    categoryName: "서비스",
    pinnedYn: "Y",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-23 09:15",
  },
  {
    postId: 125,
    title: "개인정보처리방침 변경 안내",
    categoryCode: "POLICY",
    categoryName: "정책",
    pinnedYn: "N",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-20 16:45",
  },
  {
    postId: 124,
    title: "사용자 매뉴얼 업데이트 안내",
    categoryCode: "SERVICE",
    categoryName: "서비스",
    pinnedYn: "N",
    visibilityStatus: "PRIVATE",
    visibilityName: "비공개",
    createdAt: "2025-05-19 11:05",
  },
  {
    postId: 123,
    title: "공공데이터 추가 연계 안내",
    categoryCode: "DATA",
    categoryName: "데이터",
    pinnedYn: "Y",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-16 13:40",
  },
  {
    postId: 122,
    title: "문의 응답 지연 안내",
    categoryCode: "ETC",
    categoryName: "기타",
    pinnedYn: "N",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-14 10:00",
  },
  {
    postId: 121,
    title: "서비스 이용약관 변경 안내",
    categoryCode: "POLICY",
    categoryName: "정책",
    pinnedYn: "N",
    visibilityStatus: "PUBLIC",
    visibilityName: "공개",
    createdAt: "2025-05-12 15:30",
  },
];

export const adminNoticeCategoryMockList = [
  {
    code: "",
    name: "전체",
  },
  {
    code: "SYSTEM",
    name: "시스템",
  },
  {
    code: "DATA",
    name: "데이터",
  },
  {
    code: "SERVICE",
    name: "서비스",
  },
  {
    code: "POLICY",
    name: "정책",
  },
  {
    code: "ETC",
    name: "기타",
  },
];

export const adminNoticeVisibilityMockList = [
  {
    code: "",
    name: "전체",
  },
  {
    code: "PUBLIC",
    name: "공개",
  },
  {
    code: "PRIVATE",
    name: "비공개",
  },
];

export const adminNoticePaginationMock = {
  currentPage: 1,
  totalPage: 16,
  pageList: [1, 2, 3, 4, 5],
};