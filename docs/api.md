# API - Tasks POP

Base URL: `http://localhost:8000/api`

## Autenticação

Todos os endpoints (exceto login) exigem header:

```
Authorization: Bearer {token}
```

O token é retornado no login (Sanctum).

---

## Auth

### POST /auth/login

```json
// Request
{
  "email": "funcionario@empresa.com",
  "password": "senha123"
}

// Response (200)
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "employee"
  }
}
```

### POST /auth/register (admin)

Criação de usuários por gerente. Requer role `manager`.

### POST /auth/logout

Invalida o token atual.

### POST /auth/refresh

Renova o access token.

---

## Sectors

### GET /sectors

Lista setores ativos.

---

## Shifts

### GET /shifts

Lista turnos ativos.

---

## Tasks

### GET /tasks

Lista tarefas. **Funcionário**: apenas tarefas do seu setor e turno. **Gerente**: todas.

Query params:

- `type`: daily | weekly
- `date`: Y-m-d (opcional, para tarefas do dia)

```json
// Response (200)
{
  "data": [
    {
      "id": 1,
      "name": "Limpar máquina de suco",
      "type": "daily",
      "description": "Limpar e higienizar...",
      "requires_photo": true,
      "order": 1,
      "sector": { "id": 1, "name": "Copa" },
      "shift": { "id": 1, "name": "Manhã" }
    }
  ]
}
```

### GET /tasks/{id}

Detalhe de uma tarefa.

### POST /tasks (manager)

Cria nova tarefa.

### PUT /tasks/{id} (manager)

Atualiza tarefa.

---

## Task Logs

### GET /task-logs

Lista execuções. Query params:

- `date`: Y-m-d
- `user_id`: ID do funcionário
- `task_id`: ID da tarefa
- `status`: completed | pending

```json
// Response (200)
{
  "data": [
    {
      "id": 1,
      "task": { "id": 1, "name": "Limpar máquina de suco" },
      "user": { "id": 1, "name": "João Silva" },
      "completed_at": "2025-03-20T10:30:00Z",
      "observation": "Limpeza concluída",
      "photo_url": "https://...",
      "status": "completed"
    }
  ]
}
```

### POST /task-logs

Registra execução de tarefa (funcionário).

```json
// Request
{
  "task_id": 1,
  "status": "completed",
  "observation": "Limpeza concluída",
  "photo": "base64 ou FormData"
}
```

### PUT /task-logs/{id}/correct (manager)

Correção com justificativa.

```json
// Request
{
  "status": "completed",
  "correction_reason": "Funcionário esqueceu de marcar"
}
```

---

## Users (manager)

### GET /users

Lista funcionários.

### GET /users/{id}/stats

Score do funcionário (% tarefas cumpridas).
