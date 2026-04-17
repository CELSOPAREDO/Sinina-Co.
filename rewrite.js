const fs = require('fs');
const path = require('path');

const write = (f, c) => {
    const p = path.resolve(__dirname, 'resources/js', f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, c, 'utf8');
};

write('components/layouts/MainLayout.jsx', 
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function MainLayout() {
    return (
        <div className="main-wrapper">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
);

write('components/layouts/AdminLayout.jsx', 
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
    return (
        <div className="admin-wrapper">
            <nav className="admin-topbar">
                <div className="admin-brand">Admin Panel</div>
                <div className="admin-nav">
                    <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
                    <NavLink to="/admin/users" className={({isActive}) => isActive ? "active" : ""}>Users</NavLink>
                    <NavLink to="/admin/products" className={({isActive}) => isActive ? "active" : ""}>Products</NavLink>
                    <NavLink to="/admin/orders" className={({isActive}) => isActive ? "active" : ""}>Orders</NavLink>
                </div>
                <div className="admin-profile">
                    <div className="avatar">A</div>
                </div>
            </nav>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
);

write('components/layouts/AdminLayout.css', 
.admin-wrapper {
    min-height: 100vh;
    background: #f9fafb;
    font-family: 'Inter', system-ui, sans-serif;
}
.admin-topbar {
    background: #1f2937;
    color: white;
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.admin-brand {
    font-weight: bold;
    font-size: 1.25rem;
}
.admin-nav {
    display: flex;
    gap: 2rem;
}
.admin-nav a {
    color: #9ca3af;
    text-decoration: none;
    font-weight: 500;
    padding: 1.25rem 0;
    border-bottom: 2px solid transparent;
    transition: color 0.2s;
}
.admin-nav a:hover, .admin-nav a.active {
    color: white;
    border-bottom-color: #3b82f6;
}
.admin-profile .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}
.admin-main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
.section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #111827;
}

/* common admin UI */
.admin-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.admin-table th, .admin-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}
.admin-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #4b5563;
}
.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-edit { background: #f3f4f6; border: 1px solid #d1d5db; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; }
.status-badge, .role-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.buyer { background: #d1fae5; color: #065f46; }
);

write('pages/AdminDashboard.jsx', 
import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        Promise.all([
            API.get("/admin/users").catch(() => ({ data: [] })),
            API.get("/admin/products").catch(() => ({ data: [] })),
            API.get("/admin/orders").catch(() => ({ data: [] }))
        ]).then(([u, p, o]) => {
            setStats({ users: (u.data || []).length, products: (p.data || []).length, orders: (o.data || []).length });
            setRecentProducts((p.data || []).slice(0, 4));
        });
    }, []);

    return (
        <div>
            <h2 className="section-title">Dashboard Overview</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
                <div style={{background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe'}}>
                    <h3 style={{margin: '0 0 .5rem', fontSize: '1rem', color: '#1e3a8a'}}>Total Users</h3>
                    <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1d4ed8'}}>{stats.users}</p>
                </div>
                <div style={{background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe'}}>
                    <h3 style={{margin: '0 0 .5rem', fontSize: '1rem', color: '#1e3a8a'}}>Total Products</h3>
                    <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1d4ed8'}}>{stats.products}</p>
                </div>
                <div style={{background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe'}}>
                    <h3 style={{margin: '0 0 .5rem', fontSize: '1rem', color: '#1e3a8a'}}>Total Orders</h3>
                    <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1d4ed8'}}>{stats.orders}</p>
                </div>
            </div>
            
            <h3 className="section-title">Recent Products</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                {recentProducts.map(p => (
                    <div key={p.id} style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: 'white'}}>
                        <h4 style={{margin: '0 0 0.5rem'}}>{p.name}</h4>
                        <p style={{margin: 0, color: '#6b7280'}}>Stock: {p.stock} | \</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
);

write('pages/AdminUsers.jsx', 
import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        API.get("/admin/users").then(res => setUsers(res.data || [])).catch(console.error);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete user?")) return;
        try {
            await API.delete(\/admin/users/\\);
            setUsers(users.filter(u => u.id !== id));
        } catch { alert("Error deleting user"); }
    };

    return (
        <div>
            <h2 className="section-title">Manage Users</h2>
            <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span className={\ole-badge \\}>{u.role}</span></td>
                            <td>
                                <button className="btn-edit">Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(u.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
);

write('pages/AdminProducts.jsx', 
import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        API.get("/admin/products").then(res => setProducts(res.data || [])).catch(console.error);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete product?")) return;
        try {
            await API.delete(\/admin/products/\\);
            setProducts(products.filter(p => p.id !== id));
        } catch { alert("Error deleting product"); }
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 className="section-title" style={{margin: 0}}>Manage Products</h2>
                <button className="btn-primary">Add Product</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem'}}>
                {products.map(p => (
                    <div key={p.id} style={{border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: 'white'}}>
                        <div style={{height: 150, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {p.image_url ? <img src={p.image_url} alt={p.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{color: '#9ca3af'}}>No Img</span>}
                        </div>
                        <div style={{padding: '1rem'}}>
                            <h4 style={{margin: '0 0 .5rem'}}>{p.name}</h4>
                            <p style={{margin: '0 0 .5rem', fontWeight: 'bold'}}>\</p>
                            <p style={{margin: 0, fontSize: '.9rem', color: '#6b7280'}}>Stock: {p.stock}</p>
                            <div style={{marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                                <button className="btn-edit">Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
);

write('pages/AdminOrders.jsx', 
import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        API.get("/admin/orders").then(res => setOrders(res.data || [])).catch(console.error);
    }, []);

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center'}}>
                <h2 className="section-title" style={{margin: 0}}>Manage Orders</h2>
                <div style={{fontWeight: 'bold'}}>Total: {orders.length}</div>
            </div>
            <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Total Items</th><th>Total Price</th><th>Status</th></tr></thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td>{o.user?.name || 'Guest'}</td>
                            <td>{(o.items || []).length}</td>
                            <td>\</td>
                            <td><span className="status-badge" style={{background: '#dbeafe', color: '#1e40af'}}>{o.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
);

console.log("Files written successfully");
