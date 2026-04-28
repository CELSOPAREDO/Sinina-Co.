import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./UserOrders.css";
import { Package, Clock, CheckCircle, Truck, XCircle, Box, AlertTriangle } from "lucide-react";
import CancelOrderModal from "../../features/orders/components/CancelOrderModal";
import PaymentRejectionModal from "../../features/orders/components/PaymentRejectionModal";
import Toast from "../../components/ui/Toast";

export default function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, order: null });
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await API.get("/orders");
            // Sort by newest first
            const sorted = (Array.isArray(res.data) ? res.data : []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(sorted);
        } catch (err) {
            console.error("Error loading orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = (e, orderId) => {
        e.preventDefault();
        e.stopPropagation();
        setCancelModal({ isOpen: true, orderId });
    };

    const handleSeeReason = (e, order) => {
        e.preventDefault();
        e.stopPropagation();
        setRejectionModal({ isOpen: true, order });
    };

    const handleOrderUpdate = (orderId, updatedOrder) => {
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        setToast({
            show: true,
            message: "Receipt updated successfully. Waiting for verification.",
            type: "success"
        });
    };

    const performCancelOrder = async (orderId, reasonData) => {
        try {
            await API.post(`/orders/${orderId}/cancel`, reasonData);
            
            // Refresh local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
            
            // Close modal and show toast
            setCancelModal({ isOpen: false, orderId: null });
            setToast({
                show: true,
                message: "Order successfully cancelled",
                type: "success"
            });
        } catch (err) {
            console.error("Error cancelling order:", err);
            setToast({
                show: true,
                message: "Failed to cancel order. Please try again.",
                type: "error"
            });
        }
    };

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return { class: 'status-outline-pending', icon: <Clock size={14} />, text: 'PENDING' };
            case 'processing': return { class: 'status-outline-processing', icon: <Package size={14} />, text: 'PROCESSING' };
            case 'shipped': return { class: 'status-outline-shipped', icon: <Truck size={14} />, text: 'READY' };
            case 'delivered': return { class: 'status-outline-completed', icon: <CheckCircle size={14} />, text: 'COMPLETED' };
            case 'cancelled': return { class: 'status-outline-cancelled', icon: <XCircle size={14} />, text: 'CANCELLED' };
            case 'payment_issue': return { class: 'status-outline-rejected', icon: <AlertTriangle size={14} />, text: 'PAYMENT REJECTED' };
            default: return { class: 'status-outline-pending', icon: <Clock size={14} />, text: 'PENDING' };
        }
    };

    const TABS = [
        { id: 'all', label: 'All Orders' },
        { id: 'pending', label: 'Pending' },
        { id: 'payment_issue', label: 'Rejected' },
        { id: 'processing', label: 'Processing' },
        { id: 'shipped', label: 'Ready' },
        { id: 'delivered', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    const filteredOrders = orders.filter(o => activeTab === 'all' || o.status === activeTab);

    if (loading) {
        return (
            <div className="uo-loading">
                <div className="uo-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="uo-container-v2">
            <header className="uo-header-v2">
                <div className="uo-header-text">
                    <h1>My Orders</h1>
                    <p>Track your purchases in real-time.</p>
                </div>
            </header>

            <div className="uo-tabs-v2">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        className={`uo-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {activeTab === tab.id && <span className="uo-tab-count">{filteredOrders.length}</span>}
                    </button>
                ))}
            </div>

            <div className="uo-list-v2">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                        const status = getStatusStyle(order.status);
                        const orderDate = order.created_at ? new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase() : 'N/A';
                        const orderIdHex = String(order.id).padStart(8, '0').toUpperCase(); // Make it look like a hex ID

                        return (
                            <Link to={`/user/orders/${order.id}`} key={order.id} className="uo-card-v2">
                                <div className="uo-card-top">
                                    <div className="uo-card-title-group">
                                        <div className="uo-icon-circle" style={order.status === 'payment_issue' ? { background: '#fef2f2', color: '#ef4444' } : {}}>
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
                                
                                <div className="uo-card-bottom">
                                    <div className="uo-info-col-v2">
                                        <span className="uo-label-v2">AMOUNT</span>
                                        <span className="uo-value-v2 price">₱{Number(order.total_price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="uo-info-col-v2">
                                        <span className="uo-label-v2">ITEMS</span>
                                        <span className="uo-value-v2">{order.items?.length || 0} items included</span>
                                    </div>
                                    <div className="uo-info-col-v2" style={{ flex: 1 }}>
                                        <span className="uo-label-v2">DELIVERY STATUS</span>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                            <div className={`uo-small-pill ${order.status === 'delivered' ? 'pill-success' : 'pill-neutral'}`}>
                                                {order.status === 'delivered' ? '✓ DELIVERED' : (order.status === 'cancelled' ? 'CANCELLED' : (order.status === 'payment_issue' ? 'ISSUE DETECTED' : 'IN PROGRESS'))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {order.status === 'payment_issue' && (
                                                    <button 
                                                        onClick={(e) => handleSeeReason(e, order)}
                                                        className="see-reason-btn"
                                                    >
                                                        See Reason
                                                    </button>
                                                )}
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={(e) => handleCancelOrder(e, order.id)}
                                                        className="uo-cancel-btn"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="uo-empty-v2">
                        <Box size={48} className="uo-empty-icon" />
                        <h3>No orders found</h3>
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/user/shop" className="uo-btn-shop-v2">Start Shopping</Link>
                    </div>
                )}
            </div>

            <CancelOrderModal 
                isOpen={cancelModal.isOpen}
                orderId={cancelModal.orderId}
                onClose={() => setCancelModal({ isOpen: false, orderId: null })}
                onConfirm={performCancelOrder}
            />

            <PaymentRejectionModal 
                isOpen={rejectionModal.isOpen}
                order={rejectionModal.order}
                onClose={() => setRejectionModal({ isOpen: false, order: null })}
                onUpdate={handleOrderUpdate}
            />

            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
