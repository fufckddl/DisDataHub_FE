export const dummyFloodRiskGeoJson = {
    type: "FeatureCollection",

    features: [
        {
            type: "Feature",

            geometry: {
                type: "Polygon",

                coordinates: [[
                    [126.9780, 37.5665],
                    [126.9825, 37.5665],
                    [126.9825, 37.5705],
                    [126.9780, 37.5705],
                    [126.9780, 37.5665]
                ]]
            },

            properties: {
                id: 1,
                regionName: "중구 침수 위험 지역 A",
                district: "중구",
                riskLevel: "높음",
                predictedWaterDepth: 1.8,
                expectedDamageScale: "대규모",
                affectedPopulation: 2450,
                rainfallThreshold: 90,
                evacuationRequired: true,
                inspectionPriority: "긴급",
                manager: "서울시 재난안전본부",
                updatedAt: "2026-05-20"
            }
        },

        {
            type: "Feature",

            geometry: {
                type: "Polygon",

                coordinates: [[
                    [127.0150, 37.5200],
                    [127.0205, 37.5200],
                    [127.0205, 37.5245],
                    [127.0150, 37.5245],
                    [127.0150, 37.5200]
                ]]
            },

            properties: {
                id: 2,
                regionName: "강남구 침수 위험 지역 B",
                district: "강남구",
                riskLevel: "중간",
                predictedWaterDepth: 0.9,
                expectedDamageScale: "중규모",
                affectedPopulation: 1120,
                rainfallThreshold: 70,
                evacuationRequired: false,
                inspectionPriority: "주의",
                manager: "강남구청",
                updatedAt: "2026-05-19"
            }
        },

        {
            type: "Feature",

            geometry: {
                type: "Polygon",

                coordinates: [[
                    [126.9050, 37.5300],
                    [126.9100, 37.5300],
                    [126.9100, 37.5345],
                    [126.9050, 37.5345],
                    [126.9050, 37.5300]
                ]]
            },

            properties: {
                id: 3,
                regionName: "영등포구 침수 위험 지역 C",
                district: "영등포구",
                riskLevel: "낮음",
                predictedWaterDepth: 0.4,
                expectedDamageScale: "소규모",
                affectedPopulation: 420,
                rainfallThreshold: 50,
                evacuationRequired: false,
                inspectionPriority: "일반",
                manager: "영등포구청",
                updatedAt: "2026-05-18"
            }
        }
    ]
};