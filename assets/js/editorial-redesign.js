(() => {
  'use strict';
  const rolesToggle = document.querySelector('.sidebar-roles-toggle');
  rolesToggle?.addEventListener('click', () => {
    const expanded = document.querySelector('.sidebar').classList.toggle('roles-expanded');
    rolesToggle.setAttribute('aria-expanded', String(expanded));
    rolesToggle.textContent = expanded ? 'Thu gọn vai trò' : '+8 vai trò khác';
  });
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.impact-grid, .featured-case-banner, .project-library-heading');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

  targets.forEach(target => {
    target.classList.add('motion-reveal');
    observer.observe(target);
  });
})();
