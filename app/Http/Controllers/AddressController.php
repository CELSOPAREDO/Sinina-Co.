<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->addresses()->orderBy('is_default', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'           => 'required|string|max:50',
            'recipient_name'  => 'required|string|max:100',
            'recipient_phone' => 'required|string|max:20',
            'address'         => 'required|string',
        ]);

        $user = $request->user();

        // If this is the first address, make it default
        $isDefault = $user->addresses()->count() === 0;

        $address = $user->addresses()->create([
            'label'           => $validated['label'],
            'recipient_name'  => $validated['recipient_name'],
            'recipient_phone' => $validated['recipient_phone'],
            'address'         => $validated['address'],
            'is_default'      => $isDefault,
        ]);

        return response()->json($address, 201);
    }

    public function update(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'label'           => 'required|string|max:50',
            'recipient_name'  => 'required|string|max:100',
            'recipient_phone' => 'required|string|max:20',
            'address'         => 'required|string',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        // If deleting default, assign another if exists
        if ($address->is_default) {
            $another = $request->user()->addresses()->where('id', '!=', $id)->first();
            if ($another) {
                $another->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }

    public function setDefault(Request $request, $id)
    {
        $user = $request->user();
        
        // Unset previous default
        $user->addresses()->update(['is_default' => false]);
        
        // Set new default
        $address = $user->addresses()->findOrFail($id);
        $address->update(['is_default' => true]);

        return response()->json(['message' => 'Default address updated']);
    }
}
