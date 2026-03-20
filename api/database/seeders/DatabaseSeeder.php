<?php

namespace Database\Seeders;

use App\Models\Sector;
use App\Models\Shift;
use App\Models\Task;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SectorSeeder::class,
            ShiftSeeder::class,
            UserSeeder::class,
        ]);

        $producao = Sector::where('slug', 'producao')->first();
        $copa = Sector::where('slug', 'copa')->first();
        $manha = Shift::where('slug', 'manha')->first();
        $tarde = Shift::where('slug', 'tarde')->first();

        $tasks = [
            ['name' => 'Limpar máquina de suco', 'type' => 'daily', 'recurrence' => 'daily', 'requires_photo' => true, 'order' => 1, 'sector_id' => $copa?->id, 'shift_id' => $manha?->id],
            ['name' => 'Higienizar bancada', 'type' => 'daily', 'recurrence' => 'daily', 'requires_photo' => false, 'order' => 2, 'sector_id' => $producao?->id, 'shift_id' => null],
            ['name' => 'Verificar validade dos produtos', 'type' => 'daily', 'recurrence' => 'daily', 'requires_photo' => true, 'order' => 3, 'sector_id' => $producao?->id, 'shift_id' => $manha?->id],
            ['name' => 'Limpar piso da área de produção', 'type' => 'daily', 'recurrence' => 'daily', 'requires_photo' => false, 'order' => 4, 'sector_id' => $producao?->id, 'shift_id' => null],
            ['name' => 'Checklist de abertura', 'type' => 'daily', 'recurrence' => 'daily', 'requires_photo' => false, 'order' => 5, 'sector_id' => null, 'shift_id' => null],
            ['name' => 'Limpeza profunda semanal', 'type' => 'weekly', 'recurrence' => 'weekly', 'requires_photo' => true, 'order' => 10, 'sector_id' => $producao?->id, 'shift_id' => $tarde?->id],
        ];

        foreach ($tasks as $task) {
            Task::firstOrCreate(
                [
                    'name' => $task['name'],
                    'sector_id' => $task['sector_id'],
                    'shift_id' => $task['shift_id'],
                ],
                array_merge($task, ['description' => 'Tarefa de rotina operacional.'])
            );
        }
    }
}
