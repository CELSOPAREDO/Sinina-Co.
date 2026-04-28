<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'gcash_number' => 'nullable|string',
            'gcash_qr' => 'nullable|image|max:10240', // up to 10MB
        ]);

        if ($request->has('gcash_number')) {
            Setting::updateOrCreate(
                ['key' => 'gcash_number'],
                ['value' => $validated['gcash_number']]
            );
        }

        if ($request->hasFile('gcash_qr')) {
            // Get current
            $currentQr = Setting::where('key', 'gcash_qr')->first();
            if ($currentQr && $currentQr->value) {
                Storage::disk('public')->delete($currentQr->value);
            }

            $path = $request->file('gcash_qr')->store('settings', 'public');
            Setting::updateOrCreate(
                ['key' => 'gcash_qr'],
                ['value' => $path]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
