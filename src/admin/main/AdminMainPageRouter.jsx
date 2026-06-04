import { Route, Routes } from "react-router-dom";
import Adminrouters from "../routers/Adminrouters";
import AdminMainPage from "./AdminMainPage";

function AdminMainPageRouter () {
    return (
        <>
            <Routes>
                <Route path="mainPage" element={<AdminMainPage /> } />
                <Route path="users/*" element={<Adminrouters />} />
                <Route path="system/*" element={<Adminrouters />} />
                <Route path="log/*" element={<Adminrouters />} />
            </Routes>
        </>
    )
}

export default AdminMainPageRouter;