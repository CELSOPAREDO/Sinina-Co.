import React, { useEffect, useState } from "react";
import API from "../../services/api";
import {
    TrendingUp,
    ShoppingBag,
    CheckCircle2,
    Clock,
    AlertTriangle,
    BarChart3,
    Filter
} from "lucide-react";
import "./AdminReports.css";

export default function AdminReports() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        Promise.all([
            API.get("/admin/orders").then(res => setOrders(res.data || [])),
            API.get("/admin/products").then(res => setProducts(res.data || [])),
            API.get("/admin/users").then(res => setUsers(res.data || []))
        ]).catch(console.error);
    };

    // Calculate Sales Summary
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

    // Best Selling Products
    const productSales = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            if (item.product?.name) {
                productSales[item.product.name] = (productSales[item.product.name] || 0) + item.quantity;
            }
        });
    });
    const bestSellingProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Low Stock Products
    const lowStockProducts = products.filter(p => p.stock <= 5);

    // Revenue by Status
    const revenueByStatus = {
        delivered: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0),
        pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0),
        shipped: orders.filter(o => o.status === 'shipped').reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0),
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };



    return (
        <div className="ur-page">
            <header className="ur-header">
                <div className="ur-header-left">
                    <h1 className="ur-title">Sales & Analytics</h1>
                    <p className="ur-subtitle">Comprehensive performance metrics for Sinina Co.</p>
                </div>

            </header>

            {/* ── Top Stats Grid ── */}
            <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-stat-card bubble-effect">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--ink)' }}>
                            <TrendingUp size={22} />
                        </div>
                    </div>
                    <p className="stat-label">Total Revenue</p>
                    <h2 className="stat-value">₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                    <p className="stat-subvalue">Gross sales value to date</p>
                </div>

                <div className="dashboard-stat-card bubble-effect">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--ink)' }}>
                            <ShoppingBag size={22} />
                        </div>
                    </div>
                    <p className="stat-label">Total Orders</p>
                    <h2 className="stat-value">{totalOrders}</h2>
                    <p className="stat-subvalue">All time processed orders</p>
                </div>

                <div className="dashboard-stat-card bubble-effect">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <p className="stat-label">Delivered</p>
                    <h2 className="stat-value">{completedOrders}</h2>
                    <p className="stat-subvalue">Successfully fulfilled orders</p>
                </div>

                <div className="dashboard-stat-card bubble-effect">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                            <Clock size={22} />
                        </div>
                    </div>
                    <p className="stat-label">Pending</p>
                    <h2 className="stat-value">{pendingOrders}</h2>
                    <p className="stat-subvalue">Orders awaiting processing</p>
                </div>
            </div>

            <div className="dashboard-main-content">
                {/* ── Revenue Distribution ── */}
                <div className="dashboard-chart-card bubble-effect">
                    <div className="chart-header">
                        <h3>Revenue Distribution</h3>
                        <BarChart3 size={18} className="text-muted" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { label: 'Delivered', val: revenueByStatus.delivered, color: '#10b981' },
                            { label: 'Processing', val: revenueByStatus.pending, color: '#f59e0b' },
                            { label: 'In Transit', val: revenueByStatus.shipped, color: '#3b82f6' }
                        ].map((item, i) => (
                            <div key={i} className="dist-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{item.label}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>₱{item.val.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        background: item.color,
                                        width: `${totalRevenue > 0 ? (item.val / totalRevenue * 100) : 0}%`,
                                        borderRadius: '10px'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Best Sellers ── */}
                <div className="dashboard-list-card bubble-effect">
                    <div className="card-header">
                        <h3>Top Performing Products</h3>
                        <button className="btn-small-outline">View All</button>
                    </div>
                    <div className="best-sellers-list">
                        {bestSellingProducts.length > 0 ? bestSellingProducts.map((p, idx) => {
                            const totalUnits = bestSellingProducts.reduce((sum, item) => sum + item[1], 0);
                            const percentage = ((p[1] / totalUnits) * 100).toFixed(0);
                            return (
                                <div key={idx} className="list-item" style={{ padding: '1.25rem 0' }}>
                                    <div className="item-rank">0{idx + 1}</div>
                                    <div className="item-info">
                                        <div className="item-name">{p[0]}</div>
                                        <div className="item-meta">{p[1]} units sold</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{percentage}%</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Share</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                                No sales data available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Critical Alerts ── */}
            {lowStockProducts.length > 0 && (
                <div className="report-section" style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '24px',
                        padding: '1.5rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '12px' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#991b1b' }}>Inventory Alert</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>{lowStockProducts.length} items are running critically low on stock.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {lowStockProducts.slice(0, 3).map(p => (
                                <span key={p.id} style={{ background: '#fff', padding: '6px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #fee2e2' }}>
                                    {p.name} ({p.stock})
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recent Transactions ── */}
            <div className="dashboard-table-container bubble-effect">
                <div className="table-header">
                    <h3>Recent Sales Activity</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="search-wrapper" style={{ maxWidth: '250px' }}>
                            <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input type="text" placeholder="Filter activity..." style={{ padding: '8px 12px 8px 34px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                        </div>
                    </div>
                </div>
                <table className="ur-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 10).map(o => (
                            <tr key={o.id} className="ur-row">
                                <td style={{ fontWeight: '800', color: 'var(--ink)' }}>#{o.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '0.7rem', fontWeight: '800', justifyContent: 'center' }}>
                                            {o.user?.name?.charAt(0) || 'G'}
                                        </div>
                                        {o.user?.name || 'Guest User'}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{formatDate(o.created_at)}</td>
                                <td style={{ fontWeight: '800' }}>₱{Number(o.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className={`badge badge-${o.status}`} style={{ borderRadius: '50px', padding: '4px 12px' }}>{o.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
