import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { getProductImageUrl } from "../services/imageUrl";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        API.get(`/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                setReviews(res.data.reviews || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            setMessage("Please login to add items to your cart.");
            return;
        }
        API.post("/cart/add", { product_id: product.id, quantity: 1 })
            .then(() => setMessage("Added to cart!"))
            .catch(() => setMessage("Failed to add to cart."));
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        API.post(`/products/${id}/reviews`, { rating, comment })
            .then((res) => {
                setReviews([res.data.review, ...reviews]);
                setComment("");
                setRating(5);
            })
            .catch(() => setMessage("Failed to submit review."));
    };

    if (loading) return <p className="loading-text">Loading...</p>;
    if (!product) return <p className="empty-text">Product not found.</p>;

    const fallbackImage = "https://placehold.co/500x500?text=No+Image";
    const imageUrl = getProductImageUrl(product.image, fallbackImage);

    return (
        <div className="product-details">
            <div className="product-details-top">
                
                <div className="product-details-image">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImage;
                        }}
                    />
                </div>

                
                <div className="product-details-info">
                    <h1>{product.name}</h1>
                    <p className="product-details-category">
                        {product.category ? product.category.name : "Uncategorized"}
                    </p>
                    <p className="product-details-price">
                        ₱{Number(product.price).toFixed(2)}
                    </p>
                    <p className="product-details-stock">
                        {product.stock > 0
                            ? `In Stock (${product.stock})`
                            : "Out of Stock"}
                    </p>
                    {product.size && <p><strong>Size:</strong> {product.size}</p>}
                    {product.color && <p><strong>Color:</strong> {product.color}</p>}
                    <p className="product-details-desc">
                        {product.description || "No description available."}
                    </p>
                    <p className="product-details-seller">
                        Sold by: {product.seller ? product.seller.name : "Unknown"}
                    </p>

                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        🛒 Add to Cart
                    </button>

                    {message && <p className="details-message">{message}</p>}
                </div>
            </div>

            
            <div className="reviews-section">
                <h2>Customer Reviews ({reviews.length})</h2>

                
                {isLoggedIn && (
                    <form className="review-form" onSubmit={handleReviewSubmit}>
                        <label>
                            Rating:
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                            >
                                {[5, 4, 3, 2, 1].map((r) => (
                                    <option key={r} value={r}>
                                        {"★".repeat(r)}{"☆".repeat(5 - r)} ({r})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <textarea
                            placeholder="Write your review..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                        <button type="submit">Submit Review</button>
                    </form>
                )}

                
                {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first!</p>
                ) : (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <strong>{review.user ? review.user.name : "User"}</strong>
                                    <span className="review-stars">
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(5 - review.rating)}
                                    </span>
                                </div>
                                <p>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetails;
