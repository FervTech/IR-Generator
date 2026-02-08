// Templates Page JavaScript
const userPlan = localStorage.getItem('userPlan') || 'free';
const isProUser = userPlan !== 'free';

const TEMPLATES = [
  { id: 1, name: 'Modern', category: 'business', description: 'Clean and professional modern design', rating: 4.9, isPro: true, popular: true, features: ['Clean layout', 'Bold typography', 'Color accents', 'Professional'] },
  { id: 2, name: 'Classic', category: 'business', description: 'Traditional business invoice style', rating: 4.7, isPro: false, popular: false, features: ['Traditional style', 'Easy to read', 'Conservative design', 'Time-tested'] },
  { id: 3, name: 'Minimal', category: 'minimal', description: 'Simple and elegant minimalist design', rating: 4.8, isPro: true, popular: true, features: ['Minimal design', 'Lots of whitespace', 'Focus on content', 'Elegant'] },
  { id: 4, name: 'Corporate', category: 'business', description: 'Corporate professional template', rating: 4.6, isPro: true, popular: false, features: ['Corporate feel', 'Structured layout', 'Brand-focused', 'Formal'] },
  { id: 5, name: 'Creative', category: 'creative', description: 'Colorful and creative invoice design', rating: 4.9, isPro: true, popular: true, features: ['Creative design', 'Colorful elements', 'Unique layout', 'Eye-catching'] },
  { id: 6, name: 'Elegant', category: 'minimal', description: 'Sophisticated elegant design', rating: 4.8, isPro: true, popular: false, features: ['Sophisticated', 'Refined typography', 'Subtle colors', 'Premium feel'] }
];

let filteredTemplates = [...TEMPLATES];
let selectedTemplate = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!isProUser) {
    document.getElementById('proLockOverlay').style.display = 'flex';
    document.getElementById('templatesWrapper').classList.add('blurred');
  }
  renderTemplates();
  setupDarkMode();
});

function hideProLock() {
  document.getElementById('proLockOverlay').style.display = 'none';
  document.getElementById('templatesWrapper').classList.remove('blurred');
  showToast('Preview mode - Upgrade to use premium templates', 'warning', 5000);
}

function renderTemplates() {
  const grid = document.getElementById('templatesGrid');
  grid.innerHTML = filteredTemplates.map(t => `
    <div class="template-card ${t.isPro && !isProUser ? 'locked' : ''}" onclick="openPreview(${t.id})">
      ${t.popular ? '<div class="template-badge popular">POPULAR</div>' : ''}
      ${t.isPro ? '<div class="template-badge pro">PRO</div>' : ''}
      <div class="template-preview">
        <div class="template-mockup" style="background: linear-gradient(135deg, ${getTemplateColor(t.id)})">
          <div class="mockup-header"></div>
          <div class="mockup-line"></div>
          <div class="mockup-line short"></div>
          <div class="mockup-table">
            <div class="mockup-row"></div>
            <div class="mockup-row"></div>
            <div class="mockup-row"></div>
          </div>
        </div>
        ${t.isPro && !isProUser ? '<div class="template-lock-icon"><i class="fas fa-lock"></i></div>' : ''}
      </div>
      <div class="template-info">
        <h3>${t.name}</h3>
        <p>${t.description}</p>
        <div class="template-meta">
          <div class="template-rating">
            <i class="fas fa-star"></i>${t.rating}
          </div>
          <div class="template-category">${t.category}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterByCategory(category) {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.category-btn').classList.add('active');

  filteredTemplates = category === 'all' ? [...TEMPLATES] : TEMPLATES.filter(t => t.category === category);
  renderTemplates();
}

function openPreview(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  if (template.isPro && !isProUser) {
    showToast('This is a PRO template. Upgrade to unlock!', 'warning');
    document.getElementById('proLockOverlay').style.display = 'flex';
    return;
  }

  selectedTemplate = template;
  document.getElementById('previewTemplateName').textContent = template.name;
  document.getElementById('previewTemplateDesc').textContent = template.description;
  document.getElementById('previewRating').textContent = template.rating;
  document.getElementById('previewFeatures').innerHTML = template.features.map(f => `<li><i class="fas fa-check"></i>${f}</li>`).join('');

  const preview = document.getElementById('templatePreviewContent');
  preview.style.background = `linear-gradient(135deg, ${getTemplateColor(templateId)})`;
  preview.innerHTML = '<div class="preview-text">Full preview available after selection</div>';

  document.getElementById('previewModal').style.display = 'flex';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
  selectedTemplate = null;
}

function useTemplate() {
  if (!selectedTemplate) return;

  if (selectedTemplate.isPro && !isProUser) {
    closePreview();
    document.getElementById('proLockOverlay').style.display = 'flex';
    showToast('Upgrade to PRO to use this template', 'warning');
    return;
  }

  localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
  showToast(`${selectedTemplate.name} template selected!`, 'success');
  setTimeout(() => {
    window.location.href = '/create-invoice.html';
  }, 1000);
}

function getTemplateColor(id) {
  const colors = ['#6366f1, #8b5cf6', '#10b981, #059669', '#f59e0b, #d97706', '#ef4444, #dc2626', '#ec4899, #db2777', '#8b5cf6, #7c3aed'];
  return colors[id % colors.length];
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

function showToast(msg, type = 'info', duration = 3000) {
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
  setTimeout(() => toast.remove(), duration);
}

// Add template-specific styles
const style = document.createElement('style');
style.textContent = `
.templates-wrapper.blurred { filter: blur(8px); pointer-events: none; }

.template-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.8rem 1.5rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.category-btn:hover, .category-btn.active {
  border-color: var(--primary);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  transform: translateY(-2px);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.template-card {
  background: var(--bg-glass);
  border: 2px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.template-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); border-color: var(--primary); }
.template-card.locked { opacity: 0.7; }

.template-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 10;
}

.template-badge.popular { background: linear-gradient(135deg, #ec4899, #db2777); color: white; }
.template-badge.pro { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; }

.template-preview {
  height: 300px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.template-mockup {
  width: 80%;
  height: 90%;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.mockup-header {
  height: 20px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.mockup-line {
  height: 12px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  margin-bottom: 0.5rem;
}

.mockup-line.short { width: 60%; }

.mockup-table {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-row {
  height: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.template-lock-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0,0,0,0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #fbbf24;
}

.template-info {
  padding: 1.5rem;
}

.template-info h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.template-info p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #fbbf24;
  font-weight: 600;
  font-size: 0.9rem;
}

.template-category {
  padding: 0.3rem 0.8rem;
  background: var(--bg-tertiary);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.template-preview-modal .modal-content {
  max-width: 900px;
  width: 95%;
}

.template-preview-body {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.template-preview-image {
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.template-preview-details h3 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.template-preview-details p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.template-preview-details .template-rating {
  margin-bottom: 1.5rem;
}

.template-features h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.template-features ul {
  list-style: none;
}

.template-features li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
}

.template-features li i {
  color: var(--success);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .templates-grid { grid-template-columns: 1fr; }
  .template-preview-body { grid-template-columns: 1fr; }
  .category-btn { flex: 1; justify-content: center; }
}
`;
document.head.appendChild(style);
