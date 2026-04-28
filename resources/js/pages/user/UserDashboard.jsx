import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./UserDashboard.css";
import { ArrowRight, ShoppingCart, ShoppingBag, Star, TrendingUp, Package, Loader2 } from "lucide-react";
import AddToCartModal from "../../features/orders/components/AddToCartModal";
import SystemModal from "../../components/ui/SystemModal";

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userRes = await API.get("/user").catch(() => ({ data: JSON.parse(localStorage.getItem('user')) }));
            setUser(userRes.data);

            const productsRes = await API.get("/products").catch(() => ({ data: [] }));
            const productsData = productsRes.data.data ? productsRes.data.data : productsRes.data;
            setProducts(Array.isArray(productsData) ? productsData : []);
            
        } catch (err) {
            console.error("Error loading home data:", err);
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

    if (loading) {
        return (
            <div className="ud-loading">
                <div className="ud-spinner"></div>
                <p>Loading your experience...</p>
            </div>
        );
    }

    return (
        <div className="ud-home">
            {/* Hero Section */}
            <section className="ud-hero">
                <div className="ud-hero-content">
                    <span className="ud-hero-badge">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}</span>
                    <h1 className="ud-hero-title">Discover the Latest Collections</h1>
                    <p className="ud-hero-subtitle">Explore our premium selection of fashion and accessories curated just for you.</p>
                    <Link to="/user/shop" className="ud-hero-btn">
                        Shop Collection <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* All Products Section */}
            <section className="ud-products-section">
                <div className="ud-section-header">
                    <h2>All Products</h2>
                    <p>Everything we have to offer</p>
                </div>

                {products.length > 0 ? (
                    <div className="ud-products-grid">
                        {products.map(product => (
                            <Link to={`/user/shop/product/${product.id}`} key={product.id} className="ud-product-card">
                                <div className="ud-product-img-wrap">
                                    {product.image ? (
                                        <img src={`/storage/${product.image}`} alt={product.name} loading="lazy" className="ud-product-img" />
                                    ) : (
                                        <div className="ud-no-image">No Image</div>
                                    )}
                                    <button 
                                        className="ud-add-btn"
                                        onClick={(e) => handleAddToCartClick(e, product)}
                                        disabled={product.stock <= 0}
                                    >
                                        <ShoppingBag size={18} /> 
                                        {product.stock > 0 ? "Add" : "Out of Stock"}
                                    </button>
                                </div>
                                <div className="ud-product-info">
                                    {product.category && <span className="ud-cat">{product.category.name}</span>}
                                    <h3 className="ud-product-name">{product.name}</h3>
                                    <p className="ud-desc">{(product.description || "").substring(0, 60)}...</p>
                                    
                                    <div className="ud-meta">
                                        <span className="ud-stock">
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                                        </span>
                                        {product.size_inventory && (
                                            <div className="ud-sizes">
                                                {Object.entries(typeof product.size_inventory === 'string' ? JSON.parse(product.size_inventory) : product.size_inventory)
                                                    .filter(([_, qty]) => Number(qty) > 0)
                                                    .map(([size]) => (
                                                        <span key={size} className="ud-size-pill">{size}</span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ud-product-footer">
                                        <span className="ud-product-price">₱{Number(product.price || 0).toFixed(2)}</span>
                                        {product.stock <= 0 && <span className="ud-out-stock">Out of stock</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="ud-empty-state">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                        <p>No products available right now. Please check back later.</p>
                        <Link to="/user/shop" className="ud-hero-btn" style={{ marginTop: '1rem' }}>
                            Browse Full Catalog
                        </Link>
                    </div>
                )}
            </section>

            {selectedProduct && (
                <AddToCartModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                    onAdd={handleModalAdd} 
                />
            )}

            <SystemModal 
                show={showSuccessModal}
                title="Pop! Added to Cart"
                message={successMessage}
                onConfirm={handleConfirmSuccess}
                onCancel={() => setShowSuccessModal(false)}
                confirmText="View Cart"
                cancelText="Continue"
            />
        </div>
    );
}
