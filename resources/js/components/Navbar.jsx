import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = !!localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                
                <Link to="/" className="navbar-brand">
                    <img
                        className="brand-logo"
                        src="/images/sinina-logo.svg"
                        alt="Sinina logo"
                    />
                    <span>Sinina Co.</span>
                </Link>

                
                <button
                    className="navbar-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>

                
                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                        Home
                    </Link>
                    <Link to="/products" onClick={() => setMenuOpen(false)}>
                        Products
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link to="/cart" onClick={() => setMenuOpen(false)}>
                                Cart
                            </Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                Profile
                            </Link>

                            
                            {user && user.role === "seller" && (
                                <Link
                                    to="/seller/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Seller Dashboard
                                </Link>
                            )}

                            
                            {user && user.role === "admin" && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Admin Dashboard
                                </Link>
                            )}

                            <button className="navbar-logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
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
