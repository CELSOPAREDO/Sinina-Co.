import React, { useState } from 'react';
import { X, Loader2, Minus, Plus } from 'lucide-react';
import './AddToCartModal.css';

export default function AddToCartModal({ product, onClose, onAdd }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    if (!product) return null;

    // Parse sizes
    let allSizes = [];
    let parsedSizes = {};
    if (product.size_inventory) {
        parsedSizes = typeof product.size_inventory === 'string' ? JSON.parse(product.size_inventory) : product.size_inventory;
        allSizes = Object.keys(parsedSizes);
    }

    const currentStock = selectedSize && parsedSizes[selectedSize] ? Number(parsedSizes[selectedSize]) : product.stock;

    const handleAdd = async () => {
        if (allSizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }

        setAdding(true);
        try {
            await onAdd({ product_id: product.id, quantity, size: selectedSize });
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="atc-modal-overlay" onClick={onClose}>
            <div className="atc-modal" onClick={e => e.stopPropagation()}>
                <button className="atc-close" onClick={onClose}><X size={24} /></button>
                
                <div className="atc-content">
                    <div className="atc-img-wrap">
                        {product.image ? (
                            <img src={`/storage/${product.image}`} alt={product.name} />
                        ) : (
                            <div className="atc-no-img">No Image</div>
                        )}
                    </div>
                    
                    <div className="atc-details">
                        <h2>{product.name}</h2>
                        <p className="atc-price">₱{Number(product.price || 0).toFixed(2)}</p>
                        <p className="atc-description">{product.description}</p>

                        {allSizes.length > 0 && (
                            <div className="atc-sizes-section">
                                <h4>Select Size</h4>
                                <div className="atc-sizes-grid">
                                    {allSizes.map(size => {
                                        const sizeStock = Number(parsedSizes[size] || 0);
                                        const isOutOfStock = sizeStock <= 0;
                                        return (
                                            <button
                                                key={size}
                                                className={`atc-size-btn ${selectedSize === size ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                                onClick={() => {
                                                    if (isOutOfStock) return;
                                                    setSelectedSize(size);
                                                    if (quantity > sizeStock) {
                                                        setQuantity(Math.max(1, sizeStock));
                                                    }
                                                }}
                                                disabled={isOutOfStock}
                                                title={isOutOfStock ? "Out of stock" : `${sizeStock} available`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="atc-qty-section">
                            <h4>Quantity</h4>
                            <div className="atc-qty-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                    <Minus size={16} />
                                </button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= currentStock || (!selectedSize && allSizes.length > 0)}>
                                    <Plus size={16} />
                                </button>
                            </div>
                            <span className="atc-stock-info">
                                {selectedSize ? `${currentStock} available in ${selectedSize}` : `${product.stock} available overall`}
                            </span>
                        </div>

                        <button 
                            className="atc-submit-btn" 
                            onClick={handleAdd} 
                            disabled={adding || (allSizes.length > 0 && !selectedSize) || currentStock <= 0}
                        >
                            {adding ? <Loader2 className="atc-spinner" size={20} /> : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
