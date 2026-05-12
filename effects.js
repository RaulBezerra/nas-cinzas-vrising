/* ============================
   Nas Cinzas — V Rising
   effects.js v1
   Biblioteca de ícones SVG e funções de render de efeitos.
   Carregar antes de qualquer página que mostre cartas/habilidades.
   ============================ */

const ICONS = {
	arrow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10h11V5l7 7-7 7v-5H3z"/></svg>',
	sword: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 3.4V14.5h-4.4V5.4L12 2z"/><rect x="6" y="14.5" width="12" height="1.8" rx="0.4"/><rect x="11" y="16.3" width="2" height="4.2"/><circle cx="12" cy="21.5" r="1.3"/></svg>',
	target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
	cross: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/></svg>',
	shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v7c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>',
};

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