# Plano Técnico: Sistema de Notificações e Atualização em Tempo Real

## 1. Visão Geral

Sistema de notificações e atualização automática de tarefas usando **Pusher** (real-time quando app aberto) e **Web Push** (notificações com app fechado).

### Separação Crítica: Pusher vs Web Push

**Regra**: Pusher **nunca** é usado para notificar o usuário. Ele serve apenas para atualizar a UI em tempo real quando o app está aberto. Qualquer alerta que deve chegar com app fechado usa **exclusivamente Web Push**.

| Cenário | Tecnologia | Comportamento |
|---------|------------|---------------|
| Lista de tarefas atualiza quando outro conclui | Pusher | Só funciona com app aberto; atualiza a lista na tela |
| Lembrete: tarefa X não concluída no horário | Web Push | Chega mesmo com app/navegador fechado |
| Setor Y finalizou todas as tarefas (gerente) | Web Push | Chega mesmo com app/navegador fechado |

### Requisitos Funcionais

| # | Requisito | Solução |
|---|-----------|---------|
| 1 | Gerente define horário de notificação na tarefa | Campo `notification_time` (TIME) na tabela `tasks` |
| 2 | Se tarefa não concluída até o horário → notificação aos funcionários | Job agendado (Scheduler) + **Web Push** |
| 3 | Lista de tarefas atualiza automaticamente quando outro conclui | Pusher broadcast (apenas atualização de UI, app aberto) |
| 4 | Gerente notificado quando **todas** as tarefas de um setor forem concluídas | **Web Push** (nunca Pusher) |
| 5 | Notificações com app/navegador fechado | Web Push API + Service Worker |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React PWA)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Pusher Echo – atualização da lista em tempo real (apenas quando app aberto)│
│  • Web Push – Service Worker recebe notificações mesmo com app fechado       │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              ▲
                    │ HTTP/API                     │ Web Push (VAPID)
                    ▼                              │ (notificações com app fechado)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Laravel)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Eventos broadcast → Pusher (TaskLogCreated) – atualização de UI apenas   │
│  • Jobs em fila → Web Push para lembretes e setor completou                 │
│  • Scheduler (cron) → verifica tarefas vencidas e dispara lembretes (Push)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Técnica

| Componente | Tecnologia | Propósito |
|------------|------------|-----------|
| Real-time | Pusher + Laravel Broadcasting | Atualização da lista em tempo real |
| Push (app fechado) | Web Push API + VAPID | Notificações nativas do SO/navegador |
| Jobs | Laravel Queue (database/redis) | Envio assíncrono de pushes |
| Scheduler | Laravel Scheduler (cron) | Verificação periódica de tarefas vencidas |

---

## 4. Estrutura de Arquivos

### Backend (api/)

```
app/
├── Events/
│   └── TaskLogCreated.php         # Broadcast Pusher (atualização de UI apenas)
├── Jobs/
│   ├── SendTaskReminderNotification.php  # Envia push para funcionários
│   └── SendSectorCompletedNotification.php # Envia push para gerente
├── Models/
│   └── PushSubscription.php        # Nova tabela para subscriptions Web Push
config/
└── broadcasting.php               # Publicar do framework (Pusher)

database/migrations/
├── add_notification_time_to_tasks_table.php
└── create_push_subscriptions_table.php
```

### Frontend (frontend/)

```
src/
├── lib/
│   ├── echo.ts            # Config Echo/Pusher para canal tasks-daily
│   └── webPush.ts         # Solicitar permissão, registrar subscription
├── hooks/
│   └── useRealtimeTasks.ts # Hook para escutar TaskLogCreated
└── hooks/
    └── useRealtimeTasks.ts # Hook para escutar TaskLogCreated e atualizar lista
```

---

## 5. Modelo de Dados

### Alteração em `tasks`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `notification_time` | TIME NULL | Horário do dia para lembrete (ex: 10:00) |

### Nova tabela `push_subscriptions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | PK |
| user_id | bigint | FK users |
| endpoint | string | URL do push service |
| keys | json | { p256dh, auth } |
| user_agent | string | Opcional |
| created_at, updated_at | timestamps | |

---

## 6. Fluxos Detalhados

### 6.1 Horário de notificação na tarefa

1. Gerente edita tarefa → define `notification_time` (ex: 10:30).
2. Formulário de tarefa (TaskManage) inclui campo de horário.

### 6.2 Lembrete de tarefa não concluída

