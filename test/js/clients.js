// Clients Page JavaScript
let CLIENTS_DB = JSON.parse(localStorage.getItem('clients')) || [
  { id: 'CLI001', name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '+233 24 111 2222', totalInvoices: 12, totalSpent: 45000, status: 'active' },
  { id: 'CLI002', name: 'Jane Smith', company: 'Tech Solutions', email: 'jane@techsol.com', phone: '+233 20 333 4444', totalInvoices: 8, totalSpent: 28000, status: 'active' },
  { id: 'CLI003', name: 'Bob Johnson', company: 'Global Services', email: 'bob@global.com', phone: '+233 27 555 6666', totalInvoices: 15, totalSpent: 67500, status: 'active' },
  { id: 'CLI004', name: 'Alice Williams', company: 'Creative Agency', email: 'alice@creative.com', phone: '+233 50 777 8888', totalInvoices: 5, totalSpent: 12000, status: 'inactive' },
  { id: 'CLI005', name: 'Charlie Brown', company: 'Marketing Pro', email: 'charlie@marketing.com', phone: '+233 55 999 0000', totalInvoices: 20, totalSpent: 95000, status: 'active' }
];

let filteredClients = [...CLIENTS_DB];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  updateStats();
  setupDarkMode();
});

function loadClients() {
  const tbody = document.getElementById('clientsTableBody');
  if (!tbody) return;

  if (filteredClients.length === 0) {
    tbody.innerHTML = `<tr class="empty-state"><td colspan="7"><div class="empty-state-content"><i class="fas fa-users"></i><h3>No clients found</h3><p>Add your first client to get started</p><button class="btn-primary" onclick="openAddClientModal()"><i class="fas fa-plus"></i>Add Client</button></div></td></tr>`;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filteredClients.slice(start, start + itemsPerPage);

  tbody.innerHTML = paginated.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.company || '-'}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.totalInvoices}</td>
      <td><strong>₵${c.totalSpent.toFixed(2)}</strong></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewClient('${c.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="action-btn" onclick="createInvoiceForClient('${c.id}')" title="New Invoice"><i class="fas fa-file-invoice"></i></button>
          <button class="action-btn" onclick="emailClient('${c.id}')" title="Email"><i class="fas fa-envelope"></i></button>
          <button class="action-btn" onclick="deleteClient('${c.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStats() {
  const total = CLIENTS_DB.length;
  const active = CLIENTS_DB.filter(c => c.status === 'active').length;
  const totalInvoices = CLIENTS_DB.reduce((sum, c) => sum + c.totalInvoices, 0);
  const totalRevenue = CLIENTS_DB.reduce((sum, c) => sum + c.totalSpent, 0);

  document.getElementById('totalClientsCount').textContent = total;
  document.getElementById('activeClientsCount').textContent = active;
  document.getElementById('totalClientInvoices').textContent = totalInvoices;
  document.getElementById('totalClientRevenue').textContent = `₵${totalRevenue.toFixed(2)}`;
}

function searchClients() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  filteredClients = CLIENTS_DB.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.email.toLowerCase().includes(term) ||
    c.company?.toLowerCase().includes(term) ||
    c.phone.includes(term)
  );
  currentPage = 1;
  loadClients();
}

function filterClients() {
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortFilter').value;

  filteredClients = CLIENTS_DB.filter(c => status === 'all' || c.status === status);

  if (sort === 'name-asc') filteredClients.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') filteredClients.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === 'invoices-desc') filteredClients.sort((a, b) => b.totalInvoices - a.totalInvoices);
  if (sort === 'spent-desc') filteredClients.sort((a, b) => b.totalSpent - a.totalSpent);

  currentPage = 1;
  loadClients();
}

function viewClient(id) { showToast('Opening client details...', 'info'); }
function createInvoiceForClient(id) { window.location.href = `/create-invoice.html?client=${id}`; }
function emailClient(id) { showToast('Opening email client...', 'info'); }
function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  CLIENTS_DB = CLIENTS_DB.filter(c => c.id !== id);
  localStorage.setItem('clients', JSON.stringify(CLIENTS_DB));
  filterClients();
  updateStats();
  showToast('Client deleted', 'success');
}

function openAddClientModal() { showToast('Add client modal - Coming soon!', 'info'); }
function exportClients() { showToast('Exporting clients to CSV...', 'info'); }

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('show'); }
function toggleNotifications() { showToast('No notifications', 'info'); }

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

// Add clients page specific styles
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

  .btn-primary {
    padding: 0.9rem 1.5rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all var(--transition-fast);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .filter-bar {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--bg-glass);
    border-radius: 16px;
    border: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .filter-group {
    flex: 1;
    min-width: 200px;
  }

  .filter-group label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group select {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: var(--font-body);
    transition: all var(--transition-fast);
  }

  .filter-group select:focus {
    outline: none;
    border-color: var(--primary);
  }

  .receipts-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-box {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    transition: all var(--transition-fast);
  }

  .stat-box:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }

  .stat-icon.blue {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  .stat-icon.green {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .stat-icon.orange {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  .stat-icon.purple {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  .stat-icon.red {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .stat-details {
    flex: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .stat-number {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 900;
    color: var(--text-primary);
    margin: 0;
  }

  .receipts-table-wrapper {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .receipts-table {
    width: 100%;
    border-collapse: collapse;
  }

  .receipts-table thead {
    background: var(--bg-tertiary);
  }

  .receipts-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .receipts-table td {
    padding: 1rem;
    border-top: 1px solid var(--border);
    color: var(--text-primary);
  }

  .empty-state {
    text-align: center;
  }

  .empty-state-content {
    padding: 4rem 2rem;
  }

  .empty-state-content i {
    font-size: 4rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
  }

  .empty-state-content h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .empty-state-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .table-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    .filter-bar {
      flex-direction: column;
    }

    .filter-group {
      min-width: 100%;
    }

    .page-actions {
      width: 100%;
    }

    .btn-secondary, .btn-primary {
      flex: 1;
    }

    .receipts-stats {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);
