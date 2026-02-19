// Invoices Page - Full implementation similar to receipts
let INVOICES_DB = JSON.parse(localStorage.getItem('invoices')) || [
  {
    id: 'INV001',
    number: 'INV-2025-001',
    customerName: 'Acme Corp',
    customerContact: '+233 24 111 2222',
    issueDate: '2025-02-01',
    dueDate: '2025-02-15',
    amount: 5000.00,
    status: 'paid'
  },
  {
    id: 'INV002',
    number: 'INV-2025-002',
    customerName: 'Tech Solutions Ltd',
    customerContact: '+233 20 333 4444',
    issueDate: '2025-02-05',
    dueDate: '2025-02-19',
    amount: 3500.00,
    status: 'pending'
  },
  {
    id: 'INV003',
    number: 'INV-2025-003',
    customertName: 'Global Services',
    customerContact: '+233 27 555 6666',
    issueDate: '2025-01-20',
    dueDate: '2025-02-03',
    amount: 8200.00,
    status: 'overdue'
  }
];

let currentPage = 1;
const itemsPerPage = 10;
let filteredInvoices = [...INVOICES_DB];
let selectedInvoices = new Set();
let invoiceToDelete = null;

document.addEventListener('DOMContentLoaded', function() {
  loadInvoices();
  updateStats();
  setupDarkMode();
});

