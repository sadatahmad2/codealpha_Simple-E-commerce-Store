/**
 * NOVA MART - Products Listing & Filter Page JS
 * Pure Vanilla JavaScript
 */

'use strict';

let productState = {
  currentPage: 1,
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  totalCount: 0,
  pageSize: 12,
};

// Parse URL Search Parameters on load
function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  productState.search = params.get('search') || '';
  productState.category = params.get('category') || '';
  productState.minPrice = params.get('min_price') || '';
  productState.maxPrice = params.get('max_price') || '';
  productState.sort = params.get('sort') || 'newest';
  productState.currentPage = parseInt(params.get('page') || '1', 10);
}

// Build API Query String
function buildAPIUrl() {
  const params = new URLSearchParams();
  if (productState.search) params.set('search', productState.search);
  if (productState.category) params.set('category', productState.category);
  if (productState.minPrice) params.set('min_price', productState.minPrice);
  if (productState.maxPrice) params.set('max_price', productState.maxPrice);
  if (productState.sort) params.set('sort', productState.sort);
  params.set('page', productState.currentPage);

  return '/api/products/?' + params.toString();
}

// Sync Browser URL
function syncURL() {
  const params = new URLSearchParams();
  if (productState.search) params.set('search', productState.search);
  if (productState.category) params.set('category', productState.category);
  if (productState.minPrice) params.set('min_price', productState.minPrice);
  if (productState.maxPrice) params.set('max_price', productState.maxPrice);
  if (productState.sort && productState.sort !== 'newest') params.set('sort', productState.sort);
  if (productState.currentPage > 1) params.set('page', productState.currentPage);

  const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.pushState({}, '', newUrl);
}

// Fetch & Display Products
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsInfo = document.getElementById('resultsInfo');
  const pagination = document.getElementById('pagination');

  if (!grid) return;

  // Show skeletons while loading
  grid.innerHTML = Array(8).fill(`
    <div class="product-card skeleton-card">
      <div class="skeleton" style="height: 220px; border-radius: 12px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px;"></div>
      <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 14px;"></div>
      <div class="skeleton" style="height: 36px; border-radius: 20px;"></div>
    </div>
  `).join('');

  try {
    const data = await apiCall(buildAPIUrl());
    const products = data.results || data;
    const count = data.count !== undefined ? data.count : products.length;
    productState.totalCount = count;

    if (products.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (pagination) pagination.innerHTML = '';
      if (resultsInfo) resultsInfo.textContent = 'No products found';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      grid.innerHTML = products.map(buildProductCardItem).join('');
      renderPagination(count);
      updateResultsInfo(count);
      initScrollAnimations();
      Wishlist.updateUI();
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = `
      <div class="error-msg" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p>⚠️ Failed to load products. Please check your connection.</p>
        <button class="btn btn-secondary btn-sm" onclick="loadProducts()">Try Again</button>
      </div>
    `;
  }
}

// Product Card HTML Builder
function buildProductCardItem(product) {
  const discountBadge = product.discount_percent > 0
    ? `<span class="badge badge-sale">-${product.discount_percent}%</span>`
    : '';
  const featuredBadge = product.is_featured
    ? `<span class="badge badge-new">Featured</span>`
    : '';
  const trendingBadge = product.is_trending
    ? `<span class="badge badge-trending">🔥 Trending</span>`
    : '';

  const displayPrice = product.discount_price || product.price;
  const originalPrice = product.discount_price
    ? `<span class="price-original">${formatPrice(product.price)}</span>`
    : '';

  const stars = starRatingHTML(product.average_rating || 0);
  const imageUrl = product.image ? product.image : getPlaceholderImage(product.name);
  const isWishlisted = Wishlist.has(product.id);
  const outOfStock = product.stock <= 0;

  return `
    <div class="product-card animate-on-scroll" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <a href="/products/${product.slug}/">
          <img 
            src="${imageUrl}" 
            alt="${product.name}" 
            class="product-img" 
            onerror="handleImageError(this, '${product.name.replace(/'/g, "\\'")}')"
            loading="lazy"
          >
        </a>
        <div class="product-badges">
          ${discountBadge}
          ${featuredBadge}
          ${trendingBadge}
        </div>
        <button 
          class="wishlist-btn ${isWishlisted ? 'wishlisted' : ''}" 
          data-wishlist-id="${product.id}"
          onclick="toggleWishlistAction(event, ${product.id})"
          aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
        >
          <span class="wishlist-icon">${isWishlisted ? '❤️' : '🤍'}</span>
        </button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category ? product.category.name : 'Store'}</span>
        <h3 class="product-name">
          <a href="/products/${product.slug}/">${product.name}</a>
        </h3>
        <p class="product-desc">${product.short_description || ''}</p>
        <div class="product-rating">
          ${stars}
          <span class="rating-count">(${product.average_rating || '5.0'})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(displayPrice)}</span>
          ${originalPrice}
        </div>
        <div class="product-actions">
          <button 
            class="btn btn-primary btn-sm add-to-cart-btn" 
            onclick="handleAddToCart(event, ${product.id})"
            ${outOfStock ? 'disabled' : ''}
          >
            ${outOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
          <a href="/products/${product.slug}/" class="btn btn-secondary btn-sm">View</a>
        </div>
      </div>
    </div>
  `;
}

