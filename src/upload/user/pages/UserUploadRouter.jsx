import { Route, Routes } from "react-router-dom";
import UploadWritePage from "./UploadWritePage";
import MyUploadListPage from "./MyUploadListPage";
import ProtectedRoute from "../../../commons/components/ProtectedRoute";

function UserUploadRouter() {
    return (
        <ProtectedRoute allowedRoles={['RESEARCHER']}>
            <Routes>
                <Route path='/write' element={<UploadWritePage />} />
                <Route path='/uploadList' element={<MyUploadListPage />} />
            </Routes>
        </ProtectedRoute>
    );
}

export default UserUploadRouter;