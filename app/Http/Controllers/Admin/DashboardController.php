<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Total Sales
        $salesToday = Order::whereDate('created_at', $today)->where('status', 'delivered')->sum('total_price');
        $salesMonthly = Order::whereMonth('created_at', Carbon::now()->month)->where('status', 'delivered')->sum('total_price');
        
        // Yesterday's sales for percentage
        $salesYesterday = Order::whereDate('created_at', Carbon::yesterday())->where('status', 'delivered')->sum('total_price');
        $salesChange = $salesYesterday > 0 ? (($salesToday - $salesYesterday) / $salesYesterday) * 100 : 0;

        // Orders
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $pendingOrders = Order::where('status', 'pending')->count();

        // Low Stock (Calculate across all variants)
        $lowStockCount = 0;
        $products = Product::all();
        foreach ($products as $product) {
            if ($product->size_inventory) {
                $sizes = is_string($product->size_inventory) ? json_decode($product->size_inventory, true) : $product->size_inventory;
                if (is_array($sizes)) {
                    foreach ($sizes as $size => $qty) {
                        if ((int)$qty <= 5) {
                            $lowStockCount++;
                        }
                    }
                }
            } else {
                if ($product->stock <= 5) {
                    $lowStockCount++;
                }
            }
        }

        return response()->json([
            'stats' => [
                'total_sales' => [
                    'today' => $salesToday,
                    'monthly' => $salesMonthly,
                    'change' => round($salesChange, 1)
                ],
                'orders_today' => [
                    'value' => $ordersToday,
                    'change' => 5 // Mock change for demo
                ],
                'pending_orders' => [
                    'value' => $pendingOrders,
                ],
                'low_stock' => [
                    'value' => $lowStockCount,
                ]
            ]
        ]);
    }

    public function getSalesAnalytics()
    {
        // Daily sales for line chart (last 7 days)
        $dailySales = Order::where('status', 'delivered')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->groupBy('date')
            ->get();

        // Category sales for bar chart
        $categorySales = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->select('categories.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('categories.name')
            ->get();

        return response()->json([
            'daily_sales' => $dailySales,
            'category_sales' => $categorySales
        ]);
    }

    public function getRecentOrders()
    {
        $orders = Order::with(['user', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json($orders);
    }

    public function getTopSelling()
    {
        $products = DB::table('products')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->select('products.id', 'products.name', 'products.image', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        return response()->json($products);
    }

    public function getLowStock()
    {
        $lowStockItems = [];
        $products = Product::all();
        
        foreach ($products as $product) {
            if ($product->size_inventory) {
                $sizes = is_string($product->size_inventory) ? json_decode($product->size_inventory, true) : $product->size_inventory;
                if (is_array($sizes)) {
                    foreach ($sizes as $size => $qty) {
                        if ((int)$qty <= 5) {
                            $lowStockItems[] = [
                                'id' => $product->id . '-' . $size,
                                'product_id' => $product->id,
                                'name' => $product->name,
                                'size' => $size,
                                'stock' => (int)$qty,
                                'image' => $product->image,
                                'status' => (int)$qty === 0 ? 'Out of Stock' : 'Low Stock'
                            ];
                        }
                    }
                }
            } else {
                if ($product->stock <= 5) {
                    $lowStockItems[] = [
                        'id' => $product->id . '-main',
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'size' => null,
                        'stock' => $product->stock,
                        'image' => $product->image,
                        'status' => $product->stock === 0 ? 'Out of Stock' : 'Low Stock'
                    ];
                }
            }
        }
        
        usort($lowStockItems, function($a, $b) {
            return $a['stock'] <=> $b['stock'];
        });

        return response()->json($lowStockItems);
    }
}
