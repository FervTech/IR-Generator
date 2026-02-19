// Create Invoice Page JavaScript
// ===============================

let itemCounter = 0;
let currentCurrencySymbol = '₵';
let selectedClientId = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeInvoiceForm();
  loadClients();

  updateBadgeCounts();
});

function initializeInvoiceForm() {
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('issueDate').value = today;

  // Calculate due date (30 days from now by default)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

  // Generate invoice number
  generateInvoiceNumber();

  // Add first item
  addInvoiceItem();

  // Load company info from settings
  loadCompanyInfo();
}

function generateInvoiceNumber() {
  const number = window.DataManager.generateInvoiceNumber();
  document.getElementById('invoiceNumber').value = number;
}

function loadCompanyInfo() {
  const settings = window.GlobalSettings?.settings?.general || {};
  // Company info is already stored in settings
}

function loadClients() {
  const clients = window.DataManager?.getClients() || [];
  const select = document.getElementById('clientSelect');

  if (!select) {
    console.warn('clientSelect element not found');
    return;
  }

  select.innerHTML = '<option value="">-- Select a client --</option>';

  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = `${client.name}${client.company ? ` (${client.company})` : ''}`;
    select.appendChild(option);
  });
}

function loadClientData() {
  const clientSelect = document.getElementById('clientSelect');
  const clientId = clientSelect.value;

  if (!clientId) {
    clearClientData();
    return;
  }

  const client = window.DataManager.getClientById(clientId);
  if (!client) return;

  selectedClientId = clientId;
  document.getElementById('clientName').value = client.name;
  document.getElementById('clientCompany').value = client.company || '';
  document.getElementById('clientEmail').value = client.email;
  document.getElementById('clientPhone').value = client.phone;
}

function clearClientData() {
  selectedClientId = null;
  document.getElementById('clientName').value = '';
  document.getElementById('clientCompany').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('clientPhone').value = '';
}

// ===== CLIENT MODAL =====

function openAddClientModal() {
  document.getElementById('addClientModal').style.display = 'flex';
  document.getElementById('newClientName').focus();
}

function closeAddClientModal() {
  document.getElementById('addClientModal').style.display = 'none';
  document.getElementById('addClientForm').reset();
}

function saveNewClient() {
  const name = document.getElementById('newClientName').value.trim();
  const company = document.getElementById('newClientCompany').value.trim();
  const email = document.getElementById('newClientEmail').value.trim();
  const phone = document.getElementById('newClientPhone').value.trim();
  const address = document.getElementById('newClientAddress').value.trim();

  if (!name || !email || !phone) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  try {
    const newClient = window.DataManager.createClient({
      name,
      company,
      email,
      phone,
      address
    });

    showToast('Client added successfully!', 'success');
    closeAddClientModal();
    loadClients();

    // Auto-select the new client
    document.getElementById('clientSelect').value = newClient.id;
    loadClientData();
  } catch (error) {
    showToast('Failed to add client', 'error');
    console.error(error);
  }
}

// ===== ITEMS MANAGEMENT =====

