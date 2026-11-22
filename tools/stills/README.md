# Stills de episódios

Propõe e exporta stills a partir dos ficheiros de vídeo dos episódios, para posts e para o site.

Precisa de `ffmpeg`/`ffprobe` e do `sharp` (já instalado em `site/`). Corre a partir da pasta `site/` para o `sharp` ser encontrado:

```bash
cd site
node ../tools/stills/select-stills.mjs "/Volumes/DISCO/episodios" --out ~/Desktop/candidatos
node ../tools/stills/export-stills.mjs ~/Desktop/candidatos 012,047,103 --name portugal-criminal --out ~/Desktop/stills
```

1. `select-stills.mjs` encontra os cortes, tira um fotograma do meio de cada plano, retira os escuros, queimados, desfocados e repetidos, e escreve folhas de contacto numeradas (`folha-01.jpg`, …) e `candidates.json`. Só lê os vídeos.
2. Escolhem-se os números nas folhas.
3. `export-stills.mjs` exporta esses fotogramas na resolução do ficheiro original, sem mexer na grade (Rec.709 de vídeo para JPEG de gama completa). Fontes HDR (PQ/HLG) são convertidas para SDR e assinaladas; nesse caso é melhor exportar do entregável SDR.
