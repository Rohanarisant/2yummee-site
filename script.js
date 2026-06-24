// 2yummee — interactions

const GALLERY_MAX = 40; // limite haute de sécurité — mets-en moins, ça s'adapte tout seul

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.classList.toggle('is-active', isOpen);
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Galerie : génération + lightbox ----------
     Essaie de charger gallery-01.jpg, gallery-02.jpg, etc.
     Dès qu'une image n'existe pas, on s'arrête là — donc tu peux
     mettre autant de photos que tu veux (5, 12, 26...), tant
     qu'elles sont numérotées sans trou à partir de gallery-01.jpg. */
  const grid = document.getElementById('gallery-grid');
  const galleryImages = [];

  function buildLightboxFromGrid() {
    galleryImages.length = 0;
    grid.querySelectorAll('img').forEach((img, i) => {
      galleryImages.push(img.getAttribute('src'));
      img.dataset.index = i;
    });
  }

  if (grid) {
    let loaded = 0;
    let stopped = false;

    function tryNext(i) {
      if (stopped || i > GALLERY_MAX) {
        buildLightboxFromGrid();
        return;
      }
      const num = String(i).padStart(2, '0');
      const src = `images/gallery-${num}.jpg`;
      const probe = new Image();
      probe.onload = () => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal';
        item.innerHTML = `<img src="${src}" alt="Photo 2yummee ${num}" loading="lazy">`;
        grid.appendChild(item);
        loaded++;
        tryNext(i + 1);
      };
      probe.onerror = () => {
        stopped = true;
        buildLightboxFromGrid();
        attachRevealToNewItems();
      };
      probe.src = src;
    }

    tryNext(1);
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = galleryImages[currentIndex];
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showRelative(delta) {
    currentIndex = (currentIndex + delta + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex];
  }

  if (grid && lightbox) {
    grid.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-index]');
      if (!img) return;
      openLightbox(parseInt(img.dataset.index, 10));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => showRelative(-1));
    lightboxNext.addEventListener('click', () => showRelative(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showRelative(-1);
      if (e.key === 'ArrowRight') showRelative(1);
    });
  }

  /* ---------- Apparition douce au scroll ---------- */
  function attachRevealToNewItems() {
    const targets = document.querySelectorAll('.reveal:not(.is-visible)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      targets.forEach(el => observer.observe(el));
    } else {
      targets.forEach(el => el.classList.add('is-visible'));
    }
  }

  const staticRevealTargets = document.querySelectorAll(
    '.section-head, .concept-list li, .service-card, .histoire-media, .histoire-content, .contact-grid'
  );
  staticRevealTargets.forEach(el => el.classList.add('reveal'));
  attachRevealToNewItems();

});