function loadInvoices() {
  const tableBody = document.getElementById('invoicesTableBody');
  if (!tableBody) return;

  if (filteredInvoices.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="8">
          <div class="empty-state-content">
            <i class="fas fa-file-invoice"></i>
            <h3>No invoices found</h3>
            <p>Create your first invoice or adjust your filters</p>
            <button class="btn-primary" onclick="window.location.href='/create-invoice.html'">
              <i class="fas fa-plus"></i>
              Create Invoice
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  tableBody.innerHTML = paginatedInvoices.map(inv => `
    <tr>
      <td><input type="checkbox" class="invoice-checkbox" data-id="${inv.id}" onchange="toggleInvoiceSelection('${inv.id}')"></td>
      <td><strong>${inv.number}</strong></td>
      <td>${inv.clientName}</td>
      <td>${formatDate(inv.issueDate)}</td>
      <td>${formatDate(inv.dueDate)}</td>
      <td><strong>₵${inv.amount.toFixed(2)}</strong></td>
      <td><span class="status-badge ${inv.status}">${inv.status.toUpperCase()}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewInvoice('${inv.id}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="action-btn" onclick="downloadInvoice('${inv.id}')" title="Download"><i class="fas fa-download"></i></button>
          <button class="action-btn" onclick="emailInvoice('${inv.id}')" title="Email"><i class="fas fa-envelope"></i></button>
          <button class="action-btn" onclick="deleteInvoice('${inv.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  updatePagination();
  updateInvoiceCount();
}

function updateStats() {
  const total = INVOICES_DB.length;
  const paid = INVOICES_DB.filter(i => i.status === 'paid').length;
  const pending = INVOICES_DB.filter(i => i.status === 'pending').length;
  const overdue = INVOICES_DB.filter(i => i.status === 'overdue').length;
  const totalAmount = INVOICES_DB.reduce((sum, i) => sum + i.amount, 0);

  document.getElementById('totalInvoicesCount').textContent = total;
  document.getElementById('paidInvoicesCount').textContent = paid;
  document.getElementById('pendingInvoicesCount').textContent = pending;
  document.getElementById('overdueInvoicesCount').textContent = overdue;
  document.getElementById('totalInvoicesAmount').textContent = `₵${totalAmount.toFixed(2)}`;
}

function filterInvoices() {
  const status = document.getElementById('statusFilter').value;
  const dateRange = document.getElementById('dateFilter').value;
  const sort = document.getElementById('sortFilter').value;

  filteredInvoices = INVOICES_DB.filter(inv => {
    if (status !== 'all' && inv.status !== status) return false;
    // Add date filtering logic here
    return true;
  });

  // Sorting
  filteredInvoices.sort((a, b) => {
    if (sort === 'date-desc') return new Date(b.issueDate) - new Date(a.issueDate);
    if (sort === 'date-asc') return new Date(a.issueDate) - new Date(b.issueDate);
    if (sort === 'amount-desc') return b.amount - a.amount;
    if (sort === 'amount-asc') return a.amount - b.amount;
    if (sort === 'duedate-asc') return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  currentPage = 1;
  loadInvoices();
}

function searchInvoices() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  filteredInvoices = INVOICES_DB.filter(inv =>
    inv.number.toLowerCase().includes(term) ||
    inv.clientName.toLowerCase().includes(term)
  );
  currentPage = 1;
  loadInvoices();
}

function viewInvoice(id) { window.location.href = `/invoice-detail.html?id=${id}`; }
function downloadInvoice(id) { showToast('Downloading invoice...', 'info'); }
function emailInvoice(id) { showToast('Sending invoice via email...', 'info'); }
function deleteInvoice(id) { invoiceToDelete = id; document.getElementById('deleteModal').style.display = 'flex'; }
function confirmDelete() {
  INVOICES_DB = INVOICES_DB.filter(i => i.id !== invoiceToDelete);
  localStorage.setItem('invoices', JSON.stringify(INVOICES_DB));
  closeDeleteModal();
  filterInvoices();
  updateStats();
  showToast('Invoice deleted', 'success');
}
function closeDeleteModal() { document.getElementById('deleteModal').style.display = 'none'; }

function toggleInvoiceSelection(id) {
  selectedInvoices.has(id) ? selectedInvoices.delete(id) : selectedInvoices.add(id);
  updateBulkActions();
}

function toggleSelectAll() {
  const checked = document.getElementById('selectAll').checked;
  document.querySelectorAll('.invoice-checkbox').forEach(cb => {
    cb.checked = checked;
    checked ? selectedInvoices.add(cb.dataset.id) : selectedInvoices.delete(cb.dataset.id);
  });
  updateBulkActions();
}

function updateBulkActions() {
  const bulkDiv = document.getElementById('bulkActions');
  const count = document.getElementById('selectedCount');
  if (selectedInvoices.size > 0) {
    bulkDiv.style.display = 'flex';
    count.textContent = selectedInvoices.size;
  } else {
    bulkDiv.style.display = 'none';
  }
}

function bulkDownload() { showToast(`Downloading ${selectedInvoices.size} invoices...`, 'info'); }
function bulkEmail() { showToast(`Emailing ${selectedInvoices.size} invoices...`, 'info'); }
function bulkMarkPaid() { showToast(`Marking ${selectedInvoices.size} as paid...`, 'success'); }
function bulkDelete() {
  if (!confirm(`Delete ${selectedInvoices.size} invoices?`)) return;
  INVOICES_DB = INVOICES_DB.filter(i => !selectedInvoices.has(i.id));
  localStorage.setItem('invoices', JSON.stringify(INVOICES_DB));
  selectedInvoices.clear();
  filterInvoices();
  updateStats();
  updateBulkActions();
  showToast('Invoices deleted', 'success');
}

function exportInvoices() { showToast('Exporting to CSV...', 'info'); }

function updatePagination() {
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="page-ellipsis">...</span>';
    }
  }
  document.getElementById('pageNumbers').innerHTML = html;
}

function previousPage() { if (currentPage > 1) { currentPage--; loadInvoices(); } }
function nextPage() {
  const total = Math.ceil(filteredInvoices.length / itemsPerPage);
  if (currentPage < total) { currentPage++; loadInvoices(); }
}
function goToPage(page) { currentPage = page; loadInvoices(); }

function updateInvoiceCount() {
  const badge = document.getElementById('invoiceCount');
  if (badge) badge.textContent = INVOICES_DB.length;
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}

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
    const btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function handleLogout() {
  if (confirm('Sign out?')) {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

document.addEventListener('click', e => {
  if (!document.querySelector('.user-menu')?.contains(e.target)) {
    document.getElementById('userDropdown')?.classList.remove('show');
  }
});

// Add invoices page specific styles
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

  .status-badge.draft {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-tertiary);
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

  .bulk-actions {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-secondary);
    border: 2px solid var(--primary);
    border-radius: 16px;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    box-shadow: var(--shadow-xl);
    z-index: 1000;
  }

  .bulk-info {
    font-weight: 600;
    color: var(--text-primary);
  }

  .bulk-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .btn-bulk {
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all var(--transition-fast);
    background: var(--primary);
    color: white;
  }

  .btn-bulk.danger {
    background: var(--error);
  }

  .btn-bulk:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .page-btn {
    padding: 0.7rem 1.2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all var(--transition-fast);
  }

  .page-btn:hover:not(:disabled) {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-numbers {
    display: flex;
    gap: 0.5rem;
  }

  .page-number {
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .page-number.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .page-number:hover:not(.active) {
    border-color: var(--primary);
  }

  .page-ellipsis {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
  }

  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    align-items: center;
    justify-content: center;
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
  }

  .modal-content {
    position: relative;
    background: var(--bg-secondary);
    border-radius: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: var(--shadow-xl);
    overflow: hidden;
  }

  .modal-header {
    background: linear-gradient(135deg, var(--error), #dc2626);
    color: white;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .modal-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .btn-danger {
    padding: 0.9rem 1.5rem;
    background: var(--error);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all var(--transition-fast);
  }

  .btn-danger:hover {
    background: #dc2626;
    transform: translateY(-2px);
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

    .bulk-actions {
      flex-direction: column;
      bottom: 1rem;
      padding: 1rem;
    }

    .bulk-buttons {
      width: 100%;
      flex-direction: column;
    }

    .btn-bulk {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(style);
