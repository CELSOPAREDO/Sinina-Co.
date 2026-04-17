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
            'name'     => 'Celso Paredo',
            'email'    => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Test User',
            'email'    => 'user@sininaco.com',
            'password' => Hash::make('password'),
            'role'     => 'user',
        ]);

        $categories = ['T-Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories', 'Footwear'];
        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}