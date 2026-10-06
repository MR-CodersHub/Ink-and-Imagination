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
  var BLOG_POSTS = [
    { slug: 'invitation-wording', cat: 'guide', badge: 'Guide', title: 'Invitation Wording Etiquette', desc: 'Traditional + modern formats that never offend.', img: '../images/post-wording.jpg', tag: 'GUIDE • WORDING', intro: 'Formal, semi-formal or fully you — the right wording tells guests exactly what to expect.', h2: 'Match Words to Mood', body: 'Spell names fully, name both hosts, state dress and gift expectations once, clearly.', points: ['Write host names in full', 'State dress code once', 'Give one clear RSVP date'] },
    { slug: 'restoring-press', cat: 'craft', badge: 'Craft', gold: true, title: 'Restoring Our 1950s Press', desc: 'Cast iron, elbow grease, first perfect impression.', img: '../images/post-press.jpg', tag: 'CRAFT • PRESS', intro: 'Cast iron, elbow grease and three weekends — bringing our 1950s Heidelberg back to life.', h2: 'Patience, Then Pressure', body: 'We stripped a century of ink, re-levelled the platen and pulled test sheets until the kiss was even.', points: ['Strip old ink fully', 'Level the platen', 'Proof until even'] },
    { slug: 'what-to-write', cat: 'tips', badge: 'Tips', title: 'What to Write Inside?', desc: '30 heartfelt lines for every occasion.', img: '../images/post-write.jpg', tag: 'TIPS • WORDING', intro: 'Thirty starting lines, but one rule beats them all — write like you speak.', h2: 'Say It Plain', body: 'Short, specific and warm beats long and flowery; name the memory, not just the occasion.', points: ['Name a shared memory', 'Keep it under 3 lines', 'Sign by hand, always'] },
    { slug: 'envelope-guide', cat: 'guide', badge: 'Guide', title: 'Envelope Addressing Guide', desc: 'Titles, families and plus-ones, done right.', img: '../images/post-envelope.jpg', tag: 'GUIDE • ETIQUETTE', intro: 'Titles, families and plus-ones — addressing that offends nobody.', h2: 'Order of Names', body: 'Outer envelope formal, inner envelope warm; children and plus-ones named, never assumed.', points: ['Full titles outside', 'Warm names inside', 'Name every plus-one'] },
    { slug: 'pressing-marigold', cat: 'craft', badge: 'Craft', gold: true, title: 'Pressing Marigold That Lasts', desc: 'Pick, press and seal petals for decades.', img: '../images/post-marigold.jpg', tag: 'CRAFT • PETALS', intro: 'Marigold keeps its gold for decades — if you pick and press it right.', h2: 'Pick Dry, Press Flat', body: 'Mid-morning blooms, blotters changed weekly, three full weeks under weight.', points: ['Pick after dew lifts', 'Change blotters weekly', 'Press 21+ days'] },
    { slug: 'pen-pairings', cat: 'tips', badge: 'Tips', title: 'Pen Pairings for Cotton Paper', desc: 'Inks that glide and never feather.', img: '../images/post-pens.jpg', tag: 'TIPS • TOOLS', intro: 'Cotton drinks ink — pair the wrong pen and lines feather by morning.', h2: 'Wet Ink, Patient Hand', body: 'Gel and fountain pens with quick-dry ink glide on 300 GSM; ballpoints skip, markers bleed.', points: ['Quick-dry gel or fountain', 'Test on a swatch first', 'Let lines dry flat'] },
    { slug: 'rsvp-wording', cat: 'guide', badge: 'Guide', title: 'RSVP Wording That Works', desc: 'Deadlines guests actually answer.', img: '../images/post-rsvp.jpg', tag: 'GUIDE • RSVP', intro: 'A deadline guests answer beats a pretty card they ignore.', h2: 'One Date, One Way', body: 'Give a single reply-by date and one reply path; follow once, kindly.', points: ['One reply-by date', 'One reply path', 'One kind nudge'] },
    { slug: 'gold-foil', cat: 'craft', badge: 'Craft', gold: true, title: 'Gold Foil Without Cracks', desc: 'Heat, pressure and patience, balanced.', img: '../images/post-foil.jpg', tag: 'CRAFT • FOIL', intro: 'Foil cracks when heat, pressure and dwell fight each other.', h2: 'Balance the Three', body: 'Medium heat, firm even pressure, short dwell — then let the sheet rest before handling.', points: ['Medium heat first', 'Even firm pressure', 'Rest sheets after'] },
    { slug: 'mailing-safely', cat: 'tips', badge: 'Tips', title: 'Mailing Deckle Cards Safely', desc: 'Sleeves, stiffness and postage tips.', img: '../images/post-mailing.jpg', tag: 'TIPS • POST', intro: 'Deckle edges survive the post with sleeves, stiffness and the right stamp.', h2: 'Sleeve It Rigid', body: 'Biodegradable sleeve, rigid mailer, correct postage — and nothing marked for machines.', points: ['Sleeve every card', 'Use rigid mailers', 'Weigh before stamping'] },
    { slug: 'birthday-timelines', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Birthday Card Timelines', desc: 'When to order, write and post.', img: '../images/post-birthday.jpg', tag: 'OCCASIONS • TIMING', intro: 'Order, write and post on time — birthdays wait for nobody.', h2: 'Count Backwards', body: 'Custom orders need 12–16 days; write a week ahead, post three days early.', points: ['Order 3 weeks ahead', 'Write a week early', 'Post 3 days prior'] },
    { slug: 'wedding-checklist', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Wedding Suite Checklist', desc: 'Every piece, from save-date to thanks.', img: '../images/post-wedding.jpg', tag: 'OCCASIONS • WEDDING', intro: 'Save-dates to thank-yous — every paper piece in order.', h2: 'In Invitation Order', body: 'Save-date, invite + RSVP, day-of paper, then thank-you notelets — one studio for all four.', points: ['Save-date first', 'Invite + RSVP suite', 'Thanks after the day'] },
    { slug: 'festive-guide', cat: 'occasions', badge: 'Occasions', sage: true, title: 'Festive Gifting Guide', desc: 'Diwali to Christmas, boxed right.', img: '../images/post-festive.jpg', tag: 'OCCASIONS • FESTIVE', intro: 'Diwali to Christmas — gift boxes that arrive ready to hand over.', h2: 'Box It Beautiful', body: 'Eight pressed notelets, hand-torn tags and twine — boxed sets from ₹1,850.', points: ['Pick an 8-box set', 'Add hand-torn tags', 'Ship before the rush'] }
  ];
  function initBlogPost() {
    var title = document.querySelector('[data-post-title]');
    if (!title) return;
    var slug = null;
    try { slug = new URLSearchParams(window.location.search).get('post'); } catch (e) { slug = null; }
    var post = null;
    for (var i = 0; i < BLOG_POSTS.length; i++) { if (BLOG_POSTS[i].slug === slug) { post = BLOG_POSTS[i]; break; } }
    function set(sel, fn) { var el = document.querySelector(sel); if (el) fn(el); }
    if (post) {
      set('[data-post-tag]', function (el) { el.textContent = post.tag; });
      title.textContent = post.title;
      set('[data-post-crumb]', function (el) { el.textContent = post.title; });
      set('[data-post-intro]', function (el) { el.textContent = post.intro; });
      set('[data-post-h2]', function (el) { el.textContent = post.h2; });
      set('[data-post-body]', function (el) { el.textContent = post.body; });
      set('[data-post-img]', function (el) { el.src = post.img; el.setAttribute('data-zoom', post.img); el.alt = post.title; });
      document.title = post.title + ' — Journal | Ink & Imagination';
    }
    set('#post-points', function (ul) {
      var pts = post ? post.points : ['Pick dry, blemish-free blooms mid-morning.', 'Press 21+ days; change blotters weekly.', 'Store with silica; keep from direct sun.'];
      ul.innerHTML = pts.map(function (p) { return '<li>✦ ' + p + '</li>'; }).join('');
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
    initPostFilter();
    initBlogPost();
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleTheme); });
    document.querySelectorAll('#dir-toggle, #dir-toggle-mobile').forEach(function (b) { b.addEventListener('click', toggleDir); });
    document.body.classList.add('page-enter');
  });
})();