function addInvoiceItem() {
  itemCounter++;
  const tbody = document.getElementById('itemsTableBody');
  const row = document.createElement('tr');
  row.id = `item-row-${itemCounter}`;
  row.innerHTML = `
    <td>
      <input type="text" class="form-input item-description" placeholder="Item description" required>
    </td>
    <td>
      <input type="number" class="form-input item-quantity" value="1" min="1" step="1" onchange="calculateTotals()" required>
    </td>
    <td>
      <input type="number" class="form-input item-price" value="0" min="0" step="0.01" onchange="calculateTotals()" required>
    </td>
    <td>
      <span class="item-amount">${currentCurrencySymbol}0.00</span>
    </td>
    <td>
      <button type="button" class="btn-icon-danger" onclick="removeInvoiceItem(${itemCounter})" title="Remove item">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;
  tbody.appendChild(row);
  calculateTotals();
}

function removeInvoiceItem(id) {
  const row = document.getElementById(`item-row-${id}`);
  if (row) {
    row.remove();
    calculateTotals();

    // Ensure at least one item row exists
    const tbody = document.getElementById('itemsTableBody');
    if (tbody.children.length === 0) {
      addInvoiceItem();
    }
  }
}

// ===== CALCULATIONS =====

function calculateTotals() {
  let subtotal = 0;

  // Calculate subtotal from items
  const rows = document.querySelectorAll('#itemsTableBody tr');
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const amount = qty * price;

    const amountSpan = row.querySelector('.item-amount');
    if (amountSpan) {
      amountSpan.textContent = `${currentCurrencySymbol}${amount.toFixed(2)}`;
    }

    subtotal += amount;
  });

  // Calculate tax
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const taxAmount = subtotal * (taxRate / 100);

  // Calculate discount
  const discountInput = parseFloat(document.getElementById('discount').value) || 0;
  const discountType = document.getElementById('discountType').value;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = subtotal * (discountInput / 100);
  } else {
    discountAmount = Math.min(discountInput, subtotal + taxAmount);
  }

  // Calculate total
  const total = subtotal + taxAmount - discountAmount;

  // Update display
  document.getElementById('subtotalAmount').textContent = `${currentCurrencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('taxAmount').textContent = `${currentCurrencySymbol}${taxAmount.toFixed(2)}`;
  document.getElementById('discountAmount').textContent = `${currentCurrencySymbol}${discountAmount.toFixed(2)}`;
  document.getElementById('totalAmount').textContent = `${currentCurrencySymbol}${total.toFixed(2)}`;
}

function updateCurrency() {
  const currencySelect = document.getElementById('currency');
  const symbols = {
    'GHS': '₵',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'NGN': '₦'
  };
  currentCurrencySymbol = symbols[currencySelect.value] || '₵';
  calculateTotals();
}

// ===== FORM SUBMISSION =====

document.getElementById('createInvoiceForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  saveInvoice();
});

