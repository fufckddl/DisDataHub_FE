import { useCallback, useEffect, useState } from "react";
import { getDashboardGisObservations } from "../api/dashBoardApi";
import { INSIGHT_DATASETS } from "../components/dashboardInsightDefinitions";

export function useDashboardInsights(selectedArea) {
    const [insights, setInsights] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorByDataset, setErrorByDataset] = useState({});
    const [refreshSeq, setRefreshSeq] = useState(0);
    const selectedAreaCode = selectedArea?.areaCode;

    const fetchInsights = useCallback(async () => {
        return Promise.all(
            INSIGHT_DATASETS.map(async (definition) => {
                try {
                    const stats = await getDashboardGisObservations({
                        datasetCode: definition.datasetCode,
                        areaCode: selectedAreaCode,
                        limit: 12,
                    });

                    return [definition.key, stats, null];
                } catch (error) {
                    console.error(error);
                    return [definition.key, null, "저장된 최신 지표를 불러오지 못했습니다."];
                }
            })
        );
    }, [selectedAreaCode]);

    useEffect(() => {
        if (!selectedAreaCode) {
            setInsights({});
            setLoading(false);
            setErrorByDataset({});
            return undefined;
        }

        let cancelled = false;
        const timerId = window.setTimeout(async () => {
            if (cancelled) {
                return;
            }

            setLoading(true);
            setErrorByDataset({});

            const entries = await fetchInsights();

            if (cancelled) {
                return;
            }

            setInsights(Object.fromEntries(entries.map(([key, stats]) => [key, stats])));
            setErrorByDataset(Object.fromEntries(
                entries
                    .filter(([, , error]) => error)
                    .map(([key, , error]) => [key, error])
            ));
            setLoading(false);
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timerId);
        };
    }, [fetchInsights, refreshSeq]);

    return {
        insights,
        loading,
        errorByDataset,
        refresh: () => setRefreshSeq((value) => value + 1),
    };
}
