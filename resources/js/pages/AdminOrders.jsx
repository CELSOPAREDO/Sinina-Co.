import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        API.get("/admin/orders")
            .then(res => setOrders(res.data || []))
            .catch(console.error);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const openStatusModal = (order) => {
        setEditingOrder(order);
        setSelectedStatus(order.status || 'pending');
    };

    const closeModal = () => {
        setEditingOrder(null);
        setSelectedStatus(null);
    };

    const updateOrderStatus = async () => {
        if (!editingOrder || !selectedStatus) return;
        setIsSaving(true);
        try {
            await API.put(`/admin/orders/${editingOrder.id}/status`, { status: selectedStatus });
            loadData();
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Error updating order status");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
                <h2 className="section-title" style={{margin: 0}}>Manage Orders</h2>
                <div style={{fontWeight: 'bold', color: 'var(--ink)', fontSize: '1.1rem'}}>Total: {orders.length}</div>
            </div>
            
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Order ID</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Customer</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Date Ordered</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Products</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Total Price</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "1rem" }}>#{o.id}</td>
                                <td style={{ padding: "1rem" }}>{o.user?.name || 'Guest'}</td>
                                <td style={{ padding: "1rem", fontSize: "0.95rem", color: "#666" }}>{formatDate(o.created_at)}</td>
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ fontSize: "0.9rem" }}>
                                        {(o.items || []).map((item, idx) => (
                                            <div key={idx} style={{ color: "#25343F", marginBottom: idx < (o.items.length - 1) ? "0.4rem" : 0 }}>
                                                <span style={{ fontWeight: "500" }}>{item.product?.name || 'Unknown'}</span>
                                                <span style={{ color: "#999", marginLeft: "0.5rem" }}>x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: "1rem", fontWeight: "bold", color: "#FF9B51" }}>₱{o.total_price}</td>
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "space-between" }}>
                                        <span className={`status-badge ${o.status || 'pending'}`}>{o.status || 'pending'}</span>
                                        <button
                                            className="btn-edit"
                                            onClick={() => openStatusModal(o)}
                                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", minWidth: "75px", flexShrink: 0 }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingOrder && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "2rem",
                        width: "90%",
                        maxWidth: "500px",
                        boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
                        maxHeight: "80vh",
                        overflowY: "auto"
                    }}>
                        <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--ink)", fontSize: "1.3rem", fontWeight: "bold" }}>Order ##{editingOrder.id}</h3>
                        
                        <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #EAEFEF" }}>
                            <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Customer</p>
                            <p style={{ margin: "0 0 1rem 0", color: "#25343F", fontSize: "1rem", fontWeight: "bold" }}>{editingOrder.user?.name || 'Guest'}</p>
                            
                            <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem", fontWeight: "500" }}>Date Ordered</p>
                            <p style={{ margin: "0", color: "#25343F", fontSize: "0.95rem", fontWeight: "500" }}>{formatDate(editingOrder.created_at)}</p>
                        </div>

                        <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #EAEFEF" }}>
                            <p style={{ margin: "0 0 1rem 0", color: "#25343F", fontSize: "0.95rem", fontWeight: "600" }}>Products Ordered:</p>
                            <div>
                                {(editingOrder.items || []).map((item, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: idx < (editingOrder.items.length - 1) ? "1px solid #f0f0f0" : "none" }}>
                                        <div>
                                            <p style={{ margin: "0 0 0.25rem 0", color: "#25343F", fontWeight: "500" }}>{item.product?.name || 'Unknown'}</p>
                                            <p style={{ margin: "0", color: "#999", fontSize: "0.85rem" }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p style={{ margin: "0", color: "#FF9B51", fontWeight: "600" }}>₱{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #EAEFEF" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ margin: "0", color: "#25343F", fontSize: "1.05rem", fontWeight: "bold" }}>Total Amount:</p>
                                <p style={{ margin: "0", color: "#FF9B51", fontSize: "1.2rem", fontWeight: "bold" }}>₱{editingOrder.total_price}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#25343F", fontWeight: "600", fontSize: "0.95rem" }}>
                                Update Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #BFC9D1",
                                    borderRadius: "6px",
                                    background: "var(--surface)",
                                    color: "var(--ink)",
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                className="btn-primary"
                                onClick={updateOrderStatus}
                                disabled={isSaving || selectedStatus === editingOrder.status}
                                style={{ flex: 1 }}
                            >
                                {isSaving ? "Updating..." : "Update"}
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={closeModal}
                                disabled={isSaving}
                                style={{ flex: 1 }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}