/* Polar Seas page config. Must load BEFORE script.js and sebastian.js. */
window.BIOME_ID = 'polar';

window.BIOME_PALETTE = [
  { depth: 0,    top: [40, 110, 150], bottom: [20, 70, 110] },
  { depth: 100,  top: [20, 80, 120],  bottom: [12, 50, 88] },
  { depth: 800,  top: [10, 40, 80],   bottom: [6, 24, 52] },
  { depth: 4000, top: [4, 12, 30],    bottom: [2, 6, 16] },
];

window.BIOME_QUIZ = {
  id: 'polar', name: 'Floe', species: 'penguin',
  // Left half of the sprite (mirrored). o=outline k=body w=belly y=beak/feet s=scarf e=pupil
  sprite: ['....oooooo', '...okkkkkk', '..okkkkkkk', '..okkwwkkk', '..okkwekkk', '..okkkkkyy', '..osssssss',
           '.okkkwwwww', 'okkkkwwwww', 'okkkkwwwww', '.okkkwwwww', '..okkwwwww', '...yyyy...'],
  colors: { o: '#0c1630', k: '#2b3f66', w: '#f2fbff', y: '#ffa63d', s: '#ff5a6e', e: '#0c1630' },
  alt: { 8: '.okkkwwwww', 9: '.okkkwwwww', 12: '..yyyy....' },            // waddle
  blink: { 3: '..okkkkkkk', 4: '..okkkkkkk' },
  levels: [
    { at: 'under-ice', zone: 'Sea Ice', recap: [
      'Sea ice forms when the ocean surface freezes, at about −1.8 °C.',
      'Bright ice reflects sunlight and dark open water absorbs it, so less ice means more warming.',
      'Arctic September sea ice is shrinking by roughly 13% per decade, and polar bears hunt seals from it.',
    ], qs: [
      { q: 'At about what temperature does seawater freeze?', a: ['0 °C', '−1.8 °C', '−20 °C', '−40 °C'], c: 1, why: 'Salt lowers the freezing point a little below 0 °C.' },
      { q: 'Why does losing sea ice speed up warming?', a: ['Ice makes the air hotter', 'Salt melts the rocks', 'Dark open water absorbs more sunlight', 'Fish give off heat'], c: 2, why: 'Bright ice reflects sunlight, while dark water absorbs it.' },
      { q: 'Arctic September sea ice has been shrinking by roughly how much per decade?', a: ['About 1%', 'About 3%', 'About 60%', 'About 13%'], c: 3, why: 'NOAA’s Arctic Report Card: roughly 13% per decade versus the 1981–2010 average.' },
      { q: 'Does melting floating sea ice raise sea level much?', a: ['Hardly, because it already floats', 'Yes, by metres', 'Yes, more than land ice', 'Only in winter'], c: 0, why: 'Ice on land, in ice sheets and glaciers, is what adds water to the ocean.' },
    ] },
    { at: 'shelf', zone: 'Under the Ice', recap: [
      'Algae grow on the underside of sea ice.',
      'Antarctic krill graze on algae in huge swarms and feed whales, seals, fish and penguins.',
      'Antarctic icefish have almost clear blood with no hemoglobin.',
    ], qs: [
      { q: 'What grows on the underside of sea ice?', a: ['Coral', 'Algae', 'Seagrass', 'Mangroves'], c: 1, why: 'Ice algae feed krill.' },
      { q: 'Which animals eat krill?', a: ['Only polar bears', 'Nothing eats them', 'Whales, seals, fish and penguins', 'Only sharks'], c: 2, why: 'Krill are a key link in the food web.' },
      { q: 'What is unusual about Antarctic icefish blood?', a: ['It is nearly clear, with no hemoglobin', 'It is bright green', 'It is frozen solid', 'It glows in the dark'], c: 0, why: 'Cold water holds lots of oxygen, so they can get by without hemoglobin.' },
      { q: 'What does CCAMLR help manage?', a: ['Cruise ship menus', 'Arctic shipping lanes', 'Coral reefs', 'Antarctic marine living resources, like krill'], c: 3, why: 'It is the Commission for the Conservation of Antarctic Marine Living Resources (Target 14.4).' },
    ] },
    { at: 'polar-deep', zone: 'Shelf Waters', recap: [
      'Emperor penguins are the only penguins that breed during the Antarctic winter.',
      'They can dive deeper than 500 m, while leopard seals lie in wait at the ice edge.',
      'In 2016 CCAMLR members agreed to a marine protected area in the Ross Sea region.',
    ], qs: [
      { q: 'In which season do emperor penguins breed?', a: ['Summer', 'Antarctic winter', 'Spring only', 'They never breed'], c: 1, why: 'They are the only penguins that breed in the Antarctic winter.' },
      { q: 'How deep can emperor penguins dive?', a: ['About 5 m', 'About 20 m', 'Deeper than 500 m', 'They cannot dive'], c: 2, why: 'They dive deep for fish and krill.' },
      { q: 'Where did CCAMLR members agree to a large marine protected area in 2016?', a: ['The Ross Sea region', 'The Caribbean', 'The Baltic Sea', 'The Red Sea'], c: 0, why: 'It protects a large part of the Southern Ocean (Target 14.5).' },
      { q: 'Which predator waits at the ice edge to hunt penguins?', a: ['Walrus', 'Manatee', 'Narwhal', 'Leopard seal'], c: 3, why: 'Leopard seals hunt penguins and other seals.' },
    ] },
    { at: 'deepest', zone: 'Polar Deep', recap: [
      'Narwhals live in the Arctic and can dive deeper than 1,000 m.',
      'Their spiral “horn” is really a long tooth.',
      'The Antarctic Treaty, signed in 1959, reserves Antarctica for peace and science.',
    ], qs: [
      { q: 'What is a narwhal’s long tusk?', a: ['A tooth', 'A horn of bone', 'A fin', 'A spine'], c: 0, why: 'The tusk is a tooth that grows in a spiral.' },
      { q: 'Which pole do narwhals live near?', a: ['The Antarctic', 'Both equally', 'The Arctic', 'Neither'], c: 2, why: 'Narwhals live in the Arctic.' },
      { q: 'When was the Antarctic Treaty signed?', a: ['1859', '1959', '1989', '2019'], c: 1, why: 'It reserves Antarctica for peace and science.' },
      { q: 'What is the most direct way to slow sea-ice loss?', a: ['Feed the penguins', 'Move the ice south', 'Catch more krill', 'Cut greenhouse-gas emissions'], c: 3, why: 'Warming is the main driver of ice loss.' },
    ] },
  ],
};

