import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ show, message, type = 'success', onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className={`toast-bubble-container ${show ? 'show' : ''}`}>
            <div className={`toast-bubble ${type}`}>
                <span className="toast-icon">{type === 'success' ? '✓' : 'ℹ'}</span>
                <p className="toast-message">{message}</p>
            </div>
        </div>
    );
};

export default Toast;
