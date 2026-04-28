import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./NotificationDropdown.css";

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropRef.current && !dropRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.post("/notifications/read-all");
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id).is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotifClick = async (n) => {
        if (!n.is_read) markAsRead(n.id);
        
        if (n.data && n.data.order_id) {
            navigate("/user/orders");
            setIsOpen(false);
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="notif-wrapper" ref={dropRef}>
            <button 
                className={`notif-btn ${isOpen ? "active" : ""}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead}>Mark all as read</button>
                        )}
                    </div>

                    <div className="notif-list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`notif-item ${!n.is_read ? "unread" : ""} ${n.type}`}
                                    onClick={() => handleNotifClick(n)}
                                >
                                    <div className="notif-content">
                                        <div className="notif-title-row">
                                            <span className="notif-title">{n.title}</span>
                                            <button 
                                                className="notif-delete" 
                                                onClick={(e) => deleteNotification(e, n.id)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <p className="notif-message">{n.message}</p>
                                        <div className="notif-meta">
                                            <Clock size={10} />
                                            <span>{formatTime(n.created_at)}</span>
                                        </div>
                                    </div>
                                    {!n.is_read && <div className="unread-dot" />}
                                </div>
                            ))
                        ) : (
                            <div className="notif-empty">
                                <Bell size={32} opacity={0.2} />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
