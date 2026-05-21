// src/board/mock/adminInquiryMockData.js

export const adminInquiryMockList = [
  {
    postId: 87,
    title: "로그인 후 지도 레이어가 표시되지 않습니다.",
    content:
      "로그인 후 지도 화면에 접속했는데 기본 지도는 표시되지만 선택한 레이어가 보이지 않습니다.\n\n새로고침을 해도 동일한 문제가 발생하며, 다른 브라우저에서도 같은 현상이 확인됩니다.\n레이어 목록에서는 선택된 것으로 보이지만 지도에는 표시되지 않습니다.",
    inquiryCategoryCode: "SERVICE",
    inquiryCategoryName: "서비스",
    inquiryStatusCode: "RECEIVED",
    inquiryStatusName: "접수",
    writerName: "김민수",
    writerEmail: "kimminsu@example.com",
    createdAt: "2025-05-27 09:25",
    viewCount: 18,
    attachmentName: "지도_레이어_오류.png",
    answerContent: "",
    answeredAt: "",
  },
  {
    postId: 86,
    title: "공간 분석 실행 시 오류 메시지가 발생합니다.",
    content:
      "공간 분석 메뉴에서 분석 조건을 선택하고 실행 버튼을 누르면 오류 메시지가 표시됩니다.\n\n분석 대상 데이터는 행정구역 경계 데이터이며, 동일한 조건으로 여러 번 실행해도 같은 오류가 발생합니다.\n오류 메시지는 첨부파일로 함께 전달드립니다.",
    inquiryCategoryCode: "SYSTEM",
    inquiryCategoryName: "시스템",
    inquiryStatusCode: "CHECKING",
    inquiryStatusName: "확인 중",
    writerName: "이서연",
    writerEmail: "seoyeon@example.com",
    createdAt: "2025-05-26 16:40",
    viewCount: 31,
    attachmentName: "공간분석_오류화면.png",
    answerContent: "",
    answeredAt: "",
  },
  {
    postId: 85,
    title: "데이터 다운로드가 되지 않습니다.",
    content:
      "공간데이터 다운로드 메뉴에서 토지이용 현황도 데이터를 다운로드하려고 하면 압축 파일은 생성되지만 일부 파일이 누락됩니다.\n\n특히 shp 파일이 누락되어 QGIS에서 데이터를 열 수 없습니다.\n다른 데이터셋은 정상적으로 다운로드됩니다.",
    inquiryCategoryCode: "DATA",
    inquiryCategoryName: "데이터",
    inquiryStatusCode: "ANSWERED",
    inquiryStatusName: "답변 완료",
    writerName: "박지훈",
    writerEmail: "jihun@example.com",
    createdAt: "2025-05-26 11:15",
    viewCount: 44,
    attachmentName: "다운로드_오류_캡처.png",
    answerContent:
      "확인 결과 해당 데이터셋의 일부 파일 경로가 잘못 연결되어 있었습니다.\n현재 수정 완료되었으며 다시 다운로드를 시도해 주세요.",
    answeredAt: "2025-05-26 15:30",
  },
  {
    postId: 84,
    title: "QGIS 연동 플러그인 설치 방법 문의",
    content:
      "GIS 데이터를 QGIS에서 활용하려고 합니다.\n\n제공되는 플러그인 설치 방법과 API 인증키 입력 절차를 알고 싶습니다.\n설치 매뉴얼이 있다면 함께 안내 부탁드립니다.",
    inquiryCategoryCode: "SERVICE",
    inquiryCategoryName: "서비스",
    inquiryStatusCode: "ANSWERED",
    inquiryStatusName: "답변 완료",
    writerName: "최유리",
    writerEmail: "yuri@example.com",
    createdAt: "2025-05-25 14:50",
    viewCount: 27,
    attachmentName: "",
    answerContent:
      "QGIS 플러그인은 자료실에서 다운로드할 수 있습니다.\n설치 후 플러그인 메뉴에서 API 인증키를 입력하면 연동할 수 있습니다.\n자세한 설치 방법은 사용자 매뉴얼을 참고해 주세요.",
    answeredAt: "2025-05-25 17:10",
  },
  {
    postId: 83,
    title: "회원 정보 수정이 반영되지 않습니다.",
    content:
      "마이페이지에서 소속 기관 정보를 수정했는데 저장 후에도 기존 정보가 계속 표시됩니다.\n\n로그아웃 후 다시 로그인해도 수정된 내용이 반영되지 않습니다.",
    inquiryCategoryCode: "SYSTEM",
    inquiryCategoryName: "시스템",
    inquiryStatusCode: "CHECKING",
    inquiryStatusName: "확인 중",
    writerName: "정재훈",
    writerEmail: "jaehoon@example.com",
    createdAt: "2025-05-25 09:30",
    viewCount: 22,
    attachmentName: "",
    answerContent: "",
    answeredAt: "",
  },
  {
    postId: 82,
    title: "지도 출력 시 축척이 맞지 않습니다.",
    content:
      "지도 출력 기능을 사용할 때 화면에서 보이는 축척과 PDF로 저장된 결과물의 축척이 다르게 표시됩니다.\n\n출력 파일을 업무 보고서에 첨부해야 해서 정확한 축척 적용이 필요합니다.",
    inquiryCategoryCode: "SERVICE",
    inquiryCategoryName: "서비스",
    inquiryStatusCode: "RECEIVED",
    inquiryStatusName: "접수",
    writerName: "한지은",
    writerEmail: "jieun@example.com",
    createdAt: "2025-05-24 17:05",
    viewCount: 16,
    attachmentName: "지도출력_축척오류.pdf",
    answerContent: "",
    answeredAt: "",
  },
  {
    postId: 81,
    title: "공공데이터 갱신 주기가 어떻게 되나요?",
    content:
      "시스템에서 제공하는 공공데이터가 어느 주기로 갱신되는지 알고 싶습니다.\n\n특히 도로명주소 데이터와 행정구역 경계 데이터의 갱신 주기가 궁금합니다.",
    inquiryCategoryCode: "DATA",
    inquiryCategoryName: "데이터",
    inquiryStatusCode: "ANSWERED",
    inquiryStatusName: "답변 완료",
    writerName: "오현우",
    writerEmail: "hyunwoo@example.com",
    createdAt: "2025-05-24 10:20",
    viewCount: 39,
    attachmentName: "",
    answerContent:
      "공공데이터는 데이터 종류에 따라 갱신 주기가 다릅니다.\n도로명주소 데이터는 월 1회, 행정구역 경계 데이터는 분기별 갱신을 기준으로 운영하고 있습니다.",
    answeredAt: "2025-05-24 13:40",
  },
  {
    postId: 80,
    title: "비밀번호 재설정 이메일이 오지 않습니다.",
    content:
      "비밀번호 찾기 기능을 사용했는데 재설정 이메일이 수신되지 않습니다.\n\n스팸메일함도 확인했지만 이메일이 없습니다.\n가입 이메일 주소는 현재 정상적으로 사용 중입니다.",
    inquiryCategoryCode: "SYSTEM",
    inquiryCategoryName: "시스템",
    inquiryStatusCode: "RECEIVED",
    inquiryStatusName: "접수",
    writerName: "권도윤",
    writerEmail: "doyoon@example.com",
    createdAt: "2025-05-23 15:10",
    viewCount: 25,
    attachmentName: "",
    answerContent: "",
    answeredAt: "",
  },
];

export const adminInquiryCategoryMockList = [
  {
    code: "",
    name: "전체",
  },
  {
    code: "SERVICE",
    name: "서비스",
  },
  {
    code: "SYSTEM",
    name: "시스템",
  },
  {
    code: "DATA",
    name: "데이터",
  },
];

export const adminInquiryStatusMockList = [
  {
    code: "",
    name: "전체",
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

export const adminInquiryPaginationMock = {
  currentPage: 1,
  totalPage: 11,
  pageList: [1, 2, 3, 4, 5],
};

export const adminInquirySummaryMock = {
  totalCount: adminInquiryMockList.length,
  receivedCount: adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "RECEIVED"
  ).length,
  checkingCount: adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "CHECKING"
  ).length,
  answeredCount: adminInquiryMockList.filter(
    (inquiry) => inquiry.inquiryStatusCode === "ANSWERED"
  ).length,
};