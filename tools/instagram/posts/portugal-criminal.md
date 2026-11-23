# Portugal Criminal — post e stories (aprovados para publicar, 2026-11-23)

Gerar a partir de `site/`:

```bash
node ../tools/instagram/prepare-post.mjs portugal-criminal --stills 1,2,4,6,8,10,12,13,17,21 --stories "1,6,12;8,13,2;10,17,4" --out <pasta>
```

- Carrossel: 10 stills, a abrir com o hero (corredor escuro).
- Stories: 3, hero no topo da primeira, plano de entrevista em baixo em todas; menções @zerebeloo @mariablbraga.
- Legenda:

```
Portugal Criminal
Documentary (2026)
Prod. Company: @reed_prod
Director: Ricardo Freitas
DoP: Marco Fernandes
```

Estado: post publicado a 2026-11-23 (https://www.instagram.com/p/DgGK8sRoHuQ/, 10 imagens). Stories não publicadas pela API: a conta @mariablbraga é privada e a API recusa a menção (erro 2207018); publicar na app com as menções.

Imagens já online (deploy 6b048bdf, 2026-11-23) em `https://zemastudios.com/ig/2026-11-23-portugal-criminal/` (`carrossel/01–10.jpg`, `stories/story-1–3.jpg`), conferidas por SHA-1 na API da Netlify. Atenção: `build.mjs` apaga `site/dist/ig/`; antes de qualquer outro deploy, regenerar e copiar `carrossel/` e `stories/` para lá de novo enquanto o post não estiver publicado.

Publicar (a partir da raiz do repositório, com a pasta gerada acima):

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/instagram/publish.mjs <pasta> --base-url https://zemastudios.com/ig/2026-11-23-portugal-criminal/ --check
```

Depois, sem `--check`: primeiro `--what post`, depois `--what stories`.
