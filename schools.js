/* ============================
   Nas Cinzas — V Rising
   schools.js v3
   Renderiza biblioteca de escolas. Aplica school-{id} na cor de cada
   ability-card e usa <img> com fallback nos ícones.
   ============================ */

async function loadSchools() {
	const response = await fetch("data/schools.json");
	return response.json();
}

function iconImg(path) {
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
}

function renderAbility(ability, schoolId) {
	return `
		<article class="ability-card school-${schoolId}">
			<div class="card-top">
				<div class="card-img-placeholder">${iconImg(ability.icon)}</div>
				<div class="card-name">${ability.name}</div>
			</div>
			<div class="card-effects">${renderEffects(ability.effects)}</div>
			<div class="ability-slot-tag">${ability.slot}</div>
		</article>
	`;
}

function renderSchool(school) {
	return `
		<article class="library-card">
			<header class="library-card-header">
				<div class="library-card-icon">${iconImg(school.icon)}</div>
				<h3>${school.name}</h3>
				<code class="library-card-id">${school.id}</code>
			</header>
			<div class="abilities-grid" style="--n: ${school.abilities.length}">
				${school.abilities.map((a) => renderAbility(a, school.id)).join("")}
			</div>
		</article>
	`;
}

(async function init() {
	const schools = await loadSchools();
	const container = document.getElementById("schools-list");
	container.innerHTML = schools.map(renderSchool).join("");
})();