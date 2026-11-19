# zemastudios.com

O site do estúdio. É gerado a partir de ficheiros de conteúdo, e esses ficheiros
editam-se num painel em `/admin/`. Para adicionar ou mudar um projeto não é
preciso mexer em código.

## Adicionar um projeto

1. Abrir `https://zemastudios.com/admin/` e entrar com o GitHub.
2. **Projetos → Novo projeto.** Preencher título, ano, formato e créditos,
   escolher a imagem de capa e arrastar os fotogramas.
3. **Guardar.** Isto faz um commit no repositório. O alojamento reconstrói o
   site e, cerca de um minuto depois, o projeto está online em
   `/trabalho/nome-do-projeto/`.

Os textos do site (apresentação, "Sobre", ficha técnica, contactos) estão em
**Estúdio e textos**.

Para esconder um projeto sem o apagar, basta desligar **Publicado**.

### Imagens

- Exportar fotogramas em **JPEG de qualidade máxima**, de preferência à
  resolução de entrega (até 4K). O build gera as versões para a web
  (640, 1280 e 1920 px), com croma 4:4:4 e mantendo o perfil de cor embutido,
  e o original fica no repositório como master.
- Não exportar PNG 4K: cada um tem cerca de 24 MB. O painel recusa ficheiros
  acima de 15 MB.
- Nas páginas de projeto os fotogramas aparecem **na proporção original**, sem
  corte (2.39, 1.85, vertical…). Só a grelha da página inicial recorta para
  16:9, para as miniaturas ficarem alinhadas.

### Se algo estiver mal preenchido

O build verifica cada projeto: título, ano, formato e se as imagens existem.
Se faltar alguma coisa, a publicação falha, aparece uma mensagem em português
no registo do alojamento e **a versão anterior do site continua no ar**.

## Como funciona

```
content/site.json          textos e contactos
content/projetos/*.json    um ficheiro por projeto (o nome do ficheiro é o URL)
media/                     imagens master
static/                    CSS, JS, logótipo, painel /admin/
build.mjs + templates.mjs  geram dist/
```

Gerar e ver localmente (Node 20 ou mais recente):

```bash
npm install
```

```bash
npm run dev
```

O site fica em http://localhost:8080.

O painel é o [Sveltia CMS](https://sveltiacms.app), que guarda o conteúdo no
próprio repositório do GitHub. Não há base de dados nem mensalidade.

## Alojamento

Recomendado: **Cloudflare Pages** (gratuito, sem custos de tráfego). Netlify
e Vercel também servem. As definições são as mesmas em qualquer um:

| Definição | Valor |
|---|---|
| Diretório raiz | `site` |
| Comando de build | `npm run build` |
| Pasta de saída | `dist` |
| Node | 20 ou mais recente |

O ficheiro `static/_headers` define a cache das imagens no Cloudflare Pages e
no Netlify.

### Login no painel

O GitHub só deixa uma página estática fazer login com a ajuda de um pequeno
serviço intermediário. Há duas opções:

- **Já, sem configurar nada:** no ecrã de entrada escolher *Sign in using
  access token* e colar um
  [token pessoal do GitHub](https://github.com/settings/personal-access-tokens/new)
  com acesso apenas a este repositório (Contents: read & write). Serve bem se
  só vocês os dois editarem.
- **Botão "Entrar com GitHub":** publicar o
  [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) num
  Cloudflare Worker gratuito (cerca de 10 minutos) e pôr o endereço em
  `base_url` no ficheiro `static/admin/config.yml`.

Em `static/admin/config.yml`, `branch` tem de ser o ramo que o alojamento
publica.

## Links antigos

O site anterior usava endereços como `/#project/oygb`. Esses links (em
Instagram, emails, etc.) são redirecionados para a página nova do projeto, com
base em `redirects.json`.
