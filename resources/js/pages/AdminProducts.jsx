import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "", price: "", stock: "", description: "", size: "", color: "", category_id: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        API.get("/admin/products").then(res => setProducts(res.data || [])).catch(console.error);
        API.get("/admin/categories").then(res => setCategories(res.data || [])).catch(console.error);
    };

    // Parse query parameter to open edit modal immediately if navigated from Dashboard
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const editId = queryParams.get('edit');
        if (editId && products.length > 0) {
            const prod = products.find(p => p.id == editId);
            if (prod) openEditModal(prod);
        }
    }, [products]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete product?")) return;
        try {
            await API.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch { alert("Error deleting product"); }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({ name: "", price: "", stock: "", description: "", size: "", color: "", category_id: categories[0]?.id || "" });
        setImageFile(null);
        setImagePreview(null);
        setShowModal(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name, price: p.price, stock: p.stock, description: p.description || "",
            size: p.size || "", color: p.color || "", category_id: p.category_id || categories[0]?.id || ""
        });
        setImageFile(null);
        setImagePreview(p.image ? `/storage/${p.image}` : null);
        setShowModal(true);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            console.log("File is above 2MB, resizing...");
        }

        setImagePreview(URL.createObjectURL(file));
        setIsUploading(true);

        const resizeImage = (fileToResize, maxSize) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(fileToResize);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        let { width, height } = img;
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round(height * (maxSize / width));
                                width = maxSize;
                            } else {
                                width = Math.round(width * (maxSize / height));
                                height = maxSize;
                            }
                        }
                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => {
                            const newFileName = fileToResize.name.replace(/\.[^/.]+$/, "") + ".webp";
                            resolve(new File([blob], newFileName, { type: "image/webp", lastModified: Date.now() }));
                        }, "image/webp", 0.8);
                    };
                };
            });
        };

        try {
            const resized = await resizeImage(file, 800);
            setImageFile(resized);
        } catch (err) {
            console.error(err);
            setImageFile(file);
        }
        setIsUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) data.append(key, formData[key]);
        });
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

            if (window.location.search.includes('edit=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving product.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 className="section-title" style={{margin: 0}}>Manage Products</h2>
                <button className="btn-primary" onClick={openAddModal}>Add Product</button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem'}}>
                {products.map(p => (
                    <div key={p.id} className="admin-product-card">
                        <div className="product-image-container">
                            {p.image ? <img src={`/storage/${p.image}`} alt={p.name} loading="lazy" className="product-image" /> : <span style={{color: "#BFC9D1", fontWeight: "500"}}>No Image</span>}
                        </div>
                        <div style={{padding: "1.5rem"}}>
                            <h4 style={{margin: '0 0 .5rem', color: '#25343F', fontSize: '1.3rem', fontWeight: '700'}}>{p.name}</h4>
                            <p style={{margin: '0 0 .75rem', fontWeight: 'bold', color: '#FF9B51', fontSize: '1.4rem'}}>₱{p.price}</p>
                            <div style={{margin: 0, fontSize: '1rem', color: p.stock <= 5 ? '#dc2626' : '#6b7280', fontWeight: p.stock <= 5 ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                Stock: {p.stock}
                                {p.stock <= 5 && <span style={{background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600'}}>Low Stock</span>}
                            </div>
                            <div style={{marginTop: '1.5rem', borderTop: '1px solid #EAEFEF', paddingTop: '1.5rem', display: 'flex', gap: '0.75rem'}}>
                                <button className="btn-edit" onClick={() => openEditModal(p)} style={{flex: 1}}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(p.id)} style={{flex: 1}}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(37,52,63,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div style={{background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3 style={{marginTop: 0, color: '#25343F'}}>{editingProduct ? "Edit Product" : "Add Product"}</h3>
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}} />
                                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <input placeholder="Price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}} />
                                <input placeholder="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}} />
                            </div>
                            <textarea placeholder="Description" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', resize: 'vertical'}} />
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <input placeholder="Size (optional)" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}} />
                                <input placeholder="Color (optional)" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="input-field" style={{padding: '0.75rem', border: '1px solid #BFC9D1', borderRadius: '4px', width: '100%'}} />
                            </div>
                            
                            <div style={{border: '1px dashed #BFC9D1', padding: '1rem', borderRadius: '4px'}}>
                                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} disabled={isUploading || isSaving} className="input-field" style={{marginBottom: '1rem'}} />
                                {isUploading && <p style={{color: '#FF9B51', margin: '0 0 1rem'}}>Resizing image for optimization...</p>}
                                {imagePreview && (
                                    <div style={{width: '100%', height: '350px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem'}}>
                                        <img src={imagePreview} alt="Preview" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                                    </div>
                                )}
                            </div>

                            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end'}}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={isSaving} className="btn-cancel">Cancel</button>
                                <button type="submit" disabled={isUploading || isSaving} className="btn-primary" style={{opacity: isUploading || isSaving ? 0.7 : 1}}>
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
