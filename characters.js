/* ============================
   Nas Cinzas — V Rising
   characters.js v4
   Biblioteca de personagens com editor completo.
   Personagens salvos no localStorage; JSON é apenas a semente inicial.
   ============================ */

const CHAR_STORAGE_KEY = "nas-cinzas-characters";

let allWeapons = [];
let allSchools = [];
let allBloodTypes = [];
let characters = [];
let currentIconSrc = null; // ícone atual no modal (path ou base64)
let editingId = null;       // id do personagem em edição (null = novo)

// Armazenamento ============================

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(CHAR_STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch { return null; }
}

function saveToStorage() {
	localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(characters));
}

// Carga inicial ============================

async function loadAll() {
	const [weapons, schools, bloodTypes, charJson] = await Promise.all([
		fetch("data/weapons.json").then((r) => r.json()),
		fetch("data/schools.json").then((r) => r.json()),
		fetch("data/blood-types.json").then((r) => r.json()),
		fetch("data/characters.json").then((r) => r.json()),
	]);
	allWeapons = weapons;
	allSchools = schools;
	allBloodTypes = bloodTypes;

	// localStorage tem prioridade; JSON é a semente se estiver vazio
	const stored = loadFromStorage();
	if (stored && stored.length > 0) {
		characters = stored;
	} else {
		characters = charJson;
		saveToStorage();
	}
}

// Render das cartas ============================

function iconImg(path) {
	if (!path) return "";
	return `<img src="${path}" alt="" onerror="this.remove()" onload="this.parentElement.classList.add('img-loaded')">`;
}

function renderRow(name, tag = "", iconPath = null, extraClass = "") {
	return `
		<div class="character-row${extraClass ? ` ${extraClass}` : ""}">
			<div class="character-row-icon">${iconImg(iconPath)}</div>
			<div class="character-row-name">${name}</div>
			${tag ? `<div class="character-row-tag">${tag}</div>` : ""}
		</div>
	`;
}

function renderCharacter(character) {
	const inventory = (character.inventory || [])
		.map((id) => allWeapons.find((w) => w.id === id))
		.filter(Boolean);
	const primary = allSchools.find((s) => s.id === character.primarySchool);
	const secondary = allSchools.find((s) => s.id === character.secondarySchool);
	const bloodType = allBloodTypes.find((b) => b.id === character.bloodType);
	const vampAbilities = character.vampireAbilities || [];

	const card = document.createElement("article");
	card.className = "library-card character";
	card.innerHTML = `
		<header class="library-card-header char-card-header">
			<div class="library-card-icon">${iconImg(character.icon)}</div>
			<div class="char-header-body">
				<div class="char-header-top">
					<h3>${character.name}</h3>
					<button class="char-edit-btn" title="Editar">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
						</svg>
					</button>
				</div>
				<div class="char-header-meta">
					<span class="char-header-meta-label">Sangue</span>
					<span class="char-header-meta-value">${bloodType ? bloodType.name : "—"}</span>
				</div>
			</div>
		</header>
		${inventory.length ? `
			<div class="character-section">
				<h4>Inventário</h4>
				${inventory.map((w) => renderRow(
					w.name, w.id, w.icon,
					w.id === character.equippedWeapon ? "char-row-equipped" : ""
				)).join("")}
			</div>
		` : ""}
		<div class="character-section">
			<h4>Escola Primária</h4>
			${primary ? renderRow(primary.name, primary.id, primary.icon) : renderRow("—")}
		</div>
		<div class="character-section">
			<h4>Escola Secundária</h4>
			${secondary ? renderRow(secondary.name, secondary.id, secondary.icon) : renderRow("—")}
		</div>
		<div class="character-section">
			<h4>Habilidades Vampíricas</h4>
			${vampAbilities.length
				? vampAbilities.map((id) => renderRow(id, "id")).join("")
				: renderRow("—")}
		</div>
	`;

	card.querySelector(".char-edit-btn").addEventListener("click", () => openModal(character));
	return card;
}

function renderList() {
	const container = document.getElementById("characters-list");
	container.innerHTML = "";
	characters.forEach((c) => container.appendChild(renderCharacter(c)));
}

// Modal ============================

