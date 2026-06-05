import GisReportDetailPage from "../user/pages/GisReportDetailPage";
import GisReportListPage from "../user/pages/GisReportListPage";
import GisReportWritePage from "../user/pages/GisReportWritePage";
import GisReportEditPage from "../user/pages/GisReportEditPage";

export const gisReportRoutes = [
  {
    path: "gis-report",
    element: <GisReportListPage />,
  },
  {
    path: "gis-report/write",
    element: <GisReportWritePage />,
  },
  {
    path: "gis-report/:postId",
    element: <GisReportDetailPage />,
  },
  {
    path: "gis-report/edit/:postId",
    element: <GisReportEditPage />,
  },
];