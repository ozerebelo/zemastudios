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

## Alojamento (Netlify)

O domínio já está na Netlify. Não há base de dados: o conteúdo vive no
repositório e a Netlify reconstrói o site a cada commit.

1. **Ligar o repositório:** *Add new project → Import from Git → GitHub →*
   `ozerebelo/zemastudios`, no ramo que for publicado (ver `branch` em
   `static/admin/config.yml`).
2. **Definições de build** (o `netlify.toml` já as traz, basta o diretório base):

   | Definição | Valor |
   |---|---|
   | Base directory | `site` |
   | Build command | `npm run build` |
   | Publish directory | `site/dist` |

3. **Login no painel `/admin/` com GitHub** (uma vez):
   - No GitHub: *Settings → Developer settings → OAuth Apps → New OAuth App*.
     Homepage `https://zemastudios.com`, callback
     `https://api.netlify.com/auth/done`. Guardar o Client ID e gerar um Client secret.
   - Na Netlify: *Project configuration → Access & security → OAuth →
     Install provider → GitHub*, colar os dois valores.
   - O CMS já está configurado para usar a Netlify como intermediário (não é
     preciso `base_url`).

Até isto estar feito, também se pode entrar com um token pessoal do GitHub
(*Sign in using access token*).

### Custos

A Netlify cobra em créditos. Cada publicação gasta 15 e cada GB de tráfego
cerca de 10; o plano gratuito tem 300 por mês. Uma visita completa ao site
(página inicial inteira e um projeto) pesa cerca de 1,6 MB no computador e
0,7 MB no telemóvel, por isso o tráfego pesa pouco. **O que gasta créditos são
as publicações: cada "guardar" no painel é uma.** Com o plano gratuito contem
com uns 15 guardados por mês; acima disso, o plano Personal (9 USD/mês, 1000
créditos) chega com folga. Alternativa sem custos de publicação: Cloudflare
Pages, mantendo o domínio.

`static/_headers` define a cache das imagens (a Netlify lê-o).

## Links antigos

O site anterior usava endereços como `/#project/oygb`. Esses links (em
Instagram, emails, etc.) são redirecionados para a página nova do projeto, com
base em `redirects.json`.
