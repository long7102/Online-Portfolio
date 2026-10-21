/* Hybrid Premium Motion: lightweight progressive enhancement. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.portfolio-hero');
  const navbar = document.querySelector('.navbar');
  if (!hero || !navbar) return;

  // Page/tab navigation is handled by the existing script.
  const progress = document.createElement('div');
  progress.className = 'premium-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let raf = 0;
  const update = () => {
    raf = 0;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const ratio = scrollable > 0 ? Math.max(0,Math.min(1,scrollY / scrollable)) : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';
    navbar.classList.toggle('premium-scrolled', scrollY > 18);
  };
  window.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, {passive:true});
  window.addEventListener('resize', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, {passive:true});
  update();

  if (!reduced.matches) {
    // Initial reveal, without hiding content before JavaScript is ready.
    requestAnimationFrame(() => hero.classList.add('premium-hero-enter'));
  }
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (hoverCapable.matches && !reduced.matches) {
    let cursorFrame = 0;
    hero.addEventListener('pointermove', event => {
      if (cursorFrame) return;
      const rect = hero.getBoundingClientRect();
      const x = Math.max(0,Math.min(100,100*(event.clientX-rect.left)/rect.width));
      const y = Math.max(0,Math.min(100,100*(event.clientY-rect.top)/rect.height));
      cursorFrame = requestAnimationFrame(() => {
        hero.style.setProperty('--premium-x',x.toFixed(1)+'%');
        hero.style.setProperty('--premium-y',y.toFixed(1)+'%');
        cursorFrame = 0;
      });
    }, {passive:true});
    hero.addEventListener('pointerleave', () => {
      hero.style.removeProperty('--premium-x');
      hero.style.removeProperty('--premium-y');
    });
  }
})();
