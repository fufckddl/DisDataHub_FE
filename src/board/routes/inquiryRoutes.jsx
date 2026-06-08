import InquiryDetailPage from "../user/pages/InquiryDetailPage";
import InquiryListPage from "../user/pages/InquiryListPage";
import InquiryWritePage from "../user/pages/InquiryWritePage";
import InquiryEditPage from "../user/pages/InquiryEditPage";

export const inquiryRoutes = [
  {
    path: "inquiry",
    element: <InquiryListPage />,
  },
  {
    path: "inquiry/write",
    element: <InquiryWritePage />,
  },
  {
    path: "inquiry/edit/:postId",
    element: <InquiryEditPage />,
  },
  {
    path: "inquiry/:postId",
    element: <InquiryDetailPage />,
  },
];