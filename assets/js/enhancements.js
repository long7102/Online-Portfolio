'use strict';

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.page-loader');

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 500);
  };

  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, { once: true });
  window.setTimeout(hideLoader, 2400);

  document.querySelectorAll('img').forEach((img) => {
    img.decoding = 'async';
    if (!img.closest('.avatar-box') && !img.closest('.letter-content')) img.loading = 'lazy';
    const markLoaded = () => img.classList.add('is-loaded');
    if (img.complete) markLoaded();
    else img.addEventListener('load', markLoaded, { once: true });
  });

  document.querySelectorAll('video').forEach((video) => {
    video.preload = 'none';
    video.playsInline = true;
  });

  const revealItems = document.querySelectorAll(
    '.service-item, .competency-item, .proof-strip li, .project-item, .blog-post-item, .timeline-item, .clients-item'
  );

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-revealed'));
  } else {
    revealItems.forEach((item) => item.classList.add('reveal-ready'));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const pages = [...document.querySelectorAll('[data-page]')];
  const normalized = (value) => value.toLowerCase().trim();

  const openPage = (pageName, updateHash = true) => {
    const target = normalized(pageName);
    let found = false;
    pages.forEach((page) => {
      const active = normalized(page.dataset.page || '') === target;
      page.classList.toggle('active', active);
      if (active) found = true;
    });
    navLinks.forEach((link) => {
      const active = normalized(link.getAttribute('data-nav-link') || '') === target;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (!found) return;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(target)}`);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => openPage(link.getAttribute('data-nav-link') || ''));
  });

  document.querySelectorAll('[data-jump-page]').forEach((button) => {
    button.addEventListener('click', () => openPage(button.getAttribute('data-jump-page') || ''));
  });

  const initialPage = decodeURIComponent(location.hash.slice(1));
  if (initialPage) openPage(initialPage, false);

  const modalSelectors = ['#project-lightbox', '#video-modal-overlay', '#image-modal-overlay', '[data-modal-container]', '#easter-overlay'];
  const syncScrollLock = () => {
    const modalOpen = modalSelectors.some((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      return element.classList.contains('active') || element.style.opacity === '1';
    });
    document.body.classList.toggle('modal-open', modalOpen);
  };

  document.addEventListener('click', () => requestAnimationFrame(syncScrollLock));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const projectModal = document.querySelector('#project-lightbox');
    if (projectModal?.style.opacity === '1') projectModal.click();
    document.querySelector('[data-modal-container].active [data-modal-close-btn]')?.click();
    const imageModal = document.querySelector('#image-modal-overlay');
    if (imageModal?.style.opacity === '1') imageModal.click();
    syncScrollLock();
  });

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => document.documentElement.style.setProperty('--viewport-width', `${innerWidth}px`));
  }, { passive: true });
})();
