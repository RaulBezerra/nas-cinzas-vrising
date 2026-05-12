/* ============================
   Nas Cinzas — V Rising
   app.js v8
   ============================ */

const ICONS = {
	arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10h11V5l7 7-7 7v-5H3z"/></svg>',
	sword: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 3.4V14.5h-4.4V5.4L12 2z"/><rect x="6" y="14.5" width="12" height="1.8" rx="0.4"/><rect x="11" y="16.3" width="2" height="4.2"/><circle cx="12" cy="21.5" r="1.3"/></svg>',
	target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
	cross: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/></svg>',
	shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v7c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>',
};

// Linha 1 do grid — fixa pra todo personagem
const VAMPIRE_ROW = [
	{ slot: "move",          name: "Passos das Sombras",   effects: [{ kind: "move", value: 3 }] },
	{ slot: "swap-weapon",   name: "Trocar Arma",          effects: [{ kind: "text", text: "Trocar arma" }] },
	{ slot: "vampire-power", name: "Habilidade Vampírica", effects: [{ kind: "text", text: "Escolher" }] },
];

const MAX_SELECTION = 3;

const state = {
	selected: new Set(),
	rowLabels: [],
	cards: [],
};

// Carregamento ============================

async function loadData() {
	const [weapons, schools, characters] = await Promise.all([
		fetch("data/weapons.json").then((r) => r.json()),
		fetch("data/schools.json").then((r) => r.json()),
		fetch("data/characters.json").then((r) => r.json()),
	]);
	return { weapons, schools, characters };
}

function buildGrid(character, weapons, schools) {
	const weapon = weapons.find((w) => w.id === character.equippedWeapon);
	const primary = schools.find((s) => s.id === character.primarySchool);
	const secondary = schools.find((s) => s.id === character.secondarySchool);

	const findAbility = (list, slot) => list.find((a) => a.slot === slot);

	const rowLabels = [
		{ name: "Vampiro", note: "" },
		{ name: "Arma", note: weapon.name, icon: weapon.icon },
		{ name: "Escola Primária", note: primary.name, icon: primary.icon },
		{ name: "Escola Secundária", note: secondary.name, icon: secondary.icon },
	];

	const rowSlots = [
		["move", "swap-weapon", "vampire-power"],
		["move-attack", "basic-attack", "special-attack"],
		["veil", "magic-1", "magic-2"],
		["ultimate", "magic-1", "magic-2"],
	];

	const rowTypes = ["vampire-row", "weapon", "magic-primary", "magic-secondary"];

	const cards = [];
	for (let r = 0; r < 4; r++) {
		for (let c = 0; c < 3; c++) {
			const slot = rowSlots[r][c];
			let ab;
			if (r === 0) {
				ab = VAMPIRE_ROW[c];
			} else if (r === 1) {
				ab = findAbility(weapon.abilities, slot);
			} else if (r === 2) {
				ab = findAbility(primary.abilities, slot);
			} else {
				ab = c === 0
					? findAbility(primary.abilities, "ultimate")
					: findAbility(secondary.abilities, slot);
			}
			const isUltimate = r === 3 && c === 0;
			// Ultimate visualmente pertence à escola primária, mesmo estando na linha 4
			const baseType = isUltimate ? "magic-primary" : rowTypes[r];
			cards.push({
				row: r + 1,
				col: c + 1,
				name: ab ? ab.name : "—",
				type: baseType + (isUltimate ? " ultimate" : ""),
				icon: ab ? ab.icon : null,
				effects: ab ? ab.effects : [],
				persistent: isUltimate,
			});
		}
	}
	return { rowLabels, cards };
}

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

	const classes = ["card", ...card.type.split(" ")];
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
	for (let r = 0; r < 4; r++) {
		grid.appendChild(renderRowLabel(state.rowLabels[r]));
		const rowCards = state.cards
			.filter((c) => c.row === r + 1)
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

(async function init() {
	const { weapons, schools, characters } = await loadData();
	const character = characters[0]; // por enquanto, primeiro personagem da lista
	const { rowLabels, cards } = buildGrid(character, weapons, schools);
	state.rowLabels = rowLabels;
	state.cards = cards;

	document.getElementById("reset-btn").addEventListener("click", resetSelection);
	renderGrid();
})();