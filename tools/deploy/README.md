# Deploy para a Netlify

O site `zemastudios.com` é o site Netlify `chimerical-druid-da574f` (id `7c085005-689e-429b-925e-7014d0cdfa49`). Ainda não está ligado ao repositório: publica-se a pasta `site/dist` pela API.

```bash
cd site && npm run build && cd ..
NETLIFY_AUTH_TOKEN=<token pessoal> node tools/deploy/netlify-deploy.mjs 7c085005-689e-429b-925e-7014d0cdfa49 site/dist --title "descrição"
```

`--draft` cria um rascunho (link próprio, sem mexer no domínio). Num ambiente com proxy, junte `NODE_USE_ENV_PROXY=1`.

Voltar atrás: na Netlify, Deploys → o deploy anterior → "Publish deploy". O site antigo (21 de maio de 2026) está também em `backups/site-netlify-2026-05-21/`.
