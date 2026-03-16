<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users()
    {
        $users = User::latest()->get();

        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,seller,buyer',
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

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }

    public function reports()
    {
        return response()->json([
            'total_users'    => User::count(),
            'total_products' => Product::count(),
            'total_orders'   => Order::count(),
            'total_revenue'  => Order::where('status', '!=', 'cancelled')->sum('total_price'),
            'users_by_role'  => [
                'admin'  => User::where('role', 'admin')->count(),
                'seller' => User::where('role', 'seller')->count(),
                'buyer'  => User::where('role', 'buyer')->count(),
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
