<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name'     => 'Celso Paredo',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@sininaco.com'],
            [
                'name'     => 'Test User',
                'password' => Hash::make('password'),
                'role'     => 'user',
            ]
        );

        $categories = ['T-Shirts', 'Pants', 'Jackets', 'Accessories'];
        $categoryMap = [];
        foreach ($categories as $name) {
            $cat = Category::firstOrCreate(['name' => $name]);
            $categoryMap[$name] = $cat->id;
        }

        // Add sample products with Unsplash placeholders
        $products = [
            // T-Shirts
            [
                'name' => 'Classic White T-Shirt',
                'description' => 'Comfortable and versatile white t-shirt perfect for everyday wear.',
                'price' => 399.99,
                'stock' => 50,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'White',
                'size' => 'M',
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'
            ],
            [
                'name' => 'Charcoal Grey Premium Tee',
                'description' => 'Sleek and modern grey t-shirt with breathable fabric.',
                'price' => 449.99,
                'stock' => 35,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'Grey',
                'size' => 'M',
                'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop'
            ],
            [
                'name' => 'Navy Blue Crew Neck',
                'description' => 'Classic navy blue crew neck t-shirt with durable stitching.',
                'price' => 429.99,
                'stock' => 45,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'Navy',
                'size' => 'L',
                'image' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop'
            ],
            // Pants
            [
                'name' => 'Black Slim Fit Jeans',
                'description' => 'Modern slim fit jeans in classic black.',
                'price' => 1299.99,
                'stock' => 25,
                'category_id' => $categoryMap['Pants'],
                'seller_id' => $admin->id,
                'color' => 'Black',
                'size' => '32',
                'image' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop'
            ],
            [
                'name' => 'Blue Straight Leg Chinos',
                'description' => 'Comfortable straight leg chinos in versatile blue.',
                'price' => 1199.99,
                'stock' => 30,
                'category_id' => $categoryMap['Pants'],
                'seller_id' => $admin->id,
                'color' => 'Blue',
                'size' => '34',
                'image' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop'
            ],
            // Jackets
            [
                'name' => 'Denim Jacket Classic',
                'description' => 'Timeless denim jacket that goes with almost everything.',
                'price' => 1699.99,
                'stock' => 18,
                'category_id' => $categoryMap['Jackets'],
                'seller_id' => $admin->id,
                'color' => 'Blue',
                'size' => 'M',
                'image' => 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=800&auto=format&fit=crop'
            ],
            [
                'name' => 'Leather Bomber Jacket',
                'description' => 'Sophisticated leather bomber jacket for a stylish look.',
                'price' => 4999.99,
                'stock' => 8,
                'category_id' => $categoryMap['Jackets'],
                'seller_id' => $admin->id,
                'color' => 'Black',
                'size' => 'L',
                'image' => 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800&auto=format&fit=crop'
            ],
            // Accessories
            [
                'name' => 'Premium Leather Belt',
                'description' => 'High-quality leather belt with brushed metal buckle.',
                'price' => 899.99,
                'stock' => 40,
                'category_id' => $categoryMap['Accessories'],
                'seller_id' => $admin->id,
                'color' => 'Brown',
                'size' => 'One Size',
                'image' => 'https://images.unsplash.com/photo-1524380365678-51aa3d440b4d?q=80&w=800&auto=format&fit=crop'
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}