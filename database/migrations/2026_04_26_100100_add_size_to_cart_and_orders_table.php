<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('size')->nullable()->after('quantity');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('size')->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('size');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('size');
        });
    }
};
