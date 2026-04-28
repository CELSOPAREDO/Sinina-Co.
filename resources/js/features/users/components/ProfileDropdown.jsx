import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../components/ui/Icon";
import { Moon, Sun } from "lucide-react";
import "./ProfileDropdown.css";

function ProfileDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    useEffect(() => {
        const handleUserUpdated = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        };
        window.addEventListener("userUpdated", handleUserUpdated);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("userUpdated", handleUserUpdated);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `/storage/${path.replace(/^\/?storage\//, '')}`;
    };

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
                <div className="profile-avatar">
                    {user?.profile_image ? (
                        <img src={getImageUrl(user.profile_image)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        initials
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    {/* Profile Section */}
                    <div className="dropdown-profile-section">
                        <div className="profile-avatar-large">
                            {user?.profile_image ? (
                                <img src={getImageUrl(user.profile_image)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">{user?.name || "User"}</div>
                            <div className="profile-email">{user?.email || ""}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <div className="dropdown-menu-items">
                        <button className="dropdown-item" onClick={() => { navigate(user?.role === 'admin' ? "/admin/profile" : "/user/profile"); setIsOpen(false); }}>
                            <span>Profile</span>
                        </button>
                        <button className="dropdown-item" onClick={() => { navigate(user?.role === 'admin' ? "/admin/settings" : "/user/settings"); setIsOpen(false); }}>
                            <span>Settings</span>
                        </button>

                        <button className="dropdown-item theme-toggle-item" onClick={toggleTheme}>
                            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                        </button>


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
