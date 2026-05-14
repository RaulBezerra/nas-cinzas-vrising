/* ============================
   Nas Cinzas — V Rising
   blood-types.js v4
   Biblioteca de tipos de sangue com editor completo.
   Persistido no localStorage; JSON é apenas a semente inicial.
   ============================ */

const BT_STORAGE_KEY = "nas-cinzas-blood-types";

let bloodTypes = [];
let currentBtIconSrc = null;    // ícone do tipo de sangue no modal
let currentPowerIconSrc = null; // ícone do poder vampírico no modal
let editingBtId = null;

// Armazenamento ============================

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(BT_STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch { return null; }
}

function saveToStorage() {
	localStorage.setItem(BT_STORAGE_KEY, JSON.stringify(bloodTypes));
}

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
			<button class="char-edit-btn" title="Editar">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
				</svg>
			</button>
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

	card.querySelector(".char-edit-btn").addEventListener("click", () => openModal(bt));
	return card;
}

function renderList() {
	const container = document.getElementById("blood-list");
	container.innerHTML = "";
	bloodTypes.filter((bt) => !bt.disabled).forEach((bt) => container.appendChild(renderBloodType(bt)));
}

// Modal ============================

function slugify(str) {
	return str.toLowerCase()
		.normalize("NFD").replace(/[̀-ͯ]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

const EFFECT_KINDS = [
	{ value: "move",   label: "Movimento" },
	{ value: "attack", label: "Ataque" },
	{ value: "heal",   label: "Cura" },
	{ value: "text",   label: "Texto" },
];

function buildModal() {
	const overlay = document.createElement("div");
	overlay.id = "bt-modal";
	overlay.className = "modal-overlay";
	overlay.innerHTML = `
		<div class="modal">
			<div class="modal-header">
				<h3 id="bt-modal-title">Tipo de Sangue</h3>
				<button id="bt-modal-close" class="modal-close">×</button>
			</div>
			<div class="modal-body">
				<div class="char-icon-row">
					<div class="char-icon-preview" id="bt-icon-preview"></div>
					<div class="char-icon-controls">
						<label class="editor-btn editor-btn-small editor-btn-file">
							Carregar imagem
							<input type="file" id="bt-icon-input" accept="image/*" style="display:none">
						</label>
						<button id="bt-icon-clear" class="editor-btn editor-btn-small">Remover</button>
					</div>
				</div>
				<div class="modal-field-row">
					<label class="modal-field">
						<span class="modal-label">Nome</span>
						<input type="text" id="bt-name" class="editor-text-input" placeholder="Nome do tipo">
					</label>
					<label class="modal-field">
						<span class="modal-label">ID</span>
						<input type="text" id="bt-id" class="editor-text-input" placeholder="id">
					</label>
				</div>
				<div class="modal-field">
					<div class="modal-label-row">
						<span class="modal-label">Passivas (máx. 2)</span>
						<button id="bt-passive-add" class="editor-btn editor-btn-small">+ Adicionar</button>
					</div>
					<div id="bt-passives" class="vabilities-list"></div>
				</div>
				<div class="modal-section-sep"><span class="modal-label">Poder Vampírico</span></div>
				<label class="modal-field">
					<span class="modal-label">Nome do poder</span>
					<input type="text" id="bt-power-name" class="editor-text-input" placeholder="Deixe vazio para omitir">
				</label>
				<div class="char-icon-row">
					<div class="char-icon-preview" id="bt-power-icon-preview"></div>
					<div class="char-icon-controls">
						<label class="editor-btn editor-btn-small editor-btn-file">
							Ícone do poder
							<input type="file" id="bt-power-icon-input" accept="image/*" style="display:none">
						</label>
						<button id="bt-power-icon-clear" class="editor-btn editor-btn-small">Remover</button>
					</div>
				</div>
				<div class="modal-field">
					<div class="modal-label-row">
						<span class="modal-label">Efeitos do poder</span>
						<button id="bt-effect-add" class="editor-btn editor-btn-small">+ Efeito</button>
					</div>
					<div id="bt-effects" class="vabilities-list"></div>
				</div>
			</div>
			<div class="modal-footer">
				<button id="bt-modal-delete" class="editor-btn modal-delete-btn">Excluir</button>
				<div class="modal-footer-right">
					<button id="bt-modal-cancel" class="editor-btn">Cancelar</button>
					<button id="bt-modal-save" class="editor-btn editor-btn-primary">Salvar</button>
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(overlay);

	overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
	document.getElementById("bt-modal-close").addEventListener("click", closeModal);
	document.getElementById("bt-modal-cancel").addEventListener("click", closeModal);
	document.getElementById("bt-modal-save").addEventListener("click", handleSave);
	document.getElementById("bt-modal-delete").addEventListener("click", handleDelete);

	document.getElementById("bt-passive-add").addEventListener("click", () => {
		const container = document.getElementById("bt-passives");
		if (container.children.length < 2) addPassiveRow("");
	});

	document.getElementById("bt-effect-add").addEventListener("click", () => addEffectRow(null));

	wireIconUpload("bt-icon-input", "bt-icon-clear", "bt-icon-preview",
		(src) => { currentBtIconSrc = src; });

	wireIconUpload("bt-power-icon-input", "bt-power-icon-clear", "bt-power-icon-preview",
		(src) => { currentPowerIconSrc = src; });

	document.getElementById("bt-name").addEventListener("input", () => {
		if (!editingBtId) {
			document.getElementById("bt-id").value =
				slugify(document.getElementById("bt-name").value);
		}
	});
}

function wireIconUpload(inputId, clearId, previewId, onChangeSrc) {
	document.getElementById(inputId).addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			onChangeSrc(evt.target.result);
			updateIconPreview(previewId, evt.target.result);
		};
		reader.readAsDataURL(file);
	});
	document.getElementById(clearId).addEventListener("click", () => {
		onChangeSrc(null);
		updateIconPreview(previewId, null);
		document.getElementById(inputId).value = "";
	});
}

function updateIconPreview(previewId, src) {
	const preview = document.getElementById(previewId);
	preview.innerHTML = "";
	if (!src) return;
	const img = document.createElement("img");
	img.src = src;
	img.alt = "";
	img.onerror = () => { preview.innerHTML = ""; };
	preview.appendChild(img);
}

function addPassiveRow(description) {
	const container = document.getElementById("bt-passives");
	if (container.children.length >= 2) return;
	const row = document.createElement("div");
	row.className = "vability-row";
	const input = document.createElement("input");
	input.type = "text";
	input.className = "editor-text-input";
	input.placeholder = "Descrição da passiva";
	input.value = description;
	const del = document.createElement("button");
	del.className = "editor-map-delete";
	del.textContent = "×";
	del.addEventListener("click", () => row.remove());
	row.appendChild(input);
	row.appendChild(del);
	container.appendChild(row);
}

function addEffectRow(effect) {
	const container = document.getElementById("bt-effects");
	const row = document.createElement("div");
	row.className = "effect-row";

	const kindSel = document.createElement("select");
	kindSel.className = "modal-select effect-kind";
	EFFECT_KINDS.forEach(({ value, label }) => {
		const opt = document.createElement("option");
		opt.value = value;
		opt.textContent = label;
		kindSel.appendChild(opt);
	});

	const numInput = document.createElement("input");
	numInput.type = "number";
	numInput.className = "editor-text-input effect-num";
	numInput.placeholder = "valor";

	const txtInput = document.createElement("input");
	txtInput.type = "text";
	txtInput.className = "editor-text-input effect-txt";
	txtInput.placeholder = "descrição";
	txtInput.style.display = "none";

	const del = document.createElement("button");
	del.className = "editor-map-delete";
	del.textContent = "×";
	del.addEventListener("click", () => row.remove());

	function syncInputs() {
		const isText = kindSel.value === "text";
		numInput.style.display = isText ? "none" : "";
		txtInput.style.display = isText ? "" : "none";
	}

	kindSel.addEventListener("change", syncInputs);

	if (effect) {
		kindSel.value = effect.kind;
		if (effect.kind === "text") {
			txtInput.value = effect.text || "";
		} else {
			numInput.value = effect.value ?? "";
		}
	}
	syncInputs();

	row.appendChild(kindSel);
	row.appendChild(numInput);
	row.appendChild(txtInput);
	row.appendChild(del);
	container.appendChild(row);
}

function getEffectsFromUI() {
	return Array.from(document.querySelectorAll("#bt-effects .effect-row")).map((row) => {
		const kind = row.querySelector(".effect-kind").value;
		if (kind === "text") {
			const text = row.querySelector(".effect-txt").value.trim();
			return text ? { kind, text } : null;
		} else {
			const value = parseFloat(row.querySelector(".effect-num").value);
			return isNaN(value) ? null : { kind, value };
		}
	}).filter(Boolean);
}

function openModal(bt) {
	editingBtId = bt ? bt.id : null;
	currentBtIconSrc = bt ? (bt.icon || null) : null;
	currentPowerIconSrc = bt && bt.vampirePower ? (bt.vampirePower.icon || null) : null;

	document.getElementById("bt-modal-title").textContent =
		bt ? "Editar Tipo de Sangue" : "Novo Tipo de Sangue";

	const idInput = document.getElementById("bt-id");
	idInput.value = bt ? bt.id : "";
	idInput.readOnly = !!bt;
	idInput.style.color = bt ? "var(--ink-dim)" : "";

	document.getElementById("bt-name").value = bt ? bt.name : "";

	updateIconPreview("bt-icon-preview", currentBtIconSrc);
	updateIconPreview("bt-power-icon-preview", currentPowerIconSrc);
	document.getElementById("bt-icon-input").value = "";
	document.getElementById("bt-power-icon-input").value = "";

	const passivesContainer = document.getElementById("bt-passives");
	passivesContainer.innerHTML = "";
	(bt ? bt.passives : []).forEach((p) => addPassiveRow(p.description));

	const power = bt ? bt.vampirePower : null;
	document.getElementById("bt-power-name").value = power ? power.name : "";

	const effectsContainer = document.getElementById("bt-effects");
	effectsContainer.innerHTML = "";
	if (power && power.effects) power.effects.forEach(addEffectRow);

	document.getElementById("bt-modal-delete").style.display = bt ? "" : "none";

	document.getElementById("bt-modal").classList.add("open");
	document.getElementById("bt-name").focus();
}

function closeModal() {
	document.getElementById("bt-modal").classList.remove("open");
	editingBtId = null;
	currentBtIconSrc = null;
	currentPowerIconSrc = null;
}

function handleSave() {
	const name = document.getElementById("bt-name").value.trim();
	if (!name) { document.getElementById("bt-name").focus(); return; }

	let id = document.getElementById("bt-id").value.trim();
	if (!id) id = slugify(name) || "tipo";

	if (!editingBtId) {
		const base = id;
		let n = 2;
		while (bloodTypes.some((b) => b.id === id)) id = `${base}-${n++}`;
	}

	const passives = Array.from(
		document.querySelectorAll("#bt-passives .vability-row input")
	).map((inp) => inp.value.trim())
		.filter(Boolean)
		.map((desc) => ({ description: desc }));

	const powerName = document.getElementById("bt-power-name").value.trim();
	let vampirePower = null;
	if (powerName) {
		vampirePower = {
			id: `${id}-power`,
			name: powerName,
			icon: currentPowerIconSrc || null,
			effects: getEffectsFromUI(),
		};
	}

	const bt = {
		id,
		name,
		icon: currentBtIconSrc || null,
		passives,
		vampirePower,
	};

	if (editingBtId) {
		const idx = bloodTypes.findIndex((b) => b.id === editingBtId);
		if (idx >= 0) bloodTypes[idx] = bt;
	} else {
		bloodTypes.push(bt);
	}

	saveToStorage();
	renderList();
	closeModal();
}

function handleDelete() {
	if (!editingBtId) return;
	const bt = bloodTypes.find((b) => b.id === editingBtId);
	if (!confirm(`Excluir "${bt ? bt.name : editingBtId}"?`)) return;
	bloodTypes = bloodTypes.filter((b) => b.id !== editingBtId);
	saveToStorage();
	renderList();
	closeModal();
}

// Boot ============================

(async function init() {
	const jsonData = await fetch("data/blood-types.json").then((r) => r.json());
	const stored = loadFromStorage();

	if (!stored || stored.length === 0) {
		bloodTypes = jsonData;
	} else {
		// JSON é autoritativo para novos registros e para a flag `disabled`
		const merged = jsonData.map((j) => {
			const s = stored.find((e) => e.id === j.id);
			if (!s) return j;
			const bt = { ...s };
			if (j.disabled) bt.disabled = true;
			else delete bt.disabled;
			return bt;
		});
		// Mantém entradas criadas pelo usuário (ausentes no JSON)
		const userCreated = stored.filter((s) => !jsonData.some((j) => j.id === s.id));
		bloodTypes = [...merged, ...userCreated];
	}

	saveToStorage();
	buildModal();
	renderList();
	document.getElementById("new-bt-btn").addEventListener("click", () => openModal(null));
})();
