/* Site-wide background: deep-space starfield with two soft, fixed-colour gold glows that slowly breathe.
   No colour change, no reaction to scrolling, an occasional shooting star. Dark mode only. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.id = 'mp-sky'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 1.5), TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, stars = [], shoot = null, nextShoot = 6, running = true;
  const build = () => {
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(380, W * H / 5200));
    stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), z: rnd(.2, 1), s: rnd(.5, 1.7), tw: rnd(0, TAU), sp: rnd(.25, .9), warm: Math.random() < .6 }));
  };
  const frame = now => {
    if (!running) return;
    if (!reduced) requestAnimationFrame(frame);
    if (document.body.classList.contains('light-mode')) { cv.style.display = 'none'; return; }
    cv.style.display = 'block';
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    /* two big soft glows, fixed colours, slow breathing */
    const glows = [[.12, .1, .6, 'hsla(38,95%,52%,', .14], [.92, .78, .65, 'hsla(30,90%,48%,', .11], [.55, 1.02, .5, 'hsla(215,70%,45%,', .05]];
    glows.forEach(([gx, gy, gr, col, a], i) => {
      const r = Math.max(W, H) * gr * (1 + .05 * Math.sin(t * .15 + i * 2)), x = gx * W + Math.sin(t * .05 + i) * 24, y = gy * H + Math.cos(t * .04 + i) * 18;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col + a * (.85 + .15 * Math.sin(t * .2 + i)) + ')'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    /* stars: very slow horizontal drift, gentle twinkle */
    for (const s of stars) {
      const x = ((s.x * W + t * 2.2 * s.z) % W + W) % W;
      const a = .22 + .5 * s.z * (.55 + .45 * Math.sin(t * s.sp + s.tw));
      ctx.fillStyle = s.warm ? `hsla(44,70%,88%,${a})` : `hsla(210,40%,92%,${a * .8})`;
      ctx.fillRect(x, s.y * H, s.s, s.s);
      if (s.s > 1.5 && s.z > .8) { const g = ctx.createRadialGradient(x, s.y * H, 0, x, s.y * H, 7); g.addColorStop(0, `hsla(44,100%,85%,${a * .5})`); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - 7, s.y * H - 7, 14, 14); }
    }
    /* rare shooting star */
    if (!reduced) {
      if (!shoot && t > nextShoot) { shoot = { x: rnd(W * .2, W), y: rnd(0, H * .4), vx: -rnd(5, 8), vy: rnd(2.2, 4), life: 1 }; nextShoot = t + rnd(9, 16); }
      if (shoot) {
        const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 14, shoot.y - shoot.vy * 14);
        g.addColorStop(0, `hsla(46,100%,90%,${shoot.life * .85})`); g.addColorStop(1, 'transparent');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx * 14, shoot.y - shoot.vy * 14); ctx.stroke();
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= .014; if (shoot.life <= 0) shoot = null;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  build(); requestAnimationFrame(frame);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(frame); } });
})();
