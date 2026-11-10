/* Full-page Milky Way, calm and cinematic. Slow rotation, glowing stars, soft nebula.
   Scrolling only adds a very gentle, heavily-smoothed parallax and a colour/brightness
   shift that follows the page progress (gold -> blue -> violet). No jumps, no streaks. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.id = 'mp-sky'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a), lerp = (a, b, t) => a + (b - a) * t;
  let W = 0, H = 0, R = 0, field = [], disk = [], glow = [], clouds = [], rings = [];
  let gx0 = .72, gy0 = .42, sy = 0, prog = 0, running = true;

  const build = () => {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(W, H) * (W < 700 ? .56 : .5);
    const small = W < 700;
    field = Array.from({ length: small ? 150 : 300 }, () => ({ x: Math.random(), y: Math.random(), z: rnd(.15, 1), s: rnd(.5, 1.6), tw: rnd(0, TAU), sp: rnd(.3, 1) }));
    disk = [];
    for (let i = 0; i < (small ? 1100 : 2800); i++) {
      const r = Math.pow(Math.random(), 1.45), arm = (i % 3) * TAU / 3;
      const a = arm + r * 3.5 + rnd(-.3, .3) * (1.15 - r * .55);
      disk.push({ r, a, s: rnd(.7, 2.3), tw: rnd(0, TAU), w: Math.random() < .72, l: rnd(74, 96) });
    }
    glow = disk.filter((_, i) => i % 55 === 0).slice(0, 46);          // a few big stars with halos
    clouds = Array.from({ length: 16 }, (_, i) => ({ r: rnd(.12, .85), a: (i % 3) * TAU / 3 + rnd(0, 1.2), s: rnd(.16, .34), k: rnd(0, 1) }));
    rings = [
      { k: .27, tilt: -.5, sp: .02, pl: [{ p: 0, sp: .12, s: 3, c: '45,100%,74%' }] },
      { k: .42, tilt: .36, sp: -.014, pl: [{ p: 2, sp: -.09, s: 2.2, c: '0,0%,96%' }, { p: 4.4, sp: -.09, s: 1.7, c: '40,100%,82%' }] },
      { k: .6, tilt: -.16, sp: .01, pl: [{ p: 1, sp: .06, s: 2.8, c: '36,100%,68%' }] },
      { k: .8, tilt: .6, sp: -.008, pl: [{ p: 3, sp: .05, s: 2, c: '210,80%,78%' }] },
    ];
  };

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
    const t = now / 1000;
    const max = Math.max(1, document.documentElement.scrollHeight - H);
    sy += (scrollY - sy) * .035;                                   // very slow follow = no jumpiness
    prog += (Math.min(1, scrollY / max) - prog) * .02;
    const cx = gx0 * W, cy = gy0 * H - sy * .07;
    const Rg = R * (1 + prog * .18);
    const rot = t * .018;
    /* colour journey: gold -> blue -> violet across the page; brightens as you go */
    const hue = lerp(40, prog < .5 ? 215 : 265, Math.sin(Math.min(1, prog * 1.4) * Math.PI / 2));
    const lum = .8 + prog * .45;
    const tilt = -.42, ct = Math.cos(tilt), st = Math.sin(tilt), sq = .52;
    const at = (r, a) => { const px = Math.cos(a) * r, py = Math.sin(a) * r * sq; return [cx + px * ct - py * st, cy + px * st + py * ct]; };

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* soft nebula clouds along the arms */
    for (const c of clouds) {
      const [x, y] = at(c.r * Rg, c.a + rot * .5), s = c.s * Rg;
      const h = c.k < .5 ? hue : lerp(hue, 330, .35);
      const g = ctx.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(0, `hsla(${h},75%,58%,${.085 * lum})`); g.addColorStop(.5, `hsla(${h},70%,50%,${.035 * lum})`); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x - s, y - s, s * 2, s * 2);
    }
    /* luminous core */
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rg * .5);
    g.addColorStop(0, `hsla(45,100%,86%,${.55 * lum})`); g.addColorStop(.22, `hsla(40,100%,66%,${.2 * lum})`); g.addColorStop(.6, `hsla(${hue},80%,50%,${.05 * lum})`); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* background stars: slow drift + tiny parallax */
    for (const f of field) {
      const x = ((f.x * W + t * 3 * f.sp * f.z) % W + W) % W;
      const y = (((f.y * H - sy * f.z * .06) % H) + H) % H;
      ctx.fillStyle = `hsla(${hue > 100 ? 215 : 45},55%,92%,${(.28 + .5 * f.z * (.65 + .35 * Math.sin(t * .9 * f.sp + f.tw))) * lum})`;
      ctx.fillRect(x, y, f.s, f.s);
    }

    /* spiral disk */
    for (const s of disk) {
      const [x, y] = at(s.r * Rg, s.a + rot * (1.5 - s.r * .9));
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
      const hh = s.w ? 42 + s.r * 8 : hue;
      ctx.fillStyle = `hsla(${hh},85%,${s.l}%,${Math.max(.3, (1 - s.r * .4) * (.65 + .35 * Math.sin(t * .8 + s.tw))) * Math.min(1, lum)})`;
      ctx.fillRect(x, y, s.s, s.s);
    }
    /* a few glowing stars with halos */
    for (const s of glow) {
      const [x, y] = at(s.r * Rg, s.a + rot * (1.5 - s.r * .9));
      const hl = 5 + 5 * (.6 + .4 * Math.sin(t * .7 + s.tw));
      const gg = ctx.createRadialGradient(x, y, 0, x, y, hl * 2.4);
      gg.addColorStop(0, 'hsla(48,100%,92%,.85)'); gg.addColorStop(.25, 'hsla(44,100%,72%,.25)'); gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg; ctx.fillRect(x - hl * 2.4, y - hl * 2.4, hl * 4.8, hl * 4.8);
    }

    /* slow tilted orbit rings with planets */
    ctx.lineWidth = 1;
    for (const o of rings) {
      const rx = o.k * Rg, ry = rx * .42, ang = o.tilt + t * o.sp;
      ctx.strokeStyle = `hsla(${lerp(45, hue, .5)},100%,74%,.26)`;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, ang, 0, TAU); ctx.stroke();
      for (const p of o.pl) {
        const th = p.p + t * p.sp, ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
        const x = cx + ex * Math.cos(ang) - ey * Math.sin(ang), y = cy + ex * Math.sin(ang) + ey * Math.cos(ang);
        const pg = ctx.createRadialGradient(x, y, 0, x, y, p.s * 5);
        pg.addColorStop(0, `hsla(${p.c},.85)`); pg.addColorStop(1, 'transparent');
        ctx.fillStyle = pg; ctx.fillRect(x - p.s * 5, y - p.s * 5, p.s * 10, p.s * 10);
        ctx.fillStyle = `hsl(${p.c})`; ctx.beginPath(); ctx.arc(x, y, p.s, 0, TAU); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  build(); measure();
  if (reduced) requestAnimationFrame(t => { frame(t); running = false; });
  else requestAnimationFrame(frame);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { build(); measure(); }, 200); });
  addEventListener('load', () => setTimeout(measure, 300));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !running && !reduced) { running = true; requestAnimationFrame(frame); } else if (document.hidden) running = false; });
})();
