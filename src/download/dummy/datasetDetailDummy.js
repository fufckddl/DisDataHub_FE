export const datasetDetailDummy = {
    dataset: {
        id: "1",
        title: "서울시 CCTV 위치 데이터",
        subTitle: "서울시 관내에 설치된 CCTV의 위치 및 속성 정보를 제공합니다. 도시 안전, 방범, 교통 관리 등 다양한 정책 및 서비스에 활용할 수 있습니다.",
        provider: "서울특별시",
        region: "서울시",
        category: "시설물 / 보안",
        storageSrid: "EPSG:4326 (WGS 84)",
        createdAt: "2024-05-20",
        updatedAt: "2024-05-21",
        description: "서울시 관내 CCTV 설치 위치 및 주요 속성 정보를 제공합니다.",
        isSpatial: true
    },

    datasetSummary: [
        {
            title: "등록일",
            content: "2026-05-18", // [sd_gis_dataset]created_at
            icon: "bi-calendar-event"
        },
        {
            title: "제공기관",
            content: "서울특별시", // [sd_gis_dataset]provider
            icon: "bi-building"
        },
        {
            title: "좌표계",
            content: "EPSG:4326", // [sd_gis_dataset]storage_srid
            icon: "bi-bullseye"
        },
        {
            title: "지역정보",
            content: "서울시", //
            icon: "bi-geo-alt"
        },
        {
            title: "다운로드 수",
            content: "12,345", // [sd_dataset_stat]download_count
            icon: "bi-download"
        }
    ],


    stats: {
        viewCount: 123,
        downloadCount: "12,345"
    },


    files: [
        {
            type: "CSV",
            color: "success",
            size: "12.4 MB",
            // available: true
        },
        {
            type: "GeoJSON",
            color: "warning",
            size: "8.7 MB",
            // available: true
        },
        {
            type: "SHP",
            color: "info",
            size: "3.1 MB",
            // available: false
        },
        {
            type: "GeoTIFF",
            color: "primary",
            size: "3.1 MB",
            // available: false
        },
        {
            type: "KML",
            color: "danger",
            size: "3.1 MB",
            // available: true
        }
    ],


    attributePreview: {
        columns: [
            { key: "id", label: "ID", align: "start" },
            { key: "facilityName", label: "시설명", align: "start" },
            { key: "district", label: "자치구", align: "center" },
            { key: "latitude", label: "위도", align: "center" },
            { key: "longitude", label: "경도", align: "center" },
            { key: "installType", label: "설치유형", align: "center" },
            { key: "status", label: "상태", align: "center" }
        ],
        rows: [
            {
                id: 1,
                facilityName: "강남역 사거리 CCTV 01",
                district: "강남구",
                latitude: "37.497942",
                longitude: "127.027621",
                installType: "고정형",
                status: "운영중"
            },
            {
                id: 2,
                facilityName: "역삼동 주택가 CCTV 02",
                district: "강남구",
                latitude: "37.493821",
                longitude: "127.036254",
                installType: "주택가",
                status: "운영중"
            }
        ]
    },


    relatedDatasets: [
        {
            id: "2",
            title: "버스 정류장 위치 정보"
        },
        {
            id: "3",
            title: "공공 와이파이 위치 데이터"
        },
        {
            id: "4",
            title: "침수 위험 지역 데이터"
        }
    ]
};