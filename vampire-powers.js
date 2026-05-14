/* ============================
   Nas Cinzas — V Rising
   vampire-powers.js v2
   Renderiza os poderes vampíricos universais.
   ============================ */

function iconImg(path) {
	if (!path) return "";
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
}

function renderRowCard(power) {
	const card = document.createElement("article");
	card.className = "ability-card vampire-row";
	card.innerHTML = `
		<div class="card-top">
			<div class="card-img-placeholder">${iconImg(power.icon)}</div>
			<div class="card-name">${power.name}</div>
		</div>
		<div class="card-effects">${renderEffects(power.effects)}</div>
	`;
	return card;
}

function renderAbilityEntry(ability) {
	const entry = document.createElement("div");
	entry.className = "vpower-entry";
	entry.innerHTML = `
		<article class="ability-card vampire-row">
			<div class="card-top">
				<div class="card-img-placeholder">${iconImg(ability.icon)}</div>
				<div class="card-name">${ability.name}</div>
			</div>
			<div class="card-effects">${renderEffects(ability.effects)}</div>
		</article>
		<div class="vpower-desc">
			<p>${ability.description}</p>
		</div>
	`;
	return entry;
}

(async function init() {
	const data = await fetch("data/vampire-powers.json").then((r) => r.json());

	const rowGrid = document.getElementById("vpower-row-cards");
	data.rowCards.forEach((p) => rowGrid.appendChild(renderRowCard(p)));

	const abilitiesList = document.getElementById("vpower-abilities");
	if (data.abilities && data.abilities.length > 0) {
		data.abilities.forEach((a) => abilitiesList.appendChild(renderAbilityEntry(a)));
	} else {
		document.getElementById("vpower-abilities-heading").style.display = "none";
	}
})();
