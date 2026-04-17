<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admins cannot place orders'], 403);
        }

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart || $cart->items()->count() === 0) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        $cart->load('items.product');

        $totalPrice = 0;
        foreach ($cart->items as $item) {
            $totalPrice += $item->product->price * $item->quantity;
        }

        $order = Order::create([
            'user_id'     => $user->id,
            'total_price' => $totalPrice,
            'status'      => 'pending',
        ]);

        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->product->price,
            ]);

            $item->product->decrement('stock', $item->quantity);
        }

        $cart->items()->delete();

        $order->load('items.product');

        return response()->json([
            'message' => 'Order placed successfully',
            'order'   => $order,
        ], 201);
    }

    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            return response()->json(['message' => 'Use admin/orders endpoint'], 403);
        }

        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        if ($request->user()->role === 'admin') {
            return response()->json(['message' => 'Use admin/orders endpoint'], 403);
        }

        $order = Order::where('user_id', $request->user()->id)
            ->with('items.product')
            ->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
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
}
