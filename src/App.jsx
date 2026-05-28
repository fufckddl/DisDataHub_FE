import { useEffect } from 'react'
import Header from './commons/components/Header'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './commons/pages/UserLoginPage'
import AdminLoginPage from './commons/pages/AdminLoginPage'
import useAuthStore from './commons/auth/useAuthStore'
import { getUserInfoFromTokenApi } from './commons/api/userApi'
import RegisterPage from './commons/pages/UserRegisterPage'
import BoardUserRoutes from './board/routes/BoardUserRoutes'
import BoardAdminRoutes from './board/routes/BoardAdminRoutes'
import UserDownloadRouter from './download/user/pages/UserDownloadRouter'
import AdminDownloadRouter from './download/admin/pages/AdminDownloadRouter'
import UserUploadRouter from './upload/user/pages/UserUploadRouter'
import AdminUploadRouter from './upload/admin/pages/AdminUploadRouter'
import DashboardPage from './dashboard/pages/DashboardPage'

function App() {
  
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);

  const initUserInfo = async () => {
    if(!localStorage.getItem("token")) return;
    try {
      const response = await getUserInfoFromTokenApi();
      login({
        userId: response.data.id,
        nickname: response.data.nickname,
      });
    } catch {
      localStorage.removeItem("token");
      logout();
    }
  };


  useEffect(() => {
    initUserInfo();
  }, []);
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/board/*" element={<BoardUserRoutes />} />
          <Route path="/admin/board/*" element={<BoardAdminRoutes />} />

          {/* 다운로드 */}
          <Route path="/download/user/*" element={<UserDownloadRouter />} />
          <Route path="/download/admin/*" element={<AdminDownloadRouter />} />

          {/* 업로드 */}
          <Route path="/upload/user/*" element={<UserUploadRouter />} />
          <Route path="/upload/admin/*" element={<AdminUploadRouter />} />

          {/* 대시보드 */}
          <Route path="/dashboard/*" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}
export default App