// Add to Cart handler
async function handleAddToCart(event, productId) {
  event.preventDefault();
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>Adding...</span>';

  try {
    await Cart.add(productId, 1);
    Toast.success('Product added to your cart! 🛒');
    btn.innerHTML = '<span>✓ Added!</span>';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }, 1500);
  } catch (err) {
    Toast.error(err.message || 'Could not add to cart.');
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Wishlist Toggle
function toggleWishlistAction(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  const added = Wishlist.toggle(productId);
  if (added) {
    Toast.success('Saved to your wishlist! ❤️');
  } else {
    Toast.info('Removed from your wishlist.');
  }
}

// Load Categories into Sidebar Filters
async function loadCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  try {
    const categories = await apiCall('/api/categories/');
    let html = `
      <label class="filter-option ${!productState.category ? 'active' : ''}">
        <input type="radio" name="category" value="" ${!productState.category ? 'checked' : ''} onchange="filterByCategory('')">
        <span>All Categories</span>
      </label>
    `;

    categories.forEach(cat => {
      const isChecked = productState.category === cat.slug;
      html += `
        <label class="filter-option ${isChecked ? 'active' : ''}">
          <input type="radio" name="category" value="${cat.slug}" ${isChecked ? 'checked' : ''} onchange="filterByCategory('${cat.slug}')">
          <span>${cat.name}</span>
        </label>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.warn('Could not load categories:', err);
  }
}

// Filter Actions
function filterByCategory(slug) {
  productState.category = slug;
  productState.currentPage = 1;
  syncURL();
  loadProducts();
  updatePageHeader();
  loadCategoryFilters();
}

function applySort(val) {
  productState.sort = val;
  productState.currentPage = 1;
  syncURL();
  loadProducts();
}

function applyPriceFilter() {
  const min = document.getElementById('minPrice')?.value || '';
  const max = document.getElementById('maxPrice')?.value || '';
  productState.minPrice = min;
  productState.maxPrice = max;
  productState.currentPage = 1;
  syncURL();
  loadProducts();
}

function clearFilters() {
  productState = {
    currentPage: 1,
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    totalCount: 0,
    pageSize: 12,
  };

  const minInput = document.getElementById('minPrice');
  const maxInput = document.getElementById('maxPrice');
  const sortSel = document.getElementById('sortSelect');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  if (sortSel) sortSel.value = 'newest';

  syncURL();
  loadCategoryFilters();
  loadProducts();
  updatePageHeader();
}

function toggleFilterSidebar() {
  const sidebar = document.getElementById('filterSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// Pagination Controls
function renderPagination(totalCount) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(totalCount / productState.pageSize);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  if (productState.currentPage > 1) {
    html += `<button class="page-btn" onclick="goToPage(${productState.currentPage - 1})">&larr; Prev</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === productState.currentPage;
    html += `<button class="page-btn ${isActive ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (productState.currentPage < totalPages) {
    html += `<button class="page-btn" onclick="goToPage(${productState.currentPage + 1})">Next &rarr;</button>`;
  }

  container.innerHTML = html;
}

function goToPage(page) {
  productState.currentPage = page;
  syncURL();
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateResultsInfo(count) {
  const el = document.getElementById('resultsInfo');
  if (!el) return;

  const start = (productState.currentPage - 1) * productState.pageSize + 1;
  const end = Math.min(productState.currentPage * productState.pageSize, count);
  const searchPart = productState.search ? ` matching "<strong>${productState.search}</strong>"` : '';
  const categoryPart = productState.category ? ` in <strong>${productState.category}</strong>` : '';

  el.innerHTML = `Showing ${start}-${end} of ${count} products${searchPart}${categoryPart}`;
}

function updatePageHeader() {
  const title = document.querySelector('.page-title');
  if (!title) return;

  if (productState.search) {
    title.textContent = `Search results for "${productState.search}"`;
  } else if (productState.category) {
    const formatted = productState.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    title.textContent = formatted;
  } else {
    title.textContent = 'All Products';
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  parseURLParams();
  updatePageHeader();

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect && productState.sort) {
    sortSelect.value = productState.sort;
  }

  const minInput = document.getElementById('minPrice');
  const maxInput = document.getElementById('maxPrice');
  if (minInput && productState.minPrice) minInput.value = productState.minPrice;
  if (maxInput && productState.maxPrice) maxInput.value = productState.maxPrice;

  loadCategoryFilters();
  loadProducts();
});
