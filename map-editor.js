/* ============================
   Nas Cinzas — V Rising
   map-editor.js v3
   ============================ */

const SVG_NS = "http://www.w3.org/2000/svg";
const STORAGE_KEY = "nas-cinzas-maps";
const HEX_SIZE = 40;

let state = {
	name: "Novo mapa",
	cols: 9,
	rows: 7,
	hexes: {},
	pieces: {},
};

let activeTool = "free";
let isPainting = false;
let showLabels = true;
let savedMaps = [];
let activeMapIndex = -1;

// --- Estado de peças ---
let selectedPieceKey = null;
let pieceColor = "#c04040";
let pieceFacing = 5;
let isDraggingPiece = false;
let dragSourceKey = null;
let dragTargetKey = null;

// --- Undo / Redo ---
const MAX_HISTORY = 50;
let undoStack = [];
let redoStack = [];

// --- Geometria ---

function hexMetrics(size) {
	const w = Math.sqrt(3) * size;
	const h = 2 * size;
	return { w, h, hSpacing: w, vSpacing: 1.5 * size };
}

function hexCenter(col, row, size) {
	const m = hexMetrics(size);
	const xOffset = row % 2 === 1 ? m.w / 2 : 0;
	return {
		x: col * m.hSpacing + xOffset + m.w / 2,
		y: row * m.vSpacing + m.h / 2,
	};
}

function hexPoints(cx, cy, size) {
	const pts = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 180) * (60 * i - 30);
		pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
	}
	return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

// --- Undo / Redo ---

function snapshot() {
	undoStack.push(JSON.stringify(state));
	if (undoStack.length > MAX_HISTORY) undoStack.shift();
	redoStack = [];
}

function syncStateToUI() {
	document.getElementById("input-map-name").value = state.name;
	document.getElementById("input-cols").value = state.cols;
	document.getElementById("input-rows").value = state.rows;
	selectedPieceKey = null;
	isPainting = false;
	isDraggingPiece = false;
	updatePiecePanel();
	renderGrid();
	renderPieceList();
}

function undo() {
	if (undoStack.length === 0) return;
	redoStack.push(JSON.stringify(state));
	state = JSON.parse(undoStack.pop());
	syncStateToUI();
	setStatus("Desfeito.");
}

function redo() {
	if (redoStack.length === 0) return;
	undoStack.push(JSON.stringify(state));
	state = JSON.parse(redoStack.pop());
	syncStateToUI();
	setStatus("Refeito.");
}

// --- Estado dos hexes ---

function hexKey(col, row) { return `${col},${row}`; }

function getHexType(col, row) {
	return state.hexes[hexKey(col, row)] || "free";
}

function setHexType(col, row, type) {
	const key = hexKey(col, row);
	if (type === "free") {
		delete state.hexes[key];
	} else {
		state.hexes[key] = type;
	}
	updateHexVisual(col, row);
}

function updateHexVisual(col, row) {
	const svg = document.getElementById("editor-board");
	const poly = svg.querySelector(`polygon[data-col="${col}"][data-row="${row}"]`);
	if (!poly) return;
	const type = getHexType(col, row);
	poly.setAttribute("class", `editor-hex editor-hex-${type}`);
	poly.dataset.type = type;
}

// --- Renderização do grid ---

function renderGrid() {
	const svg = document.getElementById("editor-board");
	svg.innerHTML = "";

	const { cols, rows } = state;
	const m = hexMetrics(HEX_SIZE);

	const viewW = cols * m.w + m.w / 2;
	const viewH = (rows - 1) * m.vSpacing + m.h;
	svg.setAttribute("viewBox", `0 0 ${viewW.toFixed(2)} ${viewH.toFixed(2)}`);
	svg.style.width = `${viewW.toFixed(0)}px`;
	svg.style.height = `${viewH.toFixed(0)}px`;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const { x, y } = hexCenter(col, row, HEX_SIZE);
			const type = getHexType(col, row);

			const poly = document.createElementNS(SVG_NS, "polygon");
			poly.setAttribute("points", hexPoints(x, y, HEX_SIZE));
			poly.setAttribute("class", `editor-hex editor-hex-${type}`);
			poly.dataset.col = col;
			poly.dataset.row = row;
			poly.dataset.type = type;
			svg.appendChild(poly);

			if (showLabels && type !== "vazio") {
				const label = document.createElementNS(SVG_NS, "text");
				label.setAttribute("x", x.toFixed(2));
				label.setAttribute("y", (y + 5).toFixed(2));
				label.setAttribute("class", "editor-hex-label");
				label.textContent = `${col},${row}`;
				svg.appendChild(label);
			}
		}
	}

	renderPieces();
}

