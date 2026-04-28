import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import "./UserCheckout.css";
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, Truck, Loader2 } from "lucide-react";
import SystemModal from "../../components/ui/SystemModal";
import { createPortal } from "react-dom";

export default function UserCheckout() {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedItemIds = location.state?.selectedItems || [];
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [receiptName, setReceiptName] = useState("");
    const [settings, setSettings] = useState({});

    // Form states
    const [formData, setFormData] = useState({
        recipient_name: "",
        recipient_phone: "",
        address: "",
        paymentMethod: "cod"
    });

    useEffect(() => {
        API.get("/cart")
            .then((res) => {
                const allItems = res.data.items || [];
                // If specific items were selected, filter them
                if (selectedItemIds.length > 0) {
                    setCart({
                        ...res.data,
                        items: allItems.filter(item => selectedItemIds.includes(item.id))
                    });
                } else {
                    setCart(res.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch addresses
        API.get("/settings").then(res => setSettings(res.data)).catch(console.error);

        API.get("/addresses")
            .then(res => {
                setAddresses(res.data);
                // Pre-fill with default address
                const defaultAddr = res.data.find(a => a.is_default);
                if (defaultAddr) {
                    setFormData(prev => ({
                        ...prev,
                        address: defaultAddr.address,
                        recipient_name: defaultAddr.recipient_name,
                        recipient_phone: defaultAddr.recipient_phone
                    }));
                }
            })
            .catch(err => console.error("Error fetching addresses", err));
    }, []);

    const subtotal = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
    const shipping = subtotal >= 2000 ? 0 : 50;
    const total = subtotal + shipping;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceipt(file);
            setReceiptName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address || !formData.recipient_name || !formData.recipient_phone) {
            setError("Please fill in all shipping and contact details.");
            return;
        }

        if (formData.paymentMethod === 'gcash' && !receipt) {
            setError("Please upload your GCash payment receipt.");
            return;
        }

        setProcessing(true);
        setError("");
        
        try {
            // In this app, the backend checkout endpoint handles the entire cart.
            // For selective checkout, we might need a modified backend, 
            // but for now we'll proceed with the standard checkout logic 
            // and assume it clears the cart (or the specific items if supported).
            // Use FormData for file upload
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            selectedItemIds.forEach(id => data.append('selected_items[]', id));
            if (receipt) data.append('receipt', receipt);

            await API.post("/checkout", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Dispatch cart update event
            window.dispatchEvent(new Event('cartUpdated'));
            setShowSuccessModal(true);
        } catch (err) {
            setError(err.response?.data?.message || "Checkout failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate('/user/orders');
    };

    const handleSelectAddress = (addr) => {
        setFormData(prev => ({
            ...prev,
            address: addr.address,
            recipient_name: addr.recipient_name,
            recipient_phone: addr.recipient_phone
        }));
        setShowAddressModal(false);
    };

    if (loading) {
        return (
            <div className="uch-loading">
                <Loader2 size={32} className="uch-spinner" />
                <p>Preparing your checkout...</p>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="uch-empty">
                <h2>No items to checkout</h2>
                <Link to="/user/cart" className="uch-back-btn">Return to Cart</Link>
            </div>
        );
    }

    return (
        <div className="uch-container">
            <header className="uch-header">
                <button onClick={() => navigate(-1)} className="uch-back-link">
                    <ArrowLeft size={18} /> Back to Bag
                </button>
                <h1>Checkout</h1>
            </header>

            <form className="uch-layout" onSubmit={handleSubmit}>
                {/* Left Column: Shipping & Payment */}
                <div className="uch-main-col">
                    <section className="uch-section">
                        <div className="uch-section-title">
                            <div className="uch-title-left">
                                <MapPin size={20} />
                                <h2>Shipping Address</h2>
                            </div>
                            {addresses.length > 0 && (
                                <button type="button" className="uch-change-btn" onClick={() => setShowAddressModal(true)}>
                                    Change
                                </button>
                            )}
                        </div>
                        <div className="uch-form-grid">
                            <div className="uch-form-group full">
                                <label>Recipient Name</label>
                                <input 
                                    type="text" 
                                    name="recipient_name"
                                    placeholder="Full Name"
                                    value={formData.recipient_name || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="uch-form-group full">
                                <label>Contact Number</label>
                                <input 
                                    type="text" 
                                    name="recipient_phone"
                                    placeholder="Phone Number"
                                    value={formData.recipient_phone || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="uch-form-group full">
                                <label>Full Address</label>
                                <textarea 
                                    name="address"
                                    placeholder="House No., Street Name, Barangay"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="uch-section">
                        <div className="uch-section-title">
                            <CreditCard size={20} />
                            <h2>Payment Method</h2>
                        </div>
                        <div className="uch-payment-options">
                            <label className={`uch-pay-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="cod" 
                                    checked={formData.paymentMethod === 'cod'}
                                    onChange={handleInputChange}
                                />
                                <span className="uch-pay-label">Cash on Delivery</span>
                                <span className="uch-pay-desc">Pay when you receive the package</span>
                            </label>
                             <label className={`uch-pay-card ${formData.paymentMethod === 'gcash' ? 'active' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="gcash"
                                    checked={formData.paymentMethod === 'gcash'}
                                    onChange={handleInputChange}
                                />
                                <span className="uch-pay-label">GCash</span>
                                <span className="uch-pay-desc">Pay via GCash QR or Number</span>
                            </label>
                        </div>

                        {formData.paymentMethod === 'gcash' && (
                            <div className="uch-gcash-section">
                                <div className="uch-gcash-info">
                                    <div className="uch-qr-wrap">
                                        <img src={settings.gcash_qr ? `/storage/${settings.gcash_qr.replace(/^storage\//, '')}` : "/images/gcash_qr.png"} alt="GCash QR Code" />
                                    </div>
                                    <div className="uch-gcash-text">
                                        <p>GCash Number</p>
                                        <h3>{settings.gcash_number || "09092039693"}</h3>
                                        <small>Please upload proof of payment for GCash transactions</small>
                                    </div>
                                </div>
                                <div className="uch-upload-box">
                                    <label htmlFor="receipt-upload" className="uch-upload-label">
                                        <ShieldCheck size={20} />
                                        {receiptName ? receiptName : "Upload Receipt (JPG, PNG)"}
                                        <input 
                                            id="receipt-upload"
                                            type="file" 
                                            accept="image/png, image/jpeg" 
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="uch-side-col">
                    <div className="uch-summary-card">
                        <h3>Order Summary</h3>
                        
                        <div className="uch-items-preview">
                            {cart.items.map(item => (
                                <div key={item.id} className="uch-preview-item">
                                    <div className="uch-preview-img">
                                        <img src={`/storage/${item.product.image}`} alt={item.product.name} />
                                    </div>
                                    <div className="uch-preview-info">
                                        <p className="uch-preview-name">{item.product.name}</p>
                                        <p className="uch-preview-meta">Qty: {item.quantity} • {item.size}</p>
                                        <p className="uch-preview-price">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="uch-summary-lines">
                            <div className="uch-line">
                                <span>Subtotal</span>
                                <span>₱{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="uch-line">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? <strong style={{color: '#10b981'}}>FREE</strong> : `₱${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="uch-line-total">
                                <span>Total</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {error && <div className="uch-error-msg">{error}</div>}

                        <button 
                            type="submit" 
                            className={`uch-place-order-btn ${formData.paymentMethod === 'gcash' && !receipt ? 'disabled' : ''}`}
                            disabled={processing || (formData.paymentMethod === 'gcash' && !receipt)}
                        >
                            {processing ? <Loader2 className="uch-spin" /> : <ShieldCheck size={20} />}
                            {processing ? "Processing..." : (formData.paymentMethod === 'gcash' && !receipt ? "Upload Receipt" : "Place Order Now")}
                        </button>

                        <div className="uch-trust-badges">
                            <Truck size={14} /> Free delivery on orders over ₱2000
                        </div>
                    </div>
                </div>
            </form>

            <SystemModal 
                show={showSuccessModal}
                title="Order Confirmed!"
                message="Thank you for your purchase! Your order has been placed successfully."
                onConfirm={handleSuccessClose}
                confirmText="View My Orders"
                type="alert"
            />

            {/* Address Selection Modal */}
            {showAddressModal && createPortal(
                <div className="uo-modal-overlay">
                    <div className="uch-addr-modal">
                        <div className="uch-addr-modal-header">
                            <h3>Select Shipping Address</h3>
                            <button type="button" onClick={() => setShowAddressModal(false)}>✕</button>
                        </div>
                        <div className="uch-addr-modal-body">
                            {addresses.map(addr => (
                                <div 
                                    key={addr.id} 
                                    className={`uch-addr-card ${formData.address === addr.address ? 'active' : ''}`}
                                    onClick={() => handleSelectAddress(addr)}
                                >
                                    <div className="uch-addr-card-top">
                                        <span className="uch-addr-label">{addr.label}</span>
                                        {addr.is_default && <span className="uch-default-pill">Default</span>}
                                    </div>
                                    <div className="uch-addr-card-contact">
                                        <strong>{addr.recipient_name}</strong> • {addr.recipient_phone}
                                    </div>
                                    <p className="uch-addr-card-text">{addr.address}</p>
                                </div>
                            ))}
                        </div>
                        <div className="uch-addr-modal-footer">
                            <Link to="/user/settings" className="uch-manage-link">Manage Addresses in Settings</Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
