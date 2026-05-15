import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../auth/useAuthStore";

function Header() {
    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);
    const logout = useAuthStore((state) => state.logout);

    const handleBrandClick = () => {
        navigate(userInfo ? "/board/main" : "/login");
    };

    const handleLogoutClick = () => {
        logout();
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-hub-primary border-bottom shadow-sm">
            <div className="container-fluid">
                <button
                    type="button"
                    className="navbar-brand btn btn-link text-dark text-decoration-none p-0 me-3 fw-semibold"
                    onClick={handleBrandClick}
                >
                    GIS 데이터 허브
                </button>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#headerNavbar"
                    aria-controls="headerNavbar"
                    aria-expanded="false"
                    aria-label="메뉴"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="headerNavbar">
                    {!userInfo && (
                        <ul className="navbar-nav me-auto mb-2 mb-md-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">
                                    회원가입
                                </Link>
                            </li>
                        </ul>
                    )}
                    <div className="d-flex align-items-center gap-2 ms-md-auto">
                        {userInfo ? (
                            <>
                                <span className="small d-none d-sm-inline text-secondary">
                                    {userInfo.nickname}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleLogoutClick}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-dark btn-sm"
                                onClick={() => navigate("/login")}
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;
