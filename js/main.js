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
  var ICON_MOON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  var ICON_SUN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, [data-theme-icon]').forEach(function (b) {
      var iconSlot = b.querySelector ? b.querySelector('[data-theme-icon]') : null;
      var labelSlot = b.querySelector ? b.querySelector('[data-theme-label]') : null;
      if (iconSlot || labelSlot) {
        if (iconSlot) iconSlot.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
        if (labelSlot) labelSlot.textContent = t === 'dark' ? 'Dark' : 'Light';
        b.classList.toggle('is-dark', t === 'dark');
        b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        return;
      }
      b.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
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
      var labelSlot = b.querySelector ? b.querySelector('[data-dir-label]') : null;
      if (labelSlot) {
        labelSlot.textContent = d === 'rtl' ? 'RTL' : 'LTR';
        b.classList.toggle('is-rtl', d === 'rtl');
        b.setAttribute('aria-label', 'Switch layout direction (current: ' + d.toUpperCase() + ')');
        return;
      }
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
    var ICON_UP = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    var btn = document.getElementById('to-top') || document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'to-top';
      btn.className = 'to-top';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.setAttribute('title', 'Scroll to top');
      btn.innerHTML = ICON_UP;
      document.body.appendChild(btn);
    } else {
      if (!btn.innerHTML || btn.textContent.trim() === '↑') btn.innerHTML = ICON_UP;
      if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Scroll to top');
      if (!btn.getAttribute('title')) btn.setAttribute('title', 'Scroll to top');
      if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
    }
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function toggle() {
      var show = window.scrollY > 600;
      btn.classList.toggle('show', show);
      btn.classList.toggle('visible', show);
    }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
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
    document.querySelectorAll('form[data-validate], form[data-ajax="true"], #enquiry-form, #quote-form, #newsletter-form, #notify-form, #login-form, #register-form, #signup-form').forEach(function (form) {
      if (form.dataset.bound) return;
      // Auth forms have their own handler (initAuth) with home-page redirect — skip generic toast here.
      if (form.id === 'login-form' || form.id === 'register-form' || form.id === 'signup-form') return;
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

  /* ---------- Auth tabs (supports old button tabs + new Login/Sign Up link tabs) ---------- */
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

  /* ---------- Auth (login + signup, localStorage demo) ---------- */
  var USERS_KEY = 'ii-users';
  var SESSION_KEY = 'ii-session';
  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
  }
  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setSession(sess) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch (e) {}
  }
  function hashPass(pw) {
    try {
      if (window.btoa) return 'b64$' + window.btoa(unescape(encodeURIComponent(pw)));
    } catch (e) {}
    return 'plain$' + pw;
  }
  function homeTarget() {
    try {
      var q = new URLSearchParams(window.location.search);
      var next = q.get('redirect') || q.get('next');
      if (next && !/^https?:\/\//i.test(next) && next.indexOf('..') === -1) return next;
    } catch (e) {}
    // login.html / signup.html live in pages/ → home is ../index.html
    return window.location.pathname.indexOf('/pages/') !== -1 ? '../index.html' : 'index.html';
  }
  function redirectHome(delay) {
    var target = homeTarget();
    setTimeout(function () { window.location.href = target; }, delay || 900);
  }
  function renderAuthState() {
    var slots = document.querySelectorAll('[data-auth-state]');
    if (!slots.length) return;
    var sess = getSession();
    slots.forEach(function (slot) {
      if (sess && sess.email) {
        slot.innerHTML = '<div class="form-card" style="margin-bottom:1.2rem;display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap;">' +
          '<span>Logged in as <strong>' + String(sess.name || sess.email).replace(/[<>&"]/g, '') + '</strong></span>' +
          '<span style="display:flex;gap:.6rem;"><a class="btn btn-outline btn-sm" href="' + homeTarget() + '">Go Home →</a>' +
          '<button class="btn btn-outline btn-sm" type="button" data-logout>Logout</button></span></div>';
      } else {
        slot.innerHTML = '';
      }
    });
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
        window.showToast('Logged out. See you soon!', 'info');
        renderAuthState();
      });
    });
  }
  function initAuth() {
    renderAuthState();
    // If already logged in on login/signup pages, offer one-click home (no forced redirect).
    var sess = getSession();
    if (sess && sess.email) {
      var f = document.getElementById('login-form') || document.getElementById('signup-form') || document.getElementById('register-form');
      if (f && !document.querySelector('[data-auth-state]')) window.showToast('Already logged in as ' + (sess.name || sess.email) + '.', 'info');
    }

    var loginForm = document.getElementById('login-form');
    if (loginForm && !loginForm.dataset.bound) {
      loginForm.dataset.bound = '1';
      loginForm.setAttribute('novalidate', 'novalidate');
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailEl = loginForm.querySelector('input[type="email"], input[name="email"]');
        var passEl = loginForm.querySelector('input[type="password"], input[name="password"]');
        var email = emailEl ? (emailEl.value || '').trim().toLowerCase() : '';
        var pass = passEl ? (passEl.value || '') : '';
        var ok = true;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          setErr(emailEl.closest('.field') || emailEl.parentElement, 'Please enter a valid email.');
          ok = false;
        } else setErr(emailEl.closest('.field') || emailEl.parentElement, '');
        if (!pass) {
          setErr(passEl.closest('.field') || passEl.parentElement, 'Please enter your password.');
          ok = false;
        } else setErr(passEl.closest('.field') || passEl.parentElement, '');
        if (!ok) { window.showToast('Please fix the highlighted fields.', 'error'); return; }
        // Demo mode: any email + any password works. New emails get an
        // account created on the fly; existing ones log straight in.
        var users = getUsers();
        var user = null;
        for (var i = 0; i < users.length; i++) {
          if ((users[i].email || '').toLowerCase() === email) { user = users[i]; break; }
        }
        if (!user) {
          var local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
          user = { name: local || 'Studio Friend', email: email, pass: hashPass(pass), at: new Date().toISOString() };
          users.push(user);
          saveUsers(users);
        } else {
          user.pass = hashPass(pass);
          if (!user.name) user.name = email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Studio Friend';
          saveUsers(users);
        }
        var btn = loginForm.querySelector('button[type="submit"]');
        var original = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Logging in…'; }
        setSession({ email: user.email, name: user.name, at: new Date().toISOString() });
        renderAuthState();
        window.showToast('Welcome back, ' + (user.name || 'friend') + '! Redirecting to home…', 'success');
        loginForm.reset();
        if (btn) setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 1200);
        redirectHome(900);
      });
    }

    ['signup-form', 'register-form'].forEach(function (id) {
      var form = document.getElementById(id);
      if (!form || form.dataset.bound) return;
      form.dataset.bound = '1';
      form.setAttribute('novalidate', 'novalidate');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameEl = form.querySelector('input[name="name"]');
        var emailEl = form.querySelector('input[type="email"], input[name="email"]');
        var passEl = form.querySelector('input[name="password"]');
        var confEl = form.querySelector('input[name="confirm"]');
        var name = nameEl ? (nameEl.value || '').trim() : '';
        var email = emailEl ? (emailEl.value || '').trim().toLowerCase() : '';
        var pass = passEl ? (passEl.value || '') : '';
        var conf = confEl ? (confEl.value || '') : pass;
        var ok = true;
        function mark(el, msg) {
          if (!el) return;
          setErr(el.closest('.field') || el.parentElement, msg);
          if (msg) ok = false;
        }
        mark(nameEl, !name || name.length < 2 ? 'Please enter your name.' : '');
        mark(emailEl, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Please enter a valid email.' : '');
        mark(passEl, !pass || pass.length < 6 ? 'Password must be at least 6 characters.' : '');
        if (confEl) mark(confEl, conf !== pass ? 'Passwords do not match.' : '');
        if (!ok) { window.showToast('Please fix the highlighted fields.', 'error'); return; }
        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
          if ((users[i].email || '').toLowerCase() === email) {
            window.showToast('This email is already registered. Please login.', 'error');
            return;
          }
        }
        var user = { name: name, email: email, pass: hashPass(pass), at: new Date().toISOString() };
        users.push(user);
        saveUsers(users);
        setSession({ email: user.email, name: user.name, at: user.at });
        renderAuthState();
        var btn = form.querySelector('button[type="submit"]');
        var original = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Creating account…'; }
        window.showToast('Account created — welcome, ' + (name || 'friend') + '! Redirecting to home…', 'success');
        form.reset();
        if (btn) setTimeout(function () { btn.disabled = false; btn.innerHTML = original; }, 1200);
        redirectHome(900);
      });
    });
  }

  /* ---------- Social login (Google / Facebook OAuth) ----------
     Fill in your own IDs to go live. Until then the buttons explain
     what is missing instead of failing silently. */
  var GOOGLE_CLIENT_ID = ''; // e.g. '1234567890-abc123.apps.googleusercontent.com'
  var FACEBOOK_APP_ID = ''; // e.g. '1234567890123456'
  function loadScriptOnce(src, globalName) {
    return new Promise(function (resolve, reject) {
      if (globalName && window[globalName]) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('load failed: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function socialSession(name, email, provider) {
    name = (name || 'Studio Friend').toString();
    email = (email || '').toString().trim().toLowerCase();
    if (!email) { window.showToast('Could not read your ' + provider + ' email.', 'error'); return; }
    var users = getUsers();
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if ((users[i].email || '').toLowerCase() === email) {
        if (!users[i].name) users[i].name = name;
        found = true;
        break;
      }
    }
    if (!found) {
      users.push({ name: name, email: email, pass: 'oauth$' + provider, at: new Date().toISOString() });
      saveUsers(users);
    }
    setSession({ email: email, name: name, at: new Date().toISOString(), via: provider });
    renderAuthState();
    initNavAuth();
    window.showToast('Signed in with ' + provider + ' — redirecting home…', 'success');
    redirectHome(900);
  }
  function socialGoogle(btn) {
    if (!GOOGLE_CLIENT_ID) {
      window.showToast('Google sign-in needs a Client ID — add yours in js/main.js (GOOGLE_CLIENT_ID).', 'info');
      return;
    }
    btn.disabled = true;
    loadScriptOnce('https://accounts.google.com/gsi/client', 'google').then(function () {
      var client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid profile email',
        callback: function (res) {
          btn.disabled = false;
          if (!res || !res.access_token) { window.showToast('Google sign-in was cancelled.', 'error'); return; }
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: 'Bearer ' + res.access_token }
          }).then(function (r) { return r.json(); }).then(function (u) {
            socialSession(u.name, u.email, 'Google');
          }).catch(function () { window.showToast('Could not fetch your Google profile.', 'error'); });
        }
      });
      client.requestAccessToken();
    }).catch(function () {
      btn.disabled = false;
      window.showToast('Could not load Google sign-in. Check your connection.', 'error');
    });
  }
  function socialFacebook(btn) {
    if (!FACEBOOK_APP_ID) {
      window.showToast('Facebook login needs an App ID — add yours in js/main.js (FACEBOOK_APP_ID).', 'info');
      return;
    }
    btn.disabled = true;
    loadScriptOnce('https://connect.facebook.net/en_US/sdk.js', 'FB').then(function () {
      window.FB.init({ appId: FACEBOOK_APP_ID, version: 'v21.0' });
      window.FB.login(function (res) {
        btn.disabled = false;
        if (!res || res.status !== 'connected') { window.showToast('Facebook login was cancelled.', 'error'); return; }
        window.FB.api('/me', { fields: 'name,email' }, function (u) {
          socialSession(u && u.name, u && u.email, 'Facebook');
        });
      }, { scope: 'public_profile,email' });
    }).catch(function () {
      btn.disabled = false;
      window.showToast('Could not load Facebook login. Check your connection.', 'error');
    });
  }
  function initSocialAuth() {
    var btns = document.querySelectorAll('[data-social]');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var provider = btn.getAttribute('data-social');
        if (provider === 'google') socialGoogle(btn);
        else if (provider === 'facebook') socialFacebook(btn);
      });
    });
  }

  /* ---------- Nav login button (shows greeting when signed in) ---------- */
  function initNavAuth() {
    var sess = getSession();
    if (!sess || !sess.email) return;
    var first = String(sess.name || sess.email).split(' ')[0];
    document.querySelectorAll('[data-nav-auth="login"]').forEach(function (btn) {
      btn.textContent = 'Hi, ' + first;
      btn.setAttribute('title', 'Logged in as ' + (sess.name || sess.email));
    });
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

  /* ---------- Blog category filter + view more ---------- */
  function initPostFilter() {
    var bar = document.querySelector('.post-filter');
    var grid = document.querySelector('.post-grid');
    if (!bar || !grid) return;
    var DEFAULT_SHOWN = 6;
    var STEP = 3;
    var btns = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    var count = document.querySelector('[data-post-count]');
    var moreBtn = document.getElementById('post-view-more');
    var moreWrap = moreBtn ? moreBtn.closest('.post-more') : null;
    var filter = 'all';
    var shown = DEFAULT_SHOWN;
    function apply() {
      var matched = cards.filter(function (c) { return filter === 'all' || c.getAttribute('data-category') === filter; });
      var visible = matched.slice(0, shown);
      cards.forEach(function (c) { c.classList.toggle('is-hidden', visible.indexOf(c) === -1); });
      if (count) count.textContent = 'Showing ' + visible.length + ' of ' + matched.length + ' stories';
      btns.forEach(function (b) {
        var on = b.getAttribute('data-filter') === filter;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (moreBtn) {
        if (matched.length > shown) {
          moreWrap.style.display = '';
          moreBtn.innerHTML = 'View more (' + (matched.length - shown) + ' more) <span aria-hidden="true">→</span>';
          moreBtn.dataset.mode = 'more';
        } else if (matched.length > DEFAULT_SHOWN) {
          moreWrap.style.display = '';
          moreBtn.innerHTML = 'Show less <span aria-hidden="true">↑</span>';
          moreBtn.dataset.mode = 'less';
        } else {
          moreWrap.style.display = 'none';
        }
      }
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { filter = b.getAttribute('data-filter'); shown = DEFAULT_SHOWN; apply(); }); });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      if (moreBtn.dataset.mode === 'less') { shown = DEFAULT_SHOWN; } else { shown += STEP; }
      apply();
    });
    apply();
  }

  /* ---------- Blog post detail (?post=slug) ---------- */
  var AUTHORS = {
    'Ananya Sharma': { role: 'Founder & Paper Maker', bio: 'Ananya founded Ink & Imagination in 2019 after falling for deckle-edge cotton at a Jaipur paper mill. She heads design and botanical sourcing across both studios.' },
    'Rohan Mehta': { role: 'Master Printer', bio: 'Rohan coaxes our 1950s Heidelberg through letterpress and foil runs. Twelve years at the press, zero shortcuts — every sheet gets his loupe test.' },
    'Meera Iyer': { role: 'Botanical Artist', bio: 'Meera harvests, presses and lays every petal that lands on our cards. She can tell cosmos from cornflower blindfolded.' }
  };
  function authorInitials(name) {
    return String(name || '?').split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }
  var BLOG_POSTS = [
    { slug: 'invitation-wording', cat: 'guide', badge: 'Guide', title: 'Invitation Wording Etiquette', desc: 'Traditional + modern formats that never offend.', img: '../images/post-wording.jpg', tag: 'GUIDE • WORDING', author: 'Ananya Sharma', date: '28 Sep 2026 • Jaipur Paper Unit', read: '5 min read', quote: 'Formal, semi-formal or fully you — the wording tells guests exactly what to expect.', intro: 'Formal, semi-formal or fully you — the right wording tells guests exactly what to expect.', h2: 'Match Words to Mood', body: 'Spell names fully, name both hosts, state dress and gift expectations once, clearly.', points: ['Write host names in full', 'State dress code once', 'Give one clear RSVP date'], body2: 'For Indian weddings, name both families and both venues — ceremony and reception often split across days and cities. Mention the dress code once, in plain words, so outstation guests can pack right.', body3: 'Close with a single RSVP line: one date, one phone number or link. Anything more and replies scatter across WhatsApp threads you will never find again.' },
    { slug: 'restoring-press', cat: 'craft', badge: 'Craft', gold: true, title: 'Restoring Our 1950s Press', desc: 'Cast iron, elbow grease, first perfect impression.', img: '../images/post-press.jpg', tag: 'CRAFT • PRESS', author: 'Rohan Mehta', date: '14 Sep 2026 • Delhi Press Room', read: '7 min read', quote: 'Cast iron, elbow grease and three weekends — bringing our 1950s Heidelberg back to life.', intro: 'Cast iron, elbow grease and three weekends — bringing our 1950s Heidelberg back to life.', h2: 'Patience, Then Pressure', body: 'We stripped a century of ink, re-levelled the platen and pulled test sheets until the kiss was even.', points: ['Strip old ink fully', 'Level the platen', 'Proof until even'], body2: 'The Heidelberg arrived with seized rollers and a treadle thick with a century of ink. We stripped it with solvents and patience, then re-levelled the platen so the impression kisses evenly — deep enough to feel, never enough to bruise.', body3: 'The first perfect pull took eleven test sheets. Now it prints our wedding suites at a slow 800 impressions an hour, and every card carries a bite you can feel with your eyes closed.' },
    { slug: 'what-to-write', cat: 'tips', badge: 'Tips', title: 'What to Write Inside?', desc: '30 heartfelt lines for every occasion.', img: '../images/post-write.jpg', tag: 'TIPS • WORDING', author: 'Ananya Sharma', date: '02 Sep 2026 • Jaipur Paper Unit', read: '4 min read', quote: 'Write like you speak — short, specific and warm beats long and flowery.', intro: 'Thirty starting lines, but one rule beats them all — write like you speak.', h2: 'Say It Plain', body: 'Short, specific and warm beats long and flowery; name the memory, not just the occasion.', points: ['Name a shared memory', 'Keep it under 3 lines', 'Sign by hand, always'], body2: 'For weddings, name the couple and one memory — the sangeet dance, the filter-coffee run. For birthdays, name the year: what they did, what changed. Specific beats poetic every single time.', body3: 'Stuck? Start with “Thank you for…” or “I still remember when…”. Two lines beat a blank card, and your handwriting does the rest. Sign by hand, always — printed names fool nobody.' },
    { slug: 'envelope-guide', cat: 'guide', badge: 'Guide', title: 'Envelope Addressing Guide', desc: 'Titles, families and plus-ones, done right.', img: '../images/post-envelope.jpg', tag: 'GUIDE • ETIQUETTE', author: 'Meera Iyer', date: '24 Aug 2026 • Delhi Studio', read: '5 min read', quote: 'Outer envelope formal, inner envelope warm — nobody offended, everybody named.', intro: 'Titles, families and plus-ones — addressing that offends nobody.', h2: 'Order of Names', body: 'Outer envelope formal, inner envelope warm; children and plus-ones named, never assumed.', points: ['Full titles outside', 'Warm names inside', 'Name every plus-one'], body2: 'Married couples go as “Mr. and Mrs. Sharma” on the outer envelope, first names inside. Children under eighteen join the inner envelope; plus-ones get named on both, never assumed with an “and guest”.', body3: 'For Indian households, list the family name once with every adult below it. When in doubt, ask the family — one quick question now beats a corrected reprint later.' },
    { slug: 'pressing-marigold', cat: 'craft', badge: 'Craft', gold: true, title: 'Pressing Marigold That Lasts', desc: 'Pick, press and seal petals for decades.', img: '../images/post-marigold.jpg', tag: 'CRAFT • PETALS', author: 'Meera Iyer', date: '11 Aug 2026 • Jaipur Paper Unit', read: '6 min read', quote: 'Marigold keeps its gold for decades — if you pick it dry and press it flat.', intro: 'Marigold keeps its gold for decades — if you pick and press it right.', h2: 'Pick Dry, Press Flat', body: 'Mid-morning blooms, blotters changed weekly, three full weeks under weight.', points: ['Pick after dew lifts', 'Change blotters weekly', 'Press 21+ days'], body2: 'Pick mid-morning, after the dew lifts but before harsh sun dulls the gold. Choose flat, unblemished heads and press the same day — marigold bruises fast once cut.', body3: 'Change blotters every week or trapped moisture browns the edges. After 21 days under weight, store finished petals with silica sachets — they will hold colour for decades.' },
    { slug: 'pen-pairings', cat: 'tips', badge: 'Tips', title: 'Pen Pairings for Cotton Paper', desc: 'Inks that glide and never feather.', img: '../images/post-pens.jpg', tag: 'TIPS • TOOLS', author: 'Rohan Mehta', date: '29 Jul 2026 • Delhi Press Room', read: '4 min read', quote: 'Cotton drinks ink — pair the wrong pen and your lines feather by morning.', intro: 'Cotton drinks ink — pair the wrong pen and lines feather by morning.', h2: 'Wet Ink, Patient Hand', body: 'Gel and fountain pens with quick-dry ink glide on 300 GSM; ballpoints skip, markers bleed.', points: ['Quick-dry gel or fountain', 'Test on a swatch first', 'Let lines dry flat'], body2: 'Fountain pens with quick-dry ink glide beautifully on cotton, but always test first — wet writers feather on soft fibres. Pigment-based gel pens are the safest all-rounder for addressing and notes alike.', body3: 'Avoid ballpoints on deckle cotton: they skip and need pressure that dents the sheet. And never use markers — they bleed straight through 300 GSM before you lift the nib.' },
    { slug: 'rsvp-wording', cat: 'guide', badge: 'Guide', title: 'RSVP Wording That Works', desc: 'Deadlines guests actually answer.', img: '../images/post-rsvp.jpg', tag: 'GUIDE • RSVP', author: 'Ananya Sharma', date: '18 Jul 2026 • Jaipur Paper Unit', read: '5 min read', quote: 'A deadline guests answer beats a pretty card they ignore.', intro: 'A deadline guests answer beats a pretty card they ignore.', h2: 'One Date, One Way', body: 'Give a single reply-by date and one reply path; follow once, kindly.', points: ['One reply-by date', 'One reply path', 'One kind nudge'], body2: 'Set the reply-by date three weeks before you must confirm caterers, then follow up once, kindly, a week after. Most late replies are forgetfulness, not rudeness — one nudge recovers half of them.', body3: 'Offer exactly one reply path: a number, a link, or a card — never all three. Every extra option halves your response rate and doubles your tracking headache.' },
    { slug: 'gold-foil', cat: 'craft', badge: 'Craft', gold: true, title: 'Gold Foil Without Cracks', desc: 'Heat, pressure and patience, balanced.', img: '../images/post-foil.jpg', tag: 'CRAFT • FOIL', author: 'Rohan Mehta', date: '06 Jul 2026 • Delhi Press Room', read: '6 min read', quote: 'Foil cracks when heat, pressure and dwell fight each other — balance all three.', intro: 'Foil cracks when heat, pressure and dwell fight each other.', h2: 'Balance the Three', body: 'Medium heat, firm even pressure, short dwell — then let the sheet rest before handling.', points: ['Medium heat first', 'Even firm pressure', 'Rest sheets after'], body2: 'Start at medium heat with firm, even pressure and a short dwell. Too hot and the foil blisters; too cool and it flakes at the edges. Cotton rag forgives more than coated stock — but not everything.', body3: 'Let foiled sheets rest a full day before trimming or stacking; the bond keeps curing after the press opens. Handle by the edges — fingerprints on fresh foil never come off.' },
    { slug: 'mailing-safely', cat: 'tips', badge: 'Tips', title: 'Mailing Deckle Cards Safely', desc: 'Sleeves, stiffness and postage tips.', img: '../images/post-mailing.jpg', tag: 'TIPS • POST', author: 'Meera Iyer', date: '22 Jun 2026 • Jaipur Paper Unit', read: '4 min read', quote: 'Deckle edges survive the post with sleeves, stiffness and the right stamp.', intro: 'Deckle edges survive the post with sleeves, stiffness and the right stamp.', h2: 'Sleeve It Rigid', body: 'Biodegradable sleeve, rigid mailer, correct postage — and nothing marked for machines.', points: ['Sleeve every card', 'Use rigid mailers', 'Weigh before stamping'], body2: 'Slide every card into a biodegradable sleeve, then a rigid mailer — never a soft envelope. Deckle edges catch in sorting machines, so stiffness, not markings, is what saves them.', body3: 'Weigh a packed sample at the post office before buying stamps in bulk. A 300 GSM deckle card with sleeve crosses standard slabs fast, and returned post costs more than correct postage.' },
    { slug: 'birthday-timelines', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Birthday Card Timelines', desc: 'When to order, write and post.', img: '../images/post-birthday.jpg', tag: 'OCCASIONS • TIMING', author: 'Ananya Sharma', date: '09 Jun 2026 • Delhi Studio', read: '5 min read', quote: 'Order, write and post on time — birthdays wait for nobody.', intro: 'Order, write and post on time — birthdays wait for nobody.', h2: 'Count Backwards', body: 'Custom orders need 12–16 days; write a week ahead, post three days early.', points: ['Order 3 weeks ahead', 'Write a week early', 'Post 3 days prior'], body2: 'Custom orders need 12–16 working days: proofing, pressing, drying, foiling. Add a week in wedding season and the Diwali rush, when the studio queue doubles overnight.', body3: 'Write your message a week before the date, not the night before — ink needs a day to cure on cotton, and tired handwriting shows. Post three days early; hand-deliver if you can.' },
    { slug: 'wedding-checklist', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Wedding Suite Checklist', desc: 'Every piece, from save-date to thanks.', img: '../images/post-wedding.jpg', tag: 'OCCASIONS • WEDDING', author: 'Meera Iyer', date: '27 May 2026 • Jaipur Paper Unit', read: '7 min read', quote: 'Save-dates to thank-yous — every paper piece in its right order.', intro: 'Save-dates to thank-yous — every paper piece in order.', h2: 'In Invitation Order', body: 'Save-date, invite + RSVP, day-of paper, then thank-you notelets — one studio for all four.', points: ['Save-date first', 'Invite + RSVP suite', 'Thanks after the day'], body2: 'Start with save-dates six months out, then the main suite: invitation, RSVP, and inserts for travel and events. Day-of paper — menus, place cards, signage — comes last, once guest counts freeze.', body3: 'Order 10% extra of everything; reprints of letterpress suites cost nearly as much as the first run. And keep one full suite untouched — couples always want a keepsake set later.' },
    { slug: 'festive-guide', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Festive Gifting Guide', desc: 'Diwali to Christmas, boxed right.', img: '../images/post-festive.jpg', tag: 'OCCASIONS • FESTIVE', author: 'Ananya Sharma', date: '15 May 2026 • Delhi Studio', read: '5 min read', quote: 'Diwali to Christmas — gift boxes that arrive ready to hand over.', intro: 'Diwali to Christmas — gift boxes that arrive ready to hand over.', h2: 'Box It Beautiful', body: 'Eight pressed notelets, hand-torn tags and twine — boxed sets from ₹1,850.', points: ['Pick an 8-box set', 'Add hand-torn tags', 'Ship before the rush'], body2: 'For Diwali pick marigold and deep reds; for Christmas, pine green with gold foil. Order gift boxes before the festive rush — courier networks choke in the final ten days and “urgent” becomes impossible.', body3: 'Add hand-torn gift tags with the recipient name in calligraphy — a two-minute touch that makes a boxed set feel personal. Corporate orders over fifty boxes get custom sleeves and a single invoice.' }
  ];
  function initBlogPost() {
    var title = document.querySelector('[data-post-title]');
    if (!title) return;
    var slug = null;
    try { slug = new URLSearchParams(window.location.search).get('post'); } catch (e) { slug = null; }
    var idx = -1;
    for (var i = 0; i < BLOG_POSTS.length; i++) { if (BLOG_POSTS[i].slug === slug) { idx = i; break; } }
    var post = idx > -1 ? BLOG_POSTS[idx] : null;
    function set(sel, fn) { var el = document.querySelector(sel); if (el) fn(el); }
    function setAll(sel, fn) { document.querySelectorAll(sel).forEach(function (el) { fn(el); }); }
    if (post) {
      set('[data-post-badge]', function (el) {
        el.textContent = post.badge;
        el.className = 'post-badge' + (post.gold ? ' post-badge--gold' : '') + (post.sage ? ' post-badge--sage' : '');
      });
      set('[data-post-read]', function (el) { el.textContent = post.read; });
      title.textContent = post.title;
      set('[data-post-crumb]', function (el) { el.textContent = post.title; });
      set('[data-post-intro]', function (el) { el.textContent = post.intro; });
      set('[data-post-quote]', function (el) { el.textContent = post.quote; });
      set('[data-post-h2]', function (el) { el.textContent = post.h2; });
      set('[data-post-body]', function (el) { el.textContent = post.body; });
      set('[data-post-body2]', function (el) { el.textContent = post.body2; });
      set('[data-post-body3]', function (el) { el.textContent = post.body3; });
      set('[data-post-img]', function (el) { el.src = post.img; el.setAttribute('data-zoom', post.img); el.alt = post.title; });
      set('[data-post-caption]', function (el) { el.textContent = post.desc + ' — from our studio journal.'; });
      setAll('[data-post-author]', function (el) { el.textContent = post.author; });
      setAll('[data-post-initials]', function (el) { el.textContent = authorInitials(post.author); });
      set('[data-post-date]', function (el) { el.textContent = post.date; });
      var meta = AUTHORS[post.author] || { role: 'Studio Contributor', bio: '' };
      set('[data-post-role]', function (el) { el.textContent = meta.role; });
      set('[data-post-bio]', function (el) { el.textContent = meta.bio; });
      document.title = post.title + ' — Journal | Ink & Imagination';
    }
    set('#post-points', function (ul) {
      var pts = post ? post.points : ['Pick dry, blemish-free blooms mid-morning.', 'Press 21+ days; change blotters weekly.', 'Store with silica; keep from direct sun.'];
      ul.innerHTML = pts.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    });
    set('#related-grid', function (grid) {
      var rel = BLOG_POSTS.filter(function (p) { return !post || (p.slug !== post.slug && p.cat === post.cat); }).slice(0, 3);
      if (post && rel.length < 3) {
        var extra = BLOG_POSTS.filter(function (p) { return p.slug !== post.slug && p.cat !== post.cat; });
        rel = rel.concat(extra).slice(0, 3);
      }
      if (!post) rel = BLOG_POSTS.slice(0, 3);
      grid.innerHTML = rel.map(function (p) {
        var cls = 'post-badge' + (p.gold ? ' post-badge--gold' : '') + (p.sage ? ' post-badge--sage' : '');
        return '<article class="post-card"><div class="post-media"><img src="' + p.img + '" alt="' + p.title + '" class="post-img" loading="lazy"><span class="' + cls + '">' + p.badge + '</span></div><div class="post-body"><h3 class="post-title"><a href="blog-detail.html?post=' + p.slug + '">' + p.title + '</a></h3><p class="post-desc">' + p.desc + '</p><div class="post-foot"><a href="blog-detail.html?post=' + p.slug + '" class="post-link">Read <span aria-hidden="true">→</span></a></div></div></article>';
      }).join('');
    });
    // Prev / next article navigation (wraps around the journal order).
    var total = BLOG_POSTS.length;
    var cur = idx > -1 ? idx : 0;
    var prev = BLOG_POSTS[(cur - 1 + total) % total];
    var next = BLOG_POSTS[(cur + 1) % total];
    set('#prev-post', function (a) { a.href = 'blog-detail.html?post=' + prev.slug; });
    set('#prev-title', function (el) { el.textContent = prev.title; });
    set('#next-post', function (a) { a.href = 'blog-detail.html?post=' + next.slug; });
    set('#next-title', function (el) { el.textContent = next.title; });
    // Share: copy link + prefilled X / WhatsApp intents.
    var pageUrl = window.location.href;
    var shareText = title.textContent.trim();
    function enc(s) { try { return encodeURIComponent(s); } catch (e) { return ''; } }
    set('#share-x', function (a) { a.href = 'https://twitter.com/intent/tweet?text=' + enc(shareText) + '&url=' + enc(pageUrl); });
    set('#share-wa', function (a) { a.href = 'https://wa.me/?text=' + enc(shareText + ' ' + pageUrl); });
    var copyBtn = document.getElementById('share-copy');
    if (copyBtn && !copyBtn.dataset.bound) {
      copyBtn.dataset.bound = '1';
      copyBtn.addEventListener('click', function () {
        function done() { window.showToast('Article link copied to clipboard.', 'success'); }
        function fail() { window.showToast('Could not copy — long-press the URL instead.', 'error'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(done, fail);
        } else {
          try {
            var ta = document.createElement('textarea');
            ta.value = pageUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            done();
          } catch (e) { fail(); }
        }
      });
    }
  }

  /* ---------- Reading progress bar (article pages) ---------- */
  function initReadingProgress() {
    var bar = document.getElementById('reading-bar');
    if (!bar) return;
    var doc = document.documentElement;
    function update() {
      var max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
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
    initAuth();
    initSocialAuth();
    initNavAuth();
    initCountdown();
    initPassword();
    initPostFilter();
    initBlogPost();
    initReadingProgress();
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleTheme); });
    document.querySelectorAll('#dir-toggle, #dir-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleDir); });
    document.body.classList.add('page-enter');
  });
})();
