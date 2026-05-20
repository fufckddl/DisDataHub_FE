import { useRoutes } from "react-router-dom";
import AdminNoticeManagePage from "../admin/pages/AdminNoticeManagePage";
import AdminNoticeWritePage from "../admin/pages/AdminNoticeWritePage";
import AdminInquiryManagePage from "../admin/pages/AdminInquiryManagePage";
import AdminGisReportManagePage from "../admin/pages/AdminGisReportManagePage";
import AdminInquiryDetailPage from "../admin/pages/AdminInquiryDetailPage";
import AdminGisReportDetailPage from "../admin/pages/AdminGisReportDetailPage";

function BoardAdminRoutes() {
    const routes = useRoutes([
        {
            path: "notice",
            element: <AdminNoticeManagePage/>,
        },
        {
            path: "notice/write",
            element: <AdminNoticeWritePage />,
        },
        {
            path: "inquiry",
            element: <AdminInquiryManagePage />,
        },
        {
            path: "inquiry/:postId",
            element: <AdminInquiryDetailPage />,
        },
        {
            path: "gis-report",
            element: <AdminGisReportManagePage/>,
        },
        {
            path: "gis-report/:postId",
            element: <AdminGisReportDetailPage />,
        },
    ]);

    return routes;
}
export default BoardAdminRoutes;