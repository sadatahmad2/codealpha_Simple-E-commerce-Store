/**
 * NOVA MART - Product Detail Page JavaScript
 * Handles Image Gallery, Tabs, Quantity, Add to Cart, Buy Now, Reviews & Ratings
 */

'use strict';

let selectedReviewRating = 5;

// Image Gallery Switcher
function switchImage(thumb, src) {
  const mainImg = document.getElementById('mainImage');
  if (mainImg && src) {
    mainImg.src = src;
  }
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  if (thumb) thumb.classList.add('active');
}

// Quantity Adjuster
function changeQty(delta) {
  const input = document.getElementById('quantityInput');
  if (!input) return;

  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 99;
  let current = parseInt(input.value, 10) || 1;

  current = Math.max(min, Math.min(max, current + delta));
  input.value = current;
}

// Tab Switcher
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  const targetBtn = document.getElementById(`tabBtn${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  const targetContent = document.getElementById(`${tabName}Tab`);

  if (targetBtn) targetBtn.classList.add('active');
  if (targetContent) targetContent.classList.add('active');
}

// Add to Cart from Detail Page
async function addToCartDetail(productId) {
  const input = document.getElementById('quantityInput');
  const qty = input ? parseInt(input.value, 10) || 1 : 1;

  try {
    await Cart.add(productId, qty);
    Toast.success(`Added ${qty} item(s) to your cart! 🛒`);
  } catch (err) {
    Toast.error(err.message || 'Could not add to cart.');
  }
}

// Buy Now (Add to cart & redirect immediately to checkout)
async function buyNow(productId) {
  const input = document.getElementById('quantityInput');
  const qty = input ? parseInt(input.value, 10) || 1 : 1;

  try {
    await Cart.add(productId, qty);
    window.location.href = '/checkout/';
  } catch (err) {
    Toast.error(err.message || 'Could not process order.');
  }
}

// Wishlist on Detail Page
function toggleWishlistDetail(productId) {
  const added = Wishlist.toggle(productId);
  const btn = document.getElementById('wishlistDetailBtn');
  if (btn) {
    btn.innerHTML = added ? '❤️' : '🤍';
    btn.classList.toggle('wishlisted', added);
  }

  if (added) {
    Toast.success('Product saved to your wishlist! ❤️');
  } else {
    Toast.info('Removed from wishlist.');
  }
}

// Notify When Available
function notifyWhenAvailable() {
  Toast.info('You will be notified by email when this item is back in stock! 🔔');
}

// Interactive Star Rating for Reviews
function initReviewStars() {
  const stars = document.querySelectorAll('.star-input');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedReviewRating = parseInt(star.getAttribute('data-rating'), 10) || 5;
      updateReviewStarsUI(selectedReviewRating);
    });

    star.addEventListener('mouseenter', () => {
      const hoverRating = parseInt(star.getAttribute('data-rating'), 10) || 5;
      updateReviewStarsUI(hoverRating);
    });
  });

  const ratingContainer = document.getElementById('ratingInput');
  if (ratingContainer) {
    ratingContainer.addEventListener('mouseleave', () => {
      updateReviewStarsUI(selectedReviewRating);
    });
  }

  updateReviewStarsUI(selectedReviewRating);
}

function updateReviewStarsUI(rating) {
  document.querySelectorAll('.star-input').forEach(star => {
    const val = parseInt(star.getAttribute('data-rating'), 10);
    star.style.color = val <= rating ? '#FFB800' : '#CBD5E0';
  });
}

// Submit a New Review
async function submitReview(productId) {
  const commentEl = document.getElementById('reviewComment');
  const comment = commentEl ? commentEl.value.trim() : '';

  if (!comment) {
    Toast.warning('Please enter a review comment.');
    return;
  }

  try {
    await apiCall('/api/reviews/create/', 'POST', {
      product_id: productId,
      rating: selectedReviewRating,
      comment: comment
    });

    Toast.success('Thank you! Your review has been published. ⭐');
    if (commentEl) commentEl.value = '';
    loadReviews(productId);
  } catch (err) {
    Toast.error(err.message || 'Could not submit review. You may have already reviewed this product.');
  }
}

// Load Reviews for Product
async function loadReviews(productId) {
  const container = document.getElementById('reviewsList');
  if (!container || !productId) return;

  try {
    const reviews = await apiCall(`/api/reviews/?product_id=${productId}`);
    const count = reviews.length;

    const countElem = document.getElementById('reviewCount');
    const tabCountElem = document.getElementById('reviewTabCount');
    if (countElem) countElem.textContent = `(${count} reviews)`;
    if (tabCountElem) tabCountElem.textContent = count;

    if (count === 0) {
      container.innerHTML = '<p class="no-reviews" style="color:var(--text-secondary); padding: 20px 0;">No reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div class="review-card" style="padding: 16px 0; border-bottom: 1px solid var(--border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <strong>${r.user || 'Verified Buyer'}</strong>
          <span style="font-size:0.85rem; color:var(--text-light);">${formatDate(r.created_at)}</span>
        </div>
        <div style="margin-bottom: 8px;">${starRatingHTML(r.rating)}</div>
        <p style="color:var(--text-secondary); line-height:1.5;">${r.comment}</p>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Could not load reviews:', err);
  }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initReviewStars();

  const productIdMeta = document.querySelector('[data-product-id]');
  if (productIdMeta) {
    const pid = parseInt(productIdMeta.getAttribute('data-product-id'), 10);
    if (pid) {
      loadReviews(pid);
      if (Wishlist.has(pid)) {
        const btn = document.getElementById('wishlistDetailBtn');
        if (btn) {
          btn.innerHTML = '❤️';
          btn.classList.add('wishlisted');
        }
      }
    }
  }
});
