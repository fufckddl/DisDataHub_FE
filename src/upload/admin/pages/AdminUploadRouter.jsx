import { Route, Routes } from "react-router-dom";
import AdminApprovalListPage from "./AdminApprovalListPage";
import AdminApprovalDetailPage from "./AdminApprovalDetailPage";

function AdminUploadRouter() {
    return (
        <>
            <Routes>
                <Route path="/approveList" element={<AdminApprovalListPage />} />
                <Route path="/approveList/:datasetId" element={<AdminApprovalDetailPage />} />
            </Routes>
        </>
    );
}

export default AdminUploadRouter;