import { Route, Routes } from "react-router-dom";
import UserDownloadMainPage from "./UserDownloadMainPage";
import UserDatasetDetailPage from "./UserDatasetDetailPage";
import UserDatasetSimulationPage from "./UserDatasetSimulationPage";
import UserDatasetSimulationTestPage from "./UserDatasetSimulationTestPage";
import UserDatasetSimulationTestPage2 from "./UserDatasetSimulationTestPage2";
import UserDatasetSimulationTestPage3 from "./UserDatasetSimulationTestPage3";

function UserDownloadRouter(){
    return(
        <>
            <Routes>
                <Route path="main" element={<UserDownloadMainPage />} />
                {/* <Route path="detail" element={<UserDatasetDetailPage />}/> */}
                <Route path=":datasetId" element={<UserDatasetDetailPage />}/>
                <Route path=":datasetId/simulation" element={<UserDatasetSimulationPage />}/>
                <Route path=":datasetId/simulationTest" element={<UserDatasetSimulationTestPage />}/>
                <Route path=":datasetId/simulationTest2" element={<UserDatasetSimulationTestPage2 />}/>
                <Route path=":datasetId/simulationTest3" element={<UserDatasetSimulationTestPage3 />}/>
            </Routes>
        </>
    )
}

export default UserDownloadRouter;