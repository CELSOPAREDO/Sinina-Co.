import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./UserLayout.css";
import {
    Home, ShoppingBag, Package, ShoppingCart,
    User, Settings, LogOut, ChevronDown, Menu, X,
    Moon, Sun, Bell
} from "lucide-react";
import NotificationDropdown from "../components/core/NotificationDropdown";

function UserNav() {
    const navigate = useNavigate();
    const [dropOpen, setDropOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };


    const dropRef = useRef(null);
    const initials = userData?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/storage/${path.replace(/^\/?storage\//, '')}`;
    };

    const fetchCartCount = () => {
        API.get("/cart").then(res => {
            setCartCount((res.data.items || []).length);
        }).catch(() => {});
    };

    // Load cart count and user info
    useEffect(() => {
        fetchCartCount();
        
        const updateUserData = () => {
            setUserData(JSON.parse(localStorage.getItem("user") || "{}"));
        };

        window.addEventListener('cartUpdated', fetchCartCount);
        window.addEventListener('storage', updateUserData);
        window.addEventListener('userUpdated', updateUserData);

        return () => {
            window.removeEventListener('cartUpdated', fetchCartCount);
            window.removeEventListener('storage', updateUserData);
            window.removeEventListener('userUpdated', updateUserData);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };


    const NAV_LINKS = [
        { to: "/user/dashboard", label: "Home",   icon: <Home size={18} /> },
        { to: "/user/orders",    label: "My Orders",  icon: <Package size={18} /> },
        { to: "/user/shop",      label: "Products",    icon: <ShoppingBag size={18} /> },
    ];

    return (
        <nav className="ul-nav">
            <div className="ul-nav-inner">
                {/* Brand */}
                <NavLink to="/user/dashboard" className="ul-brand">
                    <span className="ul-brand-icon">SC</span>
                    <span className="ul-brand-text">Sinina Co.</span>
                </NavLink>

                {/* Desktop Links */}
                <div className="ul-links">
                    {NAV_LINKS.map(l => (
                        <NavLink key={l.to} to={l.to} className={({ isActive }) => `ul-link ${isActive ? "active" : ""}`}>
                            {l.icon} {l.label}
                        </NavLink>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="ul-actions">
                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* Cart */}
                    <NavLink to="/user/cart" className={({ isActive }) => `ul-cart-btn ${isActive ? "active" : ""}`}>
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="ul-cart-badge">{cartCount}</span>}
                    </NavLink>

                    {/* Profile Dropdown */}
                    <div className="ul-profile-wrap" ref={dropRef}>
                        <button className="ul-avatar-btn" onClick={() => setDropOpen(v => !v)}>
                            {userData?.profile_image ? (
                                <img src={getImageUrl(userData.profile_image)} alt="Avatar" className="ul-avatar-img" />
                            ) : (
                                <div className="ul-avatar">{initials}</div>
                            )}
                            <ChevronDown size={14} className={`ul-chevron ${dropOpen ? "open" : ""}`} />
                        </button>

                        {dropOpen && (
                            <div className="ul-dropdown">
                                <div className="ul-drop-header">
                                    {userData?.profile_image ? (
                                        <img src={getImageUrl(userData.profile_image)} alt="Avatar" className="ul-drop-avatar-img" />
                                    ) : (
                                        <div className="ul-drop-avatar">{initials}</div>
                                    )}
                                    <div>
                                        <p className="ul-drop-name">{userData?.name || "User"}</p>
                                        <p className="ul-drop-email">{userData?.email || ""}</p>
                                    </div>
                                </div>
                                <div className="ul-drop-divider" />
                                <button className="ul-drop-item" onClick={() => { navigate("/user/profile"); setDropOpen(false); }}>
                                    <User size={15} /> Profile
                                </button>
                                <button className="ul-drop-item" onClick={() => { navigate("/user/settings"); setDropOpen(false); }}>
                                    <Settings size={15} /> Settings
                                </button>
                                <div className="ul-drop-divider" />
                                <button className="ul-drop-item ul-drop-theme" onClick={toggleTheme}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {theme === "light" ? <Sun size={15} /> : <Moon size={15} />}
                                        <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
                                    </div>
                                    <div className={`ul-toggle ${theme === "dark" ? "on" : ""}`} />
                                </button>
                                <div className="ul-drop-divider" />
                                <button className="ul-drop-item ul-drop-logout" onClick={handleLogout}>
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button className="ul-hamburger" onClick={() => setMobileOpen(v => !v)}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="ul-mobile-menu">
                    {NAV_LINKS.map(l => (
                        <NavLink key={l.to} to={l.to} className={({ isActive }) => `ul-mobile-link ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                            {l.icon} {l.label}
                        </NavLink>
                    ))}
                    <NavLink to="/user/cart" className={({ isActive }) => `ul-mobile-link ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                        <ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}
                    </NavLink>
                    <button className="ul-mobile-link" onClick={toggleTheme}>
                        {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                        {theme === "light" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="ul-mobile-link ul-drop-logout" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default function UserLayout() {
    return (
        <div className="ul-wrapper">
            <UserNav />
            <main className="ul-main">
                <Outlet />
            </main>
        </div>
    );
}
