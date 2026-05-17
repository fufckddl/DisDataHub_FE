import { Route, Routes } from "react-router-dom";
import AdminDownloadMainPage from "./AdminDownloadMainPage";

function AdminDownloadRouter(){
    return(
        <>
            <Routes>
                <Route path="main" element={<AdminDownloadMainPage />} />
            </Routes>
        </>
    )
}

export default AdminDownloadRouter;