// THE SONG: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems, LUFS=-14 sets loudness)
// Un trap sigiloso en re menor a 120 BPM: pizzicato "de puntillas", 808, palmas en 2 y 4.
// Cada golpe del guion (CLANK, ¡ACHÍS!, el clic del selfie, la puerta…) es un sonido aquí, a la vez que su imagen.
// Las voces son balbuceos de dibujos animados (sintetizados), con el texto en bocadillos.
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), keys = bus(), pad = bus(), lead = bus(), fx = bus(), vox = bus(), zomb = bus(), verb = bus(), echo = bus();
const rng = U.mulberry32(77);
const R = () => rng();

// ---------- grooves por compás ----------
// full = trap completo · light = hats + 808 · camp = fuego de campamento (rim + shaker) · tense = solo latido y dron · none
const GROOVE = {
  0: 'light', 1: 'light', 2: 'none',
  3: 'full', 4: 'full', 5: 'none', 6: 'full', 7: 'light',
  8: 'light', 9: 'none', 10: 'none', 11: 'full', 12: 'light',
  13: 'camp', 14: 'camp', 15: 'none', 16: 'full', 17: 'light',
  18: 'tense', 19: 'tense', 20: 'none', 21: 'full', 22: 'light',
  23: 'tense', 24: 'none', 25: 'chase', 26: 'full',
  27: 'light', 28: 'full', 29: 'none',
};
const rootOf = (t) => chordAt(t).bass; // midi del bajo del acorde

function groove(bar, kind) {
  const t0 = T(bar);
  const root = rootOf(t0 + 0.01);
  if (kind === 'full' || kind === 'chase') {
    for (const b of [0, 1.75, 2.5]) drums.addMono(I.kick({ punch: b === 0 ? 1.15 : 0.95, seed: bar * 3 + b }), T(bar, b), b === 0 ? 0.95 : 0.8);
    for (const b of [1, 3]) { const c = I.clap(); drums.addMono(c, T(bar, b), 0.55); verb.addMono(c, T(bar, b), 0.12); }
    const step = kind === 'chase' ? 0.25 : 0.5;
    for (let b = 0; b < 4; b += step) drums.addMono(I.hat(false, bar * 40 + b * 8), T(bar, b), (b % 1 === 0 ? 0.2 : 0.13) * (kind === 'chase' ? 0.9 : 1), 0.25);
    if (bar % 2 === 1 && kind === 'full') for (let k = 0; k < 3; k++) drums.addMono(I.hat(false, bar * 7 + k), T(bar, 3.5 + k / 6), 0.12, 0.25); // redoble de hats
    if (bar % 2 === 0) drums.addMono(I.hat(true, bar), T(bar, 3.5), 0.12, -0.2);
    bass.addMono(I.bass808(root + 12, BEAT * 1.6, { drive: 1.5, decay: 0.8 }), T(bar, 0), 0.55);
    bass.addMono(I.bass808(root + 12, BEAT * 0.7, { drive: 1.5, decay: 0.5 }), T(bar, 1.75), 0.45);
    bass.addMono(I.bass808(root + 24, BEAT * 1.4, { drive: 1.5, glide: -7, decay: 0.7 }), T(bar, 2.5), 0.4);
  } else if (kind === 'light') {
    drums.addMono(I.kick({ punch: 1, seed: bar }), T(bar, 0), 0.7);
    for (let b = 0; b < 4; b += 0.5) drums.addMono(I.hat(false, bar * 40 + b * 8), T(bar, b), b % 1 === 0 ? 0.14 : 0.09, 0.25);
    drums.addMono(I.rim(1, bar), T(bar, 3), 0.25, -0.15);
    bass.addMono(I.bass808(root + 12, BEAT * 3.4, { drive: 1.3, decay: 1.4 }), T(bar, 0), 0.45);
  } else if (kind === 'camp') {
    drums.addMono(I.kick({ punch: 0.8, seed: bar }), T(bar, 0), 0.55);
    drums.addMono(I.kick({ punch: 0.8, seed: bar + 1 }), T(bar, 2.5), 0.4);
    for (const b of [1, 3]) drums.addMono(I.rim(1.1, bar + b), T(bar, b), 0.3, 0.1);
    for (let b = 0; b < 4; b += 0.25) drums.addMono(I.shaker(b % 1 === 0), T(bar, b), 0.07, -0.3);
    bass.addMono(I.bass808(root + 12, BEAT * 3.4, { drive: 1.2, decay: 1.2 }), T(bar, 0), 0.38);
  } else if (kind === 'tense') {
    for (const b of [1, 3]) fx.addMono(I.heartbeat(), T(bar, b), 0.55); // fuera del tiempo 1, donde golpea el cartel
    bass.addMono(I.bass(m('D1'), 2.0, { bright: 0.1, sub: 1 }), T(bar, 0), 0.3);
  }
}
for (let bar = 0; bar < 30; bar++) groove(bar, GROOVE[bar]);

