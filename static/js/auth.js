/**
 * NOVA MART - Authentication Scripts (Login & Register)
 * Handles client validation, password strength, and API authentication
 */

'use strict';

// Toggle Password Field Visibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// Password Strength Meter
function evaluatePasswordStrength(password) {
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  if (!fill) return;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let width = '25%';
  let color = '#EF4444';
  let label = 'Weak';

  if (score === 2) {
    width = '50%';
    color = '#F59E0B';
    label = 'Fair';
  } else if (score === 3) {
    width = '75%';
    color = '#3B82F6';
    label = 'Good';
  } else if (score >= 4) {
    width = '100%';
    color = '#10B981';
    label = 'Strong';
  }

  fill.style.width = width;
  fill.style.backgroundColor = color;
  if (text) {
    text.textContent = `Strength: ${label}`;
    text.style.color = color;
  }
}

// Handle User Login
async function handleUserLogin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const btn = document.getElementById('loginBtn');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    Toast.error('Please enter both username and password.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Signing in...';

  try {
    const data = await apiCall('/api/auth/login/', 'POST', {
      username: username,
      password: password
    });

    if (data.success) {
      Toast.success(`Welcome back, ${data.user.username}! 🎉`);
      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get('next') || '/';
      setTimeout(() => {
        window.location.href = nextUrl;
      }, 800);
    } else {
      throw new Error(data.message || 'Login failed.');
    }
  } catch (err) {
    console.error('Login error:', err);
    let msg = 'Invalid username or password.';
    if (err.data && err.data.errors) {
      msg = Object.values(err.data.errors).flat().join(' ');
    } else if (err.message) {
      msg = err.message;
    }
    Toast.error(msg);
    btn.disabled = false;
    btn.innerHTML = 'Sign In &rarr;';
  }
}

// Handle User Registration
async function handleUserRegister(event) {
  event.preventDefault();

  const btn = document.getElementById('registerBtn');
  const firstName = document.getElementById('regFirstName')?.value.trim() || '';
  const lastName = document.getElementById('regLastName')?.value.trim() || '';
  const username = document.getElementById('regUsername')?.value.trim() || '';
  const email = document.getElementById('regEmail')?.value.trim() || '';
  const phone = document.getElementById('regPhone')?.value.trim() || '';
  const password = document.getElementById('regPassword')?.value || '';
  const password2 = document.getElementById('regPassword2')?.value || '';

  if (!username || !email || !password || !password2) {
    Toast.error('Please fill in all required fields.');
    return;
  }

  if (password !== password2) {
    Toast.error('Passwords do not match.');
    return;
  }

  if (password.length < 8) {
    Toast.error('Password must be at least 8 characters long.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Creating Account...';

  try {
    const response = await apiCall('/api/auth/register/', 'POST', {
      first_name: firstName,
      last_name: lastName,
      username: username,
      email: email,
      phone: phone,
      password: password,
      password2: password2
    });

    if (response.success) {
      Toast.success('Account created successfully! Logging you in...');
      // Auto login after registration
      try {
        await apiCall('/api/auth/login/', 'POST', { username, password });
        setTimeout(() => { window.location.href = '/'; }, 1000);
      } catch (loginErr) {
        setTimeout(() => { window.location.href = '/login/'; }, 1200);
      }
    } else {
      throw new Error(response.message || 'Registration failed.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    let msg = 'Could not create account.';
    if (err.data && err.data.errors) {
      msg = Object.values(err.data.errors).flat().join(' ');
    } else if (err.message) {
      msg = err.message;
    }
    Toast.error(msg);
    btn.disabled = false;
    btn.innerHTML = 'Create My Account &rarr;';
  }
}
