# Arquitetura - Tasks POP

## Visão Geral

Sistema de checklists operacionais (POP) para controle de tarefas diárias/semanais em operações de food service, com foco em compliance e rastreabilidade.

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Backend | Laravel 11 + PHP 8.2 | API REST, migrations, auth |
| Autenticação | Laravel Sanctum | Tokens API, adequado para PWA/mobile |
| Frontend | React 18 + Vite | PWA, SPA responsiva |
| Banco | SQLite (dev) / PostgreSQL (prod) | Flexibilidade |
| Storage | Local (dev) / Cloudinary (prod) | Fotos de evidência via PhotoStorageService |

## Estrutura do Projeto

```
tasks-pop/
├── backend/          # Laravel API
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

## Fluxo de Dados

```
┌─────────────┐     JWT      ┌─────────────┐     REST      ┌─────────────┐
│   React     │ ◄──────────► │   Laravel   │ ◄──────────►  │  Database   │
│   PWA       │              │   API      │               │  SQLite/PG  │
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

### Filtro de tarefas por setor/turno

Funcionário vê apenas tarefas onde:
- `(task.sector_id IS NULL OR task.sector_id = user.sector_id)`
- `(task.shift_id IS NULL OR task.shift_id = user.shift_id)`

Gerente vê todas as tarefas.

## Segurança

- JWT com refresh token
- CORS configurado para frontend
- Rate limiting em endpoints públicos
- Validação de upload (tipo, tamanho)
- Auditoria: task_logs não deletáveis, apenas correções com justificativa

## PWA e Offline

- **Service Worker** (vite-plugin-pwa + Workbox): precache de assets, NetworkFirst para API, CacheFirst para imagens
- **Fila offline** (localStorage): task logs com observação e foto (base64) enfileirados quando offline, sincronizados ao reconectar
- **Página offline**: fallback customizado quando navegação falha sem rede
- **Manifest**: ícones PNG 192/512, meta Apple, theme-color, installável

## Escalabilidade Futura

- [ ] Background Sync API (sync mais robusto em segundo plano)
- [ ] Push notifications (Firebase)
- [ ] Multi-tenancy (SaaS)
- [ ] Exportação PDF/Excel
