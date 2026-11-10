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