// ---- Food chain explorer
(() => {
  const links = [...document.querySelectorAll('.web-chain button')], panel = document.getElementById('web-panel');
  if (!links.length || !panel) return;
  const info = [
    ['Ice algae', 'Eats: sunlight and nutrients.', 'Eaten by: krill.', 'Algae growing on the underside of sea ice use the little light that passes through. If the ice shrinks, this food source shrinks too.'],
    ['Antarctic krill', 'Eats: ice algae and drifting plankton.', 'Eaten by: penguins, seals, fish and whales.', 'Krill swarms can be huge. They carry the energy of tiny algae up to much bigger animals.'],
    ['Penguin', 'Eats: krill and fish.', 'Eaten by: leopard seals and orcas.', 'Emperor penguins breed on sea ice, so when and where it forms matters to them.'],
    ['Leopard seal', 'Eats: penguins, seals and krill.', 'Eaten by: very little.', 'Top predators depend on every link below them. Protect the base of the chain and the whole chain benefits.'],
  ];
  function show(i) {
    links.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    const [name, eats, eaten, note] = info[i];
    panel.innerHTML = '<h4></h4><p class="web-line"></p><p class="web-line"></p><p></p>';
    panel.children[0].textContent = name; panel.children[1].textContent = eats; panel.children[2].textContent = eaten; panel.children[3].textContent = note;
  }
  links.forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
})();
