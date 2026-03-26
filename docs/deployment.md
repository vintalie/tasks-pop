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
