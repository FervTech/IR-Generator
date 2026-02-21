// Modern Invoice Generator - JavaScript
// =====================================

let itemCounter = 0;
let logoDataUrl = '';

// ===== TOAST NOTIFICATIONS =====
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

// ===== LOGO UPLOAD =====
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('File size should be less than 2MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    logoDataUrl = e.target.result;
    const previewImg = document.getElementById('logoPreviewImg');
    const previewContainer = document.getElementById('logoPreview');
    const uploadContent = document.getElementById('uploadContent');

    previewImg.src = logoDataUrl;
    uploadContent.style.display = 'none';
    previewContainer.style.display = 'flex';
    showToast('Logo uploaded successfully!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoDataUrl = '';
  const previewContainer = document.getElementById('logoPreview');
  const uploadContent = document.getElementById('uploadContent');

  previewContainer.style.display = 'none';
  uploadContent.style.display = 'flex';
  document.getElementById('logoUpload').value = '';
  showToast('Logo removed', 'info');
}

// ===== ITEMS MANAGEMENT =====
function addItem() {
  itemCounter++;
  const container = document.getElementById('items-container');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = `item-row-${itemCounter}`;
  row.innerHTML = `
    <input type="text" class="item-name form-input" placeholder="Item name" required>
    <input type="number" class="item-qty form-input" placeholder="Qty" min="1" value="1" required onchange="calculateTotal()">
    <input type="number" class="item-price form-input" placeholder="Price" step="0.01" min="0" required onchange="calculateTotal()">
    <button type="button" class="btn-remove-item" onclick="removeItem(${itemCounter})">
      <i class="fas fa-trash"></i>
      <span>Remove</span>
    </button>
  `;
  container.appendChild(row);
  calculateTotal();
  showToast('Item added successfully', 'success');
}

function removeItem(id) {
  const row = document.getElementById(`item-row-${id}`);
  if (row) {
    row.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      row.remove();
      calculateTotal();
      showToast('Item removed', 'warning');
    }, 300);
  }
}

// ===== CALCULATIONS =====
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
  document.querySelector('#taxDisplayRow .summary-label').innerHTML = `
    <i class="fas fa-percentage"></i> Tax (${taxRate}%)
  `;

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

// ===== EVENT LISTENERS =====
document.getElementById('currency')?.addEventListener('change', calculateTotal);
document.getElementById('taxRate')?.addEventListener('input', calculateTotal);
document.getElementById('discount')?.addEventListener('input', calculateTotal);
document.getElementById('discountType')?.addEventListener('change', calculateTotal);

// ===== DARK MODE =====
function toggleDarkMode() {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    localStorage.setItem('darkMode', 'enabled');
    showToast('Dark mode enabled', 'info');
  } else {
    themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    localStorage.setItem('darkMode', 'disabled');
    showToast('Light mode enabled', 'info');
  }
}

// ===== PREVIEW =====
function showPreview() {
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
  const docType = document.getElementById('docType').value;
  const companyName = document.getElementById('companyName').value;
  const companyContact = document.getElementById('companyContact').value;
  const customerName = document.getElementById('customerName').value;
  const customerContact = document.getElementById('customerContact').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  const currencySelect = document.getElementById('currency');
  const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

  let subtotal = 0;
  const rows = document.querySelectorAll('.item-row');

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
          <h1 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 0.5rem;">${companyName}</h1>
          <p style="color: var(--text-secondary);"><i class="fas fa-phone"></i> ${companyContact}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-family: var(--font-display); color: var(--primary); margin-bottom: 0.5rem;">
            <i class="fas fa-file-invoice"></i> ${docType}
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}
          </p>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            <i class="fas fa-credit-card"></i> ${paymentMethod}
          </p>
        </div>
      </div>

      <div class="preview-section">
        <h3><i class="fas fa-user"></i> Bill To:</h3>
        <p style="margin: 0.5rem 0; font-weight: 600;">${customerName}</p>
        <p style="margin: 0.5rem 0; color: var(--text-secondary);"><i class="fas fa-phone"></i> ${customerContact}</p>
      </div>

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
          <div style="text-align: center; padding: 2rem; background: var(--bg-tertiary); border-radius: 12px; margin: 1rem 0;">
            <i class="fas fa-info-circle" style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 0.5rem;"></i>
            <p style="color: var(--text-secondary);">No items added</p>
          </div>
        `}
      </div>

      <div class="preview-summary">
        <div style="max-width: 350px; margin-left: auto;">
          <div class="summary-row">
            <span class="summary-label"><i class="fas fa-receipt"></i> Subtotal</span>
            <span class="summary-value">${currencySymbol}${subtotal.toFixed(2)}</span>
          </div>
          ${taxAmount > 0 ? `
            <div class="summary-row">
              <span class="summary-label"><i class="fas fa-percentage"></i> Tax (${taxRate}%)</span>
              <span class="summary-value">${currencySymbol}${taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${discountAmount > 0 ? `
            <div class="summary-row">
              <span class="summary-label"><i class="fas fa-tag"></i> Discount</span>
              <span class="summary-value" style="color: var(--error);">-${currencySymbol}${discountAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); margin: 1rem 0;"></div>
          <div class="summary-row">
            <span class="summary-label" style="font-size: 1.3rem; font-weight: 700; color: var(--primary);">
              <i class="fas fa-file-invoice-dollar"></i> Total
            </span>
            <span class="summary-value" style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">
              ${currencySymbol}${finalTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px;">
        <p style="margin: 0; font-weight: 700; color: var(--text-primary); font-size: 1rem;">
          Thank you for choosing ${companyName}!
        </p>
        <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
          For any inquiries or support, please contact ${companyContact}
        </p>
      </div>
    </div>
  `;
}

// ===== RESET FORM =====
function resetForm() {
  if (!confirm('Are you sure you want to reset the form? All data will be lost.')) {
    return;
  }

  document.getElementById('invoiceForm').reset();
  logoDataUrl = '';
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('uploadContent').style.display = 'flex';
  document.getElementById('logoUpload').value = '';

  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  itemCounter = 0;
  addItem();

  document.getElementById('taxRate').value = '';
  document.getElementById('discount').value = '';
  document.getElementById('discountType').value = 'amount';
  document.getElementById('total').classList.add('hidden');

  showToast('Form reset successfully', 'success');
  closePreview();
}

// ===== FORM VALIDATION =====
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
      field.style.borderColor = 'var(--error)';
      setTimeout(() => {
        field.style.borderColor = '';
      }, 2000);
      return false;
    }
  }

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

