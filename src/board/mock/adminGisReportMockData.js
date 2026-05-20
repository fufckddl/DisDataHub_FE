// src/board/mock/adminGisReportMockData.js

export const adminGisReportMockList = [
  {
    postId: 256,
    title: "도로 경계선이 실제 도로와 일치하지 않습니다.",
    errorTypeCode: "SPATIAL_ERROR",
    errorTypeName: "공간 데이터 오류",
    targetDataName: "도로 중심선",
    address: "서울특별시 강남구 테헤란로 152",
    processStatusCode: "REVIEWING",
    processStatusName: "검토중",
    createdAt: "2025-05-27 14:25",
  },
  {
    postId: 255,
    title: "건물 레이어에 누락된 건물이 있습니다.",
    errorTypeCode: "MISSING_DATA",
    errorTypeName: "데이터 누락",
    targetDataName: "건물 통합정보",
    address: "부산광역시 해운대구 우동 1509",
    processStatusCode: "ACTIONING",
    processStatusName: "조치중",
    createdAt: "2025-05-27 11:10",
  },
  {
    postId: 254,
    title: "지적도 경계가 실제 필지와 다릅니다.",
    errorTypeCode: "ATTRIBUTE_ERROR",
    errorTypeName: "속성 데이터 오류",
    targetDataName: "지적도",
    address: "대전광역시 서구 둔산로 100",
    processStatusCode: "ACTIONING",
    processStatusName: "조치중",
    createdAt: "2025-05-26 16:45",
  },
  {
    postId: 253,
    title: "하천 레이어가 최신 정보로 업데이트되지 않았습니다.",
    errorTypeCode: "UPDATE_REQUEST",
    errorTypeName: "데이터 갱신 요청",
    targetDataName: "하천도",
    address: "경기도 수원시 영통구 광교중앙로 248",
    processStatusCode: "REVIEWING",
    processStatusName: "검토중",
    createdAt: "2025-05-26 09:30",
  },
  {
    postId: 252,
    title: "지형 고도값이 실제보다 과소표기되어 있습니다.",
    errorTypeCode: "ATTRIBUTE_ERROR",
    errorTypeName: "속성 데이터 오류",
    targetDataName: "수치표고모델(DEM)",
    address: "강원특별자치도 춘천시 신북읍 산천리",
    processStatusCode: "REVIEWING",
    processStatusName: "검토중",
    createdAt: "2025-05-25 18:05",
  },
  {
    postId: 251,
    title: "공원 경계가 누락되어 표시되지 않습니다.",
    errorTypeCode: "MISSING_DATA",
    errorTypeName: "데이터 누락",
    targetDataName: "도시공원",
    address: "광주광역시 북구 용봉동 1396",
    processStatusCode: "COMPLETED",
    processStatusName: "처리완료",
    createdAt: "2025-05-24 13:20",
  },
  {
    postId: 250,
    title: "행정구역 경계선이 일부 겹쳐서 표시됩니다.",
    errorTypeCode: "SPATIAL_ERROR",
    errorTypeName: "공간 데이터 오류",
    targetDataName: "행정구역 경계",
    address: "인천광역시 연수구 송도과학로 32",
    processStatusCode: "COMPLETED",
    processStatusName: "처리완료",
    createdAt: "2025-05-23 17:50",
  },
  {
    postId: 249,
    title: "주소 검색 결과가 정확하지 않습니다.",
    errorTypeCode: "ATTRIBUTE_ERROR",
    errorTypeName: "속성 데이터 오류",
    targetDataName: "주소 POINT",
    address: "울산광역시 남구 삼산로 123",
    processStatusCode: "REVIEWING",
    processStatusName: "검토중",
    createdAt: "2025-05-23 10:15",
  },
  {
    postId: 248,
    title: "토지피복 분류가 실제와 다르게 표시됩니다.",
    errorTypeCode: "CLASSIFY_ERROR",
    errorTypeName: "분류 오류",
    targetDataName: "토지피복도",
    address: "전라남도 여수시 돌산읍 우두리",
    processStatusCode: "ACTIONING",
    processStatusName: "조치중",
    createdAt: "2025-05-22 15:40",
  },
  {
    postId: 247,
    title: "버스 정류장 위치가 실제 위치와 다릅니다.",
    errorTypeCode: "SPATIAL_ERROR",
    errorTypeName: "공간 데이터 오류",
    targetDataName: "버스 정류장",
    address: "경상북도 포항시 남구 대이로 55",
    processStatusCode: "COMPLETED",
    processStatusName: "처리완료",
    createdAt: "2025-05-22 09:05",
  },
];

