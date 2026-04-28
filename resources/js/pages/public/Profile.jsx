import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([API.get("/user"), API.get("/orders")])
            .then(([userRes, ordersRes]) => {
                setUser(userRes.data);
                setOrders(ordersRes.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <p className="loading-text">Loading profile...</p>;
    if (!user) return <p className="empty-text">Could not load profile.</p>;

    // Generate avatar initials
    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    const initials = getInitials(user.name);

    return (
        <div className="profile-page">
            {/* Profile Header Card */}
            <div className="profile-header-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-display">{initials}</div>
                    <div className="profile-basic-info">
                        <h1>{user.name}</h1>
                        <p className="profile-email">{user.email}</p>
                        <div className="profile-role">
                            <span className="role-badge">{user.role}</span>
                        </div>
                    </div>
                </div>
                <button className="btn-edit-profile" onClick={() => navigate("/settings")}>
                    Edit Profile
                </button>
            </div>

            {/* Profile Details Card */}
            <div className="profile-details-card">
                <h2>Account Details</h2>
                <div className="details-grid">
                    <div className="detail-item">
                        <label>Full Name</label>
                        <p>{user.name}</p>
                    </div>
                    <div className="detail-item">
                        <label>Email Address</label>
                        <p>{user.email}</p>
                    </div>
                    <div className="detail-item">
                        <label>Phone Number</label>
                        <p>{user.phone || "Not provided"}</p>
                    </div>
                    <div className="detail-item">
                        <label>Account Role</label>
                        <p className="role-badge">{user.role}</p>
                    </div>
                    {user.created_at && (
                        <div className="detail-item">
                            <label>Member Since</label>
                            <p>{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders Section */}
            <div className="orders-section">
                <div className="section-header">
                    <h2>Order History</h2>
                    <span className="order-count">{orders.length}</span>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <p>You have no orders yet.</p>
                        <button className="btn-shop" onClick={() => navigate("/products")}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-id-section">
                                        <h3>Order #{order.id}</h3>
                                        <span className={`order-status status-${order.status}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="order-total">
                                        ₱{Number(order.total_price).toFixed(2)}
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items &&
                                        order.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <div className="item-info">
                                                    <span className="item-name">
                                                        {item.product ? item.product.name : "Product"}
                                                    </span>
                                                    <span className="item-qty">
                                                        Qty: {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="item-price">
                                                    ₱{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                </div>

                                <div className="order-footer">
                                    <p className="order-date">
                                        Placed on {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
