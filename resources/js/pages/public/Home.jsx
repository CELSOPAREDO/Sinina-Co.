import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../user/UserDashboard.css";
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import AddToCartModal from "../../features/orders/components/AddToCartModal";
import SystemModal from "../../components/ui/SystemModal";
import { getProductImageUrl } from "../../services/imageUrl";

export default function Home() {
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
        const isLoggedIn = !!localStorage.getItem("token");
        
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            await API.post("/cart/add", payload);
            window.dispatchEvent(new Event('cartUpdated'));
            setSuccessMessage(`Added to cart successfully!`);
            setShowSuccessModal(true);
            setSelectedProduct(null);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                alert("Failed to add to cart. Please try again.");
            }
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="ud-loading">
                <div className="ud-spinner"></div>
                <p>Bringing you the best of Sinina Co...</p>
            </div>
        );
    }

    return (
        <div className="ud-home" style={{ padding: '0 2rem 4rem' }}>
            {/* Hero Section */}
            <section className="ud-hero">
                <div className="ud-hero-content">
                    <span className="ud-hero-badge">Curated Fashion</span>
                    <h1 className="ud-hero-title">Discover the Latest Collections</h1>
                    <p className="ud-hero-subtitle">Explore our premium selection of fashion and accessories curated just for you.</p>
                    <Link to="/products" className="ud-hero-btn">
                        Shop Collection <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* All Products Section */}
            <section className="ud-products-section">
                <div className="ud-section-header">
                    <h2>Our Products</h2>
                    <p>Quality locally-made pieces for your everyday style</p>
                </div>

                {products.length > 0 ? (
                    <div className="ud-products-grid">
                        {products.map(product => (
                            <Link to={`/product/${product.id}`} key={product.id} className="ud-product-card">
                                <div className="ud-product-img-wrap">
                                    {product.image ? (
                                        <>
                                            <img 
                                                src={getProductImageUrl(product.image)} 
                                                alt={product.name} 
                                                decoding="async" 
                                                className="ud-product-img"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    if (e.currentTarget.nextSibling) {
                                                        e.currentTarget.nextSibling.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div className="ud-no-image" style={{ display: 'none' }}>No Image</div>
                                        </>
                                    ) : (
                                        <div className="ud-no-image">No Image</div>
                                    )}
                                    <button 
                                        className="ud-add-btn"
                                        onClick={(e) => handleAddToCartClick(e, product)}
                                        disabled={product.stock <= 0}
                                    >
                                        <ShoppingBag size={18} /> 
                                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
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
                        <p>Our catalog is currently being refreshed. Please check back shortly!</p>
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

