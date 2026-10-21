/* Progressive editorial case-story overlay. Does not replace existing image viewer. */
(() => {
  'use strict';
  const portfolio = document.querySelector('article[data-page="portfolio"]');
  if (!portfolio) return;
  const cards = portfolio.querySelectorAll('.project-item[data-filter-item]');
  if (!cards.length) return;
  const dialog = document.createElement('section');
  dialog.className='premium-story';
  dialog.hidden=true;
  dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','premium-story-title');
  dialog.innerHTML='<div class="premium-story__panel" tabindex="-1"><button class="premium-story__close" type="button" aria-label="Đóng chi tiết dự án">×</button><p class="premium-story__eyebrow">Project overview</p><h2 id="premium-story-title"></h2><dl><div><dt>Thương hiệu / dự án</dt><dd data-premium-brand></dd></div><div><dt>Nội dung thể hiện</dt><dd data-premium-context></dd></div><div><dt>Đánh giá kết quả</dt><dd>Chưa công bố dữ liệu đo lường đã kiểm chứng cho hạng mục này. Xem hình ảnh gốc trong portfolio để đánh giá sản phẩm.</dd></div></dl></div>';
  document.body.appendChild(dialog);
  const panel=dialog.querySelector('.premium-story__panel');
  let lastFocus=null;
  const close=()=>{
    dialog.hidden=true;
    document.body.style.removeProperty('overflow');
    lastFocus?.focus();
  };
  dialog.querySelector('.premium-story__close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close()}
    if(event.key==='Tab'){
      const closeBtn=dialog.querySelector('.premium-story__close');
      if(document.activeElement===closeBtn){event.preventDefault();closeBtn.focus()}
    }
  });
  cards.forEach(card=>{
    const title=card.querySelector('.project-title')?.textContent.trim();
    if(!title)return;
    const trigger=document.createElement('button');
    trigger.className='project-story-trigger';
    trigger.type='button';
    trigger.textContent='Tổng quan dự án ↗';
    trigger.addEventListener('click',()=>{
      lastFocus=trigger;
      dialog.querySelector('#premium-story-title').textContent=title;
      dialog.querySelector('[data-premium-brand]').textContent=card.querySelector('.project-category')?.textContent.trim()||card.dataset.category||'Dự án';
      dialog.querySelector('[data-premium-context]').textContent=card.querySelector('img')?.alt||title;
      dialog.hidden=false;
      document.body.style.overflow='hidden';
      panel.focus();
    });
    card.appendChild(trigger);
  });
})();
