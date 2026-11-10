/* GSAP (ScrollTrigger) + Motion (Framer's engine) choreography. */
(() => {
  'use strict';
  const { gsap, ScrollTrigger, Motion } = window;
  if (!gsap || !Motion) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('mp-gsap');
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const { animate, inView, stagger } = Motion;

  /* ---------- Hero intro + scroll-scrubbed exit ---------- */
  const hero = document.querySelector('.portfolio-hero');
  if (hero) {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero-eyebrow', { y: 20, opacity: 0, duration: .7 })
      .from('#hero-title > *', { yPercent: 60, opacity: 0, rotateX: -40, transformOrigin: '0 100%', duration: 1, stagger: .12 }, '-=.35')
      .from('.hero-summary', { y: 24, opacity: 0, duration: .8 }, '-=.6')
      .from('.hero-actions .hero-btn', { y: 20, opacity: 0, scale: .94, duration: .7, stagger: .1 }, '-=.55')
      .from('.hero-proof span', { y: 14, opacity: 0, duration: .6, stagger: .1 }, '-=.5')
      .from('.hero-card', { y: 40, opacity: 0, scale: .92, duration: 1, stagger: .12, ease: 'power3.out' }, .3);
    const sc = { trigger: hero, start: 'top top', end: 'bottom 15%', scrub: .7 };
    gsap.to('.hero-copy', { yPercent: -14, opacity: .08, scale: .94, transformOrigin: '0 50%', ease: 'none', scrollTrigger: sc });
    gsap.to('.hero-cards', { yPercent: -10, opacity: .1, ease: 'none', scrollTrigger: sc });
  }

  /* ---------- Split-word headline reveal, scrubbed to scroll ---------- */
  const split = el => {
    if (el.dataset.mpSplit || [...el.childNodes].some(n => n.nodeType === 1)) return;
    el.dataset.mpSplit = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w => `<span class="mp-w" aria-hidden="true"><span class="mp-wi">${w}</span></span>`).join(' ');
    gsap.fromTo(el.querySelectorAll('.mp-wi'), { yPercent: 115, rotate: 6, opacity: 0 },
      { yPercent: 0, rotate: 0, opacity: 1, ease: 'power3.out', stagger: .08,
        scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 50%', scrub: .6 } });
  };

  /* ---------- Scroll choreography for blocks ---------- */
  const armed = new WeakSet();
  const visible = el => el.offsetParent !== null;
  const arm = () => {
    $$('.article-title, .about-intro h3, .tiktok-showcase-head h3, .featured-case-content h3, .tiktok-viral-head h4, .project-library-heading h3').forEach(el => visible(el) && split(el));

    /* cards: 3D flip-up scrubbed */
    const cards = $$('.project-item, .featured-work-card, .blog-post-item, .tiktok-viral-grid li').filter(el => !armed.has(el) && visible(el));
    cards.forEach(el => {
      armed.add(el);
      gsap.fromTo(el, { y: 90, rotateX: 16, scale: .94, opacity: 0, transformPerspective: 1100, transformOrigin: '50% 100%' },
        { y: 0, rotateX: 0, scale: 1, opacity: 1, ease: 'power2.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 97%', end: 'top 62%', scrub: .5 } });
    });

    /* small items: batched, staggered */
    const small = $$('.impact-grid li, .value-process li, .about-intro p, .service-item, .skills-item, .client-logo-card, .contact-card-box, .contact-form-box, .tiktok-format-grid li, .timeline-item, .about-intro .value-process').filter(el => !armed.has(el) && visible(el));
    small.forEach(el => armed.add(el));
    gsap.set(small, { opacity: 0, y: 40 });
    ScrollTrigger.batch(small, { start: 'top 92%', once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .09, overwrite: true, clearProps: 'transform' }) });

    /* banner: grows into place and its content drifts at a different speed */
    $$('.featured-case-banner').filter(el => !armed.has(el) && visible(el)).forEach(el => {
      armed.add(el);
      gsap.fromTo(el, { scale: .9, borderRadius: 60 }, { scale: 1, borderRadius: 24, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: .6 } });
      gsap.fromTo(el.querySelector('.featured-case-orbits'), { yPercent: -35, rotate: -25 }, { yPercent: -50, rotate: 25, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    });
    ScrollTrigger.refresh();
  };
  arm();

  /* ---------- Counters ---------- */
  const counters = () => $$('.impact-grid strong, .hero-proof strong').forEach(el => {
    if (el.dataset.mpCount) return;
    const m = el.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m) return;
    el.dataset.mpCount = '1';
    const end = +m[1], o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(o.v)).padStart(m[1].length, '0') + m[2]; } }) });
  });
  counters();

  /* ---------- Card tilt (pointer) ---------- */
  if (fine) $$('.featured-work-card, .impact-grid li').forEach(card => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
    card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 8); rx(-((e.clientY - r.top) / r.height - .5) * 8); });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* ---------- Motion (Framer): spring feedback + page switch ---------- */
  const spring = { type: 'spring', stiffness: 380, damping: 22 };
  if (fine) $$('.hero-btn, .navbar-link, [data-filter-btn], .theme-toggle-btn, .form-btn').forEach(el => {
    el.addEventListener('pointerenter', () => animate(el, { scale: 1.06 }, spring));
    el.addEventListener('pointerleave', () => animate(el, { scale: 1 }, spring));
    el.addEventListener('pointerdown', () => animate(el, { scale: .95 }, spring));
    el.addEventListener('pointerup', () => animate(el, { scale: 1.06 }, spring));
  });
  inView('.section-kicker', ({ target }) => { animate(target, { opacity: [0, 1], x: [-24, 0] }, { duration: .7, easing: [.22, 1, .36, 1] }); }, { margin: '0px 0px -10% 0px' });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-nav-link],[data-jump-page]')) return;
    setTimeout(() => {
      const page = document.querySelector('article.active');
      if (page) animate(page.querySelectorAll('header, .portfolio-hero, .timeline, .featured-work, .mapbox'), { opacity: [0, 1], y: [28, 0] }, { delay: stagger(.08), type: 'spring', stiffness: 120, damping: 18 });
      arm(); counters(); ScrollTrigger.refresh();
    }, 80);
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
