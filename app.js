/* ============================
   Nas Cinzas — V Rising
   app.js v3
   ============================ */

const rowLabels = [
	{ name: "Vampiro", note: "" },
	{ name: "Arma", note: "Espada" },
	{ name: "Escola Primária", note: "Sangue" },
	{ name: "Escola Secundária", note: "Gelo" },
];

const cards = [
	// Linha 1 — Vampiro (fixa)
	{ row: 1, col: 1, name: "Passos das Sombras", type: "movement", effects: [{ kind: "move", value: 3 }] },
	{ row: 1, col: 2, name: "Trocar Arma", type: "utility", effects: [{ kind: "text", text: "Trocar arma" }] },
	{ row: 1, col: 3, name: "Poder Sanguíneo", type: "vampire", effects: [{ kind: "text", text: "Habilidade vampírica" }] },

	// Linha 2 — Arma (Espada, placeholder)
	{ row: 2, col: 1, name: "Investida", type: "weapon", effects: [{ kind: "move", value: 1 }, { kind: "attack", value: 2 }] },
	{ row: 2, col: 2, name: "Cortar", type: "weapon", effects: [{ kind: "attack", value: 2 }] },
	{ row: 2, col: 3, name: "Lâmina Brutal", type: "weapon", effects: [{ kind: "attack", value: 3 }] },

	// Linha 3 — Escola Primária (Sangue, placeholder)
	{ row: 3, col: 1, name: "Véu de Sangue", type: "magic-primary", effects: [{ kind: "text", text: "Véu" }] },
	{ row: 3, col: 2, name: "Lança Sanguínea", type: "magic-primary", effects: [{ kind: "attack", value: 2 }] },
	{ row: 3, col: 3, name: "Sede Voraz", type: "magic-primary", effects: [{ kind: "text", text: "Cura 2" }] },

	// Linha 4 — Escola Secundária (Gelo, placeholder)
	{ row: 4, col: 1, name: "—", type: "magic-secondary", effects: [] },
	{ row: 4, col: 2, name: "Lasca Glacial", type: "magic-secondary", effects: [{ kind: "attack", value: 1 }] },
	{ row: 4, col: 3, name: "Barreira Glacial", type: "magic-secondary", effects: [{ kind: "text", text: "Defesa 2" }] },
];

const MAX_SELECTION = 3;

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

function renderRowLabel(label) {
	const el = document.createElement("div");
	el.className = "row-label";
	el.innerHTML = `
		<div class="row-icon-placeholder"></div>
		<div class="row-name">${label.name}</div>
		${label.note ? `<div class="row-note">${label.note}</div>` : ""}
	`;
	return el;
}

function renderEffect(effect) {
	if (effect.kind === "move") {
		return `<div class="effect">Mover <span class="effect-value">${effect.value}</span></div>`;
	}
	if (effect.kind === "attack") {
		return `<div class="effect">Atacar <span class="effect-value">${effect.value}</span></div>`;
	}
	return `<div class="effect effect-text">${effect.text}</div>`;
}

function renderEffects(effects) {
	if (!effects || effects.length === 0) {
		return `<div class="effect effect-empty">—</div>`;
	}
	return effects.map(renderEffect).join("");
}

function renderCard(card) {
	const el = document.createElement("div");
	const selected = isSelected(card);
	const blocked = !selected && isBlocked(card);

	const classes = ["card", card.type];
	if (selected) classes.push("selected");
	if (blocked) classes.push("blocked");
	el.className = classes.join(" ");

	el.innerHTML = `
		<div class="card-top">
			<div class="card-img-placeholder"></div>
			<div class="card-name">${card.name}</div>
		</div>
		<div class="card-effects">${renderEffects(card.effects)}</div>
	`;

	if (!blocked) {
		el.addEventListener("click", () => toggleCard(card));
	}
	return el;
}

function renderGrid() {
	const grid = document.getElementById("card-grid");
	grid.innerHTML = "";
	for (let r = 1; r <= 4; r++) {
		grid.appendChild(renderRowLabel(rowLabels[r - 1]));
		const rowCards = cards
			.filter((c) => c.row === r)
			.sort((a, b) => a.col - b.col);
		rowCards.forEach((c) => grid.appendChild(renderCard(c)));
	}
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