// --- Peças ---

function pieceAngle(facing) {
	return (Math.PI / 180) * (60 * facing);
}

function renderPieces() {
	const svg = document.getElementById("editor-board");
	svg.querySelectorAll(".piece-group").forEach(g => g.remove());
	for (const [key, piece] of Object.entries(state.pieces)) {
		const [col, row] = key.split(",").map(Number);
		renderPieceAt(col, row, piece);
	}
}

function renderPieceAt(col, row, piece) {
	const svg = document.getElementById("editor-board");
	const key = hexKey(col, row);

	const existing = svg.querySelector(`.piece-group[data-piece-key="${key}"]`);
	if (existing) existing.remove();

	if (!piece) return;

	const { x, y } = hexCenter(col, row, HEX_SIZE);
	const angle = pieceAngle(piece.facing);
	const R = 17;
	const tipR = 27;
	const baseR = 19;
	const baseHalfW = 5;

	const tipX = x + tipR * Math.cos(angle);
	const tipY = y + tipR * Math.sin(angle);
	const baseX = x + baseR * Math.cos(angle);
	const baseY = y + baseR * Math.sin(angle);
	const perp = angle + Math.PI / 2;
	const aX = baseX + baseHalfW * Math.cos(perp);
	const aY = baseY + baseHalfW * Math.sin(perp);
	const bX = baseX - baseHalfW * Math.cos(perp);
	const bY = baseY - baseHalfW * Math.sin(perp);

	const isSelected = selectedPieceKey === key;

	const g = document.createElementNS(SVG_NS, "g");
	g.setAttribute("class", "piece-group");
	g.setAttribute("data-piece-key", key);

	const circle = document.createElementNS(SVG_NS, "circle");
	circle.setAttribute("cx", x.toFixed(2));
	circle.setAttribute("cy", y.toFixed(2));
	circle.setAttribute("r", R);
	circle.setAttribute("fill", piece.color);
	circle.setAttribute("stroke", isSelected ? "#e8edf2" : "rgba(255,255,255,0.3)");
	circle.setAttribute("stroke-width", isSelected ? "2.5" : "1.5");
	circle.setAttribute("data-piece-key", key);

	const arrow = document.createElementNS(SVG_NS, "polygon");
	arrow.setAttribute("points",
		`${tipX.toFixed(2)},${tipY.toFixed(2)} ${aX.toFixed(2)},${aY.toFixed(2)} ${bX.toFixed(2)},${bY.toFixed(2)}`
	);
	arrow.setAttribute("fill", "rgba(255,255,255,0.85)");
	arrow.setAttribute("data-piece-key", key);

	g.appendChild(circle);
	g.appendChild(arrow);

	if (piece.name) {
		const letter = document.createElementNS(SVG_NS, "text");
		letter.setAttribute("x", x.toFixed(2));
		letter.setAttribute("y", y.toFixed(2));
		letter.setAttribute("class", "piece-label");
		letter.setAttribute("data-piece-key", key);
		letter.textContent = piece.name.charAt(0).toUpperCase();
		g.appendChild(letter);
	}

	svg.appendChild(g);
}

function placePiece(col, row) {
	snapshot();
	const key = hexKey(col, row);
	state.pieces[key] = { color: pieceColor, facing: pieceFacing, name: "" };
	renderPieceAt(col, row, state.pieces[key]);
	selectPiece(key);
}

function selectPiece(key) {
	const prev = selectedPieceKey;
	selectedPieceKey = key;

	// re-renderiza a anterior para retirar o highlight
	if (prev && prev !== key && state.pieces[prev]) {
		const [c, r] = prev.split(",").map(Number);
		renderPieceAt(c, r, state.pieces[prev]);
	}

	const piece = state.pieces[key];
	if (piece) {
		pieceColor = piece.color;
		pieceFacing = piece.facing;
		const [c, r] = key.split(",").map(Number);
		renderPieceAt(c, r, piece);
	}

	updatePiecePanel();
	renderPieceList();
}

