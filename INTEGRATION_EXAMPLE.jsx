// Quick Integration Guide for Your Project

// ============================================
// EXAMPLE: Using ProductImageUpload in a Form
// ============================================

import React, { useState } from "react";
import API from "../services/api";
import ProductImageUpload from "../components/ProductImageUpload";

function CreateProductForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category_id: "",
        price: "",
        stock: "",
        size: "",
        color: "",
    });

    const [croppedImage, setCroppedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageSelected = (blob) => {
        // blob is the cropped image ready to upload
        setCroppedImage(blob);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const form = new FormData();

            // Add all form fields
            Object.keys(formData).forEach((key) => {
                if (formData[key]) {
                    form.append(key, formData[key]);
                }
            });

            // Add cropped image
            if (croppedImage) {
                form.append("image", croppedImage, "product.jpg");
            }

            const response = await API.post("/products", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("Product created successfully!");
            setFormData({
                name: "",
                description: "",
                category_id: "",
                price: "",
                stock: "",
                size: "",
                color: "",
            });
            setCroppedImage(null);

            // Redirect after success
            setTimeout(() => {
                window.location.href = "/seller/dashboard";
            }, 1000);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Failed to create product"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h1>Create Product</h1>

            {message && <div className="alert">{message}</div>}

            {/* Product Image Upload */}
            <div className="form-section">
                <label htmlFor="image">Product Image</label>
                <ProductImageUpload
                    onImageSelect={handleImageSelected}
                    currentImage={null}
                />
            </div>

            {/* Product Name */}
            <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                />
            </div>

            {/* Description */}
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="4"
                />
            </div>

            {/* Category */}
            <div className="form-group">
                <label htmlFor="category_id">Category *</label>
                <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select a category</option>
                    <option value="1">Watches</option>
                    <option value="2">Footwear</option>
                    <option value="3">Apparel</option>
                </select>
            </div>

            {/* Price */}
            <div className="form-group">
                <label htmlFor="price">Price (₱) *</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    step="0.01"
                />
            </div>

            {/* Stock */}
            <div className="form-group">
                <label htmlFor="stock">Stock *</label>
                <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                />
            </div>

            {/* Size */}
            <div className="form-group">
                <label htmlFor="size">Size</label>
                <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., Medium, 10"
                />
            </div>

            {/* Color */}
            <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Red, Blue"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !croppedImage}
                className="btn-submit"
            >
                {loading ? "Creating..." : "Create Product"}
            </button>
        </form>
    );
}

export default CreateProductForm;

// ============================================
// STYLING
// ============================================

/*
.product-form {
    max-width: 600px;
    margin: 40px auto;
    padding: 30px;
    background: var(--surface);
    border-radius: 14px;
    border: 1px solid var(--border);
}

.product-form h1 {
    margin-top: 0;
    margin-bottom: 30px;
}

.form-section {
    margin-bottom: 30px;
}

.form-section label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.95rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--rust);
    box-shadow: 0 0 0 3px rgba(184, 76, 46, 0.1);
}

.alert {
    padding: 12px 16px;
    background: #d1e8df;
    color: #0f4a2a;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid var(--rust);
}

.btn-submit {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--rust) 0%, var(--rust-dk) 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(184, 76, 46, 0.25);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
*/
