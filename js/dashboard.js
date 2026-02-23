// Dashboard JavaScript
// Mock data for demo - remove AuthService dependency for now
let INVOICES_DB = JSON.parse(localStorage.getItem('invoices')) || [];
let RECEIPTS_DB = JSON.parse(localStorage.getItem('receipts')) || [];
let CLIENTS_DB = JSON.parse(localStorage.getItem('clients')) || [];

document.addEventListener('DOMContentLoaded', function() {
  loadDashboardStats();
  loadRecentInvoices();
  setupDarkMode();
});

// ===== DASHBOARD STATS =====
function loadDashboardStats() {
  const invoices = INVOICES_DB;
  const receipts = RECEIPTS_DB;
  const clients = CLIENTS_DB;

  // Calculate total counts
  const totalInvoices = invoices.length;
  const totalReceipts = receipts.length;
  const totalClients = clients.length;

  // Calculate total revenue from paid invoices
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0);

  // Calculate this month's data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const invoicesThisMonth = invoices.filter(inv => {
    const date = new Date(inv.issueDate || inv.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const receiptsThisMonth = receipts.filter(rec => {
    const date = new Date(rec.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const revenueThisMonth = invoices
    .filter(inv => {
      const date = new Date(inv.issueDate || inv.date);
      return inv.status === 'paid' &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0);

  // Update UI
  document.getElementById('totalInvoices').textContent = totalInvoices;
  document.getElementById('totalReceipts').textContent = totalReceipts;
  document.getElementById('totalClients').textContent = totalClients;
  document.getElementById('totalRevenue').textContent = `₵${totalRevenue.toFixed(2)}`;

  document.getElementById('invoicesThisMonth').textContent = invoicesThisMonth;
  document.getElementById('receiptsThisMonth').textContent = receiptsThisMonth;
  document.getElementById('newClients').textContent = '0'; // Can be calculated if clients have dateAdded
  document.getElementById('revenueThisMonth').textContent = `₵${revenueThisMonth.toFixed(2)}`;

  // Update badges
  const invoiceCount = document.getElementById('invoiceCount');
  if (invoiceCount) invoiceCount.textContent = totalInvoices;

  const receiptCount = document.getElementById('receiptCount');
  if (receiptCount) receiptCount.textContent = totalReceipts;

  const clientCount = document.getElementById('clientCount');
  if (clientCount) clientCount.textContent = totalClients;
}

// ===== RECENT INVOICES =====
function loadRecentInvoices() {
  const invoices = INVOICES_DB;
  const tableBody = document.getElementById('invoicesTableBody');

  if (!tableBody) return;

  if (invoices.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="empty-state-content">
            <i class="fas fa-inbox"></i>
            <h3>No invoices yet</h3>
            <p>Create your first invoice to get started</p>
            <button class="btn-primary" onclick="window.location.href='../partials/invoices.html'">
              <i class="fas fa-plus"></i>
              Create Invoice
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Show recent 5 invoices
  const recentInvoices = invoices.slice(0, 5);

  tableBody.innerHTML = recentInvoices.map(invoice => `
    <tr>
      <td><strong>#${invoice.number}</strong></td>
      <td>${invoice.clientName}</td>
      <td>${formatDate(invoice.issueDate || invoice.date)}</td>
      <td><strong>₵${(invoice.amount || invoice.total || 0).toFixed(2)}</strong></td>
      <td><span class="status-badge ${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewInvoice('${invoice.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="action-btn" onclick="downloadInvoice('${invoice.id}')" title="Download"><i class="fas fa-download"></i></button>
          <button class="action-btn" onclick="deleteInvoice('${invoice.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== INVOICE ACTIONS =====
function viewInvoice(invoiceId) {
  window.location.href = `../partials/invoice-detail.html?id=${invoiceId}`;
}

function downloadInvoice(invoiceId) {
  showToast('Downloading invoice...', 'info');
}

function deleteInvoice(invoiceId) {
  if (!confirm('Are you sure you want to delete this invoice?')) return;

  INVOICES_DB = INVOICES_DB.filter(inv => inv.id !== invoiceId);
  localStorage.setItem('invoices', JSON.stringify(INVOICES_DB));

  loadDashboardStats();
  loadRecentInvoices();
  showToast('Invoice deleted successfully', 'success');
}

// ===== UI INTERACTIONS =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const dashboardMain = document.querySelector('.dashboard-main');
  if (sidebar) sidebar.classList.toggle('show');
  if (dashboardMain) dashboardMain.classList.toggle('full-width');
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

function toggleNotifications() {
  showToast('No new notifications', 'info');
}




// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');

  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Add status badge styles dynamically
const style = document.createElement('style');
style.textContent = `
  .status-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-badge.paid {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
  }

  .status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
  }

  .status-badge.overdue {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
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
`;
document.head.appendChild(style);
