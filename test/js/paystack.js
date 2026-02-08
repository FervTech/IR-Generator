document.addEventListener("DOMContentLoaded", () => {
  const donateBtn = document.getElementById("paystackBtn");
  const donationAmountInput = document.getElementById("donationAmount");

  if (!donateBtn || !donationAmountInput) return;

  donateBtn.addEventListener("click", () => {
    try {
      // Get the donation amount from input
      const amount = parseFloat(donationAmountInput.value);

      // Validate the amount
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid donation amount');
        donationAmountInput.focus();
        return;
      }

      // Convert to pesewas (1 GHS = 100 pesewas)
      const amountInPesewas = Math.round(amount * 100);

      // Validate minimum amount (e.g., minimum 1 GHS)
      if (amount < 1) {
        alert('Minimum donation amount is GHS 1.00');
        donationAmountInput.focus();
        return;
      }

      // Optional: Validate maximum amount
      if (amount > 10000) {
        alert('Maximum donation amount is GHS 10,000.00');
        donationAmountInput.focus();
        return;
      }

      const handler = PaystackPop.setup({
        key: 'pk_live_1a6c2639cf72cbba335936ffe2d34a8f8f82bc1b',
        email: 'donation@fervtech.com',
        amount: amountInPesewas, // User-entered amount
        currency: 'GHS',
        ref: 'DON-' + Date.now(),
        callback: function (response) {
          // Show success message with amount
          alert(`Thank you for your donation of GHS ${amount.toFixed(2)}! Reference: ${response.reference}`);

          // Optional: Reset the amount field
          donationAmountInput.value = "1";
        },
        onClose: function () {
          console.log('Donation popup closed.');
        }
      });
      handler.openIframe();
    } catch (err) {
      console.error('Paystack init failed:', err);
      alert('Payment service not available. Please try again later.');
    }
  });

  // Optional: Add enter key support
  donationAmountInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      donateBtn.click();
    }
  });
});
