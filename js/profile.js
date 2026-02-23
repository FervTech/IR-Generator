// Profile Page JavaScript - WITH SANITIZER
// =========================================
let profileData = JSON.parse(localStorage.getItem('userProfile')) || {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  phone: '+233 24 000 0000',
  bio: '',
  avatar: '',
  company: { name: 'My Company', regNumber: '', address: '', city: 'Accra', country: 'Ghana', website: '', taxId: '', logo: '' },
  preferences: { currency: 'GHS', dateFormat: 'MM/DD/YYYY', invoicePrefix: 'INV', emailNotifications: true }
};

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  setupDarkMode();
});

function loadProfile() {
  document.getElementById('firstName').value = profileData.firstName;
  document.getElementById('lastName').value = profileData.lastName;
  document.getElementById('email').value = profileData.email;
  document.getElementById('phone').value = profileData.phone;
  document.getElementById('bio').value = profileData.bio || '';
  if (profileData.avatar) {
    document.getElementById('avatarPreview').style.backgroundImage = `url(${profileData.avatar})`;
    document.getElementById('avatarPreview').innerHTML = '';
  }
  document.getElementById('companyName').value = profileData.company.name;
  document.getElementById('regNumber').value = profileData.company.regNumber || '';
  document.getElementById('address').value = profileData.company.address || '';
  document.getElementById('city').value = profileData.company.city;
  document.getElementById('country').value = profileData.company.country;
  document.getElementById('website').value = profileData.company.website || '';
  document.getElementById('taxId').value = profileData.company.taxId || '';
  document.getElementById('defaultCurrency').value = profileData.preferences.currency;
  document.getElementById('dateFormat').value = profileData.preferences.dateFormat;
  document.getElementById('invoicePrefix').value = profileData.preferences.invoicePrefix;
  document.getElementById('emailNotif').checked = profileData.preferences.emailNotifications;
}

function handleAvatarUpload() {
  const file = document.getElementById('avatarInput').files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('File size must be less than 2MB', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    profileData.avatar = e.target.result;
    document.getElementById('avatarPreview').style.backgroundImage = `url(${e.target.result})`;
    document.getElementById('avatarPreview').innerHTML = '';
    showToast('Avatar updated', 'success');
  };
  reader.readAsDataURL(file);
}

function removeAvatar() {
  profileData.avatar = '';
  document.getElementById('avatarPreview').style.backgroundImage = '';
  document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
  showToast('Avatar removed', 'info');
}

function handleLogoUpload() {
  const file = document.getElementById('logoInput').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileData.company.logo = e.target.result;
    document.getElementById('logoPreview').style.backgroundImage = `url(${e.target.result})`;
    document.getElementById('logoPreview').innerHTML = '';
    showToast('Logo uploaded', 'success');
  };
  reader.readAsDataURL(file);
}

function savePersonalInfo() {
  // SANITIZE inputs
  profileData.firstName = IRSanitizer.sanitizePersonName(document.getElementById('firstName').value);
  profileData.lastName = IRSanitizer.sanitizePersonName(document.getElementById('lastName').value);
  profileData.email = IRSanitizer.sanitizeEmail(document.getElementById('email').value);
  profileData.phone = IRSanitizer.sanitizePhone(document.getElementById('phone').value);
  profileData.bio = IRSanitizer.sanitizeText(document.getElementById('bio').value, 500);

  // Validate email
  if (profileData.email && !IRSanitizer.isValidEmail(profileData.email)) {
    showToast('Invalid email format', 'error');
    return;
  }
  // Validate phone
  if (profileData.phone && !IRSanitizer.isValidPhone(profileData.phone)) {
    showToast('Invalid phone number', 'error');
    return;
  }

  localStorage.setItem('userProfile', JSON.stringify(profileData));
  showToast('Personal information saved!', 'success');
}

function saveCompanyInfo() {
  // SANITIZE inputs
  profileData.company.name = IRSanitizer.sanitizeCompanyName(document.getElementById('companyName').value);
  profileData.company.regNumber = IRSanitizer.sanitizeText(document.getElementById('regNumber').value, 50);
  profileData.company.address = IRSanitizer.sanitizeAddress(document.getElementById('address').value);
  profileData.company.city = IRSanitizer.sanitizeText(document.getElementById('city').value, 100);
  profileData.company.country = IRSanitizer.sanitizeText(document.getElementById('country').value, 100);
  profileData.company.website = IRSanitizer.sanitizeURL(document.getElementById('website').value);
  profileData.company.taxId = IRSanitizer.sanitizeText(document.getElementById('taxId').value, 50);

  localStorage.setItem('userProfile', JSON.stringify(profileData));
  showToast('Company information saved!', 'success');
}

