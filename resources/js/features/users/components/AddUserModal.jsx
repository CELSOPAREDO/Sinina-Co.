import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API from "../../../services/api";
import { UserPlus, X, Loader2 } from "lucide-react";

const AddUserModal = ({ show, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user"
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Disable scroll when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [show, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Simple validation
        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required.");
            return;
        }

        setIsSaving(true);
        try {
            await API.post("/admin/users", formData);
            setFormData({ name: "", email: "", phone: "", password: "", role: "user" }); // Reset
            onUserAdded("User created successfully!");
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create user. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!show) return null;

    return createPortal(
        <div className="admin-modal-overlay" onClick={onClose}>
            <div 
                className="admin-modal bubble-effect" 
                style={{ maxWidth: '550px', width: '90%', position: 'relative' }} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="modal-close-btn"
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div style={{ 
                        width: '64px', height: '64px', background: 'var(--bg)', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
                        marginBottom: '1.5rem'
                    }}>
                        <UserPlus size={32} />
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Add New User</h3>
                    <p style={{ color: 'var(--muted)' }}>Register a new administrative or customer account for Sinina Co.</p>
                </div>
                
                {error && (
                    <div className="error-box" style={{ 
                        marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', 
                        border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', fontSize: '0.9rem' 
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '2.5rem' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" className="admin-input" required 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Celso Paredo"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" className="admin-input" required 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="user@sininaco.com"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" className="admin-input" required 
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="0917XXXXXXX"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" className="admin-input" required 
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder="Minimum 8 characters"
                            disabled={isSaving}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>System Role</label>
                        <select 
                            value={formData.role} 
                            onChange={e => setFormData({ ...formData, role: e.target.value })} 
                            required className="admin-input"
                            disabled={isSaving}
                        >
                            <option value="admin">Admin (Full Access)</option>
                            <option value="user">Customer (Storefront Only)</option>
                        </select>
                    </div>
                    
                    <div className="modal-actions" style={{ marginTop: '4rem' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSaving} 
                            className="btn-secondary"
                            style={{ flex: 1 }}
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {isSaving ? <><Loader2 size={18} className="animate-spin" /> SAVING...</> : "SAVE USER"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddUserModal;
