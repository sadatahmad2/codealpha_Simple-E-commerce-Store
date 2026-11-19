/**
 * NOVA MART - User Dashboard JavaScript
 * Handles tab navigation, profile updates, address updates, and user order displays
 */

'use strict';

function switchDashboardTab(tabName, btnElem) {
  // Update sidebar active buttons
  document.querySelectorAll('.dash-nav-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElem) {
    btnElem.classList.add('active');
  } else {
    const defaultBtn = document.querySelector(`.dash-nav-btn[onclick*="${tabName}"]`);
    if (defaultBtn) defaultBtn.classList.add('active');
  }

  // Hide all panels, show target
  document.querySelectorAll('.dashboard-panel').forEach(panel => panel.classList.remove('active'));
  const targetId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const targetPanel = document.getElementById(targetId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Update URL hash
  window.location.hash = tabName;
}

// Update Profile
async function handleProfileUpdate(event) {
  event.preventDefault();
  const btn = document.getElementById('saveProfileBtn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const data = {
    first_name: document.getElementById('profFirstName').value.trim(),
    last_name: document.getElementById('profLastName').value.trim(),
    email: document.getElementById('profEmail').value.trim(),
    phone: document.getElementById('profPhone').value.trim(),
  };

  try {
    let endpoint = '/api/auth/profile/';
    try {
      await apiCall(endpoint, 'PUT', data);
    } catch (e) {
      await apiCall('/api/profile/', 'PUT', data);
    }
    Toast.success('Profile updated successfully! ✅');
  } catch (err) {
    console.error('Profile update error:', err);
    Toast.error(err.message || 'Could not update profile.');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

// Update Address
async function handleAddressUpdate(event) {
  event.preventDefault();
  const btn = document.getElementById('saveAddressBtn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const data = {
    address: document.getElementById('profAddress').value.trim(),
    city: document.getElementById('profCity').value.trim(),
    state: document.getElementById('profState').value.trim(),
    pincode: document.getElementById('profPincode').value.trim(),
  };

  try {
    let endpoint = '/api/auth/profile/';
    try {
      await apiCall(endpoint, 'PUT', data);
    } catch (e) {
      await apiCall('/api/profile/', 'PUT', data);
    }
    Toast.success('Shipping address saved! 📍');
  } catch (err) {
    console.error('Address update error:', err);
    Toast.error(err.message || 'Could not update address.');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

// Check URL Hash on Load
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash && ['orders', 'profile', 'address', 'settings'].includes(hash)) {
    switchDashboardTab(hash);
  }

  // Update wishlist stats
  const wishBadge = document.getElementById('statsWishlistCount');
  if (wishBadge && typeof Wishlist !== 'undefined') {
    wishBadge.textContent = Wishlist.get().length;
  }
});
