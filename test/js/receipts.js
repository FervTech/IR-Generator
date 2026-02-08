// Receipts Page JavaScript
// ========================

// Mock Receipts Database
let RECEIPTS_DB = JSON.parse(localStorage.getItem('receipts')) || [
  {
    id: 'REC001',
    number: 'REC-2025-001',
    customerName: 'John Doe',
    customerContact: '+233 24 123 4567',
    date: '2025-02-05',
    amount: 1500.00,
    paymentMethod: 'Mobile Money',
    status: 'paid',
    items: [
      { name: 'Service Fee', qty: 1, price: 1500.00 }
    ]
  },
  {
    id: 'REC002',
    number: 'REC-2025-002',
    customerName: 'Jane Smith',
    customerContact: '+233 20 987 6543',
    date: '2025-02-04',
    amount: 2400.00,
    paymentMethod: 'Cash',
    status: 'paid',
    items: [
      { name: 'Product A', qty: 2, price: 1200.00 }
    ]
  }
];

let currentPage = 1;
const itemsPerPage = 10;
let filteredReceipts = [...RECEIPTS_DB];
let selectedReceipts = new Set();
let receiptToDelete = null;

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  loadReceipts();
  updateStats();
  setupDarkMode();
});

// ===== LOAD RECEIPTS =====

