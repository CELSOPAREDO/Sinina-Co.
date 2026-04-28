import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Package, ChevronRight, X } from 'lucide-react';

const LowStockAlert = ({ products }) => {
    const [showModal, setShowModal] = useState(false);

    // Filter items based on exact stock rules
    const outOfStockItems = products.filter(p => p.stock === 0);
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 5);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/storage/${path.replace(/^\/?storage\//, '')}`;
    };

    return (
        <>
            <div 
                className={`dashboard-list-card ${products.length > 0 ? 'warning' : 'success'}`} 
                onClick={() => products.length > 0 && setShowModal(true)}
                style={{ cursor: products.length > 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}
            >
                <div className="card-header">
                    <h3>Low Stock Alert</h3>
                    <span className="badge-count" style={{ 
                        background: products.length > 0 ? '#fef2f2' : '#f0fdf4',
                        color: products.length > 0 ? '#ef4444' : '#10b981'
                    }}>
                        {products.length}
                    </span>
                </div>
                
                <div className="card-body" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    {products.length === 0 ? (
                        <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '50%' }}>
                                <CheckCircle size={40} color="#10b981" />
                            </div>
                            <p style={{ color: 'var(--muted)', fontWeight: '600' }}>All stock levels healthy</p>
                        </div>
                    ) : (
                        <div className="alert-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '50%' }}>
                                <AlertCircle size={40} color="#ef4444" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--ink)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                    {products.length} {products.length === 1 ? 'item' : 'items'} low in stock
                                </p>
                                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                                    {outOfStockItems.length} out of stock, {lowStockItems.length} low stock
                                </p>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                color: '#ef4444', 
                                fontSize: '0.85rem', 
                                fontWeight: '600',
                                marginTop: '0.5rem'
                            }}>
                                View Details <ChevronRight size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Modal List */}
            {showModal && (
                <div className="admin-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowModal(false)}>
                    <div className="admin-modal bubble-effect" style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '8px', borderRadius: '10px' }}>
                                    <AlertCircle size={20} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Inventory Alerts</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {products.map(product => (
                                    <div key={product.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        padding: '1rem', 
                                        background: 'var(--bg)', 
                                        border: '1px solid var(--border-light)', 
                                        borderRadius: '16px' 
                                    }}>
                                        <div style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            borderRadius: '10px', 
                                            overflow: 'hidden', 
                                            background: 'var(--surface)',
                                            flexShrink: 0
                                        }}>
                                            {product.image ? (
                                                <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 0.25rem', fontWeight: '600', color: 'var(--ink)' }}>{product.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {product.size && (
                                                    <span style={{ 
                                                        background: 'var(--surface)', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: '700', 
                                                        border: '1px solid var(--border)',
                                                        color: 'var(--muted)'
                                                    }}>
                                                        SIZE: {product.size}
                                                    </span>
                                                )}
                                                <span style={{ 
                                                    color: product.stock === 0 ? '#ef4444' : '#f59e0b', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '700' 
                                                }}>
                                                    {product.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-serif)', color: product.stock === 0 ? '#ef4444' : 'var(--ink)' }}>
                                                {product.stock}
                                            </p>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Stock</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface)' }}>
                            <button 
                                className="btn-primary" 
                                onClick={() => {
                                    setShowModal(false);
                                    window.location.href = '/admin/products';
                                }}
                            >
                                Manage Products
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LowStockAlert;
