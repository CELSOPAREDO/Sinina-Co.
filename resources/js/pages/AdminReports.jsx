import React, { useEffect, useState } from "react";
import API from "../services/api";

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
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div>
            <h2 className="section-title" style={{margin: 0, marginBottom: '1.5rem'}}>Sales & Analytics Reports</h2>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Total Revenue</p>
                    <p style={{ margin: "0", color: "#FF9B51", fontSize: "2rem", fontWeight: "bold" }}>₱{totalRevenue.toFixed(2)}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Total Orders</p>
                    <p style={{ margin: "0", color: "#25343F", fontSize: "2rem", fontWeight: "bold" }}>{totalOrders}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Completed Orders</p>
                    <p style={{ margin: "0", color: "#25343F", fontSize: "2rem", fontWeight: "bold" }}>{completedOrders}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Pending Orders</p>
                    <p style={{ margin: "0", color: "#25343F", fontSize: "2rem", fontWeight: "bold" }}>{pendingOrders}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Total Products</p>
                    <p style={{ margin: "0", color: "#25343F", fontSize: "2rem", fontWeight: "bold" }}>{products.length}</p>
                </div>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Total Users</p>
                    <p style={{ margin: "0", color: "#25343F", fontSize: "2rem", fontWeight: "bold" }}>{users.length}</p>
                </div>
            </div>

            {/* Revenue by Status */}
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "2rem" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", color: "#25343F", fontSize: "1.1rem", fontWeight: "bold" }}>Revenue by Order Status</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                    <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "1rem" }}>
                        <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>Delivered</p>
                        <p style={{ margin: "0", color: "#25343F", fontSize: "1.5rem", fontWeight: "bold" }}>₱{revenueByStatus.delivered.toFixed(2)}</p>
                    </div>
                    <div style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "1rem" }}>
                        <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>Pending/Processing</p>
                        <p style={{ margin: "0", color: "#25343F", fontSize: "1.5rem", fontWeight: "bold" }}>₱{revenueByStatus.pending.toFixed(2)}</p>
                    </div>
                    <div style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "1rem" }}>
                        <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>Shipped</p>
                        <p style={{ margin: "0", color: "#25343F", fontSize: "1.5rem", fontWeight: "bold" }}>₱{revenueByStatus.shipped.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Best Selling Products */}
            {bestSellingProducts.length > 0 && (
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "2rem" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#25343F", fontSize: "1.1rem", fontWeight: "bold" }}>Top 5 Best-Selling Products</h3>
                    <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Product Name</th>
                                <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Units Sold</th>
                                <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bestSellingProducts.map((product, idx) => {
                                const totalUnits = bestSellingProducts.reduce((sum, p) => sum + p[1], 0);
                                const percentage = ((product[1] / totalUnits) * 100).toFixed(1);
                                return (
                                    <tr key={idx} style={{ borderBottom: "1px solid #EAEFEF" }}>
                                        <td style={{ padding: "1rem" }}>{product[0]}</td>
                                        <td style={{ padding: "1rem", fontWeight: "bold", color: "#FF9B51" }}>{product[1]}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div style={{ background: "#e0e0e0", borderRadius: "4px", width: "100px", height: "6px" }}>
                                                    <div style={{ background: "#FF9B51", height: "100%", borderRadius: "4px", width: `${percentage}%` }} />
                                                </div>
                                                <span>{percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "2rem", borderLeft: "4px solid #ef4444" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#ef4444", fontSize: "1.1rem", fontWeight: "bold" }}>Low Stock Alert ({lowStockProducts.length})</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                        {lowStockProducts.map(p => (
                            <div key={p.id} style={{ background: "#fef2f2", padding: "1rem", borderRadius: "8px", border: "1px solid #fecaca" }}>
                                <p style={{ margin: "0 0 0.5rem 0", color: "#991b1b", fontWeight: "600", fontSize: "0.95rem" }}>{p.name}</p>
                                <p style={{ margin: "0", color: "#ef4444", fontSize: "0.9rem" }}>Stock: <strong>{p.stock}</strong> units</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders Summary */}
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #EAEFEF", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", color: "#25343F", fontSize: "1.1rem", fontWeight: "bold" }}>Recent Orders</h3>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Order ID</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Customer</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Date</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Amount</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 10).map(o => (
                            <tr key={o.id} style={{ borderBottom: "1px solid #EAEFEF" }}>
                                <td style={{ padding: "1rem" }}>#{o.id}</td>
                                <td style={{ padding: "1rem" }}>{o.user?.name || 'Guest'}</td>
                                <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#666" }}>{formatDate(o.created_at)}</td>
                                <td style={{ padding: "1rem", fontWeight: "bold", color: "#FF9B51" }}>₱{o.total_price}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span className={`status-badge ${o.status}`}>{o.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}