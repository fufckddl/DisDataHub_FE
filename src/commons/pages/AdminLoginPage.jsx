import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfoFromTokenApi, loginApi } from "../api/userApi";
import useAuthStore from "../auth/useAuthStore";

function AdminLoginPage() {
    const [loginError, setLoginError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const resetAuth = () => {
        localStorage.removeItem("token");
        logout();
    };

    const onSubmit = async (data) => {
        setLoginError("");

        try {
            const response = await loginApi(data);

            if (!response.data.result) {
                resetAuth();
                setLoginError("아이디 또는 비밀번호를 확인하세요.");
                return;
            }

            localStorage.setItem("token", response.data.token);
            const meResponse = await getUserInfoFromTokenApi();
            const user = meResponse.data;

            if (user.role !== "ADMIN") {
                resetAuth();
                setLoginError("관리자 권한이 있는 계정만 접속할 수 있습니다.");
                return;
            }

            login({
                userId: user.id,
                nickname: user.username,
                role: user.role,
            });
            navigate("/admin/board/notices");
        } catch {
            resetAuth();
            setLoginError("관리자 로그인 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="auth-split-root admin-auth-root">
            <div className="container-fluid g-0 p-0 h-100">
                <div className="row g-0 flex-column flex-md-row-reverse auth-split-row">
                    <div className="col-12 col-md-6 auth-form-panel admin-auth-panel">
                        <div className="auth-form-deco" aria-hidden />
                        <div className="auth-form-panel-inner">
                            <h1 className="auth-form-title">관리자 로그인</h1>
                            <p className="admin-auth-summary">
                                내부 운영 계정으로 데이터, 게시판, 업로드 관리 기능에 접속합니다.
                            </p>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="admin-accountName" className="form-label">
                                        관리자 아이디
                                    </label>
                                    <input
                                        id="admin-accountName"
                                        type="text"
                                        autoComplete="username"
                                        className={`form-control ${errors.accountName ? "is-invalid" : ""}`}
                                        placeholder="관리자 아이디"
                                        {...register("accountName", {
                                            required: "관리자 아이디를 입력하세요.",
                                        })}
                                    />
                                    {errors.accountName && (
                                        <div className="invalid-feedback d-block">
                                            {errors.accountName.message}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="admin-password" className="form-label">
                                        비밀번호
                                    </label>
                                    <input
                                        id="admin-password"
                                        type="password"
                                        autoComplete="current-password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        placeholder="비밀번호"
                                        {...register("password", {
                                            required: "비밀번호를 입력하세요.",
                                        })}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">
                                            {errors.password.message}
                                        </div>
                                    )}
                                </div>
                                {loginError && (
                                    <div className="admin-auth-alert" role="alert">
                                        {loginError}
                                    </div>
                                )}
                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn auth-btn-dark"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "확인 중" : "관리자 로그인"}
                                    </button>
                                </div>
                            </form>
                            <p className="text-center auth-link-muted mt-4 mb-0">
                                일반 사용자이신가요?{" "}
                                <Link to="/login" className="auth-link-strong">
                                    사용자 로그인
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 auth-hero admin-auth-hero">
                        <div className="admin-auth-grid" aria-hidden />
                        <div className="admin-auth-orbit" aria-hidden />
                        <div className="admin-auth-console" aria-hidden>
                            <div className="admin-auth-console-top">
                                <span />
                                <span />
                                <span />
                            </div>
                            <strong>ADMIN LAB</strong>
                            <span className="admin-auth-console-line" />
                            <span className="admin-auth-console-line" />
                            <span className="admin-auth-console-line" />
                        </div>
                        <div className="admin-auth-status" aria-hidden>
                            <span>API</span>
                            <span>DB</span>
                            <span>GIS</span>
                        </div>
                        <div className="auth-hero-copy admin-auth-copy">
                            <p className="auth-hero-line1 mb-0">GIS 데이터 허브 운영 랩</p>
                            <p className="auth-hero-line2 mb-0">관리자 콘솔 접근</p>
                            <p className="auth-link-muted small mt-3 mb-0">
                                관리자 전용 접근
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;
