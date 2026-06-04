import { Route, Routes } from "react-router-dom";
import UserListPage from "../pages/users/UserListPage";
import UserDetailPage from "../pages/users/UserDetailPage";
import SystemSettingUpdatePage from "../pages/system/SystemSettingUpdatePage";
import SystemSettingListPage from "../pages/system/SystemSettingListPage";
import SystemSettingConfigLog from "../pages/log/SystemSettingConfigLog";
import UserManagementLog from "../pages/log/UserManagementLog";

function Adminrouters () {
    return (
        <>
            <Routes>
                <Route path="userList" element={<UserListPage />} />
                <Route path="detail/:userId" element={<UserDetailPage />} />
                <Route path="settingList" element={<SystemSettingListPage />} />
                <Route path="settingUpdate" element={<SystemSettingUpdatePage />} />
                <Route path="systemsetting" element={<SystemSettingConfigLog />} />
                <Route path="userManagement" element={<UserManagementLog />} />
            </Routes>
        </>
    )
}

export default Adminrouters;