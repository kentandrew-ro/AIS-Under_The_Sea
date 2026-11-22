/* Keeps the pixel art crisp and un-warped.
   A canvas that is shown at e.g. 2.37x makes some art pixels 2 screen pixels wide and others 3, so shapes look
   wobbly (worst on big sprites and anything that moves). This sets each picture to a WHOLE-number scale
   (2x, 3x, 4x...) and keeps the pixels square. Small screens fall back to the normal smooth sizing. */
(() => {
  const SNAP_FROM = 1.85;          // below this ratio a whole-number size would leave big gaps or crop too much
  const reset = canvas => {
    for (const p of ['width', 'height', 'maxWidth', 'marginLeft', 'marginRight', 'left', 'top', 'inset', 'transform']) canvas.style[p] = '';
  };

  // Pictures inside a frame (the dive scenes and the hero picture beside the title): centered, whole-number size.
  function contain(canvas) {
    const box = canvas.parentElement, bw = box.clientWidth, ratio = bw / canvas.width;
    if (!bw || ratio < SNAP_FROM) return reset(canvas);
    const k = Math.floor(ratio + 0.15), w = canvas.width * k;
    canvas.style.maxWidth = 'none'; canvas.style.width = w + 'px'; canvas.style.height = canvas.height * k + 'px';
    canvas.style.marginRight = ''; canvas.style.marginLeft = w <= bw ? 'auto' : (bw - w) / 2 + 'px';   // frame clips any overhang
    if (w <= bw) canvas.style.marginRight = 'auto';
  }

  // Full-bleed backgrounds (the surface art): cover the area at a whole-number scale, anchored to the top.
  function cover(canvas) {
    const box = canvas.parentElement, bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / canvas.width, bh / canvas.height), k = Math.ceil(s - 0.001);
    const scale = k / s <= 1.15 ? k : s;                // a whole number unless that would crop too much
    canvas.style.maxWidth = 'none'; canvas.style.inset = 'auto'; canvas.style.left = '50%'; canvas.style.top = '0';
    canvas.style.width = canvas.width * scale + 'px'; canvas.style.height = canvas.height * scale + 'px';
    canvas.style.transform = 'translateX(-50%)';
  }

  const jobs = [];
  for (const c of document.querySelectorAll('canvas[data-art]')) {
    if (c.matches('.surface-art')) jobs.push([c, cover]);
    else if (c.matches('.scene canvas, .hero-vehicle canvas')) jobs.push([c, contain]);
  }
  if (!jobs.length) return;
  const fit = () => jobs.forEach(([c, f]) => f(c));
  fit();
  addEventListener('load', fit);
  addEventListener('resize', fit);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(fit);
    new Set(jobs.map(([c]) => c.parentElement)).forEach(p => ro.observe(p));
  }
})();
