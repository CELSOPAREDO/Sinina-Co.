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
        $admin = User::create([
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
        $categoryMap = [];
        foreach ($categories as $name) {
            $cat = Category::create(['name' => $name]);
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
            // Dresses
            [
                'name' => 'Little Black Dress',
                'description' => 'Timeless and elegant black dress suitable for various occasions.',
                'price' => 2499.99,
                'stock' => 15,
                'category_id' => $categoryMap['Dresses'],
                'seller_id' => $admin->id,
                'color' => 'Black',
                'size' => 'S'
            ],
            [
                'name' => 'Floral Summer Dress',
                'description' => 'Light and breezy floral dress perfect for summer celebrations.',
                'price' => 1899.99,
                'stock' => 22,
                'category_id' => $categoryMap['Dresses'],
                'seller_id' => $admin->id,
                'color' => 'Floral',
                'size' => 'M'
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
            // Footwear
            [
                'name' => 'White Sneakers Classic',
                'description' => 'Comfortable white sneakers with cushioned sole. Perfect everyday shoes.',
                'price' => 2199.99,
                'stock' => 28,
                'category_id' => $categoryMap['Footwear'],
                'seller_id' => $admin->id,
                'color' => 'White',
                'size' => '42'
            ],
            [
                'name' => 'Brown Leather Oxford',
                'description' => 'Classic brown leather oxford shoes for formal occasions.',
                'price' => 3499.99,
                'stock' => 12,
                'category_id' => $categoryMap['Footwear'],
                'seller_id' => $admin->id,
                'color' => 'Brown',
                'size' => '42'
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}