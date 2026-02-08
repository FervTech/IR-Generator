// Settings Page JavaScript
let settings = JSON.parse(localStorage.getItem('appSettings')) || {
  general: { language: 'English', timezone: 'GMT (UTC+0)', dateFormat: 'MM/DD/YYYY', currency: 'GHS', numberFormat: '1,234.56' },
  invoice: { prefix: 'INV', numberFormat: 'INV-2025-001', paymentTerms: 'Net 30', taxRate: 15, dueDays: 30, autoSend: false },
  email: { notifications: true, invoiceSent: true, paymentReceived: true, overdueReminder: false, signature: '' },
  appearance: { theme: 'light', primaryColor: '#6366f1', fontSize: 'medium', compactMode: false },
  privacy: { dataRetention: '30 days', analytics: true }
};

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  loadSettings();
});

function loadSettings() {
  // Settings already loaded from localStorage on init
}

function showSection(section) {
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  event.target.closest('.settings-nav-item').classList.add('active');
}

function saveGeneralSettings() {
  showToast('General settings saved!', 'success');
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function saveInvoiceSettings() {
  showToast('Invoice settings saved!', 'success');
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function saveEmailSettings() {
  showToast('Email settings saved!', 'success');
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function saveAppearance() {
  showToast('Appearance settings saved!', 'success');
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function setTheme(theme) {
  document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.theme-option').classList.add('active');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else if (theme === 'light') {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-mode', prefersDark);
  }
  showToast('Theme updated', 'success');
}

function setColor(color) {
  document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
  event.target.classList.add('active');
  document.documentElement.style.setProperty('--primary', color);
  showToast('Color scheme updated', 'success');
}

function setFontSize(size) {
  document.querySelectorAll('.font-option').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const sizes = { small: '14px', medium: '16px', large: '18px' };
  document.documentElement.style.fontSize = sizes[size];
  showToast('Font size updated', 'success');
}

function exportAllData() {
  showToast('Preparing data export...', 'info');
  setTimeout(() => {
    showToast('Data exported successfully!', 'success');
  }, 2000);
}

function deleteAccount() {
  const confirmation = prompt('Type "DELETE" to confirm account deletion:');
  if (confirmation === 'DELETE') {
    showToast('Account deleted. Redirecting...', 'error');
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/';
    }, 2000);
  } else if (confirmation) {
    showToast('Incorrect confirmation. Account not deleted.', 'warning');
  }
}

function copyApiKey() {
  const input = document.querySelector('.api-key-display input');
  input.type = 'text';
  input.select();
  document.execCommand('copy');
  input.type = 'password';
  showToast('API key copied to clipboard', 'success');
}

function regenerateApiKey() {
  if (!confirm('Regenerate API key? This will invalidate the current key.')) return;
  showToast('API key regenerated', 'success');
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('show'); }

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

// Add settings-specific styles
const style = document.createElement('style');
style.textContent = `
.settings-layout { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; }
.settings-sidebar { background: var(--bg-glass); border: 1px solid var(--border); border-radius: 16px; padding: 1rem; height: fit-content; position: sticky; top: 100px; }
.settings-nav { display: flex; flex-direction: column; gap: 0.5rem; }
.settings-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; border-radius: 10px; color: var(--text-secondary); text-decoration: none; transition: all 0.3s; font-weight: 500; }
.settings-nav-item:hover, .settings-nav-item.active { background: var(--primary); color: white; }
.settings-content { flex: 1; }
.settings-section { display: none; }
.settings-section.active { display: block; }
.settings-section h2 { font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.settings-card { background: var(--bg-glass); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; }
.setting-item { margin-bottom: 1.5rem; }
.setting-item label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary); }
.setting-input, .setting-select, .setting-textarea { width: 100%; padding: 0.8rem 1rem; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: var(--font-body); transition: all 0.3s; }
.setting-input:focus, .setting-select:focus, .setting-textarea:focus { outline: none; border-color: var(--primary); }
.setting-toggle { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 1rem; }
.setting-hint { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; }
.toggle-switch { position: relative; width: 50px; height: 26px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-tertiary); border: 2px solid var(--border); transition: 0.3s; border-radius: 34px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background: white; transition: 0.3s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background: var(--primary); border-color: var(--primary); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }
.btn-save-settings { width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 1.5rem; transition: all 0.3s; }
.btn-save-settings:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.theme-options, .font-size-options { display: flex; gap: 1rem; margin-top: 0.5rem; }
.theme-option, .font-option { flex: 1; padding: 1rem; background: var(--bg-tertiary); border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s; font-weight: 600; }
.theme-option:hover, .font-option:hover { border-color: var(--primary); }
.theme-option.active, .font-option.active { background: var(--primary); color: white; border-color: var(--primary); }
.color-picker-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-top: 0.5rem; }
.color-option { width: 50px; height: 50px; border-radius: 10px; cursor: pointer; border: 3px solid transparent; transition: all 0.3s; }
.color-option:hover { transform: scale(1.1); }
.color-option.active { border-color: white; box-shadow: 0 0 0 3px var(--primary); }
.data-action { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 1rem; }
.data-action div p { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; }
.btn-action-secondary { padding: 0.7rem 1.5rem; background: var(--bg-secondary); border: 2px solid var(--border); color: var(--text-primary); border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-action-secondary:hover { border-color: var(--primary); background: var(--primary); color: white; }
.danger-zone { margin-top: 2rem; padding: 1.5rem; border: 2px solid var(--error); border-radius: 12px; background: rgba(239, 68, 68, 0.05); }
.danger-zone h3 { color: var(--error); font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.btn-danger { padding: 0.7rem 1.5rem; background: var(--error); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-danger:hover { background: #dc2626; transform: translateY(-2px); }
.integration-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px; margin-bottom: 1rem; }
.integration-info { display: flex; align-items: center; gap: 1rem; }
.integration-icon { font-size: 2rem; color: var(--primary); }
.integration-info div strong { display: block; margin-bottom: 0.25rem; }
.integration-info div p { font-size: 0.85rem; color: var(--text-secondary); }
.btn-connect { padding: 0.7rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-connect:hover { background: var(--primary-dark); transform: translateY(-2px); }
.btn-connect.pro-required { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.api-key-section { margin-top: 1.5rem; }
.api-key-display { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.api-key-display input { flex: 1; }
.btn-copy { padding: 0.8rem 1.2rem; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); border-radius: 10px; cursor: pointer; transition: all 0.3s; }
.btn-copy:hover { background: var(--primary); color: white; }
.btn-regenerate { margin-top: 1rem; padding: 0.7rem 1.2rem; background: var(--warning); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; }
.btn-regenerate:hover { background: #d97706; }
@media (max-width: 1024px) { .settings-layout { grid-template-columns: 1fr; } .settings-sidebar { position: relative; top: 0; } }
@media (max-width: 768px) { .theme-options, .font-size-options { flex-direction: column; } .color-picker-grid { grid-template-columns: repeat(3, 1fr); } .data-action, .integration-item { flex-direction: column; gap: 1rem; align-items: flex-start; } .btn-action-secondary, .btn-connect { width: 100%; justify-content: center; } }
`;
document.head.appendChild(style);
