(() => {
  const ink = '#102b3e';

  function rect(ctx, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function shape(ctx, color, ...points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.fill();
  }

  function random(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function grain(ctx, width, height, count, colors, seed = 38) {
    const next = random(seed);
    for (let i = 0; i < count; i++) {
      rect(ctx, colors[i % colors.length], Math.floor(next() * width), Math.floor(next() * height),
        1 + Math.floor(next() * 3), 1 + Math.floor(next() * 2));
    }
  }

  function water(ctx, top, bottom, seed) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 148);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    rect(ctx, gradient, 0, 0, 240, 148);
    grain(ctx, 240, 148, 220, ['#aed6ff16', '#92d9f624', '#b8e7e91a'], seed);
  }

  function bubble(ctx, x, y, size, color = '#ace9e678') {
    rect(ctx, color, x + 1, y, size - 2, 1);
    rect(ctx, color, x, y + 1, 1, size - 2);
    rect(ctx, color, x + size - 1, y + 1, 1, size - 2);
    rect(ctx, color, x + 1, y + size - 1, size - 2, 1);
  }

  // Each symbol occupies one square pixel. Integer scaling keeps the edges hard.
  function sprite(ctx, rows, palette, x, y, pixelSize) {
    for (let row = 0; row < rows.length; row++) {
      for (let column = 0; column < rows[row].length; column++) {
        const color = palette[rows[row][column]];
        if (color) rect(ctx, color, x + column * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  function fish(ctx, x, y, size, color, eye = ink, highlight = '#c4fae1') {
    sprite(ctx, [
      '...h.....c',
      '..hh....cc',
      '.hcccc.ccc',
      'ceccccc...',
      '.ccccccccc',
      '..ccc...cc',
    ], { c: color, e: eye, h: highlight }, x, y, size);
  }

  function surface(ctx) {
    const next = random(78);
    const sky = ctx.createLinearGradient(0, 0, 0, 41);
    sky.addColorStop(0, '#0a344b');
    sky.addColorStop(1, '#428d9e');
    rect(ctx, sky, 0, 0, 480, 41);
    // Low islands and cloud banks on the horizon.
    shape(ctx, '#144d62', 0, 34, 0, 25, 19, 25, 19, 22, 40, 22, 40, 26, 64, 26, 64, 29, 88, 29, 88, 32, 115, 32, 115, 37);
    shape(ctx, '#2f7889', 333, 36, 355, 31, 372, 31, 372, 28, 398, 28, 398, 26, 430, 26, 430, 30, 449, 30, 449, 32, 480, 32, 480, 40, 333, 40);
    for (let i = 0; i < 52; i++) {
      rect(ctx, i % 2 ? '#b7f1df27' : '#d7f9e845', Math.floor(next() * 480), Math.floor(next() * 24), 3 + Math.floor(next() * 32), 1);
    }

    const sea = ctx.createLinearGradient(0, 38, 0, 245);
    sea.addColorStop(0, '#157c8e');
    sea.addColorStop(0.28, '#116374');
    sea.addColorStop(0.74, '#0b435a');
    sea.addColorStop(1, '#0b425800');
    rect(ctx, sea, 0, 37, 480, 208);
    for (let x = -8; x < 480; x += 3) {
      const y = Math.round(35 + 2.4 * Math.sin(x / 24) + 1.3 * Math.sin(x / 8));
      rect(ctx, '#378f9f', x, y, 3, 6);
      rect(ctx, '#a3f2dd', x, y, 3, 1);
      rect(ctx, '#4cc5bf', x, y + 3, 3, 1);
    }
    for (let i = 0; i < 270; i++) {
      const y = 37 + Math.floor(next() ** 2.8 * 145);
      const tint = y < 51 ? ['#65d4c680', '#c1f3e085', '#164e66aa'] : ['#348a9c50', '#4faeaf43', '#1b556766'];
      rect(ctx, tint[i % 3], Math.floor(next() * 480), y, 2 + Math.floor(next() * (y < 55 ? 37 : 19)), 1);
    }
    shape(ctx, '#b3ffdd13', 260, 39, 277, 39, 193, 191, 172, 211);
    shape(ctx, '#b0ffe61c', 299, 36, 319, 36, 268, 175, 241, 216);
    shape(ctx, '#aaffec13', 322, 38, 350, 39, 349, 159, 312, 224);
    shape(ctx, '#92ecec16', 408, 40, 420, 40, 470, 203, 445, 177);
    shape(ctx, '#a4efce0b', 84, 38, 92, 38, 44, 156, 19, 183);
    grain(ctx, 480, 245, 380, ['#b7ffed21', '#c6fffd25', '#1e83983f']);

    for (let i = 0; i < 18; i++) {
      const x = 380 + Math.floor(next() * 101);
      const y = 61 + Math.floor(next() * 38);
      const color = i % 3 ? '#093b517e' : '#89d8d65f';
      fish(ctx, x, y, 1, color, '#0e4a5a', color);
    }
    for (let i = 0; i < 13; i++) {
      const x = 11 + Math.floor(next() * 139);
      const y = 186 + Math.floor(next() * 29);
      fish(ctx, x, y, 1, '#06354a80', '#124755', '#0a42587d');
    }
    for (const [x, y, size] of [[274, 111, 5], [263, 103, 4], [253, 88, 7], [259, 77, 3], [284, 73, 3], [291, 66, 5], [441, 138, 4], [449, 129, 3]]) {
      bubble(ctx, x, y, size);
    }
  }

  function submarine(ctx) {
    const colors = {
      k: '#112d41', m: '#547b85', t: '#9accbd', h: '#ffecaa',
      y: '#ffd068', a: '#ee9b35', b: '#a65a31', r: '#e4765a',
      d: '#254860', c: '#53a3b5', w: '#dbfff2',
    };
    sprite(ctx, [
      '.....................kkkkk',
      '.....................khhhk',
      '.....................kkhkk',
      '......................mk',
      '................kkkkkkkkkk',
      '..............kkhyyyyyyyakk',
      '.............khydddddyyyyaak',
      '............khhydccctdyyyyak',
      '............kyyydtttddyyyyaak',
      '...kk......kkyyyyyyyyyyyyyyaakkkkkkkkk',
      '..kmmk...kkhhhyyyyyyyyyyyyyyyyyyyyyaakkk',
      '..ktmk.kkhyyyyyyyyyyyyyyyyyyyyyyyyyyyyakk',
      '.kttmkkhyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyakk',
      'kttmmmyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyydddkk',
      'kttmmmyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyydccwk',
      '.kttmkaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaydccwk',
      '..kmmkbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaddddk',
      '...kk.kbaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbkkk',
      '.......kkbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbkk',
      '.........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
      '.............kmk..................kmk',
      '.............kmk..................kmk',
      '...........kktmmmmmmmmmmmmmmmmmmmmmtkk',
      '...........kkkkkkkkkkkkkkkkkkkkkkkkkkk',
    ], colors, 4, 4, 3);

    const porthole = [
      '.bbbbb.',
      'bhddddb',
      'bdttcdb',
      'bdcccdb',
      'bdccdmb',
      'bddddmb',
      '.bbbbb.',
    ];
    for (const x of [33, 60, 87]) sprite(ctx, porthole, colors, x, 38, 3);
    rect(ctx, colors.r, 34, 31, 6, 3);
    rect(ctx, colors.t, 28, 55, 3, 3);
    rect(ctx, colors.h, 111, 53, 6, 3);
  }

  function coral(ctx, x, y, size, shade, light) {
    sprite(ctx, [
      '.......l.......',
      '.l.....ls...ll.',
      '.ls....ls...ls.',
      '.ls...lls..ls..',
      '..ls...ls..ls..',
      '..lss..lssls...',
      '...lss.lssls...',
      '....lsslsls...l',
      '.....lsss....ls',
      '.....lsls...ls.',
      '.....lsss..lss.',
      '.....lssslss...',
      '.....lssslss...',
      '.....lslsls....',
      '.....lssss.....',
      '.....lssss.....',
      '....lssssss....',
    ], { s: shade, l: light }, x, y - 17 * size, size);
  }

  function turtle(ctx) {
    sprite(ctx, [
      '...........kk...........',
      '..........kggk..........',
      '..........kGgk......kkk.',
      '.........kggk.....kkgggk',
      '......kkkkkkk....kgGgkgk',
      '....kkhhHHhhkk..kGgggggk',
      '...khHoohHooHhkkgggkkkk.',
      '..kHhOohHHOOHohhggk.....',
      'kkhoohHHooohHoohgk......',
      '.khooHHooOOHooohhk......',
      '..kkOOoooooooOkkk.......',
      '...kggkkkkkkkggggk......',
      '..kGgk.....kgGGgk.......',
      '.kggk.....kgGggk........',
      '..kk.....kgGggk.........',
      '........kgggkk..........',
      '........kkkk............',
    ], {
      k: '#153c43', g: '#589578', G: '#a4d697', h: '#ffdb93',
      H: '#edac64', o: '#cc8149', O: '#a25e44',
    }, 91, 23, 5);
  }

  function reef(ctx) {
    water(ctx, '#198b9b', '#113b51', 7);
    shape(ctx, '#b8f5df33', 45, 0, 64, 0, 20, 105, 3, 125);
    shape(ctx, '#b8f5df29', 111, 0, 127, 0, 99, 118, 81, 141);
    shape(ctx, '#b8f5df27', 162, 0, 179, 0, 174, 126, 157, 140);
    shape(ctx, '#286575', 0, 81, 19, 83, 38, 103, 62, 102, 80, 119, 160, 117, 176, 98, 202, 101, 219, 75, 240, 69, 240, 148, 0, 148);
    shape(ctx, '#194758', 0, 118, 24, 113, 44, 122, 62, 120, 86, 130, 132, 129, 154, 120, 177, 118, 198, 108, 221, 111, 240, 101, 240, 148, 0, 148);
    coral(ctx, 0, 145, 3, '#ba6077', '#f4a38f');
    coral(ctx, 42, 140, 2, '#6e9b80', '#a7be80');
    coral(ctx, 65, 148, 2, '#d88a69', '#ffc099');
    coral(ctx, 164, 145, 2, '#d98b6e', '#ffc99a');
    coral(ctx, 197, 143, 3, '#a75776', '#e48ea3');
    coral(ctx, 222, 148, 2, '#6fa18b', '#a5cd9f');
    const next = random(507);
    for (let i = 0; i < 27; i++) {
      const x = Math.floor(next() * 240);
      const y = Math.floor(125 + next() * 23);
      rect(ctx, ['#2d6a73', '#68718a', '#c08c85', '#a6a587'][i % 4], x, y, 4 + i % 9, 1 + i % 2);
    }
    const school = [[15, 26, 1], [45, 24, 1], [32, 37, 2], [62, 44, 1],
      [11, 52, 1], [40, 57, 1], [59, 62, 2], [26, 73, 1], [51, 81, 1], [11, 85, 1]];
    for (const [x, y, size] of school) fish(ctx, x, y, size, '#6dcfc0');
    turtle(ctx);
  }

  function bottle(ctx, x, y, size) {
    sprite(ctx, [
      '...........bb',
      '..........bBb',
      '.........bBBb',
      '.........bBb.',
      '........gtg..',
      '......ggttg..',
      '....gghttgg..',
      '...ghhtttgg..',
      '..ghhttlLg...',
      '.ghhttlLLg...',
      '.ghhtlLLgg...',
      'ghhtlLLgg....',
      'ghtlLLgg.....',
      'gttLLgg......',
      'gtttgg.......',
      '.gggg........',
    ], {
      b: '#234c6a', B: '#6c9bc3', g: '#316d79', t: '#65b2ae',
      h: '#b3e9d7', l: '#ffe1a1', L: '#d4b783',
    }, x, y, size);
  }

  function debris(ctx) {
    water(ctx, '#17637a', '#103b54', 53);
    shape(ctx, '#69c4c42b', 70, 0, 98, 0, 54, 148, 23, 148);
    shape(ctx, '#82e4da23', 109, 0, 139, 0, 133, 148, 95, 148);
    bottle(ctx, 82, 28, 5);

    sprite(ctx, [
      '.bb...bb.',
      '.bB...bB.',
      '..bb.bb..',
      '..bBbbB..',
      '.bBBtBBb.',
      '.btBBtBb.',
      '.bbtBbbB.',
      '..bbbbbb.',
    ], { b: '#438b94', B: '#6fb8b7', t: '#a8dbcd' }, 174, 67, 3);
    sprite(ctx, [
      'r.....rr.',
      'rrrhhrrr.',
      '.rrrhrr..',
      'rrrrrrrr.',
      'r......r.',
    ], { r: '#c68168', h: '#ffd19a' }, 42, 98, 3);
    for (const [x, y, size] of [[102, 28, 5], [108, 17, 4], [159, 43, 3], [73, 67, 4]]) bubble(ctx, x, y, size);
  }

  function lantern(ctx, x, y, size) {
    sprite(ctx, [
      '...........dd.......d..',
      '.....ddddddccd.....dcd.',
      '...ddhhhhhccccddddcccd.',
      '..dhwhhhhhhhhhccccccd..',
      '.dhdkhhhhhhhhhccccccdd.',
      'ddhddhhhccccccccccccccd',
      '.ddcccccccccccccccdd.cd',
      '..dLtLctLctLctLddd...dd',
      '...ddddddddddd.........',
    ], {
      d: '#182b46', k: '#101e34', c: '#537da2', t: '#73b4bc',
      h: '#90ccd3', w: '#e2fff1', L: '#aaffc9',
    }, x, y, size);
  }

  function lanternfish(ctx) {
    water(ctx, '#193f60', '#101f3a', 382);
    shape(ctx, '#71afd91a', 48, 0, 69, 0, 67, 100, 53, 138);
    shape(ctx, '#93d7fc16', 158, 0, 175, 0, 147, 83, 131, 123);
    lantern(ctx, 153, 22, 2);
    lantern(ctx, 42, 49, 6);
    lantern(ctx, 24, 112, 2);
    lantern(ctx, 178, 110, 1);
  }

  function anglerfish(ctx) {
    water(ctx, '#132140', '#090f25', 81);
    rect(ctx, '#8cfdd617', 39, 19, 60, 58);
    rect(ctx, '#8cfdd623', 47, 27, 44, 42);
    rect(ctx, '#8cfdd638', 55, 35, 28, 26);
    sprite(ctx, [
      '......rrrr................',
      '.....rlllr................',
      '.....r...lr...............',
      '....gGg...lr.....rr.......',
      '....GwG...llr..rrbr.......',
      '....gGg....llrrrbbrr......',
      '...........rrrbbbbbrr...r.',
      '.........rrbbhhhbbbbrr.rb.',
      '.......rrbbhhhhhbdbbbrrbb.',
      '......rbbhhLrhhhhbbdbbbbr.',
      '.....rbbbhrrbbbbbbdbbbbbr.',
      '....rbWbbWbbhbbbbbbdbbbrr.',
      '....rrWrrWrrbbbhbbbbbbbrr.',
      '....rWrr.rWrWbbhHhbbbbrrbr',
      '....r.......rWbbbbbbbbrrr.',
      '....rW..W..rrbbbbbbbbbr...',
      '.....rWWrWWrbbbbbbbbbrr...',
      '......rrbbbbbbbbbbbrr.....',
      '........rrrbbbbbbrr.......',
      '...........rrrrrr.........',
    ], {
      r: '#121528', b: '#5d528c', d: '#77639d', h: '#9f8bc6', H: '#c3a4e3',
      l: '#8eb8c5', L: '#ffce80', g: '#65c5ad', G: '#acffd2',
      w: '#effff2', W: '#f4dbb7',
    }, 42, 23, 6);
  }

  function rov(ctx) {
    water(ctx, '#151f3a', '#0a152a', 127);
    shape(ctx, '#e3edb220', 156, 59, 240, 75, 240, 136, 156, 70);
    shape(ctx, '#a4eacc1c', 153, 78, 240, 111, 240, 148, 152, 88);
    sprite(ctx, [
      'cc',
      '.cc',
      '..cc',
      '...ccc',
      '.....cccc',
      '.......ccc',
      '.........cc',
      '..........cc',
      '...........c',
      '...........c',
    ], { c: '#697b93' }, 91, 0, 4);

    sprite(ctx, [
      '......kkkkkkkkkkkkkkkk',
      '.....kyyyyyyyyyyyyyyyykk',
      '....khyyyyyyyyyyyyyyyyyak',
      '...khakkkkkaakkkkkkkkaak',
      '...kykmmmmmkykttttkkkaak',
      '...kykmtttmkykttmmkkkaak',
      '...kykmtttmkykkkkkcctkaak',
      '...kykmmmmmkykkkttwctkaakWW',
      '...kykkkmkkkykkkttcckyaakWW',
      '...kykkkmkkkykkkkkkkkkaak',
      '...kykkkkkkkykkkkkkkkkaakww',
      '...kyyyyyyyyyyyyyyyyyyyakWW',
      '...kyyyyyyyyyyyyyyyyyyyak',
      '..kakkkkkkkkkkkkkkkkkkaakk',
      'kkkaaaaaaaakkkkkkkkkaaaaak',
      'kkkkkkkkkkkkkkmkkkkkkkkkkk',
      '..............mm',
      '...............tm.......t',
      '................tm.....mmm',
      '.................tmmmmmt.t',
      '..................ttttt',
    ], {
      k: '#101b2b', h: '#ffe6a0', y: '#eec264', a: '#a66d38',
      t: '#8dbfc1', m: '#536b8c', c: '#428fb1', w: '#bff7de', W: '#fff5bf',
    }, 57, 35, 4);
  }

  function seaPig(ctx, x, y, size) {
    sprite(ctx, [
      '....dH.....dH.......',
      '....dh.....dh.......',
      '.....hd....hd.......',
      '.....hddddddhd......',
      '...ddphhHHhhppddd...',
      '..dphHHHhHHHhhpppd..',
      '.dhHHhhHHhhhhhppppd.',
      'dphhhhhhhhhppppppppd',
      'dppppppppppppppppppd',
      '.dhdpdhddhddhdddddd.',
      '..hd..hd..hd..hd....',
      '..hd..hd..hd..hhd...',
      '.hhd.hhd.hhd...dd...',
    ], { d: '#735474', p: '#c47da2', h: '#eda8c3', H: '#ffdad4' }, x, y, size);
  }

  function abyss(ctx) {
    water(ctx, '#1c203a', '#11132d', 84);
    shape(ctx, '#292941', 0, 97, 25, 96, 49, 100, 79, 99, 103, 101, 132, 98, 163, 98, 185, 93, 240, 95, 240, 148, 0, 148);
    shape(ctx, '#342e46', 0, 119, 20, 117, 42, 119, 87, 116, 119, 120, 153, 117, 191, 117, 221, 112, 240, 113, 240, 148, 0, 148);
    const next = random(35);
    for (let i = 0; i < 80; i++) rect(ctx, '#cdbbde38', Math.floor(next() * 240), 99 + Math.floor(next() * 49), 1 + i % 7, 1);
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(next() * 240);
      const y = Math.floor(next() * 111);
      rect(ctx, i % 3 ? '#bfc8d56d' : '#e7dbe2a9', x, y, 1 + i % 2, 1 + i % 3);
    }
    seaPig(ctx, 78, 69, 5);
    seaPig(ctx, 25, 80, 2);
    bottle(ctx, 186, 100, 2);
  }

  function wall(ctx, color, side, widths, step) {
    const edge = side ? ctx.canvas.width : 0;
    const direction = side ? -1 : 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(edge, 0);
    for (let i = 0; i < widths.length; i++) {
      const x = edge + direction * widths[i];
      ctx.lineTo(x, i * step);
      ctx.lineTo(x, (i + 1) * step);
    }
    ctx.lineTo(edge, widths.length * step);
    ctx.fill();
  }

  function trench(ctx) {
    wall(ctx, '#252641', 0, [16, 22, 35, 30, 47, 41, 52, 63, 59, 74, 86, 99, 130, 146], 32);
    wall(ctx, '#27263c', 1, [10, 24, 19, 39, 33, 50, 62, 53, 67, 70, 88, 92, 120, 137], 32);
    wall(ctx, '#111625', 0, [9, 16, 24, 21, 36, 32, 38, 49, 50, 63, 76, 91, 116, 128], 32);
    wall(ctx, '#131523', 1, [6, 11, 11, 20, 20, 30, 42, 39, 49, 51, 70, 79, 103, 119], 32);
    const next = random(105);
    for (let i = 0; i < 140; i++) {
      const y = Math.floor(next() * 410);
      const x = Math.floor(next() * (12 + y * y / 1800));
      rect(ctx, i % 3 ? '#41405b66' : '#60627a47', i % 2 ? x : 380 - x, y, 2 + i % 9, 1 + i % 3);
    }
  }

  function shrimp(ctx, x, y, size) {
    sprite(ctx, [
      '..........dddddd.........',
      '........ddHhHhhHdd.......',
      '......ddHhhHhhHhhhdd.....',
      '....ddHhhHhhHhhhdhHd.....',
      '...dHhhHhhHhhhdd.hHHd....',
      'ddd.dhhhHhhddd...dhHhd...',
      '...dHhhHhdd.......dHHhd..',
      '..d.dhhhddhd......dHHhd..',
      '.d..dddhddhd......dHhhd..',
      '...dhhd.hd.hd....dhhhd...',
      '..dhhd..hd..hd..dhhdd....',
      '..hhd..hd...hdddhhhd.....',
      '..d...d......dhhhhd......',
      '..............dddd.......',
    ], { d: '#856981', h: '#cfaaa7', H: '#ffe0b3' }, x, y, size);
  }

  function amphipod(ctx) {
    water(ctx, '#17182d', '#080a17', 126);
    wall(ctx, '#302c45', 0, [27, 37, 23, 36, 47, 66, 89, 110], 20);
    wall(ctx, '#2b2a41', 1, [19, 27, 26, 31, 42, 71, 89, 110], 20);
    wall(ctx, '#1e2033', 0, [17, 25, 17, 21, 39, 54, 76, 95], 20);
    wall(ctx, '#1d1f31', 1, [11, 15, 19, 24, 29, 49, 76, 98], 20);
    shape(ctx, '#373344', 0, 128, 42, 122, 70, 127, 110, 125, 133, 130, 179, 122, 206, 121, 240, 111, 240, 148, 0, 148);
    const next = random(92);
    for (let i = 0; i < 65; i++) rect(ctx, '#c8b8db48', Math.floor(next() * 240), 128 + Math.floor(next() * 20), 1 + i % 8, 1);
    shrimp(ctx, 54, 46, 5);
    shrimp(ctx, 173, 104, 2);
    shrimp(ctx, 25, 113, 1);
  }

  function mark(ctx) {
    rect(ctx, '#21636e', 0, 0, 16, 16);
    rect(ctx, '#123f50', 1, 1, 14, 14);
    sprite(ctx, [
      '.ww..w',
      'w..ww.',
      '......',
      '.ww..w',
      'w..ww.',
    ], { w: '#81efd1' }, 2, 4, 2);
  }

  function reuse(ctx) {
    sprite(ctx, [
      '..hh..',
      '..tt..',
      '.tttt.',
      '.thht.',
      'thhhtt',
      'twwhht',
      'twthht',
      'thhhtt',
      'tttttt',
    ], { t: '#518e94', h: '#81efd1', w: '#e8ffec' }, 4, 1, 2);
  }

  function cleanup(ctx) {
    sprite(ctx, [
      '......y..',
      '.....yyy.',
      '..ww..y..',
      '.wwwww...',
      'ttttttt..',
      '.tdddt...',
      '.tdhdt...',
      '.tdhdt...',
      '..ttt....',
    ], { t: '#81efd1', w: '#c5ffed', d: '#276475', h: '#49b5a9', y: '#ffd16b' }, 1, 1, 2);
  }

  function seafood(ctx) {
    sprite(ctx, [
      '...hh...t',
      '..htt..tt',
      '.httthtt.',
      'tdttttt..',
      '.tttt.tt.',
      '..tt...tt',
    ], { t: '#81efd1', h: '#c5ffed', d: '#183b52' }, 1, 4, 2);
  }

  function runoff(ctx) {
    sprite(ctx, [
      '....h....',
      '...hht...',
      '...htt...',
      '..httdt..',
      '..thtdt..',
      '...ttt...',
      '.........',
      'mm.mmm.mm',
      'mmmmmmmmm',
    ], { t: '#54b5ba', h: '#a8f6db', d: '#327d91', m: '#81a7c2' }, 1, 1, 2);
  }

  function habitat(ctx) {
    sprite(ctx, [
      '....h...h',
      'h...r..hr',
      'r...r.rr.',
      'rr..rrr..',
      '.rrrr...h',
      '..rrr..hr',
      '...rrrrr.',
      '...rrr...',
      '..rrrrr..',
    ], { r: '#e88894', h: '#ffc5a7' }, 1, 1, 2);
  }

  function energy(ctx) {
    sprite(ctx, [
      '....hyy.',
      '...hyy..',
      '..hyy...',
      '.hyyyyy.',
      '..yyyy..',
      '...yy...',
      '..yy....',
      '..y.....',
    ], { h: '#ffe9a8', y: '#ffd16b' }, 2, 2, 2);
  }

  function cleanupReef(ctx) {
    water(ctx, '#1a7283', '#12364e', 126);
    shape(ctx, '#c8fff11b', 41, 0, 60, 0, 33, 148, 13, 148);
    shape(ctx, '#c8fff114', 105, 0, 127, 0, 132, 148, 108, 148);
    shape(ctx, '#88e3d215', 170, 0, 189, 0, 228, 148, 211, 148);
    shape(ctx, '#183f53', 0, 125, 28, 125, 28, 130, 61, 130, 61, 134, 125, 134,
      125, 128, 190, 128, 190, 124, 240, 124, 240, 148, 0, 148);
    coral(ctx, 1, 142, 2, '#37596c', '#556e7b');
    coral(ctx, 220, 146, 2, '#3f566d', '#5f7483');
  }

  function gameBottle(ctx) { bottle(ctx, 3, 0, 2); }

  function gameFish(ctx) { fish(ctx, 1, 7, 3, '#65ccbd'); }

  const gameSprites = {
    gameSeaweed: {
      colors: { d: '#245b60', g: '#47a585', l: '#9ce1a2' },
      rows: [
        '......ll.....',
        '......lg.....',
        '...l..lg..l..',
        '...lg.lg..lg.',
        '....lg.g..lg.',
        '....lg.lggg..',
        '..l..gglg....',
        '..lg..glg..l.',
        '...lgg.lg.lg.',
        '....lgglggg..',
        '......lggg...',
        '......lgg....',
        '......lgg....',
        '....ddgggd...',
        '...ddggggddd.',
      ],
    },
    gameWrapper: {
      colors: { d: '#7a3e78', m: '#de709b', p: '#ffa5b5', y: '#ffe19c' },
      rows: [
        '...............',
        '...............',
        '...............',
        '............d..',
        '.d.........dd..',
        '.dpd.ddddddmd..',
        '.dmmdmpppmmdd..',
        '..ddmppyyppmd..',
        '...dmmyyypmdd..',
        '..ddmmmyymmdd..',
        '.dmddddddddd...',
        '.dd............',
      ],
    },
    gameCrab: {
      colors: { d: '#824455', r: '#d36a69', l: '#ffb494', e: '#112b40' },
      rows: [
        '...............',
        '...............',
        '.rr..........rr',
        '.lrr........rrl',
        '.l.rr......rr.l',
        '.lrrr......rrrl',
        '..drr..e.e.rrd.',
        '...rr..r.r.rr..',
        '....rrllrrlr...',
        '...drlrrrrlrd..',
        '..d.drrrrrrd.d.',
        '..d..dddddd..d.',
        '....d.d..d.d...',
        '...d.d....d.d..',
      ],
    },
    gameLine: {
      colors: { d: '#326e81', w: '#bdf3e6', o: '#f5aa63', y: '#ffe1a1' },
      rows: [
        '...............',
        '.........oo....',
        '........oyyo...',
        '........oooo...',
        '.......ww......',
        '...wwwwd..www..',
        '..ww..dwwww.ww.',
        '..w..wwd.....w.',
        '..wwwwd...wwww.',
        '......wwwww....',
        '........w......',
        '........w......',
        '........w...w..',
        '........wwwww..',
      ],
    },
    gameBag: {
      colors: { d: '#5b9ead', b: '#a7d3d4', l: '#d7f1e5', t: '#81b7bf' },
      rows: [
        '...............',
        '...ld....dl....',
        '...ld....dl....',
        '...ltd..dtl....',
        '....ltdttl.....',
        '....lbttlb.....',
        '...dbllbbtd....',
        '...dbllbbttd...',
        '...dbblblttd...',
        '..dbblbbtttd...',
        '..dblbbttttd...',
        '..dbbtttdtd....',
        '...ddddddd.....',
      ],
    },
    gameShell: {
      colors: { d: '#976b80', p: '#e1a0a0', l: '#ffe0b8', c: '#c4838e' },
      rows: [
        '...............',
        '...............',
        '...............',
        '......dll......',
        '....dlplpld....',
        '...dlplclpld...',
        '..dlpclclcpld..',
        '..dplclclclpd..',
        '..dcplclclpcd..',
        '...dcplclpcd...',
        '....dcplpcd....',
        '.....ddldd.....',
        '......ddd......',
      ],
    },
    gameCan: {
      colors: { d: '#733e63', r: '#d36282', l: '#ff9ea5', s: '#a9bed0', t: '#dcebe8' },
      rows: [
        '...............',
        '.....ssss......',
        '....stttts.....',
        '...stddtts.....',
        '...stdttts.....',
        '...drllrrd.....',
        '...drllrrd.....',
        '...drtttrd.....',
        '...drtttrd.....',
        '...drlrrrd.....',
        '...drrrrrd.....',
        '....sssss......',
        '.....ttt.......',
      ],
    },
  };

  const drawings = {
    surface, submarine, reef, debris, lanternfish, anglerfish, rov, abyss, trench, amphipod,
    mark, reuse, cleanup, seafood, runoff, habitat, energy, cleanupReef, gameBottle, gameFish,
  };
  for (const canvas of document.querySelectorAll('canvas[data-art]')) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const name = canvas.dataset.art;
    const gameSprite = gameSprites[name];
    if (gameSprite) sprite(ctx, gameSprite.rows, gameSprite.colors, 0, 0, 2);
    else drawings[name](ctx);
  }
})();
