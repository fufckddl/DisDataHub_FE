import { Route, Routes } from "react-router-dom";
import UserDownloadMainPage from "./UserDownloadMainPage";
import UserDatasetDetailPage from "./UserDatasetDetailPage";
import UserDatasetSimulationPage from "./UserDatasetSimulationPage";
import UserDatasetSimulationTestPage from "./UserDatasetSimulationTestPage";

function UserDownloadRouter(){
    return(
        <>
            <Routes>
                <Route path="main" element={<UserDownloadMainPage />} />
                {/* <Route path="detail" element={<UserDatasetDetailPage />}/> */}
                <Route path=":datasetId" element={<UserDatasetDetailPage />}/>
                <Route path=":datasetId/simulation" element={<UserDatasetSimulationPage />}/>
                <Route path=":datasetId/simulationTest" element={<UserDatasetSimulationTestPage />}/>
            </Routes>
        </>
    )
}

export default UserDownloadRouter;