<?php

namespace Database\Seeders;

use App\Models\Sector;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $producao = Sector::where('slug', 'producao')->first();
        $manha = Shift::where('slug', 'manha')->first();

        User::updateOrCreate(
            ['email' => 'gerente@taskspop.com'],
            [
                'name' => 'Gerente',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MANAGER,
                'sector_id' => null,
                'shift_id' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'funcionario@taskspop.com'],
            [
                'name' => 'Funcionário',
                'password' => Hash::make('password'),
                'role' => User::ROLE_EMPLOYEE,
                'sector_id' => $producao?->id,
                'shift_id' => $manha?->id,
            ]
        );
    }
}
