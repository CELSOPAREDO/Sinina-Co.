import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

function Profile() {
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

    return (
        <div className="profile-page">
            
            <div className="profile-card">
                <h1>My Profile</h1>
                <div className="profile-info">
                    <p>
                        <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Role:</strong>{" "}
                        <span className="role-badge">{user.role}</span>
                    </p>
                </div>
            </div>

            
            <div className="orders-section">
                <h2>My Orders ({orders.length})</h2>

                {orders.length === 0 ? (
                    <p className="empty-text">You have no orders yet.</p>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <span>Order #{order.id}</span>
                                    <span
                                        className={`order-status status-${order.status}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="order-total">
                                    Total: ₱{Number(order.total_price).toFixed(2)}
                                </p>
                                <div className="order-items">
                                    {order.items &&
                                        order.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <span>
                                                    {item.product
                                                        ? item.product.name
                                                        : "Product"}{" "}
                                                    × {item.quantity}
                                                </span>
                                                <span>
                                                    ₱
                                                    {(
                                                        item.price * item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                                <p className="order-date">
                                    Placed:{" "}
                                    {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