// ---------- pad de fondo (siempre un poco inquietante) ----------
for (const c of sc.chords) {
  if (c.t0 >= DURATION) break;
  const kind = GROOVE[c.bar];
  if (kind === 'none' && ![2, 9, 24].includes(c.bar)) continue;
  const g = kind === 'full' || kind === 'chase' ? 0.05 : 0.07;
  for (const n of c.notes) { const { L, R: Rr } = I.padNote(n, c.t1 - c.t0 + 0.4, { cutoff: kind === 'full' ? 1600 : 900, attack: 0.08, release: 0.4 }); pad.addStereo(L, Rr, c.t0, g); }
}

// ---------- el gancho: pizzicato en los compases con ritmo; en el móvil de Kevin suena en 8 bits ----------
const HOOK_BARS = { 0: 'box', 1: 'box', 6: 'pizz', 7: 'tip', 11: 'pizz', 12: 'tip', 16: 'pizz', 17: 'box', 21: 'pizz', 22: 'tip', 25: 'pizz', 26: 'pizz', 27: 'box', 28: 'pizz' };
for (const [bar, inst] of Object.entries(HOOK_BARS)) {
  for (const n of sc.hookBars(+bar, +bar + 1)) {
    if (inst === 'box') { const b = I.musicBox(n.midi + 12, { decay: 1.2 }); lead.addMono(b, n.t, 0.16, 0.1); echo.addMono(b, n.t, 0.05); }
    else if (inst === 'tip') { lead.addMono(I.pizz(n.midi), n.t, 0.35, -0.1); } // de puntillas: solo pizzicato
    else { lead.addMono(I.pizz(n.midi), n.t, 0.42, -0.1); lead.addMono(I.marimba(n.midi, { decay: 0.4 }), n.t, 0.16, 0.15); echo.addMono(I.pizz(n.midi), n.t, 0.08); }
  }
}
// regla 1: la música del móvil de Kevin (8 bits, a todo volumen) — cada nota es una ♪ que sale volando
for (const n of sc.phoneNotes) { lead.addMono(I.pulse(n.midi, n.dur * 0.9, { duty: 0.25, decay: 0.25 }), n.t, 0.2, 0.2); }

// ---------- golpes de sección (cortes y carteles) ----------
function slam(t, { crash = true, big = 1 } = {}) {
  drums.addMono(I.kick({ punch: 1.3, tail: 0.5, seed: Math.round(t * 10) }), t, 0.95 * big);
  if (crash) drums.addMono(I.crash(Math.round(t)), t, 0.32 * big);
  fx.addMono(I.thud(80, 0.12), t, 0.5 * big);
}
const ding = (t) => { fx.addMono(I.ting(m('A5')), t + 0.02, 0.28, 0.2); fx.addMono(I.ting(m('E6')), t + 0.14, 0.22, 0.2); }; // el ✓

// GANCHO
slam(ev.hookHit); fx.addMono(I.subBoom(0.9, 70, 35), ev.hookHit, 0.45);
slam(ev.kevin); fx.addMono(I.boing(), ev.kevin + 0.03, 0.35);
// la mano del zombi en el hombro: un acorde disonante de pizz
for (const n of [m('D4'), m('Eb4'), m('A4')]) lead.addMono(I.pizz(n), ev.hand, 0.3);
zomb.addMono(I.voice(m('D2'), 0.9, { syl: 'u', type: 'tenor', seed: 3, glide: -3, breath: 0.5, shout: 1.3 }), ev.hand, 0.35);

