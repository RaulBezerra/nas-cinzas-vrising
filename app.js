/* ============================
   Nas Cinzas — V Rising
   app.js v6
   ============================ */

const ICONS = {
	arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10h11V5l7 7-7 7v-5H3z"/></svg>',
	sword: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 3.4V14.5h-4.4V5.4L12 2z"/><rect x="6" y="14.5" width="12" height="1.8" rx="0.4"/><rect x="11" y="16.3" width="2" height="4.2"/><circle cx="12" cy="21.5" r="1.3"/></svg>',
	target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
	cross: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/></svg>',
	shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v7c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>',
};

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

	// Linha 2 — Arma (Espada, placeholder; ataques corpo-a-corpo)
	{ row: 2, col: 1, name: "Investida", type: "weapon", effects: [{ kind: "move", value: 1 }, { kind: "attack", value: 2 }] },
	{ row: 2, col: 2, name: "Cortar", type: "weapon", effects: [{ kind: "attack", value: 2 }] },
	{ row: 2, col: 3, name: "Lâmina Brutal", type: "weapon", effects: [{ kind: "attack", value: 3 }] },

	// Linha 3 — Escola Primária (Sangue, placeholder)
	{ row: 3, col: 1, name: "Véu de Sangue", type: "magic-primary", effects: [{ kind: "text", text: "Véu" }] },
	{ row: 3, col: 2, name: "Lança Sanguínea", type: "magic-primary", effects: [{ kind: "attack", value: 2, ranged: true }] },
	{ row: 3, col: 3, name: "Sede Voraz", type: "magic-primary", effects: [{ kind: "heal", value: 2 }] },

	// Linha 4 — Escola Secundária (Gelo, placeholder)
	{ row: 4, col: 1, name: "—", type: "magic-secondary", effects: [] },
	{ row: 4, col: 2, name: "Lasca Glacial", type: "magic-secondary", effects: [{ kind: "attack", value: 1, ranged: true }] },
	{ row: 4, col: 3, name: "Barreira Glacial", type: "magic-secondary", effects: [{ kind: "defense", value: 2 }] },
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

function iconEffect(iconKey, value, extraClass = "") {
	return `<div class="effect ${extraClass}"><span class="effect-icon">${ICONS[iconKey]}</span><span class="effect-value">${value}</span></div>`;
}

function renderEffect(effect) {
	switch (effect.kind) {
		case "move":
			return iconEffect("arrow", effect.value);
		case "attack":
			return iconEffect(effect.ranged ? "target" : "sword", effect.value);
		case "heal":
			return iconEffect("cross", effect.value, "effect-heal");
		case "defense":
			return iconEffect("shield", effect.value);
		case "text":
		default:
			return `<div class="effect effect-text">${effect.text}</div>`;
	}
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