const svg = document.getElementById("canvas");
const W = innerWidth,
  H = innerHeight;
let mode = "watermark";
const savedLayout = [];
svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
svg.style.background = BG;

//Размещение
const placed = [];

generateLayout();
redraw();
function fits(x, y, r, q) {
  if (
    x - r < MARGIN ||
    x + r > W - MARGIN ||
    y - r < MARGIN ||
    y + r > H - MARGIN
  )
    return false;
  for (const p of placed) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < p.r + r + MIN_GAP) return false;
    if (p.q === q && d < SAME_DIST) return false;
  }
  return true;
}

function exportSVG() {
  const clone = svg.cloneNode(true);
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = "background.svg";
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}


function exportPNG() {
  const c = document.createElement("canvas");
  const ratio = H / W;
  const k = EXPORT_W / W;
  c.width = EXPORT_W;
  c.height = Math.round(EXPORT_W * ratio);
  const ctx = c.getContext("2d");
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, c.width, c.height);

  const loaders = ICON_SRC.map(src => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  }));

  Promise.all(loaders).then(imgs => {
    for (const item of savedLayout) {
      const img = imgs[item.q]
      const size = item.size * k;
      ctx.save();
      ctx.translate(item.x * k, item.y * k);
      ctx.rotate(item.rot * Math.PI / 180);
      if (mode === "watermark") {
        ctx.filter = "url(#sage)";
      }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      ctx.restore();
    }
    const a = document.createElement("a");
    a.download = "background.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }).catch(err => console.error("Иконки не загрузились:", err));
}

function drawIcon(id, x, y, size, rot) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "image");
  el.setAttribute("href", ICON_SRC[id]);
  el.setAttribute("x", x - size / 2);
  el.setAttribute("y", y - size / 2);
  el.setAttribute("width", size);
  el.setAttribute("height", size);
  if (mode === "watermark") {
    el.setAttribute("filter", "url(#sage)");
  }
  el.setAttribute("opacity", OPACITY);
  el.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
  svg.appendChild(el);
}

function generateLayout() {
  placed.length = 0;
  savedLayout.length = 0;
  //Список из иконок каждого вида, случайно перемешиваем
  const queue = [];
  for (let q = 0; q < ICON_SRC.length; q++)
    for (let i = 0; i < PER_ICON; i++) queue.push(q);
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  let attempts = 0;
  for (const q of queue) {
    let ok = false;
    while (!ok && attempts < 500000) {
      attempts++;
      const scale =
        SCALE_RANGE[0] + Math.random() * (SCALE_RANGE[1] - SCALE_RANGE[0]);
      const size = 100 * scale;
      const r = size * 0.72;
      const x = MARGIN + Math.random() * (W - 2 * MARGIN);
      const y = MARGIN + Math.random() * (H - 2 * MARGIN);
      if (fits(x, y, r, q)) {
        placed.push({ x, y, r, q });
        const rot = Math.random() * 2 * MAX_ROT - MAX_ROT;
        savedLayout.push({ q, x, y, size, rot });
        drawIcon(q, x, y, size, rot);
        ok = true;
      }
    }
  }
}

function redraw() {
  svg.querySelectorAll("image").forEach((element) => element.remove());
  for (const item of savedLayout) {
    drawIcon(item.q, item.x, item.y, item.size, item.rot);
  }
}

document.getElementById("btnRegen").addEventListener("click", () => {
  generateLayout();
  redraw();
});

const btnToggle = document.getElementById("btnToggle");
btnToggle.addEventListener("click", () => {
  mode = mode === "watermark" ? "color" : "watermark";
  btnToggle.textContent =
    mode === "watermark" ? "Режим: водяные знаки" : "Режим: цветные";
  redraw();
});
