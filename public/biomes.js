/* Biome switcher: a "Biome" dropdown in the top bar + left/right arrows on the screen edges.
   Loaded on every biome page. To add a biome later, add one entry to BIOMES. */
(() => {
  const BIOMES = [
    // color = accent (dot + foam edge of the transition), water = the colour of the water that sweeps over the screen
    { id: 'deep',  name: 'Deep Ocean', href: '/',           note: '0–11,000 m', color: '#7ff0d8', water: '#0b4f6a' },
    { id: 'reef',  name: 'Coral Reef', href: '/reef.html',  note: '0–150 m',    color: '#ff9db1', water: '#0a8fa2' },
    { id: 'polar', name: 'Polar Seas', href: '/polar.html', note: '0–4,000 m',  color: '#b8ecff', water: '#1d5f8c' },
  ];
  const path = location.pathname.replace(/index\.html$/, '');
  const cur = Math.max(0, BIOMES.findIndex(b => b.href === path));
  const prev = BIOMES[(cur + BIOMES.length - 1) % BIOMES.length], next = BIOMES[(cur + 1) % BIOMES.length];
  document.documentElement.dataset.biome = BIOMES[cur].id;
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; };

  // ---- dropdown tab
  const menu = el('details', 'biome-menu');
  menu.innerHTML = '<summary>Biome: <b>' + BIOMES[cur].name + '</b> <span aria-hidden="true">⌄</span></summary><ul>' +
    BIOMES.map((b, i) => '<li><a class="biome-link" href="' + b.href + '"' + (i === cur ? ' aria-current="page"' : '') +
      ' data-water="' + b.water + '" data-color="' + b.color + '"><i style="background:' + b.color + '"></i>' + b.name + '<span>' + b.note + '</span></a></li>').join('') + '</ul>';
  document.querySelector('.topbar nav').prepend(menu);
  addEventListener('click', e => { if (!menu.contains(e.target)) menu.open = false; });
  addEventListener('keydown', e => { if (e.key === 'Escape') menu.open = false; });

  // ---- side arrows
  const arrow = (b, dir) => {
    const a = el('a', 'biome-arrow biome-link ' + dir, '<span class="biome-arrow-icon" aria-hidden="true"></span><span class="biome-arrow-tip">' + b.name + '</span>');
    a.href = b.href; a.dataset.color = b.color; a.dataset.water = b.water;
    a.setAttribute('aria-label', (dir === 'left' ? 'Previous biome: ' : 'Next biome: ') + b.name);
    return a;
  };
  document.body.append(arrow(prev, 'left'), arrow(next, 'right'));

  // ---- water transition between pages.
  // Leaving: a pixel-art water surface (white foam edge, rolling waves) rises from the bottom until it covers the screen.
  // Arriving: the new page starts covered by the same water (a tiny script in each page's <head> paints it before anything else,
  // so there is no flash), then the water drains downward. Tiles are TILE px, so the edge moves in chunky steps.
  const TILE = 16, FILL_MS = 760, DRAIN_MS = 820, B1 = 0.45, B2 = 0.75;      // B1/B2: where the water gets darker (share of screen height)
  const flood = el('canvas', 'biome-flood'); flood.setAttribute('aria-hidden', 'true'); document.body.append(flood);
  const fg = flood.getContext('2d');
  const root = document.documentElement;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rgb = c => [16, 8, 0].map(s => (parseInt(c.slice(1), 16) >> s) & 255);
  const mixc = (a, b, k) => { const A = rgb(a), B = rgb(b); return 'rgb(' + A.map((v, i) => Math.round(v * (1 - k) + B[i] * k)).join(',') + ')'; };
  const hash = (a, b) => { const h = Math.imul(a * 374761393 + b * 668265263, 1274126177); return ((h ^ (h >>> 13)) >>> 0) / 4294967296; };
  const ease = p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  let cols = 0, rows = 0, b1 = 0, b2 = 0, busy = false;
  function size() {
    cols = Math.ceil(innerWidth / TILE); rows = Math.ceil(innerHeight / TILE);
    b1 = Math.round(innerHeight * B1 / TILE); b2 = Math.round(innerHeight * B2 / TILE);      // same maths as the <head> script
    flood.width = cols; flood.height = rows; flood.style.width = cols * TILE + 'px'; flood.style.height = rows * TILE + 'px';
  }
  // level 0 = no water ... 1 = screen covered. wave = how far the surface ripple has travelled.
  function paint(level, wave, water, foam) {
    const c1 = water, c2 = mixc(water, '#02101c', 0.25), c3 = mixc(water, '#02101c', 0.5), lite = mixc(water, '#ffffff', 0.2);
    fg.clearRect(0, 0, cols, rows);
    for (let c = 0; c < cols; c++) {
      const ripple = Math.round(1.6 * Math.sin(c * 0.42 + wave) + 0.9 * Math.sin(c * 0.97 - wave * 1.4));
      const crest = Math.round(rows + 9 - level * (rows + 18)) + ripple;           // first row of water in this column
      if (crest > 0 && crest - 1 < rows && hash(c, Math.floor(wave * 2)) > 0.8) { fg.fillStyle = '#f2fffd'; fg.fillRect(c, crest - 1, 1, 1); }   // spray
      for (let y = Math.max(0, crest); y < rows; y++) {
        const d = y - crest;
        fg.fillStyle = d === 0 ? '#f2fffd' : d === 1 ? foam : d === 2 ? lite : d === 3 && (c + y) % 2 ? lite : y < b1 ? c1 : y < b2 ? c2 : c3;
        fg.fillRect(c, y, 1, 1);
      }
    }
  }
  function run(dir, water, foam, done) {      // "in": the water rises. "out": the water drains away.
    size(); flood.style.display = 'block'; flood.style.pointerEvents = dir === 'in' ? 'auto' : 'none';
    const t0 = performance.now(), ms = dir === 'in' ? FILL_MS : DRAIN_MS;
    let last = -1;
    (function frame(now) {
      const p = Math.min(1, Math.max(0, (now - t0) / ms)), step = Math.floor((now - t0) / 55);   // surface ripple moves ~18 steps a second
      if (step !== last || p === 1) { last = step; paint(dir === 'in' ? ease(p) : 1 - ease(p), step * 0.55, water, foam); }
      if (p < 1) requestAnimationFrame(frame);
      else { if (dir === 'out') { flood.style.display = 'none'; fg.clearRect(0, 0, cols, rows); } if (done) done(); }
    })(t0);
  }
  const hide = () => { flood.style.display = 'none'; flood.style.pointerEvents = 'none'; root.classList.remove('biome-arriving'); busy = false; };

  // Arriving from another biome: take over from the <head> cover (same colours, same frame) and drain the water.
  let arrived = false;
  try {
    const v = sessionStorage.getItem('biome-wipe');
    if (v) {
      sessionStorage.removeItem('biome-wipe');
      if (Date.now() - Number(v.split('|')[1]) < 8000 && !reduced()) {
        arrived = true; size(); paint(1, 0, BIOMES[cur].water, BIOMES[cur].color); flood.style.display = 'block';
        root.classList.remove('biome-arriving');
        requestAnimationFrame(() => requestAnimationFrame(() => run('out', BIOMES[cur].water, BIOMES[cur].color, hide)));
      }
    }
  } catch {}
  if (!arrived) root.classList.remove('biome-arriving');
  addEventListener('pageshow', e => { if (e.persisted) hide(); });      // back/forward cache: never come back to a covered page
  addEventListener('resize', () => { if (flood.style.display === 'block' && !busy) size(); });

  addEventListener('click', e => {
    const a = e.target.closest('a.biome-link');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); menu.open = false;
    if (a.getAttribute('aria-current') === 'page' || busy) return;
    if (reduced()) { location.href = a.href; return; }
    busy = true;
    try { sessionStorage.setItem('biome-wipe', a.dataset.water + '|' + Date.now()); } catch {}
    let gone = false; const go = () => { if (!gone) { gone = true; location.href = a.href; } };
    setTimeout(go, FILL_MS + 500);                   // safety net: always navigate
    setTimeout(() => { if (busy && gone) hide(); }, 9000);   // navigation failed (offline?): give the page back
    run('in', a.dataset.water, a.dataset.color, go);
  });
})();
