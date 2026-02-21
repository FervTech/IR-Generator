// Authentication JavaScript
// ========================

// User Database (Mock - Replace with real backend)
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
  },
  'demo@starter.com': {
    id: 'user_2',
    email: 'demo@starter.com',
    password: 'password123',
    firstName: 'Starter',
    lastName: 'User',
    plan: 'starter',
    invoiceCount: 0,
    maxInvoices: 200,
    createdAt: new Date().toISOString()
  },
  'demo@business.com': {
    id: 'user_3',
    email: 'demo@business.com',
    password: 'password123',
    firstName: 'Business',
    lastName: 'User',
    plan: 'business',
    invoiceCount: 0,
    maxInvoices: Infinity,
    createdAt: new Date().toISOString()
  }
};

// Plan Configurations
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxInvoices: 3,
    maxCompanies: 1,
    features: {
      emailSending: false,
      templates: false,
      recurring: false,
      analytics: false,
      teamAccess: false,
      apiAccess: false
    }
  },
  starter: {
    name: 'Starter',
    price: 30,
    maxInvoices: 200,
    maxCompanies: 1,
    features: {
      emailSending: true,
      templates: true,
      recurring: false,
      analytics: false,
      teamAccess: false,
      apiAccess: false
    }
  },
  business: {
    name: 'Business',
    price: 80,
    maxInvoices: Infinity,
    maxCompanies: 5,
    features: {
      emailSending: true,
      templates: true,
      recurring: true,
      analytics: true,
      teamAccess: true,
      apiAccess: false
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 300,
    maxInvoices: Infinity,
    maxCompanies: Infinity,
    features: {
      emailSending: true,
      templates: true,
      recurring: true,
      analytics: true,
      teamAccess: true,
      apiAccess: true
    }
  }
};

// ===== AUTHENTICATION FUNCTIONS =====

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  // Show loading
  const submitBtn = e.target.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('span');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    const user = USERS_DB[email];

    if (user && user.password === password) {
      // Successful login
      const userData = { ...user };
      delete userData.password;

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      showToast('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 1000);
    } else {
      // Failed login
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;

      showToast('Invalid email or password', 'error');
    }
  }, 1000);
}

function handleSignup(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const plan = document.getElementById('plan').value;

  // Validation
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (password.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }

  // Check if user already exists
  if (USERS_DB[email]) {
    showToast('Email already registered', 'error');
    return;
  }

  // Show loading
  const submitBtn = e.target.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('span');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    const planConfig = PLANS[plan];
    const newUser = {
      id: 'user_' + Date.now(),
      email,
      firstName,
      lastName,
      plan,
      invoiceCount: 0,
      maxInvoices: planConfig.maxInvoices,
      createdAt: new Date().toISOString()
    };

    // Store user
    USERS_DB[email] = { ...newUser, password };

    // Store in localStorage (without password)
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showToast('Account created successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '../pages/dashboard.html';
    }, 1000);
  }, 1000);
}

function signInWithGoogle() {
  showToast('Google Sign-In coming soon!', 'info');
  // In production, implement OAuth
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
    free: { email: 'demo@free.com', password: 'password123' },
    starter: { email: 'demo@starter.com', password: 'password123' },
    business: { email: 'demo@business.com', password: 'password123' }
  };

  const cred = credentials[planType];
  document.getElementById('email').value = cred.email;
  document.getElementById('password').value = cred.password;

  showToast(`Filled ${planType} plan credentials`, 'info');
}

// Password Strength Checker
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

  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Complexity
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
    window.location.href = '/login.html';
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

function hasFeature(featureName) {
  const plan = getUserPlan();
  return plan.features[featureName] || false;
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Password strength checker (signup page only)
  const passwordInput = document.getElementById('password');
  if (passwordInput && window.location.pathname.includes('signup')) {
    passwordInput.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
    });
  }

  // Auto-fill if remembered
  if (localStorage.getItem('rememberMe') === 'true') {
    const currentUser = getCurrentUser();
    if (currentUser && document.getElementById('email')) {
      document.getElementById('email').value = currentUser.email;
    }
  }
});

// Sign Out
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
  hasFeature,
  requireAuth,
  PLANS
};
