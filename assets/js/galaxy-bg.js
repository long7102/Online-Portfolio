/* Full-page animated Milky Way. Everything moves: spiral disk, tilted orbit rings, planets, drifting
   star field. Scrolling adds parallax, zoom, extra spin and warp streaks proportional to velocity. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.id = 'mp-sky'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, R = 0, field = [], disk = [], dust = [], rings = [];
  let gx0 = 0.72, gy0 = 0.42, sy = 0, vel = 0, lastY = scrollY, running = true;

  const build = () => {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(W, H) * (W < 700 ? .55 : .52);
    const nField = W < 700 ? 140 : 260, nDisk = W < 700 ? 1000 : 2600;
    field = Array.from({ length: nField }, () => ({ x: Math.random(), y: Math.random(), z: rnd(.15, 1), s: rnd(.4, 1.5), tw: rnd(0, TAU), sp: rnd(.4, 1.4) }));
    disk = []; dust = [];
    for (let i = 0; i < nDisk; i++) {
      const r = Math.pow(Math.random(), 1.5), arm = (i % 3) * TAU / 3;
      const a = arm + r * 3.6 + rnd(-.32, .32) * (1.1 - r * .5), warm = Math.random() < .72;
      disk.push({ r, a, s: rnd(1, 2.8), tw: rnd(0, TAU), h: warm ? rnd(34, 52) : rnd(200, 225), l: warm ? rnd(72, 94) : rnd(78, 96) });
    }
    for (let i = 0; i < 70; i++) { const r = Math.pow(Math.random(), 1.2); dust.push({ r, a: (i % 3) * TAU / 3 + r * 3.6 + rnd(-.25, .25), s: rnd(.08, .22), c: Math.random() < .6 ? '215,70%,58%' : '38,95%,62%' }); }
    rings = [
      { k: .26, tilt: -.5, sp: .10, planets: [{ p: 0, sp: .55, s: 3.4, c: '45,100%,72%' }] },
      { k: .40, tilt: .35, sp: -.07, planets: [{ p: 2, sp: -.4, s: 2.4, c: '0,0%,96%' }, { p: 4, sp: -.4, s: 1.8, c: '40,100%,80%' }] },
      { k: .56, tilt: -.15, sp: .05, planets: [{ p: 1, sp: .3, s: 3, c: '36,100%,66%' }] },
      { k: .74, tilt: .6, sp: -.035, planets: [{ p: 3, sp: .22, s: 2.2, c: '210,80%,75%' }] },
    ];
  };

  /* Centre follows the hero visual so the galaxy sits behind the monogram. */
  const measure = () => {
    const hv = document.querySelector('.hero-visual');
    if (hv && hv.offsetParent !== null) {
      const r = hv.getBoundingClientRect();
      if (r.width) { gx0 = (r.left + r.width / 2) / W; gy0 = (r.top + scrollY + r.height / 2) / H; }
    }
  };

  const frame = now => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (document.body.classList.contains('light-mode')) { cv.style.display = 'none'; return; }
    cv.style.display = 'block';
    const t = now / 1000, y = scrollY;
    sy += (y - sy) * .12;
    vel += ((y - lastY) - vel) * .18; lastY = y;
    const warp = Math.min(Math.abs(vel), 60);
    const cx = gx0 * W, cy = gy0 * H - sy * .32;
    const zoom = 1 + Math.min(sy / (H * 5), .6) + warp * .004;
    const rot = t * .05 + sy * .0006;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* nebula + core */
    const Rg = R * zoom;
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rg * .55);
    g.addColorStop(0, 'hsla(45,100%,82%,.6)'); g.addColorStop(.3, 'hsla(38,100%,60%,.2)'); g.addColorStop(.6, 'hsla(30,90%,50%,.06)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const tilt = -.42, ct = Math.cos(tilt), st = Math.sin(tilt), sq = .52;
    for (const d of dust) {
      const a = d.a + rot * .6, rr = d.r * Rg, px = Math.cos(a) * rr, py = Math.sin(a) * rr * sq;
      const x = cx + px * ct - py * st, y2 = cy + px * st + py * ct, s = d.s * Rg * .5;
      g = ctx.createRadialGradient(x, y2, 0, x, y2, s);
      g.addColorStop(0, `hsla(${d.c},.1)`); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x - s, y2 - s, s * 2, s * 2);
    }

    /* drifting star field with parallax + warp streaks */
    for (const f of field) {
      const x = ((f.x * W + t * 6 * f.sp * f.z) % W + W) % W;
      const yy = (((f.y * H - sy * f.z * .5 + t * 3 * f.sp) % H) + H) % H;
      const a = .3 + .5 * f.z * (.6 + .4 * Math.sin(t * 1.6 * f.sp + f.tw));
      ctx.fillStyle = ctx.strokeStyle = `hsla(45,60%,92%,${a})`;
      if (warp > 3) { ctx.lineWidth = f.s * .6; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x, yy + Math.sign(vel) * warp * f.z * 1.6); ctx.stroke(); }
      else ctx.fillRect(x, yy, f.s, f.s);
    }

    /* spiral disk */
    for (const s of disk) {
      const a = s.a + rot * (1.5 - s.r * .9), rr = s.r * Rg, px = Math.cos(a) * rr, py = Math.sin(a) * rr * sq;
      const x = cx + px * ct - py * st, y2 = cy + px * st + py * ct;
      if (x < -4 || x > W + 4 || y2 < -4 || y2 > H + 4) continue;
      ctx.fillStyle = `hsla(${s.h},90%,${s.l}%,${Math.max(.28, (1 - s.r * .4) * (.6 + .4 * Math.sin(t * 1.8 + s.tw)))})`;
      ctx.fillRect(x, y2, s.s, s.s);
    }

    /* tilted orbit rings that slowly turn, with planets travelling on them */
    ctx.lineWidth = 1;
    for (const o of rings) {
      const rx = o.k * Rg, ry = rx * .42, ang = o.tilt + t * o.sp * .6;
      ctx.strokeStyle = 'hsla(45,100%,72%,.38)';
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, ang, 0, TAU); ctx.stroke();
      for (const p of o.planets) {
        const th = p.p + t * p.sp, ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
        const x = cx + ex * Math.cos(ang) - ey * Math.sin(ang), y2 = cy + ex * Math.sin(ang) + ey * Math.cos(ang);
        g = ctx.createRadialGradient(x, y2, 0, x, y2, p.s * 5);
        g.addColorStop(0, `hsla(${p.c},.9)`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(x - p.s * 5, y2 - p.s * 5, p.s * 10, p.s * 10);
        ctx.fillStyle = `hsl(${p.c})`; ctx.beginPath(); ctx.arc(x, y2, p.s, 0, TAU); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  build(); measure();
  if (reduced) { requestAnimationFrame(t => { frame(t); running = false; }); }
  else requestAnimationFrame(frame);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { build(); measure(); }, 200); });
  addEventListener('load', () => setTimeout(measure, 300));
  document.addEventListener('visibilitychange', () => { const v = !document.hidden; if (v && !running && !reduced) { running = true; requestAnimationFrame(frame); } else if (!v) running = false; });
})();
