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

  /* brief link scrolls smoothly to the form */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll-brief]');
    if (!a) return;
    e.preventDefault();
    const t = document.querySelector('.contact-form-box');
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
