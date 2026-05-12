/* ============================
   Nas Cinzas — V Rising
   app.js v23
   Monta a mão do jogador a partir dos JSONs. O render de efeitos é
   compartilhado via effects.js (renderEffects global).
   ============================ */

// Linha 1 do grid — fixa pra todo personagem
const VAMPIRE_ROW = [
	{ slot: "move",          name: "Passos das Sombras",   effects: [{ kind: "move", value: 3 }] },
	{ slot: "swap-weapon",   name: "Trocar Arma",          effects: [{ kind: "text", text: "Trocar arma" }] },
	{ slot: "vampire-power", name: "Habilidade Vampírica", effects: [{ kind: "text", text: "Escolher" }] },
];

const MAX_SELECTION = 3;
const DATA_VERSION = "illusion-v1";

const DEFAULT_WHIRLWIND_AREA = {
	self: true,
	hits: ["n", "ne", "se", "s", "sw", "nw"],
};

console.log("app.js v23 loaded");

const state = {
	selected: new Set(),
	rowLabels: [],
	cards: [],
};

// Carregamento ============================

async function loadData() {
	const [weapons, schools, characters] = await Promise.all([
		fetch(`data/weapons.json?v=${DATA_VERSION}`).then((r) => r.json()),
		fetch(`data/schools.json?v=${DATA_VERSION}`).then((r) => r.json()),
		fetch(`data/characters.json?v=${DATA_VERSION}`).then((r) => r.json()),
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

	// Linhas 3 e 4 herdam a cor da escola correspondente (school-{id})
	const rowTypes = [
		"vampire-row",
		"weapon",
		`school-${primary.id}`,
		`school-${secondary.id}`,
	];

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
			const baseType = isUltimate ? `school-${primary.id}` : rowTypes[r];

			cards.push({
				row: r + 1,
				col: c + 1,
				id: ab ? ab.id : null,
				slot,
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

function isSwordWhirlwind(card) {
	return card.id === "sword-whirlwind" || (card.slot === "special-attack" && card.name === "Redemoinho");
}

function effectsWithFallbackArea(card) {
	if (!isSwordWhirlwind(card)) {
		return card.effects;
	}

	const hasArea = card.effects.some((effect) => effect.area || effect.kind === "area");
	if (hasArea) {
		return card.effects;
	}

	return card.effects.map((effect) => {
		if (effect.kind !== "attack") return effect;
		return { ...effect, area: DEFAULT_WHIRLWIND_AREA };
	});
}

function iconImg(path) {
	if (!path) return "";
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
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
		<div class="row-icon-placeholder">${iconImg(label.icon)}</div>
		<div class="row-name">${label.name}</div>
		${label.note ? `<div class="row-note">${label.note}</div>` : ""}
	`;
	return el;
}

function renderCard(card) {
	const el = document.createElement("div");
	const selected = isSelected(card);
	const blocked = !selected && isBlocked(card);
	const effects = effectsWithFallbackArea(card);

	const classes = ["card", ...card.type.split(" ")];
	if (selected) classes.push("selected");
	if (blocked) classes.push("blocked");
	el.className = classes.join(" ");

	el.innerHTML = `
		<div class="card-top">
			<div class="card-img-placeholder">${iconImg(card.icon)}</div>
			<div class="card-name">${card.name}</div>
		</div>
		<div class="card-effects">${renderEffects(effects)}</div>
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