> Documento de contexto para retomar o desenvolvimento em uma nova sessão (com qualquer LLM). Atualizado sempre que um commit é registrado.
> 

## 1. Visão geral

**Nas Cinzas — V Rising** é uma adaptação de mesa-digital que pega a mecânica do livro-jogo *Nas Cinzas* (cartas em grid 4×3, turnos de 3 rodadas, sem coincidir linha/coluna) e a transpõe para o universo de V Rising (vampiros, armas e escolas de magia).

Protótipo web simples (HTML + CSS + JS vanilla) rodando local via Live Server, sem framework, sem build step.

## 2. Stack & ambiente

- **Linguagens:** HTML, CSS, JavaScript (vanilla, sem framework, sem bundler)
- **Servidor local:** Live Server (extensão VS Code) em `http://127.0.0.1:5500`
- **Editor:** VS Code
- **OS:** Windows 10
- **Versionamento:** Git (branch `main`), repositório local em `C:\Users\Windows\OneDrive\V Rising\nas-cinzas-vrising`
- **Convenção de commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`)
- **Remoto:** ainda não configurado (apenas local)

## 3. Estrutura de pastas

```
nas-cinzas-vrising/
├── index.html          # jogo principal (grid de cartas + tabuleiro)
├── weapons.html        # biblioteca de armas
├── schools.html        # biblioteca de escolas de magia
├── characters.html     # biblioteca de personagens
├── style.css
├── app.js              # lógica do jogo (cartas, seleção, render)
├── board.js            # render do tabuleiro hexagonal
├── data/
│   ├── weapons.json
│   ├── schools.json
│   └── characters.json
├── assets/
│   └── icons/
│       ├── weapons/    # .png/.jpg dos ícones de armas
│       ├── schools/    # .png/.jpg dos ícones de escolas
│       └── abilities/  # .png/.jpg dos ícones de habilidades
├── .gitignore
├── README.md
└── CONTEXT.md          # este documento
```

## 4. Schemas de dados

### Slots fixos (onde cada habilidade entra no grid 4×3)

| Linha | Coluna 1 | Coluna 2 | Coluna 3 |
| --- | --- | --- | --- |
| 1 — Vampiro | `move` | `swap-weapon` | `vampire-power` |
| 2 — Arma | `move-attack` | `basic-attack` | `special-attack` |
| 3 — Escola Primária | `veil` | `magic-1` | `magic-2` |
| 4 — Escola Secundária | `ultimate` (da primária) | `magic-1` | `magic-2` |

### `data/weapons.json`

Array de armas. Cada arma tem **3 habilidades** (uma para cada slot da linha 2).

```json
[
  {
    "id": "sword",
    "name": "Espada",
    "icon": "assets/icons/weapons/sword.png",
    "abilities": [
      { "slot": "move-attack",    "id": "sword-charge", "name": "Investida",     "icon": "assets/icons/abilities/sword-charge.png", "effects": [{"kind":"move","value":1},{"kind":"attack","value":2}] },
      { "slot": "basic-attack",   "id": "sword-slash",  "name": "Cortar",        "icon": "assets/icons/abilities/sword-slash.png",  "effects": [{"kind":"attack","value":2}] },
      { "slot": "special-attack", "id": "sword-brutal", "name": "Lâmina Brutal", "icon": "assets/icons/abilities/sword-brutal.png", "effects": [{"kind":"attack","value":3}] }
    ]
  }
]
```

### `data/schools.json`

Array de escolas de magia. Cada escola tem **4 habilidades**: véu + 2 magias + ultimate.

```json
[
  {
    "id": "blood",
    "name": "Sangue",
    "icon": "assets/icons/schools/blood.png",
    "abilities": [
      { "slot": "veil",     "id": "blood-veil",    "name": "Véu de Sangue",   "icon": "...", "effects": [{"kind":"text","text":"Véu"}] },
      { "slot": "magic-1",  "id": "blood-spear",   "name": "Lança Sanguínea", "icon": "...", "effects": [{"kind":"attack","value":2,"ranged":true}] },
      { "slot": "magic-2",  "id": "blood-thirst",  "name": "Sede Voraz",      "icon": "...", "effects": [{"kind":"heal","value":2}] },
      { "slot": "ultimate", "id": "blood-tempest", "name": "Tempestade",      "icon": "...", "effects": [{"kind":"attack","value":4}] }
    ]
  }
]
```

### `data/characters.json`

```json
[
  {
    "id": "raul",
    "name": "Raul",
    "icon": "assets/icons/characters/raul.png",
    "equippedWeapon": "sword",
    "inventory": ["sword"],
    "primarySchool": "blood",
    "secondarySchool": "frost",
    "vampireAbilities": ["transform", "blood-regen"]
  }
]
```

### Tipos de efeito (`effect.kind`)

| Kind | Ícone | Campos | Notas |
| --- | --- | --- | --- |
| `move` | seta | `value` | mover N casas |
| `attack` | espada (melee) ou alvo (ranged) | `value`, `ranged?` | dano N; `ranged: true` muda o ícone para alvo |
| `heal` | cruz vermelha | `value` | curar N |
| `defense` | escudo | `value` | bloquear N |
| `text` | — | `text` | texto livre (Trocar Arma, Véu, etc.) |

## 5. Mecânica do jogo

- O jogador tem **12 cartas** num grid de **4 linhas × 3 colunas**.
- Combate dividido em **turnos de 3 rodadas**.
- A cada rodada o jogador seleciona **3 cartas** que **não podem coincidir em linha nem em coluna**.
- Cartas usadas só voltam no **fim do turno**.
- **Exceção:** a **Ultimate** (linha 4 col 1, vinda da escola primária) **não volta até o fim do combate**.
- **Linhas:**
    - L1 — fixa: mover 3 / trocar arma / habilidade vampírica
    - L2 — varia com a arma equipada (3 habilidades da arma)
    - L3 — escola primária: véu + magia 1 + magia 2 (a de col 3 pode ser defensiva)
    - L4 — col 1 = ultimate da primária; col 2 e 3 = magia 1 e magia 2 da secundária

## 6. Estado atual do código

### Arquivos versionados (Notion DB de Códigos)

- `.gitignore` — exclusões padrão Windows/VS Code
- `README.md` — descrição mínima do projeto
- `index.html` v3 — header + main com card-grid à esquerda e board SVG à direita
- `style.css` v6 — tema vampírico, layout em 2 colunas, cartas 200×150 (4:3), board hex, ícones SVG dimensionados
- `app.js` v6 — biblioteca de ícones SVG (seta/espada/alvo/cruz/escudo), 12 cartas hardcoded, regra de seleção linha+coluna, render do grid com row-labels
- `board.js` v1 — render do tabuleiro hexagonal SVG (7×5 hexes)

### Iconografia atual (em `app.js` `ICONS`)

- `arrow` — movimentação
- `sword` — ataque corpo-a-corpo
- `target` — ataque à distância
- `cross` — cura
- `shield` — defesa

## 7. Convenções

### Código

- Indentação com **tab**
- Sem emojis dentro de código
- Comentários em **português**
- Funções e variáveis em **inglês** (camelCase)

### Commits (Conventional Commits)

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `chore:` manutenção/setup
- `docs:` documentação
- `refactor:` mudança de código sem alterar comportamento
- `style:` mudança apenas visual/formatação

### Notion (database de Códigos)

- Toda nova entidade de código tem uma página correspondente na DB Códigos — Nas Cinzas V Rising
- Cada página tem: bloco de contexto curto + bloco de código com versão nomeada (`v1`, `v2`, ...) e a versão é incrementada a cada update relevante
- Properties obrigatórias: `Arquivo`, `Extensão`, `Camada`, `Fase`, `Repositório`, `Status`, `Linhas`, `Resumo`

## 8. Roadmap (fases)

- **Fase 1 — Cartas** ✅ grid 4×3, regra de seleção, layout das cartas com ícones
- **Fase 2 — Tabuleiro** 🟡 grid hexagonal renderizado; falta peão, movimentação, interação carta↔tabuleiro
- **Fase 3 — Armas/Escolas** 🟢 começando agora: JSONs de armas/escolas/personagens + páginas de biblioteca
- **Fase 4 — Editor de cartas** ⚪ futuro: editor in-app de habilidades

## 9. Histórico de commits

1. `7b1826f` — initial commit with .gitignore and README (sem prefixo)
2. `feat:` render 4x3 card grid with vampire theme
3. `feat:` add card selection rule with row/column blocking
4. `feat:` render hexagonal board with SVG
5. `style:` two-column layout with hand on left and board on right
6. `feat:` redesign card layout with image placeholder, name and effects
7. `feat:` replace effect text with SVG icons (arrow/sword/target/cross/shield)

## 10. Como manter este documento

A cada commit registrado pelo usuário:

1. Atualizar a seção **6. Estado atual do código** (versões dos arquivos, novos arquivos).
2. Adicionar entrada em **9. Histórico de commits**.
3. Atualizar **8. Roadmap** se uma fase mudou de estado.
4. Atualizar **4. Schemas** se a estrutura de dados mudou.
5. Atualizar **7. Convenções** se uma nova regra foi acordada.