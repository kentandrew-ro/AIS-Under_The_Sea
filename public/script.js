(() => {
  const root = document.documentElement;
  const header = document.querySelector('.topbar');
  const depthValue = document.getElementById('depth-value');
  const zoneValue = document.getElementById('zone-value');
  const menu = document.querySelector('.zone-menu');
  const menuButton = menu.querySelector('summary');
  const surface = document.getElementById('surface');
  const deepest = document.getElementById('deepest');
  const markers = [...document.querySelectorAll('[data-depth]')];
  const zones = [...document.querySelectorAll('[data-zone]')];
  const zoneLinks = [...document.querySelectorAll('[data-zone-link]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const metres = new Intl.NumberFormat('en');

  // Each boundary has a matching color stop. Both gradients interpolate by depth.
  const palette = [
    { depth: 0, top: [8, 96, 113], bottom: [11, 56, 76] },
    { depth: 200, top: [14, 66, 94], bottom: [11, 42, 70] },
    { depth: 1000, top: [21, 43, 79], bottom: [11, 25, 53] },
    { depth: 4000, top: [26, 28, 58], bottom: [13, 17, 37] },
    { depth: 6000, top: [20, 19, 39], bottom: [9, 11, 23] },
    { depth: 11000, top: [9, 11, 22], bottom: [4, 6, 14] },
  ];
  let anchors = [];
  let activeZone;
  let shownMetres;
  let frame = 0;

  function scrollPosition(element) {
    if (element === surface) return 0;
    return Math.max(0, Math.round(element.getBoundingClientRect().top + window.scrollY - header.offsetHeight));
  }

  function measure() {
    anchors = markers.map(element => ({
      depth: Number(element.dataset.depth),
      position: scrollPosition(element),
    }));
    scheduleUpdate();
  }

  function readDepth(position) {
    const nextIndex = anchors.findIndex(anchor => anchor.position > position);
    if (nextIndex === -1) return anchors.at(-1).depth;
    if (nextIndex === 0) return 0;
    const start = anchors[nextIndex - 1];
    const end = anchors[nextIndex];
    const fraction = (position - start.position) / (end.position - start.position);
    return start.depth + (end.depth - start.depth) * fraction;
  }

  function paintWater(depth) {
    const endIndex = palette.findIndex(stop => stop.depth > depth);
    const end = endIndex === -1 ? palette.at(-1) : palette[endIndex];
    const start = endIndex === -1 ? end : palette[endIndex - 1];
    const fraction = start === end ? 0 : (depth - start.depth) / (end.depth - start.depth);

    for (const edge of ['top', 'bottom']) {
      const color = start[edge].map((channel, index) =>
        Math.round(channel + (end[edge][index] - channel) * fraction));
      root.style.setProperty('--water-' + edge, 'rgb(' + color.join(', ') + ')');
    }
  }

  function update() {
    frame = 0;
    const position = Math.round(Math.max(0, window.scrollY));
    const depth = readDepth(position);
    const rounded = Math.floor(depth);
    const zoneIndex = zones.findLastIndex(zone => Number(zone.dataset.depth) <= depth);
    const zone = zones[zoneIndex];

    if (rounded !== shownMetres) {
      depthValue.textContent = metres.format(rounded) + ' m';
      shownMetres = rounded;
    }
    if (zone !== activeZone) {
      zoneValue.textContent = zone.dataset.zone + ' Zone';
      for (const link of zoneLinks) {
        if (link.hash === '#' + zone.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      activeZone = zone;
    }
    // The track uses equally spaced zone markers and a final stretch through the trench.
    const nextDepth = Number(zones[zoneIndex + 1]?.dataset.depth ?? deepest.dataset.depth);
    const zoneFraction = (depth - Number(zone.dataset.depth)) / (nextDepth - Number(zone.dataset.depth));
    const progress = (zoneIndex + zoneFraction) / zones.length;
    root.style.setProperty('--progress', progress);
    paintWater(depth);
    document.body.classList.toggle('at-bottom', depth === Number(deepest.dataset.depth));
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function jump(target, smooth, focus) {
    if (focus) target.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
    window.scrollTo({ top: scrollPosition(target), behavior: smooth ? 'smooth' : 'instant' });
    scheduleUpdate();
  }

  function followHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (target) jump(target, false, false);
    else if (!location.hash) jump(surface, false, false);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-jump]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        event.preventDefault();
        menu.open = false;
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        jump(target, !reducedMotion.matches, true);
      }
    } else if (!menu.contains(event.target)) {
      menu.open = false;
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menuButton.focus();
    }
  });

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('hashchange', followHash);
  new ResizeObserver(measure).observe(document.body);
  // Expanding content can move later landmarks even when the viewport is unchanged.
  document.addEventListener('toggle', event => {
    if (event.target.matches('.field-note, .cleanup-game')) measure();
  }, true);
  measure();
  if (location.hash) document.fonts.ready.then(followHash);
})();
