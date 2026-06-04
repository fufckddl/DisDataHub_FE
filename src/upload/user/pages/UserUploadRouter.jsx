import { Route, Routes } from "react-router-dom";
import UploadWritePage from "./UploadWritePage";
import MyUploadListPage from "./MyUploadListPage";

function UserUploadRouter() {
    return (
        <>
            <Routes>
                <Route path='/write' element={<UploadWritePage />} />
                <Route path='/uploadList' element={<MyUploadListPage />} />
            </Routes>
        </>
    );
}

export default UserUploadRouter;