import { Route, Routes } from "react-router-dom";
import AdminApprovalListPage from "./AdminApprovalListPage";
import AdminApprovalDetailPage from "./AdminApprovalDetailPage";
import ProtectedRoute from "../../../commons/components/ProtectedRoute";

function AdminUploadRouter() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Routes>
                <Route path="/approveList" element={<AdminApprovalListPage />} />
                <Route path="/approveList/:datasetId" element={<AdminApprovalDetailPage />} />
            </Routes>
        </ProtectedRoute>
    );
}

export default AdminUploadRouter;