// Enterprise Data Manager - Production Ready
// ==========================================
// Centralized data management for invoices, receipts, and clients

class DataManager {
  constructor() {
    this.initializeStorage();
  }

  // ===== INITIALIZATION =====
  initializeStorage() {
    // Ensure all storage keys exist
    if (!localStorage.getItem('invoices')) {
      localStorage.setItem('invoices', JSON.stringify([]));
    }
    if (!localStorage.getItem('receipts')) {
      localStorage.setItem('receipts', JSON.stringify([]));
    }
    if (!localStorage.getItem('clients')) {
      localStorage.setItem('clients', JSON.stringify([]));
    }
  }

  // ===== INVOICE OPERATIONS =====
  createInvoice(invoiceData) {
    try {
      const invoices = this.getInvoices();
      const settings = window.GlobalSettings || { settings: {} };
      const newInvoice = {
        id: `INV${Date.now()}`,
        number: this.generateInvoiceNumber(),
        clientId: invoiceData.clientId || '',
        clientName: invoiceData.clientName || '',
        clientEmail: invoiceData.clientEmail || '',
        clientPhone: invoiceData.clientPhone || '',
        companyName: invoiceData.companyName || '',
        companyContact: invoiceData.companyContact || '',
        companyLogo: invoiceData.companyLogo || '',
        issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || this.calculateDueDate(),
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal || 0,
        taxRate: invoiceData.taxRate || 0,
        taxAmount: invoiceData.taxAmount || 0,
        discountAmount: invoiceData.discountAmount || 0,
        total: invoiceData.total || 0,
        status: invoiceData.status || 'draft', // draft, sent, paid, overdue
        paymentMethod: invoiceData.paymentMethod || '',
        currency: invoiceData.currency || 'GHS',
        currencySymbol: invoiceData.currencySymbol || '₵',
        notes: invoiceData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      invoices.push(newInvoice);
      localStorage.setItem('invoices', JSON.stringify(invoices));

      // Update client statistics
      if (newInvoice.clientId) {
        this.updateClientStats(newInvoice.clientId, { totalInvoices: 1, lastInvoiceDate: newInvoice.issueDate });
      }
      this.broadcastDataChange('invoice_created', newInvoice);
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  getInvoices() {
    try {
      return JSON.parse(localStorage.getItem('invoices') || '[]');
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  }

  getInvoiceById(id) {
    const invoices = this.getInvoices();
    return invoices.find(inv => inv.id === id);
  }

  updateInvoice(id, updates) {
    try {
      const invoices = this.getInvoices();
      const index = invoices.findIndex(inv => inv.id === id);
      if (index === -1) {
        throw new Error('Invoice not found');
      }
      invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('invoices', JSON.stringify(invoices));
      this.broadcastDataChange('invoice_updated', invoices[index]);
      return invoices[index];
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  deleteInvoice(id) {
    try {
      const invoices = this.getInvoices();
      const filtered = invoices.filter(inv => inv.id !== id);
      localStorage.setItem('invoices', JSON.stringify(filtered));
      this.broadcastDataChange('invoice_deleted', { id });
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  generateInvoiceNumber() {
    const invoices = this.getInvoices();
    const settings = window.GlobalSettings?.settings?.invoice || {};
    const prefix = settings.prefix || 'INV';
    const year = new Date().getFullYear();

    // Find the highest number used this year
    const yearInvoices = invoices.filter(inv => inv.number && inv.number.includes(year.toString()));
    const lastNumber = yearInvoices.length > 0
      ? Math.max(...yearInvoices.map(inv => {
        const match = inv.number?.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      }))
      : 0;

    const nextNumber = lastNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}-${year}-${paddedNumber}`;
  }

  // ===== RECEIPT OPERATIONS =====
  createReceipt(receiptData) {
    try {
      const receipts = this.getReceipts();
      const newReceipt = {
        id: `REC${Date.now()}`,
        number: this.generateReceiptNumber(),
        invoiceId: receiptData.invoiceId || null,
        clientId: receiptData.clientId || '',
        clientName: receiptData.clientName || '',
        clientEmail: receiptData.clientEmail || '',
        clientPhone: receiptData.clientPhone || '',
        companyName: receiptData.companyName || '',
        companyContact: receiptData.companyContact || '',
        companyLogo: receiptData.companyLogo || '',
        date: receiptData.date || new Date().toISOString().split('T')[0],
        items: receiptData.items || [],
        subtotal: receiptData.subtotal || 0,
        taxRate: receiptData.taxRate || 0,
        taxAmount: receiptData.taxAmount || 0,
        discountAmount: receiptData.discountAmount || 0,
        total: receiptData.total || 0,
        paymentMethod: receiptData.paymentMethod || '',
        status: 'paid', // Receipts are always paid
        currency: receiptData.currency || 'GHS',
        currencySymbol: receiptData.currencySymbol || '₵',
        notes: receiptData.notes || '',
        createdAt: new Date().toISOString()
      };
      receipts.push(newReceipt);
      localStorage.setItem('receipts', JSON.stringify(receipts));

      // Update client statistics
      if (newReceipt.clientId) {
        this.updateClientStats(newReceipt.clientId, { totalSpent: newReceipt.total });
      }

      // Mark related invoice as paid if exists
      if (newReceipt.invoiceId) {
        this.updateInvoice(newReceipt.invoiceId, { status: 'paid' });
      }

      this.broadcastDataChange('receipt_created', newReceipt);
      return newReceipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw new Error('Failed to create receipt');
    }
  }

  getReceipts() {
    try {
      return JSON.parse(localStorage.getItem('receipts') || '[]');
    } catch (error) {
      console.error('Error loading receipts:', error);
      return [];
    }
  }

  getReceiptById(id) {
    const receipts = this.getReceipts();
    return receipts.find(rec => rec.id === id);
  }

  updateReceipt(id, updates) {
    try {
      const receipts = this.getReceipts();
      const index = receipts.findIndex(rec => rec.id === id);
      if (index === -1) {
        throw new Error('Receipt not found');
      }
      receipts[index] = { ...receipts[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('receipts', JSON.stringify(receipts));
      this.broadcastDataChange('receipt_updated', receipts[index]);
      return receipts[index];
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  }

  deleteReceipt(id) {
    try {
      const receipts = this.getReceipts();
      const filtered = receipts.filter(rec => rec.id !== id);
      localStorage.setItem('receipts', JSON.stringify(filtered));
      this.broadcastDataChange('receipt_deleted', { id });
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  }

  generateReceiptNumber() {
    const receipts = this.getReceipts();
    const settings = window.GlobalSettings?.settings?.receipt || {};
    const prefix = settings.prefix || 'REC';
    const year = new Date().getFullYear();

    const yearReceipts = receipts.filter(rec => rec.number && rec.number.includes(year.toString()));
    const lastNumber = yearReceipts.length > 0
      ? Math.max(...yearReceipts.map(rec => {
        const match = rec.number?.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      }))
      : 0;

    const nextNumber = lastNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}-${year}-${paddedNumber}`;
  }

  // ===== CLIENT OPERATIONS =====
  createClient(clientData) {
    try {
      const clients = this.getClients();
      const newClient = {
        id: `CLI${Date.now()}`,
        name: clientData.name || '',
        company: clientData.company || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        city: clientData.city || '',
        country: clientData.country || '',
        taxId: clientData.taxId || '',
        totalInvoices: 0,
        totalSpent: 0,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        lastInvoiceDate: null,
        notes: clientData.notes || ''
      };
      clients.push(newClient);
      localStorage.setItem('clients', JSON.stringify(clients));
      this.broadcastDataChange('client_created', newClient);
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  }

  getClients() {
    try {
      return JSON.parse(localStorage.getItem('clients') || '[]');
    } catch (error) {
      console.error('Error loading clients:', error);
      return [];
    }
  }

  getClientById(id) {
    const clients = this.getClients();
    return clients.find(client => client.id === id);
  }

  updateClient(id, updates) {
    try {
      const clients = this.getClients();
      const index = clients.findIndex(client => client.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }
      clients[index] = { ...clients[index], ...updates };
      localStorage.setItem('clients', JSON.stringify(clients));
      this.broadcastDataChange('client_updated', clients[index]);
      return clients[index];
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  deleteClient(id) {
    try {
      const clients = this.getClients();
      const filtered = clients.filter(client => client.id !== id);
      localStorage.setItem('clients', JSON.stringify(filtered));
      this.broadcastDataChange('client_deleted', { id });
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  updateClientStats(clientId, stats) {
    try {
      const clients = this.getClients();
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      if (stats.totalInvoices) {
        client.totalInvoices = (client.totalInvoices || 0) + stats.totalInvoices;
      }
      if (stats.totalSpent) {
        client.totalSpent = (client.totalSpent || 0) + stats.totalSpent;
      }
      if (stats.lastInvoiceDate) {
        client.lastInvoiceDate = stats.lastInvoiceDate;
      }

      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error updating client stats:', error);
    }
  }

  // ===== UTILITY FUNCTIONS =====
  calculateDueDate() {
    const settings = window.GlobalSettings?.settings?.invoice || {};
    const dueDays = settings.dueDays || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    return dueDate.toISOString().split('T')[0];
  }

  broadcastDataChange(event, data) {
    window.dispatchEvent(new CustomEvent('dataChanged', { detail: { event, data } }));
  }

  // ===== STATISTICS =====
  getStatistics() {
    const invoices = this.getInvoices();
    const receipts = this.getReceipts();
    const clients = this.getClients();

    return {
      invoices: {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalAmount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
        paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
      },
      receipts: {
        total: receipts.length,
        totalAmount: receipts.reduce((sum, r) => sum + (r.total || 0), 0)
      },
      clients: {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        inactive: clients.filter(c => c.status === 'inactive').length
      }
    };
  }
}

// Create global instance
window.DataManager = new DataManager();

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (['invoices', 'receipts', 'clients'].includes(e.key)) {
    window.dispatchEvent(new CustomEvent('dataChanged', { detail: { event: `${e.key}_external_change`, data: null } }));
  }
});
