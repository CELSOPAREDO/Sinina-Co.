import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { getProductImageUrl } from "../../services/imageUrl";
import { ArrowLeft, Star, ShoppingBag, Loader2, Minus, Plus, CheckCircle } from "lucide-react";
import SystemModal from "../../components/ui/SystemModal";
import "./ProductDetails.css";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // Purchase Selection state
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Reviews state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    
    // Success Modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        API.get(`/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                setReviews(res.data.reviews || []);
            })
            .catch(() => {
                // handle error
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = async () => {
        if (availableSizes.length > 0 && !selectedSize) {
            alert("Please select a size");
            return;
        }

        setAddingToCart(true);
        try {
            await API.post("/cart/add", {
                product_id: product.id,
                quantity: quantity,
                size: selectedSize
            });
            window.dispatchEvent(new Event('cartUpdated'));
            setShowSuccessModal(true);
        } catch (err) {
            alert("Failed to add to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleContinueShopping = () => {
        setShowSuccessModal(false);
        navigate('/user/shop');
    };

    const handleViewCart = () => {
        setShowSuccessModal(false);
        navigate('/user/cart');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await API.post(`/products/${id}/reviews`, { rating, comment });
            setReviews([res.data.review, ...reviews]);
            setComment("");
            setRating(5);
        } catch (err) {
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="pd-loading">
                <Loader2 size={32} className="pd-spinner" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pd-empty">
                <h2>Product not found.</h2>
                <button className="pd-back-btn" onClick={() => navigate('/user/shop')}>Return to Shop</button>
            </div>
        );
    }

    const fallbackImage = "https://placehold.co/500x500?text=No+Image";
    const imagePath = product.image ? `${product.image}?t=${new Date(product.updated_at).getTime()}` : null;
    const imageUrl = getProductImageUrl(imagePath, fallbackImage);

    // Parse sizes
    let availableSizes = [];
    let parsedSizes = {};
    if (product.size_inventory) {
        parsedSizes = typeof product.size_inventory === 'string' ? JSON.parse(product.size_inventory) : product.size_inventory;
        availableSizes = Object.entries(parsedSizes).filter(([_, qty]) => Number(qty) > 0).map(([size]) => size);
    }

    const currentStock = selectedSize && parsedSizes[selectedSize] ? Number(parsedSizes[selectedSize]) : product.stock;

    return (
        <div className="pd-container fade-in">
            <button className="pd-back-link" onClick={() => navigate('/user/shop')}>
                <ArrowLeft size={16} /> Back to Products
            </button>

            <div className="pd-main">
                {/* Image Section */}
                <div className="pd-image-col">
                    <div className="pd-image-wrapper">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbackImage;
                            }}
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="pd-info-col">
                    <span className="pd-category">{product.category ? product.category.name : "Apparel"}</span>
                    <h1 className="pd-title">{product.name}</h1>
                    <p className="pd-price">₱{Number(product.price).toFixed(2)}</p>

                    <p className="pd-desc">
                        {product.description || "Premium quality material. Perfect for everyday wear."}
                    </p>

                    <div className="pd-selection-area">
                        {/* Sizes */}
                        {availableSizes.length > 0 && (
                            <div className="pd-select-group">
                                <label className="pd-label">Select Size</label>
                                <div className="pd-sizes-grid">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            className={`pd-size-btn ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedSize(size);
                                                const maxForSize = parsedSizes[size] ? Number(parsedSizes[size]) : 0;
                                                if (quantity > maxForSize) {
                                                    setQuantity(Math.max(1, maxForSize));
                                                }
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="pd-select-group">
                            <label className="pd-label">Quantity</label>
                            <div className="pd-qty-wrapper">
                                <div className="pd-qty-controls">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                        <Minus size={16} />
                                    </button>
                                    <span className="pd-qty-val">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= currentStock || (!selectedSize && availableSizes.length > 0)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="pd-stock-info">
                                    {selectedSize ? `${currentStock} available in ${selectedSize}` : `${product.stock} available overall`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="pd-add-cart-btn" 
                        onClick={handleAddToCart}
                        disabled={addingToCart || (availableSizes.length > 0 && !selectedSize) || currentStock <= 0}
                    >
                        {addingToCart ? <Loader2 size={20} className="pd-spinner" /> : <ShoppingBag size={20} />}
                        {product.stock > 0 ? "Add to Cart" : "Sold Out"}
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="pd-reviews-section">
                <div className="pd-reviews-header">
                    <h2>Customer Reviews</h2>
                    <span className="pd-review-count">{reviews.length} reviews</span>
                </div>

                <div className="pd-reviews-content">
                    <div className="pd-review-form-wrap">
                        <h3>Write a Review</h3>
                        <form className="pd-review-form" onSubmit={handleReviewSubmit}>
                            <div className="pd-form-group">
                                <label>Rating</label>
                                <div className="pd-star-select">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            type="button" 
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            className={`pd-star-btn ${rating >= star ? 'active' : ''}`}
                                        >
                                            <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pd-form-group">
                                <label>Your Comment</label>
                                <textarea
                                    placeholder="What did you like about this product?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    rows={4}
                                />
                            </div>
                            <button type="submit" className="pd-submit-review" disabled={submittingReview}>
                                {submittingReview ? <Loader2 size={16} className="pd-spinner" /> : "Post Review"}
                            </button>
                        </form>
                    </div>

                    <div className="pd-reviews-list">
                        {reviews.length === 0 ? (
                            <div className="pd-no-reviews">
                                <Star size={32} />
                                <p>No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="pd-review-card">
                                    <div className="pd-review-card-header">
                                        <div className="pd-reviewer-avatar">
                                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="pd-reviewer-info">
                                            <strong>{review.user ? review.user.name : "Anonymous User"}</strong>
                                            <div className="pd-review-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? '#0f172a' : 'none'} stroke={i < review.rating ? '#0f172a' : '#cbd5e1'} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="pd-review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="pd-review-text">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <SystemModal 
                show={showSuccessModal}
                title="Added to Cart!"
                message={`${product.name} (${selectedSize}) has been added to your cart.`}
                onConfirm={handleViewCart}
                onCancel={handleContinueShopping}
                confirmText="View Cart"
                cancelText="Continue"
            />
        </div>
    );
}
