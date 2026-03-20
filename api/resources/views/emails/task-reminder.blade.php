<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #0f1419; font-size: 1.25rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f5f5f5; font-weight: 600; }
        .empty { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tasks POP - Resumo de tarefas pendentes</h1>
        <p>Data de referência: <strong>{{ $date }}</strong></p>

        @if(count($pendingTasks) > 0)
            <p>As seguintes tarefas não foram concluídas:</p>
            <table>
                <thead>
                    <tr>
                        <th>Tarefa</th>
                        <th>Setor</th>
                        <th>Turno</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($pendingTasks as $t)
                    <tr>
                        <td>{{ $t['name'] }}</td>
                        <td>{{ isset($t['sector']) ? $t['sector']['name'] : '-' }}</td>
                        <td>{{ isset($t['shift']) ? $t['shift']['name'] : '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p class="empty">Nenhuma tarefa pendente para esta data.</p>
        @endif

        <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
            Este é um lembrete automático do sistema Tasks POP.
        </p>
    </div>
</body>
</html>
