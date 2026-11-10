/* Immersive image viewer.
   MPViewer.open({ title, kicker, images: [{ src, caption, full }], index })
   - big image, ambient blurred backdrop, thumbnail strip, keyboard / swipe / wheel / pinch / drag zoom. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    close: icon('<path d="M6 6l12 12M18 6L6 18"/>'),
    prev: icon('<path d="M15 5l-7 7 7 7"/>'),
    next: icon('<path d="M9 5l7 7-7 7"/>'),
    plus: icon('<path d="M12 5v14M5 12h14"/>'),
    minus: icon('<path d="M5 12h14"/>'),
    fit: icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    open: icon('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    full: icon('<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>'),
  };

  let root, els, state = null, opener = null, bodyOverflow = '';
  const MAXZ = 5;

  const build = () => {
    root = document.createElement('div');
    root.className = 'mpv';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Xem ảnh');
    root.innerHTML = `
      <div class="mpv-ambient"></div>
      <div class="mpv-top">
        <div class="mpv-title"><span class="mpv-kicker"></span><h2 class="mpv-name"></h2></div>
        <span class="mpv-count" aria-live="polite"></span>
        <div class="mpv-tools">
          <span class="mpv-zoomtxt"></span>
          <button class="mpv-btn mpv-out mpv-optional" type="button" aria-label="Thu nhỏ">${ICONS.minus}</button>
          <button class="mpv-btn mpv-in mpv-optional" type="button" aria-label="Phóng to">${ICONS.plus}</button>
          <button class="mpv-btn mpv-fit mpv-optional" type="button" aria-label="Vừa khung">${ICONS.fit}</button>
          <a class="mpv-btn mpv-orig mpv-optional" target="_blank" rel="noopener" aria-label="Mở ảnh gốc ở tab mới">${ICONS.open}</a>
          <button class="mpv-btn mpv-fs mpv-optional" type="button" aria-label="Toàn màn hình">${ICONS.full}</button>
          <button class="mpv-btn mpv-close" type="button" aria-label="Đóng">${ICONS.close}</button>
        </div>
      </div>
      <div class="mpv-stage">
        <div class="mpv-loader"></div>
        <div class="mpv-slide"><img class="mpv-img" alt="" draggable="false"></div>
        <button class="mpv-btn mpv-nav prev" type="button" aria-label="Ảnh trước">${ICONS.prev}</button>
        <button class="mpv-btn mpv-nav next" type="button" aria-label="Ảnh tiếp theo">${ICONS.next}</button>
        <div class="mpv-hint">Cuộn hoặc bấm đúp để phóng to · Kéo để di chuyển · ← → để chuyển ảnh</div>
      </div>
      <div class="mpv-bottom">
        <p class="mpv-caption"></p>
        <div class="mpv-thumbs" role="tablist" aria-label="Chọn ảnh"></div>
      </div>`;
    document.body.appendChild(root);
    const q = s => root.querySelector(s);
    els = { ambient: q('.mpv-ambient'), kicker: q('.mpv-kicker'), name: q('.mpv-name'), count: q('.mpv-count'), zoomtxt: q('.mpv-zoomtxt'),
      stage: q('.mpv-stage'), slide: q('.mpv-slide'), img: q('.mpv-img'), prev: q('.prev'), next: q('.next'), caption: q('.mpv-caption'),
      thumbs: q('.mpv-thumbs'), orig: q('.mpv-orig'), fs: q('.mpv-fs'), hint: q('.mpv-hint') };

    q('.mpv-close').addEventListener('click', close);
    els.prev.addEventListener('click', () => go(-1));
    els.next.addEventListener('click', () => go(1));
    q('.mpv-in').addEventListener('click', () => zoomBy(1.5));
    q('.mpv-out').addEventListener('click', () => zoomBy(1 / 1.5));
    q('.mpv-fit').addEventListener('click', () => setZoom(1, 0, 0, true));
    els.fs.addEventListener('click', () => { if (!document.fullscreenElement) root.requestFullscreen && root.requestFullscreen().catch(() => {}); else document.exitFullscreen(); });
    root.addEventListener('keydown', onKey);
    bindPointer();
  };

  /* ---------- zoom / pan ---------- */
  const view = { s: 1, x: 0, y: 0 };
  const apply = animate => {
    els.img.style.transition = animate && !reduced ? 'transform .28s cubic-bezier(.22,1,.36,1), opacity .3s ease' : 'opacity .3s ease';
    els.img.style.transform = `translate3d(${view.x}px,${view.y}px,0) scale(${view.s})`;
    root.classList.toggle('is-zoomed', view.s > 1.01);
    els.zoomtxt.textContent = Math.round(view.s * 100) + '%';
  };
  const clamp = () => {
    const sr = els.stage.getBoundingClientRect(), ir = els.img.getBoundingClientRect();
    const baseW = ir.width / view.s, baseH = ir.height / view.s;
    const mx = Math.max(0, (baseW * view.s - sr.width) / 2), my = Math.max(0, (baseH * view.s - sr.height) / 2);
    view.x = Math.max(-mx, Math.min(mx, view.x)); view.y = Math.max(-my, Math.min(my, view.y));
  };
  const setZoom = (s, cx, cy, animate) => {
    s = Math.max(1, Math.min(MAXZ, s));
    const k = s / view.s;
    view.x = cx - (cx - view.x) * k; view.y = cy - (cy - view.y) * k; view.s = s;
    if (s === 1) { view.x = 0; view.y = 0; }
    clamp(); apply(animate);
  };
  const stagePoint = e => { const r = els.stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
  const zoomBy = k => setZoom(view.s * k, 0, 0, true);

  const bindPointer = () => {
    const ptrs = new Map(); let drag = null, pinch = null, moved = 0, lastTap = 0;
    els.stage.addEventListener('wheel', e => {
      e.preventDefault();
      const [cx, cy] = stagePoint(e);
      setZoom(view.s * Math.exp(-e.deltaY * .0025), cx, cy, false);
    }, { passive: false });
    els.stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.mpv-nav')) return;
      els.stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s }; drag = null; }
      else drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, t: performance.now() };
    });
    els.stage.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = els.stage.getBoundingClientRect();
        setZoom(pinch.s * d / pinch.d, (a.x + b.x) / 2 - r.left - r.width / 2, (a.y + b.y) / 2 - r.top - r.height / 2, false); moved = 99; return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
      if (view.s > 1.01) { root.classList.add('is-drag'); view.x = drag.vx + dx; view.y = drag.vy + dy; clamp(); apply(false); }
    });
    const end = e => {
      if (!ptrs.has(e.pointerId)) return;
      const wasPinch = !!pinch; ptrs.delete(e.pointerId); root.classList.remove('is-drag');
      if (ptrs.size < 2) pinch = null;
      if (wasPinch || !drag) { if (!ptrs.size) drag = null; return; }
      const dx = e.clientX - drag.x, dt = performance.now() - drag.t, d = drag; drag = null;
      if (view.s <= 1.01 && Math.abs(dx) > 50 && Math.abs(dx) > moved * .6 && dt < 700) { go(dx < 0 ? 1 : -1); return; }
      if (moved < 6) {                               // a tap
        const now = performance.now(), [cx, cy] = stagePoint(e);
        if (now - lastTap < 320) { setZoom(view.s > 1.01 ? 1 : 2.6, cx, cy, true); lastTap = 0; }
        else { lastTap = now; setTimeout(() => { if (lastTap === now) { if (view.s <= 1.01) setZoom(2.2, cx, cy, true); else setZoom(1, 0, 0, true); lastTap = 0; } }, 330); }
      }
    };
    els.stage.addEventListener('pointerup', end); els.stage.addEventListener('pointercancel', end);
  };

  /* ---------- slides ---------- */
  const showHint = () => { try { if (sessionStorage.getItem('mpv-hint')) return; sessionStorage.setItem('mpv-hint', '1'); } catch (_) {} root.classList.add('show-hint'); setTimeout(() => root.classList.remove('show-hint'), 3800); };
  const render = (dir = 0) => {
    const it = state.images[state.i], n = state.images.length;
    els.count.textContent = `${String(state.i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    els.caption.innerHTML = '';
    if (it.caption) { const s = document.createElement('strong'); s.textContent = it.label || ''; els.caption.append(...(it.label ? [s] : []), it.caption); }
    els.orig.href = it.full || it.src;
    els.prev.disabled = state.i === 0; els.next.disabled = state.i === n - 1;
    els.thumbs.querySelectorAll('.mpv-thumb').forEach((t, k) => { if (k === state.i) { t.setAttribute('aria-current', 'true'); t.scrollIntoView({ inline: 'center', block: 'center', behavior: reduced ? 'auto' : 'smooth' }); } else t.removeAttribute('aria-current'); });
    root.classList.add('is-loading');
    view.s = 1; view.x = 0; view.y = 0;
    const token = ++state.token, img = els.img;
    img.classList.remove('is-ready');
    const pre = new Image(); pre.src = it.src;
    pre.decode().catch(() => {}).then(() => {
      if (token !== state.token) return;
      img.src = it.src; img.alt = it.alt || it.caption || state.title; apply(false);
      root.classList.remove('is-loading');
      els.ambient.style.backgroundImage = `url("${it.src}")`;
      requestAnimationFrame(() => {
        img.classList.add('is-ready');
        if (dir && !reduced) img.animate([{ transform: `translate3d(${dir * 46}px,0,0) scale(.985)`, opacity: 0 }, { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    });
    [state.i + 1, state.i - 1].forEach(k => { if (state.images[k]) { const p = new Image(); p.src = state.images[k].src; } });
  };
  const go = d => { const k = state.i + d; if (k < 0 || k >= state.images.length) return; state.i = k; render(d); };

  const onKey = e => {
    switch (e.key) {
      case 'Escape': close(); break;
      case 'ArrowRight': e.preventDefault(); go(1); break;
      case 'ArrowLeft': e.preventDefault(); go(-1); break;
      case 'Home': go(-state.i); break;
      case 'End': go(state.images.length - 1 - state.i); break;
      case '+': case '=': zoomBy(1.5); break;
      case '-': case '_': zoomBy(1 / 1.5); break;
      case '0': setZoom(1, 0, 0, true); break;
      case 'f': case 'F': els.fs.click(); break;
      case 'Tab': {                                    // keep focus inside
        const f = [...root.querySelectorAll('button:not(:disabled),a[href]')];
        if (!f.length) break;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        break;
      }
    }
  };

  const open = opts => {
    if (!root) build();
    opener = document.activeElement;
    state = { images: opts.images, i: Math.max(0, Math.min(opts.images.length - 1, opts.index || 0)), title: opts.title || '', token: 0 };
    els.kicker.textContent = opts.kicker || ''; els.name.textContent = opts.title || '';
    root.setAttribute('aria-label', 'Xem ảnh: ' + (opts.title || ''));
    root.classList.toggle('is-single', opts.images.length < 2);
    els.thumbs.replaceChildren(...opts.images.map((it, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'mpv-thumb'; b.setAttribute('aria-label', `Ảnh ${k + 1}`);
      const im = document.createElement('img'); im.src = it.thumb || it.src; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; b.append(im);
      b.addEventListener('click', () => { if (k === state.i) return; const d = k > state.i ? 1 : -1; state.i = k; render(d); });
      return b;
    }));
    bodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    root.classList.add('is-open');
    render(0);
    root.querySelector('.mpv-close').focus({ preventScroll: true });
    showHint();
  };
  const close = () => {
    if (!root || !root.classList.contains('is-open')) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    root.classList.remove('is-open', 'is-zoomed', 'show-hint'); document.body.style.overflow = bodyOverflow;
    state.token++;
    setTimeout(() => { if (!root.classList.contains('is-open')) { els.img.removeAttribute('src'); els.thumbs.replaceChildren(); } }, 320);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  };
  window.MPViewer = { open, close };
})();
