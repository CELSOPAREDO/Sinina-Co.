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
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'role'   => 'sometimes|required|in:admin,user',
            'status' => 'sometimes|required|in:active,suspended',
            'phone'  => 'sometimes|nullable|string',
        ]);

        $user = User::findOrFail($id);
        $user->update($request->only(['role', 'status', 'phone']));

        return response()->json([
            'message' => 'User updated successfully',
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
        $query = Product::with(['category', 'seller']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()->get();

        return response()->json($products);
    }

    public function createProduct(Request $request)
    {
        $validated = $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'size'           => 'nullable|string|max:50',
            'color'          => 'nullable|string|max:50',
            'image'          => 'nullable|image|max:204800',
            'size_inventory' => 'nullable|string',
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

        $sizeInventory = null;
        if (!empty($validated['size_inventory'])) {
            $sizeInventory = json_decode($validated['size_inventory'], true);
            if (is_array($sizeInventory)) {
                $validated['stock'] = array_sum($sizeInventory);
            }
        }

        $product = Product::create([
            'seller_id'      => $request->user()->id,
            'category_id'    => $validated['category_id'],
            'name'           => $validated['name'],
            'description'    => $validated['description'] ?? null,
            'price'          => $validated['price'],
            'stock'          => $validated['stock'],
            'size'           => $validated['size'] ?? null,
            'color'          => $validated['color'] ?? null,
            'image'          => $imagePath,
            'size_inventory' => $sizeInventory,
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
            'category_id'    => 'sometimes|exists:categories,id',
            'name'           => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'sometimes|numeric|min:0',
            'stock'          => 'sometimes|integer|min:0',
            'size'           => 'nullable|string|max:50',
            'color'          => 'nullable|string|max:50',
            'image'          => 'nullable|image|max:204800',
            'size_inventory' => 'nullable|string',
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

        if (array_key_exists('size_inventory', $validated)) {
            $validated['size_inventory'] = $validated['size_inventory']
                ? json_decode($validated['size_inventory'], true)
                : null;
            
            if (is_array($validated['size_inventory'])) {
                $validated['stock'] = array_sum($validated['size_inventory']);
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
            'status' => 'sometimes|required|in:pending,processing,shipped,delivered,payment_issue,cancelled',
            'payment_status' => 'sometimes|required|in:pending,verified,rejected',
            'rejection_reason' => 'sometimes|nullable|string',
        ]);

        $order = Order::findOrFail($id);

        if ($request->has('status') && in_array($request->status, ['processing', 'shipped', 'delivered'])) {
            $paymentStatus = $request->has('payment_status') ? $request->payment_status : $order->payment_status;
            
            if ($order->payment_method === 'gcash' && $paymentStatus !== 'verified') {
                return response()->json([
                    'message' => 'Cannot process order: Payment must be verified first.',
                ], 400);
            }
        }

        $data = $request->only(['status', 'payment_status', 'rejection_reason']);
        
        if ($request->payment_status === 'rejected') {
            $data['rejected_at'] = now();
            $data['status'] = 'payment_issue';
            $data['is_reuploaded'] = false;
        }

        if ($request->payment_status === 'verified') {
            $data['is_reuploaded'] = false;
        }

        $order->update($data);

        // Create Notification
        if ($request->has('status') || $request->has('payment_status')) {
            $title = "Order Updated";
            $message = "Order #{$order->id} is now " . str_replace('_', ' ', $order->status) . ".";
            $type = 'info';

            if ($request->payment_status === 'rejected') {
                $title = "Payment Issue";
                $message = "Payment for Order #{$order->id} was rejected: " . ($order->rejection_reason ?: 'Invalid receipt');
                $type = 'error';
            } elseif ($request->payment_status === 'verified') {
                $title = "Payment Verified";
                $message = "Your payment for Order #{$order->id} has been verified.";
                $type = 'success';
            } elseif ($order->status === 'delivered') {
                $title = "Order Delivered";
                $message = "Great news! Order #{$order->id} has been delivered successfully.";
                $type = 'success';
            } elseif ($order->status === 'shipped') {
                $title = "Order Out for Delivery";
                $message = "Your order #{$order->id} is on its way to you!";
                $type = 'info';
            }

            \App\Models\Notification::create([
                'user_id' => $order->user_id,
                'title'   => $title,
                'message' => $message,
                'type'    => $type,
                'data'    => ['order_id' => $order->id]
            ]);
        }

        return response()->json([
            'message' => 'Order updated',
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
                'pending'          => Order::where('status', 'pending')->count(),
                'processing'       => Order::where('status', 'processing')->count(),
                'shipped'          => Order::where('status', 'shipped')->count(),
                'delivered'        => Order::where('status', 'delivered')->count(),
            ],
        ]);
    }

    public function repairStorageLink()
    {
        try {
            \Illuminate\Support\Facades\Artisan::call('storage:link', ['--force' => true]);
            return response()->json([
                'message' => 'Storage link repaired successfully.',
                'output' => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to repair storage link.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
