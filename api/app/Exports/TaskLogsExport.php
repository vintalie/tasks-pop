<?php

namespace App\Exports;

use App\Models\TaskLog;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TaskLogsExport implements FromCollection, WithHeadings
{
    public function __construct(
        private Collection $logs
    ) {}

    public function collection(): Collection
    {
        return $this->logs->map(function (TaskLog $log) {
            $mediaUrls = $this->getMediaUrls($log);

            return [
                $log->log_date->format('d/m/Y'),
                $log->task->name,
                $log->user->name,
                $log->user->sector?->name ?? '-',
                $log->user->shift?->name ?? '-',
                $log->completed_at?->format('H:i') ?? '-',
                $log->status === 'completed' ? 'Feito' : 'Pendente',
                $log->observation ?? '',
                $mediaUrls,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Data',
            'Tarefa',
            'Funcionário',
            'Setor',
            'Turno',
            'Horário',
            'Status',
            'Observação',
            'Mídia',
        ];
    }

    protected function getMediaUrls(TaskLog $log): string
    {
        $media = $log->media_paths;
        if (is_array($media) && ! empty($media)) {
            return implode('; ', array_map(fn ($m) => $m['url'] ?? '', $media));
        }
        if ($log->photo_path) {
            return str_starts_with($log->photo_path, 'http') ? $log->photo_path : '';
        }

        return '';
    }
}
