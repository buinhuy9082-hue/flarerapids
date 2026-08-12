/* ============================================
   FlareRapids - Main JavaScript
   Animations, Scroll Effects, Interactions
   ============================================ */

(function () {
  'use strict';

  // ============ SCROLL PROGRESS BAR ============
  const initScrollProgress = () => {
    const glow = document.createElement('div');
    glow.className = 'scroll-glow';
    document.body.appendChild(glow);

    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) : 0;
      glow.style.transform = `scaleX(${pct})`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  // ============ NAV SCROLL STATE ============
  const initNav = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const update = () => {
      if (window.scrollY > 40) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    // Mobile menu toggle
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('nav__links--open');
        toggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          links.classList.remove('nav__links--open');
          document.body.style.overflow = '';
        });
      });
    }
  };

  // ============ REVEAL ON SCROLL ============
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => io.observe(el));
  };

  // ============ STAT COUNTER ============
  const initCounters = () => {
    const stats = document.querySelectorAll('[data-counter]');
    if (!stats.length) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const format = (val, fmt) => {
      if (fmt === 'comma') return Math.floor(val).toLocaleString('en-US');
      if (fmt === 'decimal1') return val.toFixed(1);
      return Math.floor(val).toString();
    };

    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const duration = parseInt(el.dataset.duration || '1800', 10);
      const fmt = el.dataset.format || '';
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const val = target * easeOutCubic(t);
        el.textContent = format(val, fmt);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = fmt === 'comma' ? target.toLocaleString('en-US') : (fmt === 'decimal1' ? target.toFixed(1) : Math.floor(target).toString());
      };

      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      stats.forEach(animate);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((s) => io.observe(s));
  };

  // ============ PARALLAX (mouse) ============
  const initParallax = () => {
    if (matchMedia('(max-width: 880px)').matches) return;

    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.parallax) || 0.1;
        layer.style.transform = `translate3d(${x * depth * 20}px, ${y * depth * 20}px, 0)`;
      });

      const glow = document.querySelector('.cursor-glow');
      if (glow) {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
  };

  // ============ TILT EFFECT ============
  const initTilt = () => {
    if (matchMedia('(max-width: 880px)').matches) return;

    const els = document.querySelectorAll('[data-tilt]');
    if (!els.length) return;

    els.forEach((el) => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
      });
    });
  };

  // ============ SMOOTH ANCHOR SCROLL ============
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  // ============ CONTACT FORM ============
  const initForm = () => {
    const form = document.querySelector('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const success = form.querySelector('.form__success');
      const originalText = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'SENDING…';

      // Simulate submission (static site - mailto: fallback in real)
      setTimeout(() => {
        // Open default mail client with prefilled data
        const data = new FormData(form);
        const subject = encodeURIComponent(`[FlareRapids] ${data.get('subject') || 'Inquiry'}`);
        const body = encodeURIComponent(
          `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company') || '-'}\n\n${data.get('message')}`
        );
        window.location.href = `mailto:buinhuy9082@icloud.com?subject=${subject}&body=${body}`;

        btn.textContent = 'SENT ✓';
        if (success) success.classList.add('show');
        form.reset();
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = originalText;
        }, 3000);
      }, 800);
    });
  };

  // ============ CURSOR GLOW ============
  const initCursorGlow = () => {
    if (matchMedia('(max-width: 880px)').matches) return;
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
  };

  // ============ VIDEO-LIKE HERO SCROLL EFFECT ============
  const initHeroParallax = () => {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero__bg');
    if (!hero || !heroBg) return;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const offset = rect.top;
      if (offset < window.innerHeight && offset > -rect.height) {
        const progress = 1 - (offset + rect.height) / (rect.height + window.innerHeight);
        heroBg.style.transform = `scale(${1 + progress * 0.1}) translateY(${progress * 50}px)`;
        heroBg.style.opacity = 0.55 - progress * 0.25;
      }
    };

    window.addEventListener('scroll', update, { passive: true });
  };

  // ============ MARQUEE DUPLICATION ============
  const initMarquee = () => {
    document.querySelectorAll('.marquee__track').forEach((track) => {
      const clone = track.innerHTML;
      track.innerHTML = clone + clone;
    });
  };

  // ============ FAQ ACCORDION (Enhance <details>) ============
  const initFaq = () => {
    const items = document.querySelectorAll('.faq__item');
    items.forEach((item) => {
      const summary = item.querySelector('.faq__q');
      if (!summary) return;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.hasAttribute('open');
        // close others
        items.forEach((other) => {
          if (other !== item) other.removeAttribute('open');
        });
        if (isOpen) item.removeAttribute('open');
        else item.setAttribute('open', '');
      });
    });
  };

  // ============ MAGNETIC HOVER for buttons ============
  const initMagnetic = () => {
    if (matchMedia('(max-width: 880px)').matches) return;
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  };

  // ============ ANIMATE ON HOVER (image cards) ============
  const initImageFloat = () => {
    const imgs = document.querySelectorAll('[data-float]');
    imgs.forEach((img) => {
      const speed = parseFloat(img.dataset.float) || 12;
      const onMove = (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * speed;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * speed;
        img.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      };
      const onLeave = () => { img.style.transform = ''; };
      const parent = img.closest('[data-float-wrap]') || img.parentElement;
      parent.addEventListener('mousemove', onMove);
      parent.addEventListener('mouseleave', onLeave);
    });
  };

  // ============ INIT ============
  const init = () => {
    initScrollProgress();
    initCursorGlow();
    initNav();
    initReveal();
    initCounters();
    initParallax();
    initTilt();
    initSmoothScroll();
    initForm();
    initHeroParallax();
    initMarquee();
    initFaq();
    initMagnetic();
    initImageFloat();

    // Mark body as ready
    document.body.classList.add('js-ready');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
