export function getProductImageUrl(imagePath, fallbackUrl) {
    if (!imagePath) return fallbackUrl;

    const value = String(imagePath).trim();
    if (!value) return fallbackUrl;

    if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
        return value;
    }

    if (value.startsWith("/storage/")) {
        return value;
    }

    if (value.startsWith("storage/")) {
        return `/${value}`;
    }

    return `/storage/${value.replace(/^\/+/, "")}`;
}
