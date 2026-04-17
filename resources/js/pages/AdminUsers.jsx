import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ role: "user" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        API.get("/admin/users")
            .then(res => setUsers(res.data || []))
            .catch(console.error);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch { 
            alert("Error deleting user"); 
        }
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setFormData({ role: u.role });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await API.put(`/admin/users/${editingUser.id}`, formData);
            setShowModal(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert("Error saving user.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 className="section-title" style={{ margin: 0 }}>Manage Users</h2>
            </div>
            
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Name</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Email</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Role</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "#25343F", borderBottom: "2px solid #EAEFEF" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #EAEFEF" }}>
                                <td style={{ padding: "1rem" }}>{u.name}</td>
                                <td style={{ padding: "1rem" }}>{u.email}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    {u.role === "admin" ? (
                                        <span style={{ color: "#9ca3af", fontWeight: "600" }}>Admin</span>
                                    ) : (
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="btn-edit" onClick={() => openEditModal(u)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(u.id)}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(37,52,63,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "white", padding: "2rem", borderRadius: "8px", width: "100%", maxWidth: "450px", boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}>
                        <h3 style={{ marginTop: 0, color: "#25343F", fontSize: "1.3rem" }}>Edit User Role: {editingUser?.name}</h3>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#25343F", fontWeight: "600" }}>Assign Role</label>
                                <select 
                                    value={formData.role} 
                                    onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                    required 
                                    className="input-field" 
                                    style={{ padding: "0.75rem", border: "1px solid #BFC9D1", borderRadius: "4px", width: "100%" }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={isSaving} className="btn-cancel">Cancel</button>
                                <button type="submit" disabled={isSaving} className="btn-primary" style={{ opacity: isSaving ? 0.7 : 1 }}>
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
