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

  /* brief link scrolls smoothly to the form */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll-brief]');
    if (!a) return;
    e.preventDefault();
    const t = document.querySelector('.contact-form-box');
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