function deletePiece(key) {
	if (!key || !state.pieces[key]) return;
	snapshot();
	delete state.pieces[key];
	const svg = document.getElementById("editor-board");
	const g = svg.querySelector(`.piece-group[data-piece-key="${key}"]`);
	if (g) g.remove();
	if (selectedPieceKey === key) {
		selectedPieceKey = null;
		updatePiecePanel();
	}
	renderPieceList();
}

function setPieceColor(color) {
	pieceColor = color;
	if (selectedPieceKey && state.pieces[selectedPieceKey]) {
		state.pieces[selectedPieceKey].color = color;
		const [c, r] = selectedPieceKey.split(",").map(Number);
		renderPieceAt(c, r, state.pieces[selectedPieceKey]);
	}
	updatePiecePanel();
}

function setPieceFacing(dir) {
	pieceFacing = dir;
	if (selectedPieceKey && state.pieces[selectedPieceKey]) {
		state.pieces[selectedPieceKey].facing = dir;
		const [c, r] = selectedPieceKey.split(",").map(Number);
		renderPieceAt(c, r, state.pieces[selectedPieceKey]);
	}
	updatePiecePanel();
}

function getPieceKeyFromElement(el) {
	return el.dataset.pieceKey ||
		(el.parentElement && el.parentElement.dataset.pieceKey) || null;
}

function clearDragHighlight() {
	document.querySelectorAll(".editor-hex.drag-target").forEach(el => {
		el.classList.remove("drag-target");
	});
}

function startDrag(pieceKey) {
	isDraggingPiece = true;
	dragSourceKey = pieceKey;
	dragTargetKey = null;
	const svg = document.getElementById("editor-board");
	const g = svg.querySelector(`.piece-group[data-piece-key="${pieceKey}"]`);
	if (g) {
		g.style.opacity = "0.45";
		g.style.pointerEvents = "none";
	}
}

function endDrag() {
	if (!isDraggingPiece) return;
	isDraggingPiece = false;

	const svg = document.getElementById("editor-board");
	const g = svg.querySelector(`.piece-group[data-piece-key="${dragSourceKey}"]`);
	if (g) { g.style.opacity = ""; g.style.pointerEvents = ""; }

	clearDragHighlight();

	if (dragTargetKey && dragTargetKey !== dragSourceKey) {
		const [tc, tr] = dragTargetKey.split(",").map(Number);
		if (getHexType(tc, tr) !== "vazio" && !state.pieces[dragTargetKey]) {
			snapshot();
			const piece = state.pieces[dragSourceKey];
			delete state.pieces[dragSourceKey];
			state.pieces[dragTargetKey] = piece;
			const oldG = svg.querySelector(`.piece-group[data-piece-key="${dragSourceKey}"]`);
			if (oldG) oldG.remove();
			if (selectedPieceKey === dragSourceKey) selectedPieceKey = dragTargetKey;
			renderPieceAt(tc, tr, piece);
			updatePiecePanel();
			renderPieceList();
		}
	}

	dragSourceKey = null;
	dragTargetKey = null;
}

function handlePieceClick(el) {
	const pieceKey = getPieceKeyFromElement(el);
	if (pieceKey && state.pieces[pieceKey]) {
		selectPiece(pieceKey);
		return;
	}
	if (el.tagName !== "polygon") return;
	const col = parseInt(el.dataset.col);
	const row = parseInt(el.dataset.row);
	if (isNaN(col) || isNaN(row)) return;
	const key = hexKey(col, row);
	if (state.pieces[key]) {
		selectPiece(key);
	} else if (getHexType(col, row) !== "vazio") {
		placePiece(col, row);
	}
}

