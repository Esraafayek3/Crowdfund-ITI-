document.addEventListener("DOMContentLoaded", () => {
  const payButton = document.getElementById("payButton");
  const paymentModal = document.getElementById("paymentModal");
  const confirmPayBtn = document.getElementById("confirmPayBtn");
  const cancelPayBtn = document.getElementById("cancelPayBtn");
  const closeButton = document.querySelector(".close-button");
  const statusMessage = document.getElementById("statusMessage");

  const showModal = () => {
    paymentModal.style.display = "flex";
    statusMessage.textContent = "";
  };

  const hideModal = () => {
    paymentModal.style.display = "none";
  };

  const simulatePayment = () => {
    statusMessage.textContent = "Processing your payment...";

    setTimeout(() => {
      hideModal();
      statusMessage.textContent =
        "Payment successful! Thank you for your support.";
      statusMessage.style.color = "#eb5b4e";
    }, 2000);
  };

  payButton.addEventListener("click", showModal);
  confirmPayBtn.addEventListener("click", simulatePayment);
  cancelPayBtn.addEventListener("click", hideModal);
  closeButton.addEventListener("click", hideModal);

  paymentModal.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
      hideModal();
    }
  });
});
