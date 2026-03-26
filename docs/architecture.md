# Arquitetura - Tasks POP

## Visão Geral

Sistema de checklists operacionais (POP) para controle de tarefas diárias/semanais em operações de food service, com foco em compliance e rastreabilidade.

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Backend | Laravel 13 + PHP 8.2+ | API REST, migrations, auth |
| Autenticação | Laravel Sanctum | Tokens API, adequado para PWA/mobile |
| Frontend | React 18 + Vite | PWA, SPA responsiva |
| Banco | SQLite (dev) / PostgreSQL (prod) | Flexibilidade |
| Storage | Local (dev) / Cloudinary (prod) | Fotos de evidência via PhotoStorageService |

## Estrutura do Projeto

```
tasks-pop/
├── api/              # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── ...
│   └── database/migrations/
├── frontend/         # React PWA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── public/
├── docs/
└── CHANGELOG.md
```

Modelo de dados detalhado (entidades, ER, diagramas de contexto e sequência): **[modelo-dados.md](modelo-dados.md)**.

## Fluxo de Dados

```
┌─────────────┐   Bearer     ┌─────────────┐     REST      ┌─────────────┐
│   React     │ ◄──────────► │   Laravel   │ ◄──────────►  │  Database   │
│   PWA       │   (Sanctum)  │   API        │               │  SQLite/PG  │
└─────────────┘              └─────────────┘               └─────────────┘
     │                              │
     │                              │ Storage (fotos)
     │                              ▼
     │                       ┌─────────────┐
     └──────────────────────►│  Cloudinary │
        (upload via API)     │  ou Local   │
                             └─────────────┘
```

## Modelo de Dados

### Entidades Principais

- **User**: funcionário ou gerente (role-based), com setor e turno
- **Sector**: setor (Produção, Copa, Atendimento, Estoque)
- **Shift**: turno (Manhã, Tarde, Noite)
- **Task**: tarefa POP (diária/semanal), vinculada a setor e/ou turno (null = global)
- **TaskLog**: execução registrada (quem, quando, status, foto)

### Relacionamentos

- User N:1 Sector, N:1 Shift
- Task N:1 Sector, N:1 Shift
- User 1:N TaskLog
- Task 1:N TaskLog
- Task pode ter `requires_photo` (obrigatório para tarefas críticas)

Detalhe de campos, cardinalidades e diagramas: **[modelo-dados.md](modelo-dados.md)**. Requisitos e casos de uso: **[requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md)**.

### Filtro de tarefas por setor/turno

Funcionário vê apenas tarefas onde:
- `(task.sector_id IS NULL OR task.sector_id = user.sector_id)`
- `(task.shift_id IS NULL OR task.shift_id = user.shift_id)`

Gerente vê todas as tarefas.

## Segurança

- Laravel Sanctum (tokens Bearer na API)
- CORS configurado para frontend
- Rate limiting em endpoints públicos
- Validação de upload (tipo, tamanho)
- Auditoria: task_logs não deletáveis, apenas correções com justificativa

## PWA e Offline

Descrição detalhada (manifest, service worker, cache, Web Push, offline): **[especificacao-sistema.md](especificacao-sistema.md)** (secção PWA).

- **Service Worker** ([`frontend/src/sw.ts`](../frontend/src/sw.ts), vite-plugin-pwa + Workbox): precache de assets, fallback SPA para `index.html`, NetworkFirst para API, CacheFirst para imagens/storage/Cloudinary
- **Atualização**: `ReloadPrompt` (nova versão / app pronto offline)
- **Fila offline** (localStorage): task logs com observação e mídia em base64 (imagens) quando offline; sincronização ao reconectar
- **Manifest**: ícones 192/512 e maskable, `standalone`, tema escuro, instalável
- **Web Push**: handler `push` no SW + registo VAPID no cliente (além de Pusher/Echo para tempo real na UI — ver [PLANO_NOTIFICACOES_PUSHER.md](PLANO_NOTIFICACOES_PUSHER.md))

## Escalabilidade Futura

- [ ] Background Sync API (sync mais robusto em segundo plano)
- [ ] Multi-tenancy (SaaS)
- [ ] Exportação PDF adicional além de CSV/XLSX já suportados na API
