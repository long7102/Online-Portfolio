/* Small UX extras: coloured client logos on hover, project result chips, smooth brief scroll. */
(() => {
  'use strict';
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* mark the Tuan Tu card so it can glow green on hover */
  $$('.clients-item img').forEach(img => {
    const card = img.closest('a, .client-logo-card');
    if (card && /tuan-tu/.test(img.getAttribute('src') || '')) card.classList.add('client-tt');
  });

  /* result chip on each project card, using numbers already published on this site */
  const results = {
    'highway-menswear': ['+20%', 'tương tác tự nhiên'],
    'p-global': ['30–50M', 'doanh thu mỗi tháng'],
    'beatvn': ['5.000', 'tương tác mỗi bài'],
    'minclue-fitness': ['Content & Social', 'hệ thống nội dung'],
  };
  $$('.project-item[data-category]').forEach(li => {
    const r = results[li.dataset.category];
    const cat = li.querySelector('.project-category');
    if (!r || !cat || li.querySelector('.project-result')) return;
    const el = document.createElement('p');
    el.className = 'project-result';
    const b = document.createElement('strong');
    b.textContent = r[0];
    el.append(b, ' ' + r[1]);
    cat.after(el);
  });

  /* project images open in the immersive viewer (replaces the small lightbox) */
  document.addEventListener('click', e => {
    const a = e.target.closest('.project-list .project-item > a');
    if (!a || !window.MPViewer) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const items = $$('.project-list .project-item').filter(li => li.classList.contains('active') && !li.hidden && li.offsetParent !== null);
    const me = a.parentElement;
    const label = li => (li.querySelector('.project-category') || {}).textContent || '';
    window.MPViewer.open({
      kicker: 'Portfolio / ' + (label(me) || 'Dự án'),
      title: (me.querySelector('.project-title') || {}).textContent || 'Dự án',
      index: Math.max(0, items.indexOf(me)),
      images: items.map(li => {
        const im = li.querySelector('.project-img img'), t = (li.querySelector('.project-title') || {}).textContent || '';
        const chip = li.querySelector('.project-result');
        return { src: im.currentSrc || im.src, thumb: im.currentSrc || im.src, label: label(li), caption: t + (chip ? ' · ' + chip.textContent : ''), alt: im.alt };
      }),
    });
  }, true);

  /* items tagged "organic" get their own filter category */
  $$('article[data-page="blog"] .blog-post-item').forEach(li => {
    const c = (li.querySelector('.blog-category') || {}).textContent || '';
    if (/organic/i.test(c)) li.dataset.contentCategory = 'organic';
  });

  /* easter-egg image loads only when the egg opens */
  (() => {
    const egg = document.getElementById('falling-letter'); if (!egg) return;
    const img = egg.querySelector('img[data-src]'); if (!img) return;
    const load = () => { if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } };
    if (egg.classList.contains('active')) load();
    new MutationObserver(() => { if (egg.classList.contains('active')) load(); }).observe(egg, { attributes: true, attributeFilter: ['class'] });
  })();

  /* brief link scrolls smoothly to the form */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll-brief]');
    if (!a) return;
    e.preventDefault();
    const t = document.querySelector('.contact-form-box');
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* theme: follow the system until the visitor chooses; expose switch state to screen readers */
  (() => {
    const btn = document.getElementById('theme-toggle'); if (!btn) return;
    const KEY = 'portfolio-theme', mq = matchMedia('(prefers-color-scheme: light)');
    const saved = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
    const sync = () => { btn.setAttribute('role', 'switch'); btn.setAttribute('aria-checked', String(document.body.classList.contains('light-mode'))); };
    sync();
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (mq.addEventListener) mq.addEventListener('change', e => { if (!saved()) document.body.classList.toggle('light-mode', e.matches); });
  })();
})();
