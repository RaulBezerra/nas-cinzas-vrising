# Nas Cinzas → V Rising

Adaptação web do livro-jogo "Nas Cinzas" para a temática de V Rising (vampiros).
Plataforma de brainstorming + protótipo jogável construída em HTML + CSS + JavaScript.

## Mecânica base

- Grade 4×3 de cartas (12 no total).
- Turno = 3 rodadas; em cada rodada o jogador escolhe 3 cartas.
- Cartas escolhidas na mesma rodada não podem compartilhar linha nem coluna.
- Cartas usadas voltam só no fim do turno.

### Estrutura das linhas

- **Linha 1** — fixa para todos: mover 3 / trocar arma / habilidade vampírica.
- **Linha 2** — varia conforme a arma: mover+atacar / ataque básico / ataque especial.
- **Linha 3** — escola de magia primária: véu / magia 1 / magia 2 (pode ser defensiva).
- **Linha 4** — escola de magia secundária: — / magia 1 / magia 2 (pode ser defensiva).

## Stack

- HTML + CSS + JavaScript (vanilla).
- Servido localmente via Live Server (VS Code).

## Roadmap

1. Cartas — grade 4×3 + regra de seleção (mesma linha/coluna).
2. Tabuleiro — grid hexagonal com peão.
3. Armas/Escolas — linhas 2/3/4 mudam dinamicamente.
4. Editor de cartas — criar/editar conteúdo direto na interface.

## Como rodar

1. Abrir a pasta no VS Code.
2. Abrir `index.html`.
3. Clicar em **Go Live** (extensão Live Server) no canto inferior direito.