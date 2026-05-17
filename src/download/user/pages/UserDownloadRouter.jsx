import { Route, Routes } from "react-router-dom";
import UserDownloadMainPage from "./UserDownloadMainPage";
import UserDatasetDetailPage from "./UserDatasetDetailPage";

function UserDownloadRouter(){
    return(
        <>
            <Routes>
                <Route path="main" element={<UserDownloadMainPage />} />
                {/* <Route path="detail" element={<UserDatasetDetailPage />}/> */}
                <Route path=":datasetId" element={<UserDatasetDetailPage />}/>
            </Routes>
        </>
    )
}

export default UserDownloadRouter;