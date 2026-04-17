import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeManager } from "../utils/themeManager";
import { Icons } from "./Icon";
import "./ProfileDropdown.css";

function ProfileDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(ThemeManager.isDarkMode());
    const dropdownRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("auth_token");
            setIsOpen(false);
            // Force a page reload to clear all state
            setTimeout(() => {
                window.location.href = "/login";
            }, 100);
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/login";
        }
    };

    const handleThemeToggle = () => {
        const newTheme = ThemeManager.toggleTheme();
        setIsDarkMode(newTheme === ThemeManager.DARK_MODE);
    };

    const handleProfileClick = () => {
        navigate("/profile");
        setIsOpen(false);
    };

    // Generate avatar from username
    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    const initials = getInitials(user?.name);

    return (
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
            <button
                className="profile-avatar-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="User Menu"
            >
                <div className="profile-avatar">{initials}</div>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    {/* Profile Section */}
                    <div className="dropdown-profile-section">
                        <div className="profile-avatar-large">{initials}</div>
                        <div className="profile-info">
                            <div className="profile-name">{user?.name || "User"}</div>
                            <div className="profile-email">{user?.email || ""}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <div className="dropdown-menu-items">
                        <button className="dropdown-item" onClick={handleProfileClick}>
                            <span>Profile</span>
                        </button>
                        <button className="dropdown-item" onClick={() => navigate("/settings")}>
                            <span>Settings</span>
                        </button>

                        {/* Theme Toggle */}
                        <div className="dropdown-item theme-toggle-item">
                            <span>Dark Mode</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={handleThemeToggle}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="dropdown-divider"></div>

                        <button className="dropdown-item logout-btn" onClick={handleLogout}>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileDropdown;
