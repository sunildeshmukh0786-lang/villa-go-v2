(() => {
  'use strict';

  const body = document.body;
  if (!body) return;

  const isLegacy = Boolean(document.getElementById('header-container'));
  body.classList.add(isLegacy ? 'vg-legacy' : 'vg-modern');
  document.documentElement.classList.add('villago-ready');

  // Page identity for targeted responsive styling.
  if (!body.dataset.villagoPage) {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const inDetail = location.pathname.toLowerCase().includes('/villa-detail/');
    body.dataset.villagoPage = inDetail ? 'villa-detail' : file.replace('.html', '') || 'index';
  }

  // Scroll progress.
  const progress = document.createElement('div');
  progress.id = 'villago-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // Premium ambient pointer glow on fine-pointer devices.
  if (matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    const glow = document.createElement('div');
    glow.id = 'villago-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let tx = innerWidth * .5, ty = innerHeight * .35, x = tx, y = ty;
    addEventListener('pointermove', (event) => { tx = event.clientX; ty = event.clientY; }, { passive: true });
    const follow = () => {
      x += (tx - x) * .09;
      y += (ty - y) * .09;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  // Header depth on scroll.
  const header = isLegacy ? document.getElementById('header-container') : document.querySelector('body > nav');
  const updateHeader = () => header?.classList.toggle('vg-scrolled', scrollY > 24);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Reveal sections and cards progressively.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const candidates = [...document.querySelectorAll(
    'main > div, section > div.max-w-7xl, section > div.max-w-6xl, #villaGrid > a, .villa-full-description, .boxed-widget, .review-card, .property-titlebar'
  )].filter((node, index, nodes) => nodes.indexOf(node) === index);

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vg-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    candidates.forEach((node) => {
      node.classList.add('vg-reveal');
      observer.observe(node);
    });
  } else {
    candidates.forEach((node) => node.classList.add('vg-visible'));
  }

  // Dynamic homepage hero using images already bundled in the repository.
  if (body.dataset.villagoPage === 'index' && !reduceMotion) {
    const hero = document.querySelector('.hero-bg-fixed');
    if (hero) {
      const base = body.dataset.villagoBase || '';
      const images = [
        `${base}public/villa/698ef60bcaa6f.jpg`,
        `${base}public/villa/698ef60bc9d5e.jpg`,
        `${base}public/villa/698e3b6a8029a.webp`
      ];
      let index = 0;
      images.slice(1).forEach((src) => { const img = new Image(); img.src = src; });
      window.setInterval(() => {
        index = (index + 1) % images.length;
        hero.classList.add('vg-hero-shift');
        window.setTimeout(() => {
          hero.style.backgroundImage = `url('${images[index]}')`;
          hero.classList.remove('vg-hero-shift');
        }, 450);
      }, 6500);
    }
  }

  // Improve asset loading without changing content/data.
  const images = [...document.images];
  images.forEach((img, index) => {
    img.decoding = 'async';
    if (index > 4 && !img.closest('.property-slider.default')) img.loading = 'lazy';
  });

  // Safer external links.
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener'); rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });

  // Shared mobile navigation is only bound to explicitly marked controls.
  document.querySelectorAll('[data-villago-menu-btn]').forEach((button) => {
    const nav = button.closest('nav');
    const menu = nav?.querySelector('[data-villago-menu]');
    if (!menu) return;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const opening = menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      button.setAttribute('aria-expanded', String(opening));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
    }));
  });

})();
