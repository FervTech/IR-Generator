// Pricing Page JavaScript
// =======================

// Dark Mode Toggle
function toggleDarkMode() {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    localStorage.setItem('darkMode', 'disabled');
  }
}

// Billing Toggle (Monthly/Annual)
function toggleBilling() {
  const isAnnual = document.getElementById('billingToggle').checked;

  // Toggle all monthly/annual prices
  document.querySelectorAll('.monthly-price').forEach(el => {
    el.style.display = isAnnual ? 'none' : 'flex';
  });

  document.querySelectorAll('.annual-price').forEach(el => {
    el.style.display = isAnnual ? 'flex' : 'none';
  });

  document.querySelectorAll('.monthly-usd').forEach(el => {
    el.style.display = isAnnual ? 'none' : 'block';
  });

  document.querySelectorAll('.annual-usd').forEach(el => {
    el.style.display = isAnnual ? 'block' : 'none';
  });
}

// Upgrade Plan Function
function upgradePlan(planName) {
  // Show toast or redirect to payment
  const message = `Redirecting to ${planName.charAt(0).toUpperCase() + planName.slice(1)} plan signup...`;
  showToast(message, 'info');

  // In a real app, this would redirect to payment page
  setTimeout(() => {
    window.location.href = `../auth/signup.html`;
    console.log(`Upgrading to ${planName} plan`);
  }, 1500);
}

// Contact Sales Function
function contactSales() {
  const message = 'Opening contact form...';
  showToast(message, 'info');

  // In a real app, this would open contact modal or redirect
  setTimeout(() => {
    // window.location.href = '/contact?inquiry=enterprise';
    console.log('Opening sales contact');
  }, 1500);
}

// Toast Notification (Simple version)
function showToast(message, type = 'info', duration = 3000) {
  // Check if toast container exists, if not create it
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${getToastIcon(type)}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    success: 'check-circle'
  };
  return icons[type] || 'info-circle';
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
  }

  // Set current year in footer
  const currentYear = new Date().getFullYear();
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = currentYear;
  }

  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections for animation
  document.querySelectorAll('.pricing-card, .faq-item, .comparison-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add click tracking (for analytics)
  document.querySelectorAll('.plan-button').forEach(button => {
    button.addEventListener('click', function() {
      const planName = this.closest('.pricing-card').querySelector('.plan-name').textContent;
      console.log(`Clicked plan: ${planName}`);

      // In a real app, send to analytics
      // gtag('event', 'plan_click', { plan_name: planName });
    });
  });
});

// Handle Plan Card Hover Effects
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.zIndex = '10';
  });

  card.addEventListener('mouseleave', function() {
    this.style.zIndex = '1';
  });
});

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
  // Escape key closes any modals (if implemented)
  if (e.key === 'Escape') {
    // Close modal logic here
  }
});

// Detect if user came from a specific source (UTM parameters)
const urlParams = new URLSearchParams(window.location.search);
const planParam = urlParams.get('plan');
if (planParam) {
  // Highlight the specific plan if coming from a link
  setTimeout(() => {
    const targetCard = document.querySelector(`[data-plan="${planParam}"]`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetCard.style.animation = 'pulse 1s ease-in-out 3';
    }
  }, 500);
}