function saveInvoice(generatePDF = false) {
  // Validate form
  if (!validateInvoiceForm()) {
    return;
  }

  // Collect items
  const items = [];
  const rows = document.querySelectorAll('#itemsTableBody tr');
  rows.forEach(row => {
    const description = row.querySelector('.item-description')?.value;
    const qty = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;

    if (description && qty > 0 && price >= 0) {
      items.push({
        name: description,
        qty,
        price
      });
    }
  });

  if (items.length === 0) {
    showToast('Please add at least one item', 'error');
    return;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discountInput = parseFloat(document.getElementById('discount').value) || 0;
  const discountType = document.getElementById('discountType').value;
  const discountAmount = discountType === 'percent'
    ? subtotal * (discountInput / 100)
    : Math.min(discountInput, subtotal + taxAmount);
  const total = subtotal + taxAmount - discountAmount;

  // Get settings for company info
  const settings = window.GlobalSettings?.settings?.general || {};

  // Create invoice data
  const invoiceData = {
    number: document.getElementById('invoiceNumber').value,
    clientId: selectedClientId,
    clientName: document.getElementById('clientName').value,
    clientEmail: document.getElementById('clientEmail').value,
    clientPhone: document.getElementById('clientPhone').value,
    companyName: settings.companyName || 'My Company',
    companyContact: settings.companyPhone || '',
    companyLogo: settings.companyLogo || '',
    issueDate: document.getElementById('issueDate').value,
    dueDate: document.getElementById('dueDate').value,
    items,
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    total,
    status: document.getElementById('status').value,
    paymentMethod: document.getElementById('paymentMethod').value,
    currency: document.getElementById('currency').value,
    currencySymbol: currentCurrencySymbol,
    notes: document.getElementById('invoiceNotes').value
  };

  try {
    const savedInvoice = window.DataManager.createInvoice(invoiceData);
    showToast('Invoice saved successfully!', 'success');

    if (generatePDF) {
      generateInvoicePDF(savedInvoice);
    }

    setTimeout(() => {
      window.location.href = '/invoices.html';
    }, 1500);
  } catch (error) {
    showToast('Failed to save invoice', 'error');
    console.error(error);
  }
}

function saveAndGeneratePDF() {
  saveInvoice(true);
}

function validateInvoiceForm() {
  const clientName = document.getElementById('clientName').value.trim();
  const clientEmail = document.getElementById('clientEmail').value.trim();
  const clientPhone = document.getElementById('clientPhone').value.trim();
  const issueDate = document.getElementById('issueDate').value;
  const dueDate = document.getElementById('dueDate').value;

  if (!clientName || !clientEmail || !clientPhone) {
    showToast('Please fill all required client fields', 'error');
    return false;
  }

  if (!issueDate || !dueDate) {
    showToast('Please fill all required date fields', 'error');
    return false;
  }

  if (new Date(dueDate) < new Date(issueDate)) {
    showToast('Due date cannot be before issue date', 'error');
    return false;
  }

  return true;
}

// ===== PDF GENERATION =====

function generateInvoicePDF(invoice) {
  showToast('Generating PDF...', 'info');

  // Build HTML for PDF
  const pdfHTML = buildInvoicePDFHTML(invoice);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${invoice.number}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(pdfHTML).save().then(() => {
    showToast('PDF generated successfully!', 'success');
  }).catch(error => {
    console.error('PDF generation error:', error);
    showToast('Error generating PDF', 'error');
  });
}

function buildInvoicePDFHTML(invoice) {
  const itemsHTML = invoice.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">${item.qty}</td>
      <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${invoice.currencySymbol}${item.price.toFixed(2)}</td>
      <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${invoice.currencySymbol}${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 750px; padding: 20px; background: #ffffff;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
        <div>
          <h1 style="margin: 0 0 5px 0; font-size: 24px;">${invoice.companyName}</h1>
          <p style="margin: 0; color: #666;">Contact: ${invoice.companyContact}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0 0 5px 0; color: #6366f1;">INVOICE</h2>
          <p style="margin: 0;"><strong>Number:</strong> ${invoice.number}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${invoice.issueDate}</p>
          <p style="margin: 0;"><strong>Due:</strong> ${invoice.dueDate}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">Bill To:</h3>
        <p style="margin: 0; font-weight: bold;">${invoice.clientName}</p>
        <p style="margin: 0;">Email: ${invoice.clientEmail}</p>
        <p style="margin: 0;">Phone: ${invoice.clientPhone}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #333;">Description</th>
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #333;">Qty</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #333;">Price</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #333;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div style="text-align: right; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> ${invoice.currencySymbol}${invoice.subtotal.toFixed(2)}</p>
        ${invoice.taxAmount > 0 ? `<p style="margin: 5px 0;"><strong>Tax (${invoice.taxRate}%):</strong> ${invoice.currencySymbol}${invoice.taxAmount.toFixed(2)}</p>` : ''}
        ${invoice.discountAmount > 0 ? `<p style="margin: 5px 0;"><strong>Discount:</strong> -${invoice.currencySymbol}${invoice.discountAmount.toFixed(2)}</p>` : ''}
        <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;"><strong>Total:</strong> ${invoice.currencySymbol}${invoice.total.toFixed(2)}</p>
      </div>

      ${invoice.notes ? `<div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;"><p style="margin: 0;"><strong>Notes:</strong></p><p style="margin: 5px 0 0 0;">${invoice.notes}</p></div>` : ''}

      <div style="margin-top: 30px; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <p style="margin: 0; font-weight: bold;">Thank you for your business!</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Payment Method: ${invoice.paymentMethod}</p>
      </div>
    </div>
  `;
}

// ===== UTILITY FUNCTIONS =====

function resetInvoiceForm() {
  if (!confirm('Are you sure you want to reset the form? All data will be lost.')) {
    return;
  }

  document.getElementById('createInvoiceForm').reset();
  document.getElementById('itemsTableBody').innerHTML = '';
  itemCounter = 0;
  initializeInvoiceForm();
  showToast('Form reset', 'info');
}

function previewInvoice() {
  showToast('Preview feature coming soon!', 'info');
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('show');
  document.querySelector('.dashboard-main')?.classList.toggle('full-width');
}




function toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('show'); }
function toggleNotifications() { showToast('No notifications', 'info'); }



  function updateBadgeCounts() {
  const invoices = window.DataManager.getInvoices();
  const receipts = window.DataManager.getReceipts();

  const invoiceBadge = document.getElementById('invoiceCount');
  const receiptBadge = document.getElementById('receiptCount');

  if (invoiceBadge) invoiceBadge.textContent = invoices.length;
  if (receiptBadge) receiptBadge.textContent = receipts.length;
}


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

`;
document.head.appendChild(style);
