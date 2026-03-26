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
