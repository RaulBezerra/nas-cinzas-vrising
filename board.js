/* ============================
   Nas Cinzas — V Rising
   board.js v1
   ============================ */

const BOARD = {
	cols: 7,
	rows: 5,
	size: 32, // raio do hex (centro → canto)
};

const SVG_NS = "http://www.w3.org/2000/svg";

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
		const angle = (Math.PI / 180) * (60 * i - 30); // pointy-top
		pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
	}
	return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function renderBoard() {
	const svg = document.getElementById("board");
	if (!svg) return;
	const { cols, rows, size } = BOARD;
	const m = hexMetrics(size);

	const viewW = cols * m.w + m.w / 2;
	const viewH = (rows - 1) * m.vSpacing + m.h;
	svg.setAttribute("viewBox", `0 0 ${viewW.toFixed(2)} ${viewH.toFixed(2)}`);

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const { x, y } = hexCenter(col, row, size);

			const poly = document.createElementNS(SVG_NS, "polygon");
			poly.setAttribute("points", hexPoints(x, y, size));
			poly.setAttribute("class", "hex");
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
}

renderBoard();