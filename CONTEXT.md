> Documento de contexto para retomar o desenvolvimento em uma nova sessão. Atualizado sempre que um commit é registrado.
> 

## 1. Visão geral

**Nas Cinzas — V Rising** é uma adaptação de mesa-digital da mecânica do livro-jogo *Nas Cinzas* para o universo de V Rising. O protótipo usa cartas em grid 4×3, turnos de 3 rodadas e seleção sem repetir linha/coluna.

Stack simples: HTML + CSS + JavaScript vanilla, rodando localmente via Live Server.

## 2. Ambiente

- **Repositório local:** `C:\Users\Windows\OneDrive\V Rising\nas-cinzas-vrising`
- **Branch:** `main`
- **Servidor local:** Live Server (`http://127.0.0.1:5500`)
- **Editor:** VS Code
- **Commits:** Conventional Commits (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`, `chore:`)
- **Remoto:** ainda não configurado

## 3. Estrutura

```
nas-cinzas-vrising/
├── index.html
├── weapons.html
├── schools.html
├── characters.html
├── map-editor.html
├── style.css
├── app.js
├── board.js
├── effects.js
├── weapons.js
├── schools.js
├── characters.js
├── map-editor.js
├── data/
│   ├── weapons.json
│   ├── schools.json
│   └── characters.json
├── assets/icons/
│   ├── weapons/
│   ├── schools/
│   ├── abilities/
│   └── characters/
├── .gitignore
├── README.md
└── CONTEXT.md
```

## 4. Mecânica

- 12 cartas em grid **4 linhas × 3 colunas**.
- Turno = **3 rodadas**.
- A cada rodada, selecionar **3 cartas** sem repetir linha nem coluna.
- Cartas usadas voltam só no fim do turno.
- Ultimate = **L4C1**, vem da escola primária e **não volta até o fim do combate**.

### Slots

| Linha | Coluna 1 | Coluna 2 | Coluna 3 |
| --- | --- | --- | --- |
| 1 — Vampiro | `move` | `swap-weapon` | `vampire-power` |
| 2 — Arma | `move-attack` | `basic-attack` | `special-attack` |
| 3 — Primária | `veil` | `magic-1` | `magic-2` |
| 4 — Secundária | `ultimate` da primária | `magic-1` | `magic-2` |

## 5. Dados

### `data/weapons.json`

Array de armas. Cada arma tem:

- `id`, `name`, `icon`
- `baseDamage` (ex.: `6+1d6`)
- `abilities` com 3 slots: `move-attack`, `basic-attack`, `special-attack`

### `data/schools.json`

Array com 6 escolas:

- `blood` — Sangue — vermelho
- `frost` — Gelo — azul
- `unholy` — Profano — verde escuro
- `illusion` — Ilusão — ciano
- `storm` — Raio — amarelo
- `chaos` — Caos — roxo

Cada escola tem 4 habilidades: `veil`, `magic-1`, `magic-2`, `ultimate`.

### `data/characters.json`

Cada personagem referencia:

- `equippedWeapon`
- `inventory`
- `primarySchool`
- `secondarySchool`
- `vampireAbilities`

## 6. Assets

Caminhos padronizados:

- Personagens: `assets/icons/characters/{id}.png`
- Armas: `assets/icons/weapons/{id}.png`
- Escolas: `assets/icons/schools/{id}.png`
- Habilidades: `assets/icons/abilities/{ability-id}.png`

O código usa `<img>` com fallback: se o arquivo não existir, o placeholder tracejado continua visível; se existir, a imagem aparece.

## 7. Estado atual

- `index.html` v15 — página principal com nav (inclui Mapas), mão de cartas e tabuleiro; carrega `style.css?v=19`.
- `style.css` v19 — inclui todos os estilos anteriores + estilos do editor de mapas (sidebar, ferramentas, hex estados, lista de mapas).
- `app.js` v23 — carrega JSONs, monta grid por personagem, usa `renderEffects()` compartilhado e preserva `id`/`slot`/`icon` das habilidades.
- `board.js` v1 — renderiza tabuleiro hexagonal SVG.
- `effects.js` v11 — render compartilhado de efeitos; suporta modificador, dano fixo, alcance, múltiplos ataques, área hex colorida e descrição em hover.
- `map-editor.html` v1 / `map-editor.js` v1 — editor de mapas hexagonais; grid configurável, 3 tipos de hex (livre/soft/bloqueado), pintura por click e arrasto, salvar/carregar via localStorage, export/import JSON.
- `weapons.html` v4 / `weapons.js` v3 — biblioteca de armas com dano base e cards 4×3.
- `schools.html` v3 / `schools.js` v3 — biblioteca das 6 escolas com cards 4×3 e cores.
- `characters.html` v2 / `characters.js` v2 — biblioteca de personagens com refs por id e placeholders de imagem.
- `data/weapons.json` v9 — Espada e Machados; Redemoinho e Arremessar Machados usam áreas hex.
- `data/schools.json` v5 — Caos e Ilusão detalhadas; demais escolas ainda provisórias.
- `data/characters.json` v2 — personagem padrão com inventário `sword` + `axes`.

## 8. Convenções

- Indentação com **tab**.
- Sem emojis dentro do código.
- Comentários em português.
- Variáveis/funções em inglês camelCase.
- [CONTEXT.md](http://CONTEXT.md) deve ser sucinto.
- Toda página de arquivo no Notion mantém versão (`v1`, `v2`, etc.) no bloco de código.
- Sempre que um arquivo/página de código for modificado no Notion, marcar a propriedade `Atualizar` como checked.

## 9. Roadmap

- **Fase 1 — Cartas** ✅ grid 4×3, seleção e visual das cartas.
- **Fase 2 — Tabuleiro** 🟡 grid hexagonal renderizado; falta peão e interação carta↔tabuleiro.
- **Fase 3 — Armas/Escolas** 🟡 bibliotecas, JSONs, dano base, cores e placeholders prontos; falta balanceamento e ícones reais.
- **Fase 4 — Editor de Mapas** 🟡 editor funcional com grid configurável, tipos de hex e persistência; falta integração do mapa salvo no jogo.
- **Fase 5 — Editor de cartas** ⚪ futuro.

## 10. Histórico de commits

1. `7b1826f` — initial commit with .gitignore and README
2. `feat:` render 4x3 card grid with vampire theme
3. `feat:` add card selection rule with row/column blocking
4. `feat:` render hexagonal board with SVG
5. `style:` two-column layout with hand on left and board on right
6. `feat:` redesign card layout with image placeholder, name and effects
7. `feat:` replace effect text with SVG icons
8. `feat:` add library pages for weapons, schools and characters
9. `feat:` add school colors, damage badges and icon placeholders
10. `fix:` render whirlwind area indicators in game cards
11. `feat:` add axes and chaos illusion school abilities
12. `feat:` add hex map editor with configurable grid, hex types and localStorage persistence

## 11. Próximos passos

- Adicionar ícones `.png/.jpg` reais nas pastas de assets.
- Definir as próximas escolas restantes.
- Permitir escolher personagem ativo.
- Integrar peão e movimentação no tabuleiro.
- Começar interação carta↔hex no tabuleiro.
- Carregar mapa salvo do editor na página de jogo.