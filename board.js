/* ============================
   Nas Cinzas — V Rising
   board.js v2
   ============================ */

const BOARD = { size: 32 };
const SVG_NS = "http://www.w3.org/2000/svg";
const MAP_STORAGE_KEY = "nas-cinzas-maps";

let boardMaps = [];

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

function loadMaps() {
	try {
		const raw = localStorage.getItem(MAP_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
}

function populateSelect(maps) {
	const sel = document.getElementById("map-select");
	if (!sel) return;
	sel.innerHTML = '<option value="">Grade padrão (7×5)</option>';
	maps.forEach((map, i) => {
		const opt = document.createElement("option");
		opt.value = i;
		opt.textContent = `${map.name} (${map.cols}×${map.rows})`;
		sel.appendChild(opt);
	});
}

function renderBoard(mapData) {
	const svg = document.getElementById("board");
	if (!svg) return;

	const cols = mapData ? mapData.cols : 7;
	const rows = mapData ? mapData.rows : 5;
	const hexes = mapData ? (mapData.hexes || {}) : {};
	const pieces = mapData ? (mapData.pieces || {}) : {};
	const size = BOARD.size;
	const m = hexMetrics(size);

	const viewW = cols * m.w + m.w / 2;
	const viewH = (rows - 1) * m.vSpacing + m.h;
	svg.setAttribute("viewBox", `0 0 ${viewW.toFixed(2)} ${viewH.toFixed(2)}`);
	svg.innerHTML = "";

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const key = `${col},${row}`;
			const type = hexes[key] || "free";
			if (type === "vazio") continue;

			const { x, y } = hexCenter(col, row, size);

			const poly = document.createElementNS(SVG_NS, "polygon");
			poly.setAttribute("points", hexPoints(x, y, size));
			poly.setAttribute("class", `hex hex-${type}`);
			poly.dataset.col = col;
			poly.dataset.row = row;
			svg.appendChild(poly);

			const label = document.createElementNS(SVG_NS, "text");
			label.setAttribute("x", x.toFixed(2));
			label.setAttribute("y", (y + 4).toFixed(2));
			label.setAttribute("class", "hex-label");
			label.textContent = `${col},${row}`;
			svg.appendChild(label);
		}
	}

	// peças
	for (const [key, piece] of Object.entries(pieces)) {
		const [col, row] = key.split(",").map(Number);
		if (col >= cols || row >= rows) continue;
		const type = hexes[key] || "free";
		if (type === "vazio") continue;
		renderBoardPiece(svg, col, row, piece, size);
	}
}

function renderBoardPiece(svg, col, row, piece, size) {
	const { x, y } = hexCenter(col, row, size);
	const angle = (Math.PI / 180) * (60 * piece.facing);
	const R = Math.round(size * 0.42);
	const tipR = Math.round(size * 0.68);
	const baseR = Math.round(size * 0.49);
	const baseHalfW = Math.round(size * 0.14);

	const tipX = x + tipR * Math.cos(angle);
	const tipY = y + tipR * Math.sin(angle);
	const baseX = x + baseR * Math.cos(angle);
	const baseY = y + baseR * Math.sin(angle);
	const perp = angle + Math.PI / 2;
	const aX = baseX + baseHalfW * Math.cos(perp);
	const aY = baseY + baseHalfW * Math.sin(perp);
	const bX = baseX - baseHalfW * Math.cos(perp);
	const bY = baseY - baseHalfW * Math.sin(perp);

	const g = document.createElementNS(SVG_NS, "g");
	g.setAttribute("class", "board-piece");

	const circle = document.createElementNS(SVG_NS, "circle");
	circle.setAttribute("cx", x.toFixed(2));
	circle.setAttribute("cy", y.toFixed(2));
	circle.setAttribute("r", R);
	circle.setAttribute("fill", piece.color);
	circle.setAttribute("stroke", "rgba(255,255,255,0.3)");
	circle.setAttribute("stroke-width", "1.5");

	const arrow = document.createElementNS(SVG_NS, "polygon");
	arrow.setAttribute("points",
		`${tipX.toFixed(2)},${tipY.toFixed(2)} ${aX.toFixed(2)},${aY.toFixed(2)} ${bX.toFixed(2)},${bY.toFixed(2)}`
	);
	arrow.setAttribute("fill", "rgba(255,255,255,0.85)");

	g.appendChild(circle);
	g.appendChild(arrow);

	if (piece.name) {
		const letter = document.createElementNS(SVG_NS, "text");
		letter.setAttribute("x", x.toFixed(2));
		letter.setAttribute("y", y.toFixed(2));
		letter.setAttribute("class", "board-piece-label");
		letter.textContent = piece.name.charAt(0).toUpperCase();
		g.appendChild(letter);
	}

	svg.appendChild(g);
}

function init() {
	boardMaps = loadMaps();
	populateSelect(boardMaps);

	const sel = document.getElementById("map-select");
	if (sel) {
		sel.addEventListener("change", () => {
			const idx = sel.value;
			renderBoard(idx !== "" ? boardMaps[parseInt(idx)] : null);
		});
	}

	renderBoard(null);
}

init();