1. **Scheduler** roda a cada 5 min: `php artisan schedule:run`.
2. Command `CheckTaskReminders`: busca tarefas com `notification_time` ≤ now e sem log completed na data atual, para cada setor/turno/user visíveis.
3. Para cada tarefa vencida: dispara Job `SendTaskReminderNotification`.
4. Job envia Web Push para usuários que podem completar a tarefa (mesmo setor/turno).

### 6.3 Atualização em tempo real da lista

1. Ao criar/atualizar `TaskLog`, dispara evento `TaskLogCreated` (implements `ShouldBroadcast`).
2. Canal: `tasks.{sector_id}.{shift_id}` ou canal global `tasks` com payload filtrado no frontend.
3. Frontend escuta com Echo: ao receber, refaz `api.taskLogs.list()` ou atualiza estado local.
4. Canais sugeridos:
   - `tasks-daily-{date}` – todos que veem tarefas diárias
   - Ou `user.{id}` – privado por usuário (mais seguro)

### 6.4 Setor completou todas as tarefas

1. No `TaskLogController::store`, após salvar log com status `completed`:
2. Serviço `SectorCompletionService`: verifica se todas as tarefas do setor (daquele dia, com base em sector_id da tarefa) estão concluídas.
3. Se sim: dispara Job `SendSectorCompletedNotification`.
4. Job envia **Web Push** apenas para gerentes (role = manager). Não usa Pusher.

### 6.5 Web Push (app fechado)

1. Frontend solicita permissão: `Notification.requestPermission()`.
2. Service Worker usa `registration.pushManager.subscribe()` com VAPID público.
3. Envia subscription (endpoint + keys) para `POST /api/push-subscriptions`.
4. Backend grava em `push_subscriptions`.
5. Ao disparar notificação, Job usa lib `minishlink/web-push` (PHP) para enviar payload ao endpoint de cada subscription.

---

## 7. Implementação (concluída)

### Fase 1 – Infraestrutura Web Push

- [x] Migration `notification_time` em `tasks`
- [x] Migration `push_subscriptions`
- [x] Pacote `minishlink/web-push`, config `webpush.php`
- [x] Endpoint `POST /api/push-subscriptions`, `GET /vapid-public-key`
- [x] Model `PushSubscription`
- [x] Frontend: `webPush.ts`, solicitar permissão, registrar subscription após login
- [x] Service Worker (injectManifest): handler `push` para exibir notificação
- [x] UI: campo horário no formulário de tarefa (TaskManage)

### Fase 2 – Lembrete de tarefa vencida

- [x] Command `CheckTaskReminders`
- [x] Job `SendTaskReminderNotification`
- [x] Registrar command no Scheduler (a cada 5 min)

### Fase 3 – Setor completou

- [x] `SectorCompletionService`
- [x] Job `SendSectorCompletedNotification` (Web Push para gerentes)

### Fase 4 – Real-time com Pusher (atualização de UI)

- [x] Evento `TaskLogCreated` (ShouldBroadcast)
- [x] Disparar evento no `TaskLogController::store`
- [x] Frontend: Echo, canal `tasks-daily`, `useRealtimeTasks` em Checklist e Dashboard

---

## 8. Configuração de Ambiente

### .env (api)

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### Cron (servidor)

```
* * * * * cd /path/to/api && php artisan schedule:run >> /dev/null 2>&1
```

---

## 9. Riscos e Considerações

| Item | Risco | Mitigação |
|------|-------|-----------|
| Pusher grátis | 200k msgs/dia, 100 conexões | Monitorar uso; upgrade se necessário |
| Web Push | Nem todos os browsers suportam | Fallback: notificação in-app apenas |
| Timezone | `notification_time` em qual fuso? | Usar timezone do servidor ou do usuário (config) |
| Setor “completo” | Tarefas gerais (sem setor) | Definir regra: tarefas sem sector_id não entram na conta |
| Permissão Push | Usuário recusa | Mostrar mensagem explicativa; não bloquear uso |

---

## 10. Dependências

### Backend (composer)

```json
"pusher/pusher-php-server": "^7.2",
"minishlink/web-push": "^9.0"
```

### Frontend (npm)

```json
"laravel-echo": "^1.16",
"pusher-js": "^8.4"
```

---

## 11. Próximos Passos

1. Revisar e aprovar este plano.
2. Criar conta Pusher (https://pusher.com) e obter credenciais.
3. Implementar Fase 1.
4. Seguir fases 2 a 5 conforme prioridade.
