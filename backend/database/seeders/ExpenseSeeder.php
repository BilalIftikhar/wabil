<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fabric & Stock', 'icon' => 'shirt', 'color_hex' => '#C9A96E', 'type' => 'business'],
            ['name' => 'Marketing', 'icon' => 'megaphone', 'color_hex' => '#F4C2C2', 'type' => 'business'],
            ['name' => 'Salaries', 'icon' => 'users', 'color_hex' => '#1A1A2E', 'type' => 'business'],
            ['name' => 'Logistics', 'icon' => 'truck', 'color_hex' => '#8E9AAF', 'type' => 'business'],
            ['name' => 'Groceries', 'icon' => 'shopping-basket', 'color_hex' => '#A3B18A', 'type' => 'personal'],
            ['name' => 'Utilities', 'icon' => 'zap', 'color_hex' => '#E07A5F', 'type' => 'personal'],
            ['name' => 'Dining', 'icon' => 'utensils', 'color_hex' => '#BC6C25', 'type' => 'personal'],
            ['name' => 'Health', 'icon' => 'heart-pulse', 'color_hex' => '#D62828', 'type' => 'personal'],
        ];

        foreach ($categories as $cat) {
            ExpenseCategory::firstOrCreate(['name' => $cat['name']], $cat);
        }
    }
}
