'use strict';

(() => {
  const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const slugify = (value = '') => normalize(value).replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const track = (name, params = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  };

  const brandCases = {
    'highway-menswear': {
      brand: 'Highway Menswear', role: 'Media Executive', period: '10/2025 – 05/2026', result: '+20% tương tác tự nhiên',
      challenge: 'Duy trì nhịp nội dung hằng ngày, hỗ trợ các bộ sưu tập mới và giữ hình ảnh thời trang nam nhất quán trên nhiều điểm chạm.',
      approach: 'Lập lịch nội dung, phát triển góc kể chuyện theo mùa, phối hợp quay chụp và theo dõi phản hồi để điều chỉnh định dạng.',
      page: './case-studies/highway-menswear.html'
    },
    'beat-vn': {
      brand: 'BeatVN', role: 'Content Creator', period: '06/2025 – 09/2025', result: '5.000 tương tác/bài',
      challenge: 'Tạo nội dung cộng đồng có tốc độ nhanh, bắt đúng mối quan tâm và vẫn đủ rõ ràng để khuyến khích thảo luận.',
      approach: 'Theo dõi xu hướng, chọn góc tiếp cận gần gũi, tối ưu tiêu đề và cấu trúc bài dựa trên phản hồi thực tế.',
      page: './case-studies/beatvn.html'
    },
    'p-global': {
      brand: 'P Global', role: 'Content Marketing', period: '11/2024 – 08/2025', result: '30–50M doanh thu/tháng',
      challenge: 'Chuyển thông tin sản phẩm thành nội dung dễ hiểu và tạo động lực mua hàng trong môi trường social commerce.',
      approach: 'Xây dựng kịch bản, sản xuất video, tái sử dụng media và kết nối lợi ích sản phẩm với tình huống sử dụng cụ thể.',
      page: './case-studies/p-global.html'
    },
    'minclue-fitness': {
      brand: 'Minclue Fitness', role: 'Content & Social', period: 'Dự án thực chiến', result: 'Nội dung đa định dạng',
      challenge: 'Tạo hệ thống nội dung đều đặn cho một thương hiệu fitness với nhiều định dạng từ bài đăng đến story và ưu đãi.',
      approach: 'Chuẩn hóa bố cục, nhóm chủ đề theo mục tiêu và triển khai các định dạng có thể tái sử dụng theo tuần/tháng.',
      page: './case-studies/minclue-fitness.html'
    }
  };

  const modal = document.createElement('div');
  modal.className = 'case-study-modal';
  modal.hidden = true;
  modal.innerHTML = '<section class="case-study-dialog" role="dialog" aria-modal="true" aria-labelledby="case-study-title"><button class="case-study-close" type="button" aria-label="Đóng case study">✕</button><p class="case-study-kicker"></p><h2 id="case-study-title"></h2><p class="case-study-challenge"></p><div class="case-study-grid"><div><strong>Vai trò</strong><span data-case-role></span></div><div><strong>Thời gian</strong><span data-case-period></span></div><div><strong>Kết quả</strong><span data-case-result></span></div></div><p class="case-study-approach"></p><div class="case-study-actions"><a class="hero-btn hero-btn-primary" data-case-page>Đọc case study đầy đủ</a><button class="hero-btn hero-btn-secondary" type="button" data-jump-contact>Trao đổi dự án</button></div></section>';
  document.body.appendChild(modal);

  let lastFocus;
  const closeCase = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (location.hash.startsWith('#case-study=')) history.replaceState(null, '', '#portfolio');
    lastFocus?.focus();
  };
  const openCase = (anchor, updateUrl = true) => {
    const item = anchor.closest('.project-item');
    const category = item?.dataset.category || 'highway-menswear';
    const data = brandCases[category] || brandCases['highway-menswear'];
    const title = item?.querySelector('.project-title')?.textContent.trim() || data.brand;
    lastFocus = anchor;
    modal.querySelector('.case-study-kicker').textContent = `${data.brand} · ${category.replace('-', ' ')}`;
    modal.querySelector('h2').textContent = title;
    modal.querySelector('.case-study-challenge').textContent = `Bài toán: ${data.challenge}`;
    modal.querySelector('[data-case-role]').textContent = data.role;
    modal.querySelector('[data-case-period]').textContent = data.period;
    modal.querySelector('[data-case-result]').textContent = data.result;
    modal.querySelector('.case-study-approach').textContent = `Cách triển khai: ${data.approach}`;
    modal.querySelector('[data-case-page]').href = data.page;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.case-study-close').focus();
    if (updateUrl) history.replaceState(null, '', `#case-study=${anchor.dataset.caseStudy}`);
    track('view_case_study', { project_name: title, brand: data.brand });
  };

  const projectAnchors = [...document.querySelectorAll('.project-item > a')];
  projectAnchors.forEach((anchor, index) => {
    const item = anchor.closest('.project-item');
    const title = item.querySelector('.project-title')?.textContent.trim() || `project-${index + 1}`;
    anchor.dataset.caseStudy = `${item.dataset.category}-${slugify(title)}`;
    anchor.setAttribute('aria-label', `Xem case study: ${title}`);
    anchor.addEventListener('click', (event) => { event.preventDefault(); openCase(anchor); });
  });
  modal.querySelector('.case-study-close').addEventListener('click', closeCase);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeCase(); });
  modal.querySelector('[data-jump-contact]').addEventListener('click', () => {
    closeCase();
    document.querySelector('[data-nav-link="contact"]')?.click();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeCase(); });

  const transcripts = [
    'Video tình huống về một người chồng thúc giục vợ mua hàng để không bỏ lỡ ưu đãi.',
    'Video quảng cáo sữa tắm nước hoa Fanmen với nhân vật nam áo trắng.',
    'Video tình huống quảng cáo Fanmen với nhân vật nam trong vai shipper.',
    'Video tình huống ngắn giới thiệu sản phẩm Fanmen.',
    'Video TikTok gắn sản phẩm, dựng lại từ kho media và hỗ trợ bởi công cụ AI.'
  ];
  document.querySelectorAll('[data-video-src]').forEach((link, index) => {
    const details = document.createElement('details');
    details.className = 'video-transcript';
    details.innerHTML = `<summary>Đọc mô tả video</summary><p>${transcripts[index] || 'Video dự án do Nguyễn Việt Long tham gia sản xuất.'}</p>`;
    link.closest('.blog-post-item')?.appendChild(details);
    link.addEventListener('click', () => track('play_portfolio_video', { video_index: index + 1 }));
  });

  document.querySelectorAll('a[download]').forEach((link) => link.addEventListener('click', () => track('download_cv', { file_name: link.getAttribute('download') })));
  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"], a[href*="zalo.me"]').forEach((link) => link.addEventListener('click', () => track('contact_click', { destination: link.getAttribute('href') })));

  document.querySelector('#brief-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`[Portfolio] ${data.get('project')} — ${data.get('name')}`);
    const body = encodeURIComponent(`Họ tên: ${data.get('name')}\nEmail: ${data.get('email')}\nLoại dự án: ${data.get('project')}\n\nMô tả:\n${data.get('message')}`);
    track('generate_project_email', { project_type: data.get('project') });
    location.href = `mailto:ngvietlong712002@gmail.com?subject=${subject}&body=${body}`;
  });

  const hashSlug = location.hash.match(/^#case-study=(.+)$/)?.[1];
  if (hashSlug) {
    const target = projectAnchors.find((anchor) => anchor.dataset.caseStudy === hashSlug);
    if (target) openCase(target, false);
  }
})();
