# Documentação completa — Tasks POP (compilado)

> **Compilado gerado em 2026-03-26T01:48:12-03:00.** A fonte canónica para edição continua a ser os ficheiros individuais em `docs/` e o `README.md` na raiz. Para regenerar: `./scripts/compile-docs.sh`.


---

## Fonte: README.md (raiz do repositório)

# Tasks POP

Sistema de checklists operacionais (POP) para controle de tarefas diárias/semanais em operações de food service.

## Stack

- **Backend**: Laravel 13 + Sanctum (API tokens)
- **Frontend**: React 18 + TypeScript + Vite (PWA)
- **Banco**: SQLite (dev)

## Início rápido

### Backend (API)

```bash
cd api
php artisan migrate   # se necessário (inclui Sanctum)
php artisan serve
```

API em `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App em `http://localhost:5173`

### Produção (subdomínios)

- **Frontend**: https://taskspop.dcmmarketingdigital.com.br
- **API**: https://taskspop-api.dcmmarketingdigital.com.br

O build de produção usa `frontend/.env.production` com `VITE_API_URL` já configurado. Para build manual:

```bash
cd frontend
npm run build
```

Na API (`api/.env`), configure:
- `APP_URL=https://taskspop-api.dcmmarketingdigital.com.br`
- `SANCTUM_STATEFUL_DOMAINS=taskspop.dcmmarketingdigital.com.br`
- `CORS_ALLOWED_ORIGINS=https://taskspop.dcmmarketingdigital.com.br`

### Cloudinary (fotos de comprovante)

Para armazenar fotos na nuvem em produção, configure no `api/.env`:

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

Ou use as variáveis individuais: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Credenciais (seed)

| Role       | Email                  | Senha   |
|-----------|------------------------|---------|
| Gerente   | gerente@taskspop.com   | password |
| Funcionário | funcionario@taskspop.com | password |

## Estrutura

```
tasks-pop/
├── api/         # Laravel API
├── frontend/    # React PWA
├── docs/        # Documentação técnica
└── CHANGELOG.md
```

## Documentação

- **[Documentação completa (compilado único)](COMPILADO.md)** — README, índice, requisitos, arquitetura, modelo de dados, especificação, API, deploy, decisões, plano de notificações e CHANGELOG (regenerar: `./scripts/compile-docs.sh`)
- **[Índice completo da documentação (Diátaxis)](README.md)** — ponto de entrada para tutorials, how-to, referência, exploração e documentos de produto
- [Requisitos, casos de uso e catálogo de funcionalidades](requisitos-e-casos-de-uso.md)
- [Modelo de dados e diagramas (Mermaid)](modelo-dados.md)
- [Especificação do sistema, boas práticas de documentação e PWA](especificacao-sistema.md)
- [Arquitetura](architecture.md)
- [Decisões técnicas](decisions.md)
- [API](api.md)
- [Deploy](deployment.md)

---

## Fonte: docs/README.md

# Índice da documentação — Tasks POP