// TÍTULO: cada palabra, un tom que sube + papel
for (const w of sc.titleWords) {
  drums.addMono(I.tom(U.remap(w.midi, m('D3'), m('F4'), 110, 260), 0.25), w.t, 0.7);
  fx.addMono(I.paperFwip(1 + (w.midi - m('D3')) / 20), w.t, 0.25);
  drums.addMono(I.kick({ punch: 1.1, seed: w.midi }), w.t, 0.45);
}
bass.addMono(I.bass808(m('D2'), 1.8, { drive: 1.4, decay: 2 }), ev.title, 0.45);
fx.addMono(I.pop(1600), ev.parte1, 0.5); drums.addMono(I.crash(9), ev.parte1, 0.18);

// cartel de cada regla
for (const r of sc.rules) { slam(r.t); fx.addMono(I.paperFwip(1.2), r.t + 0.02, 0.3); }
// cada ✓
for (const t of [ev.r1ok, ev.r2ok, ev.r3ok, ev.r4ok, ev.r5ok]) ding(t);
// los roasts: golpe + platillo
for (const t of [ev.r1roast, ev.r2roast, ev.r3roast, ev.r4roast, ev.r5roast]) slam(t, { big: 0.9 });

// ---------- REGLA 1: CLANK ----------
fx.addMono(I.bell(1350, 0.35, 2.2, 1.41), ev.clank, 0.5, 0.2);
fx.addMono(I.bell(2210, 0.2, 1.4, 1.73), ev.clank, 0.3, 0.2);
fx.addMono(I.woodTick(1.6), ev.clank, 0.6, 0.2);
fx.addMono(I.thud(140, 0.08), ev.clank, 0.6);
fx.addMono(I.scratch(0.3), ev.clank + 0.03, 0.3);
sc.turns.forEach((t, i) => {
  fx.addMono(I.noiseSweep(0.12, 2400, 600, { q: 1.5 }), t - 0.06, 0.18, (i - 1) * 0.6);
  zomb.addMono(I.voice(m('C2') + i * 2, 0.7, { syl: i % 2 ? 'o' : 'u', type: 'tenor', seed: 10 + i, glide: -2, breath: 0.45, shout: 1.25 }), t, 0.3, (i - 1) * 0.6);
  drums.addMono(I.tom(90 - i * 8, 0.3), t, 0.4);
});
// la persecución: gruñidos sueltos
for (let i = 0; i < 6; i++) zomb.addMono(I.voice(m('D2') + Math.floor(R() * 5), 0.5 + R() * 0.4, { syl: R() < 0.5 ? 'u' : 'a', type: 'tenor', seed: 20 + i, glide: -3 + R() * 2, breath: 0.4, shout: 1.3 }), ev.r1roast + 0.2 + i * 0.28, 0.2, (R() - 0.5) * 1.2);

// ---------- REGLA 2: la máscara ----------
fx.addMono(I.noiseSweep(T(10) - ev.inhale - BEAT * 0.5, 300, 5000, { q: 0.8, pink: true, shape: (x) => x * x }), ev.inhale, 0.32); // inhalaaaa
// ¡ACHÍS!
fx.addMono(I.noiseSweep(0.35, 7000, 2500, { q: 0.7, shape: (x) => Math.pow(1 - x, 2) }), ev.sneeze, 0.5);
vox.addMono(I.voice(m('A4'), 0.22, { syl: 'i', type: 'tenor', seed: 40, glide: 3, breath: 0.5, shout: 1.5 }), ev.sneeze + 0.01, 0.22); // el "-CHÍS" cae en el golpe
drums.addMono(I.kick({ punch: 1.2, seed: 41 }), ev.sneeze, 0.7);
for (const p of sc.pops) { fx.addMono(I.pop(1400 + (p.midi - m('A5')) * 120, 30 + p.midi), p.t, 0.55); lead.addMono(I.pizz(p.midi), p.t, 0.4); }
fx.addMono(I.boing(), sc.pops[2].t + 0.25, 0.3);

