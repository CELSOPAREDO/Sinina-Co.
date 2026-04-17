import React, { useState, useRef, useEffect } from "react";
import "./ImageCropper.css";

function ImageCropper({ onCropComplete, onCancel, image }) {
    const canvasRef = useRef(null);
    const imageRef = useRef(new Image());
    const [isDragging, setIsDragging] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            imageRef.current = img;
            drawImage();
        };
        img.src = image;
    }, [image]);

    useEffect(() => {
        drawImage();
    }, [zoom, offset]);

    const drawImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

        const img = imageRef.current;
        if (!img.src) return;

        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;

        ctx.drawImage(
            img,
            offset.x,
            offset.y,
            scaledWidth,
            scaledHeight
        );

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const deltaX = e.clientX - rect.left - (offset.x || 0);
        const deltaY = e.clientY - rect.top - (offset.y || 0);

        setOffset((prev) => ({
            x: prev.x - deltaX * 0.5,
            y: prev.y - deltaY * 0.5,
        }));
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            onCropComplete(blob);
        }, "image/jpeg", 0.9);
    };

    return (
        <div className="image-cropper-overlay">
            <div className="image-cropper-modal">
                <div className="cropper-header">
                    <div>
                        <h2>Crop Product Image</h2>
                        <p>Drag to move, adjust zoom to fit perfectly</p>
                    </div>
                    <button className="btn-close" onClick={onCancel}>&times;</button>
                </div>

                <div className="crop-preview">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                        className="crop-canvas"
                    />
                </div>

                <div className="zoom-control">
                    <label>Zoom:</label>
                    <input
                        type="range"
                        min={0.5}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <span>{(zoom * 100).toFixed(0)}%</span>
                </div>

                <div className="cropper-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        Crop & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropper;
