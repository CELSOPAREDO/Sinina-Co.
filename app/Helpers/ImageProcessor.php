<?php

namespace App\Helpers;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ImageProcessor
{
    /**
     * Process and resize product image to square
     * 
     * @param string $imagePath Path to the image file
     * @param int $size Target width and height in pixels
     * @return string Path to processed image
     */
public static function processProductImage($imagePath, $size = 800)
    {
        try {
            $manager = new ImageManager(new Driver());

            // Read the image from storage
            $fullPath = Storage::disk('public')->path($imagePath);
            $image = $manager->read($fullPath);

            // Resize to square (contain resizes and pads)
            $image->contain($size, $size, '#F5EDE4');

            // Save the processed image
            $image->save($fullPath, 80);
            
            return $imagePath;
        } catch (Throwable $e) {
            // If processing fails, return original path
            return $imagePath;
        }
    }

    /**
     * Process cropped image from base64 string
     * 
     * @param string $base64Image Base64 encoded image
     * @param string $path Storage path
     * @param int $size Target size
     * @return string Path to saved image
     */
    public static function processCroppedImage($base64Image, $path, $size = 600)
    {
        try {
            $manager = new ImageManager(new Driver());
            
            // Remove data URI prefix if present
            if (strpos($base64Image, 'data:image') === 0) {
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            }
            
            // Decode base64 and create image
            $imageData = base64_decode($base64Image);
            $image = $manager->read($imageData);
            
            // Resize to square
            $image->contain($size, $size, '#F5EDE4');
            
            // Save to storage
            $fullPath = Storage::disk('public')->path($path);
            $image->save($fullPath, 85);
            
            return $path;
        } catch (Throwable $e) {
            throw new \Exception('Failed to process image: ' . $e->getMessage());
        }
    }

    /**
     * Delete image from storage
     * 
     * @param string $imagePath
     * @return bool
     */
    public static function deleteImage($imagePath)
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }
        return false;
    }
}