// ===== PDF GENERATION =====
function generatePDF(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Please fill all required fields before generating PDF', 'error');
    return;
  }

  try {
    const docType = document.getElementById('docType').value;
    const companyName = document.getElementById('companyName').value;
    const companyContact = document.getElementById('companyContact').value;
    const customerName = document.getElementById('customerName').value;
    const customerContact = document.getElementById('customerContact').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currencySelect = document.getElementById('currency');
    const currencyCode = currencySelect.value;
    const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

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

    const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let pdfTotal = 0;
    const rows = document.querySelectorAll('.item-row');
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

    if (!hasItems) {
      itemsHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 0; margin: 0; color: #666; font-style: italic; border-bottom: 1px solid #eee; font-size: 12px;">
            No items added
          </td>
        </tr>
      `;
    }

    let html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; max-width: 750px; padding: 20px; font-size: 12px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <div style="flex: 1;">
    `;

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

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div style="flex: 1; margin-right: 15px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">Bill To:</h3>
            <div style="margin-left: 12px;">
              <p style="margin: 3px 0; font-size: 12px;">• Customer Name: ${customerName}</p>
              <p style="margin: 3px 0; font-size: 12px;">• Contact: ${customerContact}</p>
            </div>
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;"></h3>
            <div>
              <p style="margin: 3px 0; font-size: 12px;"></p>
              <p style="margin: 3px 0; font-size: 12px;"></p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px; page-break-inside: avoid;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #333;">
            ${docType === 'Invoice' ? 'Items / Services' : 'Items Purchased / Services Provided'}
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin-bottom: 15px; page-break-inside: auto;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Item Description</th>
                <th style="text-align: center; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Quantity</th>
                <th style="text-align: right; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Unit Price</th>
                <th style="text-align: right; padding: 10px 6px; font-weight: bold; border-bottom: 2px solid #333; font-size: 12px;">Amount</th>
              </tr>
            </thead>
            <tbody style="page-break-inside: auto;">
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px; text-align: right; page-break-inside: avoid;">
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

        <div style="border-top: 2px solid #333; padding-top: 15px; page-break-inside: avoid;">
          <div style="margin-bottom: 10px;">
            <p style="margin: 4px 0; font-size: 12px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Receiver:</strong> ${companyName}</p>
    `;

    if (docType === 'Receipt') {
      html += `
            <p style="margin: 4px 0; font-size: 12px; color: #28a745; font-weight: bold;">
              <strong>Status:</strong> ✓ PAID
            </p>
      `;
    }

    html += `
          </div>

          <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #e9ecef;">
            <p style="margin: 0; font-weight: bold; color: #333; font-size: 13px;">
              Thank you for choosing ${companyName}!
            </p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 11px; padding-bottom: 10px;">
              For any inquiries or support, please contact ${companyContact}
            </p>
          </div>
        </div>
      </div>
    `;

    const opt = isMobile ? {
      margin: [10, 10, 10, 10],
      filename: `${docType.toLowerCase()}_${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
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
    } : {
      margin: [10, 10, 10, 10],
      filename: `${docType.toLowerCase()}_${id}.pdf`,
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
  }

  // Add initial item
  addItem();
  calculateTotal();

  // Set current year in footer
  const currentYear = new Date().getFullYear();
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = currentYear;
  }
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target === modal) {
    closePreview();
  }
};

// Handle Enter key in form
document.getElementById('invoiceForm')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && e.target.type !== 'textarea') {
    e.preventDefault();
  }
});

// Keyboard shortcut for reset (Ctrl+R)
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    resetForm();
  }
});


