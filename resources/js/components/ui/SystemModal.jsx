import React from 'react';
import { createPortal } from 'react-dom';
import './SystemModal.css';

const SystemModal = ({ show, title, message, onConfirm, onCancel, type = 'confirm', confirmText, cancelText }) => {
    if (!show) return null;

    return createPortal(
        <div className="system-modal-overlay">
            <div className="system-modal-bubble">
                <div className="system-modal-content">
                    {title && <h3 className="system-modal-title">{title}</h3>}
                    <p className="system-modal-message">{message}</p>
                </div>
                <div className="system-modal-actions">
                    {type === 'confirm' && (
                        <button className="btn-system-secondary" onClick={onCancel}>
                            {cancelText || 'Cancel'}
                        </button>
                    )}
                    <button className="btn-system-primary" onClick={onConfirm}>
                        {confirmText || (type === 'confirm' ? 'Confirm' : 'OK')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SystemModal;
