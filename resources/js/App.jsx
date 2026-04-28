import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import ProductDetails from "./pages/public/ProductDetails";
import Cart from "./pages/public/Cart";
import UserCheckout from "./pages/user/UserCheckout";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/public/Profile";
import Settings from "./pages/public/Settings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReports from "./pages/admin/AdminReports";
import AdminHistory from "./pages/admin/AdminHistory";

import UserDashboard from "./pages/user/UserDashboard";
import UserOrders from "./pages/user/UserOrders";
import UserShop from "./pages/user/UserShop";
import UserCart from "./pages/user/UserCart";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";

import "./styles/global.css";
import "../css/tailwind.css";

function App() {

    return (
        <BrowserRouter>
            <div className="app-wrapper">
                <Routes>
                    {/* Public/Main Routes within MainLayout */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Admin Routes within AdminLayout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="history" element={<AdminHistory />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="settings" element={<UserSettings />} />
                    </Route>

                    {/* User Dashboard Routes within UserLayout */}
                    <Route path="/user" element={<UserLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="orders" element={<UserOrders />} />
                        <Route path="orders/:id" element={<UserOrders />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="settings" element={<UserSettings />} />
                        <Route path="shop" element={<UserShop />} />
                        <Route path="shop/product/:id" element={<ProductDetails />} />
                        <Route path="cart" element={<UserCart />} />
                        <Route path="cart/checkout" element={<UserCheckout />} />
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
