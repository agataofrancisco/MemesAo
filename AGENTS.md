# MemesAo — Notas para o agente

## Stack
- Frontend SPA (Vite + React) → `dist/`. Hospedado em Netlify (`memesao.ao`) com proxy `/api/*` e `/r2/*` para o Worker.
- Backend em Cloudflare Worker (`worker/src/index.ts`) com D1 (`memesao-db`) + R2 (`memes-ao`).
- Imagens servidas via Worker `/r2/<path>` com `Cache-Control: public, max-age=31536000, immutable`.

## Thumbnail pipeline (feed rápida)
- Upload (`UploadModal.tsx`) gera uma miniatura **no cliente** (canvas, max 480px, JPEG q=0.8) e envia como `file_thumb` em FormData.
- O Worker guarda em R2 sob `thumbs/<ts>-<rand>.jpg` e persiste `thumbnail_path` na tabela `memes`.
- `toMeme` devolve `thumbnail_url = thumbnail_path ? "/r2/${thumbnail_path}" : null`.
- A feed, a pesquisa, o admin e o modal usam `meme.thumbnail_url || meme.image_url`. O detalhe/modal mantém `image_url` (original).
- GIF/SVG/WEBP não recebem thumbnail (faz fallback ao original).
- Memes antigos (sem `thumbnail_path`) continuam a usar o original (cache imutável).

## Cloudflare API Token
- Não está persistido em ficheiro. É só passado por env em comandos (`$env:CLOUDFLARE_API_TOKEN="cfat_..."`).
- Para deploy/D1/R2: definir **CLOUDFLARE_API_TOKEN** e **CLOUDFLARE_ACCOUNT_ID** no mesmo comando.
- Account ID do projeto: ver `wrangler.toml`.

## Comandos úteis
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Migrar D1: `node node_modules/wrangler/bin/wrangler.js d1 execute memesao-db --command "..."` (com `--remote` para produção).
- Dev local: `node node_modules/wrangler/bin/wrangler.js dev --port 8787`
- Deploy: `node node_modules/wrangler/bin/wrangler.js deploy`

## Convenções
- Resposta/código em português.
- Não adicionar comentários ao código a menos que pedido.
- Não commitar segredos; `.dev.vars` é gitignored.