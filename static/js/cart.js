/**
 * NOVA MART - Shopping Cart State & Management
 * Communicates with backend session-based Cart API
 */

const Cart = {
  items: [],
  isLoading: false,

  // Load items from /api/cart/
  async load() {
    this.isLoading = true;
    try {
      const data = await apiCall('/api/cart/');
      this.items = (data && data.items) ? data.items : [];
      this.updateCartCount();
      return this.items;
    } catch (err) {
      console.warn('Could not load cart from backend:', err);
      return [];
    } finally {
      this.isLoading = false;
    }
  },

  // Add product to cart
  async add(productId, quantity = 1) {
    try {
      const response = await apiCall('/api/cart/', 'POST', {
        product_id: parseInt(productId, 10),
        quantity: parseInt(quantity, 10) || 1
      });

      // Reload cart state
      await this.load();

      // Dispatch custom event for reactive UI
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: this.items } }));

      return response;
    } catch (err) {
      const msg = (err.data && err.data.error) || err.message || 'Failed to add item to cart.';
      throw new Error(msg);
    }
  },

  // Update item quantity
  async updateQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10);
    try {
      if (qty <= 0) {
        return await this.remove(productId);
      }

      const response = await apiCall('/api/cart/', 'PUT', {
        product_id: parseInt(productId, 10),
        quantity: qty
      });

      await this.load();
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: this.items } }));
      return response;
    } catch (err) {
      const msg = (err.data && err.data.error) || err.message || 'Failed to update quantity.';
      throw new Error(msg);
    }
  },

  // Remove item from cart
  async remove(productId) {
    try {
      const response = await apiCall('/api/cart/', 'DELETE', {
        product_id: parseInt(productId, 10)
      });

      await this.load();
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: this.items } }));
      return response;
    } catch (err) {
      const msg = (err.data && err.data.error) || err.message || 'Failed to remove item.';
      throw new Error(msg);
    }
  },

  // Clear entire cart
  async clear() {
    try {
      await apiCall('/api/cart/', 'DELETE', {});
      this.items = [];
      this.updateCartCount();
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items: [] } }));
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  },

  // Computed Properties
  get totalItemsCount() {
    return this.items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  },

  get subtotal() {
    return this.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity, 10) || 0;
      return sum + (price * qty);
    }, 0);
  },

  get shippingCharge() {
    if (this.subtotal === 0) return 0;
    // Free shipping above ₹999
    return this.subtotal >= 999 ? 0 : 50;
  },

  get total() {
    return this.subtotal + this.shippingCharge;
  },

  // Update badge count in navbar
  updateCartCount() {
    const count = this.totalItemsCount;
    const badge = document.getElementById('cartCountBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    // Update any other elements with class .cart-count
    document.querySelectorAll('.cart-count').forEach(el => {
      if (el !== badge) {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    });
  }
};
