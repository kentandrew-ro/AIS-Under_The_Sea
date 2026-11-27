(() => {
  const Q = window.BIOME_QUIZ;
  const NAME = Q ? Q.name : 'Cobalt'; // rename the mascot here
  // Each level opens when its `at` marker scrolls into view and covers the zone you just left.
  // recap = the "dive log" shown first. qs = questions. c = index of the correct answer (from 0).
  const LEVELS = window.BIOME_QUIZ ? window.BIOME_QUIZ.levels : [
    { at: 'twilight', zone: 'Sunlight Zone', recap: [
      'Reefs shelter marine life, support fisheries and soften waves. Hawksbill turtles forage for sponges there.',
      'Ocean heat hit a record for the ninth year in a row, and heat stress can bleach corals.',
      'Litter on streets can wash through drains and rivers to the sea. About one tenth of the ocean is protected or conserved.',
    ], qs: [
      { q: 'Why do corals turn white during bleaching?', a: ['They expel the tiny algae that give them color and food', 'They run out of calcium', 'They absorb too much plankton', 'They are covered by sand'], c: 0, why: 'Heat stress makes corals expel their algae. They can recover if the water cools in time.' },
      { q: 'Ocean heat content hit a record high for how many years in a row?', a: ['3rd year', '5th year', '9th year', '12th year'], c: 2, why: 'It was the ninth year in a row.' },
      { q: 'What happens to seawater pH when the ocean absorbs more carbon dioxide?', a: ['It falls, making shells and skeletons harder to build', 'It rises, making the water saltier', 'It stays the same', 'It turns the water warmer instantly'], c: 0, why: 'Lower pH is called ocean acidification (Target 14.3).' },
      { q: 'How can a bottle dropped far from the coast reach the sea?', a: ['Rain washes it into drains, streams and rivers', 'Fish carry it upstream', 'It floats up from underground', 'It cannot reach the sea'], c: 0, why: 'Runoff carries litter from streets to the ocean, where turtles may feed.' },
      { q: 'About how much of the ocean was officially protected or conserved (April 2026)?', a: ['About 1%', 'About 10%', 'About 30%', 'About 50%'], c: 1, why: '10.01%. Target 14.5 aims to conserve at least 10% of coastal and marine areas.' },
    ] },
    { at: 'midnight', zone: 'Twilight Zone', recap: [
      'Only faint traces of sunlight reach this layer, 200 to 1,000 m down.',
      'Many lanternfish rise at night to eat plankton, then retreat to darker water at dawn to avoid predators.',
      'More than one in three assessed fish stocks were overfished in the 2021 assessment.',
    ], qs: [
      { q: 'What do many lanternfish do at night?', a: ['Dive to the seabed', 'Rise to feed on plankton near the surface', 'Sleep in coral reefs', 'Swim into rivers'], c: 1, why: 'They rise at night to feed, then retreat to darker water at dawn.' },
      { q: 'Why do lanternfish retreat to darker water at dawn?', a: ['To avoid daytime predators', 'To lay eggs on the seabed', 'Because plankton sinks at dawn', 'To escape the cold'], c: 0, why: 'Dark water hides them from predators that hunt by sight.' },
      { q: 'Lanternfish carry energy from plankton to what?', a: ['Coral polyps', 'Larger predators', 'Seabirds only', 'The seabed mud'], c: 1, why: 'They link plankton to bigger animals in the food web.' },
      { q: 'About what share of assessed marine fish stocks were overfished (2021 assessment)?', a: ['About 5%', 'About 15%', 'About 35%', 'About 70%'], c: 2, why: '35.5%, which is more than one in three stocks.' },
      { q: 'Which SDG 14 target is about ending overfishing?', a: ['14.1', '14.4', '14.5', '14.a'], c: 1, why: 'Target 14.4: end overfishing and use science to rebuild fish stocks.' },
    ] },
    { at: 'abyssal', zone: 'Midnight Zone', recap: [
      'Sunlight gives way to flashes made by living things, 1,000 to 4,000 m down.',
      'A female black seadevil uses a lure lit by bacteria to draw prey close.',
      'ROVs let pilots on a ship see the deep with cameras and lights, and collect samples with robotic arms.',
    ], qs: [
      { q: 'What is bioluminescence?', a: ['Light reflected from the Sun', 'Light made by living organisms through a chemical reaction', 'Light from underwater volcanoes', 'Light from ship lamps'], c: 1, why: 'The black seadevil uses a lure lit by bacteria.' },
      { q: 'What makes the black seadevil\'s lure glow?', a: ['Bacteria', 'Sunlight stored in its skin', 'Electric eels', 'Volcanic heat'], c: 0, why: 'The lure is lit by bacteria and draws prey within striking distance.' },
      { q: 'What does ROV stand for?', a: ['Remotely operated vehicle', 'Rapid ocean viewer', 'Reef observation vessel', 'Robotic offshore valve'], c: 0, why: 'Pilots on a ship control it from above.' },
      { q: 'How does an ROV collect samples?', a: ['With robotic arms', 'By dragging a net behind a ship', 'With a magnet', 'It cannot collect samples'], c: 0, why: 'Its cameras and lights observe wildlife and its robotic arms collect samples.' },
      { q: 'Which SDG 14 target is about sharing ocean science and technology?', a: ['14.1', '14.4', '14.a', '14.c'], c: 2, why: 'Target 14.a: build research capacity and share marine technology.' },
    ] },
    { at: 'hadal', zone: 'Abyssal Zone', recap: [
      'Marine snow is a slow rain of dead plankton and tiny waste particles onto a vast, muddy plain.',
      'Sea pigs, a kind of sea cucumber, walk the seafloor feeding on decaying material.',
      'Litter sinks this deep too. The High Seas Treaty came into force on 17 January 2026.',
    ], qs: [
      { q: 'What is marine snow?', a: ['Frozen seawater', 'A slow rain of organic material, like dead plankton', 'Salt crystals', 'Foam from waves'], c: 1, why: 'Sea pigs feed on this decaying material.' },
      { q: 'What kind of animal is a sea pig?', a: ['A sea cucumber', 'A small whale', 'A shrimp', 'A jellyfish'], c: 0, why: 'Sea pigs walk across the flat, sediment-covered floor.' },
      { q: 'Researchers found microplastics in sediment from a 4,800 m abyssal plain near which country?', a: ['Iceland', 'The Philippines', 'Chile', 'Norway'], c: 1, why: 'Litter reaches the deep seafloor too.' },
      { q: 'Which agreement, also called BBNJ, covers waters beyond national borders?', a: ['The Reef Accord', 'The Plastics Pact', 'The High Seas Treaty', 'The Fishing Charter'], c: 2, why: 'It entered into force on 17 January 2026.' },
      { q: 'What does the High Seas Treaty give countries a shared process for?', a: ['Setting protected areas and assessing harmful activities', 'Selling fishing licenses', 'Mapping coral colors', 'Building new ports'], c: 0, why: 'It covers protecting marine biodiversity beyond national borders (Target 14.c).' },
    ] },
    { at: 'deepest', zone: 'Hadal Zone', recap: [
      'The seabed drops into narrow, steep-sided trenches, 6,000 m and deeper.',
      'The amphipod Hirondellea gigas lives near the bottom of the Mariana Trench.',
      'Synthetic particles have been found in trench amphipods, showing how far pollution travels.',
    ], qs: [
      { q: 'Which animal lives near the bottom of the Mariana Trench and has no gas-filled swim bladder?', a: ['Lanternfish', 'Hawksbill turtle', 'Hirondellea gigas (an amphipod)', 'Chromis'], c: 2, why: 'With no gas to compress, its body copes with the pressure.' },
      { q: 'Hadal pressure is roughly how many times the pressure at sea level?', a: ['10 times', '100 times', '1,000 times', '10,000 times'], c: 2, why: 'Its cells function under roughly 1,000 times sea-level pressure.' },
      { q: 'Which trench is home to Hirondellea gigas?', a: ['Mariana Trench', 'Red Sea Trench', 'Baltic Trench', 'Coral Trench'], c: 0, why: 'Challenger Deep, the deepest known part of the ocean, is in the Mariana Trench.' },
      { q: 'What did deep-sea sampling find in trench amphipods?', a: ['Gold flakes', 'Synthetic particles', 'Volcanic glass', 'Pearls'], c: 1, why: 'Studying them helps scientists track how far pollution travels.' },
      { q: 'About how deep does the dive end?', a: ['About 1,000 m', 'About 4,000 m', 'About 6,000 m', 'About 11,000 m'], c: 3, why: 'Near the depth of Challenger Deep, the deepest known part of the ocean.' },
    ] },
  ];
  const KEY = 'ocean-quiz-level' + (window.BIOME_ID ? '-' + window.BIOME_ID : '');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

  // ---- Styles: load the mascot/chat stylesheets on every page, so a biome page never has to list them itself.
  for (const href of ['/sebastian.css', '/sebastian-additions.css', '/sebastian-chat.css', '/sebastian-theme.css']) {
    if (!document.querySelector('link[rel="stylesheet"][href$="' + href + '"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href;
      document.head.append(link);
    }
  }

  // ---- Pixel crab (animated): left half is mirrored. o=outline b=blue l=light d=dark w=white e=pupil
  const half = Q ? Q.sprite : [
  '.oo....oo.', 'obbo..owwo', 'obbo..oweo', '.oo.oooooo', '...obbbbbb', '..obllbbbb',
  '..oblbbbbb', '..obbbbobb', '..obbbbboo', '..obbbbbbd', '...obbbddd', '..o.o.o.o.', '.o.o..o...',
  ];
  const colors = Q ? Q.colors : { o: '#0a1f3d', b: '#3f8cff', l: '#9fd0ff', d: '#2a58c8', w: '#f0fff9', e: '#0a1f3d' };
  const pose = { alt: false, blink: false };
  const crabs = [];
  function rowsNow() {
    const r = half.slice();
    const alt = Q ? Q.alt : { 11: '.o.o.o.o..', 12: '..o..o.o..' };
    const blink = Q ? Q.blink : { 1: 'obbo..oooo', 2: 'obbo..obbo' };
    if (pose.alt) Object.assign(r, alt);       // legs/tentacles shuffle
    if (pose.blink) Object.assign(r, blink);   // eyes shut
    return r;
  }
  function drawCrab(canvas, px = 4) {
    const rows = rowsNow(), w = rows[0].length * 2;
    canvas.width = w * px; canvas.height = rows.length * px;
    const ctx = canvas.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const color = colors[ch]; if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x * px, y * px, px, px);
      ctx.fillRect((w - 1 - x) * px, y * px, px, px);
    }));
  }
  function redrawCrabs() { for (const [c, px] of crabs) drawCrab(c, px); }
  if (!reduced) {
    setInterval(() => { pose.alt = !pose.alt; redrawCrabs(); }, 450);
    (function blink() {
      setTimeout(() => { pose.blink = true; redrawCrabs(); setTimeout(() => { pose.blink = false; redrawCrabs(); blink(); }, 160); }, 2200 + Math.random() * 2500);
    })();
  }

  // ---- State
  let done = 0, open = false, score = 0;
  try { done = Math.min(LEVELS.length, Number(sessionStorage.getItem(KEY)) || 0); } catch {}

  // ---- Mascot
  const mascot = el('button', 'seb-mascot');
  mascot.type = 'button';
  const bubble = el('span', 'seb-bubble');
  bubble.setAttribute('role', 'status');
  const mCanvas = el('canvas');
  mCanvas.setAttribute('aria-hidden', 'true');
  drawCrab(mCanvas); crabs.push([mCanvas, 4]);
  const levelTag = el('span', 'seb-level');
  mascot.append(bubble, mCanvas, levelTag);
  let bubbleTimer;
  function say(text) {
    bubble.textContent = text; bubble.classList.add('show');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 4000);
  }
  function refreshTag() {
    levelTag.textContent = done >= LEVELS.length ? 'DONE ★' : 'QUIZ ' + done + '/' + LEVELS.length;
    mascot.setAttribute('aria-label', NAME + ' the ' + (Q ? Q.species : 'crab') + '. Open chat or quiz menu.');
  }
  mascot.addEventListener('click', openMenu);

  // ---- Popup
  const overlay = el('div', 'seb-overlay'); overlay.hidden = true;
  const card = el('div', 'seb-card');
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-labelledby', 'seb-title');
  const exitBtn = el('button', 'seb-exit', '✕ Exit'); exitBtn.type = 'button';
  exitBtn.setAttribute('aria-label', 'Close ' + NAME);
  const head = el('div', 'seb-head'), hCanvas = el('canvas'), hText = el('div');
  hCanvas.setAttribute('aria-hidden', 'true'); drawCrab(hCanvas); crabs.push([hCanvas, 4]);
  const hSmall = el('p'), hTitle = el('h2'); hTitle.id = 'seb-title';
  hText.append(hSmall, hTitle); head.append(hCanvas, hText);
  const pips = el('div', 'seb-pips'), qText = el('p', 'seb-q'), opts = el('ul', 'seb-opts');
  const msg = el('p', 'seb-msg'); msg.setAttribute('role', 'status');
  const next = el('button', 'seb-next'); next.type = 'button';
  const chatLog = el('div', 'seb-chat-log'); chatLog.setAttribute('role', 'log'); chatLog.setAttribute('aria-live', 'polite');
  const chatHistory = [];

  const CHAT_KEY = 'ocean-chat-history' + (window.BIOME_ID ? '-' + window.BIOME_ID : '');
  function saveChat() {
    try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory.slice(-40))); } catch {}
  }
  function loadChat() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) || '[]');
      if (Array.isArray(saved)) {
        chatHistory.push(...saved.filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string'));
      }
    } catch {}
  }
  loadChat();

  const chatForm = el('form', 'seb-chat-form');
  const chatInput = el('textarea', 'seb-chat-input');
  chatInput.rows = 2; chatInput.maxLength = 700;
  chatInput.placeholder = 'Ask me about the ocean...';
  chatInput.setAttribute('aria-label', 'Your message');
  const chatSend = el('button', 'seb-chat-send', 'Send'); chatSend.type = 'submit';
  chatForm.append(chatInput, chatSend);
  const foot = el('div', 'seb-foot'), quit = el('button', 'seb-quit', 'Back to menu'); quit.type = 'button';
  const clearBtn = el('button', 'seb-chat-clear', 'Clear chat'); clearBtn.type = 'button';
  clearBtn.addEventListener('click', () => {
    chatHistory.length = 0;
    saveChat();
    chatLog.replaceChildren();
    msg.textContent = ''; msg.className = 'seb-msg';
    chatInput.focus();
  });
  foot.append(clearBtn, quit);
  card.append(exitBtn, head, pips, qText, opts, msg, next, foot); overlay.append(card);
  document.body.append(mascot, overlay);
  refreshTag();

  // ---- Colors: tint the popup to match this mascot. The accent is the most common body color in its sprite
  // (outline, pupil and white are skipped, and a very dark body is lightened so it stays readable).
  // The stylesheet derives every shade from --seb-accent, so no colors are hardcoded per biome.
  (function tintToMascot() {
    const parse = hex => {
      const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [n >> 16, (n >> 8) & 255, n & 255];
    };
    const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const count = {};
    for (const row of half) for (const ch of row) if (colors[ch]) count[ch] = (count[ch] || 0) + 1;
    for (const ch of Object.keys(count).sort((a, b) => count[b] - count[a])) {
      let rgb = parse(colors[ch]);
      if (!rgb) continue;
      const l = lum(rgb);
      if (l < 0.12 || l > 0.9) continue;
      if (l < 0.45) {
        const t = (0.45 - l) / (1 - l);
        rgb = rgb.map(v => Math.round(v + (255 - v) * t));
      }
      const hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
      overlay.style.setProperty('--seb-accent', hex);
      mascot.style.setProperty('--seb-accent', hex);
      return;
    }
  })();

  function openMenu() {
    if (open) return;
    open = true; setBackgroundInert(true); overlay.hidden = false;
    showMenu();
  }

  function showMenu() {
    card.classList.remove('seb-chatting');
    hSmall.textContent = 'YOUR OCEAN COMPANION';
    hTitle.textContent = 'Hi! I’m ' + NAME + '.';
    pips.hidden = true; qText.textContent = 'What would you like to do?';
    opts.replaceChildren();
    msg.textContent = 'Choose an option to get started.'; msg.className = 'seb-msg';
    next.hidden = true;
    chatInput.value = '';
    const chatItem = el('li'), quizItem = el('li');
    const chatChoice = el('button', '', 'Chat with ' + NAME);
    const quizChoice = el('button', '', 'Take a Quiz');
    chatChoice.type = quizChoice.type = 'button';
    chatChoice.addEventListener('click', showChat);
    quizChoice.addEventListener('click', () => {
      if (done >= LEVELS.length) { done = 0; save(); refreshTag(); }
      startLevel(done);
    });
    chatItem.append(chatChoice); quizItem.append(quizChoice);
    opts.append(chatItem, quizItem);
    quit.hidden = true;
    chatLog.hidden = true; chatForm.hidden = true;
    chatChoice.focus();
  }

  function showChat() {
    card.classList.add('seb-chatting');
    hSmall.textContent = 'OCEAN CHAT';
    hTitle.textContent = 'Chat with ' + NAME;
    pips.hidden = true; qText.textContent = 'Ask me anything about the ocean and life below water!';
    opts.replaceChildren();
    const logItem = el('li'); logItem.append(chatLog);
    const formItem = el('li'); formItem.append(chatForm);
    opts.append(logItem, formItem);
    chatLog.hidden = false; chatForm.hidden = false;
    chatLog.replaceChildren();
    for (const m of chatHistory) addChatMessage(m.role === 'user' ? 'You' : NAME, m.content);
    chatLog.scrollTop = chatLog.scrollHeight;
    msg.textContent = ''; msg.className = 'seb-msg'; // the status line stays empty (and collapses) unless there is an error
    next.hidden = true; quit.hidden = false;
    chatInput.focus();
  }

  function addChatMessage(who, text) {
    const line = el('p', who === 'You' ? 'seb-chat-user' : 'seb-chat-bot');
    const label = el('strong', '', who + ': ');
    line.append(label, document.createTextNode(text));
    chatLog.append(line);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Dots shown while waiting for the reply
  function showTyping() {
    const line = el('p', 'seb-chat-bot seb-typing');
    const dots = el('span', 'seb-dots');
    dots.append(el('i'), el('i'), el('i'));
    dots.setAttribute('role', 'img');
    dots.setAttribute('aria-label', NAME + ' is typing');
    line.append(el('strong', '', NAME + ': '), dots);
    chatLog.append(line);
    chatLog.scrollTop = chatLog.scrollHeight;
    return line;
  }

  // Types the reply out letter by letter (all at once if the visitor prefers reduced motion)
  function typeChatMessage(who, text) {
    const line = el('p', 'seb-chat-bot is-typing');
    const body = el('span');
    line.append(el('strong', '', who + ': '), body);
    chatLog.append(line);
    const chars = Array.from(text); // Array.from keeps emoji whole
    if (reduced) {
      body.textContent = text; line.classList.remove('is-typing');
      chatLog.scrollTop = chatLog.scrollHeight;
      return Promise.resolve();
    }
    chatLog.setAttribute('aria-busy', 'true'); // screen readers wait for the full message
    return new Promise(resolve => {
      let i = 0;
      const step = Math.max(1, Math.ceil(chars.length / 120)); // long replies type a little faster
      const timer = setInterval(() => {
        i = Math.min(chars.length, i + step);
        body.textContent = chars.slice(0, i).join('');
        chatLog.scrollTop = chatLog.scrollHeight;
        if (i >= chars.length) {
          clearInterval(timer);
          line.classList.remove('is-typing');
          chatLog.removeAttribute('aria-busy');
          resolve();
        }
      }, 18);
    });
  }

  chatForm.addEventListener('submit', async event => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message || chatSend.disabled) return;
    addChatMessage('You', message);
    chatInput.value = '';
    chatSend.disabled = true;
    msg.textContent = ''; msg.className = 'seb-msg';
    const typing = showTyping();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascotName: NAME,
          messages: [...chatHistory.slice(-8), { role: 'user', content: message }]
        })
      });
      const data = await response.json().catch(() => ({ error: 'Chat request failed.' }));
      if (!response.ok) throw new Error(data.error || data.message || 'Chat request failed.');
      const answer = data.answer || 'I could not think of a reply. Try again!';
      typing.remove();
      chatHistory.push({ role: 'user', content: message }, { role: 'assistant', content: answer });
      saveChat();
      await typeChatMessage(NAME, answer);
    } catch (error) {
      typing.remove();
      addChatMessage(NAME, 'Sorry, I could not connect right now. Please try again.');
      msg.textContent = error.message; msg.className = 'seb-msg no';
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  });

  // Enter sends the message, Shift+Enter makes a new line
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      if (!chatSend.disabled) chatForm.requestSubmit();
    }
  });

  function setBackgroundInert(on) {
    for (const n of document.body.children) {
      if (n !== overlay && n.tagName !== 'SCRIPT') n.inert = on;
    }
    const root = document.documentElement;
    if (on) { root.style.paddingRight = innerWidth - root.clientWidth + 'px'; root.style.overflow = 'hidden'; }
    else { root.style.paddingRight = ''; root.style.overflow = ''; }
  }
  const save = () => { try { sessionStorage.setItem(KEY, done); } catch {} };
  function closePopup() {
    overlay.hidden = true; open = false; setBackgroundInert(false); refreshTag();
    mascot.focus({ preventScroll: true });
  }

  // Intro "dive log" screen, then the questions.
  function showIntro(level) {
    card.classList.remove('seb-chatting');
    const L = LEVELS[level];
    pips.hidden = false; quit.hidden = false; chatLog.hidden = true; chatForm.hidden = true;
    hSmall.textContent = 'LEVEL ' + (level + 1) + ' OF ' + LEVELS.length + ' · DIVE LOG';
    hTitle.textContent = NAME + ' recaps the ' + L.zone;
    pips.replaceChildren(...L.qs.map(() => el('i')));
    qText.textContent = 'What you just swam through:';
    opts.replaceChildren(...L.recap.map(t => el('li', 'seb-recap-item', t)));
    msg.textContent = L.qs.length + ' questions. Answer each one correctly to keep diving.'; msg.className = 'seb-msg';
    next.textContent = 'Start quiz'; next.hidden = false; next.onclick = () => showQuestion(level, 0);
    next.focus();
  }

  function showQuestion(level, i) {
    const item = LEVELS[level].qs[i];
    pips.hidden = false; quit.hidden = false; chatLog.hidden = true; chatForm.hidden = true;
    let missed = false;
    hSmall.textContent = 'LEVEL ' + (level + 1) + ' OF ' + LEVELS.length + ' · QUESTION ' + (i + 1) + '/' + LEVELS[level].qs.length;
    pips.replaceChildren(...LEVELS[level].qs.map((_, k) => el('i', k < i ? 'done' : '')));
    qText.textContent = item.q;
    msg.textContent = 'Pick the right answer to keep diving.'; msg.className = 'seb-msg';
    next.hidden = true; opts.replaceChildren();
    item.a.forEach((text, k) => {
      const li = el('li'), b = el('button', '', text); b.type = 'button';
      b.addEventListener('click', () => {
        if (k === item.c) {
          for (const x of opts.querySelectorAll('button')) x.disabled = true;
          b.classList.add('right');
          if (!missed) score++;
          msg.textContent = 'Correct! ' + item.why; msg.className = 'seb-msg ok';
          const last = i === LEVELS[level].qs.length - 1;
          next.textContent = last ? (level === LEVELS.length - 1 ? 'Finish the dive' : 'Continue diving') : 'Next question';
          next.hidden = false; next.focus();
          next.onclick = () => (last ? finishLevel(level) : showQuestion(level, i + 1));
        } else {
          missed = true; b.disabled = true; b.classList.add('wrong');
          msg.textContent = 'Not quite. Try again!'; msg.className = 'seb-msg no';
        }
      });
      li.append(b); opts.append(li);
    });
    opts.querySelector('button').focus();
  }

  function finishLevel(level) {
    done = level + 1; save();
    const total = LEVELS[level].qs.length;
    closePopup();
    say(done >= LEVELS.length
      ? 'You completed all five quizzes! Score: ' + score + '/' + total + '.'
      : 'Level cleared! Score: ' + score + '/' + total + '. Click me to continue anytime.');
  }

  exitBtn.addEventListener('click', closePopup);
  quit.addEventListener('click', showMenu);

  function startLevel(level) {
    open = true; score = 0; setBackgroundInert(true); overlay.hidden = false;
    pips.hidden = false; chatLog.hidden = true; chatForm.hidden = true; quit.hidden = false;
    showIntro(level);
  }

  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closePopup(); return; }
    if (e.key !== 'Tab') return;
    const f = [...card.querySelectorAll('button:not(:disabled):not([hidden])')];
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();