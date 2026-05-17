import NoticeDetailPage from "../user/pages/NoticeDetailPage";
import NoticeListPage from "../user/pages/NoticeListPage";

export const noticeRoutes = [
    {
        path: "notice",
        element: <NoticeListPage />,
    },
    {
        path: "notice/:postId",
        element: <NoticeDetailPage />,
    },
];