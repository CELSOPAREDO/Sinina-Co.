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

        // Add sample products
        $products = [
            // T-Shirts
            [
                'name' => 'Classic White T-Shirt',
                'description' => 'Comfortable and versatile white t-shirt perfect for everyday wear. Made from premium cotton blend.',
                'price' => 399.99,
                'stock' => 50,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'White',
                'size' => 'M'
            ],
            [
                'name' => 'Charcoal Grey Premium Tee',
                'description' => 'Sleek and modern grey t-shirt with breathable fabric. Ideal for casual outings.',
                'price' => 449.99,
                'stock' => 35,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'Grey',
                'size' => 'M'
            ],
            [
                'name' => 'Navy Blue Crew Neck',
                'description' => 'Classic navy blue crew neck t-shirt with durable stitching.',
                'price' => 429.99,
                'stock' => 45,
                'category_id' => $categoryMap['T-Shirts'],
                'seller_id' => $admin->id,
                'color' => 'Navy',
                'size' => 'L'
            ],
            // Pants
            [
                'name' => 'Black Slim Fit Jeans',
                'description' => 'Modern slim fit jeans in classic black. Perfect for both casual and semi-formal occasions.',
                'price' => 1299.99,
                'stock' => 25,
                'category_id' => $categoryMap['Pants'],
                'seller_id' => $admin->id,
                'color' => 'Black',
                'size' => '32'
            ],
            [
                'name' => 'Blue Straight Leg Chinos',
                'description' => 'Comfortable straight leg chinos in versatile blue. Great for a polished casual look.',
                'price' => 1199.99,
                'stock' => 30,
                'category_id' => $categoryMap['Pants'],
                'seller_id' => $admin->id,
                'color' => 'Blue',
                'size' => '34'
            ],
            [
                'name' => 'Khaki Premium Trousers',
                'description' => 'Sophisticated khaki trousers made from premium fabric. Perfect for office wear.',
                'price' => 1399.99,
                'stock' => 20,
                'category_id' => $categoryMap['Pants'],
                'seller_id' => $admin->id,
                'color' => 'Khaki',
                'size' => '32'
            ],
            // Jackets
            [
                'name' => 'Denim Jacket Classic',
                'description' => 'Timeless denim jacket that goes with almost everything. A wardrobe essential.',
                'price' => 1699.99,
                'stock' => 18,
                'category_id' => $categoryMap['Jackets'],
                'seller_id' => $admin->id,
                'color' => 'Blue',
                'size' => 'M'
            ],
            [
                'name' => 'Leather Bomber Jacket',
                'description' => 'Sophisticated leather bomber jacket for a stylish look.',
                'price' => 4999.99,
                'stock' => 8,
                'category_id' => $categoryMap['Jackets'],
                'seller_id' => $admin->id,
                'color' => 'Black',
                'size' => 'L'
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
                'size' => 'One Size'
            ],
            [
                'name' => 'Cotton Canvas Tote Bag',
                'description' => 'Spacious and durable canvas tote bag perfect for daily use.',
                'price' => 799.99,
                'stock' => 35,
                'category_id' => $categoryMap['Accessories'],
                'seller_id' => $admin->id,
                'color' => 'Beige',
                'size' => 'One Size'
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