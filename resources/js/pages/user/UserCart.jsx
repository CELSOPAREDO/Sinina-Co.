import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./UserCart.css";
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, Check } from "lucide-react";

export default function UserCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await API.get("/cart");
            setCartItems(res.data.items || []);
        } catch (err) {
            console.error("Error loading cart:", err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }
        setUpdating(itemId);
        try {
            await API.put(`/cart/item/${itemId}`, { quantity });
            loadCart();
        } catch (err) {
            console.error("Error updating quantity:", err);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await API.delete(`/cart/item/${itemId}`);
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const handleCheckoutSelected = () => {
        if (selectedItems.length === 0) return;
        navigate('/user/cart/checkout', { state: { selectedItems } });
    };

    const handleIndividualCheckout = (itemId) => {
        navigate('/user/cart/checkout', { state: { selectedItems: [itemId] } });
    };

    if (loading) {
        return (
            <div className="uc-loading">
                <div className="uc-spinner"></div>
                <p>Loading your bag...</p>
            </div>
        );
    }

    return (
        <div className="uc-container">
            <header className="uc-header">
                <div className="uc-header-top">
                    <div className="uc-title-group">
                        <h1>Shopping Bag</h1>
                        <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="uc-header-actions">
                        <button className="uc-select-all-btn" onClick={toggleSelectAll}>
                            {selectedItems.length === cartItems.length && cartItems.length > 0 ? "Deselect All" : "Select All"}
                        </button>
                        {selectedItems.length > 0 && (
                            <button className="uc-bulk-checkout fade-in" onClick={handleCheckoutSelected}>
                                Checkout Selected ({selectedItems.length}) <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {cartItems.length > 0 ? (
                <div className="uc-items-list">
                    {cartItems.map(item => (
                        <div key={item.id} className={`uc-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
                            {/* Checkbox */}
                            <div className="uc-checkbox-wrap" onClick={() => toggleSelectItem(item.id)}>
                                <div className={`uc-checkbox ${selectedItems.includes(item.id) ? 'active' : ''}`}>
                                    {selectedItems.includes(item.id) && <Check size={14} />}
                                </div>
                            </div>

                            {/* Product Image */}
                            <Link to={`/user/shop/product/${item.product?.id}`} className="uc-item-img-wrap">
                                {item.product?.image ? (
                                    <img src={`/storage/${item.product.image}`} alt={item.product?.name} />
                                ) : (
                                    <div className="uc-no-img">No Image</div>
                                )}
                            </Link>

                            {/* Product Details */}
                            <div className="uc-item-details">
                                <div className="uc-item-main-info">
                                    <div className="uc-info-left">
                                        <h3><Link to={`/user/shop/product/${item.product?.id}`}>{item.product?.name || 'Unnamed Item'}</Link></h3>
                                        <p className="uc-item-cat">
                                            {item.product?.category?.name || 'Standard Edition'}
                                            {item.size && ` • Size: ${item.size}`}
                                        </p>
                                    </div>
                                    <div className="uc-info-right">
                                        <span className="uc-item-price">₱{Number(item.product?.price || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="uc-item-bottom">
                                    <div className="uc-item-actions-left">
                                        <div className="uc-qty-control">
                                            <button 
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                disabled={updating === item.id}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                disabled={updating === item.id}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button 
                                            className="uc-remove-btn"
                                            onClick={() => removeItem(item.id)}
                                            disabled={updating === item.id}
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>

                                    <button className="uc-item-checkout-btn" onClick={() => handleIndividualCheckout(item.id)}>
                                        Checkout Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="uc-empty">
                    <ShoppingBag size={48} className="uc-empty-icon" />
                    <h2>Your bag is empty</h2>
                    <p>Looks like you haven't added anything to your bag yet.</p>
                    <Link to="/user/shop" className="uc-btn-shop">
                        Continue Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
