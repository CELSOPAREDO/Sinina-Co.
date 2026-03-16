import React, { useEffect, useState } from "react";
import API from "../services/api";
import { getProductImageUrl } from "../services/imageUrl";
import "./SellerDashboard.css";

function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reports, setReports] = useState(null);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState("products");
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        size: "",
        color: "",
        category_id: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState("");
    const [editImageFile, setEditImageFile] = useState(null);

    useEffect(() => {
        Promise.all([
            API.get("/seller/products"),
            API.get("/seller/orders"),
            API.get("/seller/reports"),
            API.get("/categories"),
        ])
            .then(([prodRes, orderRes, reportRes, catRes]) => {
                setProducts(prodRes.data);
                setOrders(orderRes.data);
                setReports(reportRes.data);
                setCategories(catRes.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        if (imageFile) data.append("image", imageFile);

        try {
            const res = await API.post("/seller/products", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProducts([res.data.product, ...products]);
            setFormSuccess("Product created successfully!");
            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                size: "",
                color: "",
                category_id: "",
            });
            setImageFile(null);
            setShowForm(false);
        } catch (err) {
            setFormError(
                err.response?.data?.message || "Failed to create product."
            );
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;
        try {
            await API.delete(`/seller/products/${productId}`);
            setProducts(products.filter((p) => p.id !== productId));
        } catch {
            alert("Failed to delete product.");
        }
    };

    const handleStartEdit = (product) => {
        setEditingId(product.id);
        setEditStock(String(product.stock ?? "0"));
        setEditImageFile(null);
        setFormError("");
        setFormSuccess("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditStock("");
        setEditImageFile(null);
    };

    const handleUpdateProduct = async (productId) => {
        setFormError("");
        setFormSuccess("");

        const stockValue = Number(editStock);
        if (!Number.isInteger(stockValue) || stockValue < 0) {
            setFormError("Stock must be a whole number of 0 or higher.");
            return;
        }

        const data = new FormData();
        data.append("stock", String(stockValue));
        if (editImageFile) data.append("image", editImageFile);
        data.append("_method", "PUT");

        try {
            const res = await API.post(`/seller/products/${productId}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const updatedProduct = res.data.product;
            setProducts(
                products.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p))
            );
            setFormSuccess("Product updated successfully!");
            handleCancelEdit();
        } catch (err) {
            setFormError(
                err.response?.data?.message || "Failed to update product."
            );
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await API.put(`/seller/orders/${orderId}/status`, {
                status: newStatus,
            });
            setOrders(
                orders.map((o) =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                )
            );
        } catch {
            alert("Failed to update order status.");
        }
    };

    if (loading) return <p className="loading-text">Loading dashboard...</p>;

    return (
        <div className="seller-dashboard">
            <h1>Seller Dashboard</h1>

            
            <div className="dashboard-tabs">
                <button
                    className={activeTab === "products" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("products")}
                >
                    Products
                </button>
                <button
                    className={activeTab === "orders" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("orders")}
                >
                    Orders
                </button>
                <button
                    className={activeTab === "reports" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("reports")}
                >
                    Reports
                </button>
            </div>

            
            {activeTab === "products" && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h2>My Products ({products.length})</h2>
                        <button
                            className="add-btn"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? "Cancel" : "+ Add Product"}
                        </button>
                    </div>

                    {formSuccess && <p className="form-success">{formSuccess}</p>}
                    {formError && <p className="form-error">{formError}</p>}

                    
                    {showForm && (
                        <form
                            className="product-form"
                            onSubmit={handleCreateProduct}
                        >
                            <input
                                name="name"
                                placeholder="Product name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                            <div className="form-row">
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    name="stock"
                                    type="number"
                                    placeholder="Stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <input
                                    name="size"
                                    placeholder="Size (e.g., M, L)"
                                    value={formData.size}
                                    onChange={handleChange}
                                />
                                <input
                                    name="color"
                                    placeholder="Color"
                                    value={formData.color}
                                    onChange={handleChange}
                                />
                            </div>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                            <button type="submit" className="submit-btn">
                                Create Product
                            </button>
                        </form>
                    )}

                    
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            className="seller-product-thumb"
                                            src={getProductImageUrl(
                                                product.image,
                                                "https://placehold.co/80x80?text=No+Image"
                                            )}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    "https://placehold.co/80x80?text=No+Image";
                                            }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>
                                        {product.category
                                            ? product.category.name
                                            : "-"}
                                    </td>
                                    <td>₱{Number(product.price).toFixed(2)}</td>
                                    <td>
                                        {editingId === product.id ? (
                                            <input
                                                className="inline-stock-input"
                                                type="number"
                                                min="0"
                                                value={editStock}
                                                onChange={(e) =>
                                                    setEditStock(e.target.value)
                                                }
                                            />
                                        ) : (
                                            product.stock
                                        )}
                                    </td>
                                    <td>
                                        {editingId === product.id ? (
                                            <div className="row-actions">
                                                <input
                                                    className="inline-file-input"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        setEditImageFile(
                                                            e.target.files[0] ||
                                                                null
                                                        )
                                                    }
                                                />
                                                <button
                                                    className="save-btn"
                                                    onClick={() =>
                                                        handleUpdateProduct(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="row-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleStartEdit(product)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            
            {activeTab === "orders" && (
                <div className="tab-content">
                    <h2>Customer Orders ({orders.length})</h2>
                    {orders.length === 0 ? (
                        <p className="empty-text">No orders yet.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Buyer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>
                                            {order.user
                                                ? order.user.name
                                                : "Unknown"}
                                        </td>
                                        <td>
                                            ₱
                                            {Number(order.total_price).toFixed(
                                                2
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge status-${order.status}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        order.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="processing">
                                                    Processing
                                                </option>
                                                <option value="shipped">
                                                    Shipped
                                                </option>
                                                <option value="delivered">
                                                    Delivered
                                                </option>
                                                <option value="cancelled">
                                                    Cancelled
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            
            {activeTab === "reports" && reports && (
                <div className="tab-content">
                    <h2>Sales Report</h2>
                    <div className="report-cards">
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
                </div>
            )}
        </div>
    );
}

export default SellerDashboard;
