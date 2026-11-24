// THE SCORE — single source of truth for music AND picture.
// "Guía para no morir en el apocalipsis de los hongos — PARTE 1" (TikTok, 9:16, 60 s, en español)
// Kevin, un adolescente que lo hace TODO mal, rompe 5 reglas de supervivencia; el narrador (los textos)
// le insulta con cariño; Lupe enseña cómo se hace bien. Personajes, zombis y mundo: todo original.
// 120 BPM -> 1 compás = 2 s. Cada regla dura 5 compases: cartel, la cagada, el golpe, el roast, el ✓.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.5 });
  const { T, BEAT } = clock;
  const DURATION = T(29, 3); // 60.0 s

  // ---------- secciones ----------
  const S = {
    hook: [0, T(2)],
    title: [T(2), T(3)],
    r1: [T(3), T(8)],
    r2: [T(8), T(13)],
    r3: [T(13), T(18)],
    r4: [T(18), T(23)],
    r5: [T(23), T(27)],
    outro: [T(27), DURATION],
  };

  // ---------- armonía: re menor "de miedo pero gracioso" ----------
  const { chords, chordAt } = makeChords(clock, {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' },
    A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  }, Array.from({ length: 30 }, (_, b) => [b, 0, 4, ['Dm', 'Bb', 'Gm', 'A'][b % 4]]));

  // ---------- el gancho (pizzicato sigiloso), 8 corcheas por compás: [nota, corchea, duración] ----------
  const HOOK = {
    Dm: [['D5', 0, 1], ['F5', 2, 1], ['A5', 3, 1], ['G#5', 5, 1], ['A5', 6, 2]],
    Bb: [['F5', 0, 1], ['D5', 2, 1], ['Bb4', 3, 1], ['D5', 5, 1], ['F5', 6, 2]],
    Gm: [['G5', 0, 1], ['Bb5', 2, 1], ['A5', 3, 1], ['G5', 4, 1], ['F5', 5, 1], ['E5', 6, 2]],
    A: [['C#5', 0, 1], ['E5', 2, 1], ['A4', 3, 1], ['C#5', 4, 1], ['E5', 5, 1], ['G5', 6, 1], ['A5', 7, 1]],
  };
  const hookBars = (from, to, transpose = 0) => {
    const out = [];
    for (let b = from; b < to; b++) out.push(...placeBar(clock, HOOK[['Dm', 'Bb', 'Gm', 'A'][b % 4]], b, transpose));
    return out;
  };

  // ---------- eventos (el guion) ----------
  const ev = {
    // gancho
    hookHit: T(0), kevin: T(1), hand: T(1, 2.5),
    // título: una palabra por corchea, la pegatina PARTE 1 en el tiempo 3
    title: T(2), parte1: T(2, 3),
    // regla 1: cero ruido
    r1: T(3), clank: T(5), r1roast: T(6), r1ok: T(7),
    // regla 2: la máscara
    r2: T(8), pizza: T(8, 1.5), inhale: T(9), sneeze: T(10), r2roast: T(11), r2ok: T(12),
    // regla 3: si te muerden, avisa
    r3: T(13), ask: T(13, 1.5), excuse: T(14, 1.5), cat: T(15), r3roast: T(16), r3ok: T(17),
    // regla 4: el Coliflor
    r4: T(18), selfieUp: T(19, 1), flash: T(20), scream: T(20, 1.5), r4roast: T(21), r4ok: T(22), throw: T(22, 0.5), smash: T(22, 2),
    // regla 5: nunca solo
    r5: T(23), hola: T(23, 1.5), door: T(24), r5roast: T(25), r5ok: T(26),
    // final
    outro: T(27), follow: T(28), end: T(29),
  };
  const rules = [
    { n: 1, t: ev.r1, end: T(8), title: 'CERO RUIDO' },
    { n: 2, t: ev.r2, end: T(13), title: 'PONTE LA MÁSCARA' },
    { n: 3, t: ev.r3, end: T(18), title: 'SI TE MUERDEN, AVISA' },
    { n: 4, t: ev.r4, end: T(23), title: 'SI HACE CLIC-CLIC, NI RESPIRES' },
    { n: 5, t: ev.r5, end: T(27), title: 'NUNCA VAYAS SOLO' },
  ];

  // el título, palabra a palabra (cada palabra = un golpe de tom que sube)
  const titleWords = ['GUÍA', 'PARA', 'NO', 'MORIR', 'COMO', 'UN', 'TONTO'].map((w, i) => ({ w, t: T(2, i * 0.5), midi: m('D3') + [0, 3, 5, 7, 10, 12, 15][i] }));

  // la música del móvil de Kevin (regla 1): cada nota del gancho sale volando de su móvil como una ♪
  const phoneNotes = hookBars(3, 5, 0).map((n, i) => ({ ...n, i }));
  // las cabezas de los zombis que se giran tras el CLANK (una por corchea)
  const turns = [T(5, 0.5), T(5, 1), T(5, 1.5)];
  // las setas que le salen a Kevin al estornudar (cada una, una nota más aguda)
  const pops = [0, 0.5, 1].map((b, i) => ({ t: T(10, b), midi: m('A5') + [0, 4, 7][i] }));
  // los clics del Coliflor: ráfagas de 3 en fusas mientras busca (compases 18, 19 y 22)
  const clicks = [];
  for (const bar of [18, 19, 22]) for (let beat = 0; beat < 4; beat++) {
    if (bar === 19 && beat >= 2) continue; // se calla cuando Kevin saca el móvil
    for (let k = 0; k < 3; k++) clicks.push(T(bar, beat + 0.5 + k * 0.125));
  }
  // los ojos en la oscuridad (regla 5): un par por corchea
  const eyes = Array.from({ length: 8 }, (_, i) => ({ t: T(24, 0.5 + i * 0.5), i, midi: m('D5') - i }));

  // ---------- diálogo en bocadillos (las voces son balbuceos de dibujos animados) ----------
  const lines = [
    { t: T(0, 2), end: T(0, 3.8), who: 'kevin', text: '¡QUÉ PAZ!', syl: 4 },
    { t: ev.pizza, end: T(8, 3.8), who: 'kevin', text: '¿HUELE A PIZZA?', syl: 5 },
    { t: ev.ask, end: T(14, 0.8), who: 'lupe', text: 'KEVIN… ¿Y ESE BRAZO?', syl: 6 },
    { t: ev.excuse, end: T(14, 3.8), who: 'kevin', text: '¡ME ARAÑÓ UN GATO!', syl: 6 },
    { t: T(15, 0.5), end: T(15, 3.6), who: 'cat', text: '¿PERDONA?', syl: 3 },
    { t: ev.selfieUp, end: T(19, 3.8), who: 'kevin', text: '¡SELFIE CON EL ZOMBI!', syl: 7 },
    { t: ev.hola, end: T(23, 3.8), who: 'kevin', text: '¿HOLA? ¿HAY ALGUIEN?', syl: 6 },
    { t: T(17, 0.5), end: T(17, 3.6), who: 'kevin', text: 'ME MORDIERON…', syl: 5 },
  ];

  // ---------- los textos del narrador (los insultos). *palabra* = resaltada ----------
  const say = [
    { t: ev.hookHit, end: T(1) - 0.05, text: 'SI VIVES EN UN *APOCALIPSIS* DE *HONGOS*…', size: 78 },
    { t: ev.kevin, end: T(2) - 0.05, text: '…NO SEAS COMO *KEVIN*.', size: 84, sub: 'DURÓ 2 DÍAS. Y TÚ, CON ESA CARA, UNO.' },
    { roast: true, t: ev.r1roast, end: T(7) - 0.05, text: '¿MÚSICA A TOPE, *GENIO*? LES ESTÁS DANDO UN *CONCIERTO*.', size: 66 },
    { t: ev.r1ok, end: T(8) - 0.05, text: 'CAMINA COMO UN *NINJA*, NO COMO UN ELEFANTE EN *CHANCLAS*.', size: 62, ok: true },
    { roast: true, t: ev.r2roast, end: T(12) - 0.05, text: 'LAS ESPORAS NO SON *PURPURINA*, CEREBRO DE *LENTEJA*.', size: 66 },
    { t: ev.r2ok, end: T(13) - 0.05, text: 'MÁSCARA *SIEMPRE*. AUNQUE TE *DESPEINE*.', size: 70, ok: true },
    { roast: true, t: ev.r3roast, end: T(17) - 0.05, text: '¿QUÉ GATO, KEVIN? MENTIR NO TE CURA, *PAYASO*.', size: 68 },
    { t: ev.r3ok, end: T(18) - 0.05, text: 'TE MUERDEN = *AVISAS*. NO TE HAGAS EL *LOCO*.', size: 68, ok: true },
    { roast: true, t: ev.r4roast, end: T(22) - 0.05, text: '¿UN SELFIE? *AURA −1000*. INFLUENCER DE *PACOTILLA*.', size: 66 },
    { t: ev.r4ok, end: T(23) - 0.05, text: 'NO VEN, *OYEN*. TIRA ALGO LEJOS Y PASA *CALLADITO*.', size: 64, ok: true },
    { roast: true, t: ev.r5roast, end: T(26) - 0.05, text: 'SÍ, KEVIN: *20 ZOMBIS* Y TU EGO. ¿EN SERIO, *NPC*?', size: 66 },
    { t: ev.r5ok, end: T(27) - 0.05, text: 'EN *GRUPO*. SIEMPRE. HASTA PARA IR AL *BAÑO*.', size: 68, ok: true },
    { t: ev.outro, end: T(28) - 0.05, text: 'KEVIN NO SOBREVIVIÓ A LA *PARTE 1*.', size: 76 },
    { t: ev.follow, end: DURATION, text: 'SÍGUEME PARA LA *PARTE 2*… O TE SALE UN *CHAMPIÑÓN*.', size: 68 },
  ];

  // ---------- momentos con nombre (render.js acepta @nombre) ----------
  const markers = {
    hook: { t: ev.hookHit, sync: 'av' }, // el texto choca + bombo + 808
    kevin: { t: ev.kevin, sync: 'av' }, // corte al primer plano de Kevin
    title: ev.title,
    r1: { t: ev.r1, sync: 'av' }, // cartel REGLA 1 + entra el ritmo completo
    clank: { t: ev.clank, sync: 'av' }, // ¡CLANK! la lata, la música se para en seco
    r1roast: { t: ev.r1roast, sync: 'av' },
    r2: { t: ev.r2, sync: 'av' },
    sneeze: { t: ev.sneeze, sync: 'av' }, // ¡ACHÍS! + POP de la primera seta
    r3: { t: ev.r3, sync: 'av' },
    cat: { t: ev.cat, sync: 'av' }, // scratch + corte al gato ofendido
    r4: { t: ev.r4, sync: 'av' },
    flash: { t: ev.flash, sync: 'av' }, // el CLIC del selfie + flash blanco
    r5: { t: ev.r5, sync: 'av' },
    door: { t: ev.door, sync: 'av' }, // la puerta se abre de golpe
    r5roast: { t: ev.r5roast, sync: 'av' },
    outro: { t: ev.outro, sync: 'av' },
    end: { t: ev.end, sync: 'av' }, // sello PARTE 2 MUY PRONTO
  };

  const subtitles = say.map((c) => ({ t: c.t, end: c.end, text: c.text.replace(/\*/g, '') }));

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, HOOK, hookBars, ev, rules, titleWords, phoneNotes, turns, pops, clicks, eyes, lines, say, markers, subtitles };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
