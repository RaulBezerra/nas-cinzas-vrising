/* ============================
   Nas Cinzas — V Rising
   schools.js v1
   Renderiza a biblioteca de escolas de magia a partir de data/schools.json
   ============================ */

async function loadSchools() {
	const response = await fetch("data/schools.json");
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

function renderSchool(school) {
	return `
		<article class="library-card school">
			<header class="library-card-header">
				<div class="library-card-icon"></div>
				<h3>${school.name}</h3>
				<code class="library-card-id">${school.id}</code>
			</header>
			<div class="abilities-list">
				${school.abilities.map(renderAbility).join("")}
			</div>
		</article>
	`;
}

(async function init() {
	const schools = await loadSchools();
	const container = document.getElementById("schools-list");
	container.innerHTML = schools.map(renderSchool).join("");
})();