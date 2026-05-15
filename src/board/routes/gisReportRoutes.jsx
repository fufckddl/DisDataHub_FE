import GisReportDeatilPage from "../user/pages/GisReportDetailPage";
import GisReportListPage from "../user/pages/GisReportListPage";
import GisReportWriterPage from "../user/pages/GisReportWritePage";

export const gisReportRoutes = [
    {
        path: "gis-report",
        element: <GisReportListPage />,
    },
    {
        path: "gis-report/write",
        element: <GisReportWriterPage />,
    },
    {
        path: "gis-report/:postId",
        element: <GisReportDeatilPage />,
    },
];