// ---------- REGLA 3: el gato ----------
fx.addMono(I.vinyl(T(15) - ev.r3 - BEAT, { crackle: 1.6, hiss: 0.25 }), ev.r3, 0.2); // el fuego crepita
fx.addMono(I.scratch(0.34), ev.cat, 0.45);
drums.addMono(I.kick({ punch: 1.3, seed: 51 }), ev.cat, 0.8);
fx.addMono(I.woodTick(1.2), ev.cat, 0.4);
fx.addMono(I.vinyl(T(17, 3) - T(16), { crackle: 1.2, hiss: 0.2 }), T(16), 0.09); // termina un tiempo antes del cartel de la regla 4

// ---------- REGLA 4: el Coliflor ----------
for (const t of sc.clicks) { fx.addMono(I.woodTick(2.1 + R() * 0.3), t, 0.28, 0.35); fx.addMono(I.rim(1.8, Math.round(t * 100)), t, 0.1, 0.35); }
for (let b = 0; b < 8; b++) lead.addMono(I.musicBox(m('D6') + [0, 3, 1, 6, 0, 5, 1, 4][b], { decay: 1.4 }), T(18, b * 0.5 + 0.25), 0.06, -0.3); // cajita de música inquietante
// el CLIC del selfie + flash
fx.addMono(I.tvClick(), ev.flash, 0.7);
fx.addMono(I.pop(3200, 61), ev.flash, 0.4);
fx.addMono(I.noiseSweep(0.15, 9000, 3000, { q: 0.6, shape: (x) => 1 - x }), ev.flash, 0.3);
drums.addMono(I.crash(61), ev.flash, 0.3);
// el chillido del Coliflor
for (let k = 0; k < 3; k++) zomb.addMono(I.voice(m('E4') + k * 0.4, 1.1, { syl: 'a', type: 'alto', seed: 70 + k, glide: 5, breath: 0.6, shout: 1.7 }), ev.scream + k * 0.015, 0.22, (k - 1) * 0.4);
for (let k = 0; k < 8; k++) drums.addMono(I.tom(220 - k * 16, 0.18), T(20, 2 + k * 0.25), 0.4 + k * 0.03); // redoble de toms hacia el roast
// la botella: silbido + cristales a lo lejos (a la derecha)
fx.addMono(I.whistle(ev.smash - ev.throw - 0.05), ev.throw, 0.12, 0.4);
fx.addMono(I.glass(5, { size: 0.8 }), ev.smash, 0.55, 0.75);

// ---------- REGLA 5: nunca solo ----------
fx.addMono(I.noiseSweep(T(24) - T(23) - 0.2, 180, 420, { q: 2, pink: true, shape: (x) => Math.sin(Math.PI * x) }), T(23, 0.2), 0.18); // viento
fx.addMono(I.thud(70, 0.2), ev.door, 0.9); fx.addMono(I.woodTick(0.7), ev.door, 0.6); drums.addMono(I.kick({ punch: 1.4, seed: 81 }), ev.door, 0.9);
fx.addMono(I.noiseSweep(1.1, 900, 400, { q: 6, shape: (x) => Math.sin(Math.PI * Math.min(1, x * 1.4)) }), ev.door + 0.12, 0.14, -0.3); // el chirrido de la puerta
bass.addMono(I.bass(m('D1'), 2.0, { bright: 0.15, sub: 1 }), ev.door, 0.45);
for (const e of sc.eyes) { fx.addMono(I.ting(e.midi), e.t, 0.18, (e.i % 2 ? 0.4 : -0.4)); if (e.i % 2 === 0) zomb.addMono(I.voice(m('C2') + (e.i % 3), 0.6, { syl: 'u', type: 'tenor', seed: 90 + e.i, glide: -2, breath: 0.5, shout: 1.2 }), e.t, 0.16, (e.i % 4 - 1.5) * 0.4); }
// Kevin grita y sale corriendo
vox.addMono(I.voice(m('A4'), 1.2, { syl: 'a', type: 'tenor', seed: 99, glide: 7, breath: 0.3, shout: 1.6 }), ev.r5roast + 0.05, 0.35);
fx.addMono(I.whistle(0.45), ev.r5roast + 0.6, 0.15, 0.3);

