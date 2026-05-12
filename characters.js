/* ============================
   Nas Cinzas — V Rising
   characters.js v1
   Renderiza a biblioteca de personagens.
   Cada personagem contém referências por id
   para armas e escolas, que são resolvidas aqui.
   ============================ */

async function loadAll() {
	const [weapons, schools, characters] = await Promise.all([
		fetch("data/weapons.json").then((r) => r.json()),
		fetch("data/schools.json").then((r) => r.json()),
		fetch("data/characters.json").then((r) => r.json()),
	]);
	return { weapons, schools, characters };
}

function renderRow(name, tag = "") {
	return `
		<div class="character-row">
			<div class="character-row-icon"></div>
			<div class="character-row-name">${name}</div>
			${tag ? `<div class="character-row-tag">${tag}</div>` : ""}
		</div>
	`;
}

function renderCharacter(character, weapons, schools) {
	const weapon = weapons.find((w) => w.id === character.equippedWeapon);
	const inventory = (character.inventory || [])
		.map((id) => weapons.find((w) => w.id === id))
		.filter(Boolean);
	const primary = schools.find((s) => s.id === character.primarySchool);
	const secondary = schools.find((s) => s.id === character.secondarySchool);
	const vampAbilities = character.vampireAbilities || [];

	return `
		<article class="library-card character">
			<header class="library-card-header">
				<div class="library-card-icon"></div>
				<h3>${character.name}</h3>
				<code class="library-card-id">${character.id}</code>
			</header>
			<div class="character-section">
				<h4>Arma equipada</h4>
				${weapon ? renderRow(weapon.name, weapon.id) : renderRow("—")}
			</div>
			${inventory.length ? `
				<div class="character-section">
					<h4>Inventário</h4>
					${inventory.map((w) => renderRow(w.name, w.id)).join("")}
				</div>
			` : ""}
			<div class="character-section">
				<h4>Escola Primária</h4>
				${primary ? renderRow(primary.name, primary.id) : renderRow("—")}
			</div>
			<div class="character-section">
				<h4>Escola Secundária</h4>
				${secondary ? renderRow(secondary.name, secondary.id) : renderRow("—")}
			</div>
			<div class="character-section">
				<h4>Habilidades Vampíricas</h4>
				${vampAbilities.length
					? vampAbilities.map((id) => renderRow(id, "id")).join("")
					: renderRow("—")}
			</div>
		</article>
	`;
}

(async function init() {
	const { weapons, schools, characters } = await loadAll();
	const container = document.getElementById("characters-list");
	container.innerHTML = characters.map((c) => renderCharacter(c, weapons, schools)).join("");
})();