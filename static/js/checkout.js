/**
 * NOVA MART - Checkout & Order Processing Script
 * Validates stock, calculates final server amounts, places orders
 */

'use strict';

let checkoutCart = [];

async function initCheckout() {
  const container = document.getElementById('checkoutItemsList');
  if (!container) return;

  checkoutCart = await Cart.load();

  if (!checkoutCart || checkoutCart.length === 0) {
    Toast.warning('Your shopping cart is empty! Redirecting to cart...');
    setTimeout(() => {
      window.location.href = '/cart/';
    }, 1500);
    return;
  }

  // Populate mini items list
  container.innerHTML = checkoutCart.map(item => {
    const img = item.image || getPlaceholderImage(item.name);
    return `
      <div class="mini-item-row">
        <img 
          src="${img}" 
          alt="${item.name}" 
          class="mini-item-img"
          onerror="handleImageError(this, '${item.name.replace(/'/g, "\\'")}')"
        >
        <div class="mini-item-info">
          <h5>${item.name}</h5>
          <span>Qty: ${item.quantity} &times; ${formatPrice(item.price)}</span>
        </div>
        <div class="mini-item-price">
          ${formatPrice(item.subtotal)}
        </div>
      </div>
    `;
  }).join('');

  // Update summary totals
  const subtotal = Cart.subtotal;
  const shipping = Cart.shippingCharge;
  const total = Cart.total;

  document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('checkoutShipping').innerHTML = shipping === 0 ? '<strong style="color:var(--accent);">FREE</strong>' : formatPrice(shipping);
  document.getElementById('checkoutTotal').textContent = formatPrice(total);
}

// Handle Place Order
async function handlePlaceOrder(event) {
  event.preventDefault();

  const btn = document.getElementById('placeOrderBtn');
  const originalText = btn.innerHTML;

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const shippingAddress = document.getElementById('shippingAddress').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();

  // Basic validations
  if (!fullName || !email || !phone || !shippingAddress || !city || !state || !pincode) {
    Toast.error('Please fill in all required shipping fields.');
    return;
  }

  // Disable button and show spinner
  btn.disabled = true;
  btn.innerHTML = '⏳ Processing Your Order...';

  const orderPayload = {
    full_name: fullName,
    email: email,
    phone: phone,
    shipping_address: shippingAddress,
    city: city,
    state: state,
    pincode: pincode,
    payment_method: 'cod',
  };

  try {
    const response = await apiCall('/api/checkout/', 'POST', orderPayload);

    if (response && response.order_number) {
      Toast.success('Order placed successfully! Redirecting...');
      // Clear local cart
      Cart.items = [];
      Cart.updateCartCount();
      // Redirect to confirmation page
      setTimeout(() => {
        window.location.href = `/orders/${response.order_number}/success/`;
      }, 1000);
    } else {
      throw new Error(response.message || 'Could not place order.');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    const msg = (err.data && (err.data.error || err.data.detail)) || err.message || 'Failed to place order. Please try again.';
    Toast.error(msg);
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});
