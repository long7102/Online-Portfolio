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
  const performanceLite = (navigator.deviceMemory && navigator.deviceMemory <= 4) || navigator.hardwareConcurrency <= 4;
  if (performanceLite) document.documentElement.classList.add('performance-lite');
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

  let heroInView = true;
  if (portfolioHero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      heroVisual?.classList.toggle('is-paused', !heroInView);
    }, { rootMargin: '12% 0px', threshold: 0.01 }).observe(portfolioHero);
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
    let parallaxFrame;
    window.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => document.body.classList.remove('is-scrolling'), 140);
      if (portfolioHero && heroInView && !performanceLite) {
        cancelAnimationFrame(parallaxFrame);
        parallaxFrame = requestAnimationFrame(() => {
          const progress = Math.max(-1, Math.min(1, -portfolioHero.getBoundingClientRect().top / innerHeight));
          portfolioHero.style.setProperty('--parallax-copy', `${(progress * 6).toFixed(2)}px`);
          portfolioHero.style.setProperty('--parallax-visual', `${(progress * -10).toFixed(2)}px`);
        });
      }
    }, { passive: true });
  }

  document.querySelectorAll('video').forEach((video) => {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !video.paused) video.pause();
    }, { threshold: 0.01 }).observe(video);
  });

  document.querySelectorAll('.impact-grid strong, .proof-strip strong').forEach((counter) => {
    const original = counter.textContent.trim();
    const match = original.match(/^([+]?)(\d{1,3}(?:\.\d{3})*)(?:\s*[–-]\s*(\d{1,3}(?:\.\d{3})*))?([A-Za-z+°%]*)$/);
    if (!match || reducedMotion) return;
    const [, prefix, rawValue, rawRangeEnd, suffix] = match;
    const target = Number(rawValue.replaceAll('.', ''));
    const rangeTarget = rawRangeEnd ? Number(rawRangeEnd.replaceAll('.', '')) : null;
    const rangeSeparator = original.includes('–') ? '–' : '-';
    const formatValue = (value) => rawValue.includes('.') ? value.toLocaleString('vi-VN') : String(value);
    const formatRangeValue = (value) => rawRangeEnd?.includes('.') ? value.toLocaleString('vi-VN') : String(value);
    const renderValue = (progress) => {
      const first = formatValue(Math.round(target * progress));
      const second = rangeTarget === null ? '' : `${rangeSeparator}${formatRangeValue(Math.round(rangeTarget * progress))}`;
      counter.textContent = `${prefix}${first}${second}${suffix}`;
    };
    renderValue(0);
    const animateCounter = () => {
      const startedAt = performance.now();
      const largestTarget = Math.max(target, rangeTarget || 0);
      const duration = Math.min(1600, 900 + Math.log10(largestTarget + 1) * 215);
      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 2.35);
        renderValue(eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        animateCounter();
        observer.disconnect();
      }, { threshold: .45 });
      observer.observe(counter);
    } else animateCounter();
  });

  const tiktokMetrics = [...document.querySelectorAll('.tiktok-card-copy dd')].filter((metric) => metric.textContent.trim() !== '-');
  const animateTiktokMetrics = () => {
    tiktokMetrics.forEach((metric) => {
      const original = metric.textContent.trim();
      const match = original.match(/^(\d+(?:[.,]\d+)?)([KMB]?)$/i);
      if (!match) return;
      const [, rawValue, suffix] = match;
      const isThousands = !suffix && /^\d{1,3}\.\d{3}$/.test(rawValue);
      const decimals = rawValue.includes(',') ? rawValue.split(',')[1].length : 0;
      const target = Number(isThousands ? rawValue.replace('.', '') : rawValue.replace(',', '.'));
      const formatValue = (value) => {
        if (decimals) return value.toFixed(decimals).replace('.', ',');
        return Math.round(value).toLocaleString('vi-VN');
      };
      metric.textContent = `0${suffix}`;
      const startedAt = performance.now();
      const duration = Math.min(1600, 900 + Math.log10(target + 1) * 215);
      const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 2.35);
        metric.textContent = `${formatValue(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  if (tiktokMetrics.length && !reducedMotion) {
    const tiktokGrid = document.querySelector('.tiktok-viral-grid');
    if ('IntersectionObserver' in window && tiktokGrid) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        animateTiktokMetrics();
        observer.disconnect();
      }, { threshold: .15 });
      observer.observe(tiktokGrid);
    } else animateTiktokMetrics();
  }

  document.querySelectorAll('.value-process').forEach((process) => {
    if (!('IntersectionObserver' in window) || reducedMotion) {
      process.classList.add('is-sequenced');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      process.classList.add('is-sequenced');
      observer.disconnect();
    }, { threshold: .18 });
    observer.observe(process);
  });

  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.hero-btn').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const bounds = button.getBoundingClientRect();
        button.style.setProperty('--mag-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 8}px`);
        button.style.setProperty('--mag-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 6}px`);
      }, { passive: true });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });

    document.querySelectorAll('.project-item > a').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.setProperty('--card-rx', `${(-y * 2.8).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(x * 3.6).toFixed(2)}deg`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
      });
    });
  }

  document.querySelectorAll('.project-item').forEach((item) => {
    const figure = item.querySelector('.project-img');
    const title = item.querySelector('.project-title')?.textContent.trim();
    const category = item.querySelector('.project-category')?.textContent.trim();
    if (!figure || !title || figure.querySelector('.project-hover-copy')) return;
    const overlay = document.createElement('span');
    overlay.className = 'project-hover-copy';
    overlay.innerHTML = `<strong>${title}</strong><small>${category || 'Dự án thực chiến'}</small><em>Nhấn để xem chi tiết</em>`;
    figure.appendChild(overlay);
  });

  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const pages = [...document.querySelectorAll('[data-page]')];
  const normalized = (value) => value.toLowerCase().trim();

  let pageTransitionTimer;
  const openPage = (pageName, updateHash = true, animate = true) => {
    const target = normalized(pageName);
    const targetPage = pages.find((page) => normalized(page.dataset.page || '') === target);
    const currentPage = pages.find((page) => page.classList.contains('active'));
    if (!targetPage) return;
    if (currentPage === targetPage) {
      if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(target)}`);
      return;
    }
    navLinks.forEach((link) => {
      const active = normalized(link.getAttribute('data-nav-link') || '') === target;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(target)}`);
    window.clearTimeout(pageTransitionTimer);
    pages.forEach((page) => page.classList.remove('page-leaving', 'page-entering', 'page-entering-active'));
    document.body.classList.remove('page-changing');
    if (!animate || reducedMotion || !currentPage) {
      pages.forEach((page) => page.classList.toggle('active', page === targetPage));
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    document.body.classList.add('page-changing');
    currentPage.classList.add('page-leaving');
    pageTransitionTimer = window.setTimeout(() => {
      pages.forEach((page) => page.classList.toggle('active', page === targetPage));
      currentPage.classList.remove('page-leaving');
      targetPage.classList.add('page-entering');
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => targetPage.classList.add('page-entering-active'));
      window.setTimeout(() => {
        targetPage.classList.remove('page-entering', 'page-entering-active');
        document.body.classList.remove('page-changing');
      }, 360);
    }, 140);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => openPage(link.getAttribute('data-nav-link') || ''));
  });

  document.querySelectorAll('[data-jump-page]').forEach((button) => {
    button.addEventListener('click', () => openPage(button.getAttribute('data-jump-page') || ''));
  });

  const initialPage = decodeURIComponent(location.hash.slice(1));
  if (initialPage) openPage(initialPage, false, false);

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

