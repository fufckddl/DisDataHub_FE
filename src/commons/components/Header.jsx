import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfoFromTokenApi } from "../api/userApi";
import useAuthStore from "../auth/useAuthStore";

const ROLE_LABELS = {
    USER: "사용자",
    RESEARCHER: "연구자",
    ADMIN: "관리자",
};

const BOARD_MENU = [
    { label: "공지사항", to: "/board/notice" },
    { label: "문의", to: "/board/inquiry" },
    { label: "오류 제보", to: "/board/gis-report" },
];

const UPLOAD_MENU = [
    { label: "신규 데이터 업로드", to: "/upload/user/write" },
    { label: "나의 데이터 업로드 내역", to: "/upload/user/uploadList" },
];

const ADMIN_BOARD_MENU = [
    { label: "공지사항", to: "/board/notice" },
    { label: "문의", to: "/board/inquiry" },
    { label: "GIS 오류 제보", to: "/board/gis-report" },
    { label: "공지사항 관리", to: "/admin/board/notice" },
    { label: "문의 관리", to: "/admin/board/inquiry" },
    { label: "GIS 오류 관리", to: "/admin/board/gis-report" },
];

const ROLE_MENUS = {
    USER: [
        { label: "시스템 소개", to: "/system/intro" },
        { label: "게시판", children: BOARD_MENU },
        { label: "데이터 다운로드", to: "/download/user/main" },
        { label: "대시보드", to: "/dashboard" },
    ],
    RESEARCHER: [
        { label: "시스템 소개", to: "/system/intro" },
        { label: "데이터 업로드", children: UPLOAD_MENU },
        { label: "게시판", children: BOARD_MENU },
        { label: "데이터 다운로드", to: "/download/user/main" },
        { label: "대시보드", to: "/dashboard" },
    ],
    ADMIN: [
        { label: "시스템 소개", to: "/system/intro" },
        { label: "데이터 업로드", children: UPLOAD_MENU },
        { label: "게시판", children: ADMIN_BOARD_MENU },
        { label: "데이터 다운로드", to: "/download/user/main" },
        { label: "시스템 설정", to: "/admin/mainPage" },
        { label: "대시보드", to: "/dashboard" },
    ],
};

function normalizeRole(value) {
    const role = String(value ?? "").trim().toUpperCase();
    return ROLE_LABELS[role] ? role : null;
}

function getUserRole(userInfo) {
    return normalizeRole(userInfo?.role)
        ?? normalizeRole(userInfo?.ROLE)
        ?? normalizeRole(userInfo?.userRole)
        ?? normalizeRole(userInfo?.authority);
}

function getNickname(userInfo) {
    return userInfo?.nickname
        ?? userInfo?.username
        ?? userInfo?.name
        ?? "사용자";
}

function HeaderDropdown({ item }) {
    const dropdownId = `header-menu-${item.label.replace(/\s+/g, "-")}`;

    return (
        <li className="nav-item dropdown">
            <button
                type="button"
                id={dropdownId}
                className="nav-link dropdown-toggle btn btn-link"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {item.label}
            </button>
            <ul className="dropdown-menu" aria-labelledby={dropdownId}>
                {item.children.map((child) => (
                    <li key={`${item.label}-${child.to}`}>
                        <Link className="dropdown-item" to={child.to}>
                            {child.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    );
}

function HeaderMenuItem({ item }) {
    if (item.children?.length) {
        return <HeaderDropdown item={item} />;
    }

    return (
        <li className="nav-item">
            <Link className="nav-link" to={item.to}>
                {item.label}
            </Link>
        </li>
    );
}

function Header() {
    const navigate = useNavigate();
    const userInfo = useAuthStore((state) => state.userInfo);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const userRole = getUserRole(userInfo);
    const roleMenus = useMemo(() => ROLE_MENUS[userRole ?? "USER"], [userRole]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || userRole) {
            return undefined;
        }

        let ignore = false;

        const syncUserRole = async () => {
            try {
                const response = await getUserInfoFromTokenApi();
                const user = response.data ?? {};
                if (ignore) {
                    return;
                }

                login({
                    ...userInfo,
                    userId: userInfo?.userId ?? user.id ?? user.userId,
                    nickname: userInfo?.nickname ?? user.nickname ?? user.username,
                    role: getUserRole(user) ?? "USER",
                });
            } catch {
                // Header 메뉴는 기존 로그인 상태를 유지하고 USER 메뉴로 표시합니다.
            }
        };

        void syncUserRole();

        return () => {
            ignore = true;
        };
    }, [login, userInfo, userRole]);

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
                    <ul className="navbar-nav me-auto mb-2 mb-md-0">
                        {userInfo ? (
                            roleMenus.map((item) => (
                                <HeaderMenuItem key={item.label} item={item} />
                            ))
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/system/intro">
                                        시스템 소개
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        회원가입
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center gap-2 ms-md-auto">
                        {userInfo ? (
                            <>
                                <span className="small d-none d-sm-inline text-secondary">
                                    {getNickname(userInfo)} · {ROLE_LABELS[userRole ?? "USER"]}
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
