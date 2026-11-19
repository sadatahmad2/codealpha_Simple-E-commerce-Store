/**
 * NOVA MART - Shopping Cart Page Script
 * Pure Vanilla JavaScript
 */

'use strict';

let appliedDiscountPercent = 0;
let appliedCouponCode = '';

async function renderCart() {
  const container = document.getElementById('cartContentArea');
  const countBadge = document.getElementById('cartTotalItemsCount');
  if (!container) return;

  const items = await Cart.load();
  const totalCount = Cart.totalItemsCount;

  if (countBadge) {
    countBadge.textContent = totalCount > 0 ? `(${totalCount} item${totalCount > 1 ? 's' : ''})` : '';
  }

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state animate-on-scroll">
        <div class="empty-cart-icon">🛍️</div>
        <h2>Your Cart is Currently Empty</h2>
        <p style="color:var(--text-secondary); margin: 12px 0 24px;">Looks like you haven't added anything to your cart yet. Discover our premium deals and start shopping!</p>
        <a href="/products/" class="btn btn-primary btn-lg">Explore All Products &rarr;</a>
      </div>
    `;
    return;
  }

  const subtotal = Cart.subtotal;
  let discountAmount = 0;
  if (appliedDiscountPercent > 0) {
    discountAmount = (subtotal * appliedDiscountPercent) / 100;
  }
  const shipping = Cart.shippingCharge;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const itemsHtml = items.map(item => {
    const itemImg = item.image || getPlaceholderImage(item.name);
    return `
      <div class="cart-item-row" data-cart-id="${item.product_id}">
        <img 
          src="${itemImg}" 
          alt="${item.name}" 
          class="cart-item-img"
          onerror="handleImageError(this, '${item.name.replace(/'/g, "\\'")}')"
        >
        <div class="cart-item-info">
          <h4><a href="/products/">${item.name}</a></h4>
          <span class="cart-item-price">${formatPrice(item.price)} each</span>
        </div>
        <div class="qty-box">
          <button class="qty-btn" onclick="updateItemQuantity(${item.product_id}, ${item.quantity - 1})" aria-label="Decrease quantity">&minus;</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQuantity(${item.product_id}, ${item.quantity + 1})" aria-label="Increase quantity">&plus;</button>
        </div>
        <div class="cart-item-subtotal">
          ${formatPrice(item.subtotal)}
        </div>
        <button class="cart-item-del" onclick="removeItemFromCart(${item.product_id})" title="Remove item" aria-label="Remove item">&times;</button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cart-layout animate-on-scroll">
      
      <!-- Left: Cart Items List -->
      <div class="cart-items-wrapper">
        <div class="cart-items-table">
          ${itemsHtml}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 16px;">
          <a href="/products/" class="btn btn-secondary btn-sm">&larr; Continue Shopping</a>
          <button class="btn btn-outline btn-sm text-danger" onclick="clearFullCart()">Clear Cart</button>
        </div>
      </div>

      <!-- Right: Summary Card -->
      <div class="cart-summary-card">
        <h3>Order Summary</h3>
        
        <div class="summary-line">
          <span>Subtotal (${totalCount} items)</span>
          <span>${formatPrice(subtotal)}</span>
        </div>

        ${appliedDiscountPercent > 0 ? `
          <div class="summary-line" style="color:var(--accent);">
            <span>Coupon Discount (${appliedCouponCode} - ${appliedDiscountPercent}%)</span>
            <span>-${formatPrice(discountAmount)}</span>
          </div>
        ` : ''}

        <div class="summary-line">
          <span>Estimated Shipping</span>
          <span>${shipping === 0 ? '<strong style="color:var(--accent);">FREE</strong>' : formatPrice(shipping)}</span>
        </div>

        ${subtotal < 999 && subtotal > 0 ? `
          <div style="background:#FFF8E7; color:#B7791F; font-size:0.85rem; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
            🚚 Add <strong>${formatPrice(999 - subtotal)}</strong> more to unlock <strong>FREE Shipping!</strong>
          </div>
        ` : ''}

        <div class="summary-line summary-total">
          <span>Total Amount</span>
          <span style="color:var(--primary);">${formatPrice(total)}</span>
        </div>

        <!-- Coupon section -->
        <div class="coupon-box">
          <input type="text" id="couponInput" placeholder="Enter coupon code" value="${appliedCouponCode}">
          <button class="btn btn-secondary" onclick="applyCouponCode()">Apply</button>
        </div>

        <div style="margin-top: 20px;">
          <a href="/checkout/" class="btn btn-primary btn-lg btn-block" style="display:block; text-align:center; text-decoration:none;">
            Proceed to Checkout &rarr;
          </a>
        </div>

        <div style="margin-top: 16px; font-size: 0.85rem; color: var(--text-light); text-align: center; display: flex; justify-content: center; gap: 14px;">
          <span>🔒 Secure Checkout</span>
          <span>⚡ 100% Guaranteed</span>
        </div>
      </div>

    </div>
  `;
}

// Update Item Quantity
async function updateItemQuantity(productId, newQty) {
  try {
    await Cart.updateQuantity(productId, newQty);
    await renderCart();
  } catch (err) {
    Toast.error(err.message || 'Could not update quantity.');
  }
}

// Remove Single Item
async function removeItemFromCart(productId) {
  try {
    await Cart.remove(productId);
    Toast.info('Item removed from cart.');
    await renderCart();
  } catch (err) {
    Toast.error(err.message || 'Could not remove item.');
  }
}

// Clear Entire Cart
async function clearFullCart() {
  if (!confirm('Are you sure you want to clear your cart?')) return;
  try {
    await Cart.clear();
    Toast.info('Cart cleared.');
    await renderCart();
  } catch (err) {
    Toast.error('Could not clear cart.');
  }
}

// Apply Coupon
function applyCouponCode() {
  const input = document.getElementById('couponInput');
  const code = input ? input.value.trim().toUpperCase() : '';

  if (!code) {
    Toast.warning('Please enter a coupon code.');
    return;
  }

  if (code === 'NOVA10') {
    appliedDiscountPercent = 10;
    appliedCouponCode = 'NOVA10';
    Toast.success('Coupon NOVA10 applied! 10% discount added. 🎉');
    sessionStorage.setItem('nova_coupon', JSON.stringify({ code: 'NOVA10', percent: 10 }));
    renderCart();
  } else if (code === 'FLASH20') {
    appliedDiscountPercent = 20;
    appliedCouponCode = 'FLASH20';
    Toast.success('Coupon FLASH20 applied! 20% discount added. 🔥');
    sessionStorage.setItem('nova_coupon', JSON.stringify({ code: 'FLASH20', percent: 20 }));
    renderCart();
  } else {
    Toast.error('Invalid coupon code. Try NOVA10 or FLASH20!');
  }
}

// Load Recommendations for Cart Page
async function loadCartRecommendations() {
  const container = document.getElementById('cartRecommendedGrid');
  if (!container) return;

  try {
    const products = await apiCall('/api/products/trending/');
    const list = products.slice(0, 4);
    if (typeof buildProductCardItem === 'function') {
      container.innerHTML = list.map(buildProductCardItem).join('');
    } else {
      container.innerHTML = list.map(p => `
        <div class="product-card">
          <div class="product-image-wrap">
            <a href="/products/${p.slug}/">
              <img src="${p.image || getPlaceholderImage(p.name)}" alt="${p.name}" class="product-img">
            </a>
          </div>
          <div class="product-info">
            <h3 class="product-name"><a href="/products/${p.slug}/">${p.name}</a></h3>
            <div class="product-price">${formatPrice(p.discount_price || p.price)}</div>
            <button class="btn btn-primary btn-sm" onclick="Cart.add(${p.id}, 1).then(() => { Toast.success('Added to cart!'); renderCart(); })">Add to Cart</button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Could not load cart recommendations:', err);
  }
}

// Restore saved coupon on load
const savedCoupon = sessionStorage.getItem('nova_coupon');
if (savedCoupon) {
  try {
    const parsed = JSON.parse(savedCoupon);
    appliedCouponCode = parsed.code;
    appliedDiscountPercent = parsed.percent;
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  loadCartRecommendations();
});