function updatePiecePanel() {
	// swatches de cor
	document.querySelectorAll(".piece-color-swatch").forEach(btn => {
		btn.classList.toggle("active", btn.dataset.color === pieceColor);
	});
	const custom = document.getElementById("piece-color-custom");
	if (custom) custom.value = pieceColor;

	// botões de direção
	document.querySelectorAll(".facing-btn").forEach(btn => {
		btn.classList.toggle("active", parseInt(btn.dataset.dir) === pieceFacing);
	});

	// info da peça selecionada
	const infoEl = document.getElementById("piece-selected-info");
	const nameInput = document.getElementById("piece-name-input");
	const delBtn = document.getElementById("btn-delete-piece");
	if (selectedPieceKey && state.pieces[selectedPieceKey]) {
		const [c, r] = selectedPieceKey.split(",").map(Number);
		infoEl.textContent = `Hex ${c}, ${r}`;
		nameInput.value = state.pieces[selectedPieceKey].name || "";
		nameInput.disabled = false;
		delBtn.disabled = false;
	} else {
		infoEl.textContent = "Nenhuma";
		nameInput.value = "";
		nameInput.disabled = true;
		delBtn.disabled = true;
	}
}

function renderPieceList() {
	const list = document.getElementById("piece-list");
	list.innerHTML = "";
	const keys = Object.keys(state.pieces);

	if (keys.length === 0) {
		const li = document.createElement("li");
		li.className = "editor-map-empty";
		li.textContent = "Nenhuma peça no mapa";
		list.appendChild(li);
		return;
	}

	keys.forEach(key => {
		const piece = state.pieces[key];
		const [c, r] = key.split(",").map(Number);
		const li = document.createElement("li");
		li.className = "editor-map-item" + (key === selectedPieceKey ? " active" : "");

		const swatch = document.createElement("span");
		swatch.className = "piece-list-swatch";
		swatch.style.background = piece.color;

		const btn = document.createElement("button");
		btn.className = "editor-map-name-btn";
		btn.textContent = piece.name || `${c}, ${r}`;
		btn.addEventListener("click", () => { setActiveTool("peca"); selectPiece(key); });

		const del = document.createElement("button");
		del.className = "editor-map-delete";
		del.textContent = "×";
		del.addEventListener("click", (e) => { e.stopPropagation(); deletePiece(key); });

		li.appendChild(swatch);
		li.appendChild(btn);
		if (piece.name) {
			const coords = document.createElement("span");
			coords.className = "editor-map-meta";
			coords.textContent = `${c},${r}`;
			li.appendChild(coords);
		}
		li.appendChild(del);
		list.appendChild(li);
	});
}

// --- Pintura por click e arrasto ---

function paintHexAt(el) {
	if (!el || el.tagName !== "polygon") return;
	const col = parseInt(el.dataset.col);
	const row = parseInt(el.dataset.row);
	if (isNaN(col) || isNaN(row)) return;
	setHexType(col, row, activeTool);
}

function setupPainting() {
	const svg = document.getElementById("editor-board");

	svg.addEventListener("mousedown", (e) => {
		if (activeTool === "peca") {
			const pieceKey = getPieceKeyFromElement(e.target);
			if (pieceKey && state.pieces[pieceKey]) {
				selectPiece(pieceKey);
				startDrag(pieceKey);
			} else {
				handlePieceClick(e.target);
			}
			e.preventDefault();
			return;
		}
		snapshot();
		isPainting = true;
		paintHexAt(e.target);
		e.preventDefault();
	});

	svg.addEventListener("mouseover", (e) => {
		if (isDraggingPiece) {
			clearDragHighlight();
			const el = e.target;
			if (el.tagName === "polygon" && el.dataset.col !== undefined) {
				const col = parseInt(el.dataset.col);
				const row = parseInt(el.dataset.row);
				const key = hexKey(col, row);
				if (key !== dragSourceKey && getHexType(col, row) !== "vazio" && !state.pieces[key]) {
					el.classList.add("drag-target");
					dragTargetKey = key;
				} else {
					dragTargetKey = null;
				}
			}
			return;
		}
		if (isPainting && activeTool !== "peca") paintHexAt(e.target);
	});

	document.addEventListener("mouseup", () => {
		isPainting = false;
		if (isDraggingPiece) endDrag();
	});

	svg.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		const pieceKey = getPieceKeyFromElement(e.target);
		if (!pieceKey || !state.pieces[pieceKey]) return;
		snapshot();
		const piece = state.pieces[pieceKey];
		piece.facing = (piece.facing + 1) % 6;
		const [c, r] = pieceKey.split(",").map(Number);
		renderPieceAt(c, r, piece);
		if (selectedPieceKey === pieceKey) {
			pieceFacing = piece.facing;
			updatePiecePanel();
		}
	});
}

