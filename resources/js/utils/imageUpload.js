// Handle image upload and conversion to base64
export const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Please select a valid image file"));
            return;
        }

        if (file.size > 200 * 1024 * 1024) {
            reject(new Error("Image size must be less than 200MB"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(file);
    });
};

// Convert blob to base64
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(new Error("Failed to convert blob"));
        };
        reader.readAsDataURL(blob);
    });
};

// Validate image dimensions
export const validateImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 200 || img.height < 200) {
                reject(
                    new Error("Image must be at least 200x200 pixels")
                );
                return;
            }
            resolve(true);
        };
        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };
        img.src = URL.createObjectURL(file);
    });
};
