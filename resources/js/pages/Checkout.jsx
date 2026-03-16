import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Checkout.css";

function Checkout() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        API.get("/cart")
            .then((res) => {
                setCart(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const totalPrice =
        cart && cart.items
            ? cart.items.reduce(
                  (sum, item) => sum + item.product.price * item.quantity,
                  0
              )
            : 0;

    const handleCheckout = () => {
        setProcessing(true);
        setError("");
        API.post("/checkout")
            .then(() => {
                navigate("/profile");
            })
            .catch((err) => {
                setError(
                    err.response?.data?.message || "Checkout failed. Please try again."
                );
                setProcessing(false);
            });
    };

    if (loading) return <p className="loading-text">Loading...</p>;

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Checkout</h1>
                <p className="empty-text">Your cart is empty. Add products first.</p>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            {error && <p className="checkout-error">{error}</p>}

            <div className="checkout-items">
                {cart.items.map((item) => (
                    <div key={item.id} className="checkout-item">
                        <span className="checkout-item-name">
                            {item.product.name} × {item.quantity}
                        </span>
                        <span className="checkout-item-price">
                            ₱{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="checkout-total">
                <h2>Total: ₱{totalPrice.toFixed(2)}</h2>
            </div>

            <button
                className="place-order-btn"
                onClick={handleCheckout}
                disabled={processing}
            >
                {processing ? "Placing Order..." : "Place Order"}
            </button>
        </div>
    );
}

export default Checkout;
