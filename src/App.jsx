import { useEffect } from 'react'
import Header from './commons/components/Header'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './commons/pages/UserLoginPage'
import useAuthStore from './commons/auth/useAuthStore'
import { getUserInfoFromTokenApi } from './commons/api/userApi'
import RegisterPage from './commons/pages/UserRegisterPage'
import BoardUserRoutes from './board/routes/BoardUserRoutes'
import BoardAdminRoutes from './board/routes/BoardAdminRoutes'

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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/board/*" element={<BoardUserRoutes />} />
          <Route path="/admin/board/*" element={<BoardAdminRoutes />} />
        </Routes>
      </main>
    </div>
  )
}
export default App
