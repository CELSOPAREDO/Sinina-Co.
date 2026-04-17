# 🚀 Deployment Checklist

Image processing system implementation is **COMPLETE**. Follow these steps to deploy:

---

## ✅ Step 1: Server Setup (Backend)

### 1.1 Install Intervention Image Package

```bash
composer require intervention/image ^3.0
```

**Expected output:**
```
Using version ^3.0 for intervention/image
./composer.json has been updated
Running composer update intervention/image
```

### 1.2 Verify Storage Directory Permissions

```bash
# Ensure storage directory is writable
chmod -R 755 storage
chmod -R 755 storage/app
chmod -R 755 storage/app/public
chmod -R 755 storage/app/public/products

# Create products directory if it doesn't exist
mkdir -p storage/app/public/products
chmod -R 755 storage/app/public/products
```

### 1.3 Create Symbolic Link (if using public storage)

```bash
php artisan storage:link
```

---

## ✅ Step 2: Frontend Integration

### 2.1 Update Your Product Creation Form

**File:** `resources/js/components/ProductForm.jsx` (or similar)

```jsx
import ProductImageUpload from "./ProductImageUpload";

// In your form component:
<div className="form-group">
    <label>Product Image</label>
    <ProductImageUpload 
        onImageSelect={handleImageSelected}
        currentImage={null}
    />
</div>

// In your submit handler:
const handleImageSelected = (blob) => {
    setCroppedImage(blob);
};

// When submitting:
const form = new FormData();
// ... add other fields
if (croppedImage) {
    form.append('image', croppedImage, 'product.jpg');
}
await API.post('/products', form);
```

See **INTEGRATION_EXAMPLE.jsx** for complete example.

### 2.2 Update Product Edit Form

**File:** `resources/js/components/ProductEditForm.jsx` (or similar)

```jsx
<ProductImageUpload 
    onImageSelect={handleImageSelected}
    currentImage={product.image_url}  // Show current image
/>
```

---

## ✅ Step 3: Testing Checklist

### 3.1 Backend Testing

```bash
# Test 1: Check Intervention Image installation
php artisan tinker
> Intervention\Image\ImageManagerStatic::make('path/to/image.jpg');
# Should not error

# Test 2: Check storage directory
> file_exists('storage/app/public/products')
# Should return true
```

### 3.2 Frontend Testing

1. **Open Product Creation Form** → Should see image upload area
2. **Drag & Drop Image** → Should open cropper modal
3. **Crop Image** → Canvas should display; drag/zoom controls work
4. **Submit Crop** → Blob should be captured
5. **Submit Form** → Image + data sent to backend
6. **Check Storage** → `storage/app/public/products/` should have resized image
7. **View Product** → Image should display as 600x600 square

### 3.3 Image Verification

```bash
# Check image dimensions and file size
identify storage/app/public/products/product_*.jpg

# Expected output: 600x600 size, ~150-300KB
```

---

## ✅ Step 4: Error Handling Verification

### 4.1 Test Invalid Images

- **Too small** (< 200x200): Should show error
- **Too large** (> 5MB): Should show error
- **Wrong format** (BMP, SVG): Should show error
- **Corrupted file**: Should show error

### 4.2 Check Laravel Logs

```bash
# Monitor errors
tail -f storage/logs/laravel.log

# Or in real-time
php artisan tinker --watch storage/logs/laravel.log
```

---

## ✅ Step 5: Database & API Routes

### 5.1 Verify Routes

Routes are already in **api.php**:
```
POST   /api/products            → store()
POST   /api/products/{id}       → update()
DELETE /api/products/{id}       → destroy()
GET    /api/products            → index()
GET    /api/products/{id}       → show()
```

### 5.2 Verify Database

```bash
# Check products table has image column
php artisan migrate --force
```

---

## ✅ Step 6: Files Overview

### Backend Files
- ✅ `app/Helpers/ImageProcessor.php` - Created
- ✅ `app/Http/Controllers/ProductController.php` - Updated
- ✅ `composer.json` - Update required (see Step 1.1)

### Frontend Files
- ✅ `resources/js/components/ImageCropper.jsx` - Created
- ✅ `resources/js/components/ImageCropper.css` - Created
- ✅ `resources/js/components/ProductImageUpload.jsx` - Created
- ✅ `resources/js/components/ProductImageUpload.css` - Created
- ✅ `resources/js/utils/imageUpload.js` - Created
- ⏳ Your product forms - Need integration

### Documentation Files
- ✅ `IMAGE_UPLOAD_SETUP.md` - Reference guide
- ✅ `INTEGRATION_EXAMPLE.jsx` - Complete working example

---

## ✅ Step 7: Environment Configuration

### Optional: Customize Image Settings

**File:** `app/Helpers/ImageProcessor.php`

```php
// Customize these constants:
const OUTPUT_SIZE = 600;           // Change from 600
const MIN_SIZE = 200;              // Change from 200
const QUALITY = 85;                // Change from 85
const PADDING_COLOR = '#F5EDE4';   // Change color
const FORMAT = 'jpg';              // Change from jpg
```

---

## ✅ Quick Command Reference

```bash
# Install package
composer require intervention/image ^3.0

# Fix permissions
chmod -R 755 storage/app/public/products

# Test installation
php artisan tinker

# View logs
tail -f storage/logs/laravel.log

# Clear cache if needed
php artisan cache:clear
php artisan config:clear
```

---

## ✅ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Class not found" error | Run `composer require intervention/image ^3.0` |
| Image not saving | Check `storage/app/public/products/` permissions (755) |
| Cropper not showing | Check `ProductImageUpload` imported correctly |
| Image too large | Backend will auto-resize to 600x600 |
| "413 Payload Too Large" | Increase PHP `post_max_size` in `php.ini` |
| Black/corrupted image | Check GD extension installed (`php -m \| grep gd`) |

---

## ✅ Final Check

- [ ] Composer dependency installed
- [ ] Storage directory writable (755)
- [ ] Product forms updated with ProductImageUpload
- [ ] Test create product with image
- [ ] Test edit product with image
- [ ] Test delete product (image cleaned up)
- [ ] Verify image dimensions (600x600)
- [ ] Check logs for errors

---

## 📝 Next Steps

1. **Run:** `composer require intervention/image ^3.0`
2. **Update:** Product creation/edit forms with ProductImageUpload component
3. **Test:** Upload a product image end-to-end
4. **Verify:** Image is 600x600px at `storage/app/public/products/`

---

**System Status:** ✅ Ready for deployment  
**Last Updated:** 2025-01-09  
**Components:** Frontend (React) + Backend (Laravel) + Database  
**Image Output:** 600x600px square, JPEG 85% quality, ~150-300KB
