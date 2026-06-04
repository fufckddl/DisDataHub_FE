// 질문 / 문의 게시판 목록 데이터
export const inquiryMockList = [
  {
    postId: 1,
    title: "데이터 조회가 되지 않습니다",
    content:
      "데이터 조회 메뉴에서 검색을 실행했지만 결과가 표시되지 않습니다. 특정 데이터셋만 조회가 되지 않는 것인지 확인 부탁드립니다.",
    inquiryCategoryCode: "SYSTEM_USE",
    inquiryCategoryName: "시스템 이용",
    inquiryStatusCode: "RECEIVED",
    inquiryStatusName: "접수",
    writerName: "홍길동",
    createdAt: "2026-05-13",
    viewCount: 42,
    isPinned: true,
  },
  {
    postId: 2,
    title: "GIS 레이어가 보이지 않습니다",
    content:
      "지도 화면에서 GIS 레이어를 선택했는데 화면에 표시되지 않습니다. 브라우저 새로고침 후에도 동일한 문제가 발생합니다.",
    inquiryCategoryCode: "ERROR",
    inquiryCategoryName: "오류 문의",
    inquiryStatusCode: "CHECKING",
    inquiryStatusName: "확인 중",
    writerName: "김철수",
    createdAt: "2026-05-12",
    viewCount: 35,
    isPinned: false,
  },
  {
    postId: 3,
    title: "로그인 후 권한 문의",
    content:
      "로그인 후 일부 메뉴에 접근할 수 없습니다. 권한 설정이 필요한지 확인 부탁드립니다.",
    inquiryCategoryCode: "ACCOUNT",
    inquiryCategoryName: "로그인/회원가입",
    inquiryStatusCode: "ANSWERED",
    inquiryStatusName: "답변 완료",
    writerName: "이영희",
    createdAt: "2026-05-11",
    viewCount: 58,
    isPinned: false,
  },
  {
    postId: 4,
    title: "다운로드 파일 형식 문의",
    content:
      "데이터 다운로드 시 제공되는 파일 형식이 어떤 종류인지 궁금합니다.",
    inquiryCategoryCode: "DATA_VIEW",
    inquiryCategoryName: "데이터 조회",
    inquiryStatusCode: "ANSWERED",
    inquiryStatusName: "답변 완료",
    writerName: "박민수",
    createdAt: "2026-05-09",
    viewCount: 29,
    isPinned: false,
  },
];

// 문의 분류 select 데이터
export const inquiryCategoryMockList = [
  {
    code: "",
    name: "전체 분류",
  },
  {
    code: "SYSTEM_USE",
    name: "시스템 이용",
  },
  {
    code: "ERROR",
    name: "오류 문의",
  },
  {
    code: "ACCOUNT",
    name: "로그인/회원가입",
  },
  {
    code: "DATA_VIEW",
    name: "데이터 조회",
  },
];

// 문의 상태 select 데이터
export const inquiryStatusMockList = [
  {
    code: "",
    name: "전체 상태",
  },
  {
    code: "RECEIVED",
    name: "접수",
  },
  {
    code: "CHECKING",
    name: "확인 중",
  },
  {
    code: "ANSWERED",
    name: "답변 완료",
  },
];

// 오른쪽 문의 현황 데이터
export const inquirySummaryMock = {
  receivedCount: 5,
  checkingCount: 3,
  answeredCount: 12,
};

// 오른쪽 최근 답변 데이터
export const recentAnswerMockList = [
  {
    postId: 3,
    title: "로그인 후 권한 문의",
    statusCode: "ANSWERED",
    statusName: "답변 완료",
    answerPreview: "확인 결과, 사용자 그룹 권한 설정이 필요하여 ...",
    answeredAt: "2026-05-11",
  },
  {
    postId: 4,
    title: "다운로드 파일 형식 문의",
    statusCode: "ANSWERED",
    statusName: "답변 완료",
    answerPreview: "현재 데이터는 CSV, Shapefile, GeoJSON ...",
    answeredAt: "2026-05-09",
  },
];

// 하단 문의 작성 가이드 데이터
export const inquiryGuideMockList = [
  "정확한 문의를 위해 분류를 선택해 주세요.",
  "오류 발생 시 화면 캡처나 오류 메시지를 첨부해 주세요.",
  "답변 완료 시 이메일 또는 알림으로 안내해 드립니다.",
];