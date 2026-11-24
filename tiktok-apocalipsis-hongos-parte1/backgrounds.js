// FONDOS: ciudad en ruinas al atardecer, sótano lleno de esporas, campamento de noche, centro comercial abandonado,
// pasillo con LA puerta. Se dibujan una vez por variante de "hervor" (Studio.cache) porque son estáticos.
(function () {
  const U = globalThis.U, G = globalThis.G, L = globalThis.L, Studio = globalThis.Studio;
  const W = G.W, H = G.H;
  const B = {};
  globalThis.BG = B;
  const rnd = (...a) => U.hash(...a);
  const lerp = U.lerp;

  function vines(c, x, y, len, seed) {
    const pts = []; for (let i = 0; i <= 8; i++) pts.push([x + Math.sin(i * 0.9 + seed) * 10, y + (i / 8) * len]);
    G.line(c, pts, { color: '#3F6B2E', lw: 4, seed, step: 14 });
    for (let i = 1; i < 8; i += 1) G.ellipse(c, pts[i][0] + (i % 2 ? 9 : -9), pts[i][1], 9, 6, { fill: i % 3 ? '#6E9B3E' : '#86B04B', lw: 2, seed: seed + i, amp: 0.6 });
  }
  function moss(c, x, y, w, seed) {
    for (let i = 0; i < 6; i++) G.ellipse(c, x + (i / 5 - 0.5) * w, y + Math.sin(i * 2.1) * 6, w * 0.16, 12, { fill: i % 2 ? '#5E8A3A' : '#7BA34A', lw: 2.5, seed: seed + i, amp: 0.8 });
  }
  function building(c, x, w, top, base, col, seed, { broken = true, windows = true, winCol = '#2B2340', lit = 0 } = {}) {
    const pts = [[x, base], [x, top + 30]];
    if (broken) { const n = 5; for (let i = 0; i <= n; i++) pts.push([x + (i / n) * w, top + (i % 2 ? 10 : 50) * rnd(seed, i) + (i === 2 ? 60 : 0)]); }
    else pts.push([x, top], [x + w, top]);
    pts.push([x + w, top + 30], [x + w, base]);
    G.poly(c, pts, { fill: col, lw: 3.5, seed, step: 24, hatch: { color: 'rgba(0,0,0,0.12)', gap: 10 } });
    if (windows) for (let yy = top + 90; yy < base - 70; yy += 90) for (let xx = x + 26; xx < x + w - 50; xx += 62) {
      const r = rnd(seed, xx, yy);
      c.fillStyle = r < lit ? 'rgba(255,214,150,0.65)' : r < 0.25 ? 'rgba(0,0,0,0.0)' : winCol;
      c.fillRect(xx, yy, 30, 46);
    }
  }

  // ---------- la ciudad en ruinas al atardecer ----------
  B.city = (c) => {
    const g = c.createLinearGradient(0, 0, 0, 1320);
    g.addColorStop(0, '#2B2450'); g.addColorStop(0.42, '#7E4677'); g.addColorStop(0.78, '#E07C5C'); g.addColorStop(1, '#F7B46A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sg = c.createRadialGradient(760, 1040, 30, 760, 1040, 460);
    sg.addColorStop(0, 'rgba(255,232,170,0.95)'); sg.addColorStop(0.3, 'rgba(255,200,140,0.45)'); sg.addColorStop(1, 'rgba(255,200,140,0)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    G.ellipse(c, 760, 1040, 118, 118, { fill: '#FFE3A8', lw: 0, seed: 2 });
    // pájaros lejanos
    for (let i = 0; i < 5; i++) { const x = 200 + i * 70 + rnd(3, i) * 40, y = 620 + rnd(4, i) * 120; G.line(c, [[x - 14, y - 6], [x, y], [x + 14, y - 6]], { lw: 3, color: '#3A2A48', seed: 10 + i }); }
    // skyline lejano
    const far = [[-40, 180, 640], [120, 150, 760], [250, 210, 560], [440, 130, 700], [560, 200, 820], [740, 150, 620], [870, 240, 700]];
    far.forEach(([x, w, top], i) => building(c, x, w, top, 1320, '#5A4472', 100 + i * 7, { winCol: '#43345C', lit: 0.06 }));
    // edificios medios con enredaderas y hongos
    const mid = [[-60, 300, 840, '#3E3152'], [700, 420, 900, '#3A2E4C']];
    mid.forEach(([x, w, top, col], i) => {
      building(c, x, w, top, 1330, col, 200 + i * 9, { winCol: '#251C33', lit: 0.1 });
      for (let k = 0; k < 4; k++) vines(c, x + 30 + k * (w / 4), top + 40 + rnd(i, k) * 40, 160 + rnd(i, k, 2) * 200, 220 + i * 20 + k);
      moss(c, x + w / 2, top + 30, w * 0.8, 260 + i * 10);
      for (let k = 0; k < 3; k++) L.bracket(c, x + (i ? 40 : w - 40), 1060 + k * 70, 1.1 - k * 0.15, 280 + i * 10 + k, i ? -0.3 : 0.3);
    });
    // pintada en la pared
    G.decor(() => G.text(c, 'NO SALGAS', 140, 1150, { size: 46, fam: 'Permanent Marker', weight: 400, color: 'rgba(214,52,52,0.85)', boil: 0 }));
    // farola doblada
    G.line(c, [[640, 1330], [640, 1010], [600, 960], [540, 950]], { lw: 12, color: '#2A2330', seed: 300 });
    G.rrect(c, 510, 940, 46, 22, 6, { fill: '#3A3344', lw: 3, seed: 301 });
    vines(c, 640, 1040, 220, 302);
    // acera y carretera agrietada
    G.rrect(c, -20, 1320, W + 40, 80, 0, { fill: '#8A8580', lw: 4, seed: 310, hatch: { color: 'rgba(0,0,0,0.1)', gap: 12 } });
    G.rrect(c, -20, 1396, W + 40, 560, 0, { fill: '#55515C', lw: 4, seed: 311, hatch: { color: 'rgba(0,0,0,0.12)', gap: 14 } });
    for (let i = 0; i < 6; i++) G.rrect(c, 40 + i * 190, 1730, 110, 18, 4, { fill: 'rgba(230,200,90,0.55)', lw: 0, seed: 320 + i });
    for (let i = 0; i < 5; i++) { const x = 80 + i * 220 + rnd(5, i) * 60; G.line(c, [[x, 1420], [x + 30, 1500], [x + 10, 1580], [x + 50, 1660]], { lw: 3, color: '#2D2A33', seed: 330 + i, step: 10 }); }
    for (let i = 0; i < 16; i++) { const x = rnd(6, i) * W, y = 1330 + (i % 3) * 140 + rnd(7, i) * 40; G.poly(c, [[x - 18, y], [x - 6, y - 34], [x, y - 8], [x + 8, y - 40], [x + 18, y]], { fill: i % 2 ? '#5E8A3A' : '#7BA34A', lw: 2.5, seed: 340 + i, step: 8 }); }
    // coche abandonado (oxidado, con musgo)
    G.rrect(c, -60, 1250, 330, 120, 30, { fill: '#9C4F33', lw: 4.5, seed: 360, hatch: { color: 'rgba(60,20,10,0.25)', gap: 8 } });
    G.poly(c, [[-20, 1250], [20, 1180], [190, 1180], [240, 1250]], { fill: '#8A4630', lw: 4, seed: 361, step: 20 });
    G.poly(c, [[10, 1246], [40, 1196], [120, 1196], [120, 1246]], { fill: '#2B2B3A', lw: 3, seed: 362, step: 14 });
    for (const wx of [20, 210]) G.ellipse(c, wx, 1372, 38, 38, { fill: '#1F1D24', lw: 4, seed: 363 + wx });
    moss(c, 110, 1178, 200, 370);
    L.shroom(c, 250, 1300, 0.6, { seed: 380, cap: '#C9773E' }); L.shroom(c, 280, 1306, 0.4, { seed: 381, cap: '#D9643A', rot: 0.3 });
    // matorral a la derecha
    for (let i = 0; i < 7; i++) G.ellipse(c, 900 + i * 32, 1300 - (i % 3) * 22, 60, 50, { fill: i % 2 ? '#4E7A33' : '#5E8A3A', lw: 3.5, seed: 390 + i });
    L.shroom(c, 960, 1360, 0.8, { seed: 398, cap: '#E8A24A' });
  };

  // ---------- el sótano de las esporas ----------
  B.basement = (c) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1E2A27'); g.addColorStop(0.7, '#2C3B36'); g.addColorStop(1, '#1A2220');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let row = 0; row < 16; row++) for (let k = 0; k < 7; k++) {
      const x = -60 + k * 170 + (row % 2) * 85, y = 160 + row * 80;
      if (y > 1420) continue;
      G.rrect(c, x, y, 160, 70, 6, { fill: rnd(row, k) < 0.5 ? '#33463F' : '#2E3F39', lw: 2.5, seed: 400 + row * 10 + k, alpha: 0.9 });
    }
    // tuberías
    for (const [y, col] of [[470, '#56665E'], [560, '#4A5A52']]) { G.limb(c, [[-40, y], [W + 40, y + 10]], { color: col, lw: 34, seed: 500 + y }); for (let k = 0; k < 5; k++) G.rrect(c, 80 + k * 230, y - 26, 26, 56, 4, { fill: '#6E7E76', lw: 3, seed: 510 + k + y }); }
    // escaleras a la izquierda, con luz que baja
    for (let k = 0; k < 7; k++) G.rrect(c, -40, 700 + k * 100, 260 - k * 26, 34, 4, { fill: '#5A4634', lw: 3.5, seed: 530 + k });
    // micelio en las paredes
    for (let k = 0; k < 9; k++) {
      const x0 = 260 + rnd(8, k) * 760, y0 = 640 + rnd(9, k) * 700;
      for (let b = 0; b < 4; b++) { const a = rnd(k, b) * Math.PI * 2; G.line(c, [[x0, y0], [x0 + Math.cos(a) * 60, y0 + Math.sin(a) * 60], [x0 + Math.cos(a + 0.4) * 120, y0 + Math.sin(a + 0.4) * 120]], { lw: 2.5, color: 'rgba(225,230,200,0.5)', seed: 560 + k * 5 + b, step: 12 }); }
    }
    for (let k = 0; k < 5; k++) L.bracket(c, 900 + (k % 2) * 60, 760 + k * 110, 1.2, 600 + k, -0.4);
    // suelo + setas a lo largo de la pared
    G.rrect(c, -20, 1420, W + 40, 540, 0, { fill: '#27302D', lw: 4, seed: 620, hatch: { color: 'rgba(255,255,255,0.04)', gap: 12 } });
    const caps = ['#D9643A', '#E8A24A', '#B24A6A', '#C9773E'];
    for (let k = 0; k < 14; k++) L.shroom(c, 30 + k * 78 + rnd(10, k) * 30, 1432 + (k % 2) * 8, 0.45 + rnd(11, k) * 0.5, { seed: 640 + k, cap: caps[k % 4], rot: (rnd(12, k) - 0.5) * 0.5 });
    // la bombilla colgando
    G.line(c, [[600, 0], [600, 330]], { lw: 3, color: '#111', seed: 700 });
    G.ellipse(c, 600, 360, 26, 32, { fill: '#FFF2B8', lw: 3, seed: 701 });
  };

  // ---------- el campamento de noche ----------
  B.camp = (c) => {
    const g = c.createLinearGradient(0, 0, 0, 1260);
    g.addColorStop(0, '#0C1030'); g.addColorStop(0.7, '#272150'); g.addColorStop(1, '#4A3A60');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 80; i++) { const x = rnd(20, i) * W, y = rnd(21, i) * 1050, r = 1 + rnd(22, i) * 2.5; c.fillStyle = `rgba(255,250,230,${0.4 + rnd(23, i) * 0.6})`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    G.ellipse(c, 830, 380, 62, 62, { fill: '#F4EED8', lw: 3, seed: 730 });
    G.ellipse(c, 850, 368, 52, 56, { fill: '#272150', lw: 0, seed: 731, alpha: 0.95 });
    const far = [[-40, 200, 860], [150, 160, 980], [300, 220, 900], [520, 150, 1010], [660, 230, 880], [880, 220, 960]];
    far.forEach(([x, w, top], i) => building(c, x, w, top, 1260, '#1D1933', 740 + i * 7, { winCol: '#15122A', lit: 0.04 }));
    G.rrect(c, -20, 1250, W + 40, 720, 0, { fill: '#2B2830', lw: 4, seed: 760, hatch: { color: 'rgba(255,255,255,0.03)', gap: 14 } });
    for (let i = 0; i < 14; i++) { const x = rnd(24, i) * W, y = 1270 + rnd(25, i) * 600; G.poly(c, [[x - 16, y], [x - 4, y - 28], [x + 2, y - 6], [x + 10, y - 32], [x + 18, y]], { fill: '#3F5A2E', lw: 2.5, seed: 770 + i, step: 8 }); }
    // tiendas de campaña
    G.poly(c, [[-40, 1330], [110, 1110], [260, 1330]], { fill: '#C96A3A', lw: 4.5, seed: 790, step: 26, hatch: { color: 'rgba(0,0,0,0.15)', gap: 9 } });
    G.poly(c, [[80, 1330], [110, 1180], [140, 1330]], { fill: '#2A1D1A', lw: 3, seed: 791, step: 16 });
    G.poly(c, [[800, 1320], [960, 1100], [1120, 1320]], { fill: '#3D7A74', lw: 4.5, seed: 792, step: 26, hatch: { color: 'rgba(0,0,0,0.15)', gap: 9 } });
    // troncos para sentarse
    for (const [x, y] of [[255, 1500], [815, 1500]]) { G.rrect(c, x - 170, y - 14, 340, 70, 32, { fill: '#6B4A2E', lw: 4.5, seed: 800 + x, hatch: { color: 'rgba(0,0,0,0.2)', gap: 7, angle: 0.1 } }); G.ellipse(c, x + 160, y + 21, 22, 34, { fill: '#A07A52', lw: 3.5, seed: 801 + x }); }
  };
  B.fire = (c, x, y, t, s = 1) => {
    G.limb(c, [[x - 90 * s, y + 14], [x + 90 * s, y - 8]], { color: '#5A3A22', lw: 26 * s, seed: 1201 });
    G.limb(c, [[x - 90 * s, y - 8], [x + 90 * s, y + 16]], { color: '#6B4A2E', lw: 26 * s, seed: 1202 });
    const glow = c.createRadialGradient(x, y - 80 * s, 10, x, y - 80 * s, 360 * s);
    glow.addColorStop(0, 'rgba(255,190,90,0.55)'); glow.addColorStop(1, 'rgba(255,140,60,0)');
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = glow; c.fillRect(x - 400 * s, y - 460 * s, 800 * s, 800 * s); c.restore();
    for (const [col, sc, sd] of [['#E5383B', 1, 1], ['#F28C28', 0.72, 2], ['#FFD23F', 0.42, 3]]) {
      const pts = [[x - 70 * sc * s, y]];
      for (let k = 0; k < 4; k++) {
        const tx = x + (-54 + k * 36) * sc * s, th = (150 + 70 * (0.5 + 0.5 * U.noise1(t * 7 + k * 1.7, sd))) * sc * s;
        pts.push([tx - 14 * sc * s, y - th * 0.45], [tx + U.noise1(t * 9 + k, sd + 4) * 12 * s, y - th], [tx + 16 * sc * s, y - th * 0.4]);
      }
      pts.push([x + 70 * sc * s, y]);
      G.shape(c, pts, { fill: col, lw: 3, seed: 1210 + sd, amp: 1.5 });
    }
    for (let i = 0; i < 10; i++) { const a = (t * 0.8 + U.hash(31, i)) % 1; const ex = x + (U.hash(32, i) - 0.5) * 120 * s + Math.sin(t * 3 + i) * 20, ey = y - 120 * s - a * 420 * s; c.fillStyle = `rgba(255,200,90,${1 - a})`; c.beginPath(); c.arc(ex, ey, 4 * s, 0, 7); c.fill(); }
  };

  // ---------- el centro comercial abandonado ----------
  B.mall = (c) => {
    const vx = 540, vy = 930;
    c.fillStyle = '#20232F'; c.fillRect(0, 0, W, H);
    G.poly(c, [[-40, 1960], [vx - 120, vy + 90], [vx + 120, vy + 90], [W + 40, 1960]], { fill: '#454A5C', lw: 4, seed: 1300, step: 40 });
    for (let k = -6; k <= 6; k++) G.line(c, [[vx + k * 20, vy + 90], [vx + k * 260, 1960]], { lw: 2.5, color: 'rgba(0,0,0,0.25)', seed: 1301 + k, step: 60 });
    for (let k = 0; k < 9; k++) { const y = vy + 90 + Math.pow(k / 8, 2.2) * 1000; G.line(c, [[-40, y], [W + 40, y]], { lw: 2.5, color: 'rgba(0,0,0,0.22)', seed: 1320 + k, step: 60 }); }
    G.poly(c, [[-40, -40], [vx - 120, vy - 260], [vx + 120, vy - 260], [W + 40, -40]], { fill: '#191B25', lw: 4, seed: 1310, step: 40 });
    G.rrect(c, vx - 120, vy - 260, 240, 350, 4, { fill: '#121420', lw: 4, seed: 1311 });
    // tiendas (izquierda y derecha) con persianas medio bajadas
    const signs = [['MODA', '#E8718D'], ['JUGUETES', '#F2B84B'], ['CINE', '#3FA89B'], ['PIZZA', '#E5383B']];
    for (let k = 0; k < 2; k++) for (const sd of [-1, 1]) {
      const near = k === 0, x0 = sd < 0 ? (near ? -40 : 150) : (near ? 840 : 760), x1 = sd < 0 ? (near ? 150 : 300) : (near ? W + 40 : 840);
      const yt0 = near ? 420 : 640, yb0 = near ? 1560 : 1250, yt1 = near ? 640 : 760, yb1 = near ? 1250 : 1100;
      const pts = sd < 0 ? [[x0, yt0], [x1, yt1], [x1, yb1], [x0, yb0]] : [[x1, yt0], [x0, yt1], [x0, yb1], [x1, yb0]];
      G.poly(c, pts, { fill: near ? '#2C3040' : '#262A38', lw: 4, seed: 1340 + k * 2 + sd, step: 40 });
      const sg = signs[k * 2 + (sd > 0 ? 1 : 0)];
      G.decor(() => G.text(c, sg[0], (x0 + x1) / 2 + (near ? -sd * 30 : 0), (near ? 560 : 730), { size: near ? 36 : 28, fam: 'Bungee', weight: 400, color: sg[1], align: 'center', alpha: 0.7, boil: 0 }));
      for (let s = 0; s < 6; s++) { const u = s / 6; G.line(c, [[x0, lerp(yt0, yb0, 0.18 + u * 0.25)], [x1, lerp(yt1, yb1, 0.18 + u * 0.25)]], { lw: 3, color: 'rgba(160,170,190,0.35)', seed: 1360 + s + k * 10 + sd }); }
    }
    for (let k = 0; k < 6; k++) L.bracket(c, k < 3 ? 60 + k * 30 : 980 - (k - 3) * 30, 1000 + (k % 3) * 120, 1.1, 1400 + k, k < 3 ? 0.4 : -0.4);
    const caps = ['#C9773E', '#D9643A', '#E8A24A'];
    for (let k = 0; k < 8; k++) L.shroom(c, 40 + k * 140 + rnd(40, k) * 40, 1600 + (k % 2) * 60, 0.5 + rnd(41, k) * 0.4, { seed: 1420 + k, cap: caps[k % 3], rot: (rnd(42, k) - 0.5) * 0.4 });
    // lámparas colgando rotas
    for (const x of [260, 820]) { G.line(c, [[x, 0], [x + 20, 260]], { lw: 3, color: '#0E0F15', seed: 1450 + x }); G.rrect(c, x - 30, 260, 100, 24, 6, { fill: '#3A3F52', lw: 3, seed: 1451 + x, }); }
  };

  // ---------- el pasillo con LA puerta ----------
  B.corridor = (c) => {
    c.fillStyle = '#2A2E34'; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 12; k++) G.line(c, [[rnd(50, k) * W, 200 + rnd(51, k) * 900], [rnd(52, k) * W, 260 + rnd(53, k) * 900]], { lw: 2, color: 'rgba(255,255,255,0.05)', seed: 1500 + k });
    G.rrect(c, -20, 1440, W + 40, 520, 0, { fill: '#38363C', lw: 4, seed: 1510, hatch: { color: 'rgba(255,255,255,0.04)', gap: 12 } });
    // marco de la puerta
    G.rrect(c, 300, 610, 480, 860, 8, { fill: '#4A3A2C', lw: 5, seed: 1520 });
    G.rrect(c, 330, 640, 420, 830, 4, { fill: '#08070C', lw: 4, seed: 1521 }); // el hueco (negro detrás de la hoja)
    for (let k = 0; k < 5; k++) L.bracket(c, 300 + (k % 2) * 480, 700 + k * 150, 1.0, 1530 + k, k % 2 ? -0.5 : 0.5);
    G.decor(() => G.text(c, 'NO ABRIR', 540, 560, { size: 70, fam: 'Permanent Marker', weight: 400, color: 'rgba(220,50,50,0.9)', align: 'center', boil: 0 }));
    G.line(c, [[-20, 380], [W + 20, 400]], { lw: 26, color: '#41474F', seed: 1540 });
  };
  B.door = (c, open) => { // la hoja: se abre hacia la izquierda (bisagra a la izquierda)
    const w = 420 * (1 - open * 0.82), skew = open * 60;
    G.poly(c, [[330, 640], [330 + w, 640 + skew], [330 + w, 1470 - skew], [330, 1470]], { fill: '#7A5236', lw: 5, seed: 1550, step: 30, hatch: { color: 'rgba(0,0,0,0.18)', gap: 9, angle: 1.4 } });
    if (open < 0.5) {
      for (const [y0, y1] of [[700, 1000], [1080, 1400]]) G.rrect(c, 370, y0, 340 * (1 - open * 1.6), y1 - y0, 6, { fill: '#6A4630', lw: 3.5, seed: 1551 + y0 });
      G.ellipse(c, 700 - open * 300, 1060, 16, 16, { fill: '#D4A83A', lw: 3, seed: 1553 });
    }
  };

  // ---------- portada del título ----------
  B.title = (c) => {
    const g = c.createRadialGradient(540, 900, 50, 540, 900, 1300);
    g.addColorStop(0, '#31473A'); g.addColorStop(1, '#141822');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) L.shroom(c, 90 + k * 60, 1560 + (k % 2) * 30, 2.4 - k * 0.45, { seed: 1600 + k, cap: ['#D9643A', '#E8A24A', '#B24A6A', '#C9773E'][k], rot: -0.2 + k * 0.1 });
    for (let k = 0; k < 3; k++) L.shroom(c, 1000 - k * 70, 1580 + (k % 2) * 20, 2.0 - k * 0.4, { seed: 1610 + k, cap: ['#E8A24A', '#D9643A', '#C9773E'][k], rot: 0.2 - k * 0.1 });
  };

  B.draw = (ctx, key) => ctx.drawImage(Studio.cache(key, B[key]), 0, 0, W, H);
})();
