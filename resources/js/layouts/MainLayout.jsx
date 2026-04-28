import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/core/Navbar";
import Footer from "../components/core/Footer";

export default function MainLayout() {
    return (
        <div className="main-wrapper">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}