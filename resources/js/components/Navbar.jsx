import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <nav className="navbar">
            <div className="navbar-container">
                
                <Link to="/" className="navbar-brand">
                    <span className="brand-mark" aria-hidden="true">SC</span>
                    <span>Sinina Co.</span>
                </Link>

                
                <button
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    title="Toggle Menu"
                >
                    Menu
                </button>

                
                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                        Home
                    </Link>
                    <Link to="/products" onClick={() => setMenuOpen(false)}>
                        Products
                    </Link>

                    {isLoggedIn && user && user.role === "admin" && (
                        <Link
                            to="/admin/dashboard"
                            onClick={() => setMenuOpen(false)}
                        >
                            Admin Dashboard
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <>
                            {user && user.role === "user" && (
                                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                                    Cart
                                </Link>
                            )}

                            <div className="navbar-profile-section">
                                <ProfileDropdown />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;