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

- **[Documentação completa (compilado único)](docs/COMPILADO.md)** — README, índice, requisitos, arquitetura, modelo de dados, especificação, API, deploy, decisões, plano de notificações e CHANGELOG (regenerar: `./scripts/compile-docs.sh`)
- **[Índice completo da documentação (Diátaxis)](docs/README.md)** — ponto de entrada para tutorials, how-to, referência, exploração e documentos de produto
- [Requisitos, casos de uso e catálogo de funcionalidades](docs/requisitos-e-casos-de-uso.md)
- [Modelo de dados e diagramas (Mermaid)](docs/modelo-dados.md)
- [Especificação do sistema, boas práticas de documentação e PWA](docs/especificacao-sistema.md)
- [Arquitetura](docs/architecture.md)
- [Decisões técnicas](docs/decisions.md)
- [API](docs/api.md)
- [Deploy](docs/deployment.md)
