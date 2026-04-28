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

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        $paymentStatus = $request->paymentMethod === 'gcash' ? 'pending' : 'verified';

        $order = Order::create([
            'user_id'          => $user->id,
            'recipient_name'   => $request->recipient_name,
            'recipient_phone'  => $request->recipient_phone,
            'delivery_address' => $request->address,
            'payment_method'   => $request->paymentMethod,
            'payment_receipt'  => $receiptPath,
            'payment_status'   => $paymentStatus,
            'total_price'      => $totalPrice,
            'status'           => 'pending',
        ]);

        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $item->product_id,
                'quantity'   => $item->quantity,
                'price'      => $item->product->price,
                'size'       => $item->size,
            ]);

            $product = $item->product;
            $product->decrement('stock', $item->quantity);

            if ($item->size && $product->size_inventory) {
                $sizes = is_string($product->size_inventory) ? json_decode($product->size_inventory, true) : $product->size_inventory;
                if (is_array($sizes) && isset($sizes[$item->size])) {
                    $sizes[$item->size] = max(0, (int)$sizes[$item->size] - $item->quantity);
                    $product->size_inventory = $sizes;
                    $product->save();
                }
            }
        }

        $cart->items()->delete();

        \App\Models\Notification::create([
            'user_id' => $user->id,
            'title'   => 'Order Placed',
            'message' => "Order #{$order->id} has been placed successfully. Waiting for payment verification.",
            'type'    => 'success',
            'data'    => ['order_id' => $order->id]
        ]);

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
    public function cancelOrder(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled'], 400);
        }

        $order->update(['status' => 'cancelled']);

        \App\Models\Notification::create([
            'user_id' => $order->user_id,
            'title'   => 'Order Cancelled',
            'message' => "Order #{$order->id} has been successfully cancelled.",
            'type'    => 'info',
            'data'    => ['order_id' => $order->id]
        ]);

        // Return stock
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order'   => $order,
        ]);
    }

    public function updateReceipt(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->payment_status !== 'rejected') {
            return response()->json(['message' => 'Only rejected payments can be updated'], 400);
        }

        $request->validate([
            'receipt' => 'required|image|max:204800',
        ]);

        if ($request->hasFile('receipt')) {
            // Delete old receipt if exists
            if ($order->payment_receipt) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($order->payment_receipt);
            }
            
            $path = $request->file('receipt')->store('receipts', 'public');
            $order->update([
                'payment_receipt' => $path,
                'payment_status'  => 'pending',
                'status'          => 'pending',
                'rejection_reason' => null,
                'is_reuploaded'   => true,
            ]);

            \App\Models\Notification::create([
                'user_id' => $order->user_id,
                'title'   => 'Receipt Updated',
                'message' => "Your new receipt for Order #{$order->id} has been submitted and is pending verification.",
                'type'    => 'info',
                'data'    => ['order_id' => $order->id]
            ]);
        }

        return response()->json([
            'message' => 'Receipt updated successfully',
            'order'   => $order,
        ]);
    }
}
