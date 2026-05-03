# Gene World — Site do jogo

<p align="center">
  <strong>RPG 2D • Mapa procedural • Manual do jogador</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-static-brown?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-stylesheet-blue?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/site-estático-✓-gold?style=flat-square&color=%23793202" alt="Estático">
</p>

Site **100% estático** (`HTML` + `CSS`) inspirado na interface pixel art do jogo — cores escuras, bordas douradas e tipografia [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P).  
Serve como **manual online**: biomas, inimigos, atributos, armas, materiais, poções, NPCs, mundo e Darkworld.

---

## ✨ Destaques

- Manual navegável por âncoras (ideal para celular e desktop)
- Sprites do jogo em `spritepngoutput/` apenas onde aparecem no layout (**assets reduzidos** para publicação)
- Seções: nove biomas, inimigos globais + totens, kits de arma (madeira), materiais (espadas + exemplo couro), **poções** com textos do jogo, NPCs fixos e andarilhos, mapa / SideWorld / Darkworld
- UI pensada para lembrar painéis do Gene World (janelas, slots, grid)

---

## 🚀 Como ver localmente

**Opção 1 — abrir direto**

Abra o ficheiro `index.html` no navegador (Chrome, Firefox, Edge).

**Opção 2 — servidor local simples** (útil se quiser testar caminhos ou ferramentas de preview)

```bash
npx serve .
```

Ou com Python:

```bash
python -m http.server 8080
```

Depois aceda a `http://localhost:8080`.

---

## 📁 Estrutura

```
gene-world-site/
├── index.html          # Página única do manual + redes
├── styles.css          # Tema e layout responsivo
├── spritepngoutput/    # Sprites PNG usados pelo HTML
├── gene.png            # Arte principal / marca no hero
├── icon.ico            # Favicon
└── README.md
```

*(Pastas como `.vercel` são opcionais, conforme o teu deploy.)*

---

## 🌐 Redes — `@geneworldgame`

| Plataforma | Link |
|------------|------|
| Instagram | [@geneworldgame](https://www.instagram.com/geneworldgame/) |
| TikTok | [@geneworldgame](https://www.tiktok.com/@geneworldgame) |
| Reddit | [u/geneworld](https://www.reddit.com/user/geneworld/) |
| YouTube | [@geneworldgame](https://www.youtube.com/@geneworldgame) |

---

## 📌 Repositório

GitHub: **[DouglasSilvar/gene-world-site](https://github.com/DouglasSilvar/gene-world-site)**

---

## 📄 Licença

Conteúdo e marca **Gene World** pertencem ao autor do jogo.  
Este repositório reflete o site público do projeto — ajusta a licença aqui se quiseres `MIT`, `CC-BY-NC-SA`, etc.
