/* Lightweight GA4 event tracking for the actions that matter (CV, calls, case studies, form, scroll depth).
   Works on every page; loads gtag after the page is idle if the page did not already do it. */
(() => {
  'use strict';
  const ID = 'G-Z6F8L7M4TS';
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', ID);
    let loaded = false;
    const load = () => { if (loaded) return; loaded = true; const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID; document.head.appendChild(s); };
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(e => addEventListener(e, load, { once: true, passive: true }));
    addEventListener('load', () => { if (window.requestIdleCallback) requestIdleCallback(load, { timeout: 4000 }); else setTimeout(load, 3500); });
  }
  const send = (name, params) => { try { window.gtag('event', name, Object.assign({ page_path: location.pathname }, params || {})); } catch (_) {} };
  const text = el => (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

  document.addEventListener('click', e => {
    const a = e.target.closest('a,button,summary');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.hasAttribute('download') || /\.pdf($|\?)/i.test(href)) return send('file_download', { file_name: href.split('/').pop(), link_text: text(a) });
    if (href.startsWith('tel:')) return send('click_to_call', { link_text: text(a) });
    if (href.startsWith('mailto:')) return send('click_email', { link_text: text(a) });
    if (/zalo\.me/.test(href)) return send('click_zalo', { link_text: text(a) });
    if (/tiktok\.com/.test(href)) return send('click_tiktok', { link_url: href });
    if (/facebook\.com/.test(href)) return send('click_facebook', { link_url: href });
    const cs = href.match(/case-studies\/([\w-]+)\.html/);
    if (cs) return send('open_case_study', { case_study: cs[1] });
    if (a.dataset.navLink) return send('nav_tab', { tab: a.dataset.navLink });
    if (a.dataset.jumpPage) return send('cta_jump', { target: a.dataset.jumpPage });
    if (a.hasAttribute('data-scroll-brief')) return send('brief_scroll');
    if (a.id === 'theme-toggle' || a.classList.contains('mp-theme')) return send('theme_toggle');
    if (a.closest('.project-item')) return send('view_project', { project: text(a.closest('.project-item').querySelector('.project-title') || a) });
    if (a.classList.contains('gallery-group')) return send('open_gallery', { gallery: text(a) });
    if (a.matches('.cv-menu summary')) return send('open_cv_menu');
  }, true);

  document.addEventListener('submit', e => { const f = e.target; if (f && f.tagName === 'FORM') send('generate_lead', { form: f.id || f.className || 'form' }); }, true);

  /* project viewer opens */
  addEventListener('load', () => {
    if (window.MPViewer && window.MPViewer.open) { const o = window.MPViewer.open; window.MPViewer.open = opts => { send('viewer_open', { title: (opts && opts.title) || '' }); return o(opts); }; }
  });

  /* scroll depth: 25 / 50 / 75 / 90 % once per page view */
  const hit = new Set();
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max < 200) return;
      const pct = scrollY / max * 100;
      [25, 50, 75, 90].forEach(t => { if (pct >= t && !hit.has(t)) { hit.add(t); send('scroll_depth', { percent: t }); } });
    });
  }, { passive: true });
})();