function savePreferences() {
  // SANITIZE inputs
  profileData.preferences.currency = IRSanitizer.sanitizeCurrency(document.getElementById('defaultCurrency').value);
  profileData.preferences.dateFormat = IRSanitizer.sanitizeText(document.getElementById('dateFormat').value, 20);
  profileData.preferences.invoicePrefix = IRSanitizer.sanitizeText(document.getElementById('invoicePrefix').value, 10);
  profileData.preferences.emailNotifications = document.getElementById('emailNotif').checked;

  localStorage.setItem('userProfile', JSON.stringify(profileData));
  showToast('Preferences saved!', 'success');
}

function changePassword() {
  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  if (!current || !newPass || !confirm) {
    showToast('Please fill all password fields', 'error');
    return;
  }
  if (newPass !== confirm) {
    showToast('New passwords do not match', 'error');
    return;
  }
  if (newPass.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }
  showToast('Password updated successfully!', 'success');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

function signOutAll() {
  if (!confirm('Sign out from all devices?')) return;
  showToast('Signed out from all devices', 'success');
  setTimeout(() => window.location.href = '/login.html', 2000);
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('themeBtn');
  const isDark = document.body.classList.contains('dark-mode');
  btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function setupDarkMode() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function handleLogout() {
  if (confirm('Sign out?')) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
  }
}

function showToast(msg, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle', success: 'check-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Add profile-specific styles
const style = document.createElement('style');
style.textContent = `
.profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 2rem; }
.profile-card { background: var(--bg-glass); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
.profile-card-header { background: var(--bg-tertiary); padding: 1.5rem; border-bottom: 1px solid var(--border); }
.profile-card-header h3 { font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; margin: 0; }
.profile-card-body { padding: 2rem; }
.profile-avatar-section { display: flex; gap: 2rem; align-items: center; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
.profile-avatar-large { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; background-size: cover; background-position: center; }
.avatar-upload-controls { display: flex; flex-direction: column; gap: 0.75rem; }
.btn-upload, .btn-remove { padding: 0.7rem 1.2rem; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-upload { background: var(--primary); color: white; }
.btn-upload:hover { background: var(--primary-dark); transform: translateY(-2px); }
.btn-remove { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); }
.btn-remove:hover { background: var(--error); color: white; }
.form-group.full-width { grid-column: 1 / -1; }
.btn-save { width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.3s; margin-top: 1.5rem; }
.btn-save:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.company-logo-section { margin-top: 1.5rem; }
.logo-upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.3s; }
.logo-upload-zone:hover { border-color: var(--primary); background: var(--bg-tertiary); }
.logo-preview-area { color: var(--text-tertiary); background-size: contain; background-repeat: no-repeat; background-position: center; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
.plan-info-box { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 2px solid var(--primary); border-radius: 12px; padding: 2rem; text-align: center; margin-bottom: 2rem; }
.plan-badge-large { display: inline-block; padding: 0.5rem 1.5rem; background: linear-gradient(135deg, var(--success), #059669); color: white; border-radius: 20px; font-weight: 700; margin-bottom: 1rem; }
.btn-upgrade-plan { display: inline-flex; align-items: center; gap: 0.75rem; padding: 0.9rem 2rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; margin-top: 1rem; transition: all 0.3s; }
.btn-upgrade-plan:hover { transform: translateY(-2px); }
.account-meta { display: flex; flex-direction: column; gap: 1rem; }
.meta-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
.preference-toggle { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 1rem; }
.toggle-switch { position: relative; width: 50px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-tertiary); border: 2px solid var(--border); transition: 0.3s; border-radius: 34px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background: white; transition: 0.3s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background: var(--primary); border-color: var(--primary); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }
.security-divider { height: 1px; background: var(--border); margin: 2rem 0; }
.session-list { margin: 1rem 0; }
.session-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 0.75rem; }
.session-item i { font-size: 1.5rem; color: var(--primary); }
.session-item div strong { display: block; margin-bottom: 0.25rem; }
.session-item div span { font-size: 0.85rem; color: var(--text-secondary); }
.btn-danger-outline { width: 100%; padding: 0.9rem; background: transparent; border: 2px solid var(--error); color: var(--error); border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s; }
.btn-danger-outline:hover { background: var(--error); color: white; }
.label-hint { display: block; font-size: 0.85rem; color: var(--text-secondary); font-weight: 400; margin-top: 0.25rem; }
@media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .profile-avatar-section { flex-direction: column; text-align: center; } }
`;
document.head.appendChild(style);
