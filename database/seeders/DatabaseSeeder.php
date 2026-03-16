<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@sininaco.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Seller',
            'email'    => 'seller@sininaco.com',
            'password' => Hash::make('password'),
            'role'     => 'seller',
        ]);

        User::create([
            'name'     => 'Buyer',
            'email'    => 'buyer@sininaco.com',
            'password' => Hash::make('password'),
            'role'     => 'buyer',
        ]);

        $categories = ['T-Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories', 'Footwear'];
        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}