function loadReceipts() {
  const tableBody = document.getElementById('receiptsTableBody');
  if (!tableBody) return;

  if (filteredReceipts.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="8">
          <div class="empty-state-content">
            <i class="fas fa-receipt"></i>
            <h3>No receipts found</h3>
            <p>Try adjusting your filters or create a new receipt</p>
            <button class="btn-primary" onclick="window.location.href='/create-receipt.html'">
              <i class="fas fa-plus"></i>
              Create Receipt
            </button>
          </div>
        </td>
      </tr>
    `;
    updatePagination();
    return;
  }

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

  tableBody.innerHTML = paginatedReceipts.map(receipt => `
    <tr>
      <td>
        <input type="checkbox" class="receipt-checkbox"
               data-id="${receipt.id}"
               onchange="toggleReceiptSelection('${receipt.id}')">
      </td>
      <td>
        <strong>${receipt.number}</strong>
      </td>
      <td>${receipt.customerName}</td>
      <td>${formatDate(receipt.date)}</td>
      <td><strong>₵${receipt.amount.toFixed(2)}</strong></td>
      <td>
        <span class="payment-method">
          <i class="fas fa-${getPaymentIcon(receipt.paymentMethod)}"></i>
          ${receipt.paymentMethod}
        </span>
      </td>
      <td>
        <span class="status-badge ${receipt.status}">
          ${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewReceipt('${receipt.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn" onclick="downloadReceipt('${receipt.id}')" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="action-btn" onclick="emailReceipt('${receipt.id}')" title="Email">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="action-btn" onclick="deleteReceipt('${receipt.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  updatePagination();
  updateReceiptCount();
}

// ===== UPDATE STATS =====

function updateStats() {
  const paidReceipts = RECEIPTS_DB.filter(r => r.status === 'paid');
  const pendingReceipts = RECEIPTS_DB.filter(r => r.status === 'pending');
  const totalAmount = RECEIPTS_DB.reduce((sum, r) => sum + r.amount, 0);

  document.getElementById('paidReceiptsCount').textContent = paidReceipts.length;
  document.getElementById('pendingReceiptsCount').textContent = pendingReceipts.length;
  document.getElementById('totalReceiptsAmount').textContent = `₵${totalAmount.toFixed(2)}`;
}

function updateReceiptCount() {
  const badge = document.getElementById('receiptCount');
  if (badge) {
    badge.textContent = RECEIPTS_DB.length;
  }
}

// ===== FILTER RECEIPTS =====

function filterReceipts() {
  const statusFilter = document.getElementById('statusFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;

  // Filter by status
  filteredReceipts = RECEIPTS_DB.filter(receipt => {
    if (statusFilter === 'all') return true;
    return receipt.status === statusFilter;
  });

  // Filter by date
  const today = new Date();
  filteredReceipts = filteredReceipts.filter(receipt => {
    if (dateFilter === 'all') return true;

    const receiptDate = new Date(receipt.date);

    if (dateFilter === 'today') {
      return receiptDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return receiptDate >= weekAgo;
    } else if (dateFilter === 'month') {
      return receiptDate.getMonth() === today.getMonth() &&
        receiptDate.getFullYear() === today.getFullYear();
    } else if (dateFilter === 'year') {
      return receiptDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  // Sort
  filteredReceipts.sort((a, b) => {
    if (sortFilter === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortFilter === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortFilter === 'amount-desc') {
      return b.amount - a.amount;
    } else if (sortFilter === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  currentPage = 1;
  loadReceipts();
}

// ===== SEARCH RECEIPTS =====

function searchReceipts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  filteredReceipts = RECEIPTS_DB.filter(receipt => {
    return receipt.number.toLowerCase().includes(searchTerm) ||
      receipt.customerName.toLowerCase().includes(searchTerm) ||
      receipt.customerContact.toLowerCase().includes(searchTerm);
  });

  currentPage = 1;
  loadReceipts();
}

// ===== RECEIPT ACTIONS =====

function viewReceipt(receiptId) {
  window.location.href = `/receipt-detail.html?id=${receiptId}`;
}

function downloadReceipt(receiptId) {
  const receipt = RECEIPTS_DB.find(r => r.id === receiptId);
  if (!receipt) {
    showToast('Receipt not found', 'error');
    return;
  }

  showToast(`Downloading ${receipt.number}...`, 'info');
  // In real app, generate and download PDF
  setTimeout(() => {
    showToast('Receipt downloaded successfully!', 'success');
  }, 1500);
}

function emailReceipt(receiptId) {
  const receipt = RECEIPTS_DB.find(r => r.id === receiptId);
  if (!receipt) {
    showToast('Receipt not found', 'error');
    return;
  }

  showToast(`Sending ${receipt.number} to ${receipt.customerName}...`, 'info');
  // In real app, send email via API
  setTimeout(() => {
    showToast('Receipt emailed successfully!', 'success');
  }, 1500);
}

function deleteReceipt(receiptId) {
  receiptToDelete = receiptId;
  document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
  if (!receiptToDelete) return;

  RECEIPTS_DB = RECEIPTS_DB.filter(r => r.id !== receiptToDelete);
  localStorage.setItem('receipts', JSON.stringify(RECEIPTS_DB));

  closeDeleteModal();
  filterReceipts();
  updateStats();
  showToast('Receipt deleted successfully', 'success');

  receiptToDelete = null;
}

function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  receiptToDelete = null;
}

function exportReceipts() {
  showToast('Exporting receipts to CSV...', 'info');
  // In real app, generate CSV export
  setTimeout(() => {
    showToast('Receipts exported successfully!', 'success');
  }, 1000);
}

// ===== SELECTION =====

function toggleReceiptSelection(receiptId) {
  if (selectedReceipts.has(receiptId)) {
    selectedReceipts.delete(receiptId);
  } else {
    selectedReceipts.add(receiptId);
  }

  updateBulkActions();
}

function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.receipt-checkbox');

  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
    const receiptId = checkbox.getAttribute('data-id');

    if (selectAllCheckbox.checked) {
      selectedReceipts.add(receiptId);
    } else {
      selectedReceipts.delete(receiptId);
    }
  });

  updateBulkActions();
}

function updateBulkActions() {
  const bulkActions = document.getElementById('bulkActions');
  const selectedCount = document.getElementById('selectedCount');

  if (selectedReceipts.size > 0) {
    bulkActions.style.display = 'flex';
    selectedCount.textContent = selectedReceipts.size;
  } else {
    bulkActions.style.display = 'none';
  }
}

// ===== BULK ACTIONS =====

function bulkDownload() {
  showToast(`Downloading ${selectedReceipts.size} receipt(s)...`, 'info');
  setTimeout(() => {
    showToast('Receipts downloaded successfully!', 'success');
    selectedReceipts.clear();
    updateBulkActions();
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.receipt-checkbox').forEach(cb => cb.checked = false);
  }, 1500);
}

function bulkEmail() {
  showToast(`Emailing ${selectedReceipts.size} receipt(s)...`, 'info');
  setTimeout(() => {
    showToast('Receipts emailed successfully!', 'success');
    selectedReceipts.clear();
    updateBulkActions();
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.receipt-checkbox').forEach(cb => cb.checked = false);
  }, 1500);
}

function bulkDelete() {
  if (!confirm(`Are you sure you want to delete ${selectedReceipts.size} receipt(s)? This cannot be undone.`)) {
    return;
  }

  RECEIPTS_DB = RECEIPTS_DB.filter(r => !selectedReceipts.has(r.id));
  localStorage.setItem('receipts', JSON.stringify(RECEIPTS_DB));

  selectedReceipts.clear();
  filterReceipts();
  updateStats();
  updateBulkActions();

  document.getElementById('selectAll').checked = false;
  showToast('Receipts deleted successfully', 'success');
}

// ===== PAGINATION =====

function updatePagination() {
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Update buttons
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;

  // Generate page numbers
  let pagesHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pagesHTML += `
        <button class="page-number ${i === currentPage ? 'active' : ''}"
                onclick="goToPage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pagesHTML += '<span class="page-ellipsis">...</span>';
    }
  }

  pageNumbers.innerHTML = pagesHTML;
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    loadReceipts();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadReceipts();
  }
}

function goToPage(page) {
  currentPage = page;
  loadReceipts();
}

// ===== UI INTERACTIONS =====

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const dashboardMain = document.querySelector('.dashboard-main');

  if (sidebar) {
    sidebar.classList.toggle('show');
  }

  if (dashboardMain) {
    dashboardMain.classList.toggle('full-width');
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function toggleNotifications() {
  showToast('No new notifications', 'info');
}

function toggleDarkMode() {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', 'disabled');
  }
}

function setupDarkMode() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.removeItem('currentUser');
    showToast('Signing out...', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1000);
  }
}

// ===== UTILITY FUNCTIONS =====

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getPaymentIcon(method) {
  const icons = {
    'Mobile Money': 'mobile-alt',
    'Cash': 'money-bill-wave',
    'Card': 'credit-card',
    'Bank Transfer': 'university',
    'Cheque': 'file-invoice-dollar'
  };
  return icons[method] || 'money-bill-wave';
}

function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${getToastIcon(type)}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    success: 'check-circle'
  };
  return icons[type] || 'info-circle';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');

  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Add additional styles for receipts page
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

  .payment-method {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
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
