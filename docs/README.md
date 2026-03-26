# Índice da documentação — Tasks POP

Este diretório segue a ideia do **[Diátaxis](https://diataxis.fr/)**: separar o material pelo que o leitor pretende fazer (aprender, resolver um problema, consultar um contrato ou entender o contexto). Para visão de produto, requisitos e modelo de dados, use os documentos listados em **Produto e análise**.

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
| Subir o projeto em dev | [README](../README.md) |
| Corrigir 403 em mídia em produção | [deployment.md](deployment.md) |
| Ver regras de visibilidade / negócio | [requisitos-e-casos-de-uso.md](requisitos-e-casos-de-uso.md) + [architecture.md](architecture.md) |
| Consultar modelo de BD | [modelo-dados.md](modelo-dados.md) |
| Entender PWA, SW e offline | [especificacao-sistema.md](especificacao-sistema.md) — secção 4 |

---

*Manter este índice atualizado quando forem adicionados ficheiros relevantes em `docs/`.*
