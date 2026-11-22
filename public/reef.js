/* Coral Reef page config. Must load BEFORE script.js and sebastian.js. */
window.BIOME_ID = 'reef';

// Water colors by depth (metres): [r, g, b] for the top and bottom of the screen.
window.BIOME_PALETTE = [
  { depth: 0,   top: [18, 168, 170], bottom: [10, 112, 134] },
  { depth: 10,  top: [12, 132, 164], bottom: [9, 86, 126] },
  { depth: 30,  top: [10, 90, 140],  bottom: [8, 58, 106] },
  { depth: 150, top: [7, 40, 82],    bottom: [4, 24, 56] },
];

// Mascot + quiz. Each level opens when its `at` element scrolls into view and covers the zone before it.
window.BIOME_QUIZ = {
  id: 'reef', name: 'Ollie', species: 'octopus',
  // Left half of the sprite (mirrored). o=outline p=body l=light d=dark k=blush w=eye white e=pupil
  sprite: ['....oooooo', '..ooppppll', '.oppppppll', '.opwwppppp', '.opwewpppp', '.opppppkkp', '.oppppppdd',
           '..opppdddd', '.opp.pppdo', 'opp..opp.o', 'opp.o.opp.', '.opp.o.opp', '..oo...oo.'],
  colors: { o: '#3b1766', p: '#d27dff', l: '#ecc4ff', d: '#9a4fd6', k: '#ff9ec7', w: '#f0fff9', e: '#2a0a40' },
  alt: { 9: 'opp.opp..o', 10: '.opp.o.opp', 11: 'opp.o.opp..', 12: '.oo...oo..' },   // tentacles wiggle
  blink: { 3: '.opppppppp', 4: '.opooopppp' },
  levels: [
    { at: 'crest', zone: 'Lagoon', recap: [
      'Mangrove roots and seagrass meadows shelter young fish, crabs and shrimp.',
      'Reef-building corals are tiny animals called polyps. Their skeletons build the reef.',
      'About a quarter of all marine species live in, on or around coral reefs.',
    ], qs: [
      { q: 'What are reef-building corals?', a: ['Underwater plants', 'Tiny animals called polyps', 'Pieces of volcanic rock', 'Large sponges'], c: 1, why: 'Thousands of polyps, each with a hard skeleton, grow into a reef.' },
      { q: 'What do mangroves and seagrass do for young fish?', a: ['They give shelter while the fish grow', 'They block all sunlight', 'They make the water colder', 'They eat the fish'], c: 0, why: 'Nurseries by the shore protect young fish before they move to the reef.' },
      { q: 'About what share of marine species live in or around coral reefs?', a: ['About 1%', 'About 10%', 'About 25%', 'About 75%'], c: 2, why: 'About one quarter, according to NOAA.' },
      { q: 'Which SDG 14 target is about protecting and restoring marine and coastal ecosystems?', a: ['14.1', '14.6', '14.4', '14.2'], c: 3, why: 'Target 14.2: protect, manage and restore marine and coastal ecosystems.' },
    ] },
    { at: 'slope', zone: 'Reef Crest', recap: [
      'The crest faces the waves head on.',
      'Healthy reefs can absorb up to 97% of a wave’s energy and protect shorelines.',
      'Parrotfish scrape algae off coral, and their waste turns into sand.',
    ], qs: [
      { q: 'How much wave energy can healthy reefs absorb?', a: ['About 3%', 'Up to 97%', 'About 50% at most', 'None at all'], c: 1, why: 'Reefs work like natural seawalls for the coast.' },
      { q: 'Why are parrotfish good for reefs?', a: ['They eat the coral', 'They build the reef skeleton', 'They scrape off algae that could smother coral', 'They make waves smaller'], c: 2, why: 'Grazing keeps algae from smothering the coral.' },
      { q: 'What does parrotfish waste turn into?', a: ['Salt', 'Plastic', 'Coral', 'Sand'], c: 3, why: 'Parrotfish digest bits of reef and produce fine sand.' },
      { q: 'Bleaching can start when water stays how much warmer than the usual summer high?', a: ['About 10 °C', 'About 1–2 °C', 'About 20 °C', 'It only happens if water freezes'], c: 1, why: 'A small rise lasting weeks can make corals expel their algae.' },
    ] },
    { at: 'mesophotic', zone: 'Reef Slope', recap: [
      'Most coral and fish crowd the sunlit slope. Green sea turtles graze on seagrass and algae.',
      'The fourth global bleaching event hit about 84% of reef area (2023–2025).',
      'Cooler water and fewer local pressures help reefs recover.',
    ], qs: [
      { q: 'The fourth global bleaching event hit about what share of reef area?', a: ['About 8%', 'About 24%', 'About 54%', 'About 84%'], c: 3, why: 'NOAA reported about 84% by April 2025, the largest event on record.' },
      { q: 'What do adult green sea turtles mostly graze on?', a: ['Seagrass and algae', 'Coral polyps', 'Lanternfish', 'Marine snow'], c: 0, why: 'They graze seagrass beds and algae around reefs.' },
      { q: 'What happens to seawater pH when it absorbs more carbon dioxide?', a: ['It rises', 'It falls', 'It stays the same', 'It freezes'], c: 1, why: 'Lower pH makes it harder for corals to build skeletons (Target 14.3).' },
      { q: 'What helps a reef recover after heat stress?', a: ['More boats and anchors', 'Painting the coral', 'Cooler water and fewer local pressures like runoff', 'Nothing can help'], c: 2, why: 'Fewer local pressures give corals a better chance to recover.' },
    ] },
    { at: 'deepest', zone: 'Mesophotic Reef', recap: [
      '“Mesophotic” means middle light. This dim reef lies about 30–150 m down.',
      'Plate corals spread wide to catch the little sunlight that reaches them.',
      'Deeper water can be cooler, but these reefs still face fishing, pollution and warming.',
    ], qs: [
      { q: 'What does “mesophotic” mean?', a: ['Middle light', 'No light at all', 'Very hot water', 'Very shallow reef'], c: 0, why: 'It refers to the dim light between bright shallows and the dark deep.' },
      { q: 'Why do plate corals grow wide and flat?', a: ['To store heat', 'To catch scarce sunlight', 'To scare predators', 'To hide from waves'], c: 1, why: 'A wide surface collects more of the faint light.' },
      { q: 'Why might deeper reefs act as a refuge from heat?', a: ['They have no animals', 'Humans cannot reach them', 'Water can be cooler than at the surface', 'They are made of stone'], c: 2, why: 'Cooler water may shelter species when the shallows overheat.' },
      { q: 'Which target aims to conserve at least 10% of coastal and marine areas?', a: ['14.5', '14.1', '14.4', '14.b'], c: 0, why: 'Target 14.5, guided by science and law.' },
    ] },
  ],
};

// ---- Bleaching lab: the slider changes how washed-out the live corals look.
(() => {
  const input = document.getElementById('heat'), canvas = document.querySelector('canvas[data-art="bleach"]');
  if (!input || !canvas) return;
  const steps = [
    { name: 'Normal', heat: 0, msg: 'Usual summer temperature. Corals keep the colorful algae that feed them, and thrive.' },
    { name: '+1 °C', heat: 0.35, msg: 'Stress begins. About 1–2 °C above the usual summer high, held for weeks, can trigger bleaching.' },
    { name: '+2 °C', heat: 0.8, msg: 'Corals expel their algae and turn white. They are still alive, but starving. They can recover if the water cools soon enough.' },
    { name: '+3 °C', heat: 1, msg: 'Long, intense heat can kill corals. Dead reef is quickly covered by algae and shelters far fewer fish.' },
  ];
  const out = document.getElementById('heat-readout'), msg = document.getElementById('heat-msg');
  function update() {
    const s = steps[input.value];
    canvas.dataset.heat = s.heat; out.textContent = s.name; msg.textContent = s.msg;
    window.redrawPixelArt?.(canvas);   // repaint the corals now (pixel-art.js); animation re-reads it
  }
  input.addEventListener('input', update); update();
})();