// --- Persistência ---

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		savedMaps = raw ? JSON.parse(raw) : [];
	} catch {
		savedMaps = [];
	}
}

function writeToStorage() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMaps));
}

function saveCurrentMap() {
	const nameInput = document.getElementById("input-map-name");
	state.name = nameInput.value.trim() || "Sem nome";
	nameInput.value = state.name;

	const snapshot = JSON.parse(JSON.stringify(state));

	if (activeMapIndex >= 0 && activeMapIndex < savedMaps.length) {
		savedMaps[activeMapIndex] = snapshot;
	} else {
		savedMaps.push(snapshot);
		activeMapIndex = savedMaps.length - 1;
	}

	writeToStorage();
	renderMapList();
	setStatus(`"${state.name}" salvo.`);
}

function loadMap(index) {
	const map = savedMaps[index];
	if (!map) return;

	state = JSON.parse(JSON.stringify(map));
	if (!state.pieces) state.pieces = {};
	activeMapIndex = index;

	document.getElementById("input-map-name").value = state.name;
	document.getElementById("input-cols").value = state.cols;
	document.getElementById("input-rows").value = state.rows;

	selectedPieceKey = null;
	updatePiecePanel();
	renderGrid();
	renderMapList();
	renderPieceList();
	setStatus(`"${state.name}" carregado.`);
}

function deleteMap(index) {
	const name = savedMaps[index].name;
	savedMaps.splice(index, 1);
	if (activeMapIndex === index) {
		activeMapIndex = -1;
	} else if (activeMapIndex > index) {
		activeMapIndex--;
	}
	writeToStorage();
	renderMapList();
	setStatus(`"${name}" excluído.`);
}

function newMap() {
	state = {
		name: "Novo mapa",
		cols: Math.min(24, Math.max(3, parseInt(document.getElementById("input-cols").value) || 9)),
		rows: Math.min(20, Math.max(3, parseInt(document.getElementById("input-rows").value) || 7)),
		hexes: {},
		pieces: {},
	};
	activeMapIndex = -1;
	selectedPieceKey = null;
	document.getElementById("input-map-name").value = state.name;
	updatePiecePanel();
	renderGrid();
	renderMapList();
	renderPieceList();
	setStatus("Novo mapa criado.");
}

function generateGrid() {
	snapshot();
	const cols = Math.min(24, Math.max(3, parseInt(document.getElementById("input-cols").value) || 9));
	const rows = Math.min(20, Math.max(3, parseInt(document.getElementById("input-rows").value) || 7));
	state.cols = cols;
	state.rows = rows;
	const pruned = {};
	for (const [key, val] of Object.entries(state.hexes)) {
		const [c, r] = key.split(",").map(Number);
		if (c < cols && r < rows) pruned[key] = val;
	}
	state.hexes = pruned;
	// remove peças fora do novo tamanho
	const prunedPieces = {};
	for (const [key, val] of Object.entries(state.pieces)) {
		const [c, r] = key.split(",").map(Number);
		if (c < cols && r < rows) prunedPieces[key] = val;
	}
	state.pieces = prunedPieces;
	if (selectedPieceKey) {
		const [c, r] = selectedPieceKey.split(",").map(Number);
		if (c >= cols || r >= rows) {
			selectedPieceKey = null;
			updatePiecePanel();
		}
	}
	renderGrid();
	renderPieceList();
}

// --- Export / Import ---

function exportJSON() {
	const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = `${state.name.replace(/\s+/g, "-").toLowerCase() || "mapa"}.json`;
	a.click();
	URL.revokeObjectURL(a.href);
}

