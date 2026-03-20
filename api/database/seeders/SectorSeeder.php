<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    public function run(): void
    {
        $sectors = [
            ['name' => 'Produção', 'slug' => 'producao'],
            ['name' => 'Copa', 'slug' => 'copa'],
            ['name' => 'Atendimento', 'slug' => 'atendimento'],
            ['name' => 'Estoque', 'slug' => 'estoque'],
        ];

        foreach ($sectors as $sector) {
            Sector::updateOrCreate(
                ['slug' => $sector['slug']],
                array_merge($sector, ['active' => true])
            );
        }
    }
}
