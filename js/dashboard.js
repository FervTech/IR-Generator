// Dashboard JavaScript
let INVOICES_DB = JSON.parse(localStorage.getItem('invoices')) || [];
let RECEIPTS_DB = JSON.parse(localStorage.getItem('receipts')) || [];
let CLIENTS_DB = JSON.parse(localStorage.getItem('clients')) || [];

document.addEventListener('DOMContentLoaded', function() {
  loadDashboardStats();
  loadRecentActivity();
  setupDarkMode();
});

// ===== DASHBOARD STATS =====
function loadDashboardStats() {
  const invoices = INVOICES_DB;
  const receipts = RECEIPTS_DB;
  const clients = CLIENTS_DB;

  const totalInvoices = invoices.length;
  const totalReceipts = receipts.length;
  const totalClients = clients.length;

  const invoiceRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0);

  const receiptRevenue = receipts.reduce((sum, rec) => sum + (rec.total || 0), 0);
  const totalRevenue = invoiceRevenue + receiptRevenue;

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

  const invoiceRevenueThisMonth = invoices
    .filter(inv => {
      const date = new Date(inv.issueDate || inv.date);
      return inv.status === 'paid' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + (inv.amount || inv.total || 0), 0);

  const receiptRevenueThisMonth = receipts
    .filter(rec => {
      const date = new Date(rec.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, rec) => sum + (rec.total || 0), 0);

  const revenueThisMonth = invoiceRevenueThisMonth + receiptRevenueThisMonth;

  // Update UI
  document.getElementById('totalInvoices').textContent = totalInvoices;
  document.getElementById('totalReceipts').textContent = totalReceipts;
  document.getElementById('totalClients').textContent = totalClients;
  document.getElementById('totalRevenue').textContent = `₵${totalRevenue.toFixed(2)}`;
  document.getElementById('invoicesThisMonth').textContent = invoicesThisMonth;
  document.getElementById('receiptsThisMonth').textContent = receiptsThisMonth;
  document.getElementById('newClients').textContent = '0';
  document.getElementById('revenueThisMonth').textContent = `₵${revenueThisMonth.toFixed(2)}`;

  // Update badges
  const invoiceCount = document.getElementById('invoiceCount');
  if (invoiceCount) invoiceCount.textContent = totalInvoices;

  const receiptCount = document.getElementById('receiptCount');
  if (receiptCount) receiptCount.textContent = totalReceipts;

  const clientCount = document.getElementById('clientCount');
  if (clientCount) clientCount.textContent = totalClients;
}

// ===== RECENT ACTIVITY (Invoices + Receipts) =====
function loadRecentActivity() {
  const tableBody = document.getElementById('invoicesTableBody');
  if (!tableBody) return;

  // Combine invoices and receipts with type flag and date
  const activities = [
    ...INVOICES_DB.map(inv => ({
      type: 'Invoice',
      id: inv.id,
      number: inv.number,
      clientName: inv.clientName || 'N/A',
      date: inv.issueDate || inv.date || inv.createdAt || new Date().toISOString(),
      amount: inv.amount || inv.total || 0,
      status: inv.status || 'draft'
    })),
    ...RECEIPTS_DB.map(rec => ({
      type: 'Receipt',
      id: rec.id,
      number: rec.number,
      clientName: rec.clientName || 'N/A',
      date: rec.date || rec.createdAt || new Date().toISOString(),
      amount: rec.total || 0,
      status: rec.status || 'paid'
    }))
  ];

  // Sort by date (newest first)
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Take most recent 10
  const recentActivities = activities.slice(0, 10);

  if (recentActivities.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="empty-state-content">
            <i class="fas fa-inbox"></i>
            <h3>No activity yet</h3>
            <p>Create your first invoice or receipt to get started</p>
            <button class="btn-primary" onclick="window.location.href='../partials/invoices.html'">
              <i class="fas fa-plus"></i> Create Invoice
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = recentActivities.map(activity => `
    <tr>
      <td><strong>#${activity.number}</strong></td>
      <td>${activity.type}</td>
      <td>${activity.clientName}</td>
      <td>${formatDate(activity.date)}</td>
      <td><strong>₵${activity.amount.toFixed(2)}</strong></td>
      <td><span class="status-badge ${activity.status}">${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewActivity('${activity.type}', '${activity.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="action-btn" onclick="downloadActivity('${activity.type}', '${activity.id}')" title="Download"><i class="fas fa-download"></i></button>
          <button class="action-btn" onclick="deleteActivity('${activity.type}', '${activity.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== ACTIVITY ACTIONS =====
function viewActivity(type, id) {
  if (type === 'Invoice') {
    window.location.href = `../partials/invoice-detail.html?id=${id}`;
  } else if (type === 'Receipt') {
    window.location.href = `../partials/receipt-detail.html?id=${id}`; // adjust URL if you have a receipt detail page
  }
}

function downloadActivity(type, id) {
  showToast(`Downloading ${type.toLowerCase()}...`, 'info');
  // You can add actual download logic later (PDF generation)
}

function deleteActivity(type, id) {
  if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return;

  if (type === 'Invoice') {
    INVOICES_DB = INVOICES_DB.filter(inv => inv.id !== id);
    localStorage.setItem('invoices', JSON.stringify(INVOICES_DB));
  } else if (type === 'Receipt') {
    RECEIPTS_DB = RECEIPTS_DB.filter(rec => rec.id !== id);
    localStorage.setItem('receipts', JSON.stringify(RECEIPTS_DB));
  }

  loadDashboardStats();
  loadRecentActivity();
  showToast(`${type} deleted successfully`, 'success');
}

// ===== UI INTERACTIONS ===== (unchanged)
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

document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

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
