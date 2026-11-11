/* "Dịu mắt" (calm) mode: no animation, no moving background, softer colour. Remembered per visitor. */
(() => {
  'use strict';
  const KEY = 'portfolio-calm';
  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const write = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saved = read();
  const apply = on => { root.classList.toggle('mp-calm', on); document.querySelectorAll('.calm-toggle').forEach(b => b.setAttribute('aria-pressed', String(on))); };
  apply(saved ? saved === '1' : reduced);

  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const btn = () => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'calm-toggle'; b.innerHTML = icon;
    b.setAttribute('aria-pressed', String(root.classList.contains('mp-calm')));
    b.setAttribute('aria-label', 'Chế độ dịu mắt: tắt hiệu ứng chuyển động'); b.title = 'Chế độ dịu mắt';
    b.addEventListener('click', () => {
      const on = !root.classList.contains('mp-calm'); apply(on); write(on ? '1' : '0');
      let t = document.querySelector('.calm-toast');
      if (!t) { t = document.createElement('div'); t.className = 'calm-toast'; t.setAttribute('role', 'status'); document.body.append(t); }
      t.textContent = on ? 'Đã bật chế độ dịu mắt: tắt hiệu ứng chuyển động' : 'Đã tắt chế độ dịu mắt';
      t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200);
    });
    return b;
  };

  const mount = () => {
    const theme = document.getElementById('theme-toggle');
    const caseTheme = document.querySelector('.mp-theme');
    if (theme && theme.parentElement && matchMedia('(max-width: 767px)').matches) {   // phones: floating button, the bottom bar is full
      const b = btn(); b.classList.add('calm-toggle--fab'); document.body.append(b);
    } else if (theme && theme.parentElement) {                    // main site: next to the theme switch in the navbar
      const li = document.createElement('li'); li.className = 'navbar-item'; li.append(btn());
      theme.parentElement.after(li);
    } else if (caseTheme && !caseTheme.classList.contains('mp-theme--float')) {   // case pages: next to the switch in the top bar
      const grp = document.createElement('div'); grp.className = 'case-tools';
      caseTheme.before(grp); grp.append(btn(), caseTheme);
    } else {                                              // pages without a bar: floating
      const b = btn(); b.classList.add('calm-toggle--float'); document.body.append(b);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