function importJSON(file) {
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const data = JSON.parse(e.target.result);
			if (!data.cols || !data.rows) throw new Error("formato inválido");
			state = {
				name: data.name || "Importado",
				cols: Number(data.cols),
				rows: Number(data.rows),
				hexes: data.hexes || {},
				pieces: data.pieces || {},
			};
			activeMapIndex = -1;
			selectedPieceKey = null;
			document.getElementById("input-map-name").value = state.name;
			document.getElementById("input-cols").value = state.cols;
			document.getElementById("input-rows").value = state.rows;
			updatePiecePanel();
			renderGrid();
			renderPieceList();
			setStatus(`"${state.name}" importado.`);
		} catch {
			setStatus("Erro: arquivo inválido.");
		}
	};
	reader.readAsText(file);
}

// --- Lista de mapas salvos ---

function renderMapList() {
	const list = document.getElementById("map-list");
	list.innerHTML = "";

	if (savedMaps.length === 0) {
		const li = document.createElement("li");
		li.className = "editor-map-empty";
		li.textContent = "Nenhum mapa salvo";
		list.appendChild(li);
		return;
	}

	savedMaps.forEach((map, i) => {
		const li = document.createElement("li");
		li.className = "editor-map-item" + (i === activeMapIndex ? " active" : "");

		const nameBtn = document.createElement("button");
		nameBtn.className = "editor-map-name-btn";
		nameBtn.textContent = map.name;
		nameBtn.title = `${map.cols}×${map.rows} hexes`;
		nameBtn.addEventListener("click", () => loadMap(i));

		const meta = document.createElement("span");
		meta.className = "editor-map-meta";
		meta.textContent = `${map.cols}×${map.rows}`;

		const delBtn = document.createElement("button");
		delBtn.className = "editor-map-delete";
		delBtn.textContent = "×";
		delBtn.title = "Excluir";
		delBtn.addEventListener("click", (e) => { e.stopPropagation(); deleteMap(i); });

		li.appendChild(nameBtn);
		li.appendChild(meta);
		li.appendChild(delBtn);
		list.appendChild(li);
	});
}

// --- Helpers de UI ---

function setStatus(msg) {
	const el = document.getElementById("editor-status");
	el.textContent = msg;
	clearTimeout(el._timer);
	el._timer = setTimeout(() => { el.textContent = ""; }, 3000);
}

function setActiveTool(tool) {
	activeTool = tool;
	document.querySelectorAll(".tool-btn").forEach(btn => {
		btn.classList.toggle("active", btn.dataset.tool === tool);
	});
}

// --- Init ---

function init() {
	loadFromStorage();

	document.getElementById("btn-generate").addEventListener("click", generateGrid);

	document.querySelectorAll(".tool-btn").forEach(btn => {
		btn.addEventListener("click", () => setActiveTool(btn.dataset.tool));
	});

	document.getElementById("btn-save").addEventListener("click", saveCurrentMap);
	document.getElementById("btn-new").addEventListener("click", newMap);
	document.getElementById("btn-export").addEventListener("click", exportJSON);

	document.getElementById("btn-import").addEventListener("change", (e) => {
		if (e.target.files[0]) importJSON(e.target.files[0]);
		e.target.value = "";
	});

	document.getElementById("toggle-labels").addEventListener("change", (e) => {
		showLabels = e.target.checked;
		renderGrid();
	});

	// painel de peças
	document.querySelectorAll(".piece-color-swatch").forEach(btn => {
		btn.addEventListener("click", () => setPieceColor(btn.dataset.color));
	});

	document.getElementById("piece-color-custom").addEventListener("input", (e) => {
		setPieceColor(e.target.value);
	});

	document.querySelectorAll(".facing-btn").forEach(btn => {
		btn.addEventListener("click", () => setPieceFacing(parseInt(btn.dataset.dir)));
	});

	document.getElementById("piece-name-input").addEventListener("input", (e) => {
		if (selectedPieceKey && state.pieces[selectedPieceKey]) {
			state.pieces[selectedPieceKey].name = e.target.value;
			renderPieceList();
		}
	});

	document.getElementById("btn-delete-piece").addEventListener("click", () => {
		if (selectedPieceKey) deletePiece(selectedPieceKey);
	});

	document.addEventListener("keydown", (e) => {
		const tag = document.activeElement.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA") return;
		if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
			e.preventDefault();
			undo();
		}
		if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
			e.preventDefault();
			redo();
		}
	});

	renderGrid();
	setupPainting();
	renderMapList();
	renderPieceList();
	updatePiecePanel();
}

init();