export const adminGisErrorTypeMockList = [
  { code: "", name: "전체" },
  { code: "SPATIAL_ERROR", name: "공간 데이터 오류" },
  { code: "MISSING_DATA", name: "데이터 누락" },
  { code: "ATTRIBUTE_ERROR", name: "속성 데이터 오류" },
  { code: "UPDATE_REQUEST", name: "데이터 갱신 요청" },
  { code: "CLASSIFY_ERROR", name: "분류 오류" },
];

export const adminGisProcessStatusMockList = [
  { code: "", name: "전체" },
  { code: "RECEIVED", name: "제보완료" },
  { code: "REVIEWING", name: "검토중" },
  { code: "ACTIONING", name: "조치중" },
  { code: "COMPLETED", name: "처리완료" },
];

export const adminGisRegionMockList = [
  { code: "", name: "전체" },
  { code: "SEOUL", name: "서울특별시" },
  { code: "BUSAN", name: "부산광역시" },
  { code: "DAEJEON", name: "대전광역시" },
  { code: "GYEONGGI", name: "경기도" },
  { code: "GANGWON", name: "강원특별자치도" },
];

export const adminGisReportPaginationMock = {
  currentPage: 1,
  totalPage: 26,
  pageList: [1, 2, 3, 4, 5],
};

export const adminGisReportSummaryMock = {
  totalCount: 256,
  receivedCount: 38,
  reviewingCount: 62,
  actioningCount: 71,
  completedCount: 85,
};

// 디테일 페이지 모크데이터 추가

export const adminGisReportDetailMockList = [
  {
    postId: 256,
    title: "도로 경계선이 실제 도로와 일치하지 않습니다.",
    content:
      "서울특별시 강남구 테헤란로 152 인근 도로 구간에서 지도상 도로 경계선이 실제 도로 위치와 다르게 표시되고 있습니다.\n\n현장 위치와 지도 데이터를 비교했을 때 도로 중심선과 경계선이 일부 어긋나 있어 수정이 필요합니다.",
    errorTypeCode: "SPATIAL_ERROR",
    errorTypeName: "공간 데이터 오류",
    targetDataName: "도로 중심선",
    processStatusCode: "REVIEWING",
    processStatusName: "검토중",
    writerName: "김지현",
    writerId: "testuser01",
    createdAt: "2025-05-27 14:25",
    address: "서울특별시 강남구 테헤란로 152",
    latitude: 37.5007,
    longitude: 127.0365,
    attachmentName: "도로경계_오류위치.jpg",
    adminProcessContent: "",
    processHistory: [
      {
        historyId: 1,
        statusName: "제보완료",
        processedAt: "2025-05-27 14:25",
        content: "사용자가 GIS 오류 제보를 등록했습니다.",
      },
      {
        historyId: 2,
        statusName: "검토중",
        processedAt: "2025-05-27 15:05",
        content: "관리자가 제보 내용을 검토하기 시작했습니다.",
      },
    ],
  },
  {
    postId: 255,
    title: "건물 레이어에 누락된 건물이 있습니다.",
    content:
      "부산광역시 해운대구 우동 1509 주변 건물 레이어에서 실제 존재하는 건물이 지도에 표시되지 않습니다.\n\n건물 통합정보 데이터의 누락 여부 확인이 필요합니다.",
    errorTypeCode: "MISSING_DATA",
    errorTypeName: "데이터 누락",
    targetDataName: "건물 통합정보",
    processStatusCode: "ACTIONING",
    processStatusName: "조치중",
    writerName: "이서연",
    writerId: "gisuser02",
    createdAt: "2025-05-27 11:10",
    address: "부산광역시 해운대구 우동 1509",
    latitude: 35.1631,
    longitude: 129.1636,
    attachmentName: "건물누락_캡처.png",
    adminProcessContent:
      "건물 통합정보 데이터와 현행 건축물 데이터를 비교하여 누락 건물 반영 작업을 진행 중입니다.",
    processHistory: [
      {
        historyId: 1,
        statusName: "제보완료",
        processedAt: "2025-05-27 11:10",
        content: "사용자가 GIS 오류 제보를 등록했습니다.",
      },
      {
        historyId: 2,
        statusName: "검토중",
        processedAt: "2025-05-27 13:20",
        content: "관리자가 누락 여부를 확인했습니다.",
      },
      {
        historyId: 3,
        statusName: "조치중",
        processedAt: "2025-05-27 15:40",
        content: "데이터 반영 작업을 진행 중입니다.",
      },
    ],
  },
];