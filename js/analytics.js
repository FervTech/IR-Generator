// Analytics Page JavaScript
const userPlan = localStorage.getItem('userPlan') || 'free';
const isProUser = userPlan !== 'free';

document.addEventListener('DOMContentLoaded', () => {
  if (!isProUser) {
    document.getElementById('proLockOverlay').style.display = 'flex';
    document.getElementById('analyticsWrapper').classList.add('blurred');
  }
  initCharts();
});

function hideProLock() {
  document.getElementById('proLockOverlay').style.display = 'none';
  document.getElementById('analyticsWrapper').classList.remove('blurred');
  showToast('Preview mode - Upgrade to unlock full analytics', 'warning', 5000);
}

function initCharts() {
  // Revenue Trend Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        datasets: [{
          label: 'Revenue',
          data: [32000, 38000, 42000, 45000, 48000, 52000],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Target',
          data: [35000, 40000, 43000, 46000, 50000, 55000],
          borderColor: '#8b5cf6',
          borderDash: [5, 5],
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '₵' + (v/1000) + 'k' } }
        }
      }
    });
  }

  // Status Pie Chart
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Pending', 'Overdue', 'Draft'],
        datasets: [{
          data: [65, 20, 10, 5],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

function exportReport() {
  if (!isProUser) {
    showToast('Export feature is PRO only', 'warning');
    document.getElementById('proLockOverlay').style.display = 'flex';
    return;
  }
  showToast('Exporting analytics report...', 'info');
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('show'); }
function toggleNotifications() { showToast('No notifications', 'info'); }




// Add Analytics-specific styles
const style = document.createElement('style');
style.textContent = `

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .page-title-group h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: var(--text-secondary);
  }

  .page-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-secondary {
    padding: 0.9rem 1.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    color: var(--text-primary);
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all var(--transition-fast);
  }

  .btn-secondary:hover {
    border-color: var(--primary);
    background: var(--bg-tertiary);
  }

.pro-lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.pro-lock-content {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  text-align: center;
  border: 2px solid var(--primary);
  box-shadow: var(--shadow-xl);
}

.pro-lock-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  color: white;
}

.pro-lock-content h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.pro-lock-content p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.pro-features-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: left;
}

.pro-feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  font-weight: 500;
}

.pro-feature-item i {
  color: var(--success);
  font-size: 1.2rem;
}

.btn-upgrade-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.2rem 2.5rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.btn-upgrade-large:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
}

.btn-preview {
  display: inline-block;
  padding: 0.9rem 2rem;
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text-primary);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.btn-preview:hover {
  border-color: var(--primary);
  background: var(--bg-tertiary);
}

.analytics-wrapper.blurred {
  filter: blur(8px);
  pointer-events: none;
  user-select: none;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.kpi-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.kpi-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.kpi-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.kpi-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

.kpi-content { flex: 1; }
.kpi-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
.kpi-value { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--text-primary); margin-bottom: 0.5rem; }
.kpi-change { font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem; }
.kpi-change.positive { color: var(--success); }
.kpi-change.negative { color: var(--error); }

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
}

.chart-card.large { grid-column: span 1; }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.revenue { background: #6366f1; }
.legend-color.target { background: #8b5cf6; }

canvas {
  max-height: 300px !important;
}

.analytics-table-card {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analytics-table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table thead {
  background: var(--bg-tertiary);
}

.analytics-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.analytics-table td {
  padding: 1rem;
  border-top: 1px solid var(--border);
  color: var(--text-primary);
}

.trend-up { color: var(--success); }
.trend-down { color: var(--error); }
.trend-neutral { color: var(--text-tertiary); }

.date-range-select {
  padding: 0.7rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-body);
  cursor: pointer;
}

@media (max-width: 1024px) {
  .charts-grid { grid-template-columns: 1fr; }
  .pro-features-list { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .pro-lock-content { padding: 2rem 1.5rem; }
  .btn-upgrade-large { width: 100%; margin-bottom: 0.5rem; }
  .btn-preview { width: 100%; margin-left: 0; }
}
`;
document.head.appendChild(style);
