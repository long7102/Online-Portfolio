/* Interactive spiral galaxy for the "Selected work" banner.
   - Hover the galaxy: it spins faster and its core flares.
   - Hover a planet: it swells, glows and shows its name. Click / tap it: it explodes, then re-forms.
   - Every planet is its own world (lava, banded gas giant, ice, ocean, rock + moon, ringed giant, dwarf star...). */
(() => {
  'use strict';
  const host = document.querySelector('.featured-case-banner');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'mp-banner-galaxy'; cv.setAttribute('aria-hidden', 'true');
  host.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2), TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), lerp = (a, b, k) => a + (b - a) * k;

  /* orbits and the planets living on them */
  const orbits = [
    { k: .2, tilt: -.45, sp: .02 }, { k: .32, tilt: .3, sp: -.014 }, { k: .46, tilt: -.1, sp: .01 },
    { k: .6, tilt: .55, sp: -.009 }, { k: .76, tilt: -.28, sp: .006 }, { k: .92, tilt: .15, sp: -.005 },
  ];
  const planets = [
    { o: 0, p: 0.0, sp: .17, s: 3.4, type: 'lava', h: 14, name: 'Insight' },
    { o: 0, p: 3.4, sp: .17, s: 2.5, type: 'rock', h: 32, name: 'Data', moon: true },
    { o: 1, p: 2.2, sp: -.11, s: 4.8, type: 'ringed', h: 38, name: 'Storytelling' },
    { o: 2, p: 4.0, sp: .08, s: 3.5, type: 'ice', h: 196, name: 'Brand' },
    { o: 2, p: 1.0, sp: .08, s: 2.7, type: 'ocean', h: 168, name: 'Social' },
    { o: 3, p: 5.2, sp: -.06, s: 6.2, type: 'gas', h: 28, name: 'Strategy' },
    { o: 4, p: 2.8, sp: .05, s: 3.2, type: 'dwarf', h: 48, name: 'Growth' },
    { o: 4, p: .2, sp: .05, s: 2.5, type: 'rock', h: 22, name: 'Design' },
    { o: 5, p: 1.6, sp: -.04, s: 4.0, type: 'pearl', h: 330, name: 'Video' },
    { o: 5, p: 4.6, sp: -.04, s: 1.9, type: 'dwarf', h: 200, name: 'AI' },
    { o: 3, p: 2.0, sp: -.06, s: 3.0, type: 'ringed', h: 180, name: 'Content' },
  ].map(p => ({ ...p, x: -999, y: -999, hov: 0, dead: false, born: 1, reviveAt: 0 }));

  /* what each world stands for (all drawn from the work shown on this site) */
  const info = {
    Insight: ['Phân tích khách hàng', 'Tìm pain point, động lực và ngôn ngữ thật của khách hàng trước khi viết một chữ nào.', 'Hành tinh dung nham', ''],
    Data: ['Đo lường & tối ưu', 'Đọc chỉ số tương tác để cải thiện vòng nội dung tiếp theo thay vì chỉ nhìn lượt xem.', 'Hành tinh đá có vệ tinh', ''],
    Storytelling: ['Storytelling & trend', 'Biến insight và xu hướng thành câu chuyện đúng giọng thương hiệu, dễ nhớ và dễ chia sẻ.', 'Hành tinh có vành đai', '50,5K like · TikTok'],
    Brand: ['Định vị thương hiệu', 'Giữ logo, màu sắc, typography và brand voice nhất quán trên mọi điểm chạm.', 'Hành tinh băng', ''],
    Social: ['Vận hành đa kênh', 'Lên lịch, sản xuất và theo dõi nội dung mỗi ngày trên Facebook, TikTok, website.', 'Hành tinh đại dương', '+20% tương tác · Highway'],
    Strategy: ['Lập kế hoạch nội dung', 'Từ mục tiêu kinh doanh đến thông điệp, định dạng và lịch triển khai đa nền tảng.', 'Khí khổng lồ', ''],
    Growth: ['Tăng trưởng', 'Nội dung gắn với kết quả: doanh thu duy trì ổn định nhờ video bán hàng.', 'Sao lùn vàng', '30–50M/tháng · P Global'],
    Design: ['Thiết kế & hình ảnh', 'Bài đăng, story, voucher và ảnh bìa cùng một hệ thống hình ảnh thống nhất.', 'Hành tinh đá', ''],
    Video: ['Sản xuất video', 'Viết kịch bản, quay dựng và tối ưu nhịp xem cho video ngắn.', 'Hành tinh ngọc trai', '5.000 tương tác/bài · BeatVN'],
    AI: ['AI trong công việc', 'Dùng AI để nghiên cứu, lên ý tưởng, biên tập và kiểm soát chất lượng đầu ra.', 'Sao lùn xanh', ''],
    Content: ['Content Marketing', 'Nội dung có chiến lược, kể chuyện có kết quả: từ ý tưởng đến phân phối.', 'Hành tinh có vành đai', ''],
  };
  const card = document.createElement('div');
  card.className = 'mp-planet-card'; card.setAttribute('aria-hidden', 'true');
  card.innerHTML = '<div class="mp-pc-head"><i></i><strong></strong><em></em></div><p class="mp-pc-sub"></p><p class="mp-pc-desc"></p><p class="mp-pc-stat"></p><p class="mp-pc-hint">Bấm để làm nổ hành tinh</p>';
  host.append(card);
  const cEl = { dot: card.querySelector('i'), name: card.querySelector('strong'), kind: card.querySelector('em'), sub: card.querySelector('.mp-pc-sub'), desc: card.querySelector('.mp-pc-desc'), stat: card.querySelector('.mp-pc-stat') };
  let shown = null;
  const showCard = p => {
    if (p !== shown) {
      shown = p;
      if (p) {
        const d = info[p.name] || ['', '', '', ''];
        cEl.name.textContent = p.name; cEl.sub.textContent = d[0]; cEl.desc.textContent = d[1]; cEl.kind.textContent = d[2];
        cEl.stat.textContent = d[3]; cEl.stat.style.display = d[3] ? '' : 'none';
        cEl.dot.style.background = `hsl(${p.h},90%,60%)`; cEl.dot.style.boxShadow = `0 0 10px hsl(${p.h},95%,60%)`;
      }
      card.classList.toggle('on', !!p);
    }
    if (p) {
      const cw = card.offsetWidth, ch = card.offsetHeight, r = p.s * 1.55 * 1.5;
      let x = p.x + r + 16, y = p.y - ch / 2;
      if (x + cw > W - 8) x = p.x - r - 16 - cw;
      x = Math.max(8, Math.min(W - cw - 8, x)); y = Math.max(8, Math.min(H - ch - 8, y));
      card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    }
  };

  let W = 0, H = 0, disk = [], big = [], dust = [], bg = [];
  let visible = true, raf = 0, last = 0, T = 0, boost = 1, flare = 0, shake = 0;
  const mouse = { x: -999, y: -999, inside: false };
  let hoverP = null, hoverG = false;
  const parts = [], waves = [];
  host.__mpPlanets = planets;

  const build = () => {
    const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = W * dpr; cv.height = H * dpr;
    const n = W < 600 ? 700 : 1700;
    disk = Array.from({ length: n }, (_, i) => {
      const rr = Math.pow(Math.random(), 1.05), a = (i % 2) * Math.PI + rr * 3.0 + rnd(-.42, .42) * (1.05 - rr * .45);
      return { r: rr, a, s: rnd(.7, 2.2), tw: rnd(0, TAU), l: rnd(76, 96), h: 38 + rr * 10 };
    });
    big = disk.filter((_, i) => i % 70 === 0).slice(0, 28);
    dust = Array.from({ length: 22 }, (_, i) => ({ r: rnd(.15, .85), a: (i % 3) * TAU / 3 + rnd(0, 1.4), s: rnd(.16, .3) }));
    bg = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: rnd(.5, 1.4), tw: rnd(0, TAU) }));
  };

  /* ---------- planet drawing: each type is its own little world ---------- */
  const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
  const sphere = (x, y, r, h, s, l, lx, ly) => {
    const g = ctx.createRadialGradient(lx, ly, 0, x, y, r);
    g.addColorStop(0, hsl(h, s, Math.min(96, l + 26))); g.addColorStop(.6, hsl(h, s, l)); g.addColorStop(1, hsl(h, s, Math.max(8, l - 32)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  };
  const drawPlanet = (p, r, t, light, ang, cx, cy) => {
    const x = p.x, y = p.y, lx = x + (cx - x) * .14 - r * .25, ly = y + (cy - y) * .14 - r * .25;
    const ring = (from, to, a) => { ctx.strokeStyle = hsl(p.h + 6, 70, light ? 38 : 78, a); ctx.lineWidth = Math.max(1, r * .26); ctx.beginPath(); ctx.ellipse(x, y, r * 2.15, r * .62, ang - .35, from, to); ctx.stroke(); };
    if (p.type === 'dwarf') {                                  // tiny star: core + rays
      const pul = .75 + .25 * Math.sin(t * 2 + p.p * 3);
      if (!light) { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, hsl(p.h, 100, 88, .9 * pul)); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8); }
      ctx.strokeStyle = hsl(p.h, 90, light ? 38 : 88, .8 * pul); ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(x - r * 2.4 * pul, y); ctx.lineTo(x + r * 2.4 * pul, y); ctx.moveTo(x, y - r * 2.4 * pul); ctx.lineTo(x, y + r * 2.4 * pul); ctx.stroke();
      ctx.fillStyle = hsl(p.h, 100, light ? 45 : 93); ctx.beginPath(); ctx.arc(x, y, r * .8, 0, TAU); ctx.fill(); return;
    }
    if (p.type === 'ringed') ring(Math.PI, TAU, .7);
    const base = { lava: [14, 70, 26], rock: [p.h, 45, 46], ice: [p.h, 55, 74], ocean: [p.h + 30, 60, 38], gas: [p.h, 62, 56], pearl: [p.h, 40, 78], ringed: [p.h, 62, 60] }[p.type];
    sphere(x, y, r, base[0], base[1], base[2], lx, ly);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    if (p.type === 'gas') {                                    // drifting cloud bands
      for (let i = -3; i <= 3; i++) { const yy = y + i * r * .3 + Math.sin(t * .6 + i) * r * .06; ctx.fillStyle = hsl(p.h + (i % 2 ? -8 : 6), 60, i % 2 ? 36 : 70, .35); ctx.fillRect(x - r, yy, r * 2, r * .17); }
    } else if (p.type === 'ringed') {
      for (let i = -2; i <= 2; i++) { ctx.fillStyle = hsl(p.h, 55, i % 2 ? 40 : 76, .25); ctx.fillRect(x - r, y + i * r * .34, r * 2, r * .14); }
    } else if (p.type === 'lava') {                            // glowing cracks
      const gl = .55 + .45 * Math.sin(t * 2.4 + p.p);
      ctx.strokeStyle = hsl(24, 100, 58, gl); ctx.lineWidth = Math.max(.8, r * .16);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(t * .5 + i * 2.1) * r * .5, y + Math.sin(t * .4 + i * 1.7) * r * .5, r * (.5 + i * .15), i, i + 1.6); ctx.stroke(); }
    } else if (p.type === 'rock') {                            // craters
      ctx.fillStyle = hsl(p.h, 40, 24, .5);
      [[.3, -.2, .28], [-.35, .25, .22], [.1, .45, .16]].forEach(c => { ctx.beginPath(); ctx.arc(x + c[0] * r, y + c[1] * r, c[2] * r, 0, TAU); ctx.fill(); });
    } else if (p.type === 'ocean') {                           // rotating continents
      ctx.fillStyle = hsl(120, 45, 34, .85);
      for (let i = 0; i < 3; i++) { const a = t * .5 + i * 2.2; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * .6, y + Math.sin(i * 3) * r * .4, r * .38, r * .22, a, 0, TAU); ctx.fill(); }
    } else if (p.type === 'ice') {
      ctx.fillStyle = hsl(p.h, 70, 92, .35); ctx.fillRect(x - r, y - r * .2, r * 2, r * .18);
      ctx.fillStyle = hsl(p.h, 70, 40, .25); ctx.fillRect(x - r, y + r * .25, r * 2, r * .14);
    } else if (p.type === 'pearl') {                           // iridescent sheen
      const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, hsl(300, 60, 82, .45)); g.addColorStop(.5, hsl(50, 90, 80, .3)); g.addColorStop(1, hsl(190, 70, 72, .45));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const sh = ctx.createRadialGradient(x - r * .35, y - r * .4, 0, x - r * .35, y - r * .4, r * .7); sh.addColorStop(0, 'rgba(255,255,255,.55)'); sh.addColorStop(1, 'transparent');
    ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
    if (light) { ctx.strokeStyle = 'hsla(30,60%,28%,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
    if (p.type === 'ringed') ring(0, Math.PI, .9);
    if (p.moon) { const a = t * 1.6 + p.p; ctx.fillStyle = hsl(40, 15, light ? 45 : 82); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 2, y + Math.sin(a) * r * 1.1, Math.max(.9, r * .3), 0, TAU); ctx.fill(); }
  };

  const explode = p => {
    p.dead = true; p.reviveAt = performance.now() / 1000 + 6; p.hov = 0; shake = 1;
    for (let i = 0; i < 90; i++) {
      const a = rnd(0, TAU), v = rnd(30, 190);
      parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.9, 1.9), max: 1.9, h: p.h + rnd(-12, 22), s: rnd(.8, 2.6) });
    }
    waves.push({ x: p.x, y: p.y, r: 0, life: 1, h: p.h }, { x: p.x, y: p.y, r: 0, life: 1.2, h: 45 });
  };

  /* ---------- main loop ---------- */
  const frame = now => {
    raf = visible && !reduced ? requestAnimationFrame(frame) : 0;
    const t = now / 1000, dt = Math.min(.05, last ? t - last : .016); last = t;
    const light = document.body.classList.contains('light-mode'), dl = light ? -44 : 0, BLEND = light ? 'source-over' : 'lighter';
    const m = W < 700, cx = W * (m ? .6 : .72), cy = H * (m ? .8 : .5);
    const R = Math.min(W * (m ? .7 : .52), H * 1.25);
    const tilt = -.4, ct = Math.cos(tilt), st = Math.sin(tilt), sq = .55;
    const at = (r, a) => { const px = Math.cos(a) * r, py = Math.sin(a) * r * sq; return [cx + px * ct - py * st, cy + px * st + py * ct]; };

    /* hover tests use last frame's planet positions */
    hoverP = null; hoverG = false;
    if (mouse.inside) {
      let best = 1e9;
      for (const p of planets) { if (p.dead) continue; const d = Math.hypot(mouse.x - p.x, mouse.y - p.y), hit = Math.max(11, p.s * 1.55 * 2.2); if (d < hit && d < best) { best = d; hoverP = p; } }
      if (!hoverP) { const dx = mouse.x - cx, dy = mouse.y - cy, u = dx * ct + dy * st, v = -dx * st + dy * ct; hoverG = (u / (R * .85)) ** 2 + (v / (R * .85 * sq)) ** 2 < 1; }
    }
    host.style.cursor = hoverP ? 'pointer' : '';
    boost = lerp(boost, hoverG ? 4.2 : hoverP ? 1.4 : 1, .06);
    flare = lerp(flare, hoverG ? 1 : 0, .08);
    shake = Math.max(0, shake - dt * 2.2);
    T += dt * boost;
    const rot = T * .02;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (shake > 0) ctx.translate(Math.sin(t * 60) * shake * 3, Math.cos(t * 52) * shake * 3);
    ctx.globalCompositeOperation = BLEND;
    for (const b of bg) { ctx.fillStyle = `hsla(40,70%,${light ? 40 : 90}%,${.25 + .35 * Math.sin(t * .7 + b.tw) ** 2})`; ctx.fillRect(b.x * W, b.y * H, b.s, b.s); }
    if (!light) for (const d of dust) {
      const [x, y] = at(d.r * R, d.a + rot * .5), s = d.s * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(0, `hsla(38,95%,58%,${.09 + .05 * flare})`); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - s, y - s, s * 2, s * 2);
    }
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (.5 + .12 * flare));
    core.addColorStop(0, light ? `hsla(42,95%,62%,${.38 + .22 * flare})` : `hsla(46,100%,86%,${.42 + .38 * flare})`);
    core.addColorStop(.35, light ? 'hsla(40,95%,66%,.14)' : `hsla(40,100%,64%,${.16 + .1 * flare})`); core.addColorStop(.7, light ? 'hsla(38,90%,70%,.04)' : 'hsla(32,90%,48%,.06)'); core.addColorStop(1, 'transparent');
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    for (const s of disk) {
      const [x, y] = at(s.r * R, s.a + rot * (1.5 - s.r * .9));
      ctx.fillStyle = `hsla(${s.h},88%,${Math.min(98, s.l + dl + flare * 6)}%,${Math.max(.18, (.75 - s.r * .35) * (.6 + .4 * Math.sin(t * .8 + s.tw))) + flare * .12})`;
      if (light) { ctx.beginPath(); ctx.arc(x + s.s / 2, y + s.s / 2, s.s * .45, 0, TAU); ctx.fill(); } else ctx.fillRect(x, y, s.s, s.s);
    }
    for (const s of big) {
      const [x, y] = at(s.r * R, s.a + rot * (1.5 - s.r * .9)), h = 6 + 4 * Math.sin(t * .7 + s.tw) ** 2 + flare * 3;
      if (light) { const a = .55 + .35 * Math.sin(t * .8 + s.tw); ctx.strokeStyle = `hsla(36,85%,40%,${a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - h * .7, y); ctx.lineTo(x + h * .7, y); ctx.moveTo(x, y - h * .7); ctx.lineTo(x, y + h * .7); ctx.stroke(); continue; }
      const g = ctx.createRadialGradient(x, y, 0, x, y, h * 2.4);
      g.addColorStop(0, 'hsla(48,100%,94%,.9)'); g.addColorStop(.3, 'hsla(44,100%,72%,.25)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x - h * 2.4, y - h * 2.4, h * 4.8, h * 4.8);
    }

    /* orbits */
    ctx.lineWidth = 1;
    orbits.forEach(o => {
      const rx = o.k * R, ry = rx * .42; o.ang = o.tilt + T * o.sp;
      ctx.strokeStyle = light ? 'hsla(36,70%,40%,.4)' : `hsla(45,100%,74%,${.3 + .12 * flare})`;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, o.ang, 0, TAU); ctx.stroke();
    });

    /* planets */
    const nowS = performance.now() / 1000;
    for (const p of planets) {
      const o = orbits[p.o], rx = o.k * R, ry = rx * .42, th = p.p + T * p.sp;
      const ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
      p.x = cx + ex * Math.cos(o.ang) - ey * Math.sin(o.ang); p.y = cy + ex * Math.sin(o.ang) + ey * Math.cos(o.ang);
      if (p.dead) { if (nowS > p.reviveAt) { p.dead = false; p.born = 0; } else continue; }
      p.born = Math.min(1, p.born + dt * .8);
      p.hov = lerp(p.hov, p === hoverP ? 1 : 0, .16);
      const grow = p.born < 1 ? 1 - Math.pow(1 - p.born, 3) * Math.cos(p.born * 9) : 1;           // elastic re-form
      const r = p.s * 1.55 * (1 + .45 * p.hov) * Math.max(0, grow);
      if (r <= 0) continue;
      if (p.hov > .02) {                                        // glow halo while hovered
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * (3 + 2 * p.hov));
        g.addColorStop(0, hsl(p.h, 100, light ? 50 : 75, (light ? .35 : .55) * p.hov)); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(p.x - r * 6, p.y - r * 6, r * 12, r * 12);
      }
      ctx.globalCompositeOperation = 'source-over';
      drawPlanet(p, r, T, light, o.ang, cx, cy);
      ctx.globalCompositeOperation = BLEND;
    }

    /* explosions */
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i]; w.r += dt * 170; w.life -= dt * 1.3; if (w.life <= 0) { waves.splice(i, 1); continue; }
      ctx.strokeStyle = hsl(w.h, 100, light ? 45 : 80, w.life * .6); ctx.lineWidth = 1 + w.life * 2; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .985; q.vy *= .985;
      ctx.fillStyle = hsl(q.h, 100, light ? 42 : 78, Math.min(1, q.life / q.max * 1.4)); ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (.5 + q.life / q.max), 0, TAU); ctx.fill();
    }

    /* info card follows the hovered planet */
    ctx.globalCompositeOperation = 'source-over';
    showCard(hoverP);
  };

  /* ---------- input ---------- */
  const setMouse = e => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.inside = true; };
  host.addEventListener('pointermove', setMouse);
  host.addEventListener('pointerdown', setMouse);
  host.addEventListener('pointerleave', () => { mouse.inside = false; });
  host.addEventListener('click', e => {
    if (e.target.closest('a,button')) return;
    setMouse(e);
    let hit = null, best = 1e9;
    for (const p of planets) { if (p.dead) continue; const d = Math.hypot(mouse.x - p.x, mouse.y - p.y); if (d < Math.max(13, p.s * 1.55 * 2.4) && d < best) { best = d; hit = p; } }
    if (hit) explode(hit);
  });

  build();
  if (reduced) frame(performance.now()); else raf = requestAnimationFrame(frame);
  let rz; const rebuild = () => { clearTimeout(rz); rz = setTimeout(build, 160); };
  addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(host);
  new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible && !raf && !reduced) { last = 0; raf = requestAnimationFrame(frame); } }).observe(host);
})();
