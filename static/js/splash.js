/**
 * splash.js — 3D Endless Corridor Splash Screen for NOVA MART
 */
(function () {
  'use strict';

  const SPLASH_IMAGES = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584990347449-39904d60920a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80"
  ];

  const Z_FAR = -2400;
  const Z_NEAR = 780;
  const RANGE = Z_NEAR - Z_FAR;
  const DURATION = 16000; // 16 seconds loop
  const TOTAL = SPLASH_IMAGES.length;

  document.addEventListener('DOMContentLoaded', initSplash);

  function initSplash() {
    const splash = document.getElementById('novaSplashScreen');
    const world = document.getElementById('novaSplashWorld');
    const enterBtn = document.getElementById('novaSplashEnterBtn');
    const skipBtn = document.getElementById('novaSplashSkipBtn');
    const timerLabel = document.getElementById('novaSplashTimer');

    if (!splash || !world) return;

    // Check if user already entered in this tab session
    const seen = sessionStorage.getItem('nova_mart_splash_seen');
    if (seen === '1' && window.location.search.indexOf('splash=1') === -1) {
      splash.style.display = 'none';
      return;
    }

    // Lock page scrolling while splash is active
    document.body.style.overflow = 'hidden';

    // Create 3D image planes
    const planes = [];
    const width = window.innerWidth;
    const planeW = width < 768 ? Math.min(width * 0.34, 220) : Math.min(width * 0.28, 440);
    const planeH = planeW * (4 / 3);
    const offsetX = width * 0.35;
    const angle = 22;

    SPLASH_IMAGES.forEach((url, i) => {
      const plane = document.createElement('div');
      plane.className = 'nova-splash-plane';
      plane.style.width = planeW + 'px';
      plane.style.height = planeH + 'px';

      const isLeft = i % 2 === 0;
      const posX = isLeft ? -offsetX : offsetX;
      const rotY = isLeft ? angle : -angle;

      plane.dataset.x = posX;
      plane.dataset.rotY = rotY;
      plane.dataset.progress = String(i / TOTAL);

      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Nova Mart 3D Gallery Item';
      img.loading = 'eager';
      plane.appendChild(img);

      world.appendChild(plane);
      planes.push({ el: plane, img: img, startProgress: i / TOTAL });
    });

    // Animation Loop
    let startTime = performance.now();
    let animId = null;

    function render(now) {
      const elapsed = (now - startTime) % DURATION;
      const baseProgress = elapsed / DURATION;

      planes.forEach(item => {
        let p = (item.startProgress + baseProgress) % 1;
        let z = Z_FAR + p * RANGE;

        // Opacity curve
        let opacity = 1;
        if (p < 0.08) opacity = p / 0.08;
        else if (p > 0.94) opacity = (1 - p) / 0.06;

        const posX = item.el.dataset.x;
        const rotY = item.el.dataset.rotY;

        item.el.style.transform = `translate3d(-50%, -50%, 0) translate3d(${posX}px, 0, ${z.toFixed(1)}px) rotateY(${rotY}deg)`;
        item.img.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(3);
        item.el.style.zIndex = Math.round(p * 1000);
      });

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    // Auto-enter timer countdown (3 seconds)
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (timerLabel && countdown > 0) {
        timerLabel.textContent = `Auto-entering in ${countdown}s...`;
      } else if (countdown <= 0) {
        clearInterval(countdownInterval);
        dismissSplash();
      }
    }, 1000);

    function dismissSplash() {
      if (countdownInterval) clearInterval(countdownInterval);
      if (animId) cancelAnimationFrame(animId);

      splash.classList.add('hidden-splash');
      document.body.style.overflow = '';
      sessionStorage.setItem('nova_mart_splash_seen', '1');

      setTimeout(() => {
        splash.style.display = 'none';
      }, 850);
    }

    if (enterBtn) enterBtn.addEventListener('click', dismissSplash);
    if (skipBtn) skipBtn.addEventListener('click', dismissSplash);
  }
})();
