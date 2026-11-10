/* Modern polish: scroll reveal, staggered entrance, subtle card tilt. Progressive enhancement. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;
  const sel = '.impact-grid li, .value-process li, .about-intro, .service-item, .skills-item, .featured-work-card, .client-logo-card, .timeline-item, .project-item, .blog-post-item, .contact-card-box, .contact-form-box, .tiktok-showcase, .featured-case-banner';
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('mp-in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.documentElement.classList.add('mp-js');
  const seen = new Set();
  const observe = () => {
    document.querySelectorAll(sel).forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(sel)) : [];
      el.style.setProperty('--mp-delay', Math.min(sibs.indexOf(el), 6) * 70 + 'ms');
      el.classList.add('mp-reveal');
      io.observe(el);
    });
  };
  observe();
  // Items on hidden tabs become visible later: re-check when a page switches.
  document.addEventListener('click', e => { if (e.target.closest('[data-nav-link],[data-jump-page]')) setTimeout(observe, 60); });
  // Safety net: never leave content hidden.
  setTimeout(() => document.querySelectorAll('.mp-reveal:not(.mp-in)').forEach(el => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('mp-in');
  }), 1800);

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.featured-work-card, .impact-grid li').forEach(card => {
      card.classList.add('mp-tilt');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();

/* Milky Way canvas: rotating spiral galaxy with parallax stars and shooting stars. */
(() => {
  'use strict';
  const host = document.querySelector('.hero-visual');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'mp-galaxy'; cv.setAttribute('aria-hidden', 'true');
  host.prepend(cv);
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, stars = [], dust = [], shoot = null, t0 = performance.now(), visible = true, mx = 0, my = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const build = () => {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = Math.min(W, H) * .46, arms = 3, n = W < 500 ? 700 : 1500;
    stars = []; dust = [];
    for (let i = 0; i < n; i++) {
      const r = Math.pow(Math.random(), 1.6) * R, arm = (i % arms) * (Math.PI * 2 / arms);
      const a = arm + r / R * 3.4 + rnd(-.35, .35) * (1 - r / R * .5);
      const warm = Math.random() < .7;
      stars.push({ r, a, s: rnd(.4, 1.5), tw: rnd(0, 6.28), hue: warm ? rnd(35, 52) : rnd(200, 225), l: warm ? rnd(70, 92) : rnd(75, 95) });
    }
    for (let i = 0; i < 60; i++) { const r = Math.pow(Math.random(), 1.3) * R, a = (i % arms) * (Math.PI * 2 / arms) + r / R * 3.4 + rnd(-.3, .3); dust.push({ r, a, s: rnd(20, 60) }); }
    bg = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: rnd(.3, 1.1), z: rnd(.2, 1), tw: rnd(0, 6.28) }));
  };
  let bg = [];
  const draw = now => {
    if (!visible) return;
    const t = (now - t0) / 1000, cx = W / 2, cy = H / 2, rot = reduced ? 0 : t * .035;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .22);
    core.addColorStop(0, 'hsla(45,100%,80%,.35)'); core.addColorStop(.4, 'hsla(38,100%,62%,.10)'); core.addColorStop(1, 'transparent');
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    for (const d of dust) {
      const a = d.a + rot * .6, x = cx + Math.cos(a) * d.r, y = cy + Math.sin(a) * d.r * .72;
      const g = ctx.createRadialGradient(x, y, 0, x, y, d.s);
      g.addColorStop(0, 'hsla(215,70%,60%,.05)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(x - d.s, y - d.s, d.s * 2, d.s * 2);
    }
    for (const b of bg) {
      const x = ((b.x * W) + mx * b.z * 14 + W) % W, y = ((b.y * H) + my * b.z * 14 + H) % H;
      ctx.fillStyle = `hsla(0,0%,100%,${.25 + .3 * Math.sin(t * 1.5 + b.tw) * b.z})`; ctx.fillRect(x, y, b.s, b.s);
    }
    for (const s of stars) {
      const a = s.a + rot * (1.2 - s.r / (Math.min(W, H) * .46) * .6);
      const x = cx + Math.cos(a) * s.r, y = cy + Math.sin(a) * s.r * .72;
      const al = .45 + .4 * Math.sin(t * 1.8 + s.tw);
      ctx.fillStyle = `hsla(${s.hue},90%,${s.l}%,${Math.max(.1, al)})`; ctx.fillRect(x, y, s.s, s.s);
    }
    if (!reduced) {
      if (!shoot && Math.random() < .004) shoot = { x: rnd(W * .1, W * .8), y: rnd(0, H * .3), vx: rnd(5, 8), vy: rnd(2, 4), life: 1 };
      if (shoot) {
        const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 10, shoot.y - shoot.vy * 10);
        g.addColorStop(0, `hsla(45,100%,85%,${shoot.life})`); g.addColorStop(1, 'transparent');
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx * 10, shoot.y - shoot.vy * 10); ctx.stroke();
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= .02; if (shoot.life <= 0) shoot = null;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!reduced) requestAnimationFrame(draw);
  };
  build(); requestAnimationFrame(draw);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(build, 200); });
  new IntersectionObserver(e => { const v = e[0].isIntersecting; if (v && !visible) { visible = true; requestAnimationFrame(draw); } visible = v; }).observe(host);
  if (!reduced) host.parentElement.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; }, { passive: true });
})();
