/* Detailed static pixel-art scenes for the Coral Reef and Polar Seas pages.
   Same pipeline as the deep ocean: this file only DRAWS each picture once (it plugs into pixel-art.js through
   window.PIXEL_BIOME_DRAWINGS) and pixel-motion.js adds the animation. Must load BEFORE pixel-art.js.
   Sprites get an automatic dark outline plus light/shadow edges, so every creature reads as a shaded object. */
(() => {
  // ---------- helpers
  const num = c => parseInt(c.slice(1, 7), 16);
  const mix = (a, b, k) => {
    const A = num(a), B = num(b), ch = s => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
    return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
  };
  const rect = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  // Polygons are filled one whole pixel at a time (no antialiasing), so every edge is as crisp as the sprites.
  const shape = (c, col, ...p) => {
    c.fillStyle = col;
    const n = p.length / 2; let y0 = Infinity, y1 = -Infinity;
    for (let i = 1; i < p.length; i += 2) { y0 = Math.min(y0, p[i]); y1 = Math.max(y1, p[i]); }
    for (let y = Math.max(0, Math.floor(y0)); y < Math.ceil(y1); y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) {
        const ax = p[2 * i], ay = p[2 * i + 1], bx = p[2 * ((i + 1) % n)], by = p[2 * ((i + 1) % n) + 1];
        if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + (yy - ay) * (bx - ax) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) c.fillRect(a, y, b - a, 1); }
    }
  };
  const rng = seed => () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const grad = (c, x, y, w, h, stops) => {
    const g = c.createLinearGradient(0, y, 0, y + h);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    rect(c, g, x, y, w, h);
  };
  const grain = (c, x, y, w, h, n, cols, seed = 5) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) rect(c, cols[i % cols.length], x + Math.floor(r() * w), y + Math.floor(r() * h), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
  };
  const bubble = (c, x, y, s, col = '#ace9e678') => {
    rect(c, col, x + 1, y, s - 2, 1); rect(c, col, x, y + 1, 1, s - 2); rect(c, col, x + s - 1, y + 1, 1, s - 2); rect(c, col, x + 1, y + s - 1, s - 2, 1);
  };

  /* Draw a character-grid sprite. Options: pal (recolor), flip, heat+live (bleaching),
     line (outline color, false = none), lit (false = no edge light/shadow). */
  function spr(c, rows, pal, x, y, px = 1, o = {}) {
    const H = rows.length, W = Math.max(...rows.map(r => r.length));
    const key = (r, q) => { const ch = rows[r] && rows[r][q]; return ch && ch !== '.' && ch !== ' ' && ((o.pal && o.pal[ch]) || pal[ch]) ? ch : null; };
    const fx = q => (o.flip ? W - 1 - q : q);
    const line = o.line === undefined ? (pal.line || '#0b2335') : o.line;
    const lit = o.lit !== false && H >= 6;
    for (let r = -1; r <= H; r++) for (let q = -1; q <= W; q++) {
      const ch = key(r, q), X = Math.round(x + fx(q) * px), Y = Math.round(y + r * px);
      if (!ch) {
        if (line && (key(r - 1, q) || key(r + 1, q) || key(r, q - 1) || key(r, q + 1))) rect(c, line, X, Y, px, px);
        continue;
      }
      let col = (o.pal && o.pal[ch]) || pal[ch];
      if (o.heat && o.live) col = mix(col, '#efe9dc', o.heat * 0.92);
      if (lit) {
        const up = !key(r - 1, q) || !key(r, q - 1), dn = !key(r + 1, q) || !key(r, q + 1);
        if (up && !dn) col = mix(col, '#ffffff', 0.26); else if (dn && !up) col = mix(col, '#07182a', 0.3);
      }
      rect(c, col, X, Y, px, px);
    }
    if (px > 1) (c.canvas._protect ||= []).push([Math.round(x - px), Math.round(y - px), (W + 2) * px, (H + 2) * px]);
  }
  // Mark a rectangle as "keep perfectly still" so the water ripple in pixel-motion.js skips it (icebergs, floes).
  const fixed = (c, x, y, w, h) => (c.canvas._protect ||= []).push([Math.round(x), Math.round(y), Math.round(w), Math.round(h)]);

  /* Blocky iceberg / ice floe, built in the same chunky grid style as the sprites.
     Returns { up, down }: the part above the water and the paler, narrower part below it (same width, so they line up).
     w lit face, l mid face, s shadow face, a waterline glint, u/v submerged ice. flat: 0 = pointed berg, n = flat-topped slab. */
  function iceMass(W, Hup, Hdn, o = {}) {
    const r = rng(o.seed || 1), pk = o.peak === undefined ? 0.42 : o.peak, pkx = Math.round((W - 1) * pk), top = [];
    let jag = 0;
    for (let x = 0; x < W; x++) {
      let p = x <= pkx ? x / Math.max(1, pkx) : (W - 1 - x) / Math.max(1, W - 1 - pkx);
      p = Math.pow(p, o.sharp || 0.85);
      if (o.flat) p = Math.min(1, p * o.flat);
      if (x % 3 === 0) jag = (r() - 0.5) * (o.jag === undefined ? 1.8 : o.jag);        // steps every 3 columns = blocky edges
      top[x] = Math.min(Hup, Math.max(x === 0 || x === W - 1 ? 1 : 2, Math.round(Hup * p + jag * p)));
    }
    const up = Array.from({ length: Hup }, () => Array(W).fill('.'));
    for (let x = 0; x < W; x++) for (let k = 0; k < top[x]; k++) {
      let ch;
      if (o.flat) ch = k < 2 ? 'w' : (k >= top[x] - 2 && top[x] > 5 ? 's' : 'l');
      else if (x < pkx) ch = k < 2 || (x + k) % 9 === 0 ? 'w' : (k < top[x] * 0.5 ? 'w' : 'l');
      else ch = k < 1 ? 'l' : (k < top[x] * 0.3 && (x + k) % 4 === 0 ? 'l' : 's');
      up[Hup - top[x] + k][x] = ch;
    }
    const down = Array.from({ length: Hdn }, () => Array(W).fill('.')), c0 = (W - 1) / 2 + (pkx - (W - 1) / 2) * 0.3;
    for (let j = 0; j < Hdn; j++) {
      const t = (j + 1) / Hdn, half = (W / 2) * (1 - 0.55 * Math.pow(t, 1.4)) + (r() - 0.5);
      for (let x = 0; x < W; x++) if (Math.abs(x - c0) <= half) down[j][x] = j === 0 ? 'a' : (j < Hdn * 0.5 ? 'u' : 'v');
    }
    return { up: up.map(a => a.join('')), down: down.map(a => a.join('')) };
  }
  const ICE = { w: '#f4fcff', l: '#c9e7f7', s: '#8db4d2', a: '#bff0ff', u: '#6dbade', v: '#4488b8' };
  const ICE_LINE = '#1d4c78';
  // draw an iceberg whose waterline is at y `wl`; x is its left edge; px is the pixel size
  function berg(c, x, wl, W, Hup, Hdn, px, seed, o = {}) {
    const m = iceMass(W, Hup, Hdn, { seed, ...o });
    spr(c, m.up, ICE, x, wl - Hup * px, px, { line: o.line || ICE_LINE });
    spr(c, m.down, ICE, x, wl, px, { line: false, lit: false });
    if (px === 1) fixed(c, x - 1, wl - Hup - 1, W + 2, Hup + Hdn + 2);
  }
  const on = (c, rows, pal, cx, by, px, o) => spr(c, rows, pal, cx - Math.max(...rows.map(r => r.length)) * px / 2, by - rows.length * px, px, o);

  // water column: gradient, fine grain and soft light shafts
  function water(c, w, h, stops, seed, beams = [], y0 = 0) {
    grad(c, 0, y0, w, h - y0, stops);
    grain(c, 0, y0, w, h - y0, Math.round(w * h / 70), ['#b8f5ee14', '#cdfff626', '#05304a26'], seed);
    for (const [x, bw, d] of beams) {
      shape(c, '#c8fff012', x - 6, y0, x + bw + 8, y0, x + bw - d + 8, h * 0.92, x - d - 14, h * 0.92);
      shape(c, '#d8fff41a', x, y0, x + bw, y0, x + bw - d, h * 0.8, x - d - 6, h * 0.8);
    }
  }
  const ripples = (c, w, y0, y1, light, dark, seed) => {
    const r = rng(seed);
    for (let y = y0; y < y1; y += 3 + Math.floor(r() * 2)) {
      let x = Math.floor(r() * 30) - 10;
      while (x < w) { const len = 6 + Math.floor(r() * 20); rect(c, r() > 0.45 ? light : dark, x, y + Math.round(Math.sin(x / 14 + y) * 1), len, 1); x += len + 4 + Math.floor(r() * 18); }
    }
  };
  const blade = (c, x, y, h, col, tip, ph) => {
    for (let i = 0; i < h; i++) rect(c, i > h - 3 ? tip : col, x + Math.round(Math.sin(i / 4 + ph) * (i / h) * 2), y - i, 1, 1);
  };
  const meadow = (c, x0, x1, y, n, hmin, hmax, seed, cols = ['#1f9a58', '#72e29a']) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) blade(c, x0 + Math.floor(r() * (x1 - x0)), y + Math.floor(r() * 4), hmin + Math.floor(r() * (hmax - hmin)), cols[0], cols[1], r() * 6);
  };
  const school = (c, rows, pal, n, cx, cy, sx, sy, seed, px = 1, o = {}) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) spr(c, rows, pal, cx + (r() - 0.5) * sx, cy + (r() - 0.5) * sy, px, { line: false, lit: false, ...o });
  };

  // ---------- shape builders: fish-like bodies, jellyfish and tubes are generated so their outlines stay clean
  // Keys: b body, h belly, f fins/tail, e eye, d spots, W stripe, t tusk, plus any beak/nose key you pass.
  function critter(L, H, o = {}) {
    const lead = o.lead || 0, tail = o.tail === undefined ? Math.round(L * 0.3) : o.tail, fins = o.fins !== false;
    const top = fins ? 3 : 1, bot = fins ? 3 : 2, W = lead + L + tail, R = H + top + bot;
    const g = Array.from({ length: R }, () => Array(W).fill('.')), cy = top + (H - 1) / 2, a = L / 2, b = H / 2, r = rng(o.seed || 3);
    const first = x => g.findIndex(row => row[x] !== '.'), last = x => R - 1 - [...g].reverse().findIndex(row => row[x] !== '.');
    for (let x = 0; x < L; x++) {                                   // ellipse body, lighter belly
      const dx = (x + 0.5 - a) / a, hh = b * Math.sqrt(Math.max(0, 1 - dx * dx));
      for (let y = 0; y < R; y++) if (Math.abs(y + 0.5 - (cy + 0.5)) <= hh) g[y][lead + x] = y + 0.5 > cy + 0.5 + hh * (o.belly === undefined ? 0.35 : o.belly) ? 'h' : 'b';
    }
    for (const [f0, f1] of o.bands || []) for (let x = Math.round(L * f0); x <= Math.round(L * f1); x++) for (let y = 0; y < R; y++) if ('bh'.includes(g[y][lead + x])) g[y][lead + x] = 'W';
    for (let i = 0; i < (o.spots || 0); i++) { const x = lead + Math.floor(L * (0.2 + 0.7 * r())), y = Math.floor(cy - H * 0.3 + H * 0.5 * r()); if (g[y] && g[y][x] === 'b') g[y][x] = 'd'; }
    for (let t = 0; t < tail; t++) {                                // forked tail
      const x = lead + L - 1 + t, sp = 1 + (t + 1) * H * (o.tailSpread || 0.8) / tail / 1.6;
      for (let y = Math.max(0, Math.round(cy - sp)); y <= Math.min(R - 1, Math.round(cy + sp)); y++) {
        if (t === tail - 1 && Math.abs(y - cy) < sp * 0.45) continue;
        if (g[y][x] === '.') g[y][x] = 'f';
      }
    }
    if (fins && o.dorsal !== false) {                               // dorsal and anal fins
      const x0 = Math.round(L * 0.28), x1 = Math.round(L * 0.7);
      for (let x = x0; x <= x1; x++) { const h = Math.max(1, Math.round(2.4 * Math.sin(Math.PI * (x - x0) / (x1 - x0)))), tp = first(lead + x); for (let k = 1; k <= h; k++) if (tp - k >= 0) g[tp - k][lead + x] = 'f'; }
      const a0 = Math.round(L * 0.55), a1 = Math.round(L * 0.75);
      for (let x = a0; x <= a1; x++) { const h = Math.round(1.7 * Math.sin(Math.PI * (x - a0) / (a1 - a0))), bt = last(lead + x); for (let k = 1; k <= h; k++) if (bt + k < R) g[bt + k][lead + x] = 'f'; }
    }
    if (o.pect !== false) for (let i = 0; i < 3; i++) { const y = Math.round(cy + 0.4 + i * 0.8), x = lead + Math.round(L * 0.3) + i; if (g[y] && g[y][x] !== '.') g[y][x] = 'f'; }
    const ex = lead + Math.max(1, Math.round(L * (o.eye || 0.2))), ey = Math.round(cy - H * 0.18);
    if (g[ey][ex] !== '.') g[ey][ex] = 'e';
    if (o.beak) g[Math.round(cy)][lead] = o.beak;
    for (let x = 0; x < lead; x++) g[Math.round(cy)][x] = 't';       // narwhal tusk
    return g.map(row => row.join(''));
  }
  /* Sea mammal in profile (seal, narwhal): round head, thick chest tapering to a slim tail with horizontal flukes.
     Keys: b back, h belly, f flippers/flukes, d mottling, e eye, k nose, t tusk. */
  function torpedo(L, H, o = {}) {
    const lead = o.lead || 0, tl = o.tail || 6, W = lead + L + tl, pad = 4, R = H + pad * 2, cy = pad + (H - 1) / 2;
    const g = Array.from({ length: R }, () => Array(W).fill('.')), r = rng(o.seed || 3), hd = o.head || 0.2, mx = o.max || 0.45, tp = o.thin || 0.16;
    const half = u => u < hd ? (H / 2) * Math.sqrt(Math.max(0, 1 - Math.pow((hd - u) / hd, 2))) : u < mx ? H / 2 : (H / 2) * (1 - (1 - tp) * Math.pow((u - mx) / (1 - mx), 1.2));
    for (let x = 0; x < L; x++) { const hh = half((x + 0.5) / L); for (let y = 0; y < R; y++) { const d = y + 0.5 - (cy + 0.5); if (Math.abs(d) <= hh) g[y][lead + x] = d > hh * (o.belly === undefined ? 0.35 : o.belly) ? 'h' : 'b'; } }
    for (let t = 0; t < tl; t++) {                                  // flukes: two lobes that sweep apart, with a notch between them
      const x = lead + L - 1 + t, sp = 1 + (t + 1) * (H * 0.6) / tl;
      for (let y = Math.round(cy - sp); y <= Math.round(cy + sp); y++) if (y >= 0 && y < R && Math.abs(y - cy) >= (t > tl * 0.45 ? (t - tl * 0.3) * 0.55 : 0) && g[y][x] === '.') g[y][x] = 'f';
    }
    for (let i = 0; i < (o.spots || 0); i++) { const x = lead + Math.floor(L * (0.15 + 0.8 * r())), y = Math.floor(cy - H * 0.42 + H * 0.55 * r()); if (g[y] && g[y][x] === 'b') g[y][x] = 'd'; }
    for (let k = 0; k < (o.flipper || 3); k++) { const y = Math.round(cy + H / 2 + 0.3 + k * 0.8), x = lead + Math.round(L * 0.3) + k; if (g[y] && g[y][x] !== undefined) g[y][x] = 'f'; if (g[y] && g[y][x + 1] === '.') g[y][x + 1] = 'f'; }
    g[Math.round(cy - H * 0.2)][lead + Math.max(1, Math.round(L * (o.eye || 0.16)))] = 'e';
    if (o.beak) { g[Math.round(cy - 0.5)][lead] = o.beak; g[Math.round(cy + 0.5)][lead] = o.beak; }
    for (let x = 0; x < lead; x++) g[Math.round(cy - 1)][x] = 't';   // narwhal tusk
    return g.map(row => row.join(''));
  }
  function jelly(Wd, Hd, tent) {                                    // bell, frilly rim and trailing tentacles
    const R = Hd + tent + 1, g = Array.from({ length: R }, () => Array(Wd).fill('.')), cx = (Wd - 1) / 2;
    for (let y = 0; y < Hd; y++) {
      const t = (y + 0.7) / Hd, half = (Wd / 2) * Math.sqrt(1 - (1 - t) * (1 - t));
      for (let x = 0; x < Wd; x++) if (Math.abs(x - cx) <= half - 0.2) g[y][x] = y === Hd - 1 ? 'r' : 'c';
    }
    for (let y = 1; y < Hd - 1; y++) for (let x = 0; x < Wd; x++) if (g[y][x] === 'c' && x < cx - 0.5 && x > cx - Wd * 0.3 && y < Hd * 0.7 && (x + y) % 3 === 0) g[y][x] = 'h';
    const n = Math.max(3, Math.floor(Wd / 2));
    for (let i = 0; i < n; i++) {
      const x = Math.round(1 + i * (Wd - 3) / (n - 1)), len = tent - (i % 2) * 2;
      for (let k = 0; k < len; k++) { const xx = Math.min(Wd - 1, Math.max(0, x + ((k >> 1) % 2 ? (i % 2 ? 1 : -1) : 0))); g[Hd + k][xx] = k < 2 ? 'r' : 't'; }
    }
    return g.map(row => row.join(''));
  }
  const tubes = (hs, w = 4) => {                                    // cluster of tube sponges with dark mouths
    const W = hs.length * (w + 1) - 1, H = Math.max(...hs) + 1, g = Array.from({ length: H }, () => Array(W).fill('.'));
    hs.forEach((h, i) => {
      const x0 = i * (w + 1);
      for (let k = 0; k < h; k++) for (let x = 0; x < w; x++) g[H - 1 - k][x0 + x] = x === 0 ? 'l' : x === w - 1 ? 'd' : 'y';
      for (let x = 0; x < w; x++) g[H - h][x0 + x] = x === 0 || x === w - 1 ? 'l' : 'd';
    });
    return g.map(r => r.join(''));
  };
  const spans = (W, rows) => rows.map(sp => { const r = Array(W).fill('.'); for (const [a, b, ch = 'w'] of sp) for (let x = a; x <= b; x++) r[x] = ch; return r.join(''); });
  const JP = (c, h, t) => ({ c, h, t, r: mix(c, '#3a2a8a', 0.32) });

  // ---------- sprites ('.' = empty)
  const STAG = ['.......l.......', '.l.....ls...ll.', '.ls....ls...ls.', '.ls...lls..ls..', '..ls...ls..ls..', '..lss..lssls...', '...lss.lssls...', '....lsslsls...l',
    '.....lsss....ls', '.....lsls...ls.', '.....lsss..lss.', '.....lssslss...', '.....lssslss...', '.....lslsls....', '.....lssss.....', '.....lssss.....', '....lssssss....'];
  const BRAIN = ['......oooooo......', '....ooHhhhhHoo....', '...oHhbdbbdbhHo...', '..oHbbdbhhbdbbHo..', '.oHbdbbbddbbbdbHo.', '.obbdbhbbbbhbdbbo.',
    'obbbbdbbbbdbbbbbbo', 'obdbbdbbddbbbdbbdo', '.oddddddddddddddo.'];
  const FAN = ['v.v..v.v.v..v.v', 'vvv.vvvvvvv.vvv', '.vvvvlvvvlvvvv.', '.vlvvvvlvvvvlv.', '..vvvlvvvlvvv..', '..vvvvvlvvvvv..', '...vlvvvvvlv...',
    '....vvvlvvv....', '.....vvvvv.....', '......vdv......', '......vdv......', '.....vddv......', '....dddddd.....'];
  const TABLE = ['....tttttttttttttttt....', '..tttltttttttlttttttt...', '.tttttttltttttttttltttt.', 'tttttttttttttttttttttttt', '.dddttttttttttttttttddd.',
    '.....ddddddddddddd......', '........ddd..ddd........', '........dd....dd........'];
  const CLOWN = critter(12, 7, { tail: 3, bands: [[0.25, 0.4], [0.62, 0.74]], eye: 0.16, belly: 0.5 });
  const TANG = critter(10, 9, { tail: 3, eye: 0.22, belly: 0.55, tailSpread: 0.75 });
  const GROUPER = critter(24, 11, { tail: 7, spots: 14, eye: 0.17, belly: 0.4, tailSpread: 0.95, seed: 5 });
  const ICEFISH = critter(15, 5, { tail: 4, belly: 0.5, eye: 0.15 });
  const PSWIM = critter(16, 8, { tail: 3, fins: false, belly: 0.1, beak: 'y', eye: 0.28 });
  const SEAL = torpedo(24, 10, { head: 0.32, max: 0.52, thin: 0.2, tail: 6, spots: 16, eye: 0.16, beak: 'k', seed: 7, flipper: 4 });
  const NARWHAL = torpedo(32, 10, { lead: 13, head: 0.17, max: 0.4, thin: 0.13, tail: 9, spots: 34, eye: 0.13, seed: 9, flipper: 3, belly: 0.42 });
  const JELLY = jelly(13, 7, 8);
  const SPONGE = tubes([9, 13, 7]);
  const TUBE = tubes([6, 9, 5], 3);
  // Polar bear in profile, facing left: round body, big head with a snout, ears and four sturdy legs.
  const BEAR = (() => {
    const W = 40, H = 22, g = Array.from({ length: H }, () => Array(W).fill('.'));
    const ell = (cx, cy, rx, ry, ch) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) g[y][x] = ch; } };
    const box = (x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch; };
    box(20, 14, 24, 21, 's'); box(27, 14, 31, 21, 's');                // far legs (in shadow)
    box(13, 14, 18, 21, 'w'); box(32, 14, 37, 21, 'w');                // near legs
    ell(25, 9.4, 14.5, 6.6, 'w');                                       // body with a shoulder hump
    ell(8, 11, 7, 5.4, 'w'); box(0, 12, 4, 15, 'w'); box(1, 11, 3, 11, 'w');   // head and long snout
    ell(12.5, 5.8, 1.9, 1.9, 'w');                                      // ear
    box(37, 6, 38, 8, 'w');                                             // tail
    for (let x = 0; x < W; x++) for (let y = 0; y < 18; y++) if (g[y][x] === 'w' && g[y + 1][x] === '.') { g[y][x] = 's'; if (g[y - 1][x] === 'w' && y > 12) g[y - 1][x] = 's'; }
    g[12][0] = 'k'; g[12][1] = 'k';                                     // nose
    g[9][5] = 'k'; g[9][6] = 'k';                                       // eye
    g[14][2] = 'k'; g[14][3] = 'k'; g[14][4] = 'k';                     // mouth line
    for (const x of [13, 14, 15, 16, 17, 18, 32, 33, 34, 35, 36, 37]) g[21][x] = 's';   // paws
    for (const x of [13, 15, 17, 32, 34, 36]) g[21][x] = 'k';           // claws
    return g.map(r => r.join(''));
  })();
  // species palettes
  const P = {
    clown: { b: '#ff8a1f', h: '#ffa64a', f: '#ff7a10', W: '#ffffff', e: '#101820' },
    tang: { b: '#2b78e8', h: '#5aa0ff', f: '#ffd23f', e: '#08182a' },
    grouper: { b: '#b8553f', h: '#dc8f6c', f: '#8e3a2c', d: '#7a2e24', e: '#12090a' },
    icefish: { b: '#a9dcf5', h: '#d8f2ff', f: '#8fcdea', e: '#0a2030' },
    pswim: { b: '#25365e', h: '#f4fbff', f: '#25365e', y: '#ffa63d', e: '#ffffff' },
    seal: { b: '#9fb2c0', h: '#dfe9ef', f: '#6d8294', d: '#6d8294', k: '#1c2c3c', e: '#0a1420' },
    narwhal: { b: '#86a2be', h: '#e2ecf6', f: '#4d6684', d: '#58728f', t: '#f6efd2', e: '#0a1420' },
    bear: { w: '#f6fcff', s: '#bcd5e6', k: '#1b2230', line: '#3f6f90' },
    sponge: (y, d) => ({ y, d, l: mix(y, '#ffffff', 0.4) }),
  };
  const STAR = ['....o....', '....o....', '...ooo...', 'oooohoooo', '.ooohooo.', '..ooooo..', '.ooo.ooo.', '.oo...oo.', '.o.....o.'];
  const FISH = ['...h.....c', '..hh....cc', '.hcccc.ccc', 'ceccccc...', '.ccccccccc', '..ccc...cc'];
  const PARROT = ['...gggggggg.....', '.kggggbbggggpp..', 'kkggeggbbgggppp.', 'kkgggggbbgggppp.', '.kgggbbbbggpp...', '..gggggggggp....', '...ggggggg......'];
  const TURTLE = ['...........kk...........', '..........kggk..........', '..........kGgk......kkk.', '.........kggk.....kkgggk', '......kkkkkkk....kgGgkgk', '....kkhhHHhhkk..kGgggggk',
    '...khHoohHooHhkkgggkkkk.', '..kHhOohHHOOHohhggk.....', 'kkhoohHHooohHoohgk......', '.khooHHooOOHooohhk......', '..kkOOoooooooOkkk.......',
    '...kggkkkkkkkggggk......', '..kGgk.....kgGGgk.......', '.kggk.....kgGggk........', '..kk.....kgGggk.........', '........kgggkk..........', '........kkkk............'];
  const TURTLE_PAL = { k: '#153c43', g: '#7e9a52', G: '#b4c978', h: '#dcebaa', H: '#a8cf72', o: '#6f9f4c', O: '#4a7a3c' };   // green sea turtle
  const PENGUIN = ['....oooooo....', '...okkkkkko...', '..okkkkkkkko..', '..okwwkkwwko..', '..okwekkewko..', '..okkkyykkko..', '...okkyykko...', '..okssssssko..', '.okkwwwwwwkko.',
    '.okkwwwwwwkko.', 'okkkwwwwwwkkko', 'okk.wwwwww.kko', '.ok.wwwwww.ko.', '..o.wwwwww.o..', '...owwwwwwo...', '...yyo..oyy...', '..yyyy..yyyy..'];
  const PENGUIN_PAL = { o: '#08122a', k: '#25365e', w: '#f4fbff', y: '#ffa63d', s: '#ff5a6e', e: '#08122a' };
  const KRILL = ['.rr.', 'rrre'];
  const ALGAE = ['.b.', '.a.', '.a.', '.a.', '.a.', '.a.', '.a.'];
  const ICON = {
    Bottle: ['....cc....', '....cc....', '...cccc...', '..cbbbbc..', '..cbbbbc..', '..cbwwbc..', '..cbbbbc..', '..cbbbbc..', '..cbbbbc..', '...cccc...'],
    Coral: ['.p..p..p..', '.pp.pp.pp.', '..pppppp..', '.ppp.ppp..', '...ppppp..', '....pp....', '....pp....', '...dddd...', '..dddddd..', '..........'],
    Fish: ['..........', '...h.....c', '..hh....cc', '.hcccc.ccc', 'ceccccc...', '.ccccccccc', '..ccc...cc', '..........', '..........', '..........'],
    Sun: ['....y.....', '.y..y..y..', '..yyyyy...', '.yyyyyyy..', 'yyyyyyyyy.', '.yyyyyyy..', '..yyyyy...', '.y..y..y..', '....y.....', '..........'],
    Flake: ['....s....', '.s..s..s.', '..s.s.s..', '...sss...', 'sssssssss', '...sss...', '..s.s.s..', '.s..s..s.', '....s....'],
  };
  const ICON_PAL = {
    Bottle: { c: '#9fe8ff', b: '#3d9bd6', w: '#e8fbff' }, Coral: { p: '#ff6f91', d: '#b8446a' },
    Fish: { c: '#ffd23f', h: '#fff0a0', e: '#0e3a4a' }, Sun: { y: '#ffd16b' }, Flake: { s: '#c8f1ff' },
  };

  // coral colorways: s = shade, l = light
  const C = {
    pink: { s: '#c8506e', l: '#ff9fb0' }, orange: { s: '#d9783a', l: '#ffc27a' }, purple: { s: '#7b4bb8', l: '#c9a2f5' },
    yellow: { s: '#c9a02a', l: '#ffe27a' }, green: { s: '#3f9a78', l: '#a7e8bd' }, blue: { s: '#3b6fd0', l: '#9fc6ff' },
  };
  const BR = { red: { o: '#8a2f4f', H: '#ffd0c0', h: '#f4a08f', b: '#d9657f', d: '#a43f62' }, tan: { o: '#8c5a2f', H: '#ffe9b0', h: '#f2c97a', b: '#d9a24c', d: '#a8702f' },
    teal: { o: '#2f7a76', H: '#c9fff0', h: '#8fe6cf', b: '#46b8a4', d: '#2f8a86' } };
  const FANPAL = { magenta: { v: '#d34fa0', l: '#ff9fd8', d: '#7a2a66' }, violet: { v: '#a06be6', l: '#d9b2ff', d: '#5b3aa8' }, red: { v: '#e0505a', l: '#ffa0a0', d: '#8a2a3a' } };
  const TBL = { blue: { t: '#6f9cf2', l: '#b8d0ff', d: '#3b5aa8' }, violet: { t: '#9d7cff', l: '#cdb8ff', d: '#5a3ea8' }, teal: { t: '#4fc0b8', l: '#a5f0e4', d: '#2a7f88' } };

  // anemone: a tuft of tentacles with bright tips
  const anemone = (c, x, y, w, col, tip, seed) => {
    const r = rng(seed);
    rect(c, mix(col, '#000000', 0.35), x, y - 3, w, 3);
    for (let i = 0; i < w; i += 2) { const h = 6 + Math.floor(r() * 7); for (let k = 0; k < h; k++) rect(c, k > h - 3 ? tip : col, x + i + Math.round(Math.sin(k / 3 + i) * 1), y - 3 - k, 1, 1); }
  };
  // moored palm for the island horizon
  const palm = (c, x, y, h) => {
    rect(c, '#5b3f26', x, y - h, 2, h);
    for (const d of [-1, 1]) {
      shape(c, '#2c7d4c', x + 1, y - h, x + 1 + d * 11, y - h + 3, x + 1 + d * 6, y - h - 1);
      shape(c, '#3fa062', x + 1, y - h, x + 1 + d * 8, y - h + 7, x + 1 + d * 3, y - h + 1);
    }
    shape(c, '#3fa062', x - 3, y - h - 4, x + 5, y - h - 4, x + 1, y - h);
  };
  // the sea floor: sand body, ripples, pebbles and a few shells
  function sand(c, w, top, bottom, seed, cols = ['#dccb95', '#bda978', '#8c7a55']) {
    const pts = [0, top + 4];
    for (let x = 0; x <= w; x += 16) pts.push(x, Math.round(top + 3 * Math.sin(x / 31 + seed) + 2 * Math.sin(x / 11)));
    shape(c, cols[0], ...pts, w, bottom, 0, bottom);
    grad(c, 0, top + 8, w, bottom - top - 8, ['#ffffff00', cols[2] + '70']);
    ripples(c, w, top + 7, bottom, cols[1] + 'aa', '#fff4cc55', seed);
    grain(c, 0, top + 3, w, bottom - top - 3, Math.round(w * (bottom - top) / 55), [cols[1], '#fff2c8aa', cols[2] + '99', '#6b5a3c88'], seed + 3);
  }
  const sparkles = (c, w, y0, y1, seed, n = 10) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) { const x = Math.floor(r() * w), y = y0 + Math.floor(r() * (y1 - y0)); rect(c, '#fffbe0aa', x, y, 2, 1); rect(c, '#fffbe055', x, y - 1, 1, 3); }
  };
  const darkReef = (c, w, base, seed, col, amp = 14) => {
    const r = rng(seed), pts = [0, base + 40];
    for (let x = 0; x <= w; x += 8) pts.push(x, Math.round(base - amp * (0.4 + 0.6 * Math.abs(Math.sin(x / 29 + seed))) - r() * 5));
    shape(c, col, ...pts, w, base + 40);
  };

  // ---------- deep-ocean style kit
  // The Coral Reef and Polar Seas pictures follow the same recipe as the deep-ocean pictures in pixel-art.js:
  // flat, muted water with a few faint light shafts, one hushed sea floor, ONE big hand-shaded subject that the
  // text next to it is about, and only a handful of dim extras. Nothing else competes with the subject.
  const dwater = (c, top, bottom, seed, shafts = [], y0 = 0) => {
    grad(c, 0, y0, 240, 148 - y0, [top, bottom]);
    grain(c, 0, y0, 240, 148 - y0, 220, ['#aed6ff16', '#92d9f624', '#b8e7e91a'], seed);
    for (const s of shafts) shape(c, ...s);
  };
  // Dim background silhouette (far fish, far animals): one flat color, no outline.
  const ghost = (c, rows, col, x, y, px = 1, o = {}) => spr(c, rows, new Proxy({}, { get: () => col }), x, y, px, { line: false, lit: false, ...o });
  const bed = (c, col, ...pts) => shape(c, col, ...pts, 240, 148, 0, 148);          // sea-floor silhouette
  const flecks = (c, y0, y1, n, cols, seed) => grain(c, 0, y0, 240, y1 - y0, n, cols, seed);
  const swap = (rows, cells) => { const g = rows.map(r => r.split('')); for (const [x, y, ch] of cells) if (g[y] && g[y][x] !== undefined) g[y][x] = ch; return g.map(r => r.join('')); };

  // Grown shapes: built from a few simple rules so every outline stays clean at 4-6x.
  function staghorn(W, H, seed) {                                  // branching coral: a trunk that forks three times, with a wide foot
    const g = Array.from({ length: H }, () => Array(W).fill('.')), cx = (W - 1) / 2;
    const put = (x, y) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = 'b'; };
    const grow = (x, y, vx, len, t, depth) => {
      for (let i = 0; i < len; i++) { y--; x += vx; for (let k = 0; k < t; k++) put(x + k - (t - 1) / 2, y); }
      if (depth === 0) for (const v of [-0.75, 0.05, 0.75]) grow(x, y, v, Math.round(len * 1.5), 3, 1);
      else if (depth === 1) for (const d of [-0.55, 0.55]) grow(x, y, vx + d, Math.round(len * 0.8), 2, 2);
      else if (depth === 2) for (const d of [-0.5, 0.5]) grow(x, y, vx + d, Math.max(2, Math.round(len * 0.6)), 2, 3);
    };
    grow(cx, H - 3, 0, 4, 4, 0);
    for (let y = H - 3; y < H; y++) for (let x = Math.floor(cx) - (y - H + 5) * 2; x <= Math.ceil(cx) + (y - H + 5) * 2; x++) put(x, y);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'b' && (x * 5 + y * 3 + seed) % 7 === 0) g[y][x] = 'h';
    return g.map(r => r.join(''));
  }
  function plateCoral(W) {                                         // wide flat plate on a short stalk
    const H = 15, g = Array.from({ length: H }, () => Array(W).fill('.')), cx = W >> 1, put = (x, y, ch) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; };
    [0.5, 0.82, 1, 0.94, 0.66].forEach((f, y) => { const hw = Math.round(W * f / 2); for (let x = cx - hw; x < cx + hw; x++) put(x, y, y === 4 ? 'd' : (x + y * 2) % 7 === 0 ? 'h' : 'b'); });
    for (let x = cx - Math.round(W * 0.3); x < cx + Math.round(W * 0.3); x++) put(x, 5, 'd');
    for (let y = 6; y < H - 2; y++) for (let x = cx - 2; x <= cx + 2; x++) put(x, y, x === cx + 2 ? 'd' : 'b');
    for (let y = H - 2; y < H; y++) for (let x = cx - 5 - (y - H + 2); x <= cx + 5 + (y - H + 2); x++) put(x, y, 'd');
    return g.map(r => r.join(''));
  }
  function stilts(W, H) {                                         // mangrove prop roots: arch out from the trunk, then drop to the sand
    const g = Array.from({ length: H }, () => Array(W).fill('.')), cx = W >> 1, put = (x, y, ch = 'b') => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; };
    for (let y = 0; y < 5; y++) for (let x = cx - 6; x <= cx + 6; x++) put(x, y, (x * 3 + y) % 5 === 0 ? 'd' : 'b');
    for (const [sx, ex] of [[cx - 5, 1], [cx - 2, cx - 9], [cx + 1, cx + 1], [cx + 4, cx + 10], [cx + 6, W - 3]]) {
      for (let y = 4; y < H; y++) {
        const t = (y - 4) / (H - 5), x = Math.round(sx + (ex - sx) * (1 - Math.pow(1 - t, 2.2))), w = t < 0.45 ? 3 : 2;
        for (let k = 0; k < w; k++) put(x + k, y, k === 0 ? 'h' : k === w - 1 && w > 2 ? 'd' : 'b');
      }
    }
    return g.map(r => r.join(''));
  }
  function krillBody() {                                           // pink, see-through shrimp curled in a swimming arch
    const W = 37, H = 18, g = Array.from({ length: H }, () => Array(W).fill('.')), put = (x, y, ch) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; };
    const cy = t => 5.2 + 9.5 * t * t - 4.4 * t, th = t => 6.2 - 3.4 * t;
    for (let x = 4; x < 31; x++) {
      const t = (x - 4) / 26, y0 = Math.round(cy(t) - th(t) / 2), y1 = Math.round(cy(t) + th(t) / 2);
      for (let y = y0; y <= y1; y++) put(x, y, y === y0 ? 'h' : y === y1 ? 'd' : x % 4 === 0 && x > 9 ? 'd' : 'b');
      if (x > 8 && x < 25 && x % 4 === 1) { put(x, y1 + 1, 'a'); put(x, y1 + 2, 'a'); }       // swimming legs
    }
    for (const [x, y] of [[3, 2], [2, 1], [1, 0], [3, 6], [2, 7], [1, 8]]) put(x, y, 'a');    // feelers
    put(5, 3, 'e'); put(6, 3, 'e'); put(5, 4, 'e'); put(6, 4, 'e');                           // big dark eye
    [[31, 10, 12], [32, 10, 14], [33, 11, 15], [34, 12, 16], [35, 13, 17]].forEach(([x, y0, y1]) => { for (let y = y0; y <= y1; y++) put(x, y, (x + y) % 3 === 0 ? 'd' : 'b'); });   // tail fan
    for (let x = 12; x < 21; x++) put(x, Math.round(cy((x - 4) / 26)), 'g');                  // green gut line
    return g.map(r => r.join(''));
  }
  function penguinSwim() {                                         // emperor penguin diving: pointed beak, black back, white belly, leaf-shaped flipper
    const T = [2, 2, 2, 2, 4, 6, 8, 9, 10, 11, 12, 12, 12, 12, 12, 12, 11, 11, 10, 10, 9, 8, 7, 6, 5, 4, 3, 2], cy = 7, W = T.length + 3, H = 22;
    const g = Array.from({ length: H }, () => Array(W).fill('.')), put = (x, y, ch) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; };
    T.forEach((t, x) => { for (let y = cy - Math.ceil(t / 2); y < cy + Math.floor(t / 2); y++) put(x, y, y > cy && x >= 8 ? 'h' : 'b'); });
    for (let x = 0; x < 4; x++) { put(x, cy - 1, 'r'); put(x, cy, 'y'); }                       // beak
    for (const [x, y] of [[7, cy - 1], [8, cy - 1], [7, cy], [8, cy], [9, cy], [9, cy + 1]]) put(x, y, 'y');   // golden ear patch
    put(6, cy - 2, 'e');                                                                       // eye
    for (let i = 0; i < 10; i++) { const y0 = cy + 4 + Math.floor(i * 0.7), th = i < 3 ? 3 : i < 7 ? 2 : 1; for (let k = 0; k < th; k++) put(11 + i, y0 + k, 'f'); }   // flipper
    put(T.length, cy, 'f'); put(T.length, cy + 1, 'f'); put(T.length + 1, cy + 1, 'f'); put(T.length + 2, cy + 2, 'f');   // feet
    return g.map(r => r.join(''));
  }

  // Hero subjects (one per picture) and their muted palettes.
  const ROOTS = stilts(34, 30), ROOT_PAL = { b: '#7a5a3e', h: '#a98258', d: '#4d3a2b' };
  const JUVENILE = critter(12, 6, { tail: 4, bands: [[0.3, 0.42], [0.58, 0.7]], eye: 0.17, belly: 0.5, seed: 2 });
  const JUVENILE_PAL = { b: '#e0b94a', h: '#f6e2a0', f: '#c98a3a', W: '#cfe3e8', e: '#14202a' };
  const PARROT_HERO = critter(22, 10, { tail: 6, beak: 'y', eye: 0.17, belly: 0.45, tailSpread: 0.9, bands: [[0.5, 0.78]] });
  const PARROT_PAL = { b: '#3f9f9a', h: '#8fd6c4', f: '#d07a93', W: '#4c79b8', y: '#f0dcae', e: '#0e1c28' };
  const CORAL_BIG = staghorn(32, 22, 3);
  const PLATE = plateCoral(34);
  const KRILL_HERO = krillBody(), KRILL_PAL = { b: '#e88c86', h: '#ffc7b8', d: '#a8506a', e: '#16060e', a: '#f7d6c8', g: '#7ed6a0' };
  const PENGUIN_HERO = penguinSwim();
  const PENGUIN_SWIM_PAL = { b: '#1d2a4a', h: '#f2f8fc', f: '#2c3d63', y: '#f0a03a', r: '#3a3f58', e: '#ffffff' };
  const NARWHAL_HERO = torpedo(30, 11, { lead: 13, head: 0.17, max: 0.4, thin: 0.13, tail: 8, spots: 30, eye: 0.13, seed: 9, flipper: 3, belly: 0.42 });
  const NARWHAL_PAL = { b: '#7f98b2', h: '#dbe6f1', f: '#46607f', d: '#566f90', t: '#efe4c0', e: '#0a1420' };


  // ---------- scenes
  const scenes = {
    /* ================= CORAL REEF ================= */
    reefHero(c) {
      // Background only (like the deep-ocean surface): sky, sun, island, water, light shafts and a hazy far reef.
      // The one big attraction is the turtle in the reefTurtle canvas; pixel-motion.js adds the waves, bubbles and silhouettes.
      const R = rng(21);
      grad(c, 0, 0, 480, 42, ['#4cb3e4', '#9fe3f0', '#e6fbf1']);
      for (let i = 0; i < 11; i++) { const x = Math.floor(R() * 470), y = 5 + Math.floor(R() * 20), w = 18 + Math.floor(R() * 44); rect(c, '#ffffffcc', x, y, w, 2); rect(c, '#ffffff88', x + 5, y - 2, w - 14, 2); rect(c, '#bfe6ee99', x + 3, y + 2, w - 8, 1); }
      rect(c, '#fff4b52e', 46, 0, 54, 40); rect(c, '#fff4b54a', 54, 0, 38, 34); rect(c, '#fff6c0', 62, 6, 22, 22); rect(c, '#fffbe0', 66, 10, 14, 14); rect(c, '#ffffff', 69, 13, 6, 6);
      shape(c, '#2f8f77', 318, 41, 340, 31, 372, 27, 402, 30, 432, 37, 452, 41); shape(c, '#237963', 372, 41, 396, 33, 418, 35, 438, 41);
      shape(c, '#52b184', 330, 41, 348, 34, 366, 33, 384, 41);
      palm(c, 366, 38, 13); palm(c, 392, 36, 10); palm(c, 410, 39, 12);
      water(c, 480, 245, ['#2dd0cc', '#17a0b2', '#0f7494', '#09506f', '#073d5e'], 31, [[40, 24, 50], [150, 30, 70], [262, 22, 60], [370, 28, 56], [446, 18, 34]], 37);
      for (let x = -4; x < 480; x += 3) {
        const y = Math.round(35 + 2.2 * Math.sin(x / 22) + 1.2 * Math.sin(x / 7));
        rect(c, '#46c6c6', x, y, 3, 6); rect(c, '#b9fff0', x, y, 3, 1); rect(c, '#62dccf', x, y + 3, 3, 1);
      }
      ripples(c, 480, 50, 196, '#b8f5ee22', '#05304a2a', 8);
      darkReef(c, 480, 200, 3, '#0b5a76a8', 18); darkReef(c, 480, 210, 8, '#0a4a66d0', 12);
      sand(c, 480, 222, 245, 5);
      meadow(c, 0, 480, 236, 40, 6, 14, 9);
      // a low, hazy row of corals along the bottom edge so the sea floor is not bare, but nothing competes with the turtle
      const mid = [[22, STAG, C.pink], [66, BRAIN, BR.tan], [110, FAN, FANPAL.magenta], [160, STAG, C.orange], [214, TABLE, TBL.violet],
        [266, BRAIN, BR.teal], [318, STAG, C.yellow], [366, FAN, FANPAL.violet], [414, BRAIN, BR.red], [458, STAG, C.pink]];
      for (const [x, sp, p] of mid) on(c, sp, p, x, 242 + Math.round(R() * 3), 2, { line: '#0a3a56' });
      grad(c, 0, 196, 480, 49, ['#0f749400', '#0b6d8c88']);
      sparkles(c, 480, 224, 244, 6, 10);
    },

    reefTurtle(c) {
      spr(c, TURTLE, TURTLE_PAL, 12, 0, 5, { line: false, lit: false });
    },

    /* Coral Reef scenes, deep-ocean style: one big subject per picture (see the kit above). */
    lagoon(c) {
      // "A nursery by the shore": the mangrove roots are the picture; a young fish and a few tiny ones shelter beside them.
      dwater(c, '#2aa7a0', '#0e4a58', 53, [['#c8fff01c', 150, 0, 176, 0, 150, 120, 122, 128], ['#c8fff014', 204, 0, 222, 0, 230, 110, 208, 118]]);
      bed(c, '#2b8a84', 0, 114, 44, 108, 96, 113, 160, 107, 210, 111, 240, 106);
      bed(c, '#1d6a70', 0, 128, 70, 123, 150, 129, 240, 121);
      flecks(c, 112, 148, 70, ['#8fd0c0', '#14505c', '#c6efdd'], 11);
      meadow(c, 6, 234, 130, 18, 7, 15, 11, ['#2a8c62', '#68c590']);
      spr(c, ROOTS, ROOT_PAL, 16, 0, 4, { line: '#241912' });
      for (let x = 6; x < 190; x += 5) { const y = 2 + Math.round(5 * Math.abs(Math.sin(x / 11 + 1))); rect(c, x % 3 ? '#2f8a52' : '#1f6a3e', x, 0, 5, y); rect(c, '#58b26e', x + 1, y - 1, 3, 1); }   // canopy
      spr(c, JUVENILE, JUVENILE_PAL, 168, 62, 4, { line: '#2e2414' });
      for (const [x, y] of [[196, 36], [210, 46], [170, 104], [8, 70], [150, 40]]) ghost(c, FISH, '#bfeee866', x, y);
      for (const [x, y, s] of [[178, 92, 4], [186, 82, 3], [8, 92, 4]]) bubble(c, x, y, s);
    },

    crest(c) {
      // "The reef as a seawall": surf at the top, and a parrotfish grazing algae off a brain coral.
      dwater(c, '#25a9b4', '#0c4a64', 4, [['#c8fff01c', 40, 12, 66, 12, 40, 110, 14, 120], ['#c8fff014', 170, 12, 190, 12, 178, 120, 152, 128]], 0);
      for (let x = 0; x < 240; x += 2) {                            // breaking waves: foam band with a ragged lower edge
        const y = Math.round(7 + 2 * Math.sin(x / 9) + 1.3 * Math.sin(x / 4));
        rect(c, '#c9f3ee', x, 0, 2, y); rect(c, '#f4fffc', x, y - 1, 2, 2); rect(c, '#7fd9d6', x, y + 1, 2, 2);
      }
      grain(c, 0, 8, 240, 22, 50, ['#e8fffa55', '#a8efe844'], 4);
      bed(c, '#1d6f86', 0, 96, 50, 90, 110, 97, 170, 91, 240, 95);
      bed(c, '#2e7c88', 0, 124, 40, 118, 100, 124, 170, 118, 240, 122);
      flecks(c, 118, 148, 60, ['#7fb0b8', '#1c5260', '#b6dbdf'], 6);
      spr(c, BRAIN, { o: '#7a3548', H: '#f0a8b4', h: '#d9788c', b: '#c25d78', d: '#8f3f5c' }, 28, 98, 5, { line: '#3a1426' });
      spr(c, FAN, { v: '#8a62c8', l: '#bfa2ee', d: '#4e3590' }, 200, 112, 3, { line: '#241a4a' });
      spr(c, PARROT_HERO, PARROT_PAL, 56, 28, 5, { line: '#10303f' });
      for (const [x, y] of [[62, 92], [74, 86], [58, 82]]) rect(c, '#9fd89a', x, y, 2, 1);        // algae scraped loose
      for (const [x, y] of [[184, 38], [200, 52], [172, 64]]) ghost(c, FISH, '#0a3a5099', x, y);
      for (const [x, y, s] of [[10, 40, 3], [214, 32, 4], [226, 60, 3]]) bubble(c, x, y, s);
    },

    bleach(c, heat) {
      // "Turn up the heat": one big branching coral that washes out as the slider moves. The extras fade with it.
      const o = { heat, live: true };
      dwater(c, '#2aa6b2', '#0d4660', 12, [['#c8fff01c', 40, 0, 66, 0, 44, 120, 16, 128], ['#c8fff014', 168, 0, 190, 0, 196, 112, 170, 120]]);
      bed(c, '#1f7088', 0, 100, 60, 94, 130, 101, 190, 95, 240, 99);
      bed(c, '#2f7f8a', 0, 126, 50, 121, 120, 127, 190, 121, 240, 125);
      flecks(c, 118, 148, 70, ['#9ac4c6', '#1c5260', '#c8e6e0'], 12);
      spr(c, CORAL_BIG, { b: '#d9708c', h: '#f4aebd' }, 36, 26, 5, { ...o, line: '#3a1426' });
      spr(c, STAG, { s: '#d9783a', l: '#ffc27a' }, 10, 88, 3, { ...o, line: '#4a2410' });
      spr(c, STAG, { s: '#7b4bb8', l: '#c9a2f5' }, 186, 92, 3, { ...o, line: '#2c1f58' });
      meadow(c, 0, 240, 138, 10, 6, 11, 5, ['#2a8c62', '#68c590']);
      if (heat < 0.9) for (const [x, y] of [[198, 40], [210, 52], [200, 66]]) ghost(c, FISH, heat < 0.5 ? '#d9b857' : '#b09a5a88', x, y, 2);
      bubble(c, 18, 60, 4); bubble(c, 214, 84, 3);
    },

    slope(c) {
      // "Gardens under pressure": a green sea turtle gliding over a quiet coral slope.
      dwater(c, '#1c93b2', '#09385c', 7, [['#c8fff01a', 30, 0, 56, 0, 30, 110, 4, 120], ['#c8fff012', 176, 0, 202, 0, 190, 112, 164, 120]]);
      bed(c, '#1b6a8c', 0, 84, 90, 94, 170, 106, 240, 112);
      bed(c, '#23536f', 0, 112, 100, 118, 170, 124, 240, 128);
      flecks(c, 92, 148, 80, ['#6aa0b8', '#163e56', '#a6ccdc'], 7);
      spr(c, STAG, { s: '#c8506e', l: '#ff9fb0' }, 8, 92, 3, { line: '#3a1426' });
      spr(c, FAN, { v: '#8a62c8', l: '#bfa2ee', d: '#4e3590' }, 196, 104, 3, { line: '#241a4a' });
      spr(c, BRAIN, { o: '#6a4a24', H: '#f2d08a', h: '#d9a85c', b: '#c08a3c', d: '#8a5c26' }, 96, 118, 3, { line: '#34200c' });
      spr(c, TURTLE, TURTLE_PAL, 60, 14, 6, { flip: true, line: false, lit: false });
      for (const [x, y] of [[190, 30], [204, 42], [178, 56], [22, 40]]) ghost(c, FISH, '#0a3a5099', x, y);
      for (const [x, y, s] of [[40, 70, 4], [48, 60, 3], [214, 78, 4]]) bubble(c, x, y, s);
    },

    meso(c) {
      // "A deeper refuge?": a wide plate coral reaching for the last of the light, a big fish patrolling above it.
      dwater(c, '#183f6a', '#0b1c3a', 15, [['#9fd0ff16', 70, 0, 94, 0, 84, 100, 58, 112], ['#9fd0ff10', 160, 0, 178, 0, 168, 96, 144, 106]]);
      bed(c, '#142e50', 0, 108, 60, 103, 140, 110, 200, 104, 240, 108);
      bed(c, '#0f2342', 0, 130, 80, 126, 170, 131, 240, 126);
      flecks(c, 104, 148, 60, ['#3a6590', '#0a1830', '#6f9fd055'], 15);
      spr(c, PLATE, { b: '#7487d8', h: '#a9b8f2', d: '#3c4b98' }, 28, 70, 5, { line: '#141c4a' });
      spr(c, GROUPER, { b: '#a4503c', h: '#cf8a68', f: '#7c3426', d: '#6e2a20', e: '#12090a' }, 132, 16, 3, { line: '#2a0c0a' });
      ghost(c, JELLY, '#c9a6ff55', 208, 96, 2, { line: false });
      for (const [x, y] of [[20, 30], [56, 20], [100, 70], [214, 40], [150, 96]]) rect(c, '#9fe8ff55', x, y, 2, 2);
    },

    /* ================= POLAR SEAS ================= */
    polarHero(c) {
      // Same recipe as the deep-ocean surface: calm water + light shafts, with ripples added by pixel-motion.js.
      // The icebergs are drawn as chunky sprites and are protected from the ripple, so they stay perfectly still.
      const R = rng(33), q2 = v => 2 * Math.round(v / 2);
      grad(c, 0, 0, 480, 86, ['#050c2a', '#0b2a52', '#1f5a86', '#4a94b8']);
      for (let i = 0; i < 130; i++) { const x = Math.floor(R() * 480), y = Math.floor(R() * 54), b = R() > 0.85; rect(c, b ? '#ffffff' : '#bcd8f0aa', x, y, 1, 1); if (b) { rect(c, '#ffffff66', x - 1, y, 3, 1); rect(c, '#ffffff66', x, y - 1, 1, 3); } }
      for (let x = 0; x < 480; x += 3) {                                  // aurora: stepped curtains, three flat bands
        const k = 0.5 + 0.5 * Math.sin(x / 37), t0 = q2(8 + 14 * Math.sin(x / 61) + 5 * Math.sin(x / 17)), hh = q2(32 + 26 * (0.5 + 0.5 * Math.sin(x / 23)));
        const a = v => (Math.round(v * 8) / 8).toFixed(3);
        rect(c, 'rgba(176,130,255,' + a(0.07 + 0.14 * k) + ')', x, t0, 3, q2(hh * 0.3));
        rect(c, 'rgba(110,255,190,' + a(0.14 + 0.3 * k) + ')', x, t0 + q2(hh * 0.3), 3, q2(hh * 0.34));
        rect(c, 'rgba(110,255,190,' + a(0.05 + 0.1 * k) + ')', x, t0 + q2(hh * 0.3) + q2(hh * 0.34), 3, q2(hh * 0.36));
      }
      shape(c, '#cfeefb', 0, 84, 0, 72, 24, 62, 46, 70, 70, 64, 104, 84); shape(c, '#8fc6e0', 46, 84, 70, 64, 104, 84);                    // far glaciers
      shape(c, '#dcf4ff', 286, 84, 316, 58, 336, 64, 358, 46, 396, 72, 426, 62, 458, 84); shape(c, '#7fb8d6', 358, 84, 396, 72, 426, 62, 458, 84); shape(c, '#f4fcff', 316, 58, 330, 66, 336, 64);
      water(c, 480, 245, ['#2f86ad', '#195f86', '#0d3b62', '#082a4a'], 14, [[40, 24, 50], [170, 30, 70], [300, 22, 60], [420, 26, 50]], 84);
      rect(c, '#bfe9ff44', 0, 84, 480, 1); rect(c, '#bfe9ff1c', 0, 86, 480, 1);
      ripples(c, 480, 88, 245, '#a8e8ff26', '#04305030', 6);
      // icebergs, far to near (all still): pointed, craggy and flat-topped (tabular) ones
      const far = { line: '#3d7aa6' };
      berg(c, 14, 88, 26, 8, 5, 1, 3, { ...far, flat: 2, peak: 0.5 }); berg(c, 146, 88, 30, 11, 6, 1, 5, { ...far, sharp: 1.15, jag: 3 });
      berg(c, 232, 89, 38, 9, 5, 1, 8, { ...far, flat: 2.2, peak: 0.55 }); berg(c, 420, 89, 30, 12, 6, 1, 11, { ...far, sharp: 1.1, jag: 3 });
      berg(c, 196, 110, 22, 9, 6, 2, 31, { peak: 0.5, sharp: 0.9, jag: 2 }); berg(c, 210, 114, 44, 15, 9, 2, 14, { peak: 0.48, sharp: 0.85, jag: 4 }); berg(c, 436, 120, 34, 11, 8, 2, 21, { flat: 2.2, peak: 0.5, jag: 2 });
      sparkles(c, 480, 96, 240, 15, 22);
    },

    polarFloe(c) {
      // The one big attraction for the polar hero: a pair of scarfed penguins on a floe.
      const m = iceMass(56, 8, 8, { seed: 4, flat: 3, peak: 0.5, jag: 1.2 });
      spr(c, m.down, ICE, 14, 70, 2, { line: false, lit: false });
      spr(c, m.up, ICE, 14, 54, 2, { line: ICE_LINE });
      on(c, PENGUIN, PENGUIN_PAL, 50, 58, 3);
      on(c, PENGUIN, { ...PENGUIN_PAL, s: '#5cc8ff' }, 92, 58, 3, { flip: true });
    },

    /* Polar Seas scenes, deep-ocean style: one big subject per picture (see the kit above). */
    iceEdge(c) {
      // "A floating hunting ground": a polar bear on a drifting floe, low light on a cold sea.
      grad(c, 0, 0, 240, 62, ['#5d86b0', '#a2c6de', '#d8ecf6']);
      grain(c, 0, 0, 240, 62, 60, ['#ffffff22', '#ffffff14'], 3);
      shape(c, '#c6e0ee', 150, 62, 168, 46, 182, 52, 196, 38, 222, 62);
      shape(c, '#9cc0d6', 196, 38, 222, 62, 196, 62);
      dwater(c, '#1d6f94', '#092c4c', 4, [['#c8fff014', 20, 62, 46, 62, 30, 140, 4, 148], ['#c8fff010', 150, 62, 176, 62, 170, 140, 144, 148]], 62);
      rect(c, '#d4eef7', 0, 62, 240, 1); rect(c, '#8cc6dc', 0, 63, 240, 1);
      berg(c, 18, 112, 48, 4, 7, 4, 6, { flat: 2.4, peak: 0.45, jag: 1.4, line: '#2f5a7c' });
      spr(c, BEAR, { w: '#eef7fb', s: '#a8c3d6', k: '#1b2230' }, 34, 12, 4, { line: '#35597a' });
      for (const [x, y, s] of [[200, 92, 3], [214, 84, 4]]) bubble(c, x, y, s);
    },

    underice(c) {
      // "The krill engine": one Antarctic krill up close, grazing under the ice where the algae hang.
      dwater(c, '#1f8a98', '#0a3550', 6, [['#c8fff016', 54, 14, 80, 14, 56, 120, 28, 130], ['#c8fff012', 150, 14, 176, 14, 170, 120, 142, 130]]);
      shape(c, '#dff3fa', 0, 0, 240, 0, 240, 12, 214, 16, 188, 11, 160, 18, 132, 12, 100, 17, 70, 11, 40, 17, 14, 12, 0, 15);
      shape(c, '#a4d2e4', 0, 12, 14, 12, 40, 17, 70, 11, 100, 17, 132, 12, 160, 18, 188, 11, 214, 16, 240, 12, 240, 14, 214, 20, 188, 14, 160, 22, 132, 15, 100, 21, 70, 14, 40, 21, 14, 15, 0, 18);
      grain(c, 0, 0, 240, 14, 40, ['#ffffff', '#c6e6f2'], 5);
      for (const [x, len] of [[16, 16], [58, 24], [104, 14], [150, 22], [198, 16], [228, 22]]) {      // ice algae
        for (let k = 0; k < len; k++) rect(c, k > len - 5 ? '#a8e890' : '#46b074', x + Math.round(Math.sin(k / 3 + x) * 1.5), 16 + k, 3, 1);
      }
      bed(c, '#143a52', 0, 138, 70, 134, 150, 140, 240, 133);
      spr(c, KRILL_HERO, KRILL_PAL, 12, 38, 5, { line: '#6a2a46' });
      for (let i = 0; i < 10; i++) ghost(c, KRILL, '#e88c8677', 200 + (i * 13) % 34, 44 + (i * 29) % 64 + (i % 2));
      ghost(c, ICEFISH, '#a9dcf544', 150, 120, 2);
      for (const [x, y, s] of [[10, 112, 4], [20, 100, 3], [206, 34, 4]]) bubble(c, x, y, s);
    },

    shelf(c) {
      // "Divers of the cold": an emperor penguin hunting beneath the ice, a seal lurking far behind.
      dwater(c, '#1d78a6', '#08264a', 25, [['#c8fff016', 36, 0, 62, 0, 44, 116, 16, 124], ['#c8fff010', 168, 0, 190, 0, 196, 112, 168, 120]]);
      bed(c, '#14456c', 0, 112, 60, 106, 130, 113, 190, 107, 240, 111);
      bed(c, '#0f3050', 0, 132, 80, 127, 170, 133, 240, 128);
      flecks(c, 108, 148, 60, ['#5f8fb0', '#0a2442', '#a6c6dc55'], 9);
      for (const [x, s, px] of [[18, SPONGE, 2], [206, SPONGE, 3], [226, SPONGE, 2]]) spr(c, s, { y: '#d8b24a', d: '#a07a22', l: '#f0d684' }, x, 140 - s.length * px + 6, px, { line: '#3a2a08' });
      ghost(c, SEAL, '#0b2a4a99', 144, 84, 3);
      spr(c, PENGUIN_HERO, PENGUIN_SWIM_PAL, 26, 12, 5, { line: '#0a1226' });
      for (let i = 0; i < 7; i++) ghost(c, FISH, '#dff3ff77', 8 + (i * 17) % 40, 96 + (i * 23) % 34);
      for (const [x, y, s] of [[14, 40, 4], [8, 28, 3], [206, 34, 4]]) bubble(c, x, y, s);
    },

    polardeep(c) {
      // "Arctic divers": a narwhal in the dark with its tusk out front, marine snow drifting by.
      dwater(c, '#0b3266', '#030c20', 31, [['#a4d4ff14', 100, 0, 124, 0, 120, 110, 92, 120]]);
      bed(c, '#050f24', 0, 132, 40, 126, 110, 134, 190, 124, 240, 130);
      bed(c, '#08162e', 0, 142, 240, 138);
      flecks(c, 124, 148, 40, ['#1a3a66', '#0a1a38'], 3);
      spr(c, NARWHAL_HERO, NARWHAL_PAL, 14, 38, 4, { line: '#0a1830' });
      ghost(c, JELLY, '#7fb8ff44', 18, 88, 3, { line: false });
      for (const [x, y] of [[40, 22], [160, 20], [214, 48], [30, 110], [140, 112]]) { rect(c, '#7fffe044', x, y, 3, 3); rect(c, '#d8fff4aa', x + 1, y + 1, 1, 1); }
    },

    /* ================= small marks & icons ================= */
    markreef(c) { rect(c, '#ff8fa3', 0, 0, 16, 16); rect(c, '#0b3040', 1, 1, 14, 14); spr(c, ICON.Coral, ICON_PAL.Coral, 3, 3, 1, { line: false, lit: false }); },
    markpolar(c) { rect(c, '#a9e6ff', 0, 0, 16, 16); rect(c, '#0b2a40', 1, 1, 14, 14); spr(c, ICON.Flake, ICON_PAL.Flake, 3, 3, 1, { line: false, lit: false }); },
  };
  for (const n of ['Bottle', 'Coral', 'Fish', 'Sun', 'Flake']) scenes['ico' + n] = c => spr(c, ICON[n], ICON_PAL[n], 0, 0, 2, { line: false, lit: false });

  window.PIXEL_BIOME_DRAWINGS = Object.fromEntries(Object.entries(scenes).map(([name, fn]) => [name, (ctx, heat) => fn(ctx, +heat || 0)]));
})();
