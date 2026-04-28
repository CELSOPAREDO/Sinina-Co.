import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./UserShop.css";
import { Search, Filter, ShoppingBag, Loader2 } from "lucide-react";
import AddToCartModal from "../../features/orders/components/AddToCartModal";
import SystemModal from "../../components/ui/SystemModal";

export default function UserShop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                API.get("/products").catch(() => ({ data: [] })),
                API.get("/categories").catch(() => ({ data: [] }))
            ]);

            const prodData = prodRes.data.data || prodRes.data;
            setProducts(Array.isArray(prodData) ? prodData : []);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        } catch (err) {
            console.error("Error loading shop data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCartClick = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedProduct(product);
    };

    const handleModalAdd = async (payload) => {
        try {
            await API.post("/cart/add", payload);
            window.dispatchEvent(new Event('cartUpdated'));
            setSuccessMessage(`Added to cart successfully!`);
            setShowSuccessModal(true);
            setSelectedProduct(null);
        } catch (err) {
            alert("Failed to add to cart. Please log in.");
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        navigate('/user/cart');
    };

    const filtered = products.filter(p => {
        const catMatch = selectedCategory === "all" || String(p.category_id) === String(selectedCategory);
        const searchMatch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        return catMatch && searchMatch;
    });

    if (loading) {
        return (
            <div className="us-loading">
                <Loader2 size={32} className="us-spinner" />
                <p>Loading catalog...</p>
            </div>
        );
    }

    return (
        <div className="us-container">

            <div className="us-layout">
                <aside className="us-sidebar">
                    <div className="us-filter-title">
                        <Filter size={16} /> Categories
                    </div>
                    <div className="us-categories">
                        <button
                            className={`us-cat-btn ${selectedCategory === "all" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("all")}
                        >
                            All Products
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                className={`us-cat-btn ${String(selectedCategory) === String(c.id) ? "active" : ""}`}
                                onClick={() => setSelectedCategory(c.id)}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="us-main">
                    <div className="us-search-area">
                        <div className="us-search-box">
                            <Search size={18} className="us-search-icon" />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="us-results-info">
                        Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                    </div>

                    {filtered.length > 0 ? (
                        <div className="us-grid">
                            {filtered.map(product => (
                                <Link to={`/user/shop/product/${product.id}`} key={product.id} className="us-card">
                                    <div className="us-img-wrap">
                                        {product.image ? (
                                            <img src={`/storage/${product.image}`} alt={product.name} loading="lazy" />
                                        ) : (
                                            <div className="us-no-img">No Image</div>
                                        )}
                                        <button
                                            className="us-add-btn"
                                            onClick={(e) => handleAddToCartClick(e, product)}
                                            disabled={product.stock <= 0}
                                        >
                                            <ShoppingBag size={18} />
                                            {product.stock > 0 ? "Add" : "Out of Stock"}
                                        </button>
                                    </div>
                                    <div className="us-info">
                                        {product.category && <span className="us-cat">{product.category.name}</span>}
                                        <h3>{product.name}</h3>
                                        <p className="us-desc">{(product.description || "").substring(0, 60)}...</p>

                                        <div className="us-meta">
                                            <span className="us-stock">
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                                            </span>
                                            {product.size_inventory && (
                                                <div className="us-sizes">
                                                    {Object.entries(typeof product.size_inventory === 'string' ? JSON.parse(product.size_inventory) : product.size_inventory)
                                                        .filter(([_, qty]) => Number(qty) > 0)
                                                        .map(([size]) => (
                                                            <span key={size} className="us-size-pill">{size}</span>
                                                        ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="us-price-row">
                                            <span className="us-price">₱{Number(product.price || 0).toFixed(2)}</span>
                                            {product.stock <= 0 && <span className="us-out-stock">Out of stock</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="us-empty">
                            <Search size={40} className="us-empty-icon" />
                            <h2>No products found</h2>
                            <p>We couldn't find anything matching your criteria.</p>
                            <button className="us-btn-reset" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {selectedProduct && (
                <AddToCartModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAdd={handleModalAdd}
                />
            )}

            <SystemModal
                show={showSuccessModal}
                title="Added to Cart"
                message={successMessage}
                onConfirm={handleConfirmSuccess}
                onCancel={() => setShowSuccessModal(false)}
                confirmText="View Cart"
                cancelText="Continue"
            />
        </div>
    );
}
