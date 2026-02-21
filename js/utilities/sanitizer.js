// IR Generator - Enterprise Front-end Sanitizer & Validator
// ===========================================================
// Comprehensive input sanitization and validation for all pages
// USE THIS ON EVERY USER INPUT BEFORE SAVING TO LOCALSTORAGE

class IRSanitizer {
  // ===== CORE SANITIZATION =====
  static sanitizeText(input, maxLength = 500) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  static sanitizeHTML(input, allowedTags = []) {
    if (!input || typeof input !== 'string') return '';
    const allowed = allowedTags.length > 0 ? allowedTags : [];
    if (allowed.length === 0) {
      return this.sanitizeText(input);
    }
    const allowedPattern = allowed.join('|');
    const regex = new RegExp(`<(?!\/?(${allowedPattern})\\b)[^>]*>`, 'gi');
    return input
      .replace(regex, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static escapeHTML(input) {
    if (!input || typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static sanitizeNumber(input, min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = 0) {
    const num = parseFloat(input);
    if (isNaN(num)) return defaultValue;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }

  static sanitizeInteger(input, min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = 0) {
    const num = parseInt(input);
    if (isNaN(num)) return defaultValue;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }

  static sanitizePrice(input, min = 0, max = 999999999.99) {
    const num = parseFloat(input);
    if (isNaN(num)) return 0;
    if (num < min) return min;
    if (num > max) return max;
    return Math.round(num * 100) / 100;
  }

  // ===== SPECIFIC FIELD VALIDATORS =====
  static sanitizeEmail(input) {
    if (!input || typeof input !== 'string') return '';
    const email = input.toLowerCase().trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) return '';
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) return '';
    return email.slice(0, 254);
  }

  static isValidEmail(email) {
    return this.sanitizeEmail(email) !== '';
  }

  static sanitizePhone(input) {
    if (!input || typeof input !== 'string') return '';
    const phone = input.replace(/[^\d\s\+\-\(\)]/g, '').trim();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return '';
    return phone.slice(0, 20);
  }

  static isValidPhone(phone) {
    return this.sanitizePhone(phone) !== '';
  }

  static sanitizeURL(input) {
    if (!input || typeof input !== 'string') return '';
    const url = input.trim();
    if (!url.match(/^https?:\/\//i)) return '';
    if (url.match(/javascript:|data:/i)) return '';
    try {
      const parsed = new URL(url);
      return parsed.href.slice(0, 2048);
    } catch (e) {
      return '';
    }
  }

  static sanitizeDate(input) {
    if (!input) return '';
    const date = new Date(input);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  static sanitizeFileName(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
      .replace(/\.{2,}/g, '.')
      .slice(0, 255);
  }

  // ===== BUSINESS-SPECIFIC SANITIZERS =====
  static sanitizeDocumentNumber(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[^a-zA-Z0-9\-\/]/g, '')
      .toUpperCase()
      .slice(0, 50);
  }

  static sanitizePersonName(input) {
    return this.sanitizeText(input, 100)
      .replace(/[^a-zA-Z\s\.\-\']/g, '');
  }

  static sanitizeCompanyName(input) {
    return this.sanitizeText(input, 150)
      .replace(/[^a-zA-Z0-9\s\.\-\&\,]/g, '');
  }

  static sanitizeAddress(input) {
    return this.sanitizeText(input, 300)
      .replace(/[^a-zA-Z0-9\s\.\,\-\#\/]/g, '');
  }

  static sanitizeCurrency(input) {
    if (!input || typeof input !== 'string') return 'GHC';
    const currency = input.toUpperCase().trim();
    const validCurrencies = ['GHC', 'USD', 'EUR', 'GBP', 'NGN', 'ZAR', 'KES', 'INR', 'JPY', 'AUD'];
    return validCurrencies.includes(currency) ? currency : 'GHC';
  }

  static sanitizePaymentMethod(input) {
    if (!input || typeof input !== 'string') return '';
    const method = this.sanitizeText(input, 50);
    const validMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Card', 'Cheque', 'PayPal', 'Stripe', 'Paystack'];
    const match = validMethods.find(m => m.toLowerCase() === method.toLowerCase());
    return match || method;
  }

  // ===== OBJECT SANITIZERS =====
  static sanitizeInvoice(invoice) {
    if (!invoice || typeof invoice !== 'object') return null;
    return {
      id: this.sanitizeText(invoice.id, 50),
      number: this.sanitizeDocumentNumber(invoice.number),
      clientId: this.sanitizeText(invoice.clientId, 50),
      clientName: this.sanitizePersonName(invoice.clientName),
      clientEmail: this.sanitizeEmail(invoice.clientEmail),
      clientPhone: this.sanitizePhone(invoice.clientPhone),
      companyName: this.sanitizeCompanyName(invoice.companyName),
      companyContact: this.sanitizePhone(invoice.companyContact),
      issueDate: this.sanitizeDate(invoice.issueDate),
      dueDate: this.sanitizeDate(invoice.dueDate),
      items: Array.isArray(invoice.items) ? invoice.items.map(item => this.sanitizeInvoiceItem(item)) : [],
      subtotal: this.sanitizePrice(invoice.subtotal),
      taxRate: this.sanitizeNumber(invoice.taxRate, 0, 100),
      taxAmount: this.sanitizePrice(invoice.taxAmount),
      discountAmount: this.sanitizePrice(invoice.discountAmount),
      total: this.sanitizePrice(invoice.total),
      status: this.sanitizeText(invoice.status, 20),
      paymentMethod: this.sanitizePaymentMethod(invoice.paymentMethod),
      currency: this.sanitizeCurrency(invoice.currency),
      currencySymbol: this.sanitizeText(invoice.currencySymbol, 5),
      notes: this.sanitizeText(invoice.notes, 1000)
    };
  }

  static sanitizeInvoiceItem(item) {
    if (!item || typeof item !== 'object') return null;
    return {
      name: this.sanitizeText(item.name, 200),
      description: this.sanitizeText(item.description || '', 500),
      qty: this.sanitizeNumber(item.qty, 0.001, 999999, 1),
      price: this.sanitizePrice(item.price, 0, 999999999),
      unit: this.sanitizeText(item.unit || '', 20)
    };
  }

  static sanitizeReceipt(receipt) {
    if (!receipt || typeof receipt !== 'object') return null;
    return {
      id: this.sanitizeText(receipt.id, 50),
      number: this.sanitizeDocumentNumber(receipt.number),
      invoiceId: this.sanitizeText(receipt.invoiceId || '', 50),
      customerId: this.sanitizeText(receipt.customerId, 50),
      customerName: this.sanitizePersonName(receipt.customerName),
      customerEmail: this.sanitizeEmail(receipt.customerEmail),
      customerPhone: this.sanitizePhone(receipt.customerPhone),
      companyName: this.sanitizeCompanyName(receipt.companyName),
      companyContact: this.sanitizePhone(receipt.companyContact),
      date: this.sanitizeDate(receipt.date),
      items: Array.isArray(receipt.items) ? receipt.items.map(item => this.sanitizeInvoiceItem(item)) : [],
      subtotal: this.sanitizePrice(receipt.subtotal),
      taxRate: this.sanitizeNumber(receipt.taxRate, 0, 100),
      taxAmount: this.sanitizePrice(receipt.taxAmount),
      discountAmount: this.sanitizePrice(receipt.discountAmount),
      total: this.sanitizePrice(receipt.total),
      paymentMethod: this.sanitizePaymentMethod(receipt.paymentMethod),
      status: 'paid',
      currency: this.sanitizeCurrency(receipt.currency),
      currencySymbol: this.sanitizeText(receipt.currencySymbol, 5),
      notes: this.sanitizeText(receipt.notes || '', 1000),
      transactionRef: this.sanitizeText(receipt.transactionRef || '', 100),
      footerNote: this.sanitizeText(receipt.footerNote || '', 500)
    };
  }

  static sanitizeClient(client) {
    if (!client || typeof client !== 'object') return null;
    return {
      id: this.sanitizeText(client.id, 50),
      name: this.sanitizePersonName(client.name),
      company: this.sanitizeCompanyName(client.company || ''),
      email: this.sanitizeEmail(client.email),
      phone: this.sanitizePhone(client.phone),
      address: this.sanitizeAddress(client.address || ''),
      city: this.sanitizeText(client.city || '', 100),
      country: this.sanitizeText(client.country || '', 100),
      taxId: this.sanitizeText(client.taxId || '', 50),
      totalInvoices: this.sanitizeInteger(client.totalInvoices, 0),
      totalSpent: this.sanitizePrice(client.totalSpent, 0),
      status: this.sanitizeText(client.status, 20),
      notes: this.sanitizeText(client.notes || '', 1000)
    };
  }

  // ===== VALIDATION HELPERS =====
  static validateInvoice(invoice) {
    const errors = [];
    if (!invoice.clientName || invoice.clientName.trim() === '') {
      errors.push('Client name is required');
    }
    if (!invoice.clientEmail && !invoice.clientPhone) {
      errors.push('Client email or phone is required');
    }
    if (invoice.clientEmail && !this.isValidEmail(invoice.clientEmail)) {
      errors.push('Invalid email format');
    }
    if (invoice.clientPhone && !this.isValidPhone(invoice.clientPhone)) {
      errors.push('Invalid phone format');
    }
    if (!invoice.issueDate || !this.sanitizeDate(invoice.issueDate)) {
      errors.push('Valid issue date is required');
    }
    if (!invoice.dueDate || !this.sanitizeDate(invoice.dueDate)) {
      errors.push('Valid due date is required');
    }
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      errors.push('At least one item is required');
    }
    if (invoice.total <= 0) {
      errors.push('Total must be greater than 0');
    }

    const result = { valid: errors.length === 0, errors };

    if (!result.valid && typeof showToast === 'function') {
      const message = errors.join('\n');
      showToast(message, 'error');  // ← uses your default 3000ms
    }

    return result;
  }

  static validateReceipt(receipt) {
    const errors = [];
    if (!receipt.customerName || receipt.customerName.trim() === '') {
      errors.push('Customer name is required');
    }
    if (!receipt.customerPhone) {
      errors.push('Customer phone is required');
    }
    if (receipt.customerPhone && !this.isValidPhone(receipt.customerPhone)) {
      errors.push('Invalid phone format');
    }
    if (!receipt.date || !this.sanitizeDate(receipt.date)) {
      errors.push('Valid date is required');
    }
    if (!receipt.paymentMethod || receipt.paymentMethod.trim() === '') {
      errors.push('Payment method is required');
    }
    if (!Array.isArray(receipt.items) || receipt.items.length === 0) {
      errors.push('At least one item is required');
    }
    if (receipt.total <= 0) {
      errors.push('Total must be greater than 0');
    }

    const result = { valid: errors.length === 0, errors };

    if (!result.valid && typeof showToast === 'function') {
      const message = errors.join('\n');
      showToast(message, 'error');  // ← default 3000ms
    }

    return result;
  }

  static validateClient(client) {
    const errors = [];
    if (!client.name || client.name.trim() === '') {
      errors.push('Client name is required');
    }
    if (!client.email && !client.phone) {
      errors.push('Email or phone is required');
    }
    if (client.email && !this.isValidEmail(client.email)) {
      errors.push('Invalid email format');
    }
    if (client.phone && !this.isValidPhone(client.phone)) {
      errors.push('Invalid phone format');
    }

    const result = { valid: errors.length === 0, errors };

    if (!result.valid && typeof showToast === 'function') {
      const message = errors.join('\n');
      showToast(message, 'error');  // ← default 3000ms
    }

    return result;
  }

  // ===== BATCH OPERATIONS =====
  static sanitizeArray(array, sanitizeFunction) {
    if (!Array.isArray(array)) return [];
    return array
      .map(item => sanitizeFunction.call(this, item))
      .filter(item => item !== null);
  }

  static deepSanitize(obj, maxDepth = 5, currentDepth = 0) {
    if (currentDepth >= maxDepth) return obj;
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') {
      return typeof obj === 'string' ? this.sanitizeText(obj) : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item, maxDepth, currentDepth + 1));
    }
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.deepSanitize(obj[key], maxDepth, currentDepth + 1);
      }
    }
    return sanitized;
  }
}

// Make available globally
window.IRSanitizer = IRSanitizer;

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IRSanitizer;
}
