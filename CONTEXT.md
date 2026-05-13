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
├── blood-types.html
├── map-editor.html
├── style.css
├── app.js
├── board.js
├── effects.js
├── weapons.js
├── schools.js
├── characters.js
├── blood-types.js
├── map-editor.js
├── data/
│   ├── weapons.json
│   ├── schools.json
│   ├── characters.json
│   └── blood-types.json
├── assets/icons/
│   ├── weapons/
│   ├── schools/
│   ├── abilities/
│   ├── characters/
│   └── blood-types/
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
- `bloodType`
- `vampireAbilities`

Personagens são persistidos no `localStorage` (`nas-cinzas-characters`). O JSON é apenas a semente inicial na primeira visita.

### `data/blood-types.json`

Array com 6 tipos de sangue: `rogue`, `brute`, `warrior`, `scholar`, `draculin`, `mutant`.

Cada tipo tem:

- `id`, `name` (PT), `icon`
- `passives`: array de `{ description }` (máx 2)
- `vampirePower`: `{ id, name, icon, effects }` ou `null`

Estado atual: Ladino completo; Guerreiro com 1 passiva; Estudioso com poder vampírico; demais vazios.

## 6. Assets

Caminhos padronizados:

- Personagens: `assets/icons/characters/{id}.png`
- Armas: `assets/icons/weapons/{id}.png`
- Escolas: `assets/icons/schools/{id}.png`
- Habilidades: `assets/icons/abilities/{ability-id}.png`

O código usa `<img>` com fallback: se o arquivo não existir, o placeholder tracejado continua visível; se existir, a imagem aparece.

## 7. Estado atual

- `index.html` v17 — seletor de personagem (`char-bar`) acima da mão; carrega `style.css?v=22` e `app.js?v=24`.
- `style.css` v22 — inclui estilos anteriores + seletor de personagem no jogo + modal de edição de personagens + tipos de sangue.
- `app.js` v24 — carrega personagens do localStorage (semente do JSON), popula seletor de personagem, reconstrói grid ao trocar; `buildGrid` null-safe.
- `board.js` v2 — carrega mapas do localStorage, popula seletor, renderiza terreno e peças; grade padrão 7×5.
- `effects.js` v11 — render compartilhado de efeitos.
- `map-editor.html` v2 / `map-editor.js` v3 — editor completo com undo/redo e persistência.
- `weapons.html` / `weapons.js` v3 — biblioteca de armas.
- `schools.html` / `schools.js` v3 — biblioteca das 6 escolas.
- `characters.html` v3 / `characters.js` v4 — biblioteca com editor completo: criar/editar/excluir personagens, upload de imagem (base64), tipo de sangue, arma equipada destacada no inventário.
- `blood-types.html` / `blood-types.js` v2 — biblioteca dos 6 tipos de sangue com passivas e poder vampírico.
- `data/weapons.json` v9 — Espada e Machados.
- `data/schools.json` v5 — Caos e Ilusão detalhadas; demais provisórias.
- `data/characters.json` v2 — personagem padrão (semente; dados reais ficam no localStorage).
- `data/blood-types.json` v1 — 6 tipos; Ladino completo, Guerreiro e Estudioso parciais.

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
- **Fase 3 — Armas/Escolas/Personagens** 🟡 bibliotecas, JSONs, editor de personagens completo; falta balanceamento, ícones reais e demais escolas.
- **Fase 4 — Editor de Mapas** ✅ editor completo com undo/redo e integração no jogo.
- **Fase 5 — Tipos de Sangue** 🟡 página criada, 6 tipos, Ladino completo; demais a definir.
- **Fase 6 — Editor de cartas** ⚪ futuro.

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
12. `feat:` add hex map editor with terrain types, piece placement and management
13. `feat:` add character editor, blood type library and active character selector

## 11. Próximos passos

- Adicionar ícones `.png/.jpg` reais nas pastas de assets (incluindo `blood-types/`).
- Definir passivas/poderes dos tipos de sangue restantes (Bruto, Draculin, Mutante; completar Guerreiro e Estudioso).
- Definir as escolas de magia restantes (Blood, Frost, Unholy, Storm).
- Interação carta↔hex no tabuleiro (mover peões com cartas).
- Zoom no canvas do editor (scroll do mouse).