<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function products(Request $request)
    {
        $products = Product::where('seller_id', $request->user()->id)
            ->with('category')
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function orders(Request $request)
    {
        $sellerId = $request->user()->id;

        $orders = Order::whereHas('items.product', function ($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        })
        ->with(['items.product', 'user'])
        ->latest()
        ->get();

        return response()->json($orders);
    }

    public function reports(Request $request)
    {
        $sellerId = $request->user()->id;

        $totalProducts = Product::where('seller_id', $sellerId)->count();

        $totalOrders = Order::whereHas('items.product', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->count();

        $totalRevenue = Order::whereHas('items.product', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->where('status', '!=', 'cancelled')
        ->with('items.product')
        ->get()
        ->flatMap->items
        ->filter(fn ($item) => $item->product && $item->product->seller_id === $sellerId)
        ->sum(fn ($item) => $item->price * $item->quantity);

        return response()->json([
            'total_products' => $totalProducts,
            'total_orders'   => $totalOrders,
            'total_revenue'  => $totalRevenue,
        ]);
    }
}
