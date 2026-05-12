/* ============================
   Nas Cinzas — V Rising
   weapons.js v1
   Renderiza a biblioteca de armas a partir de data/weapons.json
   ============================ */

async function loadWeapons() {
	const response = await fetch("data/weapons.json");
	return response.json();
}

function renderAbility(ability) {
	return `
		<div class="ability">
			<div class="ability-icon-placeholder"></div>
			<div class="ability-info">
				<div class="ability-name">${ability.name}</div>
				<div class="ability-slot">${ability.slot}</div>
				<div class="ability-effects">${renderEffects(ability.effects)}</div>
			</div>
		</div>
	`;
}

function renderWeapon(weapon) {
	return `
		<article class="library-card weapon">
			<header class="library-card-header">
				<div class="library-card-icon"></div>
				<h3>${weapon.name}</h3>
				<code class="library-card-id">${weapon.id}</code>
			</header>
			<div class="abilities-list">
				${weapon.abilities.map(renderAbility).join("")}
			</div>
		</article>
	`;
}

(async function init() {
	const weapons = await loadWeapons();
	const container = document.getElementById("weapons-list");
	container.innerHTML = weapons.map(renderWeapon).join("");
})();