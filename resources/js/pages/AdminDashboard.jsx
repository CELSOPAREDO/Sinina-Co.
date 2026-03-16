import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reports, setReports] = useState(null);
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(true);

    const [newCategory, setNewCategory] = useState("");
    const [catMessage, setCatMessage] = useState("");

    useEffect(() => {
        Promise.all([
            API.get("/admin/users"),
            API.get("/admin/categories"),
            API.get("/admin/reports"),
        ])
            .then(([usersRes, catRes, reportRes]) => {
                setUsers(usersRes.data);
                setCategories(catRes.data);
                setReports(reportRes.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}`, { role: newRole });
            setUsers(
                users.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u
                )
            );
        } catch {
            alert("Failed to update user role.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?"))
            return;
        try {
            await API.delete(`/admin/users/${userId}`);
            setUsers(users.filter((u) => u.id !== userId));
        } catch {
            alert("Failed to delete user.");
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setCatMessage("");
        try {
            const res = await API.post("/admin/categories", {
                name: newCategory,
            });
            setCategories([...categories, res.data.category]);
            setNewCategory("");
            setCatMessage("Category created!");
        } catch {
            setCatMessage("Failed to create category.");
        }
    };

    const handleDeleteCategory = async (catId) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await API.delete(`/admin/categories/${catId}`);
            setCategories(categories.filter((c) => c.id !== catId));
        } catch {
            alert("Failed to delete category.");
        }
    };

    if (loading) return <p className="loading-text">Loading dashboard...</p>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            
            <div className="dashboard-tabs">
                <button
                    className={activeTab === "users" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={activeTab === "categories" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("categories")}
                >
                    Categories
                </button>
                <button
                    className={activeTab === "reports" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("reports")}
                >
                    Reports
                </button>
            </div>

            
            {activeTab === "users" && (
                <div className="tab-content">
                    <h2>All Users ({users.length})</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    user.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="buyer">Buyer</option>
                                            <option value="seller">
                                                Seller
                                            </option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            
            {activeTab === "categories" && (
                <div className="tab-content">
                    <h2>Categories ({categories.length})</h2>

                    
                    <form
                        className="category-form"
                        onSubmit={handleCreateCategory}
                    >
                        <input
                            type="text"
                            placeholder="New category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            required
                        />
                        <button type="submit" className="add-btn">
                            Add Category
                        </button>
                    </form>

                    {catMessage && <p className="cat-message">{catMessage}</p>}

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.name}</td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteCategory(cat.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            
            {activeTab === "reports" && reports && (
                <div className="tab-content">
                    <h2>System Reports</h2>
                    <div className="report-cards">
                        <div className="report-card">
                            <h3>{reports.total_users}</h3>
                            <p>Total Users</p>
                        </div>
                        <div className="report-card">
                            <h3>{reports.total_products}</h3>
                            <p>Total Products</p>
                        </div>
                        <div className="report-card">
                            <h3>{reports.total_orders}</h3>
                            <p>Total Orders</p>
                        </div>
                        <div className="report-card">
                            <h3>₱{Number(reports.total_revenue).toFixed(2)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>

                    <div className="report-details">
                        <div className="report-section">
                            <h3>Users by Role</h3>
                            <ul>
                                <li>Admins: {reports.users_by_role.admin}</li>
                                <li>Sellers: {reports.users_by_role.seller}</li>
                                <li>Buyers: {reports.users_by_role.buyer}</li>
                            </ul>
                        </div>
                        <div className="report-section">
                            <h3>Orders by Status</h3>
                            <ul>
                                <li>
                                    Pending: {reports.orders_by_status.pending}
                                </li>
                                <li>
                                    Processing:{" "}
                                    {reports.orders_by_status.processing}
                                </li>
                                <li>
                                    Shipped: {reports.orders_by_status.shipped}
                                </li>
                                <li>
                                    Delivered:{" "}
                                    {reports.orders_by_status.delivered}
                                </li>
                                <li>
                                    Cancelled:{" "}
                                    {reports.orders_by_status.cancelled}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
