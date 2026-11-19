/**
 * home.js — Nova Mart Homepage JavaScript
 *
 * Responsibilities:
 *  - Hero particle animation
 *  - Flash-sale countdown timer
 *  - Load & render categories from /api/categories/
 *  - Load & render featured / trending / bestseller products
 *  - buildProductCard() exposed globally (window.buildProductCard)
 *    so product-list, search, and other pages can reuse it
 *  - addToCart() / toggleWishlist() handlers
 *  - Scroll-reveal animations (IntersectionObserver)
 */

'use strict';

/* ============================================================
   UTILITY — star rating HTML
   ============================================================ */
/**
 * Returns HTML string of filled / half / empty stars for a 0-5 rating.
 * @param {number} rating  — float 0–5
 * @returns {string}
 */
function starRatingHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '★'.repeat(full) +
    (half ? '½' : '') +
    '☆'.repeat(empty)
  );
}

/* ============================================================
   UTILITY — generic API call wrapper
   ============================================================ */
/**
 * Fetches JSON from a relative API path with CSRF cookie support.
 * Throws if the response is not OK.
 * @param {string} path   — e.g. '/api/products/featured/'
 * @param {object} [opts] — additional fetch options
 * @returns {Promise<any>}
 */
async function apiCall(path, opts = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    credentials: 'same-origin',
  };
  const response = await fetch(path, { ...defaults, ...opts });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

/* ============================================================
   PRODUCT CARD BUILDER  (globally exported)
   ============================================================ */
/**
 * Builds an HTML string for a single product card.
 * Uses Cart and Wishlist globals provided by base.js / main.js.
 *
 * @param {object} product — product data object from API
 * @returns {string} HTML
 */
function buildProductCard(product) {
  /* Badges */
  const discountBadge  = product.discount_percent > 0
    ? `<span class="badge badge-sale">-${product.discount_percent}%</span>`
    : '';
  const featuredBadge  = product.is_featured
    ? `<span class="badge badge-new">Featured</span>`
    : '';
  const trendingBadge  = product.is_trending
    ? `<span class="badge badge-trending">🔥 Trending</span>`
    : '';
  const bestsellerBadge = product.is_bestseller
    ? `<span class="badge badge-bestseller">⭐ Best Seller</span>`
    : '';

  /* Pricing */
  const displayPrice  = product.discount_price || product.price;
  const originalPrice = product.discount_price
    ? `<span class="price-original">₹${parseFloat(product.price).toLocaleString('en-IN')}</span>`
    : '';

  /* Rating */
  const stars = starRatingHTML(parseFloat(product.average_rating) || 0);

  /* Image */
  const imageUrl = product.image ? product.image : '/static/images/placeholder.jpg';

  /* Wishlist state */
  const isWishlisted = (typeof Wishlist !== 'undefined') ? Wishlist.has(product.id) : false;

  /* Out-of-stock guard */
  const outOfStock = product.stock === 0 || product.stock === '0';

  /* Random review count for social proof */
  const reviewCount = Math.floor(Math.random() * 200) + 10;

  return `
    <div class="product-card animate-on-scroll" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <a href="/product/${product.slug}/">
          <img
            src="${imageUrl}"
            alt="${product.name}"
            class="product-img"
            loading="lazy"
            onerror="this.src='/static/images/placeholder.jpg'"
          >
        </a>
        <div class="product-badges">
          ${discountBadge}${featuredBadge}${trendingBadge}${bestsellerBadge}
        </div>
        <button
          class="wishlist-btn ${isWishlisted ? 'wishlisted' : ''}"
          onclick="toggleWishlist(event, ${product.id})"
          title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
          aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
        >
          ${isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div class="product-info">
        <h3 class="product-name">
          <a href="/product/${product.slug}/">${product.name}</a>
        </h3>
        <p class="product-desc">${product.short_description || ''}</p>

        <div class="product-rating" aria-label="Rated ${product.average_rating || 0} out of 5">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${reviewCount})</span>
        </div>

        <div class="product-price">
          <span class="price-current">₹${parseFloat(displayPrice).toLocaleString('en-IN')}</span>
          ${originalPrice}
        </div>

        <div class="product-actions">
          <button
            class="btn btn-primary btn-sm add-to-cart-btn"
            onclick="addToCart(event, ${product.id})"
            ${outOfStock ? 'disabled' : ''}
            aria-label="${outOfStock ? 'Out of stock' : 'Add ' + product.name + ' to cart'}"
          >
            ${outOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
          <a href="/product/${product.slug}/" class="btn btn-secondary btn-sm">View</a>
        </div>
      </div>
    </div>
  `;
}

/* Export globally so other pages can call window.buildProductCard(...) */
window.buildProductCard = buildProductCard;

/* ============================================================
   SECTION LOADERS
   ============================================================ */

