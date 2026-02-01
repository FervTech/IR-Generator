let itemCounter = 0;
let logoDataUrl = '';

// Toast Notification Function
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${getToastIcon(type)}"></i>
    <span>${message}</span>
  `;

  const container = document.getElementById('toastContainer');
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  switch(type) {
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    case 'info': return 'info-circle';
    case 'success': return 'check-circle';
    default: return 'info-circle';
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      logoDataUrl = e.target.result;
      const previewImg = document.getElementById('logoPreviewImg');
      const previewContainer = document.getElementById('logoPreview');

      previewImg.src = logoDataUrl;
      previewContainer.style.display = 'block';
      showToast('Logo uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  }
}

function removeLogo() {
  logoDataUrl = '';
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('logoUpload').value = '';
  showToast('Logo removed', 'info');
}

function addItem() {
  itemCounter++;
  const container = document.getElementById('items-container');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = `item-row-${itemCounter}`;
  row.innerHTML = `
    <input type="text" class="item-name" placeholder="Item name" required>
    <input type="number" class="item-qty" placeholder="Qty" min="1" value="1" required onchange="calculateTotal()">
    <input type="number" class="item-price" placeholder="Price" step="0.01" min="0" required onchange="calculateTotal()">
    <button type="button" class="remove-btn" onclick="removeItem(${itemCounter})">
      <i class="fas fa-trash"></i> Remove
    </button>
  `;
  container.appendChild(row);
  calculateTotal();
  showToast('Item added successfully', 'success');
}

function removeItem(id) {
  const row = document.getElementById(`item-row-${id}`);
  if (row) {
    row.remove();
    calculateTotal();
    showToast('Item removed', 'warning');
  }
}

function calculateTotal() {
  let subtotal = 0;
  const rows = document.querySelectorAll('.item-row');

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    subtotal += qty * price;
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

  const total = subtotal + taxAmount - discountAmount;

  // Update display
  updateSummaryDisplay(subtotal, taxAmount, discountAmount, total);
}

function updateSummaryDisplay(subtotal, taxAmount, discountAmount, total) {
  const currencySelect = document.getElementById('currency');
  const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

  document.getElementById('subtotalDisplay').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('taxDisplay').textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
  document.getElementById('discountDisplay').textContent = `${currencySymbol}${discountAmount.toFixed(2)}`;
  document.getElementById('totalDisplay').textContent = `${currencySymbol}${total.toFixed(2)}`;

  // Update tax percentage display
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  document.querySelector('#taxDisplayRow span:first-child').innerHTML =
    `<i class="fas fa-percentage"></i> Tax (${taxRate}%):`;

  // Show/hide sections
  const totalDiv = document.getElementById('total');
  const taxRow = document.getElementById('taxDisplayRow');
  const discountRow = document.getElementById('discountDisplayRow');

  taxRow.style.display = taxAmount > 0 ? 'flex' : 'none';
  discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';

  const rows = document.querySelectorAll('.item-row');
  if (rows.length > 0) {
    totalDiv.classList.remove('hidden');
  } else {
    totalDiv.classList.add('hidden');
  }
}

// Add event listeners
document.getElementById('currency').addEventListener('change', calculateTotal);
document.getElementById('taxRate').addEventListener('input', calculateTotal);
document.getElementById('discount').addEventListener('input', calculateTotal);
document.getElementById('discountType').addEventListener('change', calculateTotal);

// Dark Mode Toggle Function
function toggleDarkMode() {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    localStorage.setItem('darkMode', 'enabled');
    showToast('Dark mode enabled', 'info');
  } else {
    themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    localStorage.setItem('darkMode', 'disabled');
    showToast('Light mode enabled', 'info');
  }
}

// Check for saved dark mode preference
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  }

  addItem(); // Add initial item
  calculateTotal(); // Calculate initial total
});

// Preview Functions
function showPreview() {
  // Validate required fields
  if (!validateForm()) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const previewHTML = generatePreviewHTML();
  document.getElementById('previewContent').innerHTML = previewHTML;
  document.getElementById('previewModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  showToast('Preview opened', 'info');
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function generatePDFFromPreview() {
  closePreview();
  generatePDF(new Event('submit'));
}

function generatePreviewHTML() {
  // Get form values
  const docType = document.getElementById('docType').value;
  const companyName = document.getElementById('companyName').value;
  const companyContact = document.getElementById('companyContact').value;
  const customerName = document.getElementById('customerName').value;
  const customerContact = document.getElementById('customerContact').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  const currencySelect = document.getElementById('currency');
  const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

  // Recalculate for preview
  let subtotal = 0;
  const rows = document.querySelectorAll('.item-row');

  // Build items table HTML for preview
  let itemsHTML = '';
  let hasItems = false;

  rows.forEach((row) => {
    const nameInput = row.querySelector('.item-name');
    const qtyInput = row.querySelector('.item-qty');
    const priceInput = row.querySelector('.item-price');

    if (nameInput && qtyInput && priceInput) {
      const name = nameInput.value;
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      const amount = qty * price;

      if (name && qty > 0 && price >= 0) {
        hasItems = true;
        subtotal += amount;

        itemsHTML += `
          <tr>
            <td>${name}</td>
            <td style="text-align: center;">${qty}</td>
            <td style="text-align: right;">${currencySymbol}${price.toFixed(2)}</td>
            <td style="text-align: right; font-weight: bold;">${currencySymbol}${amount.toFixed(2)}</td>
          </tr>
        `;
      }
    }
  });

  // Calculate tax and discount
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discountInput = parseFloat(document.getElementById('discount').value) || 0;
  const discountType = document.getElementById('discountType').value;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = subtotal * (discountInput / 100);
  } else {
    discountAmount = discountInput;
  }

  const finalTotal = subtotal + taxAmount - discountAmount;

  return `
    <div class="preview-document">
      <div class="preview-header">
        <div>
          ${logoDataUrl ? `<img src="${logoDataUrl}" alt="${companyName} Logo" class="preview-logo">` : ''}
          <h1>${companyName}</h1>
          <p><i class="fas fa-phone"></i> Contact: ${companyContact}</p>
        </div>
        <div class="preview-details">
          <h2><i class="fas fa-file-invoice"></i> ${docType}</h2>
          <p><i class="fas fa-calendar"></i> Date: ${new Date().toLocaleDateString()}</p>
          <p><i class="fas fa-credit-card"></i> Payment: ${paymentMethod}</p>
        </div>
      </div>

      <div class="preview-section">
        <h3><i class="fas fa-user"></i> Bill To:</h3>
        <p><strong>${customerName}</strong></p>
        <p><i class="fas fa-phone"></i> ${customerContact}</p>
      </div>

      <!-- Items Table - ACTUALLY SHOW ITEMS -->
      <div class="preview-section">
        <h3><i class="fas fa-shopping-cart"></i> Items & Services</h3>
        ${hasItems ? `
          <table class="preview-items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; margin: 20px 0;">
            <p><i class="fas fa-info-circle"></i> No items added</p>
          </div>
        `}
      </div>

      <div class="preview-summary">
        <div style="max-width: 300px; margin-left: auto;">
          <div class="summary-row">
            <span><i class="fas fa-receipt"></i> Subtotal:</span>
            <span>${currencySymbol}${subtotal.toFixed(2)}</span>
          </div>
          ${taxAmount > 0 ? `
            <div class="summary-row">
              <span><i class="fas fa-percentage"></i> Tax (${taxRate}%):</span>
              <span>${currencySymbol}${taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${discountAmount > 0 ? `
            <div class="summary-row">
              <span><i class="fas fa-tag"></i> Discount:</span>
              <span>-${currencySymbol}${discountAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span><i class="fas fa-file-invoice-dollar"></i> Total:</span>
            <span>${currencySymbol}${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">

        <p style="margin: 0; font-weight: bold; color: #333; font-size: 13px;">
              Thank you for choosing ${companyName}!
            </p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;padding-bottom:10px ">
              For any inquiries or support, please contact ${companyContact}
            </p>
      </div>
    </div>
  `;
}

// Reset/Clear Form Function
function resetForm() {
  if (!confirm('Are you sure you want to reset the form? All data will be lost.')) {
    return;
  }

  // Reset all form fields
  document.getElementById('invoiceForm').reset();

  // Clear logo
  logoDataUrl = '';
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('logoUpload').value = '';

  // Clear all items except the first one
  const itemsContainer = document.getElementById('items-container');
  const rows = document.querySelectorAll('.item-row');

  // Remove all items
  rows.forEach(row => row.remove());

  // Reset item counter
  itemCounter = 0;

  // Add one empty item back
  addItem();

  // Reset tax and discount fields
  document.getElementById('taxRate').value = '';
  document.getElementById('discount').value = '';
  document.getElementById('discountType').value = 'amount';

  // Hide summary section
  document.getElementById('total').classList.add('hidden');

  // Show toast notification
  showToast('Form reset successfully', 'success');

  // Close preview if open
  closePreview();
}

// Also add a key shortcut for reset (Ctrl+R)
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    resetForm();
  }
});

function validateForm() {
  const requiredFields = [
    'companyName',
    'companyContact',
    'docType',
    'currency',
    'paymentMethod',
    'customerName',
    'customerContact'
  ];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.focus();
      field.style.borderColor = '#ff6b6b';
      return false;
    } else {
      field.style.borderColor = '#e0e0e0';
    }
  }

  // Check for at least one item with valid values
  const rows = document.querySelectorAll('.item-row');
  let hasValidItems = false;

  for (const row of rows) {
    const name = row.querySelector('.item-name').value;
    const qty = parseFloat(row.querySelector('.item-qty')?.value);
    const price = parseFloat(row.querySelector('.item-price')?.value);

    if (name && qty > 0 && price >= 0) {
      hasValidItems = true;
      break;
    }
  }

  if (!hasValidItems) {
    showToast('Please add at least one valid item', 'error');
    return false;
  }

  return true;
}

function generatePDF(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Please fill all required fields before generating PDF', 'error');
    return;
  }

  try {
    // Get form values
    const docType = document.getElementById('docType').value;
    const companyName = document.getElementById('companyName').value;
    const companyContact = document.getElementById('companyContact').value;
    const customerName = document.getElementById('customerName').value;
    const customerContact = document.getElementById('customerContact').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currencySelect = document.getElementById('currency');
    const currencyCode = currencySelect.value;
    const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

    // Generate document ID and date
    const id = `${docType === 'Invoice' ? 'INV' : 'REC'}-${Date.now().toString().slice(-6).toUpperCase()}`;
    const now = new Date();
    const dateIssued = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Mobile detection
    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Dynamic settings
    const pdfWidth = isMobile ? 794 : 800;
    const headerMargin = isMobile ? '0 0 10px 0' : '-20px 0 10px 0';

    // Calculate total
    let pdfTotal = 0;
    const rows = document.querySelectorAll('.item-row');
    let itemsHTML = '';
    let hasItems = false;

    // Build items table rows
    rows.forEach((row) => {
      const nameInput = row.querySelector('.item-name');
      const qtyInput = row.querySelector('.item-qty');
      const priceInput = row.querySelector('.item-price');

      if (nameInput && qtyInput && priceInput) {
        const name = nameInput.value;
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const amount = qty * price;

        if (name && qty > 0 && price > 0) {
          hasItems = true;
          pdfTotal += amount;

          itemsHTML += `
            <tr>
              <td style="padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 12px;">${name}</td>
              <td style="text-align: center; padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 12px;">${qty}</td>
              <td style="text-align: right; padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 12px;">${currencySymbol}${price.toFixed(2)}</td>
              <td style="text-align: right; padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 12px; font-weight: bold;">${currencySymbol}${amount.toFixed(2)}</td>
            </tr>
          `;
        }
      }
    });

    // Calculate tax and discount
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discountInput = parseFloat(document.getElementById('discount').value) || 0;
    const discountType = document.getElementById('discountType').value;

    let taxAmount = pdfTotal * (taxRate / 100);
    let discountAmount = 0;

    if (discountType === 'percent') {
      discountAmount = pdfTotal * (discountInput / 100);
    } else {
      discountAmount = discountInput;
    }

    const finalTotal = pdfTotal + taxAmount - discountAmount;

    // If no valid items, show message
    if (!hasItems) {
      itemsHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 0; margin: 0; color: #666; font-style: italic; border-bottom: 1px solid #eee; font-size: 12px;">
            No items added
          </td>
        </tr>
      `;
    }

    // Build complete HTML for PDF with compact styling
    let html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: ${pdfWidth}px; padding: 8px; font-size: 12px;">
        <!-- Header - Company Information with Logo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: ${headerMargin}; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <div style="flex: 1;">
      `;

    // Add logo if uploaded
    if (logoDataUrl) {
      html += `
            <img src="${logoDataUrl}" style="max-width: 150px; max-height: 80px; margin-bottom: 10px;" alt="${companyName} Logo">
        `;
    }

    html += `
            <h1 style="margin: 0 0 5px 0; font-size: 20px; font-weight: bold; color: #333;">${companyName}</h1>
            <p style="margin: 0; font-size: 12px; color: #666;">Contact: ${companyContact}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 3px 0;"><strong>${docType} ID:</strong> ${id}</p>
            <p style="margin: 0;"><strong>Date Issued:</strong> ${dateIssued}</p>
          </div>
        </div>

        <!-- Bill To and Receiver Sections -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <!-- Bill To Section -->
          <div style="flex: 1; margin-right: 15px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">Bill To:</h3>
            <div style="margin-left: 12px;">
              <p style="margin: 3px 0; font-size: 12px;">• Customer Name: ${customerName}</p>
              <p style="margin: 3px 0; font-size: 12px;">• Contact: ${customerContact}</p>
            </div>
          </div>

          <!-- Receiver Section -->
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;"></h3>
            <div>
              <p style="margin: 3px 0; font-size: 12px;"></p>
              <p style="margin: 3px 0; font-size: 12px;"></p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #333;">
            ${docType === 'Invoice' ? 'Items / Services' : 'Items Purchased / Services Provided'}
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin-bottom: 15px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Item Description</th>
                <th style="text-align: center; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Quantity</th>
                <th style="text-align: right; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Unit Price</th>
                <th style="text-align: right; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Totals Section -->
        <div style="margin-bottom: 15px; text-align: right;">
          <div style="display: inline-block; text-align: left; min-width: 250px;">
            <p style="margin: 5px 0; font-size: 12px; padding: 3px 0;">
              <strong>Subtotal:</strong> <span style="float: right; margin-left: 20px;">${currencySymbol}${pdfTotal.toFixed(2)}</span>
            </p>
            ${taxAmount > 0 ? `
            <p style="margin: 5px 0; font-size: 12px; padding: 3px 0;">
              <strong>Tax (${taxRate}%):</strong> <span style="float: right; margin-left: 20px;">${currencySymbol}${taxAmount.toFixed(2)}</span>
            </p>
            ` : ''}
            ${discountAmount > 0 ? `
            <p style="margin: 5px 0; font-size: 12px; padding: 3px 0;">
              <strong>Discount:</strong> <span style="float: right; margin-left: 20px; color: #f44336;">-${currencySymbol}${discountAmount.toFixed(2)}</span>
            </p>
            ` : ''}
            <p style="margin: 5px 0; font-size: 13px; font-weight: bold; color: #333; padding: 5px 0; border-top: 1px solid #333;">
              <strong>Total Due:</strong> <span style="float: right; margin-left: 20px;">${currencySymbol}${finalTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <!-- Footer Information -->
        <div style="border-top: 2px solid #333; padding-top: 15px;">
          <div style="margin-bottom: 10px;">
            <p style="margin: 4px 0; font-size: 12px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Receiver:</strong> ${companyName}</p>
      `;

    // Add Status: ✓ PAID only for Receipts, not for Invoices
    if (docType === 'Receipt') {
      html += `
            <p style="margin: 4px 0; font-size: 12px; color: #28a745; font-weight: bold;">
              <strong>Status:</strong> ✓ PAID
            </p>
      `;
    }

    // Continue with thank you message
    html += `
          </div>

          <!-- Thank You Message -->
          <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #e9ecef;">
            <p style="margin: 0; font-weight: bold; color: #333; font-size: 13px;">
              Thank you for choosing ${companyName}!
            </p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;padding-bottom:10px ">
              For any inquiries or support, please contact ${companyContact}
            </p>
          </div>
        </div>
      </div>
      `;

    // PDF options
    const opt = isMobile ? {
      margin: [0, 10, 0, 10],
      filename: `${docType.toLowerCase()}_${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        width: 794,
        windowWidth: 794,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ["px_scaling"]
      }
    } : {
      margin: [-220, 10, 10, 10],
      filename: `${docType.toLowerCase()}_${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        width: 800,
        height: 2000
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        hotfixes: ["px_scaling"]
      }
    };

    // Generate and save PDF
    html2pdf().set(opt).from(html).save().then(() => {
      showToast('PDF generated successfully!', 'success');
    }).catch(error => {
      console.error('PDF generation error:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    showToast('Error generating PDF. Please check your inputs and try again.', 'error');
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target === modal) {
    closePreview();
  }
};

// Handle Enter key in form
document.getElementById('invoiceForm').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && e.target.type !== 'textarea') {
    e.preventDefault();
  }
});

// Initialize with first item
addItem();
