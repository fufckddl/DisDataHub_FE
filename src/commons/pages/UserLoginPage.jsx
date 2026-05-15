import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../api/userApi";
import useAuthStore from "../auth/useAuthStore";

function UserLoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const onSubmit = async (data) => {
        const response = await loginApi(data);

        if (response.data.result) {
            localStorage.setItem("token", response.data.token);
            login({
                userId: response.data.userId,
                nickname: response.data.nickname,
            });
            navigate("/board/main");
        } else {
            alert("아이디 혹은 비번 확인");
        }
    };

    return (
        <div className="auth-split-root">
            <div className="container-fluid g-0 p-0 h-100">
                <div className="row g-0 flex-column flex-md-row-reverse auth-split-row">
                    <div className="col-12 col-md-6 auth-form-panel">
                        <div className="auth-form-deco" aria-hidden />
                        <div className="auth-form-panel-inner">
                            <h1 className="auth-form-title">로그인</h1>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                            >
                                <div className="mb-3">
                                    <label
                                        htmlFor="login-accountName"
                                        className="form-label"
                                    >
                                        아이디
                                    </label>
                                    <input
                                        id="login-accountName"
                                        type="text"
                                        autoComplete="username"
                                        className={`form-control ${errors.accountName ? "is-invalid" : ""}`}
                                        placeholder="아이디를 입력하세요"
                                        {...register("accountName", {
                                            required: "아이디를 입력하세요.",
                                        })}
                                    />
                                    {errors.accountName && (
                                        <div className="invalid-feedback d-block">
                                            {errors.accountName.message}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <label
                                        htmlFor="login-password"
                                        className="form-label"
                                    >
                                        비밀번호
                                    </label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        autoComplete="current-password"
                                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                        placeholder="비밀번호를 입력하세요"
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
                                <div className="text-end mb-4">
                                    <span className="auth-link-muted small">
                                        비밀번호를 잊으셨나요?
                                    </span>
                                </div>
                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn auth-btn-dark"
                                    >
                                        로그인
                                    </button>
                                </div>
                            </form>
                            <p className="text-center auth-link-muted mt-4 mb-0">
                                계정이 없으신가요?{" "}
                                <Link
                                    to="/register"
                                    className="auth-link-strong"
                                >
                                    회원가입
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 auth-hero">
                        <div className="auth-hero-shapes" aria-hidden>
                            <span className="auth-hero-bar" />
                            <span className="auth-hero-bar" />
                            <span className="auth-hero-bar" />
                            <span className="auth-hero-bar" />
                            <span className="auth-hero-bar" />
                        </div>
                        <div className="auth-hero-copy">
                            <p className="auth-hero-line1 mb-0">안녕하세요!</p>
                            <p className="auth-hero-line2 mb-0">
                                좋은 하루 되세요
                            </p>
                            <p className="auth-link-muted small mt-3 mb-0">
                                GIS 데이터 허브
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLoginPage;
