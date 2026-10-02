import { calculateRouteDistance } from './general-js/routing.js';
// ---------- State ----------
let pending = null; // data from car-details
let car = null; // full car from cars.json
let extrasTotal = 0;
let currentStep = 1;

// ---------- Helpers ----------
function getPendingBooking() {
  const raw = localStorage.getItem("velox-pending-booking");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loadCars() {
  try {
    const res = await fetch("../data/cars.json");
    if (!res.ok) throw new Error("Failed to load cars");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatMoney(amount) {
  return Number(amount).toLocaleString() + " XAF";
}

// ---------- Summary (left column) ----------
function renderSummary() {
  if (!pending) return;

  // Text
  document.getElementById("summary-brand").textContent = car?.brand || "";
  document.getElementById("summary-name").textContent =
    pending.carName || car?.name || "";
  document.getElementById("summary-pickup").textContent =
    pending.pickupLocation || "—";
  document.getElementById("summary-dropoff").textContent =
    pending.dropoffLocation || "—";
  document.getElementById("summary-pickup-date").textContent =
    `${pending.pickupDate}`;
  document.getElementById("summary-dropoff-date").textContent =
    `${pending.returnDate}`;
  document.getElementById("summary-days").textContent = pending.days || 0;

  // Image
  const img = document.getElementById("summary-image");
  if (img) {
    img.src = car?.image || "";
    img.alt = pending.carName || "Car";
  }

  updateTotal();
}

function updateTotal() {
  const base = Number(pending?.total) || 0;
  const grand = base + extrasTotal;

  const el = document.getElementById("summary-total");
  if (el) el.textContent = formatMoney(grand);

  return grand;
}

// ---------- Extras ----------
function setupExtras() {
  const checkboxes = document.querySelectorAll(
    ".extra-item input[type='checkbox']",
  );

  checkboxes.forEach((box) => {
    box.addEventListener("change", () => {
      extrasTotal = 0;

      checkboxes.forEach((cb) => {
        if (cb.checked) {
          extrasTotal += Number(cb.dataset.price) || 0;
        }
      });

      updateTotal();
    });
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
  localStorage.setItem("velox-return-url", "booking.html");
  alert("Please log in to complete your booking.");
  window.location.href = "login.html";
  return;
}
  pending = getPendingBooking();

  // No pending booking → send user back to fleet
  if (!pending || !pending.carId) {
    alert("No booking in progress. Choose a car first.");
    window.location.href = "cars.html";
    return;
  }

  const cars = await loadCars();
  car = cars.find((c) => c.id === pending.carId) || null;

  renderSummary();
  setupExtras();
  setupStepButtons();
  setupPaymentMethods();
  setupPayButton();
  setupSuccessModal();
  goToStep(1);
  updateCheckoutTotal()

  // We’ll add step navigation next
});
function goToStep(step) {
  currentStep = step;

  // Show only the active panel
  document.querySelectorAll(".step-panel").forEach((panel) => {
    const id = panel.id; // "step-1", "step-2", ...
    const num = Number(id.replace("step-", ""));
    panel.hidden = num !== step;
  });

  // Update progress steps (circles + labels)
  document.querySelectorAll(".progress-step").forEach((el) => {
    const num = Number(el.dataset.step);
    el.classList.remove("active", "done");
    if (num === step) el.classList.add("active");
    if (num < step) el.classList.add("done");
  });

  // Progress bar width (4 steps → 25%, 50%, 75%, 100%)
  const fill = document.getElementById("progress-fill");
  if (fill) fill.style.width = `${(step / 4) * 100}%`;
}
function setupStepButtons() {
  // Step 1 → 2
  document.getElementById("to-step-2")?.addEventListener("click", () => {
    goToStep(2);
  });

  // Step 2 → 1
  document.getElementById("back-to-1")?.addEventListener("click", () => {
    goToStep(1);
  });

  // Step 2 form submit → 3
  document.getElementById("details-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Basic check (browser also uses "required")
    const name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const licence = document.getElementById("licence").value.trim();

    if (!name || !email || !phone || !licence) {
      alert("Please fill in all driver details.");
      return;
    }

    goToStep(3);
  });

  // Step 3 → 2
  document.getElementById("back-to-2")?.addEventListener("click", () => {
    goToStep(2);
  });
}
function setupPaymentMethods() {
  const methods = document.querySelectorAll(".pay-method");
  const formCard = document.getElementById("form-card");
  const formMomo = document.getElementById("form-momo");
  const formOrange = document.getElementById("form-orange");

  methods.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Active button style
      methods.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const method = btn.dataset.method; // "card" | "momo" | "orange"

      // Show the matching form
      if (formCard) formCard.hidden = method !== "card";
      if (formMomo) formMomo.hidden = method !== "momo";
      if (formOrange) formOrange.hidden = method !== "orange";
    });
  });
}
function collectBookingData() {
  const methodBtn = document.querySelector(".pay-method.active");
  const method = methodBtn ? methodBtn.dataset.method : "card";

  const driver = {
    fullName: document.getElementById("full-name")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    licence: document.getElementById("licence")?.value.trim() || "",
  };

  // Which extras were checked
  const selectedExtras = [];
  document.querySelectorAll(".extra-item input:checked").forEach((cb) => {
    selectedExtras.push({
      id: cb.dataset.extra,
      price: Number(cb.dataset.price) || 0,
    });
  });

  const baseTotal = Number(pending?.total) || 0;
  const grandTotal = baseTotal + extrasTotal;

  return {
    id: "VX-" + Date.now(), // simple unique id
    createdAt: new Date().toISOString(),
    carId: pending.carId,
    carName: pending.carName,
    carImage: car?.image || "",
    brand: car?.brand || "",
    pickupLocation: pending.pickupLocation,
    dropoffLocation: pending.dropoffLocation,
    pickupDate: pending.pickupDate,
    returnDate: pending.returnDate,
    days: pending.days,
    pricePerDay: Currency.format(pending.pricePerDay),
    extras: selectedExtras,
    extrasTotal,
    total: grandTotal,
    driver,
    paymentMethod: method,
    status: "confirmed",
  };
}
function saveBooking(booking) {
  const key = "velox-bookings";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(booking);
  localStorage.setItem(key, JSON.stringify(existing));

  // Clear the pending booking so it can’t be submitted again
  localStorage.removeItem("velox-pending-booking");
}
function openSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) modal.hidden = false;
  document.body.style.overflow = "hidden";
  goToStep(4); // mark progress as Done
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
}
function setupPayButton() {
  const payBtn = document.getElementById("pay-button");
  const loading = document.getElementById("pay-loading");

  if (!payBtn) return;

  payBtn.addEventListener("click", () => {
    // Very light validation – you can tighten later
    const method = document.querySelector(".pay-method.active")?.dataset.method;

    if (method === "card") {
      const num = document.getElementById("card-number")?.value.trim();
      if (!num) {
        alert("Enter card details");
        return;
      }
    }
    if (method === "momo") {
      const num = document.getElementById("momo-number")?.value.trim();
      if (!num) {
        alert("Enter MoMo number");
        return;
      }
    }
    if (method === "orange") {
      const num = document.getElementById("orange-number")?.value.trim();
      if (!num) {
        alert("Enter Orange Money number");
        return;
      }
    }

    // Show loading
    if (loading) loading.hidden = false;
    payBtn.disabled = true;

    // Simulate network delay (1.5s)
    setTimeout(() => {
      const booking = collectBookingData();
      saveBooking(booking);

      if (loading) loading.hidden = true;
      payBtn.disabled = false;

      // Keep the booking in memory for the voucher
      window.lastBooking = booking;

      openSuccessModal();
    }, 1500);
  });
}
function setupSuccessModal() {
  document.getElementById("close-success")?.addEventListener("click", () => {
    closeSuccessModal();
  });

  document.getElementById("download-voucher")?.addEventListener("click", () => {
    downloadVoucher(window.lastBooking);
  });
}
function downloadVoucher(booking) {
  if (!booking) return;

  const extrasList =
    booking.extras && booking.extras.length
      ? booking.extras
          .map(
            (e) =>
              `<li>${e.id} (+${Number(e.price).toLocaleString()} XAF)</li>`,
          )
          .join("")
      : "<li>None</li>";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VELOX Voucher – ${booking.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #f5f5f5;
      color: #111;
      padding: 40px 20px;
    }
    .voucher {
      max-width: 640px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: #080a0a;
      color: #f5f7f2;
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: "Space Grotesk", system-ui, sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.08em;
    }
    .logo span { color: #c7ff2e; }
    .badge {
      background: #c7ff2e;
      color: #080a0a;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 999px;
      letter-spacing: 0.06em;
    }
    .body { padding: 32px; }
    h1 {
      font-family: "Space Grotesk", system-ui, sans-serif;
      font-size: 1.35rem;
      margin-bottom: 4px;
    }
    .muted { color: #666; font-size: 0.9rem; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 32px;
      margin-bottom: 28px;
    }
    .label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 4px;
    }
    .value { font-weight: 600; font-size: 0.95rem; }
    .section-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #888;
      margin: 24px 0 12px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    ul { padding-left: 18px; }
    li { margin-bottom: 4px; }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 28px;
      padding: 16px 20px;
      background: #080a0a;
      color: #f5f7f2;
      border-radius: 8px;
    }
    .total-row strong {
      color: #c7ff2e;
      font-size: 1.25rem;
    }
    .footer {
      margin-top: 28px;
      font-size: 0.8rem;
      color: #888;
      line-height: 1.6;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .voucher { border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="voucher">
    <div class="header">
      <div class="logo">VEL<span>OX</span></div>
      <div class="badge">CONFIRMED</div>
    </div>
    <div class="body">
      <h1>Booking Voucher</h1>
      <p class="muted">${booking.id} · ${new Date(booking.createdAt).toLocaleString()}</p>

      <div class="grid">
        <div>
          <p class="label">Vehicle</p>
          <p class="value">${booking.carName}</p>
        </div>
        <div>
          <p class="label">Brand</p>
          <p class="value">${booking.brand || "—"}</p>
        </div>
        <div>
          <p class="label">Pickup</p>
          <p class="value">${booking.pickupLocation}</p>
        </div>
        <div>
          <p class="label">Drop-off</p>
          <p class="value">${booking.dropoffLocation}</p>
        </div>
        <div>
          <p class="label">Dates</p>
          <p class="value">${booking.pickupDate} → ${booking.returnDate}</p>
        </div>
        <div>
          <p class="label">Days</p>
          <p class="value">${booking.days}</p>
        </div>
      </div>

      <p class="section-title">Driver</p>
      <div class="grid">
        <div>
          <p class="label">Name</p>
          <p class="value">${booking.driver.fullName}</p>
        </div>
        <div>
          <p class="label">Phone</p>
          <p class="value">${booking.driver.phone}</p>
        </div>
        <div>
          <p class="label">Email</p>
          <p class="value">${booking.driver.email}</p>
        </div>
        <div>
          <p class="label">Licence</p>
          <p class="value">${booking.driver.licence}</p>
        </div>
      </div>

      <p class="section-title">Extras</p>
      <ul>${extrasList}</ul>

      <p class="section-title">Payment</p>
      <p class="value" style="text-transform:capitalize">${booking.paymentMethod}</p>

      <div class="total-row">
        <span>Total paid</span>
        <strong>${Currency.format(Number(booking.total).toLocaleString())}</strong>
      </div>

      <p class="footer">
        Present this voucher (digital or printed) at pickup together with your
        physical driver’s licence and a valid ID. A security deposit hold may
        be placed on your card. Thank you for driving with VELOX.
      </p>
    </div>
  </div>
  <script>
    window.onload = function () {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();

  const voucherWindow = window.open("", "_blank");
  if (!voucherWindow) {
    alert("Please allow pop-ups to view your voucher.");
    return;
  }
  voucherWindow.document.write(html);
  voucherWindow.document.close();
}


async function updateCheckoutTotal() {
  const pickup = "Limbe";
  const dropoff = "Yaoundé Nsimalen Airport";
  const baseCarPrice = 1200000; // XAF

  const route = await calculateRouteDistance(pickup, dropoff);

  if (route.deliveryFeeXAF > 0) {
    console.log(`Distance: ${route.distanceKm} km`);
    console.log(`Delivery Fee: +${route.deliveryFeeXAF.toLocaleString()} XAF`);
    
    // Display on UI
    const feeLabel = document.getElementById("delivery-fee");
    if (feeLabel) {
      feeLabel.textContent = `+${route.deliveryFeeXAF.toLocaleString()} XAF (${route.distanceKm} km cross-city delivery)`;
    }
  }

  const grandTotal = baseCarPrice + route.deliveryFeeXAF;
  console.log("Grand Total:", grandTotal);
}
