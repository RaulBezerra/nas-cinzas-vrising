/* ============================
   Nas Cinzas — V Rising
   app.js v1
   ============================ */

// Definição das 12 cartas da mão do jogador.
// Cada carta sabe sua posição (linha/coluna) e tipo (afeta o estilo).
const cards = [
	// Linha 1 — fixa para todos
	{ row: 1, col: 1, name: "Mover 3", type: "movement" },
	{ row: 1, col: 2, name: "Trocar arma", type: "utility" },
	{ row: 1, col: 3, name: "Habilidade vampírica", type: "vampire" },

	// Linha 2 — varia conforme a arma equipada (placeholder)
	{ row: 2, col: 1, name: "Mover + atacar", type: "weapon" },
	{ row: 2, col: 2, name: "Ataque básico", type: "weapon" },
	{ row: 2, col: 3, name: "Ataque especial", type: "weapon" },

	// Linha 3 — escola de magia primária (placeholder)
	{ row: 3, col: 1, name: "Véu primário", type: "magic-primary" },
	{ row: 3, col: 2, name: "Magia 1 primária", type: "magic-primary" },
	{ row: 3, col: 3, name: "Magia 2 primária", type: "magic-primary" },

	// Linha 4 — escola de magia secundária (placeholder)
	{ row: 4, col: 1, name: "—", type: "magic-secondary" },
	{ row: 4, col: 2, name: "Magia 1 secundária", type: "magic-secondary" },
	{ row: 4, col: 3, name: "Magia 2 secundária", type: "magic-secondary" },
];

// Cria o HTML de uma carta a partir do objeto de dados.
function renderCard(card) {
	const el = document.createElement("div");
	el.className = `card ${card.type}`;
	el.dataset.row = card.row;
	el.dataset.col = card.col;

	el.innerHTML = `
		<div class="card-header">L${card.row} · C${card.col}</div>
		<div class="card-name">${card.name}</div>
		<div class="card-footer">${card.type}</div>
	`;

	return el;
}

// Renderiza a grade completa no contêiner.
function renderGrid() {
	const grid = document.getElementById("card-grid");
	grid.innerHTML = "";
	cards.forEach((card) => {
		grid.appendChild(renderCard(card));
	});
}

// Boot
renderGrid();