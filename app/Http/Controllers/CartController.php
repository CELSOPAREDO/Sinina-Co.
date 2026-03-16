<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->load('items.product');

        return response()->json($cart);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'sometimes|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $quantity = $request->input('quantity', 1);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $request->product_id,
                'quantity'   => $quantity,
            ]);
        }

        $cart->load('items.product');

        return response()->json([
            'message' => 'Product added to cart',
            'cart'    => $cart,
        ]);
    }

    public function updateItem(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cartItem = CartItem::where('cart_id', $cart->id)->findOrFail($id);

        $cartItem->update(['quantity' => $request->quantity]);
        $cart->load('items.product');

        return response()->json([
            'message' => 'Cart item updated',
            'cart'    => $cart,
        ]);
    }

    public function removeItem(Request $request, $id)
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $cartItem = CartItem::where('cart_id', $cart->id)->findOrFail($id);

        $cartItem->delete();
        $cart->load('items.product');

        return response()->json([
            'message' => 'Item removed from cart',
            'cart'    => $cart,
        ]);
    }
}
