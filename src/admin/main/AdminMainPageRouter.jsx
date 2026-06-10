import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../commons/components/ProtectedRoute";
import Adminrouters from "../routers/Adminrouters";
import AdminMainPage from "./AdminMainPage";

function AdminMainPageRouter () {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Routes>
                <Route path="mainPage" element={<AdminMainPage />} />
                <Route path="users/*" element={<Adminrouters />} />
                <Route path="system/*" element={<Adminrouters />} />
                <Route path="log/*" element={<Adminrouters />} />
            </Routes>
        </ProtectedRoute>
    )
}

export default AdminMainPageRouter;