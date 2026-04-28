import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import ProfileDropdown from "../features/users/components/ProfileDropdown";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="admin-wrapper">
            <nav className="admin-topbar">
                <div className="admin-brand">Sinina Co.</div>
                <div className="admin-nav">
                    <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
                    <NavLink to="/admin/users" className={({isActive}) => isActive ? "active" : ""}>Users</NavLink>
                    <NavLink to="/admin/products" className={({isActive}) => isActive ? "active" : ""}>Products</NavLink>
                    <NavLink to="/admin/orders" className={({isActive}) => isActive ? "active" : ""}>Orders</NavLink>
                    <NavLink to="/admin/history" className={({isActive}) => isActive ? "active" : ""}>History</NavLink>
                    <NavLink to="/admin/reports" className={({isActive}) => isActive ? "active" : ""}>Reports</NavLink>
                </div>
                <div className="admin-profile">
                    <ProfileDropdown />
                </div>
            </nav>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}