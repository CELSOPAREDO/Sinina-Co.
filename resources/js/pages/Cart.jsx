import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { getProductImageUrl } from "../services/imageUrl";
import "./Cart.css";

function Cart() {
    const fallbackImage = "https://placehold.co/100x100?text=No+Image";
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = () => {
        setLoading(true);
        API.get("/cart")
            .then((res) => {
                setCart(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) return;
        API.put(`/cart/item/${itemId}`, { quantity })
            .then((res) => setCart(res.data.cart))
            .catch(() => setMessage("Failed to update quantity."));
    };

    const removeItem = (itemId) => {
        API.delete(`/cart/item/${itemId}`)
            .then((res) => setCart(res.data.cart))
            .catch(() => setMessage("Failed to remove item."));
    };

    const totalPrice =
        cart && cart.items
            ? cart.items.reduce(
                  (sum, item) => sum + item.product.price * item.quantity,
                  0
              )
            : 0;

    if (loading) return <p className="loading-text">Loading cart...</p>;

    return (
        <div className="cart-page">
            <h1>🛒 Your Cart</h1>

            {message && <p className="cart-message">{message}</p>}

            {!cart || !cart.items || cart.items.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <Link to="/products" className="shop-link">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img
                                        src={getProductImageUrl(item.product.image, fallbackImage)}
                                        alt={item.product.name}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = fallbackImage;
                                        }}
                                    />
                                </div>
                                <div className="cart-item-details">
                                    <h3>{item.product.name}</h3>
                                    <p className="cart-item-price">
                                        ₱{Number(item.product.price).toFixed(2)}
                                    </p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity - 1)
                                        }
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(item.id, item.quantity + 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="cart-item-subtotal">
                                    ₱{(item.product.price * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeItem(item.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Total: ₱{totalPrice.toFixed(2)}</h2>
                        <Link to="/checkout" className="checkout-btn">
                            Proceed to Checkout
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
