<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'product_id' => $productId,
            'rating'     => $validated['rating'],
            'comment'    => $validated['comment'] ?? null,
        ]);

        $review->load('user');

        return response()->json([
            'message' => 'Review submitted successfully',
            'review'  => $review,
        ], 201);
    }
}
