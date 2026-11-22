/* Pixel-art engine + scenes for the Coral Reef and Polar Seas pages.
   Every picture is drawn from code (hard-edged pixels, like pixel-art.js) and animated ~8 times a second
   while it is on screen. Add canvases with data-art="<scene name>" and they are picked up automatically. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- helpers
  const num = c => parseInt(c.slice(1), 16);
  const mix = (a, b, k) => {
    const A = num(a), B = num(b), ch = s => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
    return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')';
  };
  const rect = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const poly = (c, col, ...p) => { c.fillStyle = col; c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.fill(); };
  const rng = seed => () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const grad = (c, x, y, w, h, stops) => {
    const g = c.createLinearGradient(0, y, 0, y + h);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    rect(c, g, x, y, w, h);
  };
  const grain = (c, x, y, w, h, n, cols, seed = 5) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) rect(c, cols[i % cols.length], x + Math.floor(r() * w), y + Math.floor(r() * h), 1 + Math.floor(r() * 3), 1);
  };

  // ---------- sprites (one character = one pixel; '.' = empty)
  const FISH = ['...h.....c', '..hh....cc', '.hcccc.ccc', 'ceccccc...', '.ccccccccc', '..ccc...cc'];
  const S = {
    coralA: { live: 1, pal: { p: '#ff6f91', h: '#ffa9bd', d: '#b8446a' }, rows: [
      '.p..p..p..p.', '.pp.pp.pp.p.', '..pppppppp..', '.hpp.pp.ppp.', '...ppdpp....', '....pdp.....', '....pdp.....', '...dddddd...'] },
    coralB: { live: 1, pal: { o: '#ff9f45', h: '#ffd08a', d: '#b5611f' }, rows: [
      '....oooooo....', '..oohooohoo...', '.ohoodooooho..', 'ooohooodoooooh', 'oodoooohoodooo', 'dooooodooooodo', 'dddddddddddddd'] },
    fan: { live: 1, pal: { v: '#b06bff', l: '#d9b2ff', d: '#6b3aa8' }, rows: [
      'v.v.v.vv.v.v', 'vvvvvvvvvvvv', '.vvlvvvvlvv.', '..vvvvvvvv..', '...vvvvvv...', '....vvvv....', '.....vv.....', '.....dd.....'] },
    plate: { pal: { t: '#7fa8ff', l: '#bcd2ff', d: '#3b5aa8' }, rows: [
      '..tttttttttttttttt..', '.tltttltttttltttttt.', 'tttttttttttttttttttt', '.dddttttttttttdddd..', '......dddddddd......', '.......dd..dd.......'] },
    grass: { pal: { g: '#2faa62', G: '#78eaa2' }, rows: ['.G.', '.g.', '.g.', '.g.', '.g.', '.g.', '.g.', '.g.', '.g.', '.g.'] },
    fish: { pal: { c: '#ffd23f', h: '#fff0a0', e: '#0e3a4a' }, rows: FISH },
    parrot: { pal: { g: '#2fd0b5', b: '#1a8fb0', p: '#ff7fb0', k: '#fff0c4', e: '#0a2030' }, rows: [
      '...gggggggg.....', '.kggggbbggggpp..', 'kkggeggbbgggppp.', 'kkgggggbbgggppp.', '.kgggbbbbggpp...', '..gggggggggp....', '...ggggggg......'] },
    turtle: { pal: { s: '#5b8a3a', g: '#8fc157', f: '#3f6b2a', h: '#b6d77a', e: '#0a2030' }, rows: [
      '.....ssssss.......', '...ssggssggss.....', '..sggssggssggs..hh', '.sggssggssggsssshhh',
      'fsssssssssssssshheh', 'ff.ssssssssss..hhhh', '.f..f......f...hh.'].map(r => r.slice(0, 19)) },
    star: { pal: { o: '#ff8a3d', h: '#ffd08a' }, rows: ['...o...', '...o...', 'oohoooo', '.ooooo.', '..o.o..', '.oo.oo.', '.o...o.'] },
    jelly: { pal: { c: '#c9a6ff', h: '#f0e2ff', t: '#9b7ae6' }, rows: [
      '..ccccc..', '.ccchccc.', 'cchhcccc.'.padEnd(9, 'c'), 'ccccccccc', '.t.t.t.t.', '.t..t..t.', '..t.t.t..', '.t.....t.', '.........'] },
    sponge: { pal: { y: '#ffd24a', d: '#c98a1c' }, rows: ['y..y.y', 'yy.yyy', 'yyyyyy', 'yddyyd', 'ydyydy', 'dddddd'] },
    krill: { pal: { r: '#ff8a7a', e: '#2a0a10' }, rows: ['.rr.', 'rrre'] },
    algae: { pal: { a: '#5cc47a', b: '#a8e6a0' }, rows: ['.b.', '.a.', '.a.', '.a.', '.a.', '.a.', '.a.'] },
    penguin: { pal: { o: '#0c1630', k: '#2b3f66', w: '#f2fbff', y: '#ffa63d', s: '#ff5a6e', e: '#0c1630' }, rows: [
      '..oooooo..', '.okkkkkko.', 'okkwkkwkko', 'okkwekwkko', 'okkkyykko.'.slice(0, 10), '.ossssssso', 'okkwwwwkko', 'okkwwwwkko',
      'okkwwwwkko', '.okwwwwko.', '..owwwwo..', '..yy..yy..'] },
    penguinSwim: { pal: { k: '#2b3f66', w: '#f2fbff', y: '#ffa63d', o: '#0c1630' }, rows: [
      '...kkkkkkkk...', '.ykkkkkkkkkk..', 'yykwwwwwwkkkko', '.kwwwwwwwwkk..', '..kkkkkkkkok..', '......kk.kk...'] },
    bear: { pal: { w: '#f4fbff', s: '#bcd8e8', k: '#1b2230' }, rows: [
      '..........wwww........', '.........wwwwwww......', '.....wwwwwwwwwwwwwk...', '...wwwwwwwwwwwwwwwwwk.',
      '..wwwwwwwwwwwwwwwwwwk.', '..wwwwwwwwwwwwwwwwwwww', '..wwwwwwwwwwwwwwwwwwww', '..sswwwwwwwwwwwwwwwwss', '..ww.ww.......ww.ww.', '..ww.ww.......ww.ww.', '..kk.kk.......kk.kk.']
      .map(r => r.padEnd(22, '.').slice(0, 22)) },
    seal: { pal: { g: '#9fb2c0', d: '#6d8294', w: '#dfe9ef', e: '#0a1420' }, rows: [
      '..gggggggggggggggggg....', '.ggggggggggggggddgggggg.', 'ggegggggggdggggggggddggg', 'gggggggddggggggggggggggg', '.wwgggggggggggggggggwww.', '..wwwwgggggggggggwww....', '.....dd..........dd.....'] },
    narwhal: { pal: { t: '#f4ecd0', g: '#7e98b5', d: '#5a7390', w: '#d9e6f2', e: '#0a1420' }, rows: [
      '..............ggggggggggg.......', '..........gggggggggggggggggg.....', '.........ggegggggggggggggddgggg..',
      'tttttttttggggwwwwwwwwwwgggggdgd..', '..........ggggggggggggggggggd.d..', '............dgggggggggggd........',
      '..............ddd..dddddd........'].map(r => r.padEnd(34, '.')) },
    icoBottle: { pal: { c: '#9fe8ff', b: '#3d9bd6', w: '#e8fbff' }, rows: ['....cc....', '....cc....', '...cccc...', '..cbbbbc..', '..cbbbbc..', '..cbwwbc..', '..cbbbbc..', '..cbbbbc..', '..cbbbbc..', '...cccc...'] },
    icoCoral: { pal: { p: '#ff6f91', d: '#b8446a' }, rows: ['.p..p..p..', '.pp.pp.pp.', '..pppppp..', '.ppp.ppp..', '...ppppp..', '....pp....', '....pp....', '...dddd...', '..dddddd..', '..........'] },
    icoFish: { pal: { c: '#ffd23f', h: '#fff0a0', e: '#0e3a4a' }, rows: ['..........', '...h.....c', '..hh....cc', '.hcccc.ccc', 'ceccccc...', '.ccccccccc', '..ccc...cc', '..........', '..........', '..........'] },
    icoSun: { pal: { y: '#ffd16b' }, rows: ['....y.....', '.y..y..y..', '..yyyyy...', '.yyyyyyy..', 'yyyyyyyyy.', '.yyyyyyy..', '..yyyyy...', '.y..y..y..', '....y.....', '..........'] },
    icoFlake: { pal: { s: '#c8f1ff' }, rows: ['....s....', '.s..s..s.', '..s.s.s..', '...sss...', 'sssssssss', '...sss...', '..s.s.s..', '.s..s..s.', '....s....'] },
  };

  function put(ctx, s, x, y, px = 1, o = {}) {
    const rows = s.rows, n = rows.length, wid = Math.max(...rows.map(r => r.length));
    for (let r = 0; r < n; r++) {
      const k = o.inv ? r / n : 1 - r / n;
      const dx = o.sway ? Math.round(Math.sin(o.t * 2 + r * 0.45 + (o.ph || 0)) * o.sway * k) : 0;
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c]; if (ch === '.') continue;
        let col = (o.pal && o.pal[ch]) || s.pal[ch]; if (!col) continue;
        if (o.heat && s.live) col = mix(col.length > 7 ? col.slice(0, 7) : col, '#f1ece0', o.heat * 0.92);
        const cx = o.flip ? wid - 1 - c : c;
        rect(ctx, col, Math.round(x + (cx + dx) * px), Math.round(y + r * px), px, px);
      }
    }
  }

  // ---------- scenes
  const rays = (c, list, y1, col = '#ffffff12') => list.forEach(([x, w, a]) => poly(c, col, x, 0, x + w, 0, x + w - a, y1, x - a - 12, y1));
  const scatter = (r, n, x0, x1, ybase, fn) => { for (let i = 0; i < n; i++) fn(x0 + Math.floor(r() * (x1 - x0)), ybase(i), i); };
  const school = (n, x0, y0, y1, o = {}) => Array.from({ length: n }, (_, i) => ({
    s: 'fish', x: x0 + i * 13, y: y0 + ((i * 37) % (y1 - y0)), mv: 'swim', v: 9 + (i % 4) * 2, bob: 2, ...o }));
  const grassRow = (n, x0, x1, y, h = 1) => Array.from({ length: n }, (_, i) => ({
    s: 'grass', x: x0 + Math.round(i * (x1 - x0) / n), y: y - 10 * h - (i % 3), mv: 'sway', sway: 2, ph: i, px: 1 + (h > 1 ? 1 : 0) }));

  const SCENES = {
    /* ===== CORAL REEF ===== */
    reefHero: { w: 480, h: 245,
      bg(c, w, h) {
        grad(c, 0, 0, w, 40, ['#6fd3e6', '#d4f6f1']);
        rect(c, '#fff7c960', 62, 4, 26, 26); rect(c, '#fff7c9', 68, 10, 14, 14);
        poly(c, '#3a9d7a', 330, 40, 345, 29, 372, 25, 396, 28, 422, 35, 446, 40);
        poly(c, '#2d7f64', 380, 40, 396, 31, 416, 33, 432, 40);
        grad(c, 0, 36, w, h - 36, ['#2ec9c9', '#128aa3', '#0a6585']);
        rays(c, [[60, 22, 40], [190, 30, 70], [300, 20, 60], [410, 26, 40]], 215);
        poly(c, '#e9dcae', 0, 214, 80, 206, 180, 212, 300, 204, 400, 210, 480, 203, 480, 245, 0, 245);
        grain(c, 0, 206, w, 39, 280, ['#c9b987aa', '#fff5ccaa'], 11);
        const r = rng(21);
        for (let i = 0; i < 17; i++) {
          const k = ['coralA', 'coralB', 'fan'][i % 3], x = 6 + i * 28 + Math.floor(r() * 12);
          put(c, S[k], x, 214 - S[k].rows.length * 2 + 8, 2);
        }
      },
      items: [...grassRow(16, 4, 476, 222, 2), ...school(9, 120, 70, 160), ...school(6, 300, 100, 170, { pal: { c: '#8fe0ff', h: '#d8f6ff' }, dir: 1 }),
        { s: 'parrot', x: 60, y: 130, px: 2, mv: 'swim', v: 7, bob: 3 }, { s: 'turtle', x: 380, y: 95, px: 3, mv: 'swim', v: 4, dir: 1, bob: 3 }],
      fx: [{ t: 'bubbles', n: 8, x0: 10, x1: 470, y0: 240, y1: 40 }, { t: 'glints', n: 14, y0: 38, y1: 100 }], shear: [38, 205, 1],
      dyn(c, t) { for (let x = 0; x < 480; x += 3) rect(c, '#dffff8', x, Math.round(36 + 1.6 * Math.sin(x / 20 + t * 1.2)), 3, 1); } },
    reefTurtle: { w: 144, h: 86, bg() {},
      items: [{ s: 'turtle', x: 26, y: 12, px: 6, mv: 'bob', amp: 3, f: 1.1 }],
      fx: [{ t: 'bubbles', n: 5, x0: 10, x1: 130, y0: 84, y1: 4 }] },
    lagoon: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#5fe6d4', '#2bb5b4', '#1c8da3']);
        poly(c, '#efe2b4', 0, 116, 70, 110, 150, 115, 240, 108, 240, 148, 0, 148);
        grain(c, 0, 108, w, 40, 90, ['#cdbd8baa', '#fff6d0aa'], 3);
        rect(c, '#2f8a52', 0, 0, w, 12); grain(c, 0, 8, w, 10, 60, ['#2f8a52', '#3fa862'], 8);
        const r = rng(9);
        for (let x = 8; x < w; x += 15) { const len = 18 + Math.floor(r() * 28); rect(c, '#6b4a2f', x, 12, 2, len); rect(c, '#6b4a2f', x + 2, 12 + len * 0.5, 2, len * 0.5);
          rect(c, '#8a6440', x, 12, 1, len); }
        put(c, S.star, 40, 128, 2); put(c, S.star, 170, 124, 2, { pal: { o: '#ff6f91', h: '#ffa9bd' } }); put(c, S.coralB, 190, 112, 1);
      },
      items: [...grassRow(12, 6, 232, 118, 1), ...school(6, 60, 40, 90, { v: 6, pal: { c: '#e6f2ff', h: '#ffffff' } }),
        { s: 'fish', x: 150, y: 62, mv: 'swim', v: 8, bob: 2, pal: { c: '#ffb44a', h: '#ffe0a0' } }],
      fx: [{ t: 'bubbles', n: 4, x0: 10, x1: 230, y0: 140, y1: 20 }, { t: 'glints', n: 6, y0: 14, y1: 60 }], shear: [14, 110, 1] },
    crest: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#58d9dd', '#1d9db8', '#106f93']);
        rays(c, [[30, 16, 40], [120, 22, 50], [190, 14, 30]], 130);
        poly(c, '#5f7c88', 0, 126, 60, 120, 140, 124, 240, 118, 240, 148, 0, 148);
        const r = rng(4);
        [[8, 'coralB'], [44, 'coralA'], [78, 'coralB'], [118, 'coralA'], [150, 'coralB'], [196, 'coralA']].forEach(([x, k]) =>
          put(c, S[k], x, 126 - S[k].rows.length * 2, 2));
        grain(c, 0, 126, w, 22, 50, ['#8aa4ae', '#41606c'], 6);
      },
      items: [{ s: 'fan', x: 30, y: 96, px: 2, mv: 'sway', sway: 2 }, { s: 'fan', x: 168, y: 98, px: 2, mv: 'sway', sway: 2, ph: 2 },
        { s: 'parrot', x: 150, y: 70, px: 2, mv: 'swim', v: 8, bob: 2 }, { s: 'parrot', x: 40, y: 88, px: 2, mv: 'swim', v: 6, bob: 3, pal: { g: '#7fb2ff', b: '#4a7fd0' } },
        ...school(5, 80, 40, 70)],
      fx: [{ t: 'bubbles', n: 4, x0: 10, x1: 230, y0: 140, y1: 22 }], shear: [22, 122, 1],
      dyn(c, t) { for (let x = 0; x < 240; x += 2) { const y = Math.round(9 + 2 * Math.sin(x / 9 + t * 2)); rect(c, '#ffffff', x, y, 2, 2); rect(c, '#bdf3f0', x, y + 2, 2, 2); rect(c, '#58d9dd', x, 0, 2, y); } } },
    slope: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#27b0c4', '#127fa8', '#0a5a86']);
        rays(c, [[40, 20, 60], [130, 26, 70], [210, 16, 40]], 140);
        poly(c, '#35627a', 0, 78, 240, 122, 240, 148, 0, 148); poly(c, '#2c5369', 0, 100, 240, 134, 240, 148, 0, 148);
        grain(c, 0, 90, w, 58, 90, ['#4f8199', '#1f4559'], 7);
        const ys = x => 78 + x * 44 / 240; const keys = ['coralA', 'coralB', 'fan', 'coralB', 'coralA', 'fan', 'coralA', 'coralB'];
        keys.forEach((k, i) => { const x = 6 + i * 29; put(c, S[k], x, ys(x + 10) + 2 - S[k].rows.length * 2, 2); });
      },
      items: [{ s: 'turtle', x: 40, y: 40, px: 3, mv: 'swim', v: 6, dir: 1, bob: 3 }, ...school(8, 100, 30, 90), { s: 'parrot', x: 170, y: 66, px: 2, mv: 'swim', v: 7, bob: 2 }],
      fx: [{ t: 'bubbles', n: 5, x0: 10, x1: 230, y0: 140, y1: 10 }], shear: [0, 100, 1] },
    bleach: { w: 240, h: 148, heat: true,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#2ec0cd', '#12869f', '#0a5f82']);
        rays(c, [[50, 20, 50], [150, 26, 60]], 130);
        poly(c, '#d8c993', 0, 120, 80, 116, 170, 121, 240, 115, 240, 148, 0, 148);
        grain(c, 0, 116, w, 32, 70, ['#b8a870aa', '#f5e9b8aa'], 12);
      },
      items: [{ s: 'coralB', x: 10, y: 104, px: 2, live: 1 }, { s: 'coralA', x: 66, y: 98, px: 3, live: 1 }, { s: 'fan', x: 118, y: 102, px: 2, live: 1 },
        { s: 'coralB', x: 150, y: 104, px: 2, live: 1 }, { s: 'coralA', x: 205, y: 104, px: 2, live: 1 },
        ...school(5, 60, 25, 70, { v: 6 }), { s: 'parrot', x: 140, y: 50, px: 2, mv: 'swim', v: 7, bob: 2 }],
      fx: [{ t: 'bubbles', n: 3, x0: 10, x1: 230, y0: 140, y1: 10 }], shear: [0, 112, 1] },
    meso: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#0d6fb0', '#084b86', '#05264f']);
        rays(c, [[60, 14, 50], [160, 18, 60]], 140, '#ffffff0b');
        poly(c, '#24476b', 0, 100, 60, 96, 150, 108, 240, 92, 240, 148, 0, 148); poly(c, '#1a3556', 0, 124, 240, 118, 240, 148, 0, 148);
        const cool = { t: '#7fa8ff', l: '#bcd2ff', d: '#3b5aa8' };
        put(c, S.plate, 16, 86, 3); put(c, S.plate, 150, 96, 2); put(c, S.plate, 96, 112, 2, { pal: { t: '#9d7cff', l: '#cdb8ff', d: '#5a3ea8' } });
        put(c, S.fan, 8, 106, 2, { pal: { v: '#ff8fb8', l: '#ffc4da', d: '#a84a72' } }); put(c, S.fan, 206, 98, 2, { pal: { v: '#6fd0ff', l: '#bff0ff', d: '#2a7aa8' } });
      },
      items: [{ s: 'fish', x: 150, y: 40, px: 3, mv: 'swim', v: 4, bob: 3, pal: { c: '#b5503c', h: '#e08a6a' } },
        { s: 'jelly', x: 60, y: 30, px: 2, mv: 'bob', amp: 6, f: 0.6, sway: 1, inv: 1 }, { s: 'jelly', x: 190, y: 55, px: 2, mv: 'bob', amp: 5, f: 0.8, ph: 2, sway: 1, inv: 1 },
        ...school(5, 40, 70, 100, { pal: { c: '#ff9ec7', h: '#ffd0e4' }, v: 5 })],
      fx: [{ t: 'snow', n: 18, c: '#cfe8ff99' }, { t: 'glints', n: 8, y0: 0, y1: 100, c: '#9fe8ffdd' }] },

    /* ===== POLAR SEAS ===== */
    polarHero: { w: 480, h: 245,
      bg(c, w, h) {
        grad(c, 0, 0, w, 76, ['#050f2e', '#12385c', '#2c6f95']);
        poly(c, '#cdeefb', 0, 76, 0, 66, 30, 58, 52, 66, 80, 62, 110, 76); poly(c, '#8fc6e0', 52, 76, 80, 62, 110, 76);
        poly(c, '#d9f3ff', 300, 76, 330, 54, 352, 60, 372, 46, 410, 70, 440, 62, 470, 76); poly(c, '#8fc6e0', 372, 76, 410, 70, 440, 62, 470, 76);
        grad(c, 0, 72, w, h - 72, ['#2a7da3', '#14557c', '#0a2f50']);
        const r = rng(33);
        for (let i = 0; i < 7; i++) { const x = 20 + i * 66 + Math.floor(r() * 20), y = 92 + Math.floor(r() * 90), sz = 14 + Math.floor(r() * 20);
          poly(c, '#e8f9ff', x, y, x + sz, y - 4, x + sz * 1.6, y + 1, x + sz * 1.4, y + 6, x + 2, y + 7); poly(c, '#7fbbd9', x + 2, y + 7, x + sz * 1.4, y + 6, x + sz * 1.2, y + 12, x + 6, y + 11); }
        grain(c, 0, 76, w, 170, 300, ['#8fd6f016', '#cdf3ff18', '#0a2f5030'], 14);
      },
      items: [], fx: [{ t: 'snow', n: 40, c: '#ffffffcc', y1: 245 }, { t: 'glints', n: 12, y0: 80, y1: 150, c: '#d8f6ffcc' }], shear: [76, 245, 1],
      dyn(c, t) {
        const r = rng(71);
        for (let i = 0; i < 46; i++) { const x = Math.floor(r() * 480), y = Math.floor(r() * 60), on = Math.sin(t * 2 + i * 1.7) > -0.2; if (on) rect(c, '#ffffffcc', x, y, 1, 1); }
        for (let x = 0; x < 480; x += 3) {
          const k = 0.5 + 0.5 * Math.sin(x / 37 + t * 0.5), top = 10 + 14 * Math.sin(x / 61 + t * 0.3), hh = 16 + 26 * (0.5 + 0.5 * Math.sin(x / 23 - t * 0.7));
          for (let j = 0; j < 4; j++) rect(c, 'rgba(110,255,190,' + (0.10 + 0.12 * k).toFixed(3) + ')', x, Math.round(top + j * hh / 4), 3, Math.round(hh / 4) + 1);
          rect(c, 'rgba(180,120,255,' + (0.12 * k).toFixed(3) + ')', x, Math.round(top - 7), 3, 7);
        }
      } },
    polarFloe: { w: 144, h: 86,
      bg(c) {
        poly(c, '#f4fcff', 8, 60, 22, 52, 60, 50, 100, 52, 128, 58, 136, 62, 120, 68, 20, 68);
        poly(c, '#9fd4ea', 20, 68, 120, 68, 112, 78, 34, 78); poly(c, '#5aa6cf', 34, 78, 112, 78, 100, 84, 48, 84);
        grain(c, 20, 54, 100, 12, 20, ['#cfeaf8', '#ffffff'], 2);
      },
      items: [{ s: 'penguin', x: 42, y: 24, px: 3, mv: 'bob', amp: 1, f: 0.8 }, { s: 'penguin', x: 82, y: 30, px: 2, mv: 'bob', amp: 1, f: 1.1, ph: 2 }],
      fx: [{ t: 'snow', n: 14, c: '#ffffffdd', y1: 60 }] },
    iceEdge: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, 64, ['#7ab8de', '#bfe3f4', '#e4f6fd']);
        poly(c, '#dff3fb', 150, 64, 168, 44, 186, 50, 204, 36, 232, 58, 240, 64); poly(c, '#9bcbe3', 204, 64, 204, 36, 232, 58, 240, 64);
        grad(c, 0, 62, w, 86, ['#2a96bd', '#1169900', '#0d4468'].map(x => x.length > 7 ? '#116990' : x));
        poly(c, '#f6fdff', 20, 82, 40, 72, 110, 70, 160, 74, 176, 82, 150, 90, 40, 90); poly(c, '#a9d8ec', 40, 90, 150, 90, 138, 100, 56, 100); poly(c, '#5aa6cf', 56, 100, 138, 100, 120, 110, 74, 110);
        grain(c, 30, 74, 140, 14, 30, ['#cfeaf8', '#ffffff'], 4);
        poly(c, '#eaf8ff', 190, 96, 210, 90, 230, 94, 232, 100, 206, 102); poly(c, '#8fc6e0', 206, 102, 232, 100, 224, 108, 210, 108);
      },
      items: [{ s: 'bear', x: 52, y: 52, px: 2, mv: 'bob', amp: 1, f: 0.7 }],
      fx: [{ t: 'snow', n: 30, c: '#ffffffee', y1: 150 }, { t: 'glints', n: 6, y0: 70, y1: 140, c: '#e8fbffdd' }], shear: [112, 148, 1] },
    underice: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#2aa0c8', '#127aa6', '#0a3d68']);
        rays(c, [[30, 20, 60], [100, 26, 70], [180, 18, 50]], 140, '#ffffff16');
        poly(c, '#eaf8ff', 0, 0, 240, 0, 240, 14, 214, 18, 190, 12, 160, 20, 120, 14, 90, 22, 56, 14, 28, 20, 0, 12);
        poly(c, '#8fcfe8', 0, 12, 28, 20, 56, 14, 90, 22, 120, 14, 160, 20, 190, 12, 214, 18, 240, 14, 240, 22, 210, 26, 160, 30, 120, 24, 80, 32, 40, 26, 0, 22);
      },
      items: [...[20, 52, 84, 118, 150, 186, 214].map((x, i) => ({ s: 'algae', x, y: 24 + (i % 3) * 2, px: 2, mv: 'sway', sway: 2, ph: i, inv: 1 })),
        ...Array.from({ length: 28 }, (_, i) => ({ s: 'krill', x: 100 + (i * 17) % 120, y: 60 + (i * 29) % 56, px: 2, mv: 'swim', v: 8 + (i % 3), bob: 2, ph: i })),
        { s: 'fish', x: 60, y: 108, px: 2, mv: 'swim', v: 5, bob: 2, pal: { c: '#dff3ff', h: '#ffffff' } }],
      fx: [{ t: 'bubbles', n: 3, x0: 10, x1: 230, y0: 140, y1: 28 }, { t: 'snow', n: 12, c: '#d4f6ff88' }] },
    shelf: { w: 240, h: 148,
      bg(c, w, h) {
        grad(c, 0, 0, w, h, ['#1380ad', '#0b4f7e', '#072b50']);
        rays(c, [[40, 18, 50], [150, 22, 60]], 120, '#ffffff10');
        poly(c, '#47657d', 0, 118, 50, 112, 130, 120, 200, 110, 240, 116, 240, 148, 0, 148); poly(c, '#35506a', 0, 134, 240, 130, 240, 148, 0, 148);
        grain(c, 0, 112, w, 36, 60, ['#6f8ea5', '#2a4157'], 9);
        put(c, S.sponge, 20, 106, 2); put(c, S.sponge, 90, 112, 2); put(c, S.sponge, 196, 100, 2); put(c, S.star, 60, 124, 2); put(c, S.star, 150, 122, 2, { pal: { o: '#ff5a6e', h: '#ffa0ac' } });
      },
      items: [{ s: 'penguinSwim', x: 40, y: 38, px: 2, mv: 'swim', v: 14, bob: 2, dir: 1 }, { s: 'penguinSwim', x: 120, y: 62, px: 2, mv: 'swim', v: 11, bob: 3, dir: 1, ph: 2 },
        { s: 'seal', x: 150, y: 80, px: 2, mv: 'swim', v: 4, bob: 2 },
        ...school(5, 90, 20, 60, { pal: { c: '#dff3ff', h: '#ffffff' }, v: 5 })],
      fx: [{ t: 'bubbles', n: 6, x0: 10, x1: 230, y0: 130, y1: 10 }, { t: 'snow', n: 10, c: '#d4f6ff77' }], shear: [0, 110, 1] },
    polardeep: { w: 240, h: 148,
      bg(c, w, h) { grad(c, 0, 0, w, h, ['#0a2f5c', '#051c3e', '#02091a']); rays(c, [[90, 14, 40]], 100, '#ffffff08'); },
      items: [{ s: 'narwhal', x: 120, y: 56, px: 2, mv: 'swim', v: 5, bob: 3 },
        { s: 'jelly', x: 30, y: 34, px: 2, mv: 'bob', amp: 7, f: 0.5, sway: 1, inv: 1 }, { s: 'jelly', x: 196, y: 90, px: 3, mv: 'bob', amp: 6, f: 0.7, ph: 1, sway: 1, inv: 1 },
        { s: 'jelly', x: 80, y: 104, px: 2, mv: 'bob', amp: 5, f: 0.6, ph: 3, sway: 1, inv: 1 }],
      fx: [{ t: 'snow', n: 26, c: '#cfe8ffaa' }, { t: 'glints', n: 10, y0: 0, y1: 148, c: '#7fffe0dd' }] },

    /* ===== small icons ===== */
    markreef: { w: 16, h: 16, bg(c) { rect(c, '#ff8fa3', 0, 0, 16, 16); rect(c, '#0b3040', 1, 1, 14, 14); put(c, S.coralA, 2, 4, 1); }, items: [] },
    markpolar: { w: 16, h: 16, bg(c) { rect(c, '#a9e6ff', 0, 0, 16, 16); rect(c, '#0b2a40', 1, 1, 14, 14); put(c, S.icoFlake, 3, 3, 1); }, items: [] },
    ...Object.fromEntries(['Bottle', 'Coral', 'Fish', 'Sun', 'Flake'].map(n => ['ico' + n, { w: 20, h: 20, bg(c) { put(c, S['ico' + n], 0, 0, 2); }, items: [] }])),
  };

  // ---------- runner
  const runners = [];
  function setup(canvas, name) {
    const def = SCENES[name]; if (!def) return;
    canvas.width = def.w; canvas.height = def.h;
    const ctx = canvas.getContext('2d'), base = document.createElement('canvas'); base.width = def.w; base.height = def.h;
    const bctx = base.getContext('2d'); def.bg(bctx, def.w, def.h);
    const live = [], r = rng(def.w * 7 + def.h);
    for (const it of def.items) {
      if (!it.mv && !it.live) put(bctx, S[it.s], it.x, it.y, it.px || 1, it);
      else live.push({ ...it, dir: it.dir === 1 ? 1 : -1, off: r() * 500 });
    }
    const fx = (def.fx || []).map(f => ({ ...f, ps: Array.from({ length: f.n }, () => ({ x: f.x0 !== undefined ? f.x0 + r() * (f.x1 - f.x0) : r() * def.w, o: r() * 600, v: 6 + r() * 8, p: r() * 6, s: 3 + Math.floor(r() * 3), y: (f.y0 || 0) + r() * ((f.y1 || def.h) - (f.y0 || 0)) })) }));
    function draw(t) {
      const w = def.w, h = def.h, heat = +canvas.dataset.heat || 0;
      ctx.clearRect(0, 0, w, h); ctx.drawImage(base, 0, 0);
      if (def.shear) { const [y0, y1, a] = def.shear; for (let y = y0; y < y1; y += 2) { const dx = Math.round(a * Math.sin(y / 6 + t * 0.9)); if (dx) ctx.drawImage(base, 0, y, w, 2, dx, y, w, 2); } }
      if (def.dyn) def.dyn(ctx, t, w, h);
      for (const f of fx) for (const p of f.ps) {
        if (f.t === 'bubbles') { const span = f.y0 - f.y1 + 8, y = f.y0 - ((t * p.v + p.o) % span), x = p.x + Math.round(Math.sin(t * 2 + p.p)), s = p.s, k = '#ace9e6bb';
          rect(ctx, k, x + 1, y, s - 2, 1); rect(ctx, k, x, y + 1, 1, s - 2); rect(ctx, k, x + s - 1, y + 1, 1, s - 2); rect(ctx, k, x + 1, y + s - 1, s - 2, 1); }
        else if (f.t === 'snow') rect(ctx, f.c || '#fff', p.x + Math.sin(t * 0.8 + p.p) * 3, ((t * p.v * 0.5 + p.o) % (f.y1 || h)), p.s > 4 ? 2 : 1, p.s > 4 ? 2 : 1);
        else if (f.t === 'glints' && (t * 1.1 + p.o) % 4 < 0.6) { const k = f.c || '#e4fff2cc', x = Math.round(p.x), y = Math.round(p.y); rect(ctx, k, x - 1, y, 3, 1); rect(ctx, k, x, y - 1, 1, 3); }
      }
      for (const it of live) {
        const s = S[it.s], px = it.px || 1, wd = Math.max(...s.rows.map(q => q.length)) * px; let x = it.x, y = it.y;
        if (it.mv === 'swim') { const span = w + wd + 30, d = (t * (it.v || 8) + it.off) % span; x = it.dir < 0 ? w + 10 - d : -wd - 10 + d; y += Math.sin(t * 1.4 + (it.ph || it.off)) * (it.bob || 0); }
        else if (it.mv === 'bob') y += Math.sin(t * (it.f || 1) + (it.ph || 0)) * (it.amp || 2);
        put(ctx, s, x, y, px, { ...it, t, heat: it.live ? heat : 0, flip: it.mv === 'swim' && it.dir > 0 });
      }
    }
    canvas._draw = draw; draw(0);
    if (!reduced) { const run = { draw, visible: false }; runners.push(run); new IntersectionObserver(([e]) => { run.visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas); }
  }
  for (const canvas of document.querySelectorAll('canvas[data-art]')) {
    const n = canvas.dataset.art; setup(canvas, n === 'mark' ? 'mark' + (window.BIOME_ID || '') : n);
  }
  let last = 0;
  if (runners.length) (function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < 125) return;
    last = now; for (const r of runners) if (r.visible) r.draw(now / 1000);
  })(0);
  window.biomeArt = { S, SCENES };
})();
