// Global Settings Manager - Enterprise Edition
// ===========================================
// This module manages all application settings and ensures they're applied globally

class GlobalSettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.initializeDefaults();
  }

  // Default settings structure
  getDefaultSettings() {
    return {
      general: {
        language: 'English',
        timezone: 'GMT (UTC+0)',
        dateFormat: 'MM/DD/YYYY',
        currency: 'GHS',
        currencySymbol: '₵',
        numberFormat: '1,234.56',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        companyLogo: ''
      },
      invoice: {
        prefix: 'INV',
        numberFormat: 'INV-YYYY-###',
        startingNumber: 1,
        paymentTerms: 'Net 30',
        defaultTaxRate: 0,
        dueDays: 30,
        autoSend: false,
        showTax: true,
        showDiscount: true,
        footerNote: 'Thank you for your business!',
        emailTemplate: 'default'
      },
      receipt: {
        prefix: 'REC',
        numberFormat: 'REC-YYYY-###',
        startingNumber: 1,
        autoSend: false,
        showPaymentMethod: true,
        showTax: true,
        footerNote: 'Payment received with thanks!',
        emailTemplate: 'default',
        printCopies: 1
      },
      email: {
        notifications: true,
        invoiceSent: true,
        receiptSent: true,
        paymentReceived: true,
        overdueReminder: true,
        reminderDays: 3,
        signature: '',
        fromName: '',
        fromEmail: '',
        smtpConfigured: false
      },
      appearance: {
        theme: 'auto',
        primaryColor: '#6366f1',
        fontSize: 'medium',
        compactMode: false,
        sidebarCollapsed: false
      },
      privacy: {
        dataRetention: 30,
        analytics: true,
        shareUsageData: false
      },
      export: {
        defaultFormat: 'pdf',
        includeCompanyLogo: true,
        pageSize: 'A4',
        orientation: 'portrait'
      }
    };
  }

  // Initialize with defaults if no settings exist
  initializeDefaults() {
    const defaults = this.getDefaultSettings();
    let updated = false;

    // Deep merge defaults with existing settings
    Object.keys(defaults).forEach(category => {
      if (!this.settings[category]) {
        this.settings[category] = defaults[category];
        updated = true;
      } else {
        Object.keys(defaults[category]).forEach(key => {
          if (this.settings[category][key] === undefined) {
            this.settings[category][key] = defaults[category][key];
            updated = true;
          }
        });
      }
    });

    if (updated) {
      this.saveSettings();
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const stored = localStorage.getItem('appSettings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('appSettings', JSON.stringify(this.settings));
      this.broadcastSettingsChange();
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Get a specific setting
  get(category, key) {
    if (!category) return this.settings;
    if (!key) return this.settings[category] || {};
    return this.settings[category]?.[key];
  }

  // Set a specific setting
  set(category, key, value) {
    if (!this.settings[category]) {
      this.settings[category] = {};
    }
    this.settings[category][key] = value;
    return this.saveSettings();
  }

  // Update multiple settings at once
  update(category, updates) {
    if (!this.settings[category]) {
      this.settings[category] = {};
    }
    Object.assign(this.settings[category], updates);
    return this.saveSettings();
  }

  // Get currency symbol based on current settings
  getCurrencySymbol() {
    const currency = this.get('general', 'currency');
    const symbols = {
      'GHS': '₵',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦',
      'ZAR': 'R',
      'KES': 'KSh',
      'INR': '₹',
      'JPY': '¥',
      'AUD': 'A$'
    };
    return symbols[currency] || '₵';
  }

  // Format currency based on settings
  formatCurrency(amount) {
    const symbol = this.getCurrencySymbol();
    const numberFormat = this.get('general', 'numberFormat');

    let formatted;
    if (numberFormat === '1.234,56') {
      formatted = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else if (numberFormat === '1 234,56') {
      formatted = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } else {
      formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return `${symbol}${formatted}`;
  }

  // Format date based on settings
  formatDate(date) {
    const format = this.get('general', 'dateFormat');
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  }

  // Generate next invoice number
  getNextInvoiceNumber() {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const prefix = this.get('invoice', 'prefix');
    const format = this.get('invoice', 'numberFormat');
    const year = new Date().getFullYear();

    const lastNumber = invoices.length > 0
      ? Math.max(...invoices.map(inv => {
        const match = inv.number?.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      }))
      : 0;

    const nextNumber = lastNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');

    return format
      .replace('PREFIX', prefix)
      .replace('YYYY', year)
      .replace('###', paddedNumber);
  }

  // Generate next receipt number
  getNextReceiptNumber() {
    const receipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    const prefix = this.get('receipt', 'prefix');
    const format = this.get('receipt', 'numberFormat');
    const year = new Date().getFullYear();

    const lastNumber = receipts.length > 0
      ? Math.max(...receipts.map(rec => {
        const match = rec.number?.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      }))
      : 0;

    const nextNumber = lastNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');

    return format
      .replace('PREFIX', prefix)
      .replace('YYYY', year)
      .replace('###', paddedNumber);
  }

  // Apply theme
  applyTheme() {
    const theme = this.get('appearance', 'theme');
    const primaryColor = this.get('appearance', 'primaryColor');
    const fontSize = this.get('appearance', 'fontSize');
    const compactMode = this.get('appearance', 'compactMode');

    // Apply theme mode
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else if (theme === 'dark') {
      document.body.classList.remove('dark-mode');
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', prefersDark);
    }

    // Apply primary color
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
    }

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    if (fontSize && fontSizes[fontSize]) {
      document.documentElement.style.fontSize = fontSizes[fontSize];
    }

    // Apply compact mode
    if (compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }

  // Broadcast settings change to other tabs/windows
  broadcastSettingsChange() {
    window.dispatchEvent(new CustomEvent('settingsChanged', {
      detail: { settings: this.settings }
    }));
  }

  // Export all settings
  exportSettings() {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ir-generator-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import settings
  importSettings(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          this.settings = imported;
          this.saveSettings();
          this.applyTheme();
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Reset all settings to defaults
  resetToDefaults() {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.applyTheme();
  }
}

// Create global instance
window.GlobalSettings = new GlobalSettingsManager();

// Apply theme on page load
document.addEventListener('DOMContentLoaded', () => {
  window.GlobalSettings.applyTheme();
});

// Listen for settings changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'appSettings') {
    window.GlobalSettings.settings = window.GlobalSettings.loadSettings();
    window.GlobalSettings.applyTheme();
  }
});
