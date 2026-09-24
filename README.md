# Atlas AI

Landing page oficial do Atlas AI, editor de anúncios com inteligência artificial. Design em preto, branco e cinza, responsivo e sem dependências de build.

**Site:** https://dankeeps.github.io/atlas-ai-landing/

## Desenvolvimento local

```sh
python3 -m http.server 8124 --bind 127.0.0.1
```

Abra http://localhost:8124/.

## Publicação

O GitHub Pages publica a raiz da branch `main`. Novos commits nessa branch atualizam o site automaticamente. O arquivo `.nojekyll` mantém os arquivos estáticos sem processamento Jekyll.

## Arquivos

- `index.html`: landing page, instalação, perguntas frequentes e prévia do editor.
- `styles.css`: layout responsivo e identidade monocromática.
- `app.js`: abas de instalação, copiar comando, menu móvel e modal.
- `assets/`: favicon e captura real da biblioteca de templates.

Os comandos de instalação são apenas exibidos e copiados; a landing page não os executa. O editor usa a chave Anthropic do próprio usuário, com cobrança de uso pela API.

**Produto:** https://github.com/dankeeps/atlas-editor

## Verificação

```sh
node --check app.js
```
