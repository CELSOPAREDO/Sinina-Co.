import React from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../services/imageUrl";
import "./ProductCard.css";

function ProductCard({ product }) {
    const fallbackImage = "https://placehold.co/300x400?text=No+Image";
    const imageUrl = getProductImageUrl(product.image, fallbackImage);

    const formattedPrice = Number(product.price).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <Link to={`/product/${product.id}`} className="product-card">
            <div className="product-card-image">
                <img
                    src={imageUrl}
                    alt={product.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                    }}
                />
            </div>
            <div className="product-card-body">
                <h3 className="product-card-title">{product.name}</h3>
                <p className="product-card-price">&#x20B1;{formattedPrice}</p>
            </div>
        </Link>
    );
}

export default ProductCard;
