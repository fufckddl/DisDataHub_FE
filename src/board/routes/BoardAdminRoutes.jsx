import { useRoutes } from "react-router-dom";
import AdminNoticeManagePage from "../admin/pages/AdminNoticeManagePage";
import AdminNoticeWritePage from "../admin/pages/AdminNoticeWritePage";
import AdminInquiryManagePage from "../admin/pages/AdminInquiryManagePage";
import AdminGisReportManagePage from "../admin/pages/AdminGisReportManagePage";

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
            path: "gis-report",
            element: <AdminGisReportManagePage/>,
        },
    ]);

    return routes;
}
export default BoardAdminRoutes;