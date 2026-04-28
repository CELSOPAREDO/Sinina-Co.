import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";
import SystemModal from "../../components/ui/SystemModal";
import Toast from "../../components/ui/Toast";
import { Edit2, Trash2, PackagePlus, X, Loader2, UploadCloud, Package } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "4XL"];

const defaultSizeInventory = () =>
    SIZES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "", price: "", stock: "", description: "", color: "", category_id: ""
    });
    const [sizeInventory, setSizeInventory] = useState(defaultSizeInventory());
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
    const [alertModal, setAlertModal] = useState({ show: false, message: "", title: "" });
    const [toast, setToast] = useState({ show: false, message: "" });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterCategory) params.append('category_id', filterCategory);
        API.get(`/admin/products?${params.toString()}`).then(res => setProducts(res.data.data || res.data || [])).catch(console.error);
        API.get("/admin/categories").then(res => setCategories(res.data || [])).catch(console.error);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.replace(/^\/?storage\//, '');
        return `/storage/${cleanPath}`;
    };

    const getTotalStock = (inv) => {
        if (!inv) return 0;
        return Object.values(inv).reduce((s, v) => s + Number(v || 0), 0);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const editId = queryParams.get('edit');
        if (editId && products.length > 0) {
            const prod = products.find(p => p.id == editId);
            if (prod) openEditModal(prod);
        }
    }, [products]);

    const handleDelete = (id) => setConfirmModal({ show: true, id });

    const confirmDelete = async () => {
        try {
            await API.delete(`/admin/products/${confirmModal.id}`);
            setProducts(products.filter(p => p.id !== confirmModal.id));
            setConfirmModal({ show: false, id: null });
            setToast({ show: true, message: "Product deleted successfully" });
        } catch {
            setConfirmModal({ show: false, id: null });
            setAlertModal({ show: true, title: "Error", message: "Failed to delete product." });
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: "", price: "", stock: "", description: "", color: "", category_id: categories[0]?.id || "" });
        setSizeInventory(defaultSizeInventory());
        setImageFile(null);
        setImagePreview(null);
        setShowModal(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name, price: p.price, stock: p.stock ?? "", description: p.description || "",
            color: p.color || "", category_id: p.category_id || categories[0]?.id || ""
        });
        const inv = p.size_inventory || defaultSizeInventory();
        // ensure all sizes present
        const filled = SIZES.reduce((acc, s) => ({ ...acc, [s]: inv[s] ?? 0 }), {});
        setSizeInventory(filled);
        setImageFile(null);
        setImagePreview(p.image ? getImageUrl(p.image) : null);
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSizeChange = (size, value) => {
        const num = Math.max(0, parseInt(value) || 0);
        const updated = { ...sizeInventory, [size]: num };
        setSizeInventory(updated);
        // auto-compute total stock
        const total = Object.values(updated).reduce((s, v) => s + Number(v), 0);
        setFormData(f => ({ ...f, stock: total }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) data.append(key, formData[key]);
        });
        const selectedCategory = categories.find(c => String(c.id) === String(formData.category_id));
        const isAccessory = selectedCategory?.name?.toLowerCase().includes('accessories');

        if (isAccessory) {
            // For accessories, treat as 'One Size' for the backend sum
            data.append('size_inventory', JSON.stringify({ "One Size": Number(formData.stock || 0) }));
        } else {
            data.append('size_inventory', JSON.stringify(sizeInventory));
        }

        if (imageFile) data.append("image", imageFile);

        try {
            if (editingProduct) {
                data.append('_method', 'PUT');
                await API.post(`/admin/products/${editingProduct.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await API.post("/admin/products", data, { headers: { "Content-Type": "multipart/form-data" } });
            }
            setShowModal(false);
            loadData();
            setToast({ show: true, message: editingProduct ? "Product updated!" : "Product created!" });
            if (window.location.search.includes('edit=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (err) {
            console.error(err);
            setAlertModal({ show: true, title: "Error", message: "Failed to save product changes." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-products-page">
            {/* ── Header ── */}
            <header className="admin-section-header inventory-header">
                <div className="header-left">
                    <h1 className="admin-title font-heading">Product Inventory</h1>
                    <div className="admin-filters-row">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="admin-search-input"
                            />
                            <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        
                        <div className="category-pills">
                            <button 
                                className={`pill-btn ${filterCategory === "" ? "active" : ""}`}
                                onClick={() => setFilterCategory("")}
                            >
                                All Products
                            </button>
                            {categories.map(c => (
                                <button 
                                    key={c.id} 
                                    className={`pill-btn ${filterCategory == c.id ? "active" : ""}`}
                                    onClick={() => setFilterCategory(c.id)}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PackagePlus size={18} /> Add Product
                </button>
            </header>

            {/* ── Product Grid ── */}
            <section className="ap-grid">
                {products.length === 0 && (
                    <div className="ap-empty">
                        <Package size={48} strokeWidth={1.5} />
                        <p>No products found</p>
                    </div>
                )}
                {products.map(p => {
                    const totalStock = p.size_inventory ? getTotalStock(p.size_inventory) : p.stock;
                    const isLow = totalStock <= 5;
                    return (
                        <div key={p.id} className="ap-card">
                            {/* Image */}
                            <div className="ap-card-img">
                                {p.image
                                    ? <img 
                                        src={getImageUrl(p.image)} 
                                        alt={p.name} 
                                        decoding="async"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = ""; // Clear src to trigger alt or custom UI
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    : null
                                }
                                <div className="ap-no-img" style={{ display: p.image ? 'none' : 'flex' }}>
                                    <Package size={36} strokeWidth={1} />
                                </div>
                                {isLow && <span className="ap-low-badge">Low Stock</span>}
                            </div>

                            {/* Body */}
                            <div className="ap-card-body">
                                <p className="ap-card-cat">{p.category?.name || "Uncategorized"}</p>
                                <h4 className="ap-card-name font-heading">{p.name}</h4>
                                <p className="ap-card-price">₱{Number(p.price || 0).toFixed(2)}</p>

                                {/* Size inventory chips */}
                                {p.size_inventory && (
                                    <div className="ap-size-row">
                                        {SIZES.map(s => {
                                            const qty = p.size_inventory[s] ?? 0;
                                            return (
                                                <div key={s} className={`ap-size-chip ${qty === 0 ? 'ap-size-empty' : ''}`}>
                                                    <span className="ap-size-label">{s}</span>
                                                    <span className="ap-size-qty">{qty}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="ap-stock-line">
                                    <span className={`ap-stock-text ${isLow ? 'ap-stock-low' : ''}`}>
                                        {isLow ? '⚠ ' : ''}Total stock: {totalStock}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="ap-card-actions">
                                <button className="ap-btn-edit" onClick={() => openEditModal(p)}>
                                    <Edit2 size={15} />
                                    <span>Edit</span>
                                </button>
                                <button className="ap-btn-delete" onClick={() => handleDelete(p.id)}>
                                    <Trash2 size={15} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* ── Modal ── */}
            {showModal && createPortal(
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal bubble-effect ap-modal" onClick={e => e.stopPropagation()}>
                        <button className="ap-modal-close" onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </button>

                        <div className="ap-modal-header">
                            <div className="ap-modal-icon">
                                {editingProduct ? <Edit2 size={26} /> : <PackagePlus size={26} />}
                            </div>
                            <div>
                                <h3 className="ap-modal-title font-heading">{editingProduct ? "Edit Product" : "New Product"}</h3>
                                <p className="ap-modal-sub">Manage inventory details for Sinina Co. storefront.</p>
                            </div>
                        </div>

                        {(() => {
                            const selectedCategory = categories.find(c => String(c.id) === String(formData.category_id));
                            const isAccessory = selectedCategory?.name?.toLowerCase().includes('accessories');

                            return (
                                <form onSubmit={handleSubmit} className="admin-form ap-form">
                                    {/* Name */}
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input placeholder="e.g. Classic White T-Shirt" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="admin-input" disabled={isSaving} />
                                    </div>

                                    {/* Category + Price */}
                                    <div className="ap-form-row">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required className="admin-input" disabled={isSaving}>
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Price (₱)</label>
                                            <input placeholder="0.00" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="admin-input" disabled={isSaving} />
                                        </div>
                                    </div>

                                    {/* Color */}
                                    <div className="form-group">
                                        <label>Color / Variant</label>
                                        <input placeholder="e.g. Black, White, Navy" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="admin-input" disabled={isSaving} />
                                    </div>

                                    {/* Size Inventory OR Simple Stock */}
                                    {!isAccessory ? (
                                        <div className="form-group">
                                            <label>Size Inventory</label>
                                            <div className="ap-size-inventory">
                                                {SIZES.map(size => (
                                                    <div key={size} className="ap-inv-cell">
                                                        <span className="ap-inv-size">{size}</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={sizeInventory[size] === 0 ? "" : sizeInventory[size]}
                                                            onChange={e => handleSizeChange(size, e.target.value)}
                                                            placeholder="0"
                                                            className="ap-inv-input"
                                                            disabled={isSaving}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="ap-inv-note">Total stock auto-calculated: <strong>{formData.stock || 0} units</strong></p>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Total Stock</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                placeholder="Total units available" 
                                                value={formData.stock} 
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })} 
                                                className="admin-input" 
                                                disabled={isSaving} 
                                                required
                                            />
                                            <p className="ap-inv-note">Accessories do not have size variants. Enter total stock directly.</p>
                                        </div>
                                    )}
                                    {/* Description */}
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea placeholder="Product details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-input" rows="4" disabled={isSaving}></textarea>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="form-group">
                                        <label>Product Image</label>
                                        <div className="ap-upload-zone" onClick={() => document.getElementById('ap-image-input').click()}>
                                            <input id="ap-image-input" type="file" accept="image/*" onChange={handleImageChange} hidden />
                                            {imagePreview ? (
                                                <div className="ap-preview-wrap">
                                                    <img src={imagePreview} alt="Preview" className="ap-preview-img" />
                                                    <div className="ap-preview-overlay">Change Image</div>
                                                </div>
                                            ) : (
                                                <div className="ap-upload-placeholder">
                                                    <UploadCloud size={32} />
                                                    <span>Click to upload product photo</span>
                                                    <p>PNG, JPG up to 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ap-modal-footer">
                                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                                        <button type="submit" className="btn-primary" disabled={isSaving}>
                                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <PackagePlus size={18} />}
                                            {editingProduct ? "Save Changes" : "Create Product"}
                                        </button>
                                    </div>
                                </form>
                            );
                        })()}
                    </div>
                </div>,
                document.body
            )}

            <SystemModal show={confirmModal.show} title="Delete Product" message="Are you sure you want to remove this item? This action cannot be undone." onConfirm={confirmDelete} onCancel={() => setConfirmModal({ show: false, id: null })} />
            <SystemModal show={alertModal.show} title={alertModal.title} message={alertModal.message} type="alert" onConfirm={() => setAlertModal({ show: false, message: "", title: "" })} />
            <Toast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: "" })} />
        </div>
    );
}
