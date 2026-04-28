import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./UserSettings.css";
import Toast from "../../components/ui/Toast";
import { 
    Lock, MapPin, Trash2, LogOut, 
    ShieldCheck, Plus, CheckCircle2, 
    MoreVertical, AlertTriangle, Loader2, CreditCard, UploadCloud, Edit2,
    Moon, Sun, Palette
} from "lucide-react";
import { createPortal } from "react-dom";

export default function UserSettings() {
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [newAddress, setNewAddress] = useState({ 
        label: "Home", 
        recipient_name: "", 
        recipient_phone: "", 
        address: "" 
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    
    // Address Edit State
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [editAddressData, setEditAddressData] = useState(null);
    
    // Admin Specific State
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";
    const [gcashData, setGcashData] = useState({
        gcash_number: "",
        gcash_qr: null
    });
    const [gcashPreview, setGcashPreview] = useState(null);
    const [isSavingGcash, setIsSavingGcash] = useState(false);
    const [isEditingGcash, setIsEditingGcash] = useState(false);
    const [gcashOriginal, setGcashOriginal] = useState({ gcash_number: "", gcash_qr: null });

    // Theme Management
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        setToast({ show: true, message: `Switched to ${newTheme} mode`, type: "success" });
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            if (!isAdmin) {
                const res = await API.get("/addresses");
                setAddresses(res.data);
            } else {
                const res = await API.get("/settings");
                const num = res.data.gcash_number || "";
                const qrPath = res.data.gcash_qr ? `/storage/${res.data.gcash_qr.replace(/^storage\//, '')}` : null;
                setGcashData(prev => ({ ...prev, gcash_number: num }));
                setGcashOriginal({ gcash_number: num, gcash_qr: null });
                if (qrPath) setGcashPreview(qrPath);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setToast({ show: true, message: "Passwords do not match!", type: "error" });
            return;
        }
        setIsSavingPassword(true);
        try {
            await API.post("/user/change-password", passwordData);
            setToast({ show: true, message: "Password updated successfully", type: "success" });
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            setToast({ show: true, message: err.response?.data?.message || "Failed to update password", type: "error" });
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/addresses", newAddress);
            setAddresses([...addresses, res.data]);
            setNewAddress({ 
                label: "Home", 
                recipient_name: "", 
                recipient_phone: "", 
                address: "" 
            });
            setShowAddressForm(false);
            setToast({ show: true, message: "Address added!", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Failed to add address", type: "error" });
        }
    };

    const handleUpdateAddress = async (e, id) => {
        e.preventDefault();
        try {
            const res = await API.put(`/addresses/${id}`, editAddressData);
            setAddresses(addresses.map(a => a.id === id ? res.data : a));
            setEditingAddressId(null);
            setEditAddressData(null);
            setToast({ show: true, message: "Address updated!", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Failed to update address", type: "error" });
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            await API.delete(`/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
            setToast({ show: true, message: "Address removed", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Failed to remove address", type: "error" });
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await API.post(`/addresses/${id}/default`);
            setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
            setToast({ show: true, message: "Default address updated", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Failed to set default", type: "error" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await API.delete("/user/account");
            localStorage.clear();
            window.location.href = "/login";
        } catch (err) {
            setToast({ show: true, message: "Failed to delete account", type: "error" });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleGcashUpdate = async (e) => {
        e.preventDefault();
        setIsSavingGcash(true);
        const data = new FormData();
        data.append("gcash_number", gcashData.gcash_number);
        if (gcashData.gcash_qr instanceof File) {
            data.append("gcash_qr", gcashData.gcash_qr);
        }

        try {
            await API.post("/admin/settings", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setGcashOriginal({ gcash_number: gcashData.gcash_number, gcash_qr: null });
            setIsEditingGcash(false);
            setToast({ show: true, message: "GCash settings updated!", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Failed to update GCash settings", type: "error" });
        } finally {
            setIsSavingGcash(false);
        }
    };

    const handleCancelGcash = () => {
        setGcashData({ ...gcashData, gcash_number: gcashOriginal.gcash_number, gcash_qr: null });
        // revert preview to the saved one
        loadData();
        setIsEditingGcash(false);
    };

    if (loading) return <div className="us-loading"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="us-container">
            <header className="admin-section-header settings-header">
                <div className="header-left">
                    <h1 className="admin-title">{isAdmin ? "Admin Settings" : "Settings"}</h1>
                    <p className="admin-subtitle">{isAdmin ? "Manage system payments and your security." : "Manage your security, addresses, and account status."}</p>
                </div>
            </header>

            <div className="us-grid">
                {/* Appearance Section */}
                <section className="us-section">
                    <div className="us-section-header">
                        <Palette className="us-icon-appearance" />
                        <div>
                            <h3>Appearance</h3>
                            <p>Customize how Sinina Co. looks for you.</p>
                        </div>
                    </div>
                    <div className="us-theme-card">
                        <div className="us-theme-info">
                            <div className="us-theme-label">
                                {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                                <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
                            </div>
                            <p>Switch between light and dark themes for better visibility.</p>
                        </div>
                        <button 
                            className={`us-theme-toggle ${theme === "dark" ? "active" : ""}`}
                            onClick={toggleTheme}
                        >
                            <div className="us-toggle-track">
                                <div className="us-toggle-thumb">
                                    {theme === "light" ? <Sun size={12} /> : <Moon size={12} />}
                                </div>
                            </div>
                        </button>
                    </div>
                </section>
                {/* Security Section */}
                <section className="us-section">
                    <div className="us-section-header">
                        <ShieldCheck className="us-icon-sec" />
                        <div>
                            <h3>Security</h3>
                            <p>Update your password to stay secure.</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordChange} className="us-form">
                        <div className="us-input-group">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                value={passwordData.current_password}
                                onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="us-input-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.new_password}
                                onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="us-input-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.confirm_password}
                                onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                required 
                            />
                        </div>
                        <button type="submit" className="us-btn-primary" disabled={isSavingPassword}>
                            {isSavingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </section>

                {/* GCash Settings for Admin */}
                {isAdmin && (
                    <section className="us-section us-gcash-card">
                        {/* Card Header */}
                        <div className="us-gcash-card-header">
                            <div>
                                <h3 className="us-gcash-card-title">GCash Settlement</h3>
                                <span className="us-gcash-card-sub">PUBLIC PAYMENT CONFIGURATION</span>
                            </div>
                            {!isEditingGcash ? (
                                <button className="us-gcash-edit-btn" onClick={() => setIsEditingGcash(true)}>
                                    EDIT DETAILS
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" className="us-gcash-cancel-btn" onClick={handleCancelGcash}>
                                        CANCEL
                                    </button>
                                    <button type="button" className="us-gcash-save-btn" onClick={handleGcashUpdate} disabled={isSavingGcash}>
                                        {isSavingGcash ? "SAVING..." : "✦ SAVE CHANGES"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className="us-gcash-card-body">
                            {/* QR Side */}
                            <div
                                className={`us-gcash-qr-side ${isEditingGcash ? 'editing' : ''}`}
                                onClick={isEditingGcash ? () => document.getElementById('qr-input').click() : undefined}
                                style={isEditingGcash ? { cursor: 'pointer' } : {}}
                            >
                                <img src={gcashPreview || "/images/gcash_qr.png"} alt="GCash QR" />
                                {isEditingGcash && (
                                    <div className="us-gcash-qr-overlay">
                                        <UploadCloud size={28} color="white" />
                                        <span>UPLOAD QR</span>
                                    </div>
                                )}
                                <input
                                    id="qr-input"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setGcashData({ ...gcashData, gcash_qr: file });
                                            setGcashPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>

                            {/* Info Side */}
                            <div className="us-gcash-info-side">
                                <p className="us-gcash-reg-label">REGISTERED NUMBER</p>
                                {!isEditingGcash ? (
                                    <div className="us-gcash-number-row">
                                        <span className="us-gcash-number-display">
                                            {(gcashData.gcash_number || "09092039693").replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3')}
                                        </span>
                                        <span className="us-gcash-active-badge">ACTIVE</span>
                                    </div>
                                ) : (
                                    <div className="us-gcash-number-edit-row">
                                        <span className="us-gcash-phone-icon">📞</span>
                                        <input
                                            type="text"
                                            className="us-gcash-number-input"
                                            value={gcashData.gcash_number}
                                            onChange={e => setGcashData({ ...gcashData, gcash_number: e.target.value })}
                                            placeholder="09XXXXXXXXX"
                                        />
                                    </div>
                                )}

                                <div className="us-gcash-info-box">
                                    <span className="us-gcash-info-icon">🛡</span>
                                    <p>
                                        {isEditingGcash
                                            ? "Careful! Changing these details will update the QR and number for all customers immediately."
                                            : "This QR code and number are displayed to customers during the checkout process for all digital payments."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Addresses Section - Hidden for Admin */}
                {!isAdmin && (
                    <section className="us-section">
                        <div className="us-section-header">
                            <MapPin className="us-icon-addr" />
                            <div style={{ flex: 1 }}>
                                <h3>Delivery Addresses</h3>
                                <p>Manage multiple locations for your orders.</p>
                            </div>
                            {!showAddressForm && (
                                <button className="us-header-add-btn" onClick={() => setShowAddressForm(true)}>
                                    <Plus size={16} /> ADD
                                </button>
                            )}
                        </div>
                        
                        <div className="us-address-list">
                            {addresses.map(addr => (
                                editingAddressId === addr.id ? (
                                    <form key={addr.id} onSubmit={(e) => handleUpdateAddress(e, addr.id)} className="us-addr-form">
                                        <div className="us-input-grid">
                                            <div className="us-input-group">
                                                <label>Recipient Name</label>
                                                <input 
                                                    type="text" 
                                                    value={editAddressData.recipient_name}
                                                    onChange={e => setEditAddressData({...editAddressData, recipient_name: e.target.value})}
                                                    placeholder="Full Name"
                                                    required 
                                                />
                                            </div>
                                            <div className="us-input-group">
                                                <label>Phone Number</label>
                                                <input 
                                                    type="text" 
                                                    value={editAddressData.recipient_phone}
                                                    onChange={e => setEditAddressData({...editAddressData, recipient_phone: e.target.value})}
                                                    placeholder="09XXXXXXXXX"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="us-input-group">
                                            <label>Label (e.g. Home, Work)</label>
                                            <input 
                                                type="text" 
                                                value={editAddressData.label}
                                                onChange={e => setEditAddressData({...editAddressData, label: e.target.value})}
                                                required 
                                            />
                                        </div>
                                        <div className="us-input-group">
                                            <label>Full Address</label>
                                            <textarea 
                                                value={editAddressData.address}
                                                onChange={e => setEditAddressData({...editAddressData, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="us-addr-form-actions">
                                            <button type="button" onClick={() => { setEditingAddressId(null); setEditAddressData(null); }}>Cancel</button>
                                            <button type="submit" className="us-btn-primary">Update Address</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div key={addr.id} className={`us-address-card ${addr.is_default ? 'default' : ''}`}>
                                        <div className="us-addr-info">
                                            <div className="us-addr-top">
                                                <span className="us-addr-label">{addr.label}</span>
                                                {addr.is_default && <span className="us-default-tag">DEFAULT</span>}
                                            </div>
                                            <div className="us-addr-contact">
                                                <strong>{addr.recipient_name}</strong> • {addr.recipient_phone}
                                            </div>
                                            <p className="us-addr-text">{addr.address}</p>
                                        </div>
                                        <div className="us-addr-actions">
                                            {!addr.is_default && (
                                                <button onClick={() => handleSetDefault(addr.id)} title="Set as default">
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => { setEditingAddressId(addr.id); setEditAddressData(addr); }} title="Edit address">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteAddress(addr.id)} className="us-text-red" title="Delete address">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="us-addr-form">
                                <div className="us-input-grid">
                                    <div className="us-input-group">
                                        <label>Recipient Name</label>
                                        <input 
                                            type="text" 
                                            value={newAddress.recipient_name}
                                            onChange={e => setNewAddress({...newAddress, recipient_name: e.target.value})}
                                            placeholder="Full Name"
                                            required 
                                        />
                                    </div>
                                    <div className="us-input-group">
                                        <label>Contact Number</label>
                                        <input 
                                            type="text" 
                                            value={newAddress.recipient_phone}
                                            onChange={e => setNewAddress({...newAddress, recipient_phone: e.target.value})}
                                            placeholder="Phone Number"
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="us-input-group">
                                    <label>Label (e.g. Home, Work)</label>
                                    <input 
                                        type="text" 
                                        value={newAddress.label}
                                        onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="us-input-group">
                                    <label>Full Address</label>
                                    <textarea 
                                        value={newAddress.address}
                                        onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="us-addr-form-actions">
                                    <button type="button" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                    <button type="submit" className="us-btn-primary">Save Address</button>
                                </div>
                            </form>
                        )}
                    </section>
                )}

                {/* Danger Zone */}
                <section className="us-section danger">
                    <div className="us-section-header">
                        {!isAdmin && <AlertTriangle className="us-icon-danger" />}
                        <div>
                            <h3>Account Actions</h3>
                            <p>Manage your account status and session.</p>
                        </div>
                    </div>
                    <div className="us-danger-actions">
                        <button className="us-logout-btn" onClick={handleLogout}>
                            <LogOut size={18} /> Sign Out
                        </button>
                        {!isAdmin && (
                            <button className="us-delete-btn" onClick={() => setShowDeleteModal(true)}>
                                <Trash2 size={18} /> Delete Account
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && createPortal(
                <div className="uo-modal-overlay">
                    <div className="us-modal">
                        <div className="us-modal-icon"><AlertTriangle size={32} /></div>
                        <h3>Delete Account?</h3>
                        <p>This action is permanent and cannot be undone. All your data, orders, and addresses will be erased.</p>
                        <div className="us-modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Keep Account</button>
                            <button className="us-delete-confirm" onClick={handleDeleteAccount}>Yes, Delete My Account</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({...toast, show: false})} />
        </div>
    );
}
