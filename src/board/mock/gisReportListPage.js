// GIS 데이터 오류 제보 게시판 목록 데이터
export const gisReportMockList = [
  {
    postId: 1,
    title: "역삼동 위치 데이터 오류",
    content:
      "지도상의 건물 위치가 실제 주소와 맞지 않습니다. 정확한 위치로 수정 부탁드립니다.",
    reportCategoryCode: "LOCATION_ERROR",
    reportCategoryName: "위치 오류",
    processStatusCode: "RECEIVED",
    processStatusName: "접수",
    address: "서울 강남구 역삼동",
    sido: "서울특별시",
    sigungu: "강남구",
    eupmyeondong: "역삼동",
    targetDataName: "건물 위치 데이터",
    latitude: 37.5006,
    longitude: 127.0364,
    writerName: "홍길동",
    createdAt: "2026-05-11",
    viewCount: 42,
    attachmentName: "역삼동_위치오류_이미지.png",
  },
  {
    postId: 2,
    title: "서초동 교통 데이터 누락",
    content:
      "서초동 일부 구간의 교통 데이터가 표시되지 않습니다. 데이터 누락 여부 확인 부탁드립니다.",
    reportCategoryCode: "MISSING_DATA",
    reportCategoryName: "데이터 누락",
    processStatusCode: "CHECKING",
    processStatusName: "확인 중",
    address: "서울 서초구 서초동",
    sido: "서울특별시",
    sigungu: "서초구",
    eupmyeondong: "서초동",
    targetDataName: "교통 데이터",
    latitude: 37.4919,
    longitude: 127.0079,
    writerName: "김철수",
    createdAt: "2026-05-10",
    viewCount: 35,
    attachmentName: "서초동_교통데이터_누락.png",
  },
  {
    postId: 3,
    title: "잠실동 환경 데이터 값 이상",
    content:
      "잠실동 환경 데이터 조회 시 일부 수치가 비정상적으로 표시됩니다.",
    reportCategoryCode: "ATTRIBUTE_ERROR",
    reportCategoryName: "속성 오류",
    processStatusCode: "COMPLETED",
    processStatusName: "수정 완료",
    address: "서울 송파구 잠실동",
    sido: "서울특별시",
    sigungu: "송파구",
    eupmyeondong: "잠실동",
    targetDataName: "환경 데이터",
    latitude: 37.5133,
    longitude: 127.1001,
    writerName: "이영희",
    createdAt: "2026-05-09",
    viewCount: 28,
    attachmentName: "잠실동_환경데이터_오류.png",
  },
];

// GIS 오류 제보 카테고리 select 데이터
export const gisReportCategoryMockList = [
  {
    code: "",
    name: "카테고리",
  },
  {
    code: "LOCATION_ERROR",
    name: "위치 오류",
  },
  {
    code: "MISSING_DATA",
    name: "데이터 누락",
  },
  {
    code: "ATTRIBUTE_ERROR",
    name: "속성 오류",
  },
];

// GIS 처리상태 select 데이터
export const gisProcessStatusMockList = [
  {
    code: "",
    name: "처리상태",
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
    code: "COMPLETED",
    name: "수정 완료",
  },
];

// 행정구역 select 데이터
export const gisRegionMockList = [
  {
    code: "",
    name: "행정구역",
  },
  {
    code: "SEOUL_GANGNAM",
    name: "서울 강남구",
  },
  {
    code: "SEOUL_SEOCHO",
    name: "서울 서초구",
  },
  {
    code: "SEOUL_SONGPA",
    name: "서울 송파구",
  },
];

// 지도 위에 표시할 마커 데이터
export const gisMapMarkerMockList = [
  {
    markerId: 1,
    postId: 1,
    title: "역삼동 위치 데이터 오류",
    latitude: 37.5006,
    longitude: 127.0364,
    processStatusCode: "RECEIVED",
    processStatusName: "접수",
    markerColor: "blue",
  },
  {
    markerId: 2,
    postId: 2,
    title: "서초동 교통 데이터 누락",
    latitude: 37.4919,
    longitude: 127.0079,
    processStatusCode: "CHECKING",
    processStatusName: "확인 중",
    markerColor: "orange",
  },
  {
    markerId: 3,
    postId: 3,
    title: "잠실동 환경 데이터 값 이상",
    latitude: 37.5133,
    longitude: 127.1001,
    processStatusCode: "COMPLETED",
    processStatusName: "수정 완료",
    markerColor: "green",
  },
];

// 지도 오른쪽 상세 카드에 띄울 선택된 제보 데이터
export const selectedGisReportMock = {
  postId: 1,
  title: "역삼동 위치 데이터 오류",
  reportCategoryCode: "LOCATION_ERROR",
  reportCategoryName: "위치 오류",
  processStatusCode: "RECEIVED",
  processStatusName: "접수",
  address: "서울 강남구 역삼동",
  createdAt: "2026-05-11",
  content:
    "지도상의 건물 위치가 실제 주소와 맞지 않습니다. 정확한 위치로 수정 부탁드립니다.",
  attachmentName: "역삼동_위치오류_이미지.png",
  targetDataName: "건물 위치 데이터",
  latitude: 37.5006,
  longitude: 127.0364,
};

// 처리상태 범례 데이터
export const gisStatusLegendMockList = [
  {
    code: "RECEIVED",
    name: "접수",
    color: "blue",
  },
  {
    code: "CHECKING",
    name: "확인 중",
    color: "orange",
  },
  {
    code: "COMPLETED",
    name: "수정 완료",
    color: "green",
  },
];

// 페이지네이션 더미 데이터
export const gisReportPaginationMock = {
  currentPage: 1,
  totalPage: 5,
  pageList: [1, 2, 3, 4, 5],
};