function slugify(str) {
	return str.toLowerCase()
		.normalize("NFD").replace(/[̀-ͯ]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

function buildModal() {
	const overlay = document.createElement("div");
	overlay.id = "char-modal";
	overlay.className = "modal-overlay";
	overlay.innerHTML = `
		<div class="modal">
			<div class="modal-header">
				<h3 id="modal-title">Personagem</h3>
				<button id="modal-close" class="modal-close">×</button>
			</div>
			<div class="modal-body">
				<div class="char-icon-row">
					<div class="char-icon-preview" id="char-icon-preview"></div>
					<div class="char-icon-controls">
						<label class="editor-btn editor-btn-small editor-btn-file">
							Carregar imagem
							<input type="file" id="char-icon-input" accept="image/*" style="display:none">
						</label>
						<button id="char-icon-clear" class="editor-btn editor-btn-small">Remover</button>
					</div>
				</div>
				<div class="modal-field-row">
					<label class="modal-field">
						<span class="modal-label">Nome</span>
						<input type="text" id="modal-name" class="editor-text-input" placeholder="Nome do personagem">
					</label>
					<label class="modal-field">
						<span class="modal-label">ID</span>
						<input type="text" id="modal-id" class="editor-text-input" placeholder="id">
					</label>
				</div>
				<label class="modal-field">
					<span class="modal-label">Arma equipada</span>
					<select id="modal-weapon" class="modal-select"></select>
				</label>
				<div class="modal-field">
					<span class="modal-label">Inventário</span>
					<div id="modal-inventory" class="modal-checkboxes"></div>
				</div>
				<label class="modal-field">
					<span class="modal-label">Escola primária</span>
					<select id="modal-primary" class="modal-select"></select>
				</label>
				<label class="modal-field">
					<span class="modal-label">Escola secundária</span>
					<select id="modal-secondary" class="modal-select"></select>
				</label>
				<label class="modal-field">
					<span class="modal-label">Tipo de sangue</span>
					<select id="modal-bloodtype" class="modal-select"></select>
				</label>
				<div class="modal-field">
					<div class="modal-label-row">
						<span class="modal-label">Habilidades vampíricas</span>
						<button id="modal-vability-add" class="editor-btn editor-btn-small">+ Adicionar</button>
					</div>
					<div id="modal-vabilities" class="vabilities-list"></div>
				</div>
			</div>
			<div class="modal-footer">
				<button id="modal-delete" class="editor-btn modal-delete-btn">Excluir</button>
				<div class="modal-footer-right">
					<button id="modal-cancel" class="editor-btn">Cancelar</button>
					<button id="modal-save" class="editor-btn editor-btn-primary">Salvar</button>
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(overlay);

	overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
	document.getElementById("modal-close").addEventListener("click", closeModal);
	document.getElementById("modal-cancel").addEventListener("click", closeModal);
	document.getElementById("modal-save").addEventListener("click", handleSave);
	document.getElementById("modal-delete").addEventListener("click", handleDelete);
	document.getElementById("modal-vability-add").addEventListener("click", () => addVabilityRow(""));

	document.getElementById("char-icon-input").addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			currentIconSrc = evt.target.result;
			updateIconPreview(currentIconSrc);
		};
		reader.readAsDataURL(file);
	});

	document.getElementById("char-icon-clear").addEventListener("click", () => {
		currentIconSrc = null;
		updateIconPreview(null);
		document.getElementById("char-icon-input").value = "";
	});

	// Auto-deriva o ID a partir do nome para novos personagens
	document.getElementById("modal-name").addEventListener("input", () => {
		if (!editingId) {
			document.getElementById("modal-id").value = slugify(
				document.getElementById("modal-name").value
			);
		}
	});
}

function updateIconPreview(src) {
	const preview = document.getElementById("char-icon-preview");
	preview.innerHTML = "";
	if (!src) return;
	const img = document.createElement("img");
	img.src = src;
	img.alt = "";
	img.onerror = () => {
		currentIconSrc = null;
		preview.innerHTML = "";
	};
	preview.appendChild(img);
}

function populateWeaponOptions(selectedId) {
	const sel = document.getElementById("modal-weapon");
	sel.innerHTML = '<option value="">— nenhuma —</option>';
	allWeapons.forEach((w) => {
		const opt = document.createElement("option");
		opt.value = w.id;
		opt.textContent = w.name;
		if (w.id === selectedId) opt.selected = true;
		sel.appendChild(opt);
	});
}

function populateSchoolOptions(selId, selectedId) {
	const sel = document.getElementById(selId);
	sel.innerHTML = '<option value="">— nenhuma —</option>';
	allSchools.forEach((s) => {
		const opt = document.createElement("option");
		opt.value = s.id;
		opt.textContent = s.name;
		if (s.id === selectedId) opt.selected = true;
		sel.appendChild(opt);
	});
}

function populateBloodTypeOptions(selectedId) {
	const sel = document.getElementById("modal-bloodtype");
	sel.innerHTML = '<option value="">— nenhum —</option>';
	allBloodTypes.forEach((b) => {
		const opt = document.createElement("option");
		opt.value = b.id;
		opt.textContent = b.name;
		if (b.id === selectedId) opt.selected = true;
		sel.appendChild(opt);
	});
}

function populateInventory(selectedIds) {
	const container = document.getElementById("modal-inventory");
	container.innerHTML = "";
	allWeapons.forEach((w) => {
		const label = document.createElement("label");
		label.className = "modal-checkbox-row";
		const cb = document.createElement("input");
		cb.type = "checkbox";
		cb.value = w.id;
		if (selectedIds && selectedIds.includes(w.id)) cb.checked = true;
		label.appendChild(cb);
		label.appendChild(document.createTextNode(w.name));
		container.appendChild(label);
	});
}

function addVabilityRow(value) {
	const container = document.getElementById("modal-vabilities");
	const row = document.createElement("div");
	row.className = "vability-row";
	const input = document.createElement("input");
	input.type = "text";
	input.className = "editor-text-input";
	input.placeholder = "id-da-habilidade";
	input.value = value;
	const del = document.createElement("button");
	del.className = "editor-map-delete";
	del.textContent = "×";
	del.addEventListener("click", () => row.remove());
	row.appendChild(input);
	row.appendChild(del);
	container.appendChild(row);
}

function openModal(character) {
	editingId = character ? character.id : null;

	document.getElementById("modal-title").textContent =
		character ? "Editar Personagem" : "Novo Personagem";

	const idInput = document.getElementById("modal-id");
	idInput.value = character ? character.id : "";
	idInput.readOnly = !!character;
	idInput.style.color = character ? "var(--ink-dim)" : "";

	document.getElementById("modal-name").value = character ? character.name : "";

	currentIconSrc = character ? (character.icon || null) : null;
	updateIconPreview(currentIconSrc);
	document.getElementById("char-icon-input").value = "";

	populateWeaponOptions(character ? character.equippedWeapon : "");
	populateInventory(character ? character.inventory : []);
	populateSchoolOptions("modal-primary", character ? character.primarySchool : "");
	populateSchoolOptions("modal-secondary", character ? character.secondarySchool : "");
	populateBloodTypeOptions(character ? character.bloodType : "");

	const vabContainer = document.getElementById("modal-vabilities");
	vabContainer.innerHTML = "";
	(character ? (character.vampireAbilities || []) : []).forEach(addVabilityRow);

	document.getElementById("modal-delete").style.display = character ? "" : "none";

	document.getElementById("char-modal").classList.add("open");
	document.getElementById("modal-name").focus();
}

function closeModal() {
	document.getElementById("char-modal").classList.remove("open");
	editingId = null;
	currentIconSrc = null;
}

function handleSave() {
	const name = document.getElementById("modal-name").value.trim();
	if (!name) {
		document.getElementById("modal-name").focus();
		return;
	}

	let id = document.getElementById("modal-id").value.trim();
	if (!id) id = slugify(name) || "personagem";

	// Evita conflito de ID ao criar novo personagem
	if (!editingId) {
		const base = id;
		let n = 2;
		while (characters.some((c) => c.id === id)) id = `${base}-${n++}`;
	}

	const equippedWeapon = document.getElementById("modal-weapon").value || null;

	const inventory = Array.from(
		document.querySelectorAll("#modal-inventory input[type=checkbox]:checked")
	).map((cb) => cb.value);

	const primarySchool = document.getElementById("modal-primary").value || null;
	const secondarySchool = document.getElementById("modal-secondary").value || null;
	const bloodType = document.getElementById("modal-bloodtype").value || null;

	const vampireAbilities = Array.from(
		document.querySelectorAll("#modal-vabilities input")
	).map((inp) => inp.value.trim()).filter(Boolean);

	const char = {
		id,
		name,
		icon: currentIconSrc || null,
		equippedWeapon,
		inventory,
		primarySchool,
		secondarySchool,
		bloodType,
		vampireAbilities,
	};

	if (editingId) {
		const idx = characters.findIndex((c) => c.id === editingId);
		if (idx >= 0) characters[idx] = char;
	} else {
		characters.push(char);
	}

	saveToStorage();
	renderList();
	closeModal();
}

function handleDelete() {
	if (!editingId) return;
	const char = characters.find((c) => c.id === editingId);
	if (!confirm(`Excluir "${char ? char.name : editingId}"?`)) return;
	characters = characters.filter((c) => c.id !== editingId);
	saveToStorage();
	renderList();
	closeModal();
}

// Boot ============================

(async function init() {
	await loadAll();
	buildModal();
	renderList();
	document.getElementById("new-char-btn").addEventListener("click", () => openModal(null));
})();
