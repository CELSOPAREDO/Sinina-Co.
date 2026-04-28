import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, AlertCircle, CheckSquare, Square } from "lucide-react";
import "./CancelOrderModal.css";

const REASONS = [
    "Changed mind",
    "Ordered by mistake",
    "Wrong details",
    "No longer needed",
    "Payment issue",
    "Others"
];

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId }) => {
    const [step, setStep] = useState(1);
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [otherReason, setOtherReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setSelectedReasons([]);
            setOtherReason("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Prevent background scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleReason = (reason) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(prev => prev.filter(r => r !== reason));
        } else {
            setSelectedReasons(prev => [...prev, reason]);
        }
    };

    const handleConfirmStep2 = async () => {
        setIsSubmitting(true);
        const reasonData = {
            reasons: selectedReasons,
            other: selectedReasons.includes("Others") ? otherReason : ""
        };
        await onConfirm(orderId, reasonData);
        setIsSubmitting(false);
    };

    return createPortal(
        <div className="com-overlay" onClick={onClose}>
            <div className="com-modal" onClick={e => e.stopPropagation()}>
                <button className="com-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                {step === 1 ? (
                    <div className="com-step step-1 fade-in">
                        <div className="com-icon-wrap">
                            <AlertCircle size={40} strokeWidth={1.5} color="#ef4444" />
                        </div>
                        <h2 className="com-title">Are you sure you want to cancel this order?</h2>
                        <p className="com-desc">Order #{String(orderId).padStart(8, '0')}</p>
                        
                        <div className="com-actions">
                            <button className="com-btn com-btn-secondary" onClick={onClose}>
                                No, keep order
                            </button>
                            <button className="com-btn com-btn-danger" onClick={() => setStep(2)}>
                                Yes, cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="com-step step-2 fade-in">
                        <div className="com-header">
                            <button className="com-back-btn" onClick={() => setStep(1)}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h2 className="com-title-s2">Select reason(s) for cancellation</h2>
                        </div>

                        <div className="com-reasons-grid">
                            {REASONS.map(reason => (
                                <button 
                                    key={reason} 
                                    className={`com-reason-item ${selectedReasons.includes(reason) ? 'active' : ''}`}
                                    onClick={() => toggleReason(reason)}
                                >
                                    {selectedReasons.includes(reason) ? <CheckSquare size={18} /> : <Square size={18} />}
                                    <span>{reason}</span>
                                </button>
                            ))}
                        </div>

                        {selectedReasons.includes("Others") && (
                            <textarea 
                                className="com-textarea fade-in"
                                placeholder="Please specify your reason..."
                                value={otherReason}
                                onChange={e => setOtherReason(e.target.value)}
                            />
                        )}

                        <button 
                            className="com-btn com-btn-danger-full" 
                            disabled={selectedReasons.length === 0 || isSubmitting}
                            onClick={handleConfirmStep2}
                        >
                            {isSubmitting ? "Processing..." : "Confirm Cancellation"}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default CancelOrderModal;
