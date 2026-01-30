let itemCounter = 0;
let total = 0;
let logoDataUrl = '';

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      logoDataUrl = e.target.result;
      const previewImg = document.getElementById('logoPreviewImg');
      const previewContainer = document.getElementById('logoPreview');

      previewImg.src = logoDataUrl;
      previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function removeLogo() {
  logoDataUrl = '';
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('logoUpload').value = '';
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
      <button type="button" class="remove-btn" onclick="removeItem(${itemCounter})">Remove</button>
    `;
  container.appendChild(row);
  calculateTotal();
}

function removeItem(id) {
  const row = document.getElementById(`item-row-${id}`);
  if (row) row.remove();
  calculateTotal();
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
    discountAmount = discountInput;
  }

  const total = subtotal + taxAmount - discountAmount;

  // Update display
  const currencySelect = document.getElementById('currency');
  const currencySymbol = currencySelect.options[currencySelect.selectedIndex].text.split('(')[1].replace(')', '');

  document.getElementById('subtotalDisplay').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('taxDisplay').textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
  document.getElementById('discountDisplay').textContent = `${currencySymbol}${discountAmount.toFixed(2)}`;
  document.getElementById('totalDisplay').textContent = `${currencySymbol}${total.toFixed(2)}`;

  // Show/hide tax and discount rows
  document.getElementById('taxDisplayRow').style.display = taxAmount > 0 ? 'flex' : 'none';
  document.getElementById('discountDisplayRow').style.display = discountAmount > 0 ? 'flex' : 'none';
  document.getElementById('total').classList.toggle('hidden', rows.length === 0);

  return { subtotal, taxAmount, discountAmount, total, currencySymbol };
}

// Preview Functions
function showPreview() {
  // Get calculated values
  const totals = calculateTotal();

  // Get form values
  const docType = document.getElementById('docType').value;
  const companyName = document.getElementById('companyName').value;
  const companyContact = document.getElementById('companyContact').value;
  const customerName = document.getElementById('customerName').value;
  const customerContact = document.getElementById('customerContact').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  // Generate preview HTML (similar to your PDF generation but for preview)
  const previewHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333;">
        <div>
          ${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width: 150px; max-height: 80px; margin-bottom: 10px;" alt="Logo">` : ''}
          <h3 style="margin: 0;">${companyName}</h3>
          <p style="margin: 5px 0;">Contact: ${companyContact}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #667eea;">${docType}</h2>
          <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h4 style="margin: 0 0 10px 0;">Bill To:</h4>
          <p style="margin: 5px 0;"><strong>${customerName}</strong></p>
          <p style="margin: 5px 0;">Contact: ${customerContact}</p>
        </div>
        <div>
          <h4 style="margin: 0 0 10px 0;">Payment:</h4>
          <p style="margin: 5px 0;">Method: ${paymentMethod}</p>
        </div>
      </div>

      <!-- Items table would go here -->
      <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">Preview shows only summary. PDF will include all items.</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
        <div style="max-width: 300px; margin-left: auto;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>${totals.currencySymbol}${totals.subtotal.toFixed(2)}</span>
          </div>
          ${totals.taxAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Tax:</span>
              <span>${totals.currencySymbol}${totals.taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${totals.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Discount:</span>
              <span>-${totals.currencySymbol}${totals.discountAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; font-weight: bold;">
            <span>Total:</span>
            <span>${totals.currencySymbol}${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>


               <!-- Thank You Message -->
      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
         <p style="margin: 0; font-weight: bold; color: #333; font-size: 13px;">
              Thank you for choosing ${companyName}!
            </p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;padding-bottom:10px ">
              For any inquiries or support, please contact ${companyContact}
            </p>
      </div>

    </div>
  `;

  document.getElementById('previewContent').innerHTML = previewHTML;
  document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

function generatePDFFromPreview() {
  closePreview();
  generatePDF(new Event('submit'));
}

// Add event listeners for new fields
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners for tax and discount
  document.getElementById('taxRate').addEventListener('input', calculateTotal);
  document.getElementById('discount').addEventListener('input', calculateTotal);
  document.getElementById('discountType').addEventListener('change', calculateTotal);
});

// Add event listener to currency dropdown to update total display
document.getElementById('currency').addEventListener('change', calculateTotal);

// Dark Mode Toggle Function
function toggleDarkMode() {
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');

  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeBtn.textContent = '☀️ Light Mode';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    themeBtn.textContent = '🌙 Dark Mode';
    localStorage.setItem('darkMode', 'disabled');
  }
}

// Check for saved dark mode preference
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeBtn').textContent = '☀️ Light Mode';
  }
});


function generatePDF(e) {
  e.preventDefault();

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

    // Mobile detection (covers most devices)
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

    // Calculate tax and discount (ADD THIS AFTER itemsHTML is built)
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

    // PDF options: Original for PC; tuned for mobile (sharper, no clip)
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
    console.log('Generating PDF with total items:', rows.length, 'Mobile mode:', isMobile ? 'Yes (scale 1.2, width 794px)' : 'No (original scale 2, width 800px)');
    html2pdf().set(opt).from(html).save();
    console.log('PDF generated successfully with all sections')

    // Simple Toast Function
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50'};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

      // Add animation
      const style = document.createElement('style');
      style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
      document.head.appendChild(style);

      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

// Use it in your existing functions:
// In generatePDF() after successful generation:
// showToast('PDF generated successfully!');

// In showPreview():
// showToast('Preview opened', 'info');

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please check that all required fields are filled and try again.');
  }


}

addItem();
