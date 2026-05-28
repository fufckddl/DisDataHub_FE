import { useRoutes } from "react-router-dom";
import { gisReportRoutes } from "./gisReportRoutes";
import { inquiryRoutes } from "./inquiryRoutes";
import { noticeRoutes } from "./noticeRoutes";
import { systemRoutes } from "../system/routes/systemRoutes";

function BoardUserRoutes() {
    const routes = useRoutes([
        ...systemRoutes,
        ...noticeRoutes,
        ...inquiryRoutes,
        ...gisReportRoutes,
    ]);

    return routes;
}

export default BoardUserRoutes;