/* ============================
   Nas Cinzas — V Rising
   blood-types.js v6
   Exibe os tipos de sangue. Somente leitura — editar o JSON diretamente.
   ============================ */

let bloodTypes = [];

// Render ============================

function iconImg(path) {
	if (!path) return "";
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
}

function renderBloodType(bt) {
	const hasContent = bt.passives.length > 0 || bt.vampirePower;

	const card = document.createElement("article");
	card.className = "library-card blood-type-card";
	card.innerHTML = `
		<header class="library-card-header">
			<div class="library-card-icon">${iconImg(bt.icon)}</div>
			<div>
				<h3>${bt.name}</h3>
				<code class="library-card-id">${bt.id}</code>
			</div>
		</header>
		<div class="blood-type-body">
			${!hasContent
				? `<p class="blood-type-placeholder">Efeitos ainda não definidos.</p>`
				: ""}
			${bt.passives.length ? `
				<div class="blood-section">
					<h4 class="blood-section-title">Passivas</h4>
					<ul class="blood-passives-list">
						${bt.passives.map((p) => `<li>${p.description}</li>`).join("")}
					</ul>
				</div>
			` : ""}
			${bt.vampirePower ? `
				<div class="blood-section">
					<h4 class="blood-section-title">Poder Vampírico</h4>
					<article class="ability-card blood-vpower-card">
						<div class="card-top">
							<div class="card-img-placeholder">${iconImg(bt.vampirePower.icon)}</div>
							<div class="card-name">${bt.vampirePower.name}</div>
						</div>
						<div class="card-effects">${renderEffects(bt.vampirePower.effects)}</div>
					</article>
				</div>
			` : ""}
		</div>
	`;

	return card;
}

function renderList() {
	const container = document.getElementById("blood-list");
	container.innerHTML = "";
	bloodTypes.filter((bt) => !bt.disabled).forEach((bt) => container.appendChild(renderBloodType(bt)));
}

// Boot ============================

(async function init() {
	bloodTypes = await fetch("data/blood-types.json").then((r) => r.json());
	renderList();
})();
