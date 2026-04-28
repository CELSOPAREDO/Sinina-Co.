import React, { useEffect, useState } from "react";
import API from "../../services/api";
import {
    DollarSign,
    ShoppingBag,
    Clock,
    AlertTriangle,
    Plus,
    Package,
    ArrowUpRight
} from 'lucide-react';
import StatCard from "../../features/dashboard/components/StatCard";
import SalesChart from "../../features/dashboard/components/SalesChart";
import CategoryChart from "../../features/products/components/CategoryChart";
import RecentOrdersTable from "../../features/orders/components/RecentOrdersTable";
import TopSellingProducts from "../../features/products/components/TopSellingProducts";
import LowStockAlert from "../../features/products/components/LowStockAlert";
import SystemModal from "../../components/ui/SystemModal";
import Toast from "../../components/ui/Toast";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState({ daily_sales: [], category_sales: [] });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState({ show: false, message: "" });
    const [alertModal, setAlertModal] = useState({ show: false, message: "", title: "" });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [s, a, o, t, l] = await Promise.all([
                API.get("/admin/dashboard/stats"),
                API.get("/admin/dashboard/analytics"),
                API.get("/admin/dashboard/recent-orders"),
                API.get("/admin/dashboard/top-selling"),
                API.get("/admin/dashboard/low-stock")
            ]);
            setStats(s.data.stats);
            setAnalytics(a.data);
            setRecentOrders(o.data);
            setTopSelling(t.data);
            setLowStock(l.data);
        } catch (err) {
            console.error(err);
            setAlertModal({ show: true, title: "Data Error", message: "Failed to load dashboard metrics." });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async (orderId) => {
        try {
            await API.put(`/admin/orders/${orderId}/status`, { status: 'delivered' });
            setToast({ show: true, message: "Order marked as delivered" });
            loadDashboardData();
        } catch (err) {
            setAlertModal({ show: true, title: "Error", message: "Failed to update order." });
        }
    };

    if (loading && !stats) {
        return (
            <div className="admin-dashboard-page loading">
                <p>Preparing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page" style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
            <header className="admin-section-header dashboard-header">
                <div className="header-left">
                    <h1 className="admin-title">Dashboard Overview</h1>
                    <p className="admin-subtitle">Real-time performance metrics for Sinina Co.</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => window.location.href = '/admin/products'}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Package size={18} /> Manage Inventory
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin/products?add=true'}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                <StatCard
                    title="Total Sales (Today)"
                    value={`₱${Number(stats?.total_sales.today || 0).toLocaleString()}`}
                    subValue={`Goal: ₱10,000`}
                    change={stats?.total_sales.change}
                    icon={DollarSign}
                    color="#000"
                />
                <StatCard
                    title="Monthly Sales"
                    value={`₱${Number(stats?.total_sales.monthly || 0).toLocaleString()}`}
                    change={12}
                    icon={ArrowUpRight}
                    color="#000"
                />
                <StatCard
                    title="Orders Today"
                    value={stats?.orders_today.value || 0}
                    change={stats?.orders_today.change}
                    icon={ShoppingBag}
                    color="#000"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.pending_orders.value || 0}
                    icon={Clock}
                    color="#000"
                />
            </div>

            <div className="dashboard-main-content">
                <div className="content-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="dashboard-chart-card">
                        <SalesChart data={analytics.daily_sales} />
                    </div>
                    <div className="dashboard-table-container">
                        <RecentOrdersTable
                            orders={recentOrders}
                            onMarkCompleted={handleMarkCompleted}
                        />
                    </div>
                </div>

                <div className="content-right" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="dashboard-chart-card">
                        <CategoryChart data={analytics.category_sales} />
                    </div>
                    <TopSellingProducts products={topSelling} />
                    <LowStockAlert products={lowStock} />
                </div>
            </div>

            <SystemModal
                show={alertModal.show}
                title={alertModal.title}
                message={alertModal.message}
                type="alert"
                onConfirm={() => setAlertModal({ show: false, message: "", title: "" })}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                onClose={() => setToast({ show: false, message: "" })}
            />
        </div>
    );
}
