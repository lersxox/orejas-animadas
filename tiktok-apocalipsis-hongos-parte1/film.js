// THE FILM: "Guía para no morir como un tonto — Parte 1". Una lista de escenas por tiempo; cada fotograma es
// función pura de t. Los cortes caen en las líneas de compás de score.js, igual que los golpes de song.js.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio, L = globalThis.L, B = globalThis.BG;
  const { clamp, lerp, ease } = U;
  const { T, ev } = S;
  const W = G.W, H = G.H;
  const C = L.CAST;
  const KS = 1.3; // escala de Kevin en plano general

  // ---------- piezas comunes ----------
  const lupe = (ctx, o) => {
    const p = { pose: 'stand', s: 1.3, style: C.lupe, seed: 340, brows: 'determined', ...o };
    Ch.person(ctx, p);
    L.onBody(ctx, p, (c, hip) => L.backpackStraps(c, hip));
    L.onHead(ctx, p, (c) => { L.bandana(c); if (o.mask) L.gasMask(c); });
    return p;
  };
  const kevin = (ctx, o) => { const p = { pose: 'stand', s: KS, style: C.kevin, seed: 300, ...o }; Ch.person(ctx, p); return p; };
  const sleeping = (c, t) => {
    L.zombie(c, { t, x: 190, y: 1450, s: 0.95, kind: 'zombie2', ph: 1, seed: 510, reach: 0, eyes: 'closed', mouth: 'o', headRot: 0.32, zzz: true });
    L.zombie(c, { t, x: 880, y: 1440, s: 0.92, kind: 'zombie3', ph: 2.5, seed: 560, reach: 0, eyes: 'closed', mouth: 'o', headRot: -0.3, zzz: true });
  };
  // el antebrazo derecho de Kevin con la venda y la mordida (en sus unidades): hombro -> mano
  function bite(c, hand, t, { shroom = 1 } = {}) {
    const sh = [60, -306], k = 0.62;
    const x = lerp(sh[0], hand[0], k), y = lerp(sh[1], hand[1], k), ang = Math.atan2(hand[1] - sh[1], hand[0] - sh[0]);
    c.save(); c.translate(x, y); c.rotate(ang);
    const glow = 0.5 + 0.5 * Math.sin(t * 6);
    c.fillStyle = `rgba(160,230,90,${0.25 + 0.25 * glow})`; c.beginPath(); c.ellipse(0, 0, 70, 44, 0, 0, 7); c.fill();
    G.rrect(c, -40, -22, 80, 44, 8, { fill: '#F4F0E6', lw: 3.5, seed: 1701, hatch: { color: 'rgba(0,0,0,0.08)', gap: 6 } });
    for (let i = 0; i < 4; i++) { c.fillStyle = '#B0242A'; c.beginPath(); c.arc(-18 + i * 12, -6 + (i % 2) * 4, 4, 0, 7); c.fill(); c.beginPath(); c.arc(-18 + i * 12, 10 - (i % 2) * 4, 4, 0, 7); c.fill(); }
    if (shroom > 0) L.shroom(c, 10, -20, 0.55 * shroom, { seed: 1702, cap: '#C9773E', rot: -0.1 });
    c.restore();
  }

  // ======================= LAS ESCENAS =======================
  // 0 · GANCHO: Kevin tan feliz con el móvil… y los infectados acercándose
  function sHook(ctx, t) {
    const u = clamp(t / T(1));
    L.cam(ctx, t, { zoom: lerp(1, 1.07, u), cx: 540, cy: 1150 }, (c) => {
      B.draw(c, 'city');
      L.spores(c, t, { n: 50, seed: 1, y0: 300, y1: 1700, speed: 35 });
      L.zombie(c, { t, x: 170 + t * 22, y: 1440, s: 0.9, kind: 'zombie2', ph: 1, seed: 510, look: 0.6, walk: t * 0.5, pose: 'walk' });
      L.zombie(c, { t, x: 930 - t * 20, y: 1430, s: 0.86, kind: 'zombie', ph: 2, seed: 540, look: -0.6, walk: t * 0.5 + 0.3, pose: 'walk' });
      const k = kevin(c, { x: 540, y: 1660, gesture: 'phone', eyes: 'happy', mouth: L.mouth('kevin', t) || 'smile', lookY: 0.5, headRot: Math.sin(t * Math.PI * 2) * 0.05 });
      L.onHead(c, k, (h) => { for (const sd of [-1, 1]) G.ellipse(h, sd * 64, 16, 8, 9, { fill: '#FFFFFF', lw: 2.5, seed: 330 + sd }); });
      L.bubble(c, S.lines[0], 790, 820, 620, 1020, t);
    });
  }
  // 1 · "…NO SEAS COMO KEVIN." primer plano; una mano de zombi se le posa en el hombro
  function sKevinClose(ctx, t) {
    const a = t - ev.kevin;
    L.cam(ctx, t, { zoom: 1.55 - 0.05 * a, cx: 560, cy: 1050, shake: 0.4 }, (c) => B.draw(c, 'city'));
    L.tint(ctx, '#3B2F55', 0.3);
    L.spores(ctx, t, { n: 30, seed: 2, speed: 50, size: 1.6 });
    L.cam(ctx, t, { shake: 0.6 }, (c) => {
      const scared = t >= ev.hand + 0.45;
      const k = kevin(c, { x: 520, y: 2100, s: 2.35, gesture: scared ? null : 'wave', eyes: scared ? 'wide' : 'happy', mouth: scared ? 'o' : 'grin', brows: scared ? 'up' : 'neutral', look: scared ? 0.9 : 0, headRot: scared ? 0.05 : Math.sin(a * 5) * 0.04, sweat: scared ? 1 : 0, handR: scared ? [120, -250] : undefined, handL: scared ? [-120, -250] : undefined });
      if (t >= ev.hand) {
        const u = ease.outCubic(clamp((t - ev.hand) / 0.28));
        const [sx, sy] = L.pt(k, 64, -300);
        const hx = lerp(W + 160, sx + 40, u), hy = sy - 30;
        G.limb(c, [[W + 260, hy + 260], [lerp(W + 200, hx + 170, u), hy + 90], [hx + 60, hy + 10]], { color: '#6E6A5A', lw: 80, seed: 610 });
        G.ellipse(c, hx + 20, hy, 62, 44, { fill: C.zombie.skin, lw: 4.5, seed: 611 });
        for (let f = 0; f < 4; f++) G.limb(c, [[hx - 10 + f * 20, hy + 10], [hx - 30 + f * 18, hy + 56], [hx - 36 + f * 18, hy + 86]], { color: C.zombie.skin, lw: 24, seed: 612 + f });
        L.bracket(c, hx + 130, hy + 70, 1.2, 620, -0.3);
      }
    });
  }
  // 2 · TÍTULO: una palabra por corchea
  const TITLE_ROWS = [[['GUÍA', 'PARA'], 600, 128], [['NO', 'MORIR'], 800, 140], [['COMO', 'UN'], 975, 96], [['TONTO'], 1200, 200]];
  function sTitle(ctx, t) {
    B.draw(ctx, 'title');
    ctx.save(); ctx.translate(540, 900); ctx.rotate((t - ev.title) * 0.25);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? 'rgba(130,190,90,0.10)' : 'rgba(255,220,120,0.05)'; const a0 = (i / 18) * Math.PI * 2, a1 = ((i + 1) / 18) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 2400, Math.sin(a0) * 2400); ctx.lineTo(Math.cos(a1) * 2400, Math.sin(a1) * 2400); ctx.fill(); }
    ctx.restore();
    L.spores(ctx, t, { n: 60, seed: 3, speed: 60, size: 1.3 });
    L.cam(ctx, t, { shake: 0.8 }, (c) => {
      let wi = 0;
      for (const [words, y, size0] of TITLE_ROWS) {
        const pad = 34, gap = 24;
        let size = size0;
        const meas = () => words.map((w) => G.measure(c, w, size, 'Bungee', 400) + pad * 2);
        let ws = meas(), tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
        if (tot > 900) { size *= 900 / tot; ws = meas(); tot = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1); }
        let x = 500 - tot / 2;
        words.forEach((w, j) => {
          const tw = S.titleWords[wi++], a = t - tw.t;
          if (a >= 0) {
            const k = ease.outBack(clamp(a / 0.13), 1.8), sc = lerp(2.5, 1, k);
            const red = w === 'TONTO', rot = (U.hash(wi, 7) - 0.5) * 0.16;
            c.save(); c.translate(x + ws[j] / 2, y); c.rotate(rot); c.scale(sc, sc); c.globalAlpha *= clamp(a / 0.05);
            const h = size * 1.25;
            G.tornPaper(c, -ws[j] / 2, -h / 2, ws[j], h, { seed: 40 + wi, fill: red ? '#E5383B' : '#F6EED8' });
            G.text(c, w, 0, size * 0.36, { size, fam: 'Bungee', weight: 400, color: red ? '#FFFFFF' : '#16121C', align: 'center', boil: 0.4, stroke: red ? '#16121C' : undefined, strokeW: 10 });
            c.restore();
          }
          x += ws[j] + gap;
        });
      }
      // la pegatina PARTE 1
      const a = t - ev.parte1;
      if (a >= 0) {
        const k = ease.outBack(clamp(a / 0.16), 2.5);
        c.save(); c.translate(760, 1400); c.rotate(0.14); c.scale(k, k);
        const pts = []; for (let i = 0; i < 24; i++) { const r = i % 2 ? 128 : 150; const an = (i / 24) * Math.PI * 2; pts.push([Math.cos(an) * r, Math.sin(an) * r * 0.62]); }
        G.shape(c, pts, { fill: '#FFD23F', lw: 5, seed: 77 });
        G.text(c, 'PARTE 1', 0, 20, { size: 58, fam: 'Bungee', weight: 400, color: '#16121C', align: 'center', boil: 0.4 });
        c.restore();
      }
    });
  }

  // 3 · REGLA 1, Kevin pasea con la música a tope entre infectados dormidos
  function kevinWalkR1(t) { return Ch.walk(t, { x0: -120, speed: 200, t0: ev.r1, stride: 300, s: KS }); }
  function sR1walk(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'city');
      L.spores(c, t, { n: 40, seed: 1, y0: 300, y1: 1700, speed: 35 });
      sleeping(c, t);
      L.can(c, 700, 1652, 1.1, Math.PI / 2);
      const w = kevinWalkR1(t);
      const k = kevin(c, { ...w, y: 1680, gesture: 'phone', eyes: 'happy', mouth: 'grin', headRot: Math.sin(t * Math.PI * 2) * 0.07 });
      const [px, py] = L.pt(k, 26, -248);
      const cols = ['#FFFFFF', '#FFD23F', '#8FD3FF', '#F7A1C4'];
      for (const n of S.phoneNotes) {
        const a = t - n.t; if (a < 0 || a > 1.6) continue;
        const dir = n.i % 2 ? 1 : -0.7;
        c.save(); c.globalAlpha *= 1 - a / 1.6;
        L.note(c, px + a * 150 * dir + Math.sin(a * 6 + n.i) * 22, py - 60 - a * 300, 0.8 + (n.midi % 5) * 0.08, Math.sin(a * 4 + n.i) * 0.3, cols[n.i % 4]);
        c.restore();
      }
      const last = [...S.phoneNotes].reverse().find((n) => n.t <= t);
      if (last && t - last.t < 0.3) { const k2 = (t - last.t) / 0.3; c.save(); c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k2)})`; c.lineWidth = 6; for (const r of [40, 70]) { c.beginPath(); c.arc(px, py, r + k2 * 40, -2.4, -0.7); c.stroke(); } c.restore(); }
    });
  }
  // 4 · ¡CLANK! la lata… y se despiertan
  function sClank(ctx, t) {
    const a = t - ev.clank;
    L.cam(ctx, t, { zoom: lerp(1, 1.08, ease.outCubic(clamp(a / 0.5))), cx: 540, cy: 1250 }, (c) => {
      B.draw(c, 'city');
      L.spores(c, t, { n: 40, seed: 1, y0: 300, y1: 1700, speed: 35 });
      const z = [[190, 1450, 0.95, 'zombie2', 510, 0.32, 1], [880, 1440, 0.92, 'zombie3', 560, -0.3, -1]];
      z.forEach(([x, y, s, kind, seed, hr, look], i) => {
        const awake = t >= S.turns[i];
        L.zombie(c, { t, x, y, s, kind, ph: i * 1.5, seed, reach: awake ? 0.8 : 0, eyes: awake ? 'wide' : 'closed', mouth: awake ? 'open' : 'o', headRot: awake ? -hr * 0.3 + Math.sin(t * 40) * 0.02 * clamp(1 - (t - S.turns[i]) * 3) : hr, look: awake ? look : 0, zzz: !awake, glow: awake ? 1 : 0 });
        if (awake) L.sfx(c, '!', x + 70 * s, y - 640 * s, t, S.turns[i], { size: 110, color: '#E5383B', rot: 0.1, life: 0.95 });
      });
      if (t >= S.turns[2]) { // un tercero asoma detrás del coche
        const u = ease.outBack(clamp((t - S.turns[2]) / 0.2), 2);
        c.save(); c.beginPath(); c.rect(-100, 0, 600, 1262); c.clip();
        L.zombie(c, { t, x: 120, y: lerp(1700, 1380, u), s: 0.8, kind: 'zombie', ph: 3, seed: 590, reach: 0.9, eyes: 'wide', mouth: 'open', look: 1, glow: 1, shadow: false });
        c.restore();
      }
      if (a < 0.7) L.can(c, 720 + 600 * a, 1630 - 1500 * a + 1700 * a * a, 1.1, a * 22);
      kevin(c, { x: 680, y: 1680, gesture: 'phone', eyes: 'wide', mouth: 'o', brows: 'up', sweat: 1, look: -0.6, sx: 1 + 0.06 * U.pulse(t, ev.clank, 8), sy: 1 - 0.08 * U.pulse(t, ev.clank, 8) });
    });
    L.sfx(ctx, '¡CLANK!', 560, 900, t, ev.clank, { size: 150, rot: -0.12, life: 1.6 });
    L.flash(ctx, t, ev.clank, { dur: 0.15, color: '#FFF3C4', max: 0.55 });
  }
  // 5 · roast: ¡a correr!
  function sChase(ctx, t) {
    const a = t - ev.r1roast;
    L.cam(ctx, t, { zoom: 1.04, cx: 540, cy: 1200 }, (c) => {
      B.draw(c, 'city');
      L.speedLines(c, t, { dir: -1, y0: 800, y1: 1650, alpha: 0.35 });
      const w = Ch.walk(t, { x0: 120, speed: 380, t0: ev.r1roast, stride: 300, s: KS });
      for (let i = 2; i >= 0; i--) {
        const zw = Ch.walk(t, { x0: 120 - 250 - i * 170, speed: 380, t0: ev.r1roast, stride: 300, s: 1.0 });
        L.zombie(c, { t, ...zw, y: 1560 - i * 30, s: 1.0 - i * 0.06, kind: ['zombie', 'zombie2', 'zombie3'][i], ph: i, seed: 520 + i * 30, look: 1, glow: 0.6, eyes: 'wide', mouth: 'open' });
      }
      kevin(c, { ...w, y: 1690, eyes: 'wide', mouth: 'open', brows: 'up', sweat: 1, look: -0.8, handL: [-150, -500 - Math.sin(a * 20) * 20], handR: [150, -500 + Math.sin(a * 20) * 20] });
    });
  }
  // 6 · ✓ Lupe de puntillas, dedo en los labios
  function sR1ok(ctx, t) {
    const a = t - ev.r1ok;
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'city');
      L.spores(c, t, { n: 40, seed: 1, y0: 300, y1: 1700, speed: 35 });
      sleeping(c, t);
      const w = Ch.walk(t, { x0: 360, speed: 90, t0: ev.r1ok, stride: 220, s: 1.3 });
      const p = lupe(c, { ...w, y: 1660 - 18 - Math.abs(Math.sin(a * Math.PI * 2)) * 10, handR: [16, -362], handL: [-150, -250], look: 0.7, mouth: 'flat' });
      const [mx, my] = L.headPt(p, 70, 30);
      G.decor(() => G.text(c, 'shhh…', mx + 30, my - 10, { size: 52, fam: 'Permanent Marker', weight: 400, color: '#FFFFFF', stroke: '#16121C', strokeW: 8, alpha: clamp(a * 3) }));
    });
  }

  // 7 · REGLA 2, el sótano: "¿huele a pizza?" y Kevin inhala
  function basementLight(ctx, x = 480) { L.dark(ctx, [{ x: 600, y: 700, r: 1150, k: 0.95, soft: 0.5 }, { x: 60, y: 600, r: 520, k: 0.7 }, { x, y: 1250, r: 620, k: 0.6 }], { color: 'rgba(4,16,12,0.76)' }); }
  function fog(ctx, t) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) { const x = 200 + i * 180 + Math.sin(t * 0.5 + i) * 60, y = 1000 + Math.cos(t * 0.4 + i * 2) * 200; const g = ctx.createRadialGradient(x, y, 0, x, y, 380); g.addColorStop(0, 'rgba(150,200,90,0.16)'); g.addColorStop(1, 'rgba(150,200,90,0)'); ctx.fillStyle = g; ctx.fillRect(x - 380, y - 380, 760, 760); }
    ctx.restore();
    L.spores(ctx, t, { n: 110, seed: 4, speed: 22, size: 1.1, y0: 200, y1: 1800 });
  }
  const KX2 = 450;
  function kevinR2(t) {
    if (t < ev.inhale) { const w = Ch.walk(t, { x0: -150, speed: 300, t0: ev.r2, stride: 300, s: KS }); if (w.x < KX2) return w; }
    return { x: KX2, pose: 'stand' };
  }
  function sR2(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'basement');
      const inh = clamp((t - ev.inhale) / (T(10) - ev.inhale - 0.3));
      const w = kevinR2(t);
      const k = kevin(c, { ...w, y: 1680, eyes: t >= ev.inhale ? 'closed' : 'normal', mouth: t >= ev.inhale ? 'o' : (L.mouth('kevin', t) || 'smile'), brows: 'up', look: t < ev.inhale ? Math.sin(t * 2) * 0.6 : 0, headRot: -0.12 * ease.inOutQuad(inh), sy: 1 + 0.07 * ease.inOutQuad(inh), sx: 1 - 0.02 * inh });
      fog(c, t);
      if (t >= ev.inhale) { // las esporas entran en espiral por la nariz
        const [nx, ny] = L.headPt(k, 0, 18);
        for (let i = 0; i < 46; i++) {
          const p = clamp((t - ev.inhale - i * 0.03) / 1.1); if (p <= 0 || p >= 1) continue;
          const r = 520 * (1 - p), an = U.hash(9, i) * Math.PI * 2 + p * 5;
          c.fillStyle = `rgba(231,240,138,${0.9 * Math.sin(Math.PI * p)})`; c.beginPath(); c.arc(nx + Math.cos(an) * r, ny + Math.sin(an) * r * 0.8, 5 + 4 * (1 - p), 0, 7); c.fill();
        }
      }
      basementLight(c, w.x);
      L.bubble(c, S.lines[1], 660, 840, 520, 1040, t);
      L.sfx(c, 'SNIIIIFF', 800, 1000, t, T(9, 0.5), { size: 70, color: '#B9F07A', rot: 0.08, life: 1.3 });
    });
  }
  // 8 · ¡ACHÍS! y le salen setas en la cabeza
  const POPS = [[-36, -96, 0.85, -0.35, '#D9643A'], [10, -112, 1.05, 0.05, '#E8A24A'], [52, -86, 0.8, 0.4, '#B24A6A']];
  function shrooms(c, k, t, { wob = 0 } = {}) {
    L.onHead(c, k, (h) => POPS.forEach(([x, y, s, r, col], i) => {
      const a = t - S.pops[i].t; if (a < 0) return;
      const sc = s * ease.outBack(clamp(a / 0.2), 3.2);
      L.shroom(h, x, y + 10, sc, { cap: col, rot: r + Math.sin(t * 5 + i) * wob, seed: 1800 + i * 5 });
    }));
  }
  function sSneeze(ctx, t) {
    const a = t - ev.sneeze;
    L.cam(ctx, t, { zoom: 1.06, cx: 520, cy: 1250 }, (c) => {
      B.draw(c, 'basement');
      const k = kevin(c, { x: KX2, y: 1680, eyes: a < 0.3 ? 'closed' : 'wide', mouth: 'open', brows: 'up', rot: 0.1 * U.pulse(t, ev.sneeze, 5), headRot: 0.15 * U.pulse(t, ev.sneeze, 4), lookY: -1, look: 0.2 });
      shrooms(c, k, t, { wob: 0.05 });
      fog(c, t);
      const [nx, ny] = L.headPt(k, 0, 18);
      L.puff(c, t, ev.sneeze, nx, ny, { n: 40, seed: 11, speed: 900, life: 1.4, size: 1.6 });
      basementLight(c);
      S.pops.forEach((p, i) => { const [hx, hy] = L.headPt(k, POPS[i][0], POPS[i][1] - 90); L.sfx(c, 'POP', hx + (i - 1) * 40, hy - 30, t, p.t, { size: 56, color: '#FFFFFF', rot: (i - 1) * 0.2, life: 0.7 }); });
    });
    L.sfx(ctx, '¡ACHÍS!', 520, 860, t, ev.sneeze, { size: 160, rot: -0.1, life: 1.2, color: '#B9F07A' });
  }
  // 9 · roast: primer plano, Kevin bizco mirando sus setas
  function sR2roast(ctx, t) {
    L.cam(ctx, t, { zoom: 1.6, cx: 470, cy: 1100, shake: 0.3 }, (c) => B.draw(c, 'basement'));
    L.tint(ctx, '#0B1A14', 0.45);
    L.spores(ctx, t, { n: 60, seed: 5, speed: 30, size: 1.8 });
    L.cam(ctx, t, { shake: 0.5 }, (c) => {
      const k = kevin(c, { x: 520, y: 2150, s: 2.35, eyes: 'wide', mouth: 'wavy', brows: 'worried', lookY: -1, look: Math.sin(t * 3) * 0.3, headRot: Math.sin(t * 2) * 0.04 });
      shrooms(c, k, t, { wob: 0.12 });
      for (let b = 0; b < 4; b++) { const t0 = ev.r2roast + b * 0.5; const [hx, hy] = L.headPt(k, POPS[b % 3][0], POPS[b % 3][1] - 120); L.puff(c, t, t0, hx, hy, { n: 12, seed: 20 + b, speed: 300, life: 0.8, size: 1.3 }); }
    });
  }
  // 10 · ✓ Lupe con la máscara de gas
  function sR2ok(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'basement');
      const p = lupe(c, { x: 520, y: 1680, s: 1.4, gesture: 'thumbsUp', mask: true, eyes: 'happy', mouth: 'smile' });
      fog(c, t);
      basementLight(c, 520);
      const [lx, ly] = L.headPt(p, -27, -6);
      const tw = clamp((t - ev.r2ok - 0.5) / 0.4);
      if (tw > 0 && tw < 1) G.star(c, lx - 10, ly - 10, 30 * Math.sin(Math.PI * tw), { fill: '#FFFFFF', rot: tw });
    });
  }

  // 11 · REGLA 3, el campamento: "Kevin… ¿y ese brazo?"
  function campLight(ctx, t) {
    const fl = 1 + 0.06 * U.noise1(t * 6, 2);
    L.dark(ctx, [{ x: 540, y: 1500, r: 980 * fl, k: 0.95, soft: 0.45 }], { color: 'rgba(8,6,26,0.82)' });
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; const g = ctx.createRadialGradient(540, 1500, 0, 540, 1500, 900); g.addColorStop(0, 'rgba(255,150,60,0.6)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function sR3(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'camp');
      const asked = t >= ev.ask;
      lupe(c, { x: 255, y: 1478, s: 1.05, pose: 'sit', gesture: asked ? 'point' : null, eyes: 'normal', brows: asked ? 'up' : 'neutral', look: 0.8, mouth: L.mouth('lupe', t) || 'flat' });
      const k = kevin(c, { x: 815, y: 1478, s: 1.05, pose: 'sit', crossArms: true, eyes: 'normal', look: asked ? -0.7 : 0.3, mouth: L.mouth('kevin', t) || (asked ? 'grin' : 'smile'), brows: asked ? 'worried' : 'neutral', sweat: asked ? 1 : 0 });
      L.onBody(c, k, (b) => { G.rrect(b, -112, -40, 44, 26, 6, { fill: '#F4F0E6', lw: 3, seed: 1710 }); L.shroom(b, -96, -44, 0.32, { seed: 1711, cap: '#C9773E', rot: -0.5 }); });
      B.fire(c, 540, 1600, t, 0.9);
      campLight(c, t);
      L.bubble(c, L.line('lupe'), 320, 830, 280, 1080, t, { size: 50 });
      L.bubble(c, S.lines[3], 700, 960, 800, 1090, t, { size: 50 });
    });
  }
  // 12 · el gato, ofendido
  function sCat(ctx, t) {
    const a = t - ev.cat;
    L.cam(ctx, t, { zoom: lerp(1.3, 1.0, ease.outCubic(clamp(a / 0.3))), cx: 540, cy: 1200 }, (c) => {
      B.draw(c, 'camp');
      G.rrect(c, 330, 1480, 420, 230, 10, { fill: '#8E6444', lw: 5, seed: 1720, hatch: { color: 'rgba(0,0,0,0.2)', gap: 9 } });
      G.line(c, [[340, 1590], [740, 1590]], { lw: 4, color: '#5A3A22', seed: 1721 });
      const m = L.mouth('cat', t);
      Ch.cat(c, { x: 540, y: 1490, s: 3.0, t, look: 0, happy: 0, meow: m ? m.open : 0, color: '#8E8A94' });
      if (t > ev.cat + 0.4) { // la venita de enfado
        const k = ease.outBack(clamp((t - ev.cat - 0.4) / 0.15), 3);
        c.save(); c.translate(690, 1030); c.scale(k, k); c.rotate(0.3);
        for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); G.line(c, [[8, -8], [26, -12], [30, -30]], { lw: 8, color: '#E5383B', seed: 1730 + i }); c.restore(); }
        c.restore();
      }
      B.fire(c, 160, 1700, t, 0.6);
      L.dark(c, [{ x: 540, y: 1250, r: 900, k: 0.9 }], { color: 'rgba(8,6,26,0.7)' });
      L.bubble(c, S.lines[4], 540, 800, 560, 990, t, { size: 64 });
    });
  }
  // 13 · roast: Kevin enseña el brazo (venda, mordida… y una seta)
  function sR3roast(ctx, t) {
    L.cam(ctx, t, { zoom: 1.02, cx: 540, cy: 1250 }, (c) => {
      B.draw(c, 'camp');
      const hand = [150, -560];
      const blink = Math.sin(t * 9) > 0.85;
      const k = kevin(c, { x: 540, y: 1700, s: 1.4, handR: hand, handL: [-110, -230], eyes: blink ? 'closed' : 'wide', mouth: 'grin', brows: 'worried', sweat: 1, look: -0.4, headRot: Math.sin(t * 17) * 0.02 });
      L.onBody(c, k, (b) => bite(b, hand, t));
      B.fire(c, 900, 1720, t, 0.6);
      campLight(c, t);
    });
  }
  // 14 · ✓ Kevin avisa (con aureola) y Lupe le cura
  function sR3ok(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'camp');
      const hand = [140, -540];
      const k = kevin(c, { x: 360, y: 1690, s: 1.3, handR: hand, eyes: 'normal', brows: 'worried', mouth: L.mouth('kevin', t) || 'wavy', look: 0.4 });
      L.onBody(c, k, (b) => bite(b, hand, t, { shroom: 0 }));
      const [hx, hy] = L.headPt(k, 0, -110);
      L.halo(c, hx, hy, 1.3, t);
      const p = lupe(c, { x: 790, y: 1690, s: 1.25, gesture: 'thumbsUp', handL: [-120, -250], eyes: 'happy', mouth: 'smile', look: -0.5 });
      const [mx, my] = L.pt(p, -120, -250);
      L.medkit(c, mx - 10, my + 10, 1.1);
      campLight(c, t);
      L.bubble(c, S.lines[7], 330, 860, 340, 1020, t, { size: 50 });
    });
  }

  // 15 · REGLA 4, el centro comercial: el Coliflor
  const CX4 = 380;
  function mallLight(ctx, extra = []) { L.dark(ctx, [{ x: 500, y: 1050, r: 1000, k: 0.88, soft: 0.4 }, ...extra], { color: 'rgba(6,8,24,0.84)' }); }
  function kevinR4(t) {
    if (t < T(18, 2)) return { x: 1300, pose: 'stand' };
    const w = Ch.walk(t, { x0: 1180, speed: -260, t0: T(18, 2), stride: 220, s: KS });
    return w.x > 720 ? w : { x: 720, pose: 'stand' };
  }
  function sR4(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'mall');
      L.spores(c, t, { n: 40, seed: 6, speed: 20, alpha: 0.6 });
      const cf = L.coliflor(c, { t, x: CX4, y: 1580, s: 1.35, twitch: 1 });
      const w = kevinR4(t);
      const selfie = t >= ev.selfieUp;
      const k = kevin(c, { ...w, y: 1680, eyes: selfie ? 'happy' : 'normal', mouth: L.mouth('kevin', t) || (selfie ? 'grin' : 'flat'), brows: selfie ? 'neutral' : 'worried', look: -0.5, headRot: selfie ? -0.12 : 0, handR: selfie ? [150, -600] : [40, -260], handL: selfie ? [-150, -470] : [-110, -250], sy: selfie ? 1 : 1.02 });
      if (selfie) { const [px, py] = L.pt(k, 150, -640); L.phone(c, px, py, 1.4, -0.35, { screen: '#B8E6FF' }); }
      const [hx, hy] = L.headPt(cf, 0, -40);
      mallLight(c, [{ x: k.x, y: 1250, r: 520, k: 0.55 }, ...(selfie ? [{ x: L.pt(k, 150, -640)[0], y: L.pt(k, 150, -640)[1], r: 320, k: 0.8 }] : [])]);
      L.clickWaves(c, hx, hy, t, 1.35);
      // la etiqueta: qué es eso
      const la = t - T(18, 2.5);
      if (la >= 0 && t < ev.selfieUp - 0.1) {
        const kk = ease.outBack(clamp(la / 0.2), 2.4);
        c.save(); c.translate(250, 800); c.rotate(-0.05); c.scale(kk, kk);
        G.tornPaper(c, -190, -70, 380, 140, { seed: 91, fill: '#F6EED8' });
        G.text(c, 'EL COLIFLOR', 0, -12, { size: 40, fam: 'Bungee', weight: 400, color: '#E5383B', align: 'center', boil: 0.3 });
        G.text(c, 'no ve, pero OYE todo', 0, 40, { size: 40, fam: 'Caveat', weight: 700, color: '#16121C', align: 'center', boil: 0.3 });
        c.restore();
        G.line(c, [[300, 880], [340, 960], [360, 1020]], { lw: 6, color: '#F6EED8', seed: 92 });
      }
      L.bubble(c, S.lines[5], 640, 830, 720, 1000, t, { size: 50 });
    });
  }
  // 16 · el CLIC del selfie, el flash… y el chillido
  function sFlash(ctx, t) {
    const a = t - ev.flash, sc = clamp((t - ev.scream) / 0.15);
    L.cam(ctx, t, { zoom: lerp(1, 1.08, ease.outCubic(clamp((t - ev.scream) / 0.4))), cx: 520, cy: 1200 }, (c) => {
      B.draw(c, 'mall');
      L.spores(c, t, { n: 40, seed: 6, speed: 20, alpha: 0.6 });
      const cf = L.coliflor(c, { t, x: CX4, y: 1580, s: 1.35, headRot: 0.25 * ease.outBack(clamp(a / 0.2), 3), twitch: 3, scream: ease.outBack(sc, 2) * (t >= ev.scream ? 1 : 0) });
      const scared = t >= ev.scream;
      const k = kevin(c, { x: 720, y: 1680, eyes: scared ? 'wide' : 'happy', mouth: scared ? 'open' : 'grin', brows: scared ? 'up' : 'neutral', sweat: scared ? 1 : 0, look: scared ? -1 : -0.5, headRot: scared ? 0 : -0.12, handR: scared ? [150, -520] : [150, -600], handL: scared ? [-150, -520] : [-150, -470], sx: scared ? 1 + 0.03 * Math.sin(t * 50) : 1 });
      if (!scared) { const [px, py] = L.pt(k, 150, -640); L.phone(c, px, py, 1.4, -0.35, { screen: '#FFFFFF' }); }
      else { const [px, py] = L.pt(k, 0, -60); const fall = clamp((t - ev.scream) / 0.5); L.phone(c, px + 60 + fall * 40, lerp(py - 400, py + 40, ease.inQuad(fall)), 1.3, fall * 6); }
      const [hx, hy] = L.headPt(cf, 0, -40);
      mallLight(c, [{ x: hx, y: hy, r: 520, k: 0.6 }, { x: 720, y: 1250, r: 520, k: 0.55 }]);
      if (scared) { c.save(); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2 + t * 2, r0 = 190 + ((t * 600 + i * 40) % 140); c.lineWidth = 6; c.beginPath(); c.moveTo(hx + Math.cos(an) * r0, hy + Math.sin(an) * r0); c.lineTo(hx + Math.cos(an) * (r0 + 70), hy + Math.sin(an) * (r0 + 70)); c.stroke(); } c.restore(); }
    });
    L.sfx(ctx, '¡CLIC!', 700, 860, t, ev.flash, { size: 110, color: '#FFFFFF', rot: 0.1, life: 1.2 });
    L.sfx(ctx, '¡SKRIIIII!', 470, 820, t, ev.scream, { size: 116, color: '#E5383B', rot: -0.08, life: 1.0 });
  }
  // 17 · roast: la foto. Aura −1000.
  function sPolaroid(ctx, t) {
    const a = t - ev.r4roast;
    ctx.fillStyle = '#141624'; ctx.fillRect(0, 0, W, H);
    L.spores(ctx, t, { n: 50, seed: 7, speed: 30, size: 1.4, alpha: 0.7 });
    L.cam(ctx, t, { shake: 0.5 }, (c) => {
      c.save(); c.translate(530, 1150); c.rotate(-0.045 + 0.02 * Math.sin(a * 2)); c.scale(1 + 0.02 * a, 1 + 0.02 * a);
      c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-370 + 18, -400 + 22, 740, 820);
      G.rrect(c, -370, -400, 740, 820, 6, { fill: '#F8F5EE', lw: 4, seed: 1900 });
      c.save(); c.beginPath(); c.rect(-330, -360, 660, 620); c.clip();
      c.translate(-330, -360); c.scale(660 / W, 620 / (H * 0.62)); c.translate(0, -H * 0.3);
      B.draw(c, 'mall');
      L.coliflor(c, { t, x: 330, y: 1700, s: 1.6, headRot: 0.3, scream: 1, twitch: 2 });
      kevin(c, { x: 720, y: 2450, s: 2.6, eyes: 'happy', mouth: 'grin', headRot: -0.12, handL: [-150, -470], handR: [150, -600], look: 0 });
      c.restore();
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(-330, -360, 660, 620); c.restore();
      G.decor(() => G.text(c, 'yo y mi nuevo amigo :)', 0, 350, { size: 52, fam: 'Caveat', weight: 700, color: '#2A2320', align: 'center' }));
      c.restore();
      const st = t - T(21, 1.5);
      if (st >= 0) {
        const k = lerp(2.2, 1, ease.outBack(clamp(st / 0.14), 1.6));
        c.save(); c.translate(560, 1260); c.rotate(-0.2); c.scale(k, k); c.globalAlpha *= clamp(st / 0.05);
        G.rrect(c, -300, -80, 600, 160, 18, { fill: 'rgba(229,56,59,0.12)', lw: 10, stroke: '#E5383B', seed: 1910 });
        G.text(c, 'AURA −1000', 0, 34, { size: 92, fam: 'Bungee', weight: 400, color: '#E5383B', align: 'center', boil: 0.5 });
        c.restore();
      }
    });
  }
  // 18 · ✓ Lupe lanza una botella lejos y el Coliflor va hacia el ruido
  function sR4ok(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'mall');
      L.spores(c, t, { n: 40, seed: 6, speed: 20, alpha: 0.6 });
      const gone = Math.max(0, t - ev.smash);
      const cf = L.coliflor(c, { t, x: 580 + gone * 140, y: 1560, s: 1.2, headRot: t >= ev.smash ? 0.4 : 0, twitch: 1, pose: gone > 0 ? 'walk' : 'stand', walk: gone * 0.8 });
      const thr = clamp((t - ev.throw + 0.25) / 0.3);
      const handR = t < ev.throw ? [lerp(100, 150, thr), lerp(-260, -560, thr)] : [150, -480];
      const sneak = Math.max(0, t - ev.smash);
      const p = lupe(c, { x: 230 + sneak * 70, y: 1680, s: 1.3, sy: 0.94, handR, handL: [-140, -260], eyes: 'normal', look: 0.8, mouth: 'flat', pose: sneak > 0 ? 'walk' : 'stand', walk: sneak * 0.7 });
      if (t >= ev.throw && t < ev.smash) {
        const u = (t - ev.throw) / (ev.smash - ev.throw);
        const [x0, y0] = L.pt(p, 150, -560);
        L.bottle(c, lerp(x0, 960, u), lerp(y0, 1300, u) - Math.sin(Math.PI * u) * 260, 1.1, u * 14);
      } else if (t < ev.throw) { const [x0, y0] = L.pt(p, handR[0], handR[1]); L.bottle(c, x0, y0, 1.1, -0.4); }
      if (t >= ev.smash) for (let i = 0; i < 12; i++) { const a = t - ev.smash, an = U.hash(13, i) * Math.PI * 2, sp = 200 + U.hash(14, i) * 300; const x = 960 + Math.cos(an) * sp * a, y = 1300 + Math.sin(an) * sp * a + 600 * a * a; if (a < 0.8) G.poly(c, [[x, y - 8], [x + 10, y + 4], [x - 6, y + 8]], { fill: '#9FE0A8', lw: 2, seed: 1950 + i, step: 6 }); }
      const [hx, hy] = L.headPt(cf, 0, -40);
      mallLight(c, t >= ev.smash ? [{ x: 960, y: 1300, r: 300 * Math.exp(-(t - ev.smash) * 3), k: 0.9 }] : []);
      L.clickWaves(c, hx, hy, t, 1.2);
    });
    L.sfx(ctx, '¡CRASH!', 860, 1160, t, ev.smash, { size: 80, color: '#FFD23F', rot: 0.12, life: 0.9 });
  }

  // 19 · REGLA 5, la puerta: "¿hola? ¿hay alguien?"
  function corridorLight(ctx, k, t, { amb = 0.55 } = {}) {
    const [fx, fy] = L.pt(k, 150, -380);
    const ang = Math.atan2(1000 - fy, 540 - fx) + Math.sin(t * 23) * 0.02;
    L.dark(ctx, [{ cone: true, x: fx, y: fy, ang, spread: 0.32, len: 1300, k: 0.95 }, { x: k.x, y: k.y - 300, r: 520, k: amb }], { color: 'rgba(4,4,12,0.93)' });
    return [fx, fy, ang];
  }
  function sR5(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'corridor');
      B.door(c, 0);
      const k = kevin(c, { x: 300 + Math.sin(t * 40) * 3, y: 1700, s: 1.35, handR: [150, -380], handL: [-110, -260], eyes: 'normal', brows: 'worried', mouth: L.mouth('kevin', t) || 'wavy', look: 0.6, lookY: -0.3, sweat: 0.6 });
      const [fx, fy, ang] = corridorLight(c, k, t);
      L.flashlight(c, fx - Math.cos(ang) * 40, fy - Math.sin(ang) * 40, 1.1, ang);
      L.bubble(c, S.lines[6], 450, 820, 330, 1060, t, { size: 52 });
    });
  }
  // 20 · la puerta se abre de golpe… ojos en la oscuridad
  function eyesIn(c, t) {
    for (const e of S.eyes) {
      const a = t - e.t; if (a < 0) continue;
      const x = 560 + U.hash(61, e.i) * 160, y = 700 + U.hash(62, e.i) * 520, s = 0.8 + U.hash(63, e.i) * 0.5;
      const k = ease.outBack(clamp(a / 0.15), 3) * (Math.sin(t * 3 + e.i * 2) > 0.96 ? 0.15 : 1);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const sd of [-1, 1]) { const g = c.createRadialGradient(x + sd * 22 * s, y, 0, x + sd * 22 * s, y, 34 * s); g.addColorStop(0, 'rgba(255,236,120,0.9)'); g.addColorStop(1, 'rgba(255,200,60,0)'); c.fillStyle = g; c.fillRect(x + sd * 22 * s - 40 * s, y - 40 * s, 80 * s, 80 * s); }
      c.restore();
      for (const sd of [-1, 1]) G.ellipse(c, x + sd * 22 * s, y, 10 * s, 7 * s * k, { fill: '#FFF0A0', lw: 0, seed: 1960 + e.i * 2 + sd, amp: 0.3 });
    }
  }
  function sDoor(ctx, t) {
    const a = t - ev.door;
    L.cam(ctx, t, { zoom: lerp(1.0, 1.1, ease.outCubic(clamp(a / 1.6))), cx: 540, cy: 1150 }, (c) => {
      B.draw(c, 'corridor');
      B.door(c, ease.outBack(clamp(a / 0.14), 1.4));
      const k = kevin(c, { x: 300 + Math.sin(t * 60) * 5, y: 1700, s: 1.35, handR: [150, -380], handL: [-110, -260], eyes: 'wide', brows: 'up', mouth: 'o', look: 0.6, sweat: 1 });
      const [fx, fy, ang] = corridorLight(c, k, t);
      L.flashlight(c, fx - Math.cos(ang) * 40, fy - Math.sin(ang) * 40, 1.1, ang);
      L.puff(c, t, ev.door, 540, 1450, { n: 24, seed: 70, speed: 700, life: 0.9, color: '200,190,170', size: 2 });
      eyesIn(c, t);
    });
  }
  // 21 · roast: Kevin sale corriendo gritando, la horda detrás
  function sR5roast(ctx, t) {
    const a = t - ev.r5roast;
    L.cam(ctx, t, { zoom: 1.05, cx: 540, cy: 1200 }, (c) => {
      B.draw(c, 'corridor');
      B.door(c, 1);
      eyesIn(c, t);
      for (let i = 0; i < 3; i++) {
        const u = clamp((a - i * 0.15) / 2);
        L.zombie(c, { t, x: 420 + i * 130 + (i - 1) * u * 60, y: lerp(1470, 1640, u), s: lerp(0.85, 1.1, u), kind: ['zombie', 'zombie2', 'zombie3'][i], ph: i, seed: 650 + i * 20, glow: 1, look: 0.5 - i * 0.4, pose: 'walk', walk: a * 1.2 + i * 0.3 });
      }
      const u = ease.inQuad(clamp(a / 2));
      const w = Ch.walk(t, { x0: 300, speed: 230, t0: ev.r5roast, stride: 300, s: 1.4 });
      kevin(c, { ...w, y: lerp(1720, 1880, u), s: lerp(1.35, 1.75, u), eyes: 'wide', mouth: 'open', brows: 'up', sweat: 1, look: -0.4, handL: [-150, -520 + Math.sin(a * 22) * 20], handR: [150, -520 - Math.sin(a * 22) * 20] });
      L.dark(c, [{ x: 600, y: 1300, r: 1100, k: 0.85, soft: 0.5 }], { color: 'rgba(4,4,12,0.8)' });
      L.speedLines(c, t, { dir: 1, y0: 700, y1: 1700, alpha: 0.25, seed: 12 });
    });
    L.sfx(ctx, '¡AAAAAH!', 700, 880, t, ev.r5roast + 0.05, { size: 110, color: '#FFFFFF', rot: 0.08, life: 1.6 });
  }
  // 22 · ✓ en grupo
  function sR5ok(ctx, t) {
    L.cam(ctx, t, {}, (c) => {
      B.draw(c, 'city');
      L.spores(c, t, { n: 40, seed: 1, y0: 300, y1: 1700, speed: 35 });
      const crew = [['tono', 170, 1650, 360], ['lupe', 420, 1690, 340], ['nora', 670, 1660, 380]];
      for (const [who, x0, y, seed] of crew) {
        const w = Ch.walk(t, { x0, speed: 45, t0: ev.r5ok, stride: 180, s: 1.15 });
        const o = { ...w, y, s: 1.15, handR: [150, -330], handL: [-100, -250], eyes: 'normal', brows: 'determined', mouth: 'smirk', look: 0.4, seed };
        const p = who === 'lupe' ? lupe(c, o) : Ch.person(c, { ...o, pose: o.pose || 'walk', style: C[who] }) || o;
        const [fx, fy] = L.pt({ ...o, pose: o.pose || 'walk' }, 150, -330);
        L.flashlight(c, fx, fy, 0.9, -0.2);
      }
    });
  }

  // 23 · final: Kevin ya es un champiñón con patas
  function sOutro(ctx, t) {
    L.cam(ctx, t, { zoom: 1.02, cx: 540, cy: 1250 }, (c) => {
      B.draw(c, 'city');
      L.tint(c, '#4A3A70', 0.35);
      L.spores(c, t, { n: 50, seed: 8, y0: 300, y1: 1700, speed: 30 });
      // la lápida
      G.rrect(c, 690, 1340, 240, 270, 90, { fill: '#8D8A96', lw: 5, seed: 2000, hatch: { color: 'rgba(0,0,0,0.15)', gap: 8 } });
      G.decor(() => { G.text(c, 'R.I.P.', 810, 1440, { size: 54, fam: 'Bungee', weight: 400, color: '#3A3644', align: 'center', boil: 0.3 }); G.text(c, 'el aura', 810, 1500, { size: 44, fam: 'Caveat', weight: 700, color: '#3A3644', align: 'center' }); G.text(c, 'de Kevin', 810, 1550, { size: 44, fam: 'Caveat', weight: 700, color: '#3A3644', align: 'center' }); });
      moss(c, 810, 1340, 200);
      const k = { x: 410, y: 1700, s: 1.3, pose: 'stand', style: C.kevinZ, gesture: 'wave', eyes: 'wide', mouth: 'smile', look: Math.sin(t * 1.3) * 0.6, headRot: Math.sin(t * 1.7) * 0.08, rot: Math.sin(t * 1.7) * 0.02, seed: 300 };
      Ch.person(c, k);
      L.onHead(c, k, (h) => { L.bracket(h, 56, -20, 0.8, 2010, 0.9); L.shroom(h, 0, -50, 2.1, { seed: 2012, cap: '#D9643A', rot: Math.sin(t * 1.7) * 0.06 }); });
      for (let b = 0; b < 3; b++) { const [hx, hy] = L.headPt(k, 0, -190); L.puff(c, t, ev.outro + 0.4 + b * 1.6, hx, hy, { n: 16, seed: 80 + b, speed: 360, life: 1.1, size: 1.4 }); }
      // SÍGUEME ->
      const fa = t - T(28, 1.5);
      if (fa >= 0) {
        const kk = ease.outBack(clamp(fa / 0.2), 2.5);
        c.save(); c.translate(720, 1130); c.rotate(-0.08); c.scale(kk, kk);
        G.text(c, 'SÍGUEME', 0, 0, { size: 64, fam: 'Bungee', weight: 400, color: '#FFD23F', align: 'center', stroke: '#16121C', strokeW: 12, boil: 0.4 });
        const bob = Math.sin(t * 8) * 8;
        G.line(c, [[120, -20], [190 + bob, -30], [230 + bob, -10]], { lw: 12, color: '#FFD23F', seed: 2020 });
        G.poly(c, [[210 + bob, -46], [262 + bob, -8], [204 + bob, 18]], { fill: '#FFD23F', lw: 4, seed: 2021, step: 12 });
        c.restore();
      }
      // el sello final
      const st = t - ev.end;
      if (st >= 0) {
        const kk = lerp(2.3, 1, ease.outBack(clamp(st / 0.14), 1.5));
        c.save(); c.translate(540, 1390); c.rotate(-0.12); c.scale(kk, kk); c.globalAlpha *= clamp(st / 0.04);
        G.rrect(c, -390, -120, 780, 240, 24, { fill: 'rgba(246,238,216,0.96)', lw: 12, stroke: '#E5383B', seed: 2030 });
        G.text(c, 'PARTE 2', 0, -4, { size: 116, fam: 'Bungee', weight: 400, color: '#E5383B', align: 'center', boil: 0.4 });
        G.text(c, 'MUY PRONTO', 0, 84, { size: 64, fam: 'Bungee', weight: 400, color: '#16121C', align: 'center', boil: 0.4 });
        c.restore();
      }
    });
    L.flash(ctx, t, ev.end, { dur: 0.25, max: 0.6 });
  }
  function moss(c, x, y, w) { for (let i = 0; i < 5; i++) G.ellipse(c, x + (i / 4 - 0.5) * w, y + Math.sin(i * 2.1) * 6, w * 0.16, 12, { fill: i % 2 ? '#5E8A3A' : '#7BA34A', lw: 2.5, seed: 2040 + i, amp: 0.8 }); }

  // ======================= el montaje =======================
  const SCENES = [
    [0, sHook], [ev.kevin, sKevinClose], [ev.title, sTitle],
    [ev.r1, sR1walk], [ev.clank, sClank], [ev.r1roast, sChase], [ev.r1ok, sR1ok],
    [ev.r2, sR2], [ev.sneeze, sSneeze], [ev.r2roast, sR2roast], [ev.r2ok, sR2ok],
    [ev.r3, sR3], [ev.cat, sCat], [ev.r3roast, sR3roast], [ev.r3ok, sR3ok],
    [ev.r4, sR4], [ev.flash, sFlash], [ev.r4roast, sPolaroid], [ev.r4ok, sR4ok],
    [ev.r5, sR5], [ev.door, sDoor], [ev.r5roast, sR5roast], [ev.r5ok, sR5ok],
    [ev.outro, sOutro],
  ];
  function draw(ctx, t) {
    let scene = SCENES[0][1];
    for (const [t0, fn] of SCENES) if (t >= t0 - 1e-6) scene = fn;
    scene(ctx, t);
    // la cabecera de la regla activa + los textos del narrador (en pantalla, sin cámara)
    for (const r of S.rules) L.ruleCard(ctx, r, t);
    const [sx, sy] = L.shake(t);
    ctx.save(); ctx.translate(sx * 0.25, sy * 0.25);
    for (const c of S.say) L.say(ctx, c, t, { y: S.rules.some((r) => t >= r.t && t < r.end) ? 395 : 360 });
    ctx.restore();
    L.flash(ctx, t, ev.flash, { dur: 0.4 });
    L.flash(ctx, t, ev.sneeze, { dur: 0.18, color: '#D8F5A0', max: 0.5 });
  }

  Studio.film({ draw, fadeOut: 0.5 });
})();
