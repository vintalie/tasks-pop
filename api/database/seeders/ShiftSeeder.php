<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            ['name' => 'Manhã', 'slug' => 'manha', 'start_time' => '06:00', 'end_time' => '14:00'],
            ['name' => 'Tarde', 'slug' => 'tarde', 'start_time' => '14:00', 'end_time' => '22:00'],
            ['name' => 'Noite', 'slug' => 'noite', 'start_time' => '22:00', 'end_time' => '06:00'],
        ];

        foreach ($shifts as $shift) {
            Shift::updateOrCreate(
                ['slug' => $shift['slug']],
                array_merge($shift, ['active' => true])
            );
        }
    }
}
