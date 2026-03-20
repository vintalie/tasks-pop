# Changelog

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
