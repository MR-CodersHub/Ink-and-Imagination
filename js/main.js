/**
 * Ink & Imagination — Shared Studio Script
 * HTML/CSS/Vanilla JS only. Handles: theme, RTL, nav, reveal, counters,
 * FAQ, forms w/ validation + toast, lightbox, back-to-top, countdown, auth demo.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Toast ---------- */
  function ensureToastWrap() {
    var wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    return wrap;
  }
  window.showToast = function (message, type) {
    type = type || 'info';
    var wrap = ensureToastWrap();
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role', 'status');
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 350);
    }, 3400);
  };

  /* ---------- Theme (dark/light) with LocalStorage ---------- */
  var THEME_KEY = 'ii-theme';
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, [data-theme-icon]').forEach(function (b) {
      b.textContent = t === 'dark' ? '☀️' : '🌙';
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved !== 'dark' && saved !== 'light') {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(saved);
  }
  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    window.showToast(next === 'dark' ? 'Dark mode on — evening studio glow.' : 'Light mode on — warm paper glow.', 'info');
  }

  /* ---------- RTL / LTR with LocalStorage ---------- */
  var DIR_KEY = 'ii-dir';
  function applyDir(d) {
    root.setAttribute('dir', d);
    try { localStorage.setItem(DIR_KEY, d); } catch (e) {}
    document.querySelectorAll('#dir-toggle, #dir-toggle-mobile, [data-dir-icon]').forEach(function (b) {
      b.textContent = d === 'rtl' ? 'LTR' : 'RTL';
      b.setAttribute('aria-label', 'Switch layout direction (current: ' + d.toUpperCase() + ')');
    });
  }
  function initDir() {
    var saved = 'ltr';
    try { saved = localStorage.getItem(DIR_KEY) || 'ltr'; } catch (e) {}
    applyDir(saved === 'rtl' ? 'rtl' : 'ltr');
  }
  function toggleDir() {
    var next = (root.getAttribute('dir') || 'ltr') === 'ltr' ? 'rtl' : 'ltr';
    applyDir(next);
    window.showToast('Layout switched to ' + next.toUpperCase() + '.', 'info');
  }

  /* ---------- Sticky navbar shadow ---------- */
  function initNavbar() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var btn = document.getElementById('hamburger-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    function setOpen(open) {
      menu.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Announcement bar ---------- */
  function initAnnounce() {
    document.querySelectorAll('.announcement-close, .announce-close').forEach(function (b) {
      b.addEventListener('click', function () {
        var bar = b.closest('.announcement-bar, .announce');
        if (bar) bar.remove();
      });
    });
  }

  /* ---------- Active nav ---------- */
  function initActiveNav() {
    var path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (href === path) link.classList.add('active');
      link.removeAttribute('aria-current');
      if (href === path) link.setAttribute('aria-current', 'page');
    });
    document.querySelectorAll('.footer-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (href === path) link.classList.add('active');
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, [data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (el) { el.classList.add('visible', 'revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible', 'revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var raw = (el.getAttribute('data-count') || el.textContent || '').replace(/[^0-9]/g, '');
        var target = parseInt(raw, 10);
        if (isNaN(target)) return;
        var suffix = el.textContent.trim().match(/[%+]$/) ? el.textContent.trim().slice(-1) : '';
        var start = null, dur = 1200;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('en-IN') + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- FAQ accordion (keyboard accessible) ---------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q, .faq-question');
      var a = item.querySelector('.faq-a, .faq-answer');
      if (!q || !a) return;
      if (!q.hasAttribute('tabindex') && q.tagName !== 'BUTTON') q.setAttribute('tabindex', '0');
      q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      function toggle() {
        var open = item.classList.toggle('open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (a.style && (a.classList.contains('faq-a') || a.classList.contains('faq-answer'))) {
          a.style.maxHeight = open ? a.scrollHeight + 'px' : '';
        }
      }
      q.addEventListener('click', toggle);
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- Lightbox / image zoom ---------- */
  function initLightbox() {
    var lb = document.querySelector('.lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', 'Image preview');
      lb.innerHTML = '<button class="lightbox-close" aria-label="Close preview">×</button><img alt="Stationery preview enlarged">';
      document.body.appendChild(lb);
    }
    var img = lb.querySelector('img');
    var closeBtn = lb.querySelector('.lightbox-close');
    function open(src, alt) { img.src = src; img.alt = alt || 'Stationery preview'; lb.classList.add('open'); document.body.style.overflow = 'hidden'; if (closeBtn) closeBtn.focus(); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    document.querySelectorAll('[data-zoom], .zoomable').forEach(function (el) {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', function () {
        var src = el.getAttribute('data-zoom') || el.src;
        if (src) open(src, el.alt);
      });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var s = el.getAttribute('data-zoom') || el.src; if (s) open(s, el.alt); } });
      if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') el.setAttribute('tabindex', '0');
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === closeBtn) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    var btn = document.getElementById('to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'to-top';
      btn.className = 'to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.textContent = '↑';
      document.body.appendChild(btn);
    }
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Smooth anchor offset ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        var t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        var navH = 84;
        var y = t.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: y, behavior: 'smooth' });
        t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Form validation + toast ---------- */
  function setErr(field, msg) {
    field.classList.toggle('invalid', !!msg);
    var err = field.querySelector('.err');
    if (err) { err.textContent = msg || ''; err.style.display = msg ? 'block' : 'none'; }
  }
  function validateField(input) {
    var wrap = input.closest('.field') || input.parentElement;
    var val = (input.value || '').trim();
    if (input.hasAttribute('required') && !val) { setErr(wrap, 'This field is required.'); return false; }
    if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) { setErr(wrap, 'Please enter a valid email.'); return false; }
    if (input.type === 'tel' && val && !/^[+\d][\d\s-]{6,}$/.test(val)) { setErr(wrap, 'Please enter a valid phone.'); return false; }
    if (input.min && val && Number(val) < Number(input.min)) { setErr(wrap, 'Value is too small.'); return false; }
    setErr(wrap, '');
    return true;
  }
  function initForms() {
    document.querySelectorAll('form[data-validate], form[data-ajax="true"], #enquiry-form, #quote-form, #newsletter-form, #notify-form, #login-form, #register-form').forEach(function (form) {
      if (form.dataset.bound) return;
      form.dataset.bound = '1';
      form.setAttribute('novalidate', 'novalidate');
      form.querySelectorAll('input, select, textarea').forEach(function (inp) {
        inp.addEventListener('blur', function () { validateField(inp); });
        inp.addEventListener('input', function () {
          var wrap = inp.closest('.field') || inp.parentElement;
          if (wrap && wrap.classList.contains('invalid')) validateField(inp);
        });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
        var ok = inputs.map(validateField).every(Boolean);
        if (!ok) { window.showToast('Please fix the highlighted fields.', 'error'); return; }
        var btn = form.querySelector('button[type="submit"]');
        var original = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
        setTimeout(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = original; }
          var kind = form.id === 'login-form' ? 'Welcome back to the studio!' :
            form.id === 'register-form' ? 'Account created — no dashboard needed, we will email you.' :
            'Thank you! Your enquiry has been received. We reply within 24 hours.';
          window.showToast(kind, 'success');
          try {
            var data = {};
            inputs.forEach(function (i) { if (i.name) data[i.name] = i.value; });
            var key = 'ii-' + (form.id || 'form');
            localStorage.setItem(key, JSON.stringify({ at: new Date().toISOString(), data: data }));
          } catch (err) {}
          form.reset();
        }, 800);
      });
    });
  }

  /* ---------- Auth tabs (login/register on one page, no dashboard) ---------- */
  function initAuthTabs() {
    var tabLogin = document.getElementById('tab-login');
    var tabReg = document.getElementById('tab-register');
    var paneLogin = document.getElementById('pane-login');
    var paneReg = document.getElementById('pane-register');
    if (!tabLogin || !tabReg || !paneLogin || !paneReg) return;
    function show(which) {
      var login = which === 'login';
      paneLogin.hidden = !login;
      paneReg.hidden = login;
      tabLogin.classList.toggle('active', login);
      tabReg.classList.toggle('active', !login);
      tabLogin.setAttribute('aria-selected', login ? 'true' : 'false');
      tabReg.setAttribute('aria-selected', !login ? 'true' : 'false');
    }
    tabLogin.addEventListener('click', function () { show('login'); });
    tabReg.addEventListener('click', function () { show('register'); });
  }

  /* ---------- Countdown (coming soon) ---------- */
  function initCountdown() {
    var wrap = document.getElementById('countdown-timer');
    if (!wrap) return;
    var target = new Date();
    target.setDate(target.getDate() + 45);
    try {
      var saved = localStorage.getItem('ii-launch');
      if (saved) { var d = new Date(saved); if (!isNaN(d) && d > new Date()) target = d; }
      else localStorage.setItem('ii-launch', target.toISOString());
    } catch (e) {}
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var dist = target.getTime() - Date.now();
      if (dist < 0) dist = 0;
      var dd = Math.floor(dist / 86400000);
      var hh = Math.floor((dist % 86400000) / 3600000);
      var mm = Math.floor((dist % 3600000) / 60000);
      var ss = Math.floor((dist % 60000) / 1000);
      var map = { 'cd-days': dd, 'cd-hours': hh, 'cd-mins': mm, 'cd-secs': ss };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = pad(map[id]);
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Password visibility ---------- */
  function initPassword() {
    document.querySelectorAll('[data-show-pass]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-show-pass'));
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initDir();
    initNavbar();
    initMobileMenu();
    initAnnounce();
    initActiveNav();
    initReveal();
    initCounters();
    initFaq();
    initLightbox();
    initToTop();
    initAnchors();
    initForms();
    initAuthTabs();
    initCountdown();
    initPassword();
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleTheme); });
    document.querySelectorAll('#dir-toggle, #dir-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleDir); });
    document.body.classList.add('page-enter');
  });
})();
