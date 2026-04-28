import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./UserOrders.css"; // Reuse existing base styles
import "./UserHistory.css";
import { Package, Clock, CheckCircle, Truck, XCircle, Box, History } from "lucide-react";

export default function UserHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await API.get("/orders");
            // Filter for only completed or cancelled orders
            const history = (Array.isArray(res.data) ? res.data : [])
                .filter(o => ['delivered', 'cancelled'].includes(o.status?.toLowerCase()))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(history);
        } catch (err) {
            console.error("Error loading history:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'delivered': return { class: 'status-outline-completed', icon: <CheckCircle size={14} />, text: 'COMPLETED' };
            case 'cancelled': return { class: 'status-outline-cancelled', icon: <XCircle size={14} />, text: 'CANCELLED' };
            default: return { class: 'status-outline-pending', icon: <Clock size={14} />, text: status?.toUpperCase() };
        }
    };

    if (loading) {
        return (
            <div className="uo-loading">
                <div className="uo-spinner"></div>
                <p>Loading history...</p>
            </div>
        );
    }

    return (
        <div className="uo-container-v2">
            <header className="uo-header-v2">
                <div className="uo-header-text">
                    <h1>Order History</h1>
                    <p>Review your past and cancelled orders.</p>
                </div>
                <div className="uo-history-badge">
                    <History size={16} />
                    ARCHIVED
                </div>
            </header>

            <div className="uo-list-v2">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const status = getStatusStyle(order.status);
                        const orderDate = order.created_at ? new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase() : 'N/A';
                        const orderIdHex = String(order.id).padStart(8, '0').toUpperCase();

                        return (
                            <div key={order.id} className="uo-card-v2 uo-history-card">
                                <div className="uo-card-top">
                                    <div className="uo-card-title-group">
                                        <div className="uo-icon-circle history">
                                            <Box size={20} className="uo-box-icon" />
                                        </div>
                                        <div className="uo-title-text">
                                            <h3>Order <span>#{orderIdHex}</span></h3>
                                            <p>PLACED {orderDate}</p>
                                        </div>
                                    </div>
                                    <div className={`uo-status-pill ${status.class}`}>
                                        {status.icon}
                                        {status.text}
                                    </div>
                                </div>

                                <div className="uo-products-preview">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="uo-product-row">
                                            <div className="uo-product-info-mini">
                                                <span className="uo-product-name-mini">{item.product?.name}</span>
                                                <span className="uo-product-meta-mini">{item.quantity} x • {item.size}</span>
                                            </div>
                                            <span className="uo-product-price-mini">₱{Number(item.product?.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="uo-card-bottom history">
                                    <div className="uo-info-col-v2">
                                        <span className="uo-label-v2">TOTAL PAID</span>
                                        <span className="uo-value-v2 price">₱{Number(order.total_price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="uo-info-col-v2">
                                        <span className="uo-label-v2">OUTCOME</span>
                                        <div className={`uo-small-pill ${order.status === 'delivered' ? 'pill-success' : 'pill-danger'}`}>
                                            {order.status === 'delivered' ? 'SUCCESSFUL' : 'CANCELLED'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="uo-empty-v2">
                        <History size={48} className="uo-empty-icon" />
                        <h3>No history found</h3>
                        <p>You don't have any past or cancelled orders yet.</p>
                        <Link to="/user/shop" className="uo-btn-shop-v2">Explore Products</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
