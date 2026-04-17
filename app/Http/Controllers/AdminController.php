<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // USER MANAGEMENT
    public function users()
    {
        $users = User::latest()->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'User role updated',
            'user'    => $user,
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role'     => 'user',
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user,
        ], 201);
    }
    public function categories()
    {
        return response()->json(Category::all());
    }

    public function createCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $category = Category::create(['name' => $request->name]);

        return response()->json([
            'message'  => 'Category created',
            'category' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $category = Category::findOrFail($id);
        $category->update(['name' => $request->name]);

        return response()->json([
            'message'  => 'Category updated',
            'category' => $category,
        ]);
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    // PRODUCT MANAGEMENT (formerly seller feature)
    public function products(Request $request)
    {
        $products = Product::with('category')
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function createProduct(Request $request)
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
                \App\Helpers\ImageProcessor::processProductImage($imagePath, 800);
            } catch (\Exception $e) {
                if ($imagePath) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($imagePath);
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

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

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
                if ($product->image) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
                }
                $imagePath = $request->file('image')->store('products', 'public');
                \App\Helpers\ImageProcessor::processProductImage($imagePath, 800);
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

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    // ORDER MANAGEMENT (formerly seller feature)
    public function orders(Request $request)
    {
        $orders = Order::with(['items.product', 'user'])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Order status updated',
            'order'   => $order,
        ]);
    }

    // REPORTS
    public function reports()
    {
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_price');

        return response()->json([
            'total_users'       => User::count(),
            'total_products'    => $totalProducts,
            'total_orders'      => $totalOrders,
            'total_revenue'     => $totalRevenue,
            'users_by_role'     => [
                'admin' => User::where('role', 'admin')->count(),
                'user'  => User::where('role', 'user')->count(),
            ],
            'orders_by_status' => [
                'pending'    => Order::where('status', 'pending')->count(),
                'processing' => Order::where('status', 'processing')->count(),
                'shipped'    => Order::where('status', 'shipped')->count(),
                'delivered'  => Order::where('status', 'delivered')->count(),
                'cancelled'  => Order::where('status', 'cancelled')->count(),
            ],
        ]);
    }
}
