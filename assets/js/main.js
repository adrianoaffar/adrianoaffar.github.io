(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');

  function applyIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
  }
  applyIcon(root.getAttribute('data-theme') || 'light');

  themeToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyIcon(next);
  });

  /* Mobile nav */
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
  });
  document.querySelectorAll('.nav-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
    });
  });

  /* Active nav link on scroll */
  var navLinks = document.querySelectorAll('.nav-menu a');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section, #hero'));

  function onScroll() {
    var pos = window.scrollY + 160;
    sections.forEach(function (sec) {
      var top = sec.offsetTop, bottom = top + sec.offsetHeight;
      var id = '#' + sec.id;
      if (pos >= top && pos < bottom) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        var match = document.querySelector('.nav-menu a[href="' + id + '"]');
        if (match) match.classList.add('active');
      }
    });

    var backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) backToTop.classList.add('active');
    else backToTop.classList.remove('active');
  }
  window.addEventListener('scroll', onScroll);
  window.addEventListener('load', onScroll);

  /* Reveal on scroll + skill meters */
  var revealEls = document.querySelectorAll('[data-reveal]');
  var meterFills = document.querySelectorAll('.meter-fill');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { io.observe(el); });

  var meterIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var lvl = entry.target.getAttribute('data-level') || 0;
        entry.target.style.width = lvl + '%';
        meterIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  meterFills.forEach(function (el) { meterIo.observe(el); });

  /* Role ticker in hero */
  var roles = ['Web Developer', 'Live Video Mixer (VMix / OBS)', 'Multimedia Producer', 'Graphic Designer', 'Videographer'];
  var roleEl = document.getElementById('roleStrip');
  var ri = 0;
  if (roleEl) {
    setInterval(function () {
      ri = (ri + 1) % roles.length;
      roleEl.style.opacity = 0;
      setTimeout(function () {
        roleEl.textContent = roles[ri];
        roleEl.style.opacity = 1;
      }, 250);
    }, 2600);
    roleEl.style.transition = 'opacity .25s ease';
  }

})();
