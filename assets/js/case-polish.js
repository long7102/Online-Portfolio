/* Case-study pages: theme (light/dark, follows the system until chosen), brand mark, reveal, related cases, image viewer. */
(() => {
  'use strict';
  const KEY = 'portfolio-theme';
  const mq = matchMedia('(prefers-color-scheme: light)');
  const saved = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const apply = light => { document.body.classList.toggle('light-mode', light); document.documentElement.style.colorScheme = light ? 'light' : 'dark'; const t = document.querySelector('.mp-theme'); if (t) t.setAttribute('aria-checked', String(light)); };
  apply(saved() ? saved() === 'light' : mq.matches);
  mq.addEventListener && mq.addEventListener('change', e => { if (!saved()) apply(e.matches); });

  /* nav: brand + theme switch */
  const nav = document.querySelector('.case-nav');
  if (nav) {
    const brand = nav.querySelector('span');
    if (brand) { const a = document.createElement('a'); a.href = '../index.html'; a.className = 'case-brand'; a.innerHTML = '<img src="/favicon.svg" alt="" width="26" height="26"><span></span>'; a.querySelector('span').textContent = brand.textContent; brand.replaceWith(a); }
    const sw = document.createElement('button');
    sw.type = 'button'; sw.className = 'mp-theme'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', 'Chế độ sáng');
    sw.setAttribute('aria-checked', String(document.body.classList.contains('light-mode')));
    sw.innerHTML = '<i class="mp-theme-thumb"></i>';
    sw.addEventListener('click', () => { const light = !document.body.classList.contains('light-mode'); apply(light); try { localStorage.setItem(KEY, light ? 'light' : 'dark'); } catch (_) {} });
    nav.append(sw);
  }

  /* reveal on scroll */
  const targets = [...document.querySelectorAll('.metrics > div, .content > div, .case-image, .showcase, .gallery-group, .cta')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('cp-in'); io.unobserve(e.target); } }), { threshold: .12 });
    targets.forEach((el, i) => { el.classList.add('cp-reveal'); el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  }

  /* hero image opens in the immersive viewer */
  const hero = document.querySelector('.case-image img');
  if (hero) {
    hero.closest('.case-image').style.cursor = 'zoom-in';
    hero.closest('.case-image').addEventListener('click', () => {
      if (!window.MPViewer) return;
      window.MPViewer.open({ kicker: (document.querySelector('.eyebrow') || {}).textContent || 'Case study', title: (document.querySelector('h1') || {}).textContent || '', images: [{ src: hero.currentSrc || hero.src, alt: hero.alt, caption: (document.querySelector('.case-image figcaption') || {}).textContent || '' }] });
    });
  }

  /* related case studies */
  const cases = [
    ['highway-menswear', 'Highway Menswear', '+20% tương tác tự nhiên'],
    ['p-global', 'P Global', 'Doanh thu duy trì 30–50M/tháng'],
    ['beatvn', 'BeatVN', '5.000 tương tác mỗi bài'],
    ['minclue-fitness', 'Minclue Fitness', 'Content & Social'],
  ];
  const cur = location.pathname.split('/').pop().replace('.html', '');
  const main = document.querySelector('.case-main');
  if (main && cases.some(c => c[0] === cur)) {
    const sec = document.createElement('section'); sec.className = 'case-more'; sec.setAttribute('aria-labelledby', 'case-more-title');
    sec.innerHTML = '<p class="eyebrow">Xem thêm</p><h2 id="case-more-title">Các dự án khác</h2><div class="case-more-grid"></div>';
    const grid = sec.querySelector('.case-more-grid');
    cases.filter(c => c[0] !== cur).forEach(c => {
      const a = document.createElement('a'); a.href = c[0] + '.html'; a.className = 'case-more-card';
      const img = document.createElement('img'); img.src = '/assets/images/og-' + c[0] + '.jpg'; img.alt = ''; img.loading = 'lazy'; img.width = 1200; img.height = 630;
      const b = document.createElement('strong'); b.textContent = c[1]; const s = document.createElement('span'); s.textContent = c[2];
      const d = document.createElement('div'); d.append(b, s); a.append(img, d); grid.append(a);
    });
    main.append(sec);
  }
})();
