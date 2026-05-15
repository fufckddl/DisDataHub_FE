import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUserApi } from "../api/userApi";

function UserRegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const handleRegisterClick = async (data) => {
        await registerUserApi(data);
        alert("회원가입이 완료되었습니다.");
        navigate("/login");
    };

    return (
        <div className="auth-split-root auth-neutral-scope">
            <div className="container-fluid g-0 p-0">
                <div className="row g-0 flex-column flex-md-row-reverse auth-split-row">
                    <div className="col-12 col-md-6 auth-form-panel auth-register-scroll">
                        <div className="auth-form-deco" aria-hidden />
                        <div className="auth-form-panel-inner auth-form-panel-inner--wide w-100 px-md-2">
                            <h1 className="auth-form-title">회원가입</h1>
                            <div className="card shadow-sm border">
                                <div className="card-body p-4 p-md-5">
                        <p className="text-body-secondary small mb-4">
                            허브 이용을 위한 기본 정보를 입력해 주세요.
                        </p>
                        <form onSubmit={handleSubmit(handleRegisterClick)} noValidate>
                            <h2 className="h6 text-body-secondary border-bottom pb-2 mb-3">
                                계정
                            </h2>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label htmlFor="reg-accountName" className="form-label">
                                        아이디
                                    </label>
                                    <input
                                        id="reg-accountName"
                                        type="text"
                                        className="form-control"
                                        {...register("accountName", {
                                            required: "아이디를 입력하세요.",
                                        })}
                                    />
                                    {errors.accountName && (
                                        <div className="text-danger small mt-1">
                                            {errors.accountName.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="reg-password" className="form-label">
                                        비밀번호
                                    </label>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        className="form-control"
                                        autoComplete="new-password"
                                        {...register("password", {
                                            required: "비밀번호를 입력하세요.",
                                        })}
                                    />
                                    {errors.password && (
                                        <div className="text-danger small mt-1">
                                            {errors.password.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="h6 text-body-secondary border-bottom pb-2 mb-3">
                                프로필
                            </h2>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label htmlFor="reg-username" className="form-label">
                                        이름
                                    </label>
                                    <input
                                        id="reg-username"
                                        type="text"
                                        className="form-control"
                                        {...register("username", {
                                            required: "이름을 입력하세요.",
                                        })}
                                    />
                                    {errors.username && (
                                        <div className="text-danger small mt-1">
                                            {errors.username.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="reg-email" className="form-label">
                                        이메일
                                    </label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        className="form-control"
                                        autoComplete="email"
                                        {...register("email", {
                                            required: "이메일을 입력하세요.",
                                        })}
                                    />
                                    {errors.email && (
                                        <div className="text-danger small mt-1">
                                            {errors.email.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12">
                                    <span className="form-label d-block">성별</span>
                                    <div className="d-flex flex-wrap gap-3">
                                        <div className="form-check">
                                            <input
                                                id="reg-gender-m"
                                                className="form-check-input"
                                                type="radio"
                                                value="M"
                                                {...register("gender", {
                                                    required: "성별을 선택하세요.",
                                                })}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="reg-gender-m"
                                            >
                                                남
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                id="reg-gender-f"
                                                className="form-check-input"
                                                type="radio"
                                                value="F"
                                                {...register("gender")}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="reg-gender-f"
                                            >
                                                여
                                            </label>
                                        </div>
                                    </div>
                                    {errors.gender && (
                                        <div className="text-danger small mt-1">
                                            {errors.gender.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="h6 text-body-secondary border-bottom pb-2 mb-3">
                                소속
                            </h2>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label htmlFor="reg-organization" className="form-label">
                                        소속기관
                                    </label>
                                    <input
                                        id="reg-organization"
                                        type="text"
                                        className="form-control"
                                        {...register("organization", {
                                            required: "소속기관을 입력하세요.",
                                        })}
                                    />
                                    {errors.organization && (
                                        <div className="text-danger small mt-1">
                                            {errors.organization.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="reg-department" className="form-label">
                                        부서
                                    </label>
                                    <input
                                        id="reg-department"
                                        type="text"
                                        className="form-control"
                                        {...register("department", {
                                            required: "부서를 입력하세요.",
                                        })}
                                    />
                                    {errors.department && (
                                        <div className="text-danger small mt-1">
                                            {errors.department.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12">
                                    <span className="form-label d-block">유형</span>
                                    <div className="d-flex flex-wrap gap-3">
                                        <div className="form-check">
                                            <input
                                                id="reg-role-user"
                                                className="form-check-input"
                                                type="radio"
                                                value="USER"
                                                {...register("role", {
                                                    required: "유형을 선택하세요.",
                                                })}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="reg-role-user"
                                            >
                                                일반 사용자
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                id="reg-role-researcher"
                                                className="form-check-input"
                                                type="radio"
                                                value="RESEARCHER"
                                                {...register("role")}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="reg-role-researcher"
                                            >
                                                연구자
                                            </label>
                                        </div>
                                    </div>
                                    {errors.role && (
                                        <div className="text-danger small mt-1">
                                            {errors.role.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <Link to="/login" className="btn btn-outline-secondary order-md-1">
                                    취소
                                </Link>
                                <button type="submit" className="btn btn-primary">
                                    회원가입
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                            <p className="auth-hero-line1 mb-0">환영합니다</p>
                            <p className="auth-hero-line2 mb-0">
                                함께 만들어가요
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

export default UserRegisterPage;
