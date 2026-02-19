// Clients Page JavaScript - Enterprise Edition
// ====================================================

let filteredClients = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  updateStats();
});

// ===== LOAD & DISPLAY CLIENTS =====
function loadClients(page = currentPage) {
  const tbody = document.getElementById('clientsTableBody');
  if (!tbody) return;

  // Get real clients from DataManager (localStorage)
  const allClients = window.DataManager?.getClients() || [];

  // Apply current filters/search if any (filteredClients should already be set)
  const displayClients = filteredClients.length > 0 ? filteredClients : allClients;

  currentPage = page;

  if (displayClients.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="7">
          <div class="empty-state-content">
            <i class="fas fa-users"></i>
            <h3>No clients found</h3>
            <p>Add your first client to get started</p>
            <button class="btn-primary" onclick="openAddClientModal()">
              <i class="fas fa-plus"></i>Add Client
            </button>
          </div>
        </td>
      </tr>`;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const paginated = displayClients.slice(start, start + itemsPerPage);

  tbody.innerHTML = paginated.map(c => `
    <tr>
      <td><strong>${c.name || '—'}</strong></td>
      <td>${c.company || '—'}</td>
      <td>${c.email || '—'}</td>
      <td>${c.phone || '—'}</td>
      <td>${c.totalInvoices || 0}</td>
      <td><strong>₵${(c.totalSpent || 0).toFixed(2)}</strong></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewClient('${c.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn" onclick="createInvoiceForClient('${c.id}')" title="New Invoice">
            <i class="fas fa-file-invoice"></i>
          </button>
          <button class="action-btn" onclick="emailClient('${c.id}')" title="Email">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="action-btn" onclick="deleteClient('${c.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Optional: update pagination UI if you have prev/next buttons
  // updatePaginationControls(displayClients.length);
}

// ===== STATS UPDATE =====
function updateStats() {
  const clients = window.DataManager?.getClients() || [];

  const total = clients.length;
  const active = clients.filter(c => c.status !== 'inactive').length;
  const totalInvoices = clients.reduce((sum, c) => sum + (c.totalInvoices || 0), 0);
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const totalEl = document.getElementById('totalClientsCount');
  const activeEl = document.getElementById('activeClientsCount');
  const invoicesEl = document.getElementById('totalClientInvoices');
  const revenueEl = document.getElementById('totalClientRevenue');

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (invoicesEl) invoicesEl.textContent = totalInvoices;
  if (revenueEl) revenueEl.textContent = `₵${totalRevenue.toFixed(2)}`;
}

// ===== SEARCH =====
function searchClients() {
  const term = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();

  const allClients = window.DataManager?.getClients() || [];

  filteredClients = allClients.filter(c =>
    (c.name || '').toLowerCase().includes(term) ||
    (c.email || '').toLowerCase().includes(term) ||
    (c.company || '').toLowerCase().includes(term) ||
    (c.phone || '').includes(term)
  );

  currentPage = 1;
  loadClients();
}

// ===== FILTER & SORT =====
function filterClients() {
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const sortFilter   = document.getElementById('sortFilter')?.value   || 'name-asc';

  let clients = window.DataManager?.getClients() || [];

  // Status filter
  if (statusFilter !== 'all') {
    clients = clients.filter(c => c.status === statusFilter);
  }

  // Sorting
  if (sortFilter === 'name-asc') {
    clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortFilter === 'name-desc') {
    clients.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (sortFilter === 'invoices-desc') {
    clients.sort((a, b) => (b.totalInvoices || 0) - (a.totalInvoices || 0));
  } else if (sortFilter === 'spent-desc') {
    clients.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
  }

  filteredClients = clients;
  currentPage = 1;
  loadClients();
}

// ===== CLIENT ACTIONS =====
function viewClient(id) {
  showToast(`Viewing client ${id}... (detail page coming soon)`, 'info');
  // Future: window.location.href = `client-detail.html?id=${id}`;
}

function createInvoiceForClient(id) {
  window.location.href = `../partials/create-invoice.html?client=${id}`;
}

function emailClient(id) {
  showToast(`Emailing client ${id}...`, 'info');
  // Future: open mailto: or modal with email
}

function deleteClient(id) {
  if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) {
    return;
  }

  const success = window.DataManager?.deleteClient(id);

  if (success) {
    showToast('Client deleted successfully', 'success');
    // Reset filtered list and reload
    filteredClients = [];
    loadClients();
    updateStats();
  } else {
    showToast('Failed to delete client', 'error');
  }
}

// ===== ADD NEW CLIENT MODAL =====
function openAddClientModal() {
  const modal = document.getElementById('addClientModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('newClientName')?.focus();
  }
}

function closeAddClientModal() {
  const modal = document.getElementById('addClientModal');
  if (modal) {
    modal.style.display = 'none';
  }
  const form = document.getElementById('addClientForm');
  if (form) form.reset();
}

function saveNewClient() {
  const name    = document.getElementById('newClientName')?.value.trim();
  const company = document.getElementById('newClientCompany')?.value.trim();
  const email   = document.getElementById('newClientEmail')?.value.trim();
  const phone   = document.getElementById('newClientPhone')?.value.trim();
  const address = document.getElementById('newClientAddress')?.value.trim();

  if (!name || !phone) {
    showToast('Name and Phone are required fields', 'error');
    return;
  }

  try {
    const newClient = window.DataManager.createClient({
      name,
      company: company || '',
      email: email || '',
      phone,
      address: address || '',
      status: 'active',
      totalInvoices: 0,
      totalSpent: 0
    });

    showToast('Client added successfully!', 'success');
    closeAddClientModal();

    // Refresh everything
    filteredClients = []; // reset filter to show new client
    loadClients();
    updateStats();

  } catch (error) {
    showToast('Failed to add client. Please try again.', 'error');
    console.error('Add client error:', error);
  }
}

// ===== OTHER UTILITIES =====
function exportClients() {
  showToast('Exporting clients to CSV... (coming soon)', 'info');
  // Future: generate real CSV and download
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}

function toggleNotifications() {
  showToast('No notifications at this time', 'info');
}

// ===== PAGE-SPECIFIC STYLES (your original styles preserved) =====
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
  .filter-group select,
  .filter-group input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-family: var(--font-body);
    transition: all var(--transition-fast);
  }
  .filter-group select:focus,
  .filter-group input:focus {
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
  .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
  .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
  .stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
  .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  .stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
  .stat-details { flex: 1; }
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
  .receipts-table thead { background: var(--bg-tertiary); }
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
  .empty-state { text-align: center; }
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
    .filter-bar { flex-direction: column; }
    .filter-group { min-width: 100%; }
    .page-actions { width: 100%; }
    .btn-secondary, .btn-primary { flex: 1; }
    .receipts-stats { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(style);
