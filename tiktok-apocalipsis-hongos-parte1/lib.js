// LIB: el reparto, los accesorios y los textos de "Guía para no morir — Parte 1".
// Todo es función pura de t (sin estado), dibujado con G.* para que las líneas "hiervan" como un dibujo a mano.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const L = {};
  globalThis.L = L;

  L.C = {
    ink: '#2A2320', yellow: '#FFD23F', red: '#E5383B', green: '#2FB36B', white: '#FFFFFF', black: '#16121C',
    shroom: '#D9643A', shroom2: '#E8A24A', stem: '#F1E6CF', spore: '231,240,138', zskin: '#9DB08A',
  };

  // ---------- el reparto (todos inventados) ----------
  const kevin = { outfit: 'hoodie', shirt: '#F2B84B', bottoms: 'pants', pants: '#3B5BA0', skin: '#E6B48C', hairStyle: 'short', hair: '#5A3A22', headwear: 'cap', headwearColor: '#D9482B', shoes: '#F4F1EA', build: 'slim', freckles: true };
  L.CAST = {
    kevin,
    kevinZ: { ...kevin, skin: '#B7C99B', headwear: 'none', hairStyle: 'buzz', hair: '#4A5A3A' },
    lupe: { outfit: 'tee', shirt: '#55703F', bottoms: 'pants', pants: '#3A3A44', skin: '#C98A62', hairStyle: 'ponytail', hair: '#2B211E', shoes: '#5A3A22' },
    tono: { outfit: 'shirt', shirt: '#3D7A74', bottoms: 'pants', pants: '#2F2F38', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1C1715', shoes: '#2A2A2A', build: 'broad' },
    nora: { outfit: 'hoodie', shirt: '#6B4E8A', bottoms: 'pants', pants: '#2F3A55', skin: '#F3D2B3', hairStyle: 'bun', hair: '#B8452A', shoes: '#F4F1EA', freckles: true },
    zombie: { outfit: 'tee', shirt: '#6E6A5A', bottoms: 'pants', pants: '#4A4A40', skin: '#9DB08A', hairStyle: 'buzz', hair: '#3A3A30', shoes: '#3A3A30' },
    zombie2: { outfit: 'shirt', shirt: '#7A5C52', bottoms: 'pants', pants: '#3E4450', skin: '#A3B592', hairStyle: 'long', hair: '#4A3A2A', shoes: '#2E2E2E' },
    zombie3: { outfit: 'hoodie', shirt: '#4E5B6B', bottoms: 'pants', pants: '#3A3A30', skin: '#94A882', hairStyle: 'bald', hair: '#555555', shoes: '#2E2E2E', build: 'broad' },
    coliflor: { outfit: 'tee', shirt: '#5A5648', bottoms: 'pants', pants: '#3B3A33', skin: '#8FA07C', hairStyle: 'bald', hair: '#555555', shoes: '#2E2E2E', build: 'broad' },
  };
  globalThis.CAST = { kevin: L.CAST.kevin, lupe: L.CAST.lupe, tono: L.CAST.tono, nora: L.CAST.nora, zombie: L.CAST.zombie };

  // ---------- geometría del personaje: dibujar encima de la cabeza / del cuerpo con sus mismas transformaciones ----------
  function bodyXf(ctx, o) {
    const s = o.s || 1;
    ctx.translate(o.x, o.y);
    const wph = 2 * Math.PI * (o.walk || 0);
    if (o.pose === 'walk') ctx.translate(0, -Math.abs(Math.sin(wph)) * 12 * s);
    ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
    ctx.rotate((o.rot || 0) + (o.pose === 'walk' ? Math.sin(wph) * 0.025 : 0));
  }
  L.onBody = (ctx, o, fn) => { ctx.save(); bodyXf(ctx, o); const seated = o.pose === 'sit' || o.pose === 'floor'; fn(ctx, seated ? 0 : -150); ctx.restore(); };
  L.onHead = (ctx, o, fn) => {
    ctx.save(); bodyXf(ctx, o);
    const seated = o.pose === 'sit' || o.pose === 'floor';
    const sh = (seated ? 0 : -150) - 172;
    ctx.translate(o.headX || 0, sh - 82 + (o.headY || 0));
    ctx.rotate(o.headRot || 0);
    fn(ctx); ctx.restore();
  };
  // a point in a person's own units -> screen
  L.pt = (o, px, py) => {
    const s = o.s || 1, wph = 2 * Math.PI * (o.walk || 0);
    const bob = o.pose === 'walk' ? -Math.abs(Math.sin(wph)) * 12 * s : 0;
    const r = (o.rot || 0), c = Math.cos(r), sn = Math.sin(r);
    const x = px * s * (o.sx || 1), y = py * s * (o.sy || 1);
    return [o.x + x * c - y * sn, o.y + bob + x * sn + y * c];
  };
  L.headPt = (o, hx = 0, hy = 0) => { const seated = o.pose === 'sit' || o.pose === 'floor'; return L.pt(o, (o.headX || 0) + hx, (seated ? 0 : -150) - 254 + (o.headY || 0) + hy); };

  // ---------- quién está hablando (balbuceo): la boca se abre en cada sílaba de song.js ----------
  L.mouth = (who, t) => {
    const l = S.lines.find((q) => q.who === who && t >= q.t && t < q.end);
    if (!l) return null;
    const step = who === 'cat' ? 0.26 : 0.14, k = (t - l.t - 0.08) / step;
    if (k < 0 || k >= l.syl) return { open: 0, wide: 0.5, talking: true };
    const ph = k % 1;
    return { open: Math.sin(Math.PI * Math.min(1, ph * 1.15)) * 0.95, wide: 0.55, talking: true };
  };

  // ---------- setas, hongos, esporas ----------
  L.shroom = (ctx, x, y, s, { cap = L.C.shroom, stem = L.C.stem, seed = 1, rot = 0, spots = true, h = 46 } = {}) => {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.poly(ctx, [[-13, 2], [13, 2], [10, -h], [-10, -h]], { fill: stem, lw: 3.5, seed, step: 10, hatch: { color: 'rgba(120,90,40,0.18)', gap: 6 } });
    const pts = [];
    for (let i = 0; i <= 18; i++) { const a = Math.PI + (i / 18) * Math.PI; pts.push([Math.cos(a) * 52, -h + 8 + Math.sin(a) * 46]); }
    pts.push([34, -h + 14], [0, -h + 17], [-34, -h + 14]);
    G.shape(ctx, pts, { fill: cap, lw: 4, seed: seed + 1, hatch: { color: 'rgba(0,0,0,0.13)', gap: 8 } });
    if (spots) for (const [sx, sy, r] of [[-26, -h - 14, 8], [4, -h - 28, 10], [30, -h - 8, 7]]) G.ellipse(ctx, sx, sy, r, r * 0.8, { fill: '#FFF4DC', lw: 2.5, seed: seed + 3 + r });
    ctx.restore();
  };
  // hongo "repisa" que crece en la cabeza de los infectados
  L.bracket = (ctx, x, y, s, seed, tilt = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
    const cols = ['#D99A4E', '#C9773E', '#E6C38A'];
    for (let k = 0; k < 3; k++) {
      const yy = -k * 20, ww = 44 - k * 9;
      const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push([Math.cos(a) * ww, yy + Math.sin(a) * ww * 0.55]); }
      pts.push([0, yy + 6]);
      G.shape(ctx, pts, { fill: cols[k % 3], lw: 3, seed: seed + k, hatch: { color: 'rgba(90,40,10,0.28)', gap: 5, angle: 1.4 } });
    }
    ctx.restore();
  };
  L.spores = (ctx, t, { n = 60, seed = 1, x0 = 0, x1 = W, y0 = 0, y1 = H, color = L.C.spore, speed = 40, size = 1, alpha = 1 } = {}) => {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const rx = U.hash(seed, i, 1), ry = U.hash(seed, i, 2), rs = U.hash(seed, i, 3);
      const span = y1 - y0;
      const y = y1 - ((ry * span + t * speed * (0.5 + rs)) % span);
      const x = x0 + rx * (x1 - x0) + Math.sin(t * (0.6 + rs) + i) * 26;
      const r = (2 + rs * 4) * size;
      const a = alpha * (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + i)));
      ctx.fillStyle = `rgba(${color},${a * 0.22})`; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(${color},${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    ctx.restore();
  };
  // una nube de esporas que sale de un punto (estornudo, seta que suelta polvo)
  L.puff = (ctx, t, t0, x, y, { n = 26, seed = 5, speed = 520, life = 1.2, color = L.C.spore, size = 1 } = {}) => {
    const a = t - t0; if (a < 0 || a > life) return;
    const k = a / life;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const ang = U.hash(seed, i) * Math.PI * 2, sp = speed * (0.4 + U.hash(seed, i, 2) * 0.8);
      const d = sp * (1 - Math.exp(-a * 3)) / 3;
      const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d - a * 40;
      const r = (4 + U.hash(seed, i, 3) * 7) * size * (1 + k);
      ctx.fillStyle = `rgba(${color},${(1 - k) * 0.55})`; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
    }
    ctx.restore();
  };

  // ---------- los infectados ----------
  L.zombie = (ctx, o) => {
    const st = L.CAST[o.kind || 'zombie'];
    const t = o.t, ph = o.ph || 0, seed = o.seed || 500;
    const sway = Math.sin(t * 2.2 + ph) * 0.05;
    const reach = o.reach ?? 1;
    const sh = -322;
    const hl = [-128 + Math.sin(t * 3 + ph) * 10, sh + 40 + Math.sin(t * 2.5 + ph) * 14];
    const hr = [132 + Math.cos(t * 3 + ph) * 10, sh + 60 + Math.sin(t * 2.8 + ph) * 14];
    const p = {
      x: o.x, y: o.y, s: o.s, sx: o.sx || 1, pose: o.pose || 'stand', walk: o.walk || 0, rot: (o.rot || 0) + sway * 0.4,
      headRot: o.headRot ?? sway * 2.4, style: st, eyes: o.eyes || 'wide', brows: o.brows || 'determined', mouth: o.mouth || 'o', look: o.look || 0, lookY: o.lookY || 0, seed,
      handL: o.handL || (reach > 0 ? [lerp(-92, hl[0], reach), lerp(-180, hl[1], reach)] : undefined),
      handR: o.handR || (reach > 0 ? [lerp(92, hr[0], reach), lerp(-180, hr[1], reach)] : undefined),
      shadow: o.shadow ?? true,
    };
    Ch.person(ctx, p);
    L.onHead(ctx, p, (c) => {
      if (p.eyes !== 'closed') for (const sd of [-1, 1]) { c.fillStyle = 'rgba(80,40,90,0.35)'; c.beginPath(); c.ellipse(sd * 27, 12, 20, 9, 0, 0, Math.PI * 2); c.fill(); }
      G.line(c, [[-42, 18], [-32, 32], [-38, 50]], { color: 'rgba(240,236,205,0.75)', lw: 2.5, seed: seed + 1, step: 6 });
      G.line(c, [[36, -26], [46, -12], [41, 8]], { color: 'rgba(240,236,205,0.75)', lw: 2.5, seed: seed + 2, step: 6 });
      L.bracket(c, 42, -54, 0.9, seed + 5, 0.55);
      L.bracket(c, 60, -22, 0.7, seed + 9, 0.95);
      L.shroom(c, -34, -60, 0.42, { seed: seed + 12, rot: -0.45, cap: '#C9773E', spots: false });
      if (o.glow) { // ojos que brillan en la oscuridad
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const sd of [-1, 1]) { const g = c.createRadialGradient(sd * 27, -6, 0, sd * 27, -6, 40); g.addColorStop(0, `rgba(255,236,120,${0.55 * o.glow})`); g.addColorStop(1, 'rgba(255,236,120,0)'); c.fillStyle = g; c.fillRect(sd * 27 - 40, -46, 80, 80); }
        c.restore();
      }
      if (o.zzz) { // dormido de pie
        for (let k = 0; k < 3; k++) {
          const a = ((t * 0.7 + k / 3 + ph) % 1);
          G.decor(() => G.text(c, 'z', 60 + a * 50 + k * 6, -90 - a * 110, { size: 34 + k * 8, fam: 'Bungee', weight: 400, color: '#FFFFFF', alpha: Math.sin(Math.PI * a), stroke: '#2A2320', strokeW: 6 }));
        }
      }
    });
    return p;
  };
  // el "Coliflor": la cabeza es una flor de hongo. No ve nada; oye TODO. Hace clic-clic.
  L.coliflor = (ctx, o) => {
    const t = o.t, seed = o.seed || 800;
    const sway = Math.sin(t * 1.7) * 0.04;
    const scream = o.scream || 0;
    const p = {
      x: o.x, y: o.y, s: o.s, pose: o.pose || 'stand', walk: o.walk || 0, rot: (o.rot || 0) + sway, headRot: (o.headRot || 0) + sway * 1.5 + Math.sin(t * 13) * 0.04 * (o.twitch || 0),
      style: L.CAST.coliflor, eyes: 'closed', mouth: 'flat', seed,
      handL: [-104 + Math.sin(t * 2) * 8, -200 + Math.sin(t * 2.4) * 10 - scream * 120], handR: [104 + Math.cos(t * 2) * 8, -190 + Math.sin(t * 2.1) * 10 - scream * 120],
    };
    Ch.person(ctx, p);
    L.onHead(ctx, p, (c) => {
      const lumps = [[-58, -18, 46, 52], [58, -18, 46, 52], [-36, -78, 46, 42], [36, -78, 46, 42], [0, -118, 42, 36], [-72, 34, 34, 40], [72, 34, 34, 40], [-30, 40, 34, 34], [30, 40, 34, 34], [0, -40, 40, 40]];
      lumps.forEach(([x, y, rx, ry], k) => {
        const sp = 1 + scream * 0.35 * (x === 0 ? 0 : 1);
        G.ellipse(c, x * sp, y, rx * (1 + scream * 0.08), ry, { fill: k % 3 === 0 ? '#E2CFA6' : k % 3 === 1 ? '#C9A574' : '#D7B27C', lw: 4, seed: seed + 20 + k, hatch: { color: 'rgba(90,60,20,0.25)', gap: 6, angle: 0.6 + k } });
      });
      for (let k = 0; k < 6; k++) G.line(c, [[-60 + k * 24, -100 + (k % 2) * 30], [-50 + k * 24, -60 + (k % 2) * 30], [-62 + k * 24, -20 + (k % 2) * 20]], { color: 'rgba(110,70,30,0.55)', lw: 2.5, seed: seed + 40 + k, step: 8 });
      // la grieta: se abre al chillar
      const op = 6 + scream * 38;
      G.poly(c, [[-op * 0.4, -126], [op * 0.4, -126], [op, 30], [0, 66], [-op, 30]], { fill: '#2A0F12', lw: 4, seed: seed + 50, step: 12 });
      if (scream > 0.2) for (let k = 0; k < 5; k++) { const yy = -90 + k * 26; G.poly(c, [[-op + 4, yy], [-op + 18, yy + 8], [-op + 4, yy + 16]], { fill: '#F4EAD0', lw: 2, seed: seed + 60 + k, step: 6 }); G.poly(c, [[op - 4, yy + 10], [op - 18, yy + 18], [op - 4, yy + 26]], { fill: '#F4EAD0', lw: 2, seed: seed + 70 + k, step: 6 }); }
    });
    return p;
  };
  // ondas de "clic-clic" que salen de la cabeza en cada clic de la partitura
  L.clickWaves = (ctx, x, y, t, s = 1) => {
    for (const c of S.clicks) {
      const a = t - c; if (a < 0 || a > 0.45) continue;
      const k = a / 0.45;
      for (const sd of [-1, 1]) {
        ctx.save(); ctx.strokeStyle = `rgba(255,248,220,${(1 - k) * 0.9})`; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(x + sd * 20 * s, y, (70 + k * 120) * s, sd > 0 ? -0.55 : Math.PI - 0.55, sd > 0 ? 0.55 : Math.PI + 0.55); ctx.stroke(); ctx.restore();
      }
    }
  };

  // ---------- accesorios ----------
  L.gasMask = (c, seed = 900) => {
    for (const sd of [-1, 1]) G.line(c, [[sd * 66, -30], [sd * 44, -14]], { lw: 8, color: '#1E1E22', seed: seed + sd });
    const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([Math.cos(a) * 58, 16 + Math.sin(a) * 56]); }
    G.shape(c, pts, { fill: '#3B3F45', lw: 4.5, seed: seed + 2, hatch: { color: 'rgba(255,255,255,0.07)', gap: 6 } });
    for (const sd of [-1, 1]) {
      G.ellipse(c, sd * 27, -4, 20, 19, { fill: '#9FD6E8', lw: 6, stroke: '#16161A', seed: seed + 3 + sd });
      G.line(c, [[sd * 27 - 10, -10], [sd * 27 - 2, -18]], { lw: 3.5, color: 'rgba(255,255,255,0.85)', seed: seed + 5 + sd });
    }
    G.ellipse(c, 0, 52, 27, 24, { fill: '#6E7A5A', lw: 4.5, seed: seed + 7 });
    for (let k = -1; k <= 1; k++) G.line(c, [[-14, 52 + k * 8], [14, 52 + k * 8]], { lw: 2.5, color: '#2A2A2A', seed: seed + 8 + k });
  };
  L.bandana = (c, col = '#C8323A', seed = 950) => {
    G.shape(c, [[-66, -44], [-30, -60], [30, -60], [66, -44], [64, -28], [30, -42], [-30, -42], [-64, -28]], { fill: col, lw: 3.5, seed });
    G.poly(c, [[-64, -40], [-94, -56], [-86, -22]], { fill: col, lw: 3, seed: seed + 1, step: 10 });
    G.poly(c, [[-64, -36], [-96, -20], [-74, -10]], { fill: col, lw: 3, seed: seed + 2, step: 10 });
  };
  L.backpackStraps = (c, hip, seed = 960) => {
    const sh = hip - 172;
    for (const sd of [-1, 1]) G.line(c, [[sd * 44, sh + 4], [sd * 52, sh + 70], [sd * 58, hip - 10]], { lw: 13, color: '#6B4A2E', seed: seed + sd });
    G.line(c, [[-50, sh + 80], [50, sh + 80]], { lw: 8, color: '#6B4A2E', seed: seed + 3 });
  };
  L.phone = (ctx, x, y, s, rot = 0, { screen = '#8FD3FF', seed = 970 } = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.rrect(ctx, -22, -40, 44, 80, 9, { fill: '#26232E', lw: 3.5, seed });
    G.rrect(ctx, -16, -32, 32, 62, 5, { fill: screen, lw: 0, seed: seed + 1, amp: 0.3 });
    ctx.restore();
  };
  L.flashlight = (ctx, x, y, s, ang, seed = 980) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    G.rrect(ctx, -8, -14, 70, 28, 8, { fill: '#3A3F4A', lw: 3.5, seed });
    G.rrect(ctx, 56, -20, 22, 40, 6, { fill: '#5B6372', lw: 3.5, seed: seed + 1 });
    G.rrect(ctx, 74, -16, 6, 32, 2, { fill: '#FFF6C8', lw: 2, seed: seed + 2 });
    ctx.restore();
  };
  L.note = (ctx, x, y, s, rot, col = '#FFFFFF') => { // una ♪ dibujada
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 16, 12, { fill: col, lw: 3.5, seed: 31 });
    G.line(ctx, [[14, -2], [14, -58]], { lw: 5, color: L.C.ink, seed: 32 });
    G.poly(ctx, [[14, -58], [38, -42], [34, -30], [14, -40]], { fill: col, lw: 3, seed: 33, step: 8 });
    ctx.restore();
  };
  L.bottle = (ctx, x, y, s, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.rrect(ctx, -14, -20, 28, 56, 8, { fill: '#5FA36A', lw: 3.5, seed: 41, alpha: 0.95 });
    G.rrect(ctx, -6, -44, 12, 26, 4, { fill: '#5FA36A', lw: 3, seed: 42 });
    ctx.restore();
  };
  L.can = (ctx, x, y, s, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.rrect(ctx, -18, -30, 36, 60, 6, { fill: '#C8CDD4', lw: 3.5, seed: 51 });
    G.rrect(ctx, -18, -16, 36, 28, 2, { fill: '#D9482B', lw: 2.5, seed: 52 });
    ctx.restore();
  };
  L.medkit = (ctx, x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -40, -30, 80, 60, 8, { fill: '#F6F2EA', lw: 4, seed: 61 });
    ctx.fillStyle = L.C.red; ctx.fillRect(-8, -20, 16, 40); ctx.fillRect(-20, -8, 40, 16);
    ctx.restore();
  };
  L.halo = (ctx, x, y, s, t) => {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 4) * 4); ctx.scale(s, s);
    ctx.strokeStyle = '#FFE47A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, 58, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };

  // ---------- textos ----------
  const FAM = 'Bungee';
  function parse(text) {
    const out = []; let hl = false;
    for (const raw of text.split(' ')) {
      if (!raw) continue;
      const opens = raw.startsWith('*'), stars = (raw.match(/\*/g) || []).length;
      if (opens) hl = true;
      out.push({ w: raw.replace(/\*/g, ''), hl });
      if ((opens && stars >= 2) || (!opens && stars >= 1)) hl = false;
    }
    return out;
  }
  function wrap(ctx, words, size, maxW) {
    const sp = size * 0.32, lines = [[]];
    let lw = 0;
    for (const wd of words) {
      wd.mw = G.measure(ctx, wd.w, size, FAM, 400);
      if (lines[lines.length - 1].length && lw + sp + wd.mw > maxW) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(wd); lw += (lw ? sp : 0) + wd.mw;
    }
    return lines.map((ws) => ({ ws, w: ws.reduce((a, b) => a + b.mw, 0) + sp * (ws.length - 1) }));
  }
  // texto grande de TikTok: palabra a palabra, blanco con borde, *palabras* en amarillo
  L.say = (ctx, c, t, { y = 410, cx = SAFE.x + SAFE.w / 2, maxW = SAFE.w - 20, rate = 0.075 } = {}) => {
    if (t < c.t || t >= c.end) return;
    const size = c.size || 70;
    const words = parse(c.text);
    const lines = wrap(ctx, words, size, maxW);
    let yy = y;
    // la etiqueta: ✓ ASÍ SÍ (verde) o ✗ ASÍ NO (roja) en las reglas
    if (c.ok !== undefined || c.roast) {
      const a = clamp((t - c.t) / 0.18);
      L.pill(ctx, cx, yy + 28, c.ok ? 'ASÍ SÍ' : 'ASÍ NO', c.ok ? L.C.green : L.C.red, { pop: ease.outBack(a, 2.4), check: !!c.ok, cross: !c.ok });
      yy += 78;
    }
    let i = 0;
    const lh = size * 1.12;
    lines.forEach((ln, li) => {
      let x = cx - ln.w / 2;
      const base = yy + size * 0.92 + li * lh;
      for (const wd of ln.ws) {
        const a = t - (c.t + 0.04 + i * rate);
        if (a >= 0) {
          const k = clamp(a / 0.16), sc = 0.4 + 0.6 * ease.outBack(k, 2.6);
          ctx.save(); ctx.translate(x, base - size * 0.35); ctx.scale(sc, sc); ctx.rotate((1 - k) * -0.1);
          G.text(ctx, wd.w, 0, size * 0.35, { size, fam: FAM, weight: 400, color: wd.hl ? L.C.yellow : '#FFFFFF', stroke: '#16121C', strokeW: size * 0.22, boil: 0.4 });
          ctx.restore();
        }
        x += wd.mw + size * 0.32; i++;
      }
    });
    if (c.sub) {
      const a = t - (c.t + 0.6);
      if (a >= 0) {
        const k = ease.outBack(clamp(a / 0.2), 2.2);
        const by = yy + size * 0.92 + lines.length * lh + 20;
        ctx.save(); ctx.translate(cx, by); ctx.scale(k, k);
        const sl = wrap(ctx, parse(c.sub), 40, maxW - 40);
        sl.forEach((ln, li) => G.text(ctx, ln.ws.map((q) => q.w).join(' '), 0, li * 48, { size: 40, fam: FAM, weight: 400, color: '#FFFFFF', align: 'center', stroke: '#16121C', strokeW: 9, boil: 0.3 }));
        ctx.restore();
      }
    }
  };
  L.pill = (ctx, cx, cy, text, bg, { pop = 1, check = false, cross = false, size = 36 } = {}) => {
    if (pop <= 0.01) return;
    const tw = G.measure(ctx, text, size, FAM, 400), iw = check || cross ? 48 : 0;
    const w = tw + iw + 56, h = size * 1.55;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pop, pop); ctx.rotate(-0.03);
    G.rrect(ctx, -w / 2, -h / 2, w, h, h / 2, { fill: bg, lw: 5, seed: 71, stroke: '#16121C' });
    const ix = -w / 2 + 28;
    if (check) G.line(ctx, [[ix + 2, 0], [ix + 14, 12], [ix + 36, -14]], { lw: 8, color: '#FFFFFF', seed: 72, amp: 0.3 });
    if (cross) { G.line(ctx, [[ix + 4, -13], [ix + 30, 13]], { lw: 8, color: '#FFFFFF', seed: 73, amp: 0.3 }); G.line(ctx, [[ix + 30, -13], [ix + 4, 13]], { lw: 8, color: '#FFFFFF', seed: 74, amp: 0.3 }); }
    G.text(ctx, text, ix + iw + tw / 2, size * 0.36, { size, fam: FAM, weight: 400, color: '#FFFFFF', align: 'center', boil: 0.3 });
    ctx.restore();
  };
  // onomatopeya de cómic (¡CLANK!, ¡ACHÍS!…): sale con rebote y tiembla
  L.sfx = (ctx, text, x, y, t, t0, { size = 130, color = L.C.yellow, rot = -0.1, life = 1.1, stroke = '#16121C' } = {}) => {
    const a = t - t0; if (a < 0 || a > life) return;
    const k = lerp(1.8, 1, ease.outBack(clamp(a / 0.14), 2.2)), out = clamp((a - life + 0.2) / 0.2); // entra GRANDE en el mismo fotograma del golpe
    ctx.save(); ctx.translate(x + Math.sin(a * 60) * 4 * (1 - clamp(a / 0.4)), y); ctx.rotate(rot); ctx.scale(k * (1 + 0.15 * out), k * (1 + 0.15 * out));
    ctx.globalAlpha *= 1 - out;
    G.text(ctx, text, 0, size * 0.36, { size, fam: FAM, weight: 400, color, align: 'center', stroke, strokeW: size * 0.2, boil: 0.5 });
    ctx.restore();
  };
  // bocadillo de diálogo (letra a mano)
  L.bubble = (ctx, l, x, y, tx, ty, t, { size = 56 } = {}) => G.bubble(ctx, l.text, x, y, tx, ty, t, l.t, l.end, { size });
  L.line = (who, n = 0) => S.lines.filter((l) => l.who === who)[n];

  // el cartel de cada regla: entra GRANDE en el centro, luego se encoge a cabecera
  L.ruleCard = (ctx, r, t) => {
    const a = t - r.t; if (a < 0 || t >= r.end) return;
    const k = ease.inOutCubic(clamp((a - 1.05) / 0.35));
    const slam = a < 0.2 ? 1.9 - 0.9 * ease.outBack(clamp(a / 0.2), 1.6) : 1;
    const cx = SAFE.x + SAFE.w / 2, cy = lerp(560, 300, k), sc = lerp(1, 0.48, k) * slam;
    const tsize = r.title.length > 20 ? 58 : 66;
    const tl = wrap(ctx, parse(r.title), tsize, 720);
    const w = 820, h = 170 + tl.length * tsize * 1.1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(lerp(-0.035, -0.02, k) + U.springKick(t, r.t, 3, 7) * 0.05);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 14, -h / 2 + 16, w, h);
    G.tornPaper(ctx, -w / 2, -h / 2, w, h, { seed: r.n * 13, fill: '#F6EED8' });
    G.text(ctx, `REGLA #${r.n}`, 0, -h / 2 + 118, { size: 104, fam: FAM, weight: 400, color: L.C.red, align: 'center', stroke: '#16121C', strokeW: 10, boil: 0.4 });
    tl.forEach((ln, li) => G.text(ctx, ln.ws.map((q) => q.w).join(' '), 0, -h / 2 + 118 + 34 + (li + 1) * tsize * 1.08, { size: tsize, fam: 'Permanent Marker', weight: 400, color: '#16121C', align: 'center', boil: 0.4 }));
    G.tape(ctx, -w / 2 + 20, -h / 2 - 4, 90, 30, -0.5, r.n * 3);
    G.tape(ctx, w / 2 - 20, -h / 2 - 4, 90, 30, 0.5, r.n * 5);
    ctx.restore();
  };

  // ---------- cámara, temblor, luz ----------
  const SHAKES = [[S.ev.hookHit, 16], [S.ev.kevin, 10], [S.ev.clank, 24], [S.ev.sneeze, 26], [S.ev.cat, 14], [S.ev.flash, 10], [S.ev.scream, 30], [S.ev.smash, 8], [S.ev.door, 28], [S.ev.r5roast, 18], [S.ev.outro, 10], [S.ev.end, 22],
    ...S.rules.map((r) => [r.t, 12]), ...S.titleWords.map((w) => [w.t, 9])];
  L.shake = (t) => {
    let a = 0;
    for (const [h, amp] of SHAKES) if (t >= h && t - h < 0.6) a += amp * Math.exp(-(t - h) * 9);
    return [U.noise1(t * 30, 3) * a, U.noise1(t * 30, 7) * a];
  };
  L.cam = (ctx, t, { zoom = 1, cx = W / 2, cy = H / 2, rot = 0, shake = 1 } = {}, fn) => {
    const [sx, sy] = L.shake(t);
    ctx.save();
    ctx.translate(cx + sx * shake, cy + sy * shake); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy); // (cx, cy) = punto fijo del zoom
    fn(ctx);
    ctx.restore();
  };
  // oscuridad con agujeros de luz (linterna, bombilla, fuego)
  let darkC = null;
  L.dark = (ctx, lights, { color = 'rgba(8,8,22,0.9)' } = {}) => {
    if (!darkC) darkC = G.makeCanvas(W, H);
    const d = darkC.getContext('2d');
    d.setTransform(1, 0, 0, 1, 0, 0);
    d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W, H);
    d.fillStyle = color; d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    for (const l of lights) {
      d.save();
      if (l.cone) { // un cono de linterna
        const { x, y, ang, spread = 0.38, len = 1400 } = l;
        d.beginPath(); d.moveTo(x, y); d.arc(x, y, len, ang - spread, ang + spread); d.closePath(); d.clip();
        const g = d.createRadialGradient(x, y, 0, x, y, len);
        g.addColorStop(0, `rgba(0,0,0,${l.k ?? 1})`); g.addColorStop(0.75, `rgba(0,0,0,${(l.k ?? 1) * 0.85})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        d.fillStyle = g; d.fillRect(0, 0, W, H);
      } else {
        const g = d.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, `rgba(0,0,0,${l.k ?? 1})`); g.addColorStop(l.soft ?? 0.55, `rgba(0,0,0,${(l.k ?? 1) * 0.8})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        d.fillStyle = g; d.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
      d.restore();
    }
    ctx.drawImage(darkC, 0, 0, W, H);
  };
  L.tint = (ctx, color, alpha, mode = 'multiply') => { ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); };
  L.flash = (ctx, t, t0, { dur = 0.35, color = '#FFFFFF', max = 1 } = {}) => { const a = t - t0; if (a < 0 || a > dur) return; ctx.save(); ctx.globalAlpha = max * Math.pow(1 - a / dur, 2); ctx.fillStyle = color; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); };
  L.speedLines = (ctx, t, { n = 14, seed = 9, dir = 1, y0 = 700, y1 = 1600, alpha = 0.5 } = {}) => {
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const y = y0 + U.hash(seed, i) * (y1 - y0), len = 120 + U.hash(seed, i, 2) * 220, sp = 1800 + U.hash(seed, i, 3) * 900;
      const x = ((U.hash(seed, i, 4) * (W + 600) - t * sp * dir) % (W + 600) + (W + 600)) % (W + 600) - 300;
      ctx.lineWidth = 4 + U.hash(seed, i, 5) * 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * dir, y); ctx.stroke();
    }
    ctx.restore();
  };
})();
