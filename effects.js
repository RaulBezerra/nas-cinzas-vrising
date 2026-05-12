/* ============================
   Nas Cinzas — V Rising
   effects.js v11
   Biblioteca de ícones SVG, padrões de área em hex e funções de render.
   Carregar antes de qualquer página que mostre cartas/habilidades.
   ============================ */

console.log("effects.js v11 loaded");

const ICONS = {
	arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10h11V5l7 7-7 7v-5H3z"/></svg>',
	sword: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 3.4V14.5h-4.4V5.4L12 2z"/><rect x="6" y="14.5" width="12" height="1.8" rx="0.4"/><rect x="11" y="16.3" width="2" height="4.2"/><circle cx="12" cy="21.5" r="1.3"/></svg>',
	target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
	cross: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/></svg>',
	shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v7c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>',
};

const AREA_HEXES = {
	n:  [60, 30.75],
	ne: [81, 42.88],
	se: [81, 67.12],
	s:  [60, 79.25],
	sw: [39, 67.12],
	nw: [39, 42.88],
	self: [60, 55],
};

function iconEffect(iconKey, value, extraClass = "") {
	return `<div class="effect ${extraClass}"><span class="effect-icon">${ICONS[iconKey]}</span><span class="effect-value">${value}</span></div>`;
}

function formatModifier(value = 0) {
	if (value === 0) return "";
	return value > 0 ? `+${value}` : `${value}`;
}

function renderInfoIndicator(description) {
	if (!description) return "";
	return `<span class="effect-info" aria-label="Informação da habilidade">i<span class="effect-tooltip">${description}</span></span>`;
}

function renderAttackValue(effect) {
	if (effect.damage !== undefined) return `${effect.damage}`;
	return formatModifier(effect.value);
}

function renderAttackEffect(effect) {
	const iconKey = effect.ranged ? "target" : "sword";
	const value = renderAttackValue(effect);
	const countHtml = effect.count ? `<span class="effect-count">${effect.count}×</span>` : "";
	const valueHtml = value ? `<span class="effect-value">${value}</span>` : "";
	const areaHtml = effect.area ? renderAreaEffect(effect.area) : "";
	return `<div class="effect attack-effect"><span class="effect-icon">${ICONS[iconKey]}</span>${countHtml}${valueHtml}${areaHtml}</div>`;
}

function areaHexPoints(cx, cy, r = 16) {
	return Array.from({ length: 6 }, (_, i) => {
		const angle = (Math.PI / 180) * (60 * i);
		return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
	}).join(" ");
}

function renderAreaEffect(effect) {
	const hits = new Set(effect.hits || []);
	const orangeHits = new Set(effect.orangeHits || []);
	const strongHits = new Set(effect.strongHits || []);
	const order = ["n", "ne", "se", "s", "sw", "nw", "self"];
	const hexes = order.map((key) => {
		const [cx, cy] = AREA_HEXES[key];
		const classes = ["area-hex"];
		if ((key === "self" && effect.self) || key === effect.origin) classes.push("self");
		if (hits.has(key)) classes.push("hit");
		if (orangeHits.has(key)) classes.push("orange-hit");
		if (strongHits.has(key)) classes.push("strong-hit");
		return `<polygon class="${classes.join(" ")}" points="${areaHexPoints(cx, cy)}"></polygon>`;
	}).join("");
	return `<div class="effect-area"><svg class="area-pattern" viewBox="15 5 90 100" aria-hidden="true">${hexes}</svg></div>`;
}

function renderEffect(effect) {
	switch (effect.kind) {
		case "move":
			return iconEffect("arrow", effect.value);
		case "range":
			return iconEffect("target", effect.value);
		case "attack":
			return renderAttackEffect(effect);
		case "heal":
			return iconEffect("cross", effect.value, "effect-heal");
		case "defense":
			return iconEffect("shield", effect.value);
		case "area":
			return renderAreaEffect(effect);
		case "text":
		default:
			return `<div class="effect effect-text">${effect.text}</div>`;
	}
}

function renderEffects(effects) {
	if (!effects || effects.length === 0) {
		return `<div class="effect effect-empty">—</div>`;
	}

	const description = effects.find((effect) => effect.description)?.description;
	const infoHtml = renderInfoIndicator(description);
	const html = [];

	for (let i = 0; i < effects.length; i++) {
		const effect = effects[i];
		const next = effects[i + 1];

		if (effect.kind === "attack" && next?.kind === "area") {
			html.push(renderAttackEffect({ ...effect, area: next }));
			i++;
		} else {
			html.push(renderEffect(effect));
		}
	}
	return `${infoHtml}${html.join("")}`;
}