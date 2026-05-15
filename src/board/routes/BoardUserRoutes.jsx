import { gisReportRoutes } from "./gisReportRoutes";
import { inquiryRoutes } from "./inquiryRoutes";
import { noticeRoutes } from "./noticeRoutes";

function BoardUserRoutes() {
    const routes = useRoutes([
        ...noticeRoutes,
        ...inquiryRoutes,
        ...gisReportRoutes,
    ]);

    return routes;
}

export default BoardUserRoutes;