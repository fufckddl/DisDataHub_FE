import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosinstance'; // 🚀 본인 프로젝트 경로에 맞게 확인해주세요!

function ProtectedRoute({ allowedRoles, children }) {
    const navigate = useNavigate();
    
    // 이 수문장 컴포넌트만의 독립적인 상태 (App.jsx 안 건드림!)
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAccess = async () => {
            const token = localStorage.getItem("token");

            // 1. 토큰 자체가 없으면 아예 입구 컷!
            if (!token) {
                alert("로그인이 필요한 서비스입니다.");
                navigate('/login', { replace: true });
                return;
            }

            // 2. 토큰이 있으면? 백엔드에 "이 사람 권한 뭐야?" 라고 직접 물어봄!
            try {
                // UserController.java 에 있는 /api/users/me API를 호출
                const response = await axiosInstance.get('/api/users/me');
                const userRole = response.data.role; // 백엔드 User 객체의 role 값

                // 3. 백엔드가 알려준 권한이 허용된 권한(ADMIN 등)에 속하는지 검사
                if (allowedRoles && !allowedRoles.includes(userRole)) {
                    alert("해당 페이지에 접근할 권한이 없습니다. (접근 거부)");
                    navigate('/login', { replace: true }); // 로그인 페이지로 이동
                } else {
                    // 권한 일치! 무사 통과
                    setIsAuthorized(true);
                }
            } catch (error) {
                // 토큰이 썩었거나 서버 에러 났을 때
                alert("인증 정보가 유효하지 않습니다. 다시 로그인해주세요.");
                localStorage.removeItem("token");
                navigate('/login', { replace: true });
            } finally {
                // 검사 끝! 로딩 스피너 끄기
                setIsLoading(false);
            }
        };

        verifyAccess();
    }, [navigate, allowedRoles]);

    // 🚀 App.jsx랑 상관없이 스스로 검사하는 동안 로딩 스피너 띄움 (새로고침 튕김 완벽 방지)
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    // 통과 못했으면 빈 화면 (useEffect가 튕겨냄)
    if (!isAuthorized) {
        return null;
    }

    // 완벽하게 통과한 사람만 자식 컴포넌트(관리자 페이지)를 보여줌!
    return children;
}

export default ProtectedRoute;