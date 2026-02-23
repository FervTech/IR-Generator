// Authentication JavaScript - WITH SANITIZER
// ===========================================

// User Database (Mock)
const USERS_DB = {
  'demo@free.com': {
    id: 'user_1',
    email: 'demo@free.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    plan: 'free',
    invoiceCount: 0,
    maxInvoices: 3,
    createdAt: new Date().toISOString()
  }
};

// Plan Configurations
const PLANS = {
  free: { name: 'Free', price: 0, maxInvoices: 3, maxCompanies: 1 },
  starter: { name: 'Starter', price: 30, maxInvoices: 200, maxCompanies: 1 },
  business: { name: 'Business', price: 80, maxInvoices: Infinity, maxCompanies: 5 },
  enterprise: { name: 'Enterprise', price: 300, maxInvoices: Infinity, maxCompanies: Infinity }
};

// ===== LOGIN (WITH SANITIZER) =====

function handleLogin(e) {
  e.preventDefault();

  // Sanitize inputs
  const email = IRSanitizer.sanitizeEmail(document.getElementById('email').value);
  const password = document.getElementById('password').value; // Don't sanitize password
  const rememberMe = document.getElementById('rememberMe').checked;

  if (!IRSanitizer.isValidEmail(email)) {
    showToast('Invalid email format', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('span');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  setTimeout(() => {
    const user = USERS_DB[email];

    if (user && user.password === password) {
      const userData = { ...user };
      delete userData.password;

      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      showToast('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 1000);
    } else {
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;

      showToast('Invalid email or password', 'error');
    }
  }, 1000);
}

// ===== SIGNUP (WITH SANITIZER) =====

function handleSignup(e) {
  e.preventDefault();

  // Collect raw data
  const rawUserData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    plan: document.getElementById('plan').value
  };

  // Sanitize names and email
  const cleanFirstName = IRSanitizer.sanitizePersonName(rawUserData.firstName);
  const cleanLastName = IRSanitizer.sanitizePersonName(rawUserData.lastName);
  const cleanEmail = IRSanitizer.sanitizeEmail(rawUserData.email);

  // Validate email
  if (!IRSanitizer.isValidEmail(cleanEmail)) {
    showToast('Invalid email format', 'error');
    return;
  }

  // Validate names
  if (!cleanFirstName || !cleanLastName) {
    showToast('Please provide valid first and last names', 'error');
    return;
  }

  // Validate passwords
  if (rawUserData.password !== rawUserData.confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (rawUserData.password.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }

  // Check if user exists
  if (USERS_DB[cleanEmail]) {
    showToast('Email already registered', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('span');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  setTimeout(() => {
    const planConfig = PLANS[rawUserData.plan];
    const newUser = {
      id: 'user_' + Date.now(),
      email: cleanEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      plan: rawUserData.plan,
      invoiceCount: 0,
      maxInvoices: planConfig.maxInvoices,
      createdAt: new Date().toISOString()
    };

    USERS_DB[cleanEmail] = { ...newUser, password: rawUserData.password };
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showToast('Account created successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '../pages/dashboard.html';
    }, 1000);
  }, 1000);
}

function signInWithGoogle() {
  showToast('Google Sign-In coming soon!', 'info');
}

// ===== UTILITY FUNCTIONS =====

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.toggle-password');
  const icon = button.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function fillDemoCredentials(planType) {
  const credentials = {
    free: { email: 'demo@free.com', password: 'password123' }
  };

  const cred = credentials[planType];
  document.getElementById('email').value = cred.email;
  document.getElementById('password').value = cred.password;

  showToast(`Filled ${planType} plan credentials`, 'info');
}

function checkPasswordStrength(password) {
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  if (!password) {
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = '0';
    strengthText.textContent = 'Enter password';
    return;
  }

  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 2) {
    strengthFill.className = 'strength-fill weak';
    strengthText.textContent = 'Weak password';
    strengthText.style.color = 'var(--error)';
  } else if (strength <= 4) {
    strengthFill.className = 'strength-fill medium';
    strengthText.textContent = 'Medium password';
    strengthText.style.color = 'var(--warning)';
  } else {
    strengthFill.className = 'strength-fill strong';
    strengthText.textContent = 'Strong password';
    strengthText.style.color = 'var(--success)';
  }
}

// ===== AUTHENTICATION CHECK =====

function requireAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '../pages/login.html';
    return null;
  }
  return JSON.parse(currentUser);
}

function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

function getUserPlan() {
  const user = getCurrentUser();
  return user ? PLANS[user.plan] : PLANS.free;
}

function canCreateInvoice() {
  const user = getCurrentUser();
  if (!user) return false;

  const plan = PLANS[user.plan];
  return user.invoiceCount < plan.maxInvoices;
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  const passwordInput = document.getElementById('password');
  if (passwordInput && window.location.pathname.includes('signup')) {
    passwordInput.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
    });
  }

  if (localStorage.getItem('rememberMe') === 'true') {
    const currentUser = getCurrentUser();
    if (currentUser && document.getElementById('email')) {
      document.getElementById('email').value = currentUser.email;
    }
  }
});

function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.removeItem('currentUser');
    showToast('Signing out...', 'info');
    setTimeout(() => {
      window.location.href = '../pages/login.html';
    }, 1000);
  }
}

// Export for use in other modules
window.AuthService = {
  getCurrentUser,
  getUserPlan,
  canCreateInvoice,
  requireAuth,
  PLANS
};
