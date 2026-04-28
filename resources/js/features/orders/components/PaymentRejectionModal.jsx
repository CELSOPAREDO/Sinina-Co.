import React, { useState } from "react";
import { X, AlertTriangle, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import API from "../../../services/api";

const PaymentRejectionModal = ({ isOpen, order, onClose, onUpdate }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !order) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a new receipt image first.");
            return;
        }

        setIsUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const res = await API.post(`/orders/${order.id}/update-receipt`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onUpdate(order.id, res.data.order);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload receipt. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return createPortal(
        <div className="uo-modal-overlay" onClick={onClose}>
                <div className="uo-modal bubble-effect rejection-modal-v2" onClick={e => e.stopPropagation()}>
                    <div className="uo-modal-header">
                        <div className="uo-modal-icon rejected">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="uo-modal-title">Payment Issue</h3>
                            <p className="uo-modal-sub">Update your payment details to proceed.</p>
                        </div>
                        <button className="uo-modal-close" onClick={onClose}><X size={18} /></button>
                    </div>

                    <div className="rejection-modal-body">
                        <div className="rejection-reason-box">
                            <span className="reason-label">REASON FOR REJECTION:</span>
                            <p className="reason-text">{order.rejection_reason || "Invalid receipt or incomplete payment details."}</p>
                        </div>

                        <div className="instruction-box">
                            <p>Your previous payment was rejected. To continue with your order, please upload a valid GCash receipt showing the correct amount.</p>
                        </div>

                        <div className="receipt-upload-area">
                            <label className={`upload-dropzone ${preview ? 'has-preview' : ''}`}>
                                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                {!preview ? (
                                    <>
                                        <UploadCloud size={32} className="upload-icon" />
                                        <span>Click to upload new receipt</span>
                                        <p>JPG, PNG or WEBP (Max 2MB)</p>
                                    </>
                                ) : (
                                    <img src={preview} alt="Receipt preview" className="receipt-preview-img" />
                                )}
                            </label>
                            {preview && (
                                <button className="change-file-btn" onClick={() => { setFile(null); setPreview(null); }}>
                                    <X size={14} /> Change Image
                                </button>
                            )}
                        </div>

                        {error && <p className="rejection-error-text">{error}</p>}
                    </div>

                    <div className="rejection-modal-footer">
                        <button className="btn-secondary" onClick={onClose} disabled={isUploading}>
                            Cancel
                        </button>
                        <button 
                            className="btn-primary upload-btn" 
                            onClick={handleUpload} 
                            disabled={!file || isUploading}
                        >
                            {isUploading ? (
                                <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                            ) : (
                                <><CheckCircle2 size={16} /> Upload New Receipt</>
                            )}
                        </button>
                    </div>
                </div>
        </div>,
        document.body
    );
};

export default PaymentRejectionModal;