// ---------- FINAL ----------
fx.addMono(I.bwomp(), ev.outro + 0.05, 0.5);
slam(ev.outro);
zomb.addMono(I.voice(m('F2'), 1.0, { syl: 'o', type: 'tenor', seed: 120, glide: -2, breath: 0.35, shout: 1.1 }), ev.outro + 0.6, 0.22);
slam(ev.end, { big: 1.05 });
drums.addMono(I.clap({ spread: 0.014 }), ev.end, 0.6);
fx.addMono(I.subBoom(1.4, 80, 32), ev.end, 0.5);
for (const n of ['D3', 'A3', 'D4', 'F4', 'A4']) { const { L, R: Rr } = I.brassNote(m(n), 1.2, { stab: true, bright: 1.1, seed: m(n) }); keys.addStereo(L, Rr, ev.end, 0.12); }
for (const n of ['D4', 'F4', 'A4', 'D5']) { const { L, R: Rr } = I.padNote(m(n), 1.6, { cutoff: 1400, attack: 0.02, release: 1 }); pad.addStereo(L, Rr, ev.end, 0.08); }

// ---------- los balbuceos (las voces de los bocadillos) ----------
const VOICE = { kevin: { type: 'tenor', base: m('E4'), shout: 1.15 }, lupe: { type: 'alto', base: m('A4'), shout: 1.05 }, cat: { type: 'alto', base: m('D5'), shout: 1.2 } };
sc.lines.forEach((l, li) => {
  const v = VOICE[l.who];
  const sad = l.text.startsWith('ME MORDIERON');
  const q = l.text.includes('?');
  const dur = 0.12;
  for (let k = 0; k < l.syl; k++) {
    const contour = (q && k === l.syl - 1 ? 4 : 0) + (sad ? -2 - k * 0.6 : 0) + [0, 2, -1, 3, 1, -2, 2][k % 7];
    const syl = ['a', 'e', 'o', 'a', 'u', 'e', 'o'][(k + li) % 7];
    const x = I.voice(v.base + contour, l.who === 'cat' ? 0.22 : dur, { syl, type: v.type, seed: 200 + li * 10 + k, glide: l.who === 'cat' ? 4 : (R() - 0.5) * 2, breath: 0.12, shout: v.shout, vib: 0.05 });
    const t = l.t + 0.08 + k * (l.who === 'cat' ? 0.26 : 0.14);
    vox.addMono(x, t, 0.32, l.who === 'lupe' ? -0.2 : 0.15);
    verb.addMono(x, t, 0.04);
  }
});

// ---------- mezcla ----------
// silencios: la música se para en seco en los golpes cómicos
const music = [drums, bass, keys, pad, lead];
MIX.gate(drums, ev.clank + 0.01, ev.r1roast - 0.01, 0.01); MIX.gate(bass, ev.clank + 0.01, ev.r1roast - 0.01, 0.01); MIX.gate(lead, ev.clank + 0.01, ev.r1roast - 0.01, 0.01); MIX.gate(pad, ev.clank + 0.01, ev.r1roast - 0.01, 0.01);
for (const b of music) MIX.gate(b, T(9, 3.5), ev.sneeze - 0.005, 0.005); // una corchea de aguantar la respiración
for (const b of [drums, bass, lead, pad]) MIX.gate(b, ev.cat + 0.01, ev.r3roast - 0.01, 0.01);
for (const b of [drums, bass, lead, pad]) MIX.gate(b, T(19, 3.5), ev.flash - 0.005, 0.005);
for (const b of [lead, pad]) MIX.gate(b, T(23, 3.5), ev.door - 0.005, 0.005);
MIX.gate(fx, T(23, 3.6), ev.door - 0.005, 0.005);

const room = reverb(verb, { room: 0.7, damp: 0.4 });
const dly = pingpong(echo, BEAT * 0.75, 0.35, 3500);
const zroom = reverb(zomb, { room: 0.8, damp: 0.5 });
MIX.duck([drums, bass, lead, pad, keys], vox, { depth: 0.35 });
const stems = { drums, bass, keys, pad, lead, fx, vox, zomb, zroom, verb: room, echo: dly };
const GAIN = { drums: 0.45, bass: 1.2, keys: 1.6, pad: 2.2, lead: 2.4, fx: 0.9, vox: 2.6, zomb: 2.4, zroom: 0.5, verb: 0.4, echo: 0.8 }; // medido con engine/tools/levels.js
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.9, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
