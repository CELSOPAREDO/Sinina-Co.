import React, { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import "./UserProfile.css";
import Toast from "../../components/ui/Toast";
import { User, Mail, Phone, Camera, Loader2, Save, X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });
    
    // Image / Cropping State
    const [imagePreview, setImagePreview] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropImage, setCropImage] = useState(null);
    const [cropConfig, setCropConfig] = useState({ x: 0, y: 0, zoom: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [croppedFile, setCroppedFile] = useState(null);
    
    const imgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await API.get("/user");
            setUser(res.data);
            setFormData({
                name: res.data.name || "",
                email: res.data.email || "",
                phone: res.data.phone || "",
                address: res.data.address || ""
            });
            if (res.data.profile_image) {
                setImagePreview(getImageUrl(res.data.profile_image));
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `/storage/${path.replace(/^\/?storage\//, '')}`;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setToast({ show: true, message: "File is too large. Max 10MB.", type: "error" });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setCropImage(reader.result);
                setShowCropper(true);
                setCropConfig({ x: 0, y: 0, zoom: 1 });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Cropper Logic ---
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - cropConfig.x, y: e.clientY - cropConfig.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setCropConfig(prev => ({
            ...prev,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }));
    };

    const handleMouseUp = () => setIsDragging(false);

    const onImageLoad = (e) => {
        const img = e.target;
        const frameSize = 300;
        const scaleX = frameSize / img.naturalWidth;
        const scaleY = frameSize / img.naturalHeight;
        const initialZoom = Math.max(scaleX, scaleY);
        setCropConfig({ x: 0, y: 0, zoom: initialZoom });
    };

    const handleZoom = (delta) => {
        setCropConfig(prev => ({
            ...prev,
            zoom: Math.max(0.1, Math.min(5, prev.zoom + delta))
        }));
    };

    const generateCrop = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 500; // Better resolution for profile
        canvas.width = size;
        canvas.height = size;

        const img = imgRef.current;
        if (!img) return;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);

        const scale = cropConfig.zoom;
        
        // We need to map the 300px UI frame to the 500px canvas
        const uiToCanvas = size / 300;
        
        const dx = (cropConfig.x * uiToCanvas) + (size / 2);
        const dy = (cropConfig.y * uiToCanvas) + (size / 2);
        
        // The image in the UI is scaled relative to the container width (300px)
        // So its effective width in UI is img.naturalWidth * (300 / img.naturalWidth) * zoom = 300 * zoom
        // No, wait. 
        // In CSS, img has no width/height, but max-width: none.
        // It will be its natural size unless we constrain it.
        // Let's assume natural size for the math.
        
        const drawWidth = img.naturalWidth * scale * uiToCanvas;
        const drawHeight = img.naturalHeight * scale * uiToCanvas;

        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.translate(dx, dy);
        ctx.drawImage(img, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
        ctx.restore();

        canvas.toBlob((blob) => {
            const file = new File([blob], "profile.png", { type: "image/png" });
            setCroppedFile(file);
            setImagePreview(canvas.toDataURL());
            setShowCropper(false);
        }, "image/png");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("address", formData.address);
        if (croppedFile) {
            data.append("profile_image", croppedFile);
        }

        try {
            const res = await API.post("/user/profile", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const updatedUser = res.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.dispatchEvent(new Event("userUpdated"));
            setToast({ show: true, message: "Profile updated successfully!", type: "success" });
            setCroppedFile(null);
        } catch (err) {
            console.error(err);
            setToast({ show: true, message: "Update failed.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="up-loading"><Loader2 className="animate-spin" /></div>;

    const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    return (
        <div className="up-container">
            <header className="up-header">
                <h1>Account Settings</h1>
                <p>Manage your profile and 10MB photo limit.</p>
            </header>

            <div className="up-card">
                <form onSubmit={handleSubmit}>
                    <div className="up-avatar-section">
                        <div className="up-avatar-wrapper">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="up-avatar-img" />
                            ) : (
                                <div className="up-avatar-placeholder">{initials}</div>
                            )}
                            <label className="up-camera-btn">
                                <Camera size={18} />
                                <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                            </label>
                        </div>
                        <div className="up-avatar-text">
                            <h3>Profile Picture</h3>
                            <p>PNG, JPG up to 10MB (Cropper enabled)</p>
                        </div>
                    </div>

                    <div className="up-form-grid">
                        <div className="up-input-group">
                            <label><User size={14} /> Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="up-input-group">
                            <label><Mail size={14} /> Email</label>
                            <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="up-input-group">
                            <label><Phone size={14} /> Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="up-input-group full-width">
                            <label><Mail size={14} /> Delivery Address</label>
                            <textarea 
                                name="address" 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Enter your full delivery address"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="up-actions">
                        <button type="submit" className="up-save-btn" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Cropper Modal */}
            {showCropper && createPortal(
                <div className="up-cropper-overlay" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                    <div className="up-cropper-modal">
                        <div className="up-cropper-header">
                            <h3>Crop Profile Photo</h3>
                            <button onClick={() => setShowCropper(false)}><X size={20} /></button>
                        </div>
                        <div className="up-cropper-content">
                            <div className="up-crop-frame" ref={containerRef}>
                                <img 
                                    ref={imgRef}
                                    src={cropImage} 
                                    alt="To Crop" 
                                    style={{
                                        transform: `translate(${cropConfig.x}px, ${cropConfig.y}px) scale(${cropConfig.zoom})`,
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onLoad={onImageLoad}
                                    draggable={false}
                                />
                                <div className="up-crop-overlay-ring"></div>
                            </div>
                            
                            <div className="up-cropper-controls">
                                <button onClick={() => handleZoom(-0.1)}><ZoomOut size={18} /></button>
                                <input 
                                    type="range" 
                                    min="0.05" 
                                    max="5" 
                                    step="0.01" 
                                    value={cropConfig.zoom} 
                                    onChange={(e) => setCropConfig({...cropConfig, zoom: parseFloat(e.target.value)})} 
                                />
                                <button onClick={() => handleZoom(0.1)}><ZoomIn size={18} /></button>
                            </div>
                        </div>
                        <div className="up-cropper-footer">
                            <button className="btn-secondary" onClick={() => setShowCropper(false)}>Cancel</button>
                            <button className="up-save-btn" onClick={generateCrop}>Apply Crop</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
