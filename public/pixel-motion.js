/* Adds gentle pixel-style motion to the existing canvas art. It only reads the
   finished drawings from pixel-art.js, so nothing else needs to change. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Per-scene motion. shear: [fromRow, toRow, amount]. Remove a line to remove that effect.
  const SCENES = {
    surface:     { shear: [34, 245, 1], glints: { n: 14, y0: 36, y1: 90 }, fish: { n: 4, y0: 90, y1: 200, s: 1, c: '#06354a99' } },
    submarine:   { bubbles: { n: 4, x0: 4, x1: 44, y0: 70, y1: 14 } },
    reef:        { shear: [0, 148, 1], bubbles: { n: 4, x0: 10, x1: 230, y0: 146, y1: 8 }, fish: { n: 3, y0: 6, y1: 34, c: '#0a3a5099' }, glints: { n: 6, y0: 0, y1: 50 } },
    debris:      { shear: [0, 148, 1], bubbles: { n: 4, x0: 10, x1: 230, y0: 146, y1: 8 }, snow: { n: 14 } },
    cleanupReef: { shear: [0, 148, 1], bubbles: { n: 5, x0: 10, x1: 230, y0: 146, y1: 8 } },
    lanternfish: { fish: { n: 3, y0: 20, y1: 120, c: '#0a1a30cc' }, snow: { n: 16, c: '#9fe8d077' }, glints: { n: 8, y0: 0, y1: 148, c: '#b8ffd8dd' } },
    anglerfish:  { glow: { x: 75, y: 50 }, snow: { n: 18 }, bubbles: { n: 2, x0: 100, x1: 220, y0: 146, y1: 20 } },
    rov:         { snow: { n: 20 }, bubbles: { n: 3, x0: 10, x1: 230, y0: 146, y1: 20 } },
    abyss:       { snow: { n: 34, v: 0.5 } },
    trench:      { snow: { n: 24, v: 0.4 } },
    amphipod:    { snow: { n: 22 }, bubbles: { n: 2, x0: 10, x1: 230, y0: 146, y1: 20 } },

    // ---- Coral Reef page (pictures are drawn in pixel-art-biomes.js)
    reefHero:    { shear: [38, 224, 1], bubbles: { n: 6, x0: 10, x1: 470, y0: 240, y1: 40 }, glints: { n: 14, y0: 38, y1: 100 }, fish: { n: 4, y0: 70, y1: 170, s: 1, c: '#06354a99' } },
    reefTurtle:  { bubbles: { n: 5, x0: 10, x1: 130, y0: 84, y1: 4 } },
    // The pictures below have one big subject each (like the deep ocean ones), so the motion stays out of its way:
    // water ripple, a few bubbles and twinkles, drifting snow. No swimming silhouettes crossing the subject.
    lagoon:      { shear: [14, 110, 1], bubbles: { n: 3, x0: 160, x1: 230, y0: 140, y1: 20 }, glints: { n: 6, y0: 14, y1: 60 } },
    crest:       { shear: [22, 122, 1], bubbles: { n: 3, x0: 10, x1: 230, y0: 140, y1: 30 }, glints: { n: 6, y0: 6, y1: 30 } },
    bleach:      { shear: [0, 112, 1], bubbles: { n: 3, x0: 10, x1: 230, y0: 140, y1: 10 } },
    slope:       { shear: [0, 100, 1], bubbles: { n: 3, x0: 10, x1: 230, y0: 140, y1: 10 } },
    meso:        { snow: { n: 18, c: '#cfe8ff99' }, glints: { n: 8, y0: 0, y1: 100, c: '#9fe8ffdd' } },

    // ---- Polar Seas page
    polarHero:   { shear: [86, 245, 1], snow: { n: 26, c: '#ffffffcc' }, glints: { n: 12, y0: 2, y1: 60, c: '#d8f6ffcc' }, fish: { n: 3, y0: 130, y1: 220, s: 1, c: '#06354a99' } },
    polarFloe:   { snow: { n: 14, c: '#ffffffdd' } },
    iceEdge:     { shear: [66, 148, 1], snow: { n: 20, c: '#ffffffee' }, glints: { n: 6, y0: 70, y1: 140, c: '#e8fbffdd' } },
    underice:    { bubbles: { n: 3, x0: 10, x1: 230, y0: 140, y1: 28 }, snow: { n: 12, c: '#d4f6ff88' } },
    shelf:       { shear: [0, 110, 1], bubbles: { n: 4, x0: 10, x1: 230, y0: 130, y1: 10 }, snow: { n: 10, c: '#d4f6ff77' } },
    polardeep:   { snow: { n: 26, c: '#cfe8ffaa' }, glints: { n: 10, y0: 0, y1: 148, c: '#7fffe0dd' } },
  };

  const FISH = ['...h.....c', '..hh....cc', '.hcccc.ccc', 'ceccccc...', '.ccccccccc', '..ccc...cc'];
  const rng = seed => () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const items = [];

  function setup(canvas, cfg) {
    const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d');
    const base = document.createElement('canvas');
    base.width = w; base.height = h;
    base.getContext('2d').drawImage(canvas, 0, 0);
    // If the picture is repainted (bleaching slider), take a fresh snapshot to animate over.
    canvas.addEventListener('pixelart-redraw', () => {
      const b = base.getContext('2d'); b.clearRect(0, 0, w, h); b.drawImage(canvas, 0, 0);
    });
    const next = rng(w * 31 + h);
    const dot = (c, x, y, a = 1, b = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), a, b); };
    const range = (a, b) => a + next() * (b - a);

    const bb = cfg.bubbles && Array.from({ length: cfg.bubbles.n }, () => ({
      x: range(cfg.bubbles.x0, cfg.bubbles.x1), y: range(cfg.bubbles.y1, cfg.bubbles.y0),
      v: range(0.5, 1.2), s: 3 + Math.floor(next() * 3), ph: next() * 6.28,
    }));
    const fs = cfg.fish && Array.from({ length: cfg.fish.n }, () => ({
      x: range(0, w), y: range(cfg.fish.y0, cfg.fish.y1), v: range(0.7, 1.5), ph: next() * 6.28,
    }));
    const sn = cfg.snow && Array.from({ length: cfg.snow.n }, () => ({
      x: range(0, w), y: range(0, h), v: range(0.25, 0.7) * (cfg.snow.v ? cfg.snow.v / 0.5 : 1),
      ph: next() * 6.28, wide: next() > 0.7,
    }));
    const gl = cfg.glints && Array.from({ length: cfg.glints.n }, () => ({
      x: 2 + Math.floor(next() * (w - 4)), y: Math.floor(range(cfg.glints.y0, cfg.glints.y1)),
      ph: Math.floor(next() * 20), per: 14 + Math.floor(next() * 14),
    }));

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0);
      if (cfg.shear) {                       // water ripple: every 2nd-row band slides by 1px
        const [y0, y1, amp] = cfg.shear;
        for (let y = y0; y < y1; y += 2) {
          const dx = Math.round(amp * Math.sin(y / 6 + t * 0.55));
          if (dx) ctx.drawImage(base, 0, y, w, 2, dx, y, w, 2);
        }
        for (const [sx, sy, sw, sh] of canvas._protect || []) {   // big-pixel sprites stay rock steady
          const a = Math.max(0, sx), b = Math.max(0, sy), c2 = Math.min(w, sx + sw), d = Math.min(h, sy + sh);
          if (c2 > a && d > b) ctx.drawImage(base, a, b, c2 - a, d - b, a, b, c2 - a, d - b);
        }
      }
      if (cfg.glow) {                        // pulsing light (anglerfish lure)
        const a = (0.07 + 0.06 * Math.sin(t / 4)).toFixed(3);
        for (const r of [24, 16, 8]) dot('rgba(140,253,214,' + a + ')', cfg.glow.x - r, cfg.glow.y - r, r * 2, r * 2);
      }
      for (const p of sn || []) {            // drifting particles / marine snow
        p.y += p.v; if (p.y > h) { p.y = -2; p.x = range(0, w); }
        dot(cfg.snow.c || '#d4f6f099', p.x + Math.sin(t / 9 + p.ph) * 3, p.y, p.wide ? 2 : 1, 1);
      }
      for (const p of bb || []) {            // rising pixel bubbles
        p.y -= p.v;
        if (p.y < cfg.bubbles.y1 - p.s) { p.y = cfg.bubbles.y0; p.x = range(cfg.bubbles.x0, cfg.bubbles.x1); }
        const x = Math.round(p.x + Math.sin(t / 7 + p.ph) * 2), y = Math.round(p.y), s = p.s, c = '#ace9e6bb';
        dot(c, x + 1, y, s - 2); dot(c, x, y + 1, 1, s - 2); dot(c, x + s - 1, y + 1, 1, s - 2); dot(c, x + 1, y + s - 1, s - 2);
      }
      for (const f of fs || []) {            // swimming silhouettes
        const size = cfg.fish.s || 2;
        f.x -= f.v;
        if (f.x < -12 * size) { f.x = w + range(0, 40); f.y = range(cfg.fish.y0, cfg.fish.y1); }
        const y = f.y + Math.round(Math.sin(t / 6 + f.ph));
        FISH.forEach((row, ry) => [...row].forEach((ch, rx) => {
          if (ch !== '.') dot(ch === 'e' ? '#06182a' : cfg.fish.c, f.x + rx * size, y + ry * size, size, size);
        }));
      }
      for (const g of gl || []) {            // twinkles
        if ((t + g.ph) % g.per > 1) continue;
        const c = cfg.glints.c || '#e4fff2cc';
        dot(c, g.x, g.y); dot(c, g.x - 1, g.y); dot(c, g.x + 1, g.y); dot(c, g.x, g.y - 1); dot(c, g.x, g.y + 1);
      }
    }
    items.push({ canvas, draw, visible: false });
  }

  for (const canvas of document.querySelectorAll('canvas[data-art]')) {
    const cfg = SCENES[canvas.dataset.art];
    if (cfg && canvas.getContext('2d')) setup(canvas, cfg);
  }
  if (!items.length) return;

  // Only animate what is on screen, about 8 steps per second (chunky, like the art).
  const io = new IntersectionObserver(entries => {
    for (const e of entries) items.find(i => i.canvas === e.target).visible = e.isIntersecting;
  }, { rootMargin: '120px' });
  items.forEach(i => io.observe(i.canvas));
  let t = 0, last = 0;
  (function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < 125) return;
    last = now; t++;
    for (const i of items) if (i.visible) i.draw(t);
  })(0);
})();
