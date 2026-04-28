import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";
import Toast from "../../components/ui/Toast";
import "./AdminHistory.css";
import {
    ShoppingBag, User as UserIcon, X, Loader2,
    ChevronRight, Package, CheckCircle2,
    Clock, Truck, XCircle, RotateCcw, History
} from "lucide-react";

const STATUS_META = {
    delivered: { label: "Delivered", color: "#22c55e", bg: "#f0fdf4" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "#fef2f2" },
};

const STATUS_ICONS = {
    delivered: <CheckCircle2 size={13} />,
    cancelled: <XCircle size={13} />,
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path.replace(/^\/?storage\//, '')}`;
};

export default function AdminHistory() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("delivered");

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setLoading(true);
        API.get("/admin/orders")
            .then(res => {
                const history = (res.data || []).filter(o => ['delivered', 'cancelled'].includes(o.status));
                setOrders(history);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const formatDate = (d) =>
        new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const filtered = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const matchesTab = o.status === activeTab;
        const matchesSearch = !searchTerm
            || o.user?.name?.toLowerCase().includes(term)
            || o.user?.email?.toLowerCase().includes(term)
            || String(o.id).includes(term);
        
        return matchesTab && matchesSearch;
    });

    const getTabCount = (status) => orders.filter(o => o.status === status).length;

    return (
        <div className="ao-page">
            <header className="ao-header">
                <div className="ao-header-left">
                    <h1 className="ao-title">Order History</h1>
                    <p className="ao-subtitle">Archive of all completed and cancelled orders.</p>
                </div>
                <div className="ao-stat-pill">
                    <History size={16} />
                    <span><strong>{orders.length}</strong> archived orders</span>
                </div>
            </header>

            <div className="ao-toolbar">
                <div className="search-wrapper ao-search">
                    <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'delivered' ? 'completed' : 'cancelled'} history...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                <div className="ao-tabs">
                    <button 
                        className={`ao-tab ${activeTab === 'delivered' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('delivered')}
                    >
                        COMPLETED
                    </button>
                    <button 
                        className={`ao-tab ${activeTab === 'cancelled' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('cancelled')}
                    >
                        CANCELLED
                    </button>
                </div>
            </div>

            <div className="ao-table-wrap">
                <table className="ao-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Completed Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="ao-empty"><Loader2 className="animate-spin" /> Loading history...</td></tr>
                        ) : filtered.length > 0 ? filtered.map(o => {
                            const meta = STATUS_META[o.status] || STATUS_META.delivered;
                            const icon = STATUS_ICONS[o.status] || STATUS_ICONS.delivered;
                            return (
                                <tr key={o.id} className="ao-row" onClick={() => setSelectedOrder(o)}>
                                    <td><span className="ao-order-id">#{String(o.id).padStart(5, '0')}</span></td>
                                    <td>
                                        <div className="ao-customer">
                                            <div className="ao-avatar">{o.user?.name?.charAt(0)?.toUpperCase() || 'G'}</div>
                                            <div>
                                                <p className="ao-cname">{o.user?.name || 'Guest'}</p>
                                                <p className="ao-cemail">{o.user?.email || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="ao-amount">₱{Number(o.total_price || 0).toFixed(2)}</span></td>
                                    <td>
                                        <span className="ao-status-badge" style={{ color: meta.color, background: meta.bg }}>
                                            {icon} {meta.label}
                                        </span>
                                    </td>
                                    <td className="ao-date">{formatDate(o.updated_at)}</td>
                                    <td><ChevronRight size={16} className="ao-chevron" /></td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="ao-empty">
                                    <History size={44} strokeWidth={1.2} />
                                    <p>No archived orders found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && createPortal(
                <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="ao-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="ao-detail-header">
                            <h3 className="ao-detail-title">Order #{String(selectedOrder.id).padStart(5, '0')}</h3>
                            <button className="ap-modal-close" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
                        </div>
                        <div className="ao-detail-section">
                            <p className="ao-detail-section-label">Summary</p>
                            <div className="ao-detail-customer">
                                <div className="ao-avatar">{selectedOrder.user?.name?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                    <p className="ao-cname">{selectedOrder.user?.name}</p>
                                    <p className="ao-cemail">{selectedOrder.user?.email}</p>
                                    <p className="ao-date">Status: <strong>{selectedOrder.status.toUpperCase()}</strong></p>
                                </div>
                            </div>
                        </div>
                        <div className="ao-total-bar">
                            <span>Total Amount</span>
                            <span className="ao-total-price">₱{Number(selectedOrder.total_price).toFixed(2)}</span>
                        </div>
                        <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedOrder(null)}>Close</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
