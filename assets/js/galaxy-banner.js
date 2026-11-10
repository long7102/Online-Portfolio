/* Contained spiral galaxy for the "Selected work" banner. Gold only, slow and calm. */
(() => {
  'use strict';
  const host = document.querySelector('.featured-case-banner');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'mp-banner-galaxy'; cv.setAttribute('aria-hidden', 'true');
  host.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2), TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, disk = [], big = [], dust = [], bg = [], visible = true, raf = 0;
  /* 6 orbit rings, 11 planets: shaded spheres in warm tones; two have rings of their own */
  const rings = [
    { k: .2, tilt: -.45, sp: .02, pl: [{ p: 0, sp: .16, s: 3.2, c: '45,100%,76%' }, { p: 3.4, sp: .16, s: 2, c: '30,80%,62%' }] },
    { k: .32, tilt: .3, sp: -.014, pl: [{ p: 2.2, sp: -.11, s: 4.6, c: '38,90%,66%', ring: true }] },
    { k: .46, tilt: -.1, sp: .01, pl: [{ p: 4, sp: .08, s: 3.4, c: '18,75%,58%' }, { p: 1, sp: .08, s: 2.2, c: '48,100%,86%' }] },
    { k: .6, tilt: .55, sp: -.009, pl: [{ p: 5.2, sp: -.06, s: 5.6, c: '34,70%,60%', ring: true }] },
    { k: .76, tilt: -.28, sp: .006, pl: [{ p: 2.8, sp: .05, s: 3, c: '44,100%,80%' }, { p: 0.2, sp: .05, s: 2.4, c: '24,80%,56%' }] },
    { k: .92, tilt: .15, sp: -.005, pl: [{ p: 1.6, sp: -.04, s: 3.8, c: '40,60%,72%' }, { p: 4.6, sp: -.04, s: 1.8, c: '0,0%,94%' }] },
  ];
  const build = () => {
    const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 600 ? 700 : 1700;
    disk = Array.from({ length: n }, (_, i) => {
      const rr = Math.pow(Math.random(), 1.05), a = (i % 2) * Math.PI + rr * 3.0 + rnd(-.42, .42) * (1.05 - rr * .45);
      return { r: rr, a, s: rnd(.7, 2.2), tw: rnd(0, TAU), l: rnd(76, 96), h: 38 + rr * 10 };
    });
    big = disk.filter((_, i) => i % 70 === 0).slice(0, 28);
    dust = Array.from({ length: 22 }, (_, i) => ({ r: rnd(.15, .85), a: (i % 3) * TAU / 3 + rnd(0, 1.4), s: rnd(.16, .3) }));
    bg = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: rnd(.5, 1.4), tw: rnd(0, TAU) }));
  };
  const draw = now => {
    raf = visible && !reduced ? requestAnimationFrame(draw) : 0;
    const m = W < 700, t = now / 1000, cx = W * (m ? .6 : .72), cy = H * (m ? .8 : .5);
    const R = Math.min(W * (W < 700 ? .7 : .52), H * 1.25), rot = t * .02;
    const tilt = -.4, ct = Math.cos(tilt), st = Math.sin(tilt), sq = .55;
    const at = (r, a) => { const px = Math.cos(a) * r, py = Math.sin(a) * r * sq; return [cx + px * ct - py * st, cy + px * st + py * ct]; };
    const light = document.body.classList.contains('light-mode'), dl = light ? -44 : 0, BLEND = light ? 'source-over' : 'lighter';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = BLEND;
    for (const b of bg) { ctx.fillStyle = `hsla(40,70%,${light ? 40 : 90}%,${.25 + .35 * Math.sin(t * .7 + b.tw) ** 2})`; ctx.fillRect(b.x * W, b.y * H, b.s, b.s); }
    for (const d of (light ? [] : dust)) {
      const [x, y] = at(d.r * R, d.a + rot * .5), s = d.s * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(0, 'hsla(38,95%,58%,.09)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - s, y - s, s * 2, s * 2);
    }
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .5);
    core.addColorStop(0, light ? 'hsla(42,95%,62%,.38)' : 'hsla(46,100%,86%,.42)'); core.addColorStop(.35, light ? 'hsla(40,95%,66%,.14)' : 'hsla(40,100%,64%,.16)'); core.addColorStop(.7, light ? 'hsla(38,90%,70%,.04)' : 'hsla(32,90%,48%,.06)'); core.addColorStop(1, 'transparent');
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    for (const s of disk) {
      const [x, y] = at(s.r * R, s.a + rot * (1.5 - s.r * .9));
      ctx.fillStyle = `hsla(${s.h},88%,${s.l + dl}%,${Math.max(.18, (.75 - s.r * .35) * (.6 + .4 * Math.sin(t * .8 + s.tw)))})`;
      if (light) { ctx.beginPath(); ctx.arc(x + s.s / 2, y + s.s / 2, s.s * .45, 0, TAU); ctx.fill(); } else ctx.fillRect(x, y, s.s, s.s);
    }
    for (const s of big) {
      const [x, y] = at(s.r * R, s.a + rot * (1.5 - s.r * .9)), h = 6 + 4 * Math.sin(t * .7 + s.tw) ** 2;
      if (light) { const a = .55 + .35 * Math.sin(t * .8 + s.tw); ctx.strokeStyle = `hsla(36,85%,40%,${a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - h * .7, y); ctx.lineTo(x + h * .7, y); ctx.moveTo(x, y - h * .7); ctx.lineTo(x, y + h * .7); ctx.stroke(); continue; }
      const g = ctx.createRadialGradient(x, y, 0, x, y, h * 2.4);
      g.addColorStop(0, light ? 'hsla(40,90%,45%,.8)' : 'hsla(48,100%,94%,.9)'); g.addColorStop(.3, light ? 'hsla(38,90%,50%,.25)' : 'hsla(44,100%,72%,.25)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x - h * 2.4, y - h * 2.4, h * 4.8, h * 4.8);
    }
    ctx.lineWidth = 1;
    for (const o of rings) {
      const rx = o.k * R, ry = rx * .42, ang = o.tilt + t * o.sp;
      ctx.strokeStyle = light ? 'hsla(36,70%,40%,.4)' : 'hsla(45,100%,74%,.3)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, ang, 0, TAU); ctx.stroke();
      for (const p0 of o.pl) {
        const p = { ...p0, s: p0.s * 1.55 };
        const th = p.p + t * p.sp, ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
        const x = cx + ex * Math.cos(ang) - ey * Math.sin(ang), y = cy + ex * Math.sin(ang) + ey * Math.cos(ang);
        if (!light) { const g = ctx.createRadialGradient(x, y, 0, x, y, p.s * 5); g.addColorStop(0, `hsla(${p.c},.55)`); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - p.s * 5, y - p.s * 5, p.s * 10, p.s * 10); }
        const lx = x + (cx - x) * .12, ly = y + (cy - y) * .12;      // lit from the galactic core
        const sg = ctx.createRadialGradient(lx - p.s * .3, ly - p.s * .3, 0, x, y, p.s);
        const [ph, ps, pl] = p.c.split(',').map(parseFloat);
        sg.addColorStop(0, `hsl(${ph},${ps}%,${Math.min(95, pl + 24)}%)`); sg.addColorStop(1, `hsl(${ph},${ps}%,${Math.max(10, pl - 30)}%)`);
        ctx.globalCompositeOperation = 'source-over';
        if (p.ring) { ctx.strokeStyle = 'hsla(42,80%,78%,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, y, p.s * 2.1, p.s * .7, ang - .35, 0, TAU); ctx.stroke(); }
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, p.s, 0, TAU); ctx.fill();
        if (light) { ctx.strokeStyle = 'hsla(30,60%,30%,.35)'; ctx.lineWidth = .8; ctx.stroke(); }
        ctx.globalCompositeOperation = BLEND; ctx.lineWidth = 1;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  build(); requestAnimationFrame(draw);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); });
  new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible && !raf && !reduced) raf = requestAnimationFrame(draw); }).observe(host);
  new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(build, 150); }).observe(host);
})();
