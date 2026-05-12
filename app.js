/* ============================
   Nas Cinzas — V Rising
   app.js v2
   ============================ */

// 12 cartas da mão do jogador (linha/coluna 1-indexed).
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

const MAX_SELECTION = 3;

// Estado da rodada atual. Cartas selecionadas guardadas como "rXcY".
const state = {
	selected: new Set(),
};

// Helpers ============================

function cardKey(card) {
	return `r${card.row}c${card.col}`;
}

function isSelected(card) {
	return state.selected.has(cardKey(card));
}

// Uma carta está bloqueada se compartilha linha ou coluna
// com alguma carta já selecionada nesta rodada.
function isBlocked(card) {
	if (isSelected(card)) return false;
	for (const key of state.selected) {
		const [, r, c] = key.match(/r(\d+)c(\d+)/);
		if (+r === card.row || +c === card.col) return true;
	}
	return false;
}

// Ações ============================

function toggleCard(card) {
	const key = cardKey(card);
	if (state.selected.has(key)) {
		state.selected.delete(key);
	} else {
		if (isBlocked(card)) return;
		if (state.selected.size >= MAX_SELECTION) return;
		state.selected.add(key);
	}
	renderGrid();
}

function resetSelection() {
	state.selected.clear();
	renderGrid();
}

// Render ============================

function renderCard(card) {
	const el = document.createElement("div");
	const selected = isSelected(card);
	const blocked = !selected && isBlocked(card);

	const classes = ["card", card.type];
	if (selected) classes.push("selected");
	if (blocked) classes.push("blocked");
	el.className = classes.join(" ");
	el.dataset.row = card.row;
	el.dataset.col = card.col;

	el.innerHTML = `
		<div class="card-header">L${card.row} · C${card.col}</div>
		<div class="card-name">${card.name}</div>
		<div class="card-footer">${card.type}</div>
	`;

	if (!blocked) {
		el.addEventListener("click", () => toggleCard(card));
	}
	return el;
}

function renderGrid() {
	const grid = document.getElementById("card-grid");
	grid.innerHTML = "";
	cards.forEach((card) => grid.appendChild(renderCard(card)));
	updateStatus();
}

function updateStatus() {
	const counter = document.getElementById("selection-counter");
	if (counter) {
		counter.textContent = `${state.selected.size} / ${MAX_SELECTION}`;
	}
}

// Boot ============================

document.getElementById("reset-btn").addEventListener("click", resetSelection);
renderGrid();