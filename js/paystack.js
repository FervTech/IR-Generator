document.addEventListener("DOMContentLoaded", () => {
  const donateBtn = document.getElementById("paystackBtn");
  if (!donateBtn) return; // stop if button not found

  donateBtn.addEventListener("click", () => {
    try {
      const handler = PaystackPop.setup({
        key: 'pk_live_1a6c2639cf72cbba335936ffe2d34a8f8f82bc1b', // your Paystack public key
        email: 'faiselali@protonmail.com',
        amount: 100, // GHS 1.00 (in pesewas)
        currency: 'GHS',
        ref: 'DON-' + Date.now(), // unique donation reference
        callback: function (response) {
          alert('Donation successful! Reference: ' + response.reference);
        },
        onClose: function () {
          console.log('Donation popup closed.');
        }
      });
      handler.openIframe();
    } catch (err) {
      console.error('Paystack init failed:', err);
    }
  });
});
