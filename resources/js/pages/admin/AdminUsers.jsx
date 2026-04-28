import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";
import SystemModal from "../../components/ui/SystemModal";
import Toast from "../../components/ui/Toast";
import AddUserModal from "../../features/users/components/AddUserModal";
import { UserPlus, Edit2, Trash2, Shield, User as UserIcon, X, Loader2, Users, UserX, CheckCircle } from "lucide-react";

const ROLE_PILLS = [
    { label: "All Users", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Customer", value: "user" },
];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ show: false, user: null });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
    const [editFormData, setEditFormData] = useState({ role: "user" });
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [toast, setToast] = useState({ show: false, message: "" });
    const [confirmSuspend, setConfirmSuspend] = useState({ show: false, user: null });
    const [successAction, setSuccessAction] = useState({ show: false, title: "", message: "" });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterRole) params.append('role', filterRole);
        API.get(`/admin/users?${params.toString()}`)
            .then(res => { if (res.data) setUsers(res.data); })
            .catch(err => console.error("Failed to load users", err));
    };

    useEffect(() => { loadData(); }, [searchTerm, filterRole]);

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await API.delete(`/admin/users/${confirmDelete.id}`);
            setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
            setConfirmDelete({ show: false, id: null });
            setToast({ show: true, message: "User deleted successfully" });
        } catch {
            setConfirmDelete({ show: false, id: null });
            setToast({ show: true, message: "Error deleting user" });
        }
    };

    const openEditModal = (u) => {
        setEditFormData({ role: u.role, phone: u.phone || "" });
        setEditModal({ show: true, user: u });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await API.put(`/admin/users/${editModal.user.id}`, editFormData);
            setToast({ show: true, message: "User role updated successfully" });
            setEditModal({ show: false, user: null });
            loadData();
        } catch {
            setToast({ show: true, message: "Error updating role" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUserAdded = (message) => {
        setToast({ show: true, message });
        loadData();
    };

    const handleSuspend = async () => {
        if (!confirmSuspend.user) return;
        const targetStatus = confirmSuspend.user.status === 'suspended' ? 'active' : 'suspended';
        setIsSaving(true);
        try {
            await API.put(`/admin/users/${confirmSuspend.user.id}`, { status: targetStatus });
            setConfirmSuspend({ show: false, user: null });
            setEditModal({ show: false, user: null });
            setSuccessAction({
                show: true,
                title: targetStatus === 'suspended' ? "User Suspended" : "User Reactivated",
                message: `User ${confirmSuspend.user.name} has been successfully ${targetStatus === 'suspended' ? 'suspended' : 'reactivated'}.`
            });
            loadData();
        } catch {
            setToast({ show: true, message: "Error updating user status" });
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleMeta = (role) => {
        if (role === 'admin') return { label: 'Admin', className: 'ur-badge-admin', icon: <Shield size={13} /> };
        return { label: 'Customer', className: 'ur-badge-user', icon: <UserIcon size={13} /> };
    };

    return (
        <div className="ur-page">
            {/* ── Header ── */}
            <header className="ur-header">
                <div className="ur-header-left">
                    <h1 className="ur-title">Manage Users</h1>
                    <p className="ur-subtitle">Control access and roles for Sinina Co.</p>
                </div>
                <button className="ur-add-btn" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={17} />
                    Add New User
                </button>
            </header>

            {/* ── Filters ── */}
            <div className="ur-filters">
                <div className="search-wrapper ur-search">
                    <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
                <div className="category-pills">
                    {ROLE_PILLS.map(p => (
                        <button
                            key={p.value}
                            className={`pill-btn ${filterRole === p.value ? "active" : ""}`}
                            onClick={() => setFilterRole(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="ur-table-wrap">
                <table className="ur-table">
                    <thead>
                        <tr>
                            <th>User Profile</th>
                            <th>Role</th>
                            <th>Date Joined</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map(u => {
                                const meta = getRoleMeta(u.role);
                                return (
                                    <tr key={u.id} className="ur-row">
                                        {/* Profile */}
                                        <td>
                                            <div className="ur-profile">
                                                <div className={`ur-avatar ${u.role === 'admin' ? 'ur-avatar-admin' : ''}`}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ur-profile-text">
                                                    <span className="ur-name">{u.name}</span>
                                                    <span className="ur-email">{u.email}</span>
                                                    {u.phone && <span className="ur-phone" style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                        {u.phone}
                                                    </span>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td>
                                            <span className={`ur-badge ${meta.className}`}>
                                                {meta.icon}
                                                {meta.label}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="ur-date">
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : '—'}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <div className="ur-status">
                                                <span className={`ur-status-dot ${u.status === 'active' ? 'active' : 'inactive'}`} />
                                                {u.status === 'suspended' ? 'Suspended' : (u.role === 'admin' ? 'Active' : 'Registered')}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="ur-actions">
                                                {u.role !== 'admin' ? (
                                                    <>
                                                        <button className="ur-btn-edit" onClick={() => openEditModal(u)}>
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button className="ur-btn-delete" onClick={() => setConfirmDelete({ show: true, id: u.id })}>
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="ur-protected">
                                                        <Shield size={13} /> Protected
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="ur-empty">
                                    <Users size={44} strokeWidth={1.2} />
                                    <p>No users match your search.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Add User Modal ── */}
            <AddUserModal show={showAddModal} onClose={() => setShowAddModal(false)} onUserAdded={handleUserAdded} />

            {/* ── Edit Role Modal ── */}
            {editModal.show && createPortal(
                <div className="admin-modal-overlay" onClick={() => setEditModal({ show: false, user: null })}>
                    <div className="admin-modal bubble-effect ap-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
                        <button className="ap-modal-close" onClick={() => setEditModal({ show: false, user: null })}>
                            <X size={18} />
                        </button>

                        <div className="ap-modal-header">
                            <div className="ap-modal-icon">
                                <Shield size={26} />
                            </div>
                            <div>
                                <h3 className="ap-modal-title">Edit Access</h3>
                                <p className="ap-modal-sub">Adjusting role for <strong>{editModal.user?.name}</strong></p>
                            </div>
                        </div>

                        <form onSubmit={handleEditSubmit} className="ap-form">
                            <div className="form-group">
                                <label>System Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                                    required
                                    className="admin-input"
                                >
                                    <option value="admin">Admin — Full Access</option>
                                    <option value="user">Customer — Storefront Only</option>
                                </select>
                            </div>



                            <div className="form-group" style={{ marginBottom: '1.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem' }}>Account Status</label>
                                <button
                                    type="button"
                                    className={`btn-${editModal.user?.status === 'suspended' ? 'secondary' : 'danger'}-light`}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setConfirmSuspend({ show: true, user: editModal.user })}
                                >
                                    {editModal.user?.status === 'suspended' ? (
                                        <>
                                            <CheckCircle size={18} /> Reactivate Account
                                        </>
                                    ) : (
                                        <>
                                            <UserX size={18} /> Suspend User Account
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditModal({ show: false, user: null })} disabled={isSaving} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Update Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <SystemModal
                show={confirmDelete.show}
                title="Remove User"
                message="Are you sure you want to permanently remove this user? Their access will be revoked immediately."
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ show: false, id: null })}
            />

            <SystemModal
                show={confirmSuspend.show}
                title={confirmSuspend.user?.status === 'suspended' ? "Reactivate User" : "Suspend User"}
                message={confirmSuspend.user?.status === 'suspended'
                    ? `Are you sure you want to reactivate ${confirmSuspend.user?.name}'s account? They will regain access immediately.`
                    : `Are you sure you want to suspend ${confirmSuspend.user?.name}'s account? They will be blocked from logging in.`
                }
                onConfirm={handleSuspend}
                onCancel={() => setConfirmSuspend({ show: false, user: null })}
                confirmText={confirmSuspend.user?.status === 'suspended' ? "Reactivate" : "Suspend"}
            />

            <SystemModal
                show={successAction.show}
                type="info"
                title={successAction.title}
                message={successAction.message}
                onConfirm={() => setSuccessAction({ show: false, title: "", message: "" })}
                confirmText="Great"
            />

            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: "" })} />
        </div>
    );
}
