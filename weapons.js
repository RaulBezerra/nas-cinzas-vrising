/* ============================
   Nas Cinzas — V Rising
   weapons.js v4
   Renderiza biblioteca de armas com <img> placeholders e --n na grade.
   ============================ */

async function loadWeapons() {
	const response = await fetch("data/weapons.json");
	return response.json();
}

function iconImg(path) {
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
}

function renderAbility(ability) {
	return `
		<article class="ability-card weapon">
			<div class="card-top">
				<div class="card-img-placeholder">${iconImg(ability.icon)}</div>
				<div class="card-name">${ability.name}</div>
			</div>
			<div class="card-effects">${renderEffects(ability.effects)}</div>
			<div class="ability-slot-tag">${ability.slot}</div>
		</article>
	`;
}

function renderWeapon(weapon) {
	const damage = weapon.baseDamage
		? `<span class="weapon-damage">${weapon.baseDamage}</span>`
		: "";
	const range = weapon.baseRange !== undefined
		? `<span class="weapon-range">Alcance ${weapon.baseRange}</span>`
		: "";
	return `
		<article class="library-card">
			<header class="library-card-header">
				<div class="library-card-icon">${iconImg(weapon.icon)}</div>
				<h3>${weapon.name}</h3>
				${damage}${range}
				<code class="library-card-id">${weapon.id}</code>
			</header>
			<div class="abilities-grid" style="--n: ${weapon.abilities.length}">
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