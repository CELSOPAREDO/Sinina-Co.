import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";
import Toast from "../../components/ui/Toast";
import {
    ShoppingBag, User as UserIcon, X, Loader2,
    ChevronRight, Package, Calendar, Hash, CheckCircle2,
    Clock, Truck, XCircle, RotateCcw, CreditCard, ShieldCheck, Check
} from "lucide-react";

const STATUS_META = {
    pending:          { label: "Pending",          color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" },
    processing:       { label: "Processing",       color: "#3b82f6", bg: "#eff6ff", dot: "#3b82f6" },
    shipped:          { label: "Out for Delivery", color: "#8b5cf6", bg: "#f5f3ff", dot: "#8b5cf6" },
    delivered:        { label: "Delivered",        color: "#22c55e", bg: "#f0fdf4", dot: "#22c55e" },
    cancelled:        { label: "Cancelled",        color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
    payment_issue:    { label: "Payment Issue",    color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
};

const STATUS_ICONS = {
    pending:          <Clock size={13} />,
    processing:       <RotateCcw size={13} />,
    shipped:          <Truck size={13} />,
    delivered:        <CheckCircle2 size={13} />,
    cancelled:        <XCircle size={13} />,
    payment_issue:    <ShieldCheck size={13} />,
};

const STATUS_FILTERS = [
    { label: "All Orders",       value: "" },
    { label: "Pending",          value: "pending" },
    { label: "Processing",       value: "processing" },
    { label: "Out for Delivery", value: "shipped" },
];

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path.replace(/^\/?storage\//, '')}`;
};

import { useNavigate } from "react-router-dom";
export default function AdminOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "" });
    const [rejectModal, setRejectModal] = useState({ show: false, reason: "", preset: "" });
    const [verifyModal, setVerifyModal] = useState({ show: false });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        API.get("/admin/orders")
            .then(res => {
                const active = (res.data || []).filter(o => !['delivered', 'cancelled'].includes(o.status));
                setOrders(active);
            })
            .catch(console.error);
    };

    const formatDate = (d) =>
        new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const openOrder = (order) => {
        setSelectedOrder(order);
        setSelectedStatus(order.status || 'pending');
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setSelectedStatus(null);
    };

    const updateOrderStatus = async () => {
        if (!selectedOrder || !selectedStatus) return;
        setIsSaving(true);
        try {
            await API.put(`/admin/orders/${selectedOrder.id}/status`, { status: selectedStatus });
            
            setToast({ show: true, message: "Order status updated successfully" });
            
            if (['delivered', 'cancelled'].includes(selectedStatus)) {
                setTimeout(() => {
                    navigate("/admin/history");
                }, 1000);
            } else {
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: selectedStatus } : o));
                closeModal();
            }
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: err.response?.data?.message || "Error updating order status" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmVerify = async () => {
        if (!selectedOrder) return;
        setIsSaving(true);
        try {
            await API.put(`/admin/orders/${selectedOrder.id}/status`, { payment_status: 'verified' });
            setToast({ show: true, message: "Payment verified successfully" });
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, payment_status: 'verified' } : o));
            setSelectedOrder({ ...selectedOrder, payment_status: 'verified' });
            setVerifyModal({ show: false });
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: err.response?.data?.message || "Error verifying payment" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRejectPayment = async () => {
        if (!selectedOrder || !rejectModal.reason) return;
        setIsSaving(true);
        try {
            const res = await API.put(`/admin/orders/${selectedOrder.id}/status`, { 
                payment_status: 'rejected',
                rejection_reason: rejectModal.reason
            });
            
            setToast({ show: true, message: "Payment rejected successfully" });
            
            // Update local state
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...res.data.order } : o));
            
            // Automatically exit modals and go back to orders list
            setTimeout(() => {
                setRejectModal({ show: false, reason: "", preset: "" });
                closeModal();
            }, 600);
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: err.response?.data?.message || "Error rejecting payment" });
        } finally {
            setIsSaving(false);
        }
    };

    // Filter locally for speed
    const filtered = orders.filter(o => {
        const matchStatus = !filterStatus || o.status === filterStatus;
        const term = searchTerm.toLowerCase();
        const matchSearch = !searchTerm
            || o.user?.name?.toLowerCase().includes(term)
            || o.user?.email?.toLowerCase().includes(term)
            || String(o.id).includes(term);
        return matchStatus && matchSearch;
    });

    const statusCounts = STATUS_FILTERS.slice(1).reduce((acc, s) => {
        acc[s.value] = orders.filter(o => o.status === s.value).length;
        return acc;
    }, {});

    return (
        <div className="ao-page">
            {/* ── Header ── */}
            <header className="ao-header">
                <div className="ao-header-left">
                    <h1 className="ao-title">Manage Orders</h1>
                    <p className="ao-subtitle">Real-time oversight of all customer orders.</p>
                </div>
                <div className="ao-stat-pill">
                    <ShoppingBag size={16} />
                    <span><strong>{orders.length}</strong> total orders</span>
                </div>
            </header>

            {/* ── Search + Filter ── */}
            <div className="ao-toolbar">
                <div className="search-wrapper ao-search">
                    <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by customer name, email, or order ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                <div className="category-pills">
                    {STATUS_FILTERS.map(s => (
                        <button
                            key={s.value}
                            className={`pill-btn ${filterStatus === s.value ? "active" : ""}`}
                            onClick={() => setFilterStatus(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Orders Table ── */}
            <div className="ao-table-wrap">
                <table className="ao-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(o => {
                            const meta = STATUS_META[o.status] || STATUS_META.pending;
                            const icon = STATUS_ICONS[o.status] || STATUS_ICONS.pending;
                            return (
                                <tr key={o.id} className="ao-row" onClick={() => openOrder(o)}>
                                    <td>
                                        <span className="ao-order-id">#{String(o.id).padStart(5, '0')}</span>
                                    </td>
                                    <td>
                                        <div className="ao-customer">
                                            <div className="ao-avatar">
                                                {o.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                                            </div>
                                            <div>
                                                <p className="ao-cname">{o.user?.name || 'Guest'}</p>
                                                <p className="ao-cemail">{o.user?.email || '—'}</p>
                                                {o.user?.phone && <p className="ao-cphone" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{o.user.phone}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ao-item-count">
                                            {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="ao-amount">₱{Number(o.total_price || 0).toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '4px',
                                            padding: '4px 8px', 
                                            background: o.payment_method === 'gcash' ? '#eff6ff' : '#f0fdf4', 
                                            color: o.payment_method === 'gcash' ? '#1d4ed8' : '#15803d', 
                                            borderRadius: '6px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}>
                                            {o.payment_method === 'gcash' ? <CreditCard size={12} /> : <Package size={12} />}
                                            {o.payment_method === 'gcash' ? 'GCash' : 'COD'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="ao-status-badge" style={{ color: meta.color, background: meta.bg }}>
                                                {icon} {meta.label}
                                            </span>
                                            {Boolean(o.is_reuploaded) && (
                                                <span className="ao-updated-badge" title="Customer re-uploaded the payment receipt">
                                                    UPDATED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="ao-date">
                                        {formatDate(o.created_at)}
                                    </td>
                                    <td>
                                        <ChevronRight size={16} className="ao-chevron" />
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" className="ao-empty">
                                    <ShoppingBag size={44} strokeWidth={1.2} />
                                    <p>No orders found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Order Detail Modal ── */}
            {selectedOrder && createPortal(
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="ao-detail-modal" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="ao-detail-header">
                            <div className="ao-detail-title-row">
                                <div>
                                    <h3 className="ao-detail-title">Order #{String(selectedOrder.id).padStart(5, '0')}</h3>
                                    <p className="ao-detail-sub">{formatDateTime(selectedOrder.created_at)}</p>
                                </div>
                                {(() => {
                                    const m = STATUS_META[selectedOrder.status] || STATUS_META.pending;
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="ao-status-badge ao-badge-lg" style={{ color: m.color, background: m.bg }}>
                                                {STATUS_ICONS[selectedOrder.status]} {m.label}
                                            </span>
                                            {Boolean(selectedOrder.is_reuploaded) && (
                                                <span className="ao-updated-badge lg">
                                                    RE-UPLOADED
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                            <button className="ap-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        {/* Customer Info */}
                        <div className="ao-detail-section">
                            <p className="ao-detail-section-label"><UserIcon size={14} /> Customer</p>
                            <div className="ao-detail-customer">
                                <div className="ao-avatar ao-avatar-lg">
                                    {selectedOrder.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                                </div>
                                <div>
                                    <p className="ao-cname">{selectedOrder.user?.name || 'Guest User'}</p>
                                    <p className="ao-cemail">{selectedOrder.user?.email || '—'}</p>
                                    {selectedOrder.user?.phone && (
                                        <p className="ao-cphone" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            {selectedOrder.user.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="ao-detail-section">
                            <p className="ao-detail-section-label"><Package size={14} /> Order Items</p>
                            <div className="ao-items-list">
                                {(selectedOrder.items || []).map((item, idx) => (
                                    <div key={idx} className="ao-item-row">
                                        <div className="ao-item-img">
                                            {item.product?.image
                                                ? <img src={getImageUrl(item.product.image)} alt={item.product?.name} />
                                                : <Package size={18} strokeWidth={1.5} />
                                            }
                                        </div>
                                        <div className="ao-item-info">
                                            <p className="ao-item-name">{item.product?.name || 'Unknown Item'}</p>
                                            <p className="ao-item-meta">
                                                Qty: <strong>{item.quantity}</strong>
                                                {item.size ? <> &nbsp;·&nbsp; Size: <strong>{item.size}</strong></> : null}
                                            </p>
                                        </div>
                                        <p className="ao-item-price">₱{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="ao-detail-section">
                            <p className="ao-detail-section-label"><CreditCard size={14} /> Payment Details</p>
                            <div className="ao-payment-details" style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {selectedOrder.payment_method === 'gcash' ? (
                                            <div style={{ background: '#0052ff', color: '#fff', padding: '4px', borderRadius: '6px' }}><CreditCard size={16} /></div>
                                        ) : (
                                            <div style={{ background: '#10b981', color: '#fff', padding: '4px', borderRadius: '6px' }}><Package size={16} /></div>
                                        )}
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                                                {selectedOrder.payment_method === 'gcash' ? 'GCash' : 'Cash on Delivery'}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                                                Status: <span style={{ color: selectedOrder.payment_status === 'verified' ? '#10b981' : (selectedOrder.payment_status === 'rejected' ? '#ef4444' : '#f59e0b'), fontWeight: '800' }}>{selectedOrder.payment_status || 'Pending'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {selectedOrder.payment_method === 'gcash' && selectedOrder.payment_status !== 'verified' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn-small-outline" 
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', borderColor: '#10b981' }}
                                                onClick={() => setVerifyModal({ show: true })}
                                                disabled={isSaving}
                                            >
                                                <ShieldCheck size={14} />
                                                Verify
                                            </button>
                                            <button 
                                                className="btn-small-outline" 
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', borderColor: '#ef4444' }}
                                                onClick={() => setRejectModal({ show: true, reason: "", preset: "" })}
                                                disabled={isSaving}
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {selectedOrder.payment_method === 'gcash' && selectedOrder.payment_receipt && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: '700', color: 'var(--ink)' }}>Uploaded Receipt:</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'inline-block' }}>
                                                <img src={getImageUrl(selectedOrder.payment_receipt)} alt="Payment Receipt" style={{ maxHeight: '120px', maxWidth: '120px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => window.open(getImageUrl(selectedOrder.payment_receipt), '_blank')} />
                                            </div>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
                                                onClick={(e) => { e.preventDefault(); window.open(getImageUrl(selectedOrder.payment_receipt), '_blank'); }}
                                            >
                                                View Full Receipt
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="ao-total-bar">
                            <span>Total Amount</span>
                            <span className="ao-total-price">₱{Number(selectedOrder.total_price || 0).toFixed(2)}</span>
                        </div>

                        {/* Status Update */}
                        <div className="ao-detail-section">
                            <p className="ao-detail-section-label"><RotateCcw size={14} /> Update Status</p>
                            <div className="ao-status-grid">
                                {Object.entries(STATUS_META)
                                    .filter(([val]) => val !== 'payment_issue')
                                    .map(([val, meta]) => {
                                        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                        const currentIndex = statusOrder.indexOf(selectedOrder.status);
                                        const buttonIndex = statusOrder.indexOf(val);
                                        
                                        let isDisabled = true;
                                        
                                        // Cancelled is always available
                                        if (val === 'cancelled') {
                                            isDisabled = false;
                                        } else if (buttonIndex === currentIndex) {
                                            isDisabled = false;
                                        } else if (buttonIndex === currentIndex + 1) {
                                            isDisabled = false;
                                            if (selectedOrder.status === 'pending' && 
                                                selectedOrder.payment_method === 'gcash' && 
                                                selectedOrder.payment_status !== 'verified') {
                                                isDisabled = true;
                                            }
                                        }

                                        return (
                                            <button
                                                key={val}
                                                className={`ao-status-option ${selectedStatus === val ? 'selected' : ''}`}
                                                style={{ 
                                                    '--sc': meta.color, 
                                                    '--sb': meta.bg,
                                                    opacity: isDisabled ? 0.4 : 1,
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                                                }}
                                                onClick={() => !isDisabled && setSelectedStatus(val)}
                                                disabled={isDisabled}
                                                title={isDisabled && buttonIndex === currentIndex + 1 && selectedOrder.payment_method === 'gcash' && selectedOrder.payment_status !== 'verified' ? "Please verify GCash payment first" : (isDisabled && buttonIndex > currentIndex + 1 ? "Must complete previous steps first" : "")}
                                            >
                                                {STATUS_ICONS[val]}
                                                {meta.label}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={closeModal} style={{ flex: 1 }} disabled={isSaving}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={updateOrderStatus}
                                disabled={isSaving || selectedStatus === selectedOrder.status}
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Status"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: "" })} />

            {/* ── Verify Confirmation Modal ── */}
            {verifyModal.show && createPortal(
                <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setVerifyModal({ show: false })}>
                    <div className="admin-modal bubble-effect" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <div className="ap-modal-icon" style={{ background: '#ecfdf5', color: '#10b981', borderColor: '#d1fae5' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="ap-modal-title">Verify Payment</h3>
                                <p className="ap-modal-sub">Confirm that this GCash payment is valid</p>
                            </div>
                        </div>
                        
                        <div style={{ padding: '0 2rem 1.5rem 2rem' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>
                                Are you sure you want to verify this payment? This will allow the order to proceed to the processing stage.
                            </p>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => setVerifyModal({ show: false })} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button 
                                className="btn-primary" 
                                style={{ flex: 1, background: '#10b981' }}
                                onClick={handleConfirmVerify}
                                disabled={isSaving}
                            >
                                {isSaving ? "Verifying..." : "Yes, Verify"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Reject Modal ── */}
            {rejectModal.show && createPortal(
                <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setRejectModal({ ...rejectModal, show: false })}>
                    <div className="admin-modal bubble-effect" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <div className="ap-modal-icon" style={{ background: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2' }}>
                                <XCircle size={24} />
                            </div>
                            <div>
                                <h3 className="ap-modal-title">Reject Payment</h3>
                                <p className="ap-modal-sub">Inform the customer about the payment issue</p>
                            </div>
                        </div>

                        <div className="ap-form">
                            <div className="form-group">
                                <label>Quick Reason</label>
                                <select 
                                    className="admin-input"
                                    value={rejectModal.preset}
                                    onChange={e => setRejectModal({ ...rejectModal, preset: e.target.value, reason: e.target.value !== 'Others' ? e.target.value : rejectModal.reason })}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Invalid / Fake Receipt">Invalid / Fake Receipt</option>
                                    <option value="Wrong Amount">Wrong Amount</option>
                                    <option value="Blurry / Unclear Receipt">Blurry / Unclear Receipt</option>
                                    <option value="Duplicate Payment">Duplicate Payment</option>
                                    <option value="Others">Others (Type below)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Detailed Reason</label>
                                <textarea 
                                    className="admin-input"
                                    rows="3"
                                    placeholder="Explain why the payment was rejected..."
                                    value={rejectModal.reason}
                                    onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-secondary" onClick={() => setRejectModal({ ...rejectModal, show: false })} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button 
                                    className="btn-primary" 
                                    style={{ flex: 1, background: '#ef4444' }}
                                    disabled={!rejectModal.reason || isSaving}
                                    onClick={handleRejectPayment}
                                >
                                    {isSaving ? "Processing..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
