(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Theme ---------- */
  function initTheme() {
    const button = $('#themeToggle');
    const icon = $('#themeIcon');
    const meta = $('meta[name="theme-color"]');
    const barColor = { dark: '#0A0B0D', light: '#ECEAE3' };

    if (!button) return;

    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      if (icon) icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      if (meta) meta.content = barColor[theme];
    };

    apply(root.dataset.theme === 'light' ? 'light' : 'dark');

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  function initNav() {
    const toggle = $('#navToggle');
    const closeBtn = $('#navClose');
    const nav = $('#nav');
    const icon = toggle ? $('i', toggle) : null;

    const setOpen = (open) => {
      document.body.classList.toggle('nav-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
      if (icon) icon.className = open ? 'bx bx-x' : 'bx bx-menu';
    };

    if (toggle) toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
    if (nav) nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 1000px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Scroll: progress bar, header, back-to-top ---------- */
  function initScroll() {
    const header = $('#header');
    const toTop = $('#toTop');
    let queued = false;

    const update = () => {
      const max = root.scrollHeight - innerHeight;
      if (header) header.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
      if (toTop) toTop.classList.toggle('is-visible', scrollY > 600);
      queued = false;
    };

    addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ---------- Scroll spy ---------- */
  function initScrollSpy() {
    const links = $$('.nav__link');
    if (!links.length) return;
    const byId = new Map(links.map((link) => [link.hash.slice(1), link]));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        });
        const active = byId.get(entry.target.id);
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Reveal on scroll (staggered) ---------- */
  function initReveal() {
    $$('[data-stagger]').forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.setAttribute('data-reveal', '');
        child.style.setProperty('--i', i);
      });
    });

    const items = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Skills Fader Animation (Fixed) ---------- */
  function initFaders() {
    const faders = $$('.fader');
    if (!faders.length) return;

    const animateFader = (el) => {
      const target = el.style.getPropertyValue('--target') || '0%';
      el.style.setProperty('--lvl', target);
      el.classList.add('is-in');
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      faders.forEach((el) => animateFader(el));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateFader(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    faders.forEach((el) => observer.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  function initCounters() {
    const counters = $$('[data-count]');

    const render = (el, value) => {
      el.textContent = value.toFixed(Number(el.dataset.decimals) || 0) + (el.dataset.suffix || '');
    };

    const run = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 1200;
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        render(el, target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (reduceMotion) return;

    counters.forEach((el) => render(el, 0));
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
  }

  /* ---------- Hero: role switcher bus ---------- */
  function initRoleBus() {
    const buttons = $$('.bus__btn');
    const label = $('#busLabel');
    if (!buttons.length || !label) return;

    let index = 0;
    let timer;

    const select = (i) => {
      index = i;
      buttons.forEach((btn, n) => btn.setAttribute('aria-pressed', String(n === i)));
      label.classList.add('is-swapping');
      setTimeout(() => {
        label.textContent = buttons[i].dataset.role;
        label.classList.remove('is-swapping');
      }, 160);
    };

    buttons.forEach((btn, i) => btn.addEventListener('click', () => {
      clearInterval(timer);
      select(i);
    }));

    if (!reduceMotion) {
      timer = setInterval(() => select((index + 1) % buttons.length), 2800);
    }
  }

  /* ---------- Hero: live monitor ---------- */
  function initMonitor() {
    const monitor = $('#monitor');
    if (!monitor) return;

    const timecode = $('#timecode');
    const bars = $$('.vu i', monitor);
    let visible = true;

    if (reduceMotion) {
      bars.forEach((bar) => bar.style.setProperty('--h', '55%'));
      return;
    }

    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(monitor);

    const pad = (n) => String(n).padStart(2, '0');
    const t0 = performance.now();
    setInterval(() => {
      if (!visible || document.hidden) return;
      const ms = performance.now() - t0;
      const frames = Math.floor(ms / 40) % 25;
      const secs = Math.floor(ms / 1000) % 60;
      const mins = Math.floor(ms / 60000) % 60;
      const hours = Math.floor(ms / 3600000);
      if (timecode) timecode.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
    }, 40);

    const levels = bars.map(() => 0.4);
    setInterval(() => {
      if (!visible || document.hidden) return;
      bars.forEach((bar, i) => {
        const target = 0.25 + Math.random() * 0.65;
        levels[i] += (target - levels[i]) * 0.55;
        bar.style.setProperty('--h', `${Math.round(levels[i] * 100)}%`);
      });
    }, 110);

    if (finePointer) {
      monitor.addEventListener('pointermove', (e) => {
        const rect = monitor.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        monitor.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
        monitor.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      });
      monitor.addEventListener('pointerleave', () => {
        monitor.style.removeProperty('--rx');
        monitor.style.removeProperty('--ry');
      });
    }
  }

  /* ---------- Experience filter ---------- */
  function initFilter() {
    const buttons = $$('[data-filter]');
    const items = $$('#expList > .exp');
    const count = $('#expCount');

    buttons.forEach((button) => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let shown = 0;

      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      items.forEach((item) => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (count) count.textContent = `${shown} / ${items.length}`;
    }));
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    const track = $('#marqueeTrack');
    if (track && track.firstElementChild) track.appendChild(track.firstElementChild.cloneNode(true));
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* Inisialisasi Semua Fungsi */
  [initTheme, initNav, initScroll, initScrollSpy, initReveal, initFaders, initCounters,
   initRoleBus, initMonitor, initFilter, initMarquee, initYear].forEach((init) => init());

})();