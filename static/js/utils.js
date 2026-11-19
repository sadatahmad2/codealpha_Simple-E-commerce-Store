/**
 * NOVA MART - Shared Utilities & Helper Functions
 * Pure Vanilla JavaScript
 */

// CSRF Token Helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function getCSRFToken() {
  return getCookie('csrftoken') || '';
}

// API Call Wrapper with Fetch API
async function apiCall(url, method = 'GET', data = null) {
  const headers = {
    'Accept': 'application/json',
  };

  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  if (isMutating) {
    headers['X-CSRFToken'] = getCSRFToken();
    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const options = {
    method: method.toUpperCase(),
    headers: headers,
    credentials: 'same-origin',
  };

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    
    let result = null;
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (result && typeof result === 'object' && (result.error || result.message || JSON.stringify(result))) 
        || `Request failed with status ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = result;
      throw err;
    }

    return result;
  } catch (error) {
    console.error(`API Error [${method} ${url}]:`, error);
    throw error;
  }
}

// Toast Notification System
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || '🔔'}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-visible');
    });

    // Auto-remove
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, duration);
  },

  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration) { this.show(msg, 'error', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },
  info(msg, duration) { this.show(msg, 'info', duration); },
};

// Currency Formatter (Indian Rupee formatting)
function formatPrice(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Date Formatter
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Star Rating SVG Generator
function starRatingHTML(rating, max = 5) {
  const r = Math.max(0, Math.min(max, parseFloat(rating) || 0));
  let stars = '';

  for (let i = 1; i <= max; i++) {
    if (i <= r) {
      stars += '<span class="star-filled" style="color:#FFB800;">★</span>';
    } else if (i - 0.5 <= r) {
      stars += '<span class="star-half" style="color:#FFB800;">★</span>';
    } else {
      stars += '<span class="star-empty" style="color:#E2E8F0;">★</span>';
    }
  }

  return `<span class="rating-stars" title="${r} out of ${max} stars">${stars}</span>`;
}

// Debounce Function
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Wishlist Manager (LocalStorage based)
const Wishlist = {
  key: 'nova_wishlist_items',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  },

  has(productId) {
    const id = parseInt(productId, 10);
    return this.get().includes(id);
  },

  toggle(productId) {
    const id = parseInt(productId, 10);
    let items = this.get();
    const index = items.indexOf(id);
    let added = false;

    if (index > -1) {
      items.splice(index, 1);
      added = false;
    } else {
      items.push(id);
      added = true;
    }

    localStorage.setItem(this.key, JSON.stringify(items));
    this.updateUI();
    return added;
  },

  updateUI() {
    const items = this.get();
    const badge = document.getElementById('wishlistCountBadge');
    if (badge) {
      badge.textContent = items.length;
      badge.style.display = items.length > 0 ? 'inline-flex' : 'none';
    }

    // Update any wishlist buttons on current page
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = parseInt(btn.getAttribute('data-wishlist-id'), 10);
      const isWishlisted = items.includes(id);
      btn.classList.toggle('wishlisted', isWishlisted);
      btn.setAttribute('aria-pressed', isWishlisted);
      const icon = btn.querySelector('.wishlist-icon');
      if (icon) {
        icon.textContent = isWishlisted ? '❤️' : '🤍';
      }
    });
  }
};

// Scroll Animation Trigger (Intersection Observer)
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

// Safe Placeholder Image Generator Data URI
function getPlaceholderImage(text = 'Nova Mart') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="100%" height="100%" fill="#F7F8FC"/>
    <circle cx="200" cy="180" r="70" fill="#E2E8F0"/>
    <path d="M190 145l-15 25h12l-5 25 22-30h-12z" fill="#6C63FF"/>
    <text x="200" y="290" font-family="-apple-system, sans-serif" font-size="18" font-weight="600" fill="#718096" text-anchor="middle">${text}</text>
    <text x="200" y="315" font-family="-apple-system, sans-serif" font-size="13" fill="#A0AEC0" text-anchor="middle">Premium Quality</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Default image error fallback
window.handleImageError = function (img, fallbackName = 'NOVA MART') {
  img.onerror = null;
  img.src = getPlaceholderImage(fallbackName);
};

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Wishlist.updateUI();
  initScrollAnimations();
});
