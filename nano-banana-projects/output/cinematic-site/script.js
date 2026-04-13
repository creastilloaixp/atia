/* ============================================
   CF Seguros — Cinematic Site Scripts
   Scroll-driven hero + Cinematic modules
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const TOTAL_FRAMES = 61;
  const HERO_SECTION_HEIGHT = 500; // vh — must match CSS

  // ============================================
  // SCROLL-DRIVEN VIDEO FRAME PLAYER (Module 01)
  // ============================================
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const heroSection = document.getElementById('hero');
  const scrollHint = document.getElementById('scrollHint');

  const frames = [];
  let loadedCount = 0;
  let currentFrame = -1;
  let isReady = false;

  function preloadFrames() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `frames/frame-${String(i).padStart(4, '0')}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          drawFrame(0);
        }
        if (loadedCount === TOTAL_FRAMES) {
          isReady = true;
        }
      };
      frames.push(img);
    }
  }

  function drawFrame(index) {
    if (index === currentFrame) return;
    if (!frames[index] || !frames[index].complete) return;
    currentFrame = index;
    ctx.drawImage(frames[index], 0, 0, canvas.width, canvas.height);
  }

  // ============================================
  // NAVIGATION (Module 11)
  // ============================================
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const sections = document.querySelectorAll('.section, .hero');
  const progress = document.getElementById('scrollProgress');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  window.closeMobile = function () {
    mobileMenu.classList.remove('open');
  };

  // ============================================
  // MASTER SCROLL HANDLER
  // ============================================
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const heroBottom = heroSection.offsetHeight;

    // --- Scroll-driven frame animation ---
    if (isReady && scrollY < heroBottom) {
      const heroFraction = Math.min(scrollY / (heroBottom - window.innerHeight), 1);
      const frameIndex = Math.min(Math.floor(heroFraction * TOTAL_FRAMES), TOTAL_FRAMES - 1);
      drawFrame(frameIndex);
    }

    // --- Hide hero overlay + canvas when past hero ---
    const heroOverlay = document.querySelector('.hero-overlay');
    if (scrollY > heroBottom - window.innerHeight * 0.5) {
      canvas.style.opacity = '0';
      heroOverlay.style.opacity = '0';
      if (scrollHint) scrollHint.style.opacity = '0';
    } else {
      canvas.style.opacity = '1';
      heroOverlay.style.opacity = '1';
      if (scrollHint) scrollHint.style.opacity = scrollY > 100 ? '0' : '1';
    }

    // --- Nav morph ---
    nav.classList.toggle('scrolled', scrollY > 80);

    // --- Progress bar ---
    progress.style.width = ((scrollY / maxScroll) * 100) + '%';

    // --- Active nav section ---
    let current = 'hero';
    sections.forEach(section => {
      const top = section.offsetTop - 300;
      if (scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ============================================
  // REVEAL ANIMATIONS (Module 04)
  // ============================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });

  // ============================================
  // KINETIC TEXT (Module 03)
  // ============================================
  document.querySelectorAll('[data-kinetic="chars"]').forEach(el => {
    const text = el.textContent.trim();
    const accentWords = (el.dataset.accentWords || '').split(',').map(w => w.trim().toLowerCase());
    el.innerHTML = '';

    text.split(' ').forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      word.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        if (accentWords.includes(word.toLowerCase())) charSpan.classList.add('accent');
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });
      el.appendChild(wordSpan);
    });
  });

  const kineticObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const chars = el.querySelectorAll('.char');
      chars.forEach((c, i) => {
        setTimeout(() => c.classList.add('revealed'), i * 35);
      });
      kineticObserver.unobserve(el);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-kinetic]').forEach(el => kineticObserver.observe(el));

  // ============================================
  // COUNTER ANIMATION (Module 03)
  // ============================================
  function animateCounter(el) {
    const target = parseInt(el.dataset.countTo) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 2500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count-to]').forEach(el => counterObserver.observe(el));

  // ============================================
  // SVG DRAW (Module 09)
  // ============================================
  document.querySelectorAll('.svg-draw').forEach(svg => {
    svg.querySelectorAll('path').forEach(p => {
      try {
        const length = p.getTotalLength();
        p.style.setProperty('--path-length', Math.ceil(length));
      } catch (e) { /* ignore */ }
    });
  });

  const drawObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('drawn');
      drawObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-draw]').forEach(el => drawObserver.observe(el));

  // ============================================
  // INIT
  // ============================================
  preloadFrames();

  // Trigger hero reveals on load
  setTimeout(() => {
    document.querySelectorAll('.hero [data-reveal]').forEach(el => {
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay + 300);
    });
  }, 500);

})();
