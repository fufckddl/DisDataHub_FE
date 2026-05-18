// src/board/mock/boardMockData.js

export const noticeMockList = [
  {
    postId: 1,
    title: "[고정] 시스템 점검 안내",
    content:
      "보다 안정적인 서비스 제공을 위해 시스템 점검을 진행할 예정입니다. 서비스 이용에 참고해 주시기 바랍니다.",
    categoryCode: "OPERATION",
    categoryName: "운영 공지",
    createdAt: "2026-05-12",
    viewCount: 245,
    isPinned: true,
  },
  {
    postId: 2,
    title: "신규 GIS 데이터셋 추가 안내",
    content:
      "새로운 GIS 데이터셋이 추가되었습니다. 데이터 조회 메뉴에서 확인할 수 있습니다.",
    categoryCode: "DATA",
    categoryName: "데이터 공지",
    createdAt: "2026-05-10",
    viewCount: 182,
    isPinned: false,
  },
  {
    postId: 3,
    title: "게시판 기능 개선 안내",
    content:
      "문의 게시판과 GIS 오류 제보 게시판의 사용성이 개선되었습니다.",
    categoryCode: "SERVICE",
    categoryName: "서비스 공지",
    createdAt: "2026-05-08",
    viewCount: 133,
    isPinned: false,
  },
  {
    postId: 4,
    title: "지도 조회 성능 업데이트",
    content:
      "지도 데이터 조회 속도 개선 작업이 적용되었습니다.",
    categoryCode: "SYSTEM",
    categoryName: "시스템 공지",
    createdAt: "2026-05-05",
    viewCount: 98,
    isPinned: false,
  },
];

export const importantNoticeMock = {
  postId: 1,
  title: "[고정] 시스템 점검 안내",
  content:
    "보다 안정적인 서비스 제공을 위해 시스템 점검을 진행할 예정입니다. 서비스 이용에 참고해 주시기 바랍니다.",
  categoryCode: "OPERATION",
  categoryName: "운영 공지",
  startAt: "2026-05-12 (화) 02:00",
  endAt: "04:00",
};

export const noticeSummaryMock = {
  totalCount: 128,
  importantCount: 3,
  todayViewCount: 845,
};

export const recentNoticeMockList = [
  {
    postId: 1,
    title: "시스템 점검 안내",
    categoryName: "운영 공지",
    createdAt: "2026-05-12",
  },
  {
    postId: 2,
    title: "신규 GIS 데이터셋 추가 안내",
    categoryName: "데이터 공지",
    createdAt: "2026-05-10",
  },
  {
    postId: 3,
    title: "게시판 기능 개선 안내",
    categoryName: "서비스 공지",
    createdAt: "2026-05-08",
  },
  {
    postId: 4,
    title: "지도 조회 성능 업데이트",
    categoryName: "시스템 공지",
    createdAt: "2026-05-05",
  },
];

export const noticeCategoryMockList = [
  {
    code: "",
    name: "전체 분류",
  },
  {
    code: "OPERATION",
    name: "운영 공지",
  },
  {
    code: "DATA",
    name: "데이터 공지",
  },
  {
    code: "SERVICE",
    name: "서비스 공지",
  },
  {
    code: "SYSTEM",
    name: "시스템 공지",
  },
];