/**
 * Fetches categories from /api/categories/ and populates #categoriesGrid.
 */
async function loadCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  const categoryEmojis = {
    'electronics'  : '📱',
    'fashion'      : '👗',
    'home-living'  : '🏠',
    'sports'       : '⚽',
    'beauty'       : '💄',
    'books'        : '📚',
    'toys'         : '🧸',
    'grocery'      : '🛒',
    'automotive'   : '🚗',
    'health'       : '💊',
  };

  try {
    const data = await apiCall('/api/categories/');

    if (!data || !data.length) {
      grid.innerHTML = '<p class="text-center col-span-full">No categories found.</p>';
      return;
    }

    grid.innerHTML = data.map(cat => `
      <a href="/products/?category=${cat.slug}" class="category-card animate-on-scroll">
        <div class="category-icon">${categoryEmojis[cat.slug] || '🛍️'}</div>
        <h3 class="category-name">${cat.name}</h3>
        <span class="category-count">Shop Now →</span>
      </a>
    `).join('');

    /* Re-initialise scroll animations for newly inserted elements */
    initScrollAnimations();

  } catch (err) {
    console.error('Failed to load categories:', err);
    grid.innerHTML = `
      <div class="error-state col-span-full text-center">
        <p>⚠️ Could not load categories. <a href="/products/">Browse all products</a></p>
      </div>
    `;
  }
}

/**
 * Generic helper: fetch products from an endpoint and render into a container.
 * @param {string} endpoint — API path
 * @param {string} containerId — DOM element id
 * @param {string} emptyMsg — message when no products returned
 */
async function loadProducts(endpoint, containerId, emptyMsg) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const data = await apiCall(endpoint);

    if (!data || !data.length) {
      container.innerHTML = `<p class="text-center col-span-full">${emptyMsg}</p>`;
      return;
    }

    container.innerHTML = data.map(product => buildProductCard(product)).join('');
    initScrollAnimations();

  } catch (err) {
    console.error(`Failed to load products from ${endpoint}:`, err);
    container.innerHTML = `
      <div class="error-state col-span-full text-center">
        <p>⚠️ Failed to load products. <a href="/products/">Browse all</a></p>
      </div>
    `;
  }
}

/** Load Featured Products into #featuredProducts */
async function loadFeaturedProducts() {
  await loadProducts('/api/products/featured/', 'featuredProducts', 'No featured products at the moment.');
}

/** Load Trending Products into #trendingProducts */
async function loadTrendingProducts() {
  await loadProducts('/api/products/trending/', 'trendingProducts', 'No trending products right now.');
}

/** Load Bestseller Products into #bestsellerProducts */
async function loadBestsellerProducts() {
  await loadProducts('/api/products/bestsellers/', 'bestsellerProducts', 'No bestsellers found.');
}

/* ============================================================
   CART
   ============================================================ */
/**
 * Add a product to the cart.
 * Calls the global Cart helper from base.js.
 * @param {Event} event
 * @param {number} productId
 */
async function addToCart(event, productId) {
  event.preventDefault();
  const btn = event.currentTarget;

  const originalHTML = btn.innerHTML;
  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner-sm"></span> Adding…';

  try {
    if (typeof Cart === 'undefined') throw new Error('Cart not initialised');
    await Cart.add(productId, 1);

    btn.innerHTML = '✓ Added!';
    if (typeof Toast !== 'undefined') Toast.success('Added to cart! 🛒');

    setTimeout(() => {
      btn.disabled  = false;
      btn.innerHTML = originalHTML;
    }, 2000);

  } catch (err) {
    console.error('addToCart error:', err);
    if (typeof Toast !== 'undefined') Toast.error(err.message || 'Failed to add to cart');
    btn.disabled  = false;
    btn.innerHTML = originalHTML;
  }
}

/* Make addToCart globally accessible (used in inline onclick) */
window.addToCart = addToCart;

/* ============================================================
   WISHLIST
   ============================================================ */
/**
 * Toggle a product in / out of the wishlist.
 * Calls the global Wishlist helper from base.js.
 * @param {Event} event
 * @param {number} productId
 */
function toggleWishlist(event, productId) {
  event.preventDefault();
  event.stopPropagation();

  const btn = event.currentTarget;

  if (typeof Wishlist === 'undefined') {
    if (typeof Toast !== 'undefined') Toast.error('Please log in to use the wishlist');
    return;
  }

  const added = Wishlist.toggle(productId);
  btn.innerHTML = added ? '❤️' : '🤍';
  btn.classList.toggle('wishlisted', added);
  btn.title = added ? 'Remove from Wishlist' : 'Add to Wishlist';

  if (typeof Toast !== 'undefined') {
    if (added) {
      Toast.success('Added to wishlist ❤️');
    } else {
      Toast.info('Removed from wishlist');
    }
  }

  /* Update all buttons on the page that reference the same product */
  document.querySelectorAll(`.wishlist-btn[onclick*="${productId}"]`).forEach(b => {
    if (b !== btn) {
      b.innerHTML = added ? '❤️' : '🤍';
      b.classList.toggle('wishlisted', added);
    }
  });
}