Este diretório segue a ideia do **[Diátaxis](https://diataxis.fr/)**: separar o material pelo que o leitor pretende fazer (aprender, resolver um problema, consultar um contrato ou entender o contexto). Para visão de produto, requisitos e modelo de dados, use os documentos listados em **Produto e análise**.

**Leitura contínua:** [COMPILADO.md](COMPILADO.md) — um único ficheiro com o README da raiz, este índice, requisitos, arquitetura, modelo de dados, especificação, API, deploy, decisões, plano de notificações e CHANGELOG (gerado por `./scripts/compile-docs.sh`).

---

## Tutorial (aprender passo a passo)

| Documento | Descrição |
|-----------|-----------|
| [README principal do repositório](../README.md) | O que é o projeto, requisitos, como subir API e frontend localmente, variáveis de ambiente, credenciais de seed |

---

## How-to guides (resolver tarefas concretas)

| Documento | Descrição |
|-----------|-----------|
| [deployment.md](deployment.md) | Fallback de rotas SPA (Netlify, Vercel, nginx, Apache), URLs `/storage/...` e erro 403, checklist de deploy |
| [PLANO_NOTIFICACOES_PUSHER.md](PLANO_NOTIFICACOES_PUSHER.md) | Notificações: Pusher (tempo real na UI) vs Web Push, referência para configuração |

---

## Referência técnica

| Documento | Descrição |
|-----------|-----------|
| [api.md](api.md) | Endpoints REST, autenticação Sanctum, exemplos de request/response |
| Rotas Laravel | [`api/routes/api.php`](../api/routes/api.php) e [`api/routes/web.php`](../api/routes/web.php) — fonte de verdade dos caminhos HTTP |
| [CHANGELOG](../CHANGELOG.md) | Histórico de versões (Added / Changed / Fixed) |

---

## Explicação (contexto e decisões)

| Documento | Descrição |
|-----------|-----------|
| [architecture.md](architecture.md) | Stack, estrutura de pastas, fluxo de dados, segurança, PWA (resumo com link para especificação) |
| [decisions.md](decisions.md) | Decisões de arquitetura (ADR-style) |
| [especificacao-sistema.md](especificacao-sistema.md) | Boas práticas de documentação web aplicadas ao repo, **PWA em detalhe** (service worker, manifest, offline, push), glossário, referências MDN/Web.dev |

---

## Produto e análise

| Documento | Descrição |
|-----------|-----------|
| [requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md) | Visão, atores, **casos de uso** (UC), **requisitos funcionais (RF)** e **não funcionais (RNF)**, catálogo de funcionalidades |
| [modelo-dados.md](modelo-dados.md) | Entidades do domínio, atributos, relacionamentos, **diagrama ER** e diagramas de **contexto** e **sequência** (Mermaid) |

---

## Mapa rápido “quero…”

| Objetivo | Onde ir |
|----------|---------|
| Ler toda a documentação num só ficheiro | [COMPILADO.md](COMPILADO.md) |
| Subir o projeto em dev | [README](../README.md) |
| Corrigir 403 em mídia em produção | [deployment.md](deployment.md) |
| Ver regras de visibilidade / negócio | [requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md) + [architecture.md](architecture.md) |
| Consultar modelo de BD | [modelo-dados.md](modelo-dados.md) |
| Entender PWA, SW e offline | [especificacao-sistema.md](especificacao-sistema.md) — secção 4 |

---

*Manter este índice atualizado quando forem adicionados ficheiros relevantes em `docs/`.*

---

## Fonte: docs/requisitos-e-casos-de-uso.md

# Requisitos, casos de uso e catálogo — Tasks POP

Documento de **visão de produto** e **comportamento esperado** do sistema. Complementa a [especificação](especificacao-sistema.md), o [modelo de dados](modelo-dados.md) e a [API](api.md).

---

## 1. Visão e objetivos

O **Tasks POP** apoia operações de **food service** (e contextos similares) na execução e fiscalização de **procedimentos operacionais padrão (POP)**:

- Garantir que tarefas diárias ou recorrentes sejam **executadas** e **registadas** com data, responsável e evidências quando exigidas.
- Permitir **visão do gerente** sobre conclusões, mídias e correções com rastreabilidade.
- Oferecer **PWA** instalável, com **uso parcial offline** e **notificações** quando configurado (ver [especificacao-sistema.md — secção PWA](especificacao-sistema.md)).

**Perfis:**

- **Funcionário (`employee`)**: executa checklist (tarefas visíveis ao seu setor/turno).
- **Gerente (`manager`)**: cadastra tarefas, setores, turnos e utilizadores; acede ao painel, exportações e correções.

---

## 2. Atores

| Ator | Descrição |
|------|------------|
| **Funcionário** | Utilizador com `role = employee`; autentica-se na PWA; conclui ou desfaz tarefas no checklist. |
| **Gerente** | Utilizador com `role = manager`; gere configuração e monitoriza operações. |
| **Sistema (API)** | Laravel: valida regras, persiste dados, integra armazenamento de mídia, agenda jobs. |
| **Sistema (PWA)** | Browser + Service Worker: cache, offline, sincronização de fila, push no cliente. |

---

## 3. Casos de uso

### UC-01 — Autenticar-se

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Funcionário ou Gerente |
| **Pré-condições** | Conta existente; API disponível (primeiro login pode exigir rede). |
| **Fluxo principal** | 1. Utilizador insere email e palavra-passe. 2. Cliente chama `POST /api/auth/login`. 3. API devolve token Bearer e dados do utilizador. 4. Cliente guarda token e sessão (ex.: `localStorage`). |
| **Pós-condições** | Acesso a rotas protegidas conforme papel. |
| **Exceções** | Credenciais inválidas; erro de rede (mensagem adequada na UI). |

### UC-02 — Visualizar checklist do dia

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Funcionário |
| **Pré-condições** | Autenticado. |
| **Fluxo principal** | 1. Cliente pede `GET /api/tasks?type=daily` e `GET /api/task-logs?date=hoje`. 2. API aplica filtros de setor/turno para funcionário. 3. UI lista tarefas com estado concluído/pendente. |
| **Exceções** | Offline: dados podem vir de cache local conforme implementação em [`offlineCache`](../frontend/src/lib/offlineCache.ts). |

### UC-03 — Concluir tarefa com observação e mídia

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Funcionário |
| **Pré-condições** | Tarefa pendente; regras `requires_photo` / `requires_observation` satisfeitas na UI. |
| **Fluxo principal** | 1. Utilizador anexa foto(s)/vídeo(s) opcional ou obrigatório. 2. Opcional: preenche observação. 3. Cliente envia `POST /api/task-logs` (multipart com `media[]`). 4. API valida visibilidade da tarefa, grava `TaskLog` e armazena mídia. 5. UI atualiza estado (e pode mostrar progresso de upload). |
| **Exceções** | Offline: fila local com imagens em base64; **vídeo exige rede**. Erro de validação ou armazenamento: mensagem ao utilizador. |

### UC-04 — Desfazer conclusão (voltar a pendente)

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Funcionário |
| **Fluxo principal** | Envio de `POST /api/task-logs` com `status=pending` para o par utilizador/tarefa/data; UI remove conclusão localmente após sucesso. |
| **Exceções** | Offline: enfileirar operação para sincronizar quando online. |

### UC-05 — Visualizar painel do gerente

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Gerente |
| **Fluxo principal** | Acede à rota `/dashboard`; lista logs do dia com filtros; visualiza mídias em modal; pode **corrigir** log (status + justificativa) via API. |
| **Regras** | Apenas `manager` acede a esta rota no frontend; endpoints de correção protegidos com middleware `manager`. |

### UC-06 — Exportar registos

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Gerente |
| **Fluxo principal** | Chama `GET /api/task-logs/export` com parâmetros (data, formato CSV/XLSX, etc.); descarrega ficheiro. |

### UC-07 — Gerir tarefas, setores, turnos e utilizadores

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Gerente |
| **Fluxo principal** | CRUD via endpoints sob middleware `manager` (`/tasks`, `/sectors`, `/shifts`, `/users`). |
| **Inclui** | Definir `requires_photo`, `requires_observation`, `notification_time`, vínculos a setor/turno. |

### UC-08 — Utilizar assistente de voz

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Utilizador autenticado (conforme implementação do widget) |
| **Fluxo principal** | Cliente envia áudio ou texto para `POST /api/voice-assistant`; API interpreta e responde com ferramentas limitadas à visibilidade do utilizador. |

### UC-09 — Subscrever notificações push

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Utilizador autenticado |
| **Fluxo principal** | Cliente obtém chave VAPID (`GET /api/vapid-public-key`), regista subscrição no browser e envia `POST /api/push-subscriptions`. |
| **Detalhe** | Ver [modelo-dados — sequência push](modelo-dados.md) e [PLANO_NOTIFICACOES_PUSHER.md](PLANO_NOTIFICACOES_PUSHER.md). |

### UC-10 — Receber atualizações em tempo real na UI

| Campo | Conteúdo |
|-------|----------|
| **Ator** | Cliente PWA |
| **Fluxo principal** | Com Pusher/Echo configurado, canal relevante recebe eventos (ex.: novo log) e o checklist/painel atualiza sem recarregar a página. |

---

## 4. Requisitos funcionais (RF)

| ID | Requisito |
|----|------------|
| RF-01 | O sistema deve autenticar utilizadores com email e palavra-passe e emitir token API (Sanctum). |
| RF-02 | O sistema deve distinguir papéis `employee` e `manager` e restringir rotas HTTP e páginas conforme o papel. |
| RF-03 | O funcionário deve ver apenas tarefas cujo `sector_id` e `shift_id` são compatíveis com o seu perfil ou `null` na tarefa (escopo global parcial). |
| RF-04 | O gerente deve poder listar todas as tarefas e todos os logs pertinentes ao negócio exportado. |
| RF-05 | O sistema deve permitir registar `TaskLog` com estados que refletem conclusão, pendência e correção. |
| RF-06 | O sistema deve aceitar múltiplos ficheiros de mídia por log, com tipos e tamanhos validados na API (imagens e vídeos suportados). |
| RF-07 | O sistema deve exigir observação e/ou mídia quando `requires_observation` ou `requires_photo` estiverem ativos na tarefa. |
| RF-08 | O gerente deve poder **corrigir** um log com motivo obrigatório e registo de auditoria (`corrected_at`, `corrected_by`). |
| RF-09 | O gerente deve poder CRUD de tarefas, setores, turnos e utilizadores via API. |
| RF-10 | O gerente deve poder exportar logs em pelo menos um formato tabular (CSV/XLSX) via endpoint dedicado. |
| RF-11 | O sistema deve oferecer endpoint de assistente de voz compatível com o widget do frontend. |
| RF-12 | O sistema deve permitir registo e remoção de subscrições Web Push associadas ao utilizador autenticado. |
| RF-13 | A PWA deve permitir concluir tarefas em modo offline para cenários apoiados (mídia imagem em base64 na fila), sincronizando ao voltar online. |
| RF-14 | O sistema deve limitar acesso a detalhes de tarefa (`show`) e criação de log às tarefas visíveis ao utilizador ([TaskVisibilityService](../api/app/Services/TaskVisibilityService.php)). |

---

## 5. Requisitos não funcionais (RNF)

| ID | Requisito |
|----|------------|
| RNF-01 — **Segurança** | Comunicação HTTPS em produção; tokens Bearer; CORS configurável; palavras-passe com hash; validação de uploads. |
| RNF-02 — **Integridade** | Logs não são apagados de forma silenciosa; correções são explícitas com justificativa. |
| RNF-03 — **Desempenho** | Upload de mídia pode ser monitorizado no cliente (XHR); limites de tamanho na API (ex.: 50 MB por ficheiro) protegem o servidor. |
| RNF-04 — **Disponibilidade / PWA** | Shell da aplicação e políticas de cache no Service Worker melhoram uso com conectividade instável; detalhes em **[especificacao-sistema.md — secção 4](especificacao-sistema.md)**. |
| RNF-05 — **Acessibilidade** | Recursos opcionais de voz/ditado e componentes com foco em uso prático em campo (evoluir continuamente). |
| RNF-06 — **Idioma** | Interface orientada a `pt-BR` (manifest e cópias). |
| RNF-07 — **Operações** | Agendamento de comandos/jobs no Laravel (ex.: lembretes) conforme [`bootstrap/app.php`](../api/bootstrap/app.php). |
| RNF-08 — **Manutenibilidade** | Documentação versionada em `docs/` e [CHANGELOG](../CHANGELOG.md); README e índice [docs/README.md](README.md). |
| RNF-09 — **Observabilidade** | Erros de upload e integrações podem ser registados em logs da API para diagnóstico. |

---

## 6. Catálogo de funcionalidades

| Funcionalidade | Descrição | Frontend | Backend (referência) |
|----------------|-----------|----------|----------------------|
| Login / logout | Autenticação token | `Login.tsx`, `AuthContext.tsx` | `AuthController`, Sanctum |
| Checklist diário | Lista tarefas e estado do dia | `Checklist.tsx` | `TaskController@index`, `TaskLogController@index` |
| Upload mídia + progresso | Fotos/vídeos, offline parcial | `Checklist.tsx`, `UploadProgressPanel.tsx`, `api.ts` | `TaskLogController@store`, `MediaStorageService` |
| Painel gerente | Visão do dia, filtros, mídia | `Dashboard.tsx` | `TaskLogController`, `correct` |
| Gestão de tarefas | CRUD POP | `TaskManage.tsx` | `TaskController` (rotas manager) |
| Configurações | Utilizadores, setores, turnos | `Settings.tsx` | `UserController`, `SectorController`, `ShiftController` |
| Exportação CSV/XLSX | Relatório de logs | `Dashboard.tsx` | `TaskLogController@export` |
| Assistente de voz | Interação por voz | `VoiceAssistantWidget.tsx` | `VoiceAssistantController` |
| Offline / fila | Sincronização adiada | `lib/offline.ts`, `offlineCache.ts` | Mesmos endpoints quando online |
| PWA / SW | Cache, atualização, push handler | `sw.ts`, `vite.config.ts`, `ReloadPrompt.tsx` | — |
| Tempo real UI | Echo / Pusher | `echo.ts`, `useRealtimeTasks.ts` | `TaskLogCreated` (eventos) |
| Web Push API | Subscrição e envio | `webPush.ts` | `PushSubscriptionController`, `WebPushService`, jobs |
| Acessibilidade | Ditado / speak | `A11yContext`, `Speakable.tsx` | — |
| Debug mídia (diagnóstico) | Inspecionar paths/storage | — | `DebugMediaController` |

---

## 7. Referências cruzadas

- [Índice da documentação](README.md)  
- [Modelo de dados e diagramas](modelo-dados.md)  
- [Arquitetura](architecture.md)  
- [API](api.md)  

---

*Documento normativo-descritivo: em caso de divergência com o código, o comportamento implementado deve prevalecer até atualização deste ficheiro.*

---

## Fonte: docs/architecture.md

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

---

## Fonte: docs/modelo-dados.md

# Modelo de dados e diagramas — Tasks POP

Este documento descreve as **entidades persistidas**, atributos principais, relacionamentos e diagramas em [Mermaid](https://mermaid.js.org/). Para regras de negócio e casos de uso, ver [requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md).

---

## 1. Diagrama de contexto do sistema

Vislumbre dos componentes externos e do backend.

```mermaid
flowchart LR
  subgraph client [Cliente]
    Browser[Browser_PWA]
  end
  subgraph api_layer [API_Laravel]
    Laravel[Laravel_APP]
  end
  subgraph data [Persistencia]
    DB[(Database_SQLite_PG)]
  end
  subgraph external [Servicos_externos]
    Cloudinary[Cloudinary]
    Pusher[Pusher]
  end
  subgraph push_infra [Push]
    WPP[Web_Push_infrastructure]
  end
  Browser -->|HTTPS_REST_Bearer| Laravel
  Laravel --> DB
  Laravel -->|Upload_midia| Cloudinary
  Browser <-->|WebSocket_Echo| Pusher
  Browser <-->|PushManager_VAPID| WPP
  Laravel -->|enviar_notificacoes| WPP
```

- **Cloudinary**: opcional em produção para armazenar mídia de comprovantes; fallback em disco `public` local.
- **Pusher**: tempo real na interface (ex.: atualização de logs); independente de Web Push no dispositivo.
- **Web Push**: serviços do browser/provedor de push; a API guarda subscrições e dispara notificações conforme jobs/agendamento.

---

## 2. Diagrama entidade-relacionamento (domínio principal)

```mermaid
erDiagram
  users ||--o{ task_logs : "regista"
  users }o--|| sectors : "pertence"
  users }o--|| shifts : "pertence"
  users ||--o{ push_subscriptions : "tem"
  tasks ||--o{ task_logs : "gera"
  tasks }o--o| sectors : "opcional"
  tasks }o--o| shifts : "opcional"
  tasks }o--o| users : "atribuicao_opcional"

  users {
    bigint id PK
    string name
    string email UK
    string password
    string role
    bigint sector_id FK
    bigint shift_id FK
    timestamps
  }

  sectors {
    bigint id PK
    string name
    string slug UK
    boolean active
    timestamps
  }

  shifts {
    bigint id PK
    string name
    string slug UK
    time start_time
    time end_time
    boolean active
    timestamps
  }

  tasks {
    bigint id PK
    string name
    string type
    string recurrence
    date due_date
    text description
    boolean requires_photo
    boolean requires_observation
    int min_interval_minutes
    time notification_time
    int order
    boolean active
    bigint sector_id FK
    bigint shift_id FK
    bigint user_id FK
    timestamps
  }

  task_logs {
    bigint id PK
    bigint user_id FK
    bigint task_id FK
    date log_date
    datetime completed_at
    text observation
    string photo_path
    json media_paths
    string status
    datetime corrected_at
    text correction_reason
    bigint corrected_by FK
    timestamps
  }

  push_subscriptions {
    bigint id PK
    bigint user_id FK
    string endpoint
    json keys
    string user_agent
    timestamps
  }
```

**Nota:** `personal_access_tokens` (Sanctum) existe na base de dados para tokens API; não aparece no ER de negócio acima. Ver migration em `api/database/migrations/`.

---

## 3. Entidades e tabelas

### 3.1 `users`

Utilizador autenticável (funcionário ou gerente).

| Atributo (lógico) | Descrição |
|-------------------|-----------|
| `id` | Chave primária |
| `name`, `email` | Identificação; email único |
| `password` | Armazenado com hash (cast Eloquent) |
| `role` | `employee` \| `manager` |
| `sector_id`, `shift_id` | Opcionais; escopo operacional do funcionário |
| `email_verified_at` | Opcional (ver migration users) |

**Relacionamentos:** `belongsTo` Sector, Shift; `hasMany` TaskLog; `hasMany` PushSubscription (via modelo).

---

### 3.2 `sectors`

Setor operacional (ex.: produção, copa).

| Atributo | Descrição |
|----------|------------|
| `name`, `slug` | Nome e identificador URL único |
| `active` | Ativo/inativo |

---

### 3.3 `shifts`

Turno de trabalho.

| Atributo | Descrição |
|----------|------------|
| `name`, `slug` | Nome e identificador único |
| `start_time`, `end_time` | Janela opcional |
| `active` | Ativo/inativo |

---

### 3.4 `tasks`

Definição de tarefa POP (diária, semanal, etc.).

| Atributo | Descrição |
|----------|------------|
| `name`, `type`, `recurrence` | Nome; `type` herdado do domínio; `recurrence`: single, daily, weekly, monthly |
| `due_date` | Para tarefas pontuais (`single`) |
| `description` | Texto livre |
| `requires_photo`, `requires_observation` | Obrigatoriedade de mídia e observação |
| `min_interval_minutes` | Intervalo mínimo entre conclusões (regra de produto) |
| `notification_time` | Hora sugerida para lembrete (integração com notificações) |
| `order` | Ordenação na UI |
| `active` | Tarefa visível ou não |
| `sector_id`, `shift_id` | `null` = aplica a todos os setores/turnos elegíveis |
| `user_id` | Atribuição opcional a um utilizador específico |

**Relacionamentos:** `hasMany` TaskLog; `belongsTo` Sector, Shift, User (opcional).

---

### 3.5 `task_logs`

Registo diário (por utilizador e tarefa) de execução.

| Atributo | Descrição |
|----------|------------|
| `user_id`, `task_id`, `log_date` | Unicidade composta `(user_id, task_id, log_date)` |
| `completed_at` | Momento da conclusão, se aplicável |
| `observation` | Texto livre |
| `photo_path` | Legado; primeira mídia ou URL única legada |
| `media_paths` | JSON: array de objetos com `url` e `type` (`image` \| `video`) |
| `status` | `pending`, `completed`, `corrected` (e variantes usadas na API) |
| `corrected_at`, `correction_reason`, `corrected_by` | Rastreio de correção pelo gerente |

**Relacionamentos:** `belongsTo` User, Task; `belongsTo` User `correctedByUser`.

---

### 3.6 `push_subscriptions`

Subscrição Web Push de um utilizador (endpoint + chaves).

| Atributo | Descrição |
|----------|------------|
| `user_id` | Dono da subscrição |
| `endpoint` | URL do serviço de push |
| `keys` | JSON (`p256dh`, `auth`) |
| `user_agent` | Opcional, para diagnóstico |

**Restrição:** único por `(user_id, endpoint)`.

---

## 4. Diagrama de sequência — Concluir tarefa com mídia (online)

Fluxo simplificado: cliente autenticado envia `multipart/form-data` e a API persiste mídia (Cloudinary ou disco `public`).

```mermaid
sequenceDiagram
  participant U as Funcionario_PWA
  participant API as Laravel_API
  participant MS as MediaStorageService
  participant ST as Storage_Cloudinary_Local
  participant DB as Database

  U->>API: POST_task_logs_FormData_task_id_status_media
  API->>API: Autenticar_Sanctum_validar_regras_visibilidade
  API->>MS: store_cada_ficheiro
  MS->>ST: Upload_ou_store_public_disk
  ST-->>MS: URL_ou_path
  MS-->>API: Metadados_midia
  API->>DB: INSERT_task_logs_media_paths
  DB-->>API: TaskLog_persistido
  API-->>U: JSON_200_com_data_tasklog
```

---

## 5. Diagrama de sequência — Registar subscrição Web Push

```mermaid
sequenceDiagram
  participant U as Browser_PWA
  participant API as Laravel_API
  participant DB as Database

  U->>API: GET_vapid_public_key
  API-->>U: Chave_publica_VAPID
  U->>U: PushManager_subscribe
  U->>API: POST_push_subscriptions_endpoint_keys
  API->>DB: UPSERT_push_subscriptions_user_endpoint
  DB-->>API: OK
  API-->>U: 201_200
```

---

## 6. Referências no código

- Models Eloquent: [`api/app/Models/`](../api/app/Models/)
- Migrations: [`api/database/migrations/`](../api/database/migrations/)
- Visibilidade de tarefas / logs: [`api/app/Services/TaskVisibilityService.php`](../api/app/Services/TaskVisibilityService.php)

---

*Última atualização: alinhado às migrations e models do repositório `api/`.*

---

## Fonte: docs/especificacao-sistema.md

# Especificação e documentação — Tasks POP

Este documento consolida a visão do sistema, **boas práticas de documentação** aplicáveis a aplicações web, o **mapeamento dessas práticas neste repositório** e uma descrição detalhada da **funcionalidade PWA** (Progressive Web App).

---

## 1. Introdução

**Tasks POP** é um sistema de checklists operacionais (POP) para controle de tarefas diárias ou recorrentes, com foco em operações de food service: rastreabilidade, evidências em mídia e perfis de funcionário e gerente.

| Camada | Local no repositório | Tecnologia |
|--------|----------------------|------------|
| API | [`api/`](../api/) | Laravel, Sanctum, REST |
| Cliente | [`frontend/`](../frontend/) | React, Vite, PWA |

Documentação complementar: [Índice docs/](README.md), [Requisitos e casos de uso](requisitos-e-casos-de-uso.md), [Modelo de dados](modelo-dados.md), [Arquitetura](architecture.md), [API](api.md), [Deploy](deployment.md), [Decisões](decisions.md), [Plano de notificações](PLANO_NOTIFICACOES_PUSHER.md), [CHANGELOG](../CHANGELOG.md).

---

## 2. Boas práticas de documentação de aplicações web

A documentação de software bem estruturada costuma seguir princípios reconhecidos na indústria e na comunidade técnica. Abaixo estão os tópicos mais relevantes para **aplicações web** (SPA/PWA + API), com o que cada um exige na prática.

### 2.1 Público e propósito por tipo de conteúdo

Uma prática consolidada (incluindo o framework **Diátaxis**) é separar o material segundo **o que o leitor precisa fazer**:

| Tipo | Objetivo do leitor | Exemplos neste projeto |
|------|-------------------|-------------------------|
| **Tutorial** | Aprender fazendo, passo a passo | README “Início rápido”, comandos `migrate` / `npm run dev` |
| **Como fazer (how-to)** | Resolver um problema específico | [deployment.md](deployment.md) (SPA fallback, storage 403) |
| **Referência** | Consultar contratos e comportamento exato | [api.md](api.md), rotas em `api/routes/api.php` |
| **Explicação** | Entender decisões e contexto | [decisions.md](decisions.md), [architecture.md](architecture.md) |

Evitar misturar tutorial com referência na mesma página reduz duplicação e facilita manutenção.

### 2.2 README na raiz

- **Visão em uma página**: o que é o produto, como subir ambiente local, links para docs.
- **Pré-requisitos** (Node, PHP, Composer).
- **Variáveis de ambiente** apontando para `.env.example` sem expor segredos.

### 2.3 Contrato da API

- Endpoints, métodos HTTP, autenticação, formatos de erro.
- Manter **alinhamento com o código**; quando divergir, priorizar o código ou registrar débito técnico na documentação.

### 2.4 Arquitetura e diagramas

- **Diagramas de contexto** (quem fala com quem: browser, API, BD, serviços externos).
- **Modelo de dados** ou ER para entidades e cardinalidade.
- Ferramentas em texto (Mermaid em Markdown) versionam bem com Git.

### 2.5 Decisões arquiteturais (ADR)

- Registrar **decisões importantes** (formato curto: contexto, decisão, consequências), como em [decisions.md](decisions.md).

### 2.6 Changelog e versionamento

- [CHANGELOG](../CHANGELOG.md) com datas e categorias (Added / Changed / Fixed).
- Ajuda suporte e deploy a saber o que mudou entre releases.

### 2.7 Requisitos não funcionais na documentação

- **Segurança**: autenticação, CORS, validação de uploads (referência cruzada com controllers).
- **Desempenho**: caches, limites de payload, estratégias de rede no PWA.
- **Acessibilidade**: recursos como leitura de tela e fluxos equivalentes quando aplicável.

### 2.8 Glossário

- Termos de domínio (ex.: POP, task log, setor, turno) com definição curta evita ambiguidade entre produto e engenharia.

### 2.9 Manutenção contínua

- Documentação é **código**: revisar em PRs que alterem comportamento visível, API ou deploy.
- Um “único lugar” para decisões evita contradições entre README e docs/.

### 2.10 Síntese da literatura e prática recomendada (2024–2025)

Além do **Diátaxis** (secção 2.1), guias de documentação para equipas de produto e software enfatizam:

- **Leitura escaneável**: hierarquia clara (`#` / `##`), listas e tabelas; exemplos de pedidos e respostas onde fizer sentido ([api.md](api.md)).
- **Documentação “developer-first”**: reduzir tempo até ao primeiro sucesso com exemplos corretos e erros comuns (ex.: deploy e storage em [deployment.md](deployment.md)).
- **Ciclo de vida**: planear estrutura → redigir → rever → publicar → **atualizar** quando o código mudar (alinhado a [CHANGELOG](../CHANGELOG.md)).
- **Contrato de API evoluível**: descrição manual em Markdown é adequada ao tamanho atual do projeto; para crescimento, considerar **OpenAPI (Swagger)** como fonte gerada ou verificada em CI, reduzindo deriva entre código e docs.

Referências gerais: [Diátaxis](https://diataxis.fr/), documentação MDN e Web.dev sobre **PWA** (citadas na secção 5).

---

## 3. Como este repositório aplica essas práticas

| Boa prática | Onde está refletido |
|-------------|---------------------|
| Índice e navegação | [docs/README.md](README.md) |
| Início rápido | [README.md](../README.md) |
| RF, RNF, casos de uso, catálogo | [requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md) |
| Modelo de dados e diagramas | [modelo-dados.md](modelo-dados.md) |
| Deploy e troubleshooting | [deployment.md](deployment.md) |
| Referência de API | [api.md](api.md) + rotas Laravel |
| Arquitetura e dados | [architecture.md](architecture.md), este documento |
| Decisões | [decisions.md](decisions.md) |
| Histórico de mudanças | [CHANGELOG.md](../CHANGELOG.md) |
| Plano de feature (notificações) | [PLANO_NOTIFICACOES_PUSHER.md](PLANO_NOTIFICACOES_PUSHER.md) |

---

## 4. Progressive Web App (PWA)

O frontend é uma **PWA**: pode ser instalada na tela inicial, funciona com **service worker**, usa **manifest** web e combina **cache**, **offline parcial** e **notificações push** (Web Push), além de integração em tempo real para UI (Pusher/Echo) conforme configuração.

### 4.1 Requisitos gerais de PWA

- **HTTPS** em produção (obrigatório para service worker e push em browsers modernos).
- **Manifest** com nome, ícones, `display`, `theme_color`, escopo e `start_url`.
- **Service worker** registrado para controlar cache e eventos em segundo plano.

### 4.2 Ferramentas no projeto

| Item | Implementação |
|------|----------------|
| Build e plugin | [vite.config.ts](../frontend/vite.config.ts) — `vite-plugin-pwa` com estratégia **`injectManifest`** |
| Script do worker | [sw.ts](../frontend/src/sw.ts) (Workbox: precache, rotas, push) |
| Registro / atualização | `virtual:pwa-register/react` em [ReloadPrompt.tsx](../frontend/src/components/ReloadPrompt.tsx) |
| Manifest | Definido no plugin (nome, ícones, `standalone`, `pt-BR`, categorias) |
| Meta tags móveis | [index.html](../frontend/index.html) — `theme-color`, Apple touch icons, `viewport-fit` |

`registerType: 'autoUpdate'` permite que novas versões do SW sejam detectadas; o componente **ReloadPrompt** informa “App pronto para uso offline” ou “Nova versão disponível” com ações **Atualizar** / **Fechar**.

### 4.3 Service Worker: precache e rotas

- **Precache**: lista gerada no build (`__WB_MANIFEST`) para JS, CSS, HTML, fontes e ícones.
- **Navegação (SPA)**: requisições `navigate` servem `index.html` (evita 404 ao recarregar rotas do React Router).
- **API**: estratégia **NetworkFirst** com timeout de rede (cache nomeado `api-cache`) para chamadas `/api/` e host de API de produção configurado no SW.
- **Imagens / mídia**: **CacheFirst** para URLs `/storage/` e Cloudinary (`res.cloudinary.com`).

### 4.4 Instalação e experiência “app”

- `display: 'standalone'` e `display_override` permitem abrir sem barra do browser, próximo a um app nativo.
- Ícones **192/512** e **maskable** para adaptação a launchers e temas.
- `orientation: portrait` orienta uso principal em retrato (ajustável se o produto exigir landscape).

### 4.5 Offline e dados locais

- **Fila de envio** e utilitários em [`offline.ts`](../frontend/src/lib/offline.ts): enfileirar conclusões de tarefa quando sem rede (mídia em base64 para imagens; vídeo exige online).
- **Cache de leitura** em [`offlineCache.ts`](../frontend/src/lib/offlineCache.ts) para listas usadas no checklist e outras telas.
- **Sessão**: token e usuário em `localStorage`; offline o app pode usar usuário em cache ([AuthContext](../frontend/src/contexts/AuthContext.tsx)).

O service worker melhora **disponibilidade** da shell do app; a **lógica de negócio offline** (o que pode ser feito sem API) está no código da aplicação.

### 4.6 Notificações (Web Push)

- O SW escuta o evento **`push`** e exibe notificação com título/corpo; **`notificationclick`** foca ou abre janela na URL associada.
- O cliente obtém chave pública VAPID, subscreve via `PushManager` e envia a subscription à API ([webPush.ts](../frontend/src/lib/webPush.ts), endpoints em Laravel).

Isto é independente do **Pusher** usado para atualização em tempo real da interface (canal privado/público); ver [PLANO_NOTIFICACOES_PUSHER.md](PLANO_NOTIFICACOES_PUSHER.md).

### 4.7 Limitações e boas práticas de uso

- Tamanho e tipo de upload seguem validação na API (ex.: mídia em multipart).
- Primeira visita ou após limpar dados pode exigir rede para autenticar e popular caches.
- Atualizações do app: preferir o fluxo “Nova versão disponível” do ReloadPrompt para evitar versões antigas em cache.

---

## 5. Referências externas (documentação e PWA)

- **Diátaxis** — estrutura em quatro tipos de documentação: [diataxis.fr](https://diataxis.fr/)
- **MDN — Progressive web apps**: visão geral e APIs ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps))
- **Web.dev — PWA**: checklist e boas práticas ([web.dev/progressive-web-apps](https://web.dev/explore/progressive-web-apps))

---

## 6. Glossário rápido

| Termo | Significado |
|-------|-------------|
| POP | Procedimento operacional padrão; checklist operacional. |
| Task log | Registro diário de execução de uma tarefa (status, mídia, observação). |
| PWA | Aplicação web instalável, com SW e manifest, comportamento próximo ao nativo. |
| SW | Service Worker — script em segundo plano para cache e eventos push. |

---

*Última atualização: documentação de boas práticas, PWA e referências cruzadas com o código em `frontend/` e `api/`.*

---

## Fonte: docs/api.md

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

---

## Fonte: docs/deployment.md

# Deploy - Tasks POP

## Frontend (SPA)

O frontend é uma SPA (Single Page Application) com React Router. Para que rotas como `/login`, `/dashboard`, `/tasks` e `/settings` funcionem ao recarregar ou acessar diretamente, o servidor precisa servir `index.html` para todas as rotas não encontradas (fallback SPA).

### Netlify

O arquivo `frontend/public/_redirects` é copiado para o build e já contém:

```
/*    /index.html   200
```

### Vercel

O arquivo `frontend/vercel.json` configura o rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Nginx

Para deploy em servidor com nginx, configure o `location` do frontend:

```nginx
location / {
  root /caminho/para/frontend/dist;
  try_files $uri $uri/ /index.html;
}
```

### Apache

Para Apache, crie ou edite `.htaccess` na pasta do build:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## API (Laravel)

Consulte a documentação do Laravel para deploy em produção. O projeto usa Sanctum para autenticação; configure `APP_URL` e `SANCTUM_STATEFUL_DOMAINS` conforme o domínio do frontend.

### URLs de mídia (`/storage/...`) e erro 403

As fotos de task-logs ficam em `storage/app/public/task-logs/` e a URL pública é `https://<domínio-da-api>/storage/task-logs/<arquivo>`.

#### Causa comum no Laravel 11+ (este projeto)

Com `serve => true` no disco **`local`** (`storage/app/private`), o Laravel regista `GET /storage/{path}` para esse disco. O handler `Illuminate\Filesystem\ServeFile` trata-o como **privado** e exige URL assinada — pedidos normais (como `<img src="...">`) podem devolver **403** (ou **404** em `APP_ENV=production`), mesmo com o ficheiro a existir em `app/public`.

**Correção:** em `config/filesystems.php`, o disco `local` deve ter `'serve' => false` e o disco **`public`** (`storage/app/public`) deve ter `'serve' => true`. Assim a rota `storage.public` serve os ficheiros corretos com visibilidade pública.

#### Outros motivos de 403/404

1. **Symlink** `public/storage` → `storage/app/public` (`php artisan storage:link`) — útil para o servidor servir ficheiros em estático; se o pedido não encontrar ficheiro físico, o Laravel pode tratar via rota acima.  
2. **Apache** sem `FollowSymLinks` — pode bloquear o symlink; nesse caso o pedido cai no `index.php` e a rota `storage.public` ainda pode responder.  
3. **Permissões** — o utilizador do servidor web precisa de leitura em `storage/app/public` e nos ficheiros.  
4. **Cloudinary** — com `CLOUDINARY_URL` correto, as mídias tendem a ser URLs na nuvem; `/storage/...` é sobretudo fallback local.

### Verificação rápida

- `curl -I https://<sua-api>/storage/task-logs/<ficheiro>` — esperado **200** e `Content-Type` de imagem.  
- **403** com Laravel — verificar `filesystems` (`serve` em `local` vs `public`).  
- **404** — ficheiro em falta em `storage/app/public` ou caminho incorreto na base de dados.

---

## Fonte: docs/decisions.md

# Decisões Técnicas

## ADR-001: JWT em vez de Session

**Contexto**: API stateless para suportar PWA e futuramente React Native.

**Decisão**: Usar JWT com tymon/jwt-auth.

**Consequências**:
- Token no localStorage/AsyncStorage
- Refresh token para renovação
- Logout = invalidar token no client (blacklist opcional no backend)

---

## ADR-002: PWA antes de React Native

**Contexto**: Time e complexidade de manutenção.

**Decisão**: Começar com PWA (React + Vite + Workbox). Mobile nativo depois.

**Consequências**:
- Um app web responsivo
- Instalável no celular
- Funciona offline (fase 2)
- Menos código para manter inicialmente

---

## ADR-003: Foto opcional vs obrigatória

**Contexto**: Evitar "marquei sem fazer" em tarefas críticas.

**Decisão**: Campo `requires_photo` na tabela `tasks`. Tarefas críticas = true.

**Consequências**:
- Flexibilidade por tarefa
- UX mais simples para tarefas não críticas
- Gerente define quais tarefas exigem foto

---

## ADR-004: Sem soft delete em task_logs

**Contexto**: Auditoria e compliance.

**Decisão**: TaskLog nunca deletado. Correções com `corrected_at`, `correction_reason`, `corrected_by`.

**Consequências**:
- Histórico completo
- Alinhado com normas de segurança alimentar
- Possível campo `status` = completed | corrected | pending

---

## Fonte: docs/PLANO_NOTIFICACOES_PUSHER.md

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

---

## Fonte: CHANGELOG.md (raiz do repositório)

# Changelog

## [2026-03-26]

### Added

- **Documentação**: [docs/COMPILADO.md](docs/COMPILADO.md) — ficheiro único com README raiz, índice `docs/`, requisitos, arquitetura, modelo de dados, especificação, API, deploy, decisões, plano Pusher e CHANGELOG; script [scripts/compile-docs.sh](scripts/compile-docs.sh) para regenerar.

### Changed

- **README.md** e **docs/README.md**: links para o compilado e instrução de regeneração.

---
## [2026-03-25]

### Added

- **Documentação**: índice [docs/README.md](docs/README.md) (Diátaxis); [docs/modelo-dados.md](docs/modelo-dados.md) (entidades, ER e diagramas Mermaid); [docs/requisitos-e-casos-de-uso.md](docs/requisitos-e-casos-de-uso.md) (RF, RNF, casos de uso, catálogo de funcionalidades).
- **Checklist**: botão **Vídeo** (`capture` + `accept` alinhado ao backend mp4/webm/mov); barra lateral com progresso de upload (XHR), animação de entrada/saída, estado “Concluído” visível 4s antes de fechar; toast de sucesso com 4s e animação de saída.
- **api.taskLogs.create**: suporte a `onUploadProgress` via `XMLHttpRequest` quando há ficheiros.

### Changed

- **README.md**: secção Documentação com link para o índice `docs/README.md` e novos documentos.
- **docs/architecture.md**: estrutura do projeto corrigida (`api/` em vez de `backend/`); link para `modelo-dados.md`.
- **docs/especificacao-sistema.md**: secção 2.10 (síntese de boas práticas); tabela da secção 3 com novos docs.
- **ToastContext**: IDs com `useRef`; duração configurável (`durationMs`); classe `toast-leaving` para animação ao desaparecer.
- **docs/deployment.md**: explicação da causa (discos `local` vs `public` e `serve`) e outros motivos de 403/404.

### Fixed

- **403 em `/storage/task-logs/...`**: o disco `local` tinha `serve => true`, pelo que o Laravel registava `GET /storage/*` sobre `storage/app/private` e `ServeFile` recusava pedidos sem assinatura. Passa a `serve => false` no `local` e `serve => true` no disco `public` (ficheiros em `storage/app/public`), alinhado com o Laravel 11+.

---
## [2025-03-20] (atualização 23 - Sistema de notificações implementado)

### Added

- **Web Push**: Infraestrutura completa para notificações com app fechado
  - Migration `notification_time` em tasks, tabela `push_subscriptions`
  - Endpoint `POST /api/push-subscriptions`, `GET /vapid-public-key`
  - Service Worker com handler `push` (injectManifest)
  - Registro de subscription após login
- **Lembrete de tarefa**: Command `tasks:check-reminders` (a cada 5 min) + Job `SendTaskReminderNotification`
- **Setor completou**: `SectorCompletionService` + Job `SendSectorCompletedNotification` (Web Push para gerentes)
- **Real-time**: Evento `TaskLogCreated`, canal Pusher `tasks-daily`, hook `useRealtimeTasks` em Checklist e Dashboard
- **Campo horário lembrete** no formulário de tarefa (TaskManage)

### Changed

- **docs/PLANO_NOTIFICACOES_PUSHER.md**: Atualizado com separação Pusher (UI) vs Web Push (notificações)

---
## [2025-03-20] (atualização 21 - Fix mídia não salva)

### Fixed

- **MediaStorageService**: fallback para disco local quando Cloudinary falha ou não retorna URL; evita mídia ser descartada silenciosamente
- **TaskLogController**: retorna 422 quando mídia obrigatória é enviada mas nenhum arquivo foi salvo; logs para rastrear upload (`TaskLog store: media`, `armazenamento falhou para arquivo`)
- **collectMediaFiles**: suporte a `media` como UploadedFile único e fallback para `media.0`, `media.1`

---
## [2025-03-20] (atualização 20 - Mídia no Dashboard e colunas)

### Fixed

- **Dashboard**: mídia (fotos) enviadas pelo funcionário passa a ser exibida para o gerente; normalizeMediaUrls no backend garante URLs absolutas; frontend trata media_paths e URLs relativas
- **Dashboard**: colunas "Setor/Turno" e "Status" com min-width ampliada para melhor leitura

---
## [2025-03-20] (atualização 19 - Plano de melhorias Tasks POP)

### Added

- **Toast/tratamento de erros unificado**: ToastContext com provider global; toasts para erro, sucesso e info; substituição de `alert()` em Checklist, Dashboard, TaskManage, Settings
- **UI correção de logs**: botão "Corrigir" no Dashboard por linha de log; modal com novo status e motivo obrigatório; chamada a `api.taskLogs.correct`
- **Edição de usuários**: botão "Editar" em Settings/Usuários; modal com nome, e-mail, senha (opcional), função, setor, turno
- **Edição de setores**: botão "Editar" em Settings/Setores; modal para alterar nome do setor
- **TaskVisibilityService**: serviço centralizado para regras de visibilidade de tarefas (sector/shift/user)

### Changed

- **Dashboard**: filtros Setor, Turno e Tarefa aplicados à listagem (task_id enviado à API; setor/turno filtrados no cliente)
- **Dashboard**: catch silencioso no onOnline substituído por toast em caso de erro ao recarregar
- **TaskLogController**: validação de `observation` obrigatória quando `requires_observation` e status completed; autorização via TaskVisibilityService antes de registrar log
- **TaskController::show**: restringe acesso a tarefas visíveis ao usuário (retorna 404 se não visível)
- **VoiceAssistantTools**: getTaskDetails filtra tarefas com regras de visibilidade
- **App**: envolvido por ToastProvider; estilos .toast-container e .toast no App.css

### Fixed

- **Dashboard**: filtros existentes na UI agora afetam os dados exibidos
- **Segurança**: funcionários não podem registrar conclusão de tarefas de outros setores/turnos; nem acessar detalhes via assistente de voz
- **Backend**: validação de observação obrigatória no controller (não apenas frontend)

---

## [2025-03-20] (atualização 17 - .cpanel.yml)

### Added

- **.cpanel.yml**: configuração para deploy via Git no cPanel; tasks mínimas (echo) pois document roots apontam para api/public e frontend/dist dentro do repositório

---

## [2025-03-20] (atualização 16 - Offline completo e persistência de login)

### Added

- **Cache offline**: `lib/offlineCache.ts` para armazenar dados da API em localStorage (tasks, taskLogs, users, sectors, shifts, etc.)
- **Dados offline**: Checklist, Dashboard, TaskManage e Settings carregam dados do cache quando offline
- **Desfazer offline**: botão "Desfazer" na Checklist funciona offline e sincroniza ao reconectar
- **Sincronização ao reconectar**: ao voltar online, dados são atualizados automaticamente em todas as páginas

### Changed

- **AuthContext**: usuário permanece logado ao fechar/reiniciar o app; quando offline, usa usuário em cache em vez de deslogar
- **Persistência de login**: token e usuário em localStorage; sessão restaurada mesmo sem rede
- **api.ts**: export de task-logs usa `API_BASE` para consistência com subdomínio de produção

---

## [2025-03-20] (atualização 15 - Offline e 404)

### Fixed

- **Offline na primeira visita**: Workbox `navigateFallback` alterado de `/offline.html` para `/index.html`; quando o servidor retornava 404 para rotas SPA, o usuário via "Você está offline" mesmo estando online
- **404 ao recarregar**: adicionados `_redirects` (Netlify), `vercel.json` (Vercel) e documentação nginx/Apache para fallback SPA; todas as rotas passam a servir `index.html` e o React Router trata a rota corretamente

### Added

- **docs/deployment.md**: documentação de deploy com fallback SPA para Netlify, Vercel, nginx e Apache

---

## [2025-03-20] (atualização 14 - Câmera, Galeria, Vídeo)

### Added

- **Múltiplas fotos**: câmera e galeria permitem enviar 1 ou mais arquivos
- **Galeria**: texto "Enviar pelo dispositivo" no botão, seleção múltipla
- **Vídeo**: upload de vídeo (mp4, webm, mov) com Cloudinary
- **MediaStorageService**: suporte a image e video no Cloudinary
- **media_paths**: coluna JSON em task_logs para múltiplas mídias
- **Layout responsivo**: em mobile, Tirar foto + Enviar lado a lado; Concluir abaixo à direita

### Changed

- **Checklist**: estado `media` (array) em vez de `photo` (único)
- **API**: aceita `media[]` e `photo`, valida image/video até 50MB
- **Offline**: suporte a `media_base64[]` para múltiplas imagens (vídeo exige online)
- **Export**: coluna "Mídia" com URLs no CSV/Excel

---

## [2025-03-20] (atualização 13 - Subdomínios produção)

### Changed

- **API**: `APP_URL` e CORS configurados para taskspop-api.dcmmarketingdigital.com.br
- **Frontend**: `VITE_API_URL` em `.env.production` para API em subdomínio
- **CORS**: `api/config/cors.php` com origens permitidas (frontend + localhost)
- **Sanctum**: `SANCTUM_STATEFUL_DOMAINS` para taskspop.dcmmarketingdigital.com.br
- **PWA/Workbox**: runtimeCaching para requisições à API em subdomínio
- **README**: documentação de deploy com subdomínios

### Domínios

- Frontend: https://taskspop.dcmmarketingdigital.com.br
- API: https://taskspop-api.dcmmarketingdigital.com.br

---

## [2025-03-20] (atualização 12 - PHP 8.3)

### Changed

- **composer.json**: `config.platform.php: "8.3.0"` para compatibilidade com PHP 8.3
- **compose.yaml**: Sail usa runtime PHP 8.3 em vez de 8.5
- **Dependências**: Symfony 8.x downgrade para 7.4.x (compatível com PHP 8.3)

---

## [2025-03-20] (atualização 11 - Laravel Sail)

### Added

- **Laravel Sail**: ambiente Docker para desenvolvimento local (api/)
- **compose.yaml**: MySQL 8.4 + Laravel PHP 8.5
- **database_export.sql**: dump do banco (migrations + seeds) na raiz do projeto

### Changed

- **api/.env**: variáveis DB_* ajustadas para Sail (DB_HOST=mysql, DB_DATABASE=laravel, DB_USERNAME=sail)
- **api/.env.backup**: backup do .env original com credenciais de produção

### Technical

- `./vendor/bin/sail up -d` para subir containers
- `./vendor/bin/sail artisan migrate --force` e `db:seed --force`
- Export: `sail exec mysql mysqldump -u sail -ppassword laravel > ../database_export.sql`

---

## [2025-03-20] (atualização 10)

### Changed

- **Favicon**: ícone de raio discreto (#47bfff) simbolizando agilidade; ícones PWA regenerados

---

## [2025-03-20] (atualização 9 - PWA Nativo iOS/Android)

### Added

- **Câmera**: botão "Tirar foto" (capture="environment") + botão galeria (🖼️) para escolher imagem
- **Input único**: um input por tipo (câmera/galeria) compartilhado entre tarefas
- **Ícones iOS**: 180x180, 167x167, 152x152 para apple-touch-icon
- **Safe area**: padding env(safe-area-inset-*) em body e elementos fixos
- **Manifest**: display_override, id, prefer_related_applications

### Changed

- **Viewport**: viewport-fit=cover para tela edge-to-edge
- **Elementos fixos**: a11y-float, pwa-toast, voice-assistant com safe-area no bottom/right/left

---

## [2025-03-20] (atualização 8 - Cloudinary)

### Added

- **Cloudinary**: suporte opcional para armazenar fotos de comprovante na nuvem
- **PhotoStorageService**: abstração para local (public) ou Cloudinary
- **PWA**: cache de imagens Cloudinary (res.cloudinary.com) no runtime

### Technical

- cloudinary/cloudinary_php
- config/services.php: cloudinary (url, cloud_name, api_key, api_secret)
- Variáveis: CLOUDINARY_URL ou CLOUDINARY_CLOUD_NAME + API_KEY + API_SECRET

---

## [2025-03-20] (atualização 7 - PWA Best Practices)

### Added

- **PWA**: ícones PNG 192x192 e 512x512 (any + maskable)
- **PWA**: meta tags theme-color, Apple (apple-mobile-web-app-*, apple-touch-icon)
- **PWA**: página offline customizada (offline.html)
- **PWA**: fila offline com suporte a fotos (base64 na fila, sync com FormData)
- **PWA**: cache de imagens de comprovante (/storage/)
- **PWA**: ReloadPrompt (toast "App pronto para uso offline" / "Nova versão disponível")
- **Performance**: code splitting com React.lazy (Dashboard, Login, Settings, TaskManage)
- **Performance**: loading="lazy" e decoding="async" em imagens de comprovante

### Changed

- **API**: API_BASE em produção usa `window.location.origin` (corrige localhost hardcoded)
- **Manifest**: orientation portrait, categories, lang pt-BR, scope
- **Workbox**: navigateFallback para offline.html, runtimeCaching para /storage/

### Technical

- fileToBase64, base64ToBlob em offline.ts
- QueuedTaskLog com photo_base64 e photo_mime
- vite-plugin-pwa/react useRegisterSW para prompt de atualização

---

## [2025-03-20] (atualização 6)

### Changed

- **Checklist**: botões "Tirar foto" e "Concluir" lado a lado na mesma linha

---

## [2025-03-20] (atualização 5 - Acessibilidade e Assistente de Voz)

### Added

- **Acessibilidade**: A11yProvider, A11yToggle (Ouvir, Falar, Simplificado)
- **TTS/STT**: Web Speech API para leitura em voz alta e ditado
- **Speakable**: botão "Ouvir" em textos (Checklist, Login, Settings, TaskManage)
- **Modo simplificado**: fonte maior, contraste, cards ampliados
- **Assistente de voz**: VoiceAssistantWidget flutuante com OpenAI
  - Tools: get_pending_tasks, get_completed_tasks, get_all_tasks_today, get_task_details
  - Resposta em áudio (OpenAI TTS) ou Web Speech API como fallback
  - Botão "Ouvir" em cada resposta da IA
  - Microfone para entrada por voz (quando STT ativado)
- **Regra**: aviso "Confirme com um gerente antes de executar" em perguntas de como fazer

### Technical

- openai-php/laravel, VoiceAssistantTools, VoiceAssistantController
- POST /api/voice-assistant
- A11yContext, Speakable, VoiceAssistantWidget

---

## [2025-03-20] (atualização 4)

### Changed

- **Responsivo**: painel adaptado para desktop e mobile (media queries 768px, 480px)
- **Selects**: setores e turnos inativos não aparecem nos selects de criar tarefas e usuários
- **Setores**: toggle Ativar/Desativar (consistente com turnos)

### Technical

- TaskManage e Settings filtram `active !== false` em setores/turnos
- CSS: nav wrap, filters column, table scroll, forms stack, touch targets

---

## [2025-03-20] (atualização 3 - Roadmap)

### Added

- **Exportação**: botão Exportar CSV/Excel no Dashboard (filtros aplicados)
- **Ranking**: seção "Ranking da semana" no Dashboard com top 5 funcionários
- **Filtro por tarefa**: dropdown no Dashboard para filtrar por tarefa específica
- **PWA**: vite-plugin-pwa, manifest, service worker, cache de API
- **Offline**: fila de task logs quando offline, sync ao reconectar
- **Tempo mínimo entre tarefas**: coluna `min_interval_minutes`, validação no backend
- **Lembretes por e-mail**: job diário às 08:00 enviando resumo de tarefas pendentes para gerentes

### Technical

- maatwebsite/excel para exportação
- TaskLogsExport, TaskReminderMail, SendTaskReminders job
- Schedule em bootstrap/app.php

---

## [2025-03-20] (atualização 2)

### Added

- **Gerenciar Tarefas**: aba para criar/editar/remover tarefas
  - Recorrência: única, diária, semanal, mensal
  - Atribuição: setor, turno ou usuário específico
  - Foto e observação obrigatórias
- **Configurações**: página para gerenciar setores, turnos e usuários
  - CRUD setores
  - CRUD turnos (horário entrada/saída)
  - CRUD usuários (criar, remover)
- **Tarefas pendentes**: seção no dashboard com tarefas não feitas no dia anterior
- Task: recurrence, due_date, user_id, requires_observation

---

## [2025-03-20] (atualização)

### Added

- Setores (sectors): Produção, Copa, Atendimento, Estoque
- Turnos (shifts): Manhã, Tarde, Noite
- Usuários com `sector_id` e `shift_id`
- Tarefas com `sector_id` e `shift_id` (null = tarefa global)
- Filtro: funcionário vê apenas tarefas do seu setor e turno
- Gerente vê todas as tarefas
- API: GET /sectors, GET /shifts
- Dashboard: filtros por setor e turno na listagem de funcionários
- Checklist: exibe setor/turno do usuário e da tarefa

---

## [2025-03-20]

### Added

- Projeto inicial Tasks POP
- Backend Laravel 13 com Sanctum
- Autenticação por token (login/logout)
- CRUD de tarefas (tasks) - diárias/semanais
- Registro de execução (task_logs) com observação e foto
- Foto obrigatória para tarefas críticas (`requires_photo`)
- Painel do gerente com filtros por data e funcionário
- Frontend React com telas: Login, Checklist (funcionário), Dashboard (gerente)
- Seed com usuários e tarefas de exemplo
- Documentação: arquitetura, decisões, API

### Technical

- Migrations: users (role), tasks, task_logs
- Middleware `manager` para rotas restritas
- Auditoria: task_logs não deletáveis, correções com justificativa
