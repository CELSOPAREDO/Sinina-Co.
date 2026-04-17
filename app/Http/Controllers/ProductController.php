<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Helpers\ImageProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        $products = $query->latest()->paginate(12);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'seller', 'reviews.user'])->findOrFail($id);

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'size'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:50',
            'image'       => 'nullable|image|max:204800',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            try {
                $imagePath = $request->file('image')->store('products', 'public');
                // Process image: resize to square 600x600
                ImageProcessor::processProductImage($imagePath, 600);
            } catch (\Exception $e) {
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
                return response()->json([
                    'message' => 'Failed to process image',
                    'error' => $e->getMessage()
                ], 400);
            }
        }

        $product = Product::create([
            'seller_id'   => $request->user()->id,
            'category_id' => $validated['category_id'],
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price'       => $validated['price'],
            'stock'       => $validated['stock'],
            'size'        => $validated['size'] ?? null,
            'color'       => $validated['color'] ?? null,
            'image'       => $imagePath,
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('seller_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'size'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:50',
            'image'       => 'nullable|image|max:204800',
        ]);

        if ($request->hasFile('image')) {
            try {
                // Delete old image
                if ($product->image) {
                    ImageProcessor::deleteImage($product->image);
                }
                
                // Store new image
                $imagePath = $request->file('image')->store('products', 'public');
                // Process image: resize to square 600x600
                ImageProcessor::processProductImage($imagePath, 600);
                $validated['image'] = $imagePath;
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Failed to process image',
                    'error' => $e->getMessage()
                ], 400);
            }
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::where('seller_id', $request->user()->id)->findOrFail($id);

        if ($product->image) {
            ImageProcessor::deleteImage($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function categories()
    {
        return response()->json(Category::all());
    }
}
