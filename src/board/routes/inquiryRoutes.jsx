import InquiryDetailPage from "../user/pages/InquiryDetailPage";
import InquiryListPage from "../user/pages/InquiryListPage";
import InquiryWritePage from "../user/pages/InquiryWritePage";

export const inquiryRoutes = [
    {
        path: "inquiry",
        element: <InquiryListPage />,
    },
    {
        path: "inquiry/wrtite",
        element: <InquiryWritePage />,
    },
    {
        path: "inquiry/:postId",
        element: <InquiryDetailPage />,
    },
];