/* Make toggleWishlist globally accessible */
window.toggleWishlist = toggleWishlist;

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
/**
 * Runs a live countdown to midnight (end of day flash sale).
 * Updates #hours, #minutes, #seconds every second.
 */
function startCountdown() {
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  function getEndTime() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }

  let endTime = getEndTime();

  function update() {
    const now  = new Date();
    let   diff = endTime - now;

    /* Roll over to next day if already past midnight */
    if (diff <= 0) {
      endTime = getEndTime();
      diff    = endTime - now;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    hoursEl.textContent   = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ============================================================
   HERO PARTICLES
   ============================================================ */
/**
 * Populates #heroParticles with 20 animated particle <div>s.
 * Each particle is positioned and timed randomly via inline style.
 * The actual CSS animation (float/fade) lives in base.css / components.css.
 */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const COUNT = 20;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size     = 4 + Math.random() * 8;          // 4–12 px
    const opacity  = 0.15 + Math.random() * 0.4;     // 0.15–0.55
    const duration = 3 + Math.random() * 4;           // 3–7 s
    const delay    = Math.random() * 3;               // 0–3 s

    p.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `top: ${Math.random() * 100}%`,
      `width: ${size}px`,
      `height: ${size}px`,
      `opacity: ${opacity.toFixed(2)}`,
      `animation-duration: ${duration.toFixed(2)}s`,
      `animation-delay: ${delay.toFixed(2)}s`,
    ].join(';');

    container.appendChild(p);
  }
}

/* ============================================================
   SCROLL ANIMATIONS (IntersectionObserver)
   ============================================================ */
/**
 * Observes every element with class .animate-on-scroll and adds
 * the class .visible when it enters the viewport (≥10% visible).
 * Safe to call multiple times — already-observed elements are skipped.
 */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll:not([data-observed])');

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10 }
  );

  targets.forEach(el => {
    el.setAttribute('data-observed', '1');
    observer.observe(el);
  });
}

/* ============================================================
   NEWSLETTER SUBSCRIPTION (bonus UX)
   ============================================================ */
/**
 * Handles the newsletter form if one exists on the page.
 * Expects a form with id="newsletterForm" and an email input.
 */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput || !emailInput.value.trim()) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

    try {
      await apiCall('/api/newsletter/subscribe/', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput.value.trim() }),
      });
      if (typeof Toast !== 'undefined') Toast.success('Subscribed successfully! 🎉');
      emailInput.value = '';
    } catch (err) {
      if (typeof Toast !== 'undefined') Toast.error('Could not subscribe. Please try again.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
    }
  });
}

/* ============================================================
   SMOOTH BACK-TO-TOP
   ============================================================ */
/**
 * Shows a #backToTop button (if present in base.html) after the user
 * scrolls 400 px, and scrolls back to the top on click.
 */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   HERO CTA MICRO-ANIMATION (number counter)
   ============================================================ */
/**
 * Animates the hero stats numbers from 0 to their target value
 * when the hero section is first visible.
 */
function animateHeroStats() {
  const stats = document.querySelectorAll('.hero-stats .stat strong');
  if (!stats.length) return;

  /* Parse the display value back to a usable number */
  const rawTargets = ['50000', '100000', '4.8'];
  const suffixes   = ['K+', 'K+', '★'];
  const isFloat    = [false, false, true];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      stats.forEach((el, i) => {
        const target   = parseFloat(rawTargets[i]);
        const suffix   = suffixes[i];
        const floating = isFloat[i];
        const duration = 1500; // ms
        const start    = performance.now();

        function tick(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          let   current  = target * eased;

          if (floating) {
            el.textContent = current.toFixed(1) + suffix;
          } else {
            const display = current >= 1000
              ? (current / 1000).toFixed(0) + suffix
              : Math.round(current) + suffix;
            el.textContent = display;
          }

          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    });
  }, { threshold: 0.5 });

  /* Observe the first stat element to trigger when hero is visible */
  if (stats[0]) observer.observe(stats[0]);
}

/* ============================================================
   PAGE INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  /* Synchronous / lightweight inits */
  initHeroParticles();
  startCountdown();
  initScrollAnimations();
  initBackToTop();
  initNewsletter();
  animateHeroStats();

  /* Parallel async section loads — UI shows skeletons while fetching */
  await Promise.all([
    loadCategories(),
    loadFeaturedProducts(),
    loadTrendingProducts(),
    loadBestsellerProducts(),
  ]);

  /* Re-run after all dynamic content is in the DOM */
  initScrollAnimations();
});
