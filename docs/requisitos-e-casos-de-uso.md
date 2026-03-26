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
