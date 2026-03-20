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
