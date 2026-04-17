import React, { useState } from "react";
import ImageCropper from "./ImageCropper";
import {
    handleImageUpload,
    blobToBase64,
    validateImageDimensions,
} from "../utils/imageUpload";
import "./ProductImageUpload.css";

function ProductImageUpload({ onImageSelect, currentImage }) {
    const [imagePreview, setImagePreview] = useState(currentImage || null);
    const [showCropper, setShowCropper] = useState(false);
    const [croppingImage, setCroppingImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setLoading(true);

        try {
            // Validate image dimensions
            await validateImageDimensions(file);

            // Convert to base64
            const base64 = await handleImageUpload(file);
            setCroppingImage(base64);
            setShowCropper(true);
        } catch (err) {
            setError(err.message || "Failed to load image");
        } finally {
            setLoading(false);
        }
    };

    const handleCropComplete = async (croppedBlob) => {
        try {
            // Convert cropped blob to base64
            const base64 = await blobToBase64(croppedBlob);
            setImagePreview(base64);
            onImageSelect(croppedBlob); // Pass blob to parent
            setShowCropper(false);
            setCroppingImage(null);
            setError("");
        } catch (err) {
            setError("Failed to crop image");
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        onImageSelect(null);
        setError("");
    };

    return (
        <div className="product-image-upload">
            {error && <div className="error-message">{error}</div>}

            <div className="upload-area">
                {imagePreview ? (
                    <div className="image-preview-section">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <div className="preview-overlay">
                            <button
                                className="btn-change"
                                onClick={() => document.getElementById("file-input").click()}
                                disabled={loading}
                            >
                                Change Image
                            </button>
                            <button
                                className="btn-remove"
                                onClick={handleRemoveImage}
                                disabled={loading}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="upload-box">
                        <div className="upload-content">
                            <div className="upload-icon">📸</div>
                            <p className="upload-title">Click to upload product image</p>
                            <p className="upload-hint">
                                PNG, JPG, GIF up to 5MB (min. 200x200px)
                            </p>
                        </div>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={loading}
                            style={{ display: "none" }}
                        />
                    </label>
                )}
            </div>

            <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={loading}
                style={{ display: "none" }}
            />

            {showCropper && (
                <ImageCropper
                    image={croppingImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setCroppingImage(null);
                    }}
                />
            )}
        </div>
    );
}

export default ProductImageUpload;
