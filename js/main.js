/**
 * Main JavaScript for Agency & Tech Services Suite
 * Features: Dark/Light Mode, RTL/LTR Layout Toggle, Mobile Nav, Counters, Countdown Timer, Toast System
 */

(function () {
  'use strict';

  // --- Theme Management ---
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      showToast('Switched to Light Mode ☀️');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      showToast('Switched to Dark Mode 🌙');
    }
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  initTheme();

  // --- RTL / LTR Direction Management ---
  function initDir() {
    const savedDir = localStorage.getItem('direction') || 'ltr';
    document.documentElement.setAttribute('dir', savedDir);
    updateRtlButtonText(savedDir);
  }

  function toggleDir() {
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    const nextDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', nextDir);
    localStorage.setItem('direction', nextDir);
    updateRtlButtonText(nextDir);
    showToast(`Switched layout to ${nextDir.toUpperCase()} 🔄`);
  }

  function updateRtlButtonText(dir) {
    rtlToggleBtns.forEach(btn => {
      const label = btn.querySelector('.rtl-label');
      if (label) {
        label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      }
    });
  }

  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleDir);
  });

  initDir();

  // --- Mobile Navigation Menu ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- Toast Notifications ---
  window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ${
      type === 'success'
        ? 'bg-emerald-600 text-white'
        : type === 'error'
        ? 'bg-rose-600 text-white'
        : 'bg-indigo-600 text-white'
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // --- Live Countdown Timer for Coming Soon ---
  const countdownEl = document.getElementById('countdown-timer');
  if (countdownEl) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45); // 45 days from now

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) return;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // --- Pricing Plan Toggle (Monthly / Annual) ---
  const billingToggle = document.getElementById('billing-toggle');
  if (billingToggle) {
    billingToggle.addEventListener('change', function () {
      const isAnnual = this.checked;
      const prices = document.querySelectorAll('.price-amount');
      const periods = document.querySelectorAll('.price-period');

      prices.forEach(el => {
        const monthly = el.getAttribute('data-monthly');
        const annual = el.getAttribute('data-annual');
        el.textContent = isAnnual ? annual : monthly;
      });

      periods.forEach(el => {
        el.textContent = isAnnual ? '/year' : '/month';
      });
    });
  }

  // --- Form Handler Simulation ---
  const genericForms = document.querySelectorAll('form[data-ajax="true"]');
  genericForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerHTML : 'Submit';
      if (btn) btn.innerHTML = 'Sending... ⏳';

      setTimeout(() => {
        if (btn) btn.innerHTML = originalText;
        showToast('Thank you! Your submission has been received.', 'success');
        form.reset();
      }, 1000);
    });
  });

  // --- Active Nav Highlight ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link-item');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('text-indigo-600', 'dark:text-indigo-400', 'font-bold');
    }
  });

})();
