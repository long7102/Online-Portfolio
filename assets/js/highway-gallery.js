/* Highway Menswear case study: group cards that open the immersive viewer. */
(() => {
  'use strict';
  const groups = window.highwayGalleryGroups;
  const wrap = document.getElementById('gallery-groups');
  if (!Array.isArray(groups) || !wrap) return;

  groups.forEach((g, gi) => {
    const noun = g.id === 'cover-story' ? 'ảnh bìa' : 'ảnh';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'gallery-group';
    btn.setAttribute('aria-label', `Mở ${g.title}, ${g.images.length} ${noun}`);
    const img = document.createElement('img');
    img.src = g.cover; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    const copy = document.createElement('span'); copy.className = 'gallery-group-copy';
    const num = document.createElement('span'); num.className = 'gallery-group-number';
    const a = document.createElement('span'); a.textContent = `Bộ ${String(gi + 1).padStart(2, '0')}`;
    const b = document.createElement('span'); b.textContent = `${g.images.length} ${noun}`;
    num.append(a, b);
    const title = document.createElement('strong'); title.className = 'gallery-group-title'; title.textContent = g.title;
    const desc = document.createElement('span'); desc.className = 'gallery-group-description'; desc.textContent = g.description;
    copy.append(num, title, desc);
    btn.append(img, copy);
    btn.addEventListener('click', () => {
      if (!window.MPViewer) return;
      window.MPViewer.open({
        kicker: 'Highway Menswear / Project archive',
        title: g.title,
        index: 0,
        images: g.images.map((src, i) => ({ src, label: `Ảnh ${i + 1}/${g.images.length}`, caption: g.description, alt: `Highway Menswear · ${g.title} · ảnh ${i + 1} trên ${g.images.length}` })),
      });
    });
    wrap.append(btn);
  });
})();
