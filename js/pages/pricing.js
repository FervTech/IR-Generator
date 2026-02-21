// Pricing Page JavaScript
// =======================


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
    window.location.href = `../../pages/signup.html`;
    console.log(`Upgrading to ${planName} plan`);
  }, 1500);
}

// Contact Sales Function
function contactSales() {
  const message = 'Opening contact form...';


  // In a real app, this would open contact modal or redirect
  setTimeout(() => {
    // window.location.href = '/contact?inquiry=enterprise';
    console.log('Opening sales contact');
  }, 1500);
}




// Initialize on Page Load
document.addEventListener('DOMContentLoaded', function() {



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
