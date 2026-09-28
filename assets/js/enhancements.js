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

  const heroVisual = document.querySelector('.hero-visual');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const portfolioHero = document.querySelector('.portfolio-hero');
  if (portfolioHero && finePointer) {
    let heroSpotFrame;
    portfolioHero.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(heroSpotFrame);
      heroSpotFrame = requestAnimationFrame(() => {
        const bounds = portfolioHero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        portfolioHero.style.setProperty('--hero-spot-x', `${x.toFixed(1)}%`);
        portfolioHero.style.setProperty('--hero-spot-y', `${y.toFixed(1)}%`);
      });
    }, { passive: true });
    if (heroVisual) {
      heroVisual.addEventListener('pointerenter', () => portfolioHero.classList.add('is-over-visual'));
      heroVisual.addEventListener('pointerleave', () => portfolioHero.classList.remove('is-over-visual'));
    }
  }
  if (heroVisual && finePointer && !reducedMotion) {
    let heroFrame;
    const setOrbitSpeed = (rate) => {
      heroVisual.querySelectorAll('.hero-planet, .hero-orbit').forEach((element) => {
        element.getAnimations().forEach((animation) => animation.updatePlaybackRate(rate));
      });
    };
    heroVisual.addEventListener('pointerenter', () => setOrbitSpeed(2.35));
    heroVisual.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(heroFrame);
      heroFrame = requestAnimationFrame(() => {
        const bounds = heroVisual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        heroVisual.style.setProperty('--pointer-x', `${((x + .5) * 100).toFixed(1)}%`);
        heroVisual.style.setProperty('--pointer-y', `${((y + .5) * 100).toFixed(1)}%`);
        heroVisual.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`);
        heroVisual.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`);
        heroVisual.classList.add('is-interacting');
      });
    }, { passive: true });
    heroVisual.addEventListener('pointerleave', () => {
      setOrbitSpeed(1);
      heroVisual.style.setProperty('--tilt-x', '0deg');
      heroVisual.style.setProperty('--tilt-y', '0deg');
      heroVisual.style.setProperty('--pointer-x', '50%');
      heroVisual.style.setProperty('--pointer-y', '50%');
      heroVisual.classList.remove('is-interacting');
    });
  }

  const tiktokShowcase = document.querySelector('.tiktok-showcase');
  if (tiktokShowcase && finePointer) {
    let spotlightFrame;
    tiktokShowcase.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(spotlightFrame);
      spotlightFrame = requestAnimationFrame(() => {
        const bounds = tiktokShowcase.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        tiktokShowcase.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
        tiktokShowcase.style.setProperty('--spot-y', `${y.toFixed(1)}%`);
      });
    }, { passive: true });
  }

  const revealItems = document.querySelectorAll(
    '.impact-grid li, .about-intro > *, .value-process li, .service-item, .competency-item, .proof-strip li, .project-item, .blog-post-item, .timeline-item, .clients-item, .tiktok-showcase-head, .tiktok-format-grid li, .tiktok-viral-grid > li'
  );

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-revealed'));
  } else {
    const groupOrder = new Map();
    revealItems.forEach((item) => {
      const group = item.parentElement;
      const index = groupOrder.get(group) || 0;
      groupOrder.set(group, index + 1);
      item.classList.add('reveal-ready');
      item.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 28}ms`);
    });
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.willChange = 'opacity, transform';
        entry.target.classList.add('is-revealed');
        window.setTimeout(() => {
          entry.target.style.willChange = 'auto';
          entry.target.style.removeProperty('--reveal-delay');
        }, 520);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 14% 0px', threshold: 0.01 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (!reducedMotion) {
    let scrollEndTimer;
    window.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => document.body.classList.remove('is-scrolling'), 140);
    }, { passive: true });
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

