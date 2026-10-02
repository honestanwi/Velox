import { getBookingWeather } from './general-js/weather.js';

/* ---------- Storage helpers ---------- */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("velox-user") || "null");
  } catch {
    return null;
  }
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem("velox-users") || "[]");
  } catch {
    return [];
  }
}

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem("velox-bookings") || "[]");
  } catch {
    return [];
  }
}

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem("velox-favorites") || "[]");
  } catch {
    return [];
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

/* ---------- User header ---------- */
function renderUser(user) {
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const avatarEl = document.getElementById("profile-avatar");
  const memberEl = document.getElementById("profile-member");

  if (nameEl) nameEl.textContent = user.name || "Driver";
  if (emailEl) emailEl.textContent = user.email || "";

  if (avatarEl) {
    avatarEl.textContent = (user.name || user.email || "?").charAt(0).toUpperCase();
  }

  const full = getStoredUsers().find(
    (u) => u.id === user.id || u.email === user.email
  );
  if (memberEl && full?.createdAt) {
    memberEl.textContent = `Member since ${new Date(full.createdAt).toLocaleDateString()}`;
  }
}

function setupLogout() {
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("velox-user");
    window.location.href = "login.html";
  });
}

/* ---------- Days left ---------- */
function getDaysLeftInfo(pickupStr, returnStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickup = new Date(pickupStr);
  const ret = new Date(returnStr);
  pickup.setHours(0, 0, 0, 0);
  ret.setHours(0, 0, 0, 0);

  const ms = 1000 * 60 * 60 * 24;

  if (today < pickup) {
    const days = Math.ceil((pickup - today) / ms);
    return {
      label: `${days} day${days === 1 ? "" : "s"} until pickup`,
      status: "upcoming",
    };
  }
  if (today <= ret) {
    const days = Math.ceil((ret - today) / ms);
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      status: "active",
    };
  }
  return { label: "Completed", status: "completed" };
}

/* ---------- Voucher ---------- */
function buildVoucherHTML(booking, autoPrint = false) {
  const extrasList =
    booking.extras && booking.extras.length
      ? booking.extras
          .map(
            (e) =>
              `<li>${e.id} (+${Number(e.price).toLocaleString()} XAF)</li>`
          )
          .join("")
      : "<li>None</li>";

  const qrPayload = encodeURIComponent(
    `VELOX|${booking.id}|${booking.carName}|${booking.pickupDate}|${booking.returnDate}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${qrPayload}`;

  const printScript = autoPrint
    ? `<script>window.onload = function () { window.print(); };<\/script>`
    : "";

  return `<!DOCTYPE html>
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
    .total-row strong { color: #c7ff2e; font-size: 1.25rem; }
    .qr-block {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 28px;
      padding: 16px;
      border: 1px dashed #ccc;
      border-radius: 10px;
      background: #fafafa;
    }
    .qr-block img {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      background: #fff;
    }
    .qr-text { font-size: 0.85rem; color: #555; line-height: 1.5; }
    .qr-text strong {
      display: block;
      color: #111;
      margin-bottom: 4px;
      font-size: 0.9rem;
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
          <p class="value">${booking.driver?.fullName || "—"}</p>
        </div>
        <div>
          <p class="label">Phone</p>
          <p class="value">${booking.driver?.phone || "—"}</p>
        </div>
        <div>
          <p class="label">Email</p>
          <p class="value">${booking.driver?.email || "—"}</p>
        </div>
        <div>
          <p class="label">Licence</p>
          <p class="value">${booking.driver?.licence || "—"}</p>
        </div>
      </div>

      <p class="section-title">Extras</p>
      <ul>${extrasList}</ul>

      <p class="section-title">Payment</p>
      <p class="value" style="text-transform:capitalize">${booking.paymentMethod || "—"}</p>

      <div class="total-row">
        <span>Total paid</span>
        <strong>${Currency.format(Number(booking.total).toLocaleString())}</strong>
      </div>

      <div class="qr-block">
        <img src="${qrUrl}" alt="Booking QR code" width="120" height="120" />
        <div class="qr-text">
          <strong>Scan at pickup</strong>
          Show this code at the branch desk for faster verification.
          Code: ${booking.id}
        </div>
      </div>

      <p class="footer">
        Present this voucher (digital or printed) at pickup together with your
        physical driver’s licence and a valid ID. Thank you for driving with VELOX.
      </p>
    </div>
  </div>
  ${printScript}
</body>
</html>`;
}

function openVoucher(booking, autoPrint = false) {
  if (!booking) return;
  const html = buildVoucherHTML(booking, autoPrint);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups to view your voucher.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

/* ---------- Bookings & Weather Integration ---------- */
async function renderBookings(user, cars) {
  const list = document.getElementById("bookings-list");
  const empty = document.getElementById("bookings-empty");
  if (!list || !empty) return;

  const all = getBookings();
  const mine = all.filter(
    (b) =>
      b.driver?.email === user.email ||
      b.userId === user.id ||
      b.userEmail === user.email
  );

  mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (mine.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  list.innerHTML = mine
    .map((b) => {
      const car = cars.find((c) => c.id === b.carId);
      const image = b.carImage || car?.image || "";
      const info = getDaysLeftInfo(b.pickupDate, b.returnDate);

      return `
        <article class="booking-card" data-id="${b.id}">
          <div class="booking-card__main">
            <img class="booking-card__img" src="${image}" alt="${b.carName}" />
            <div class="booking-card__info">
              <div class="booking-card__top">
                <h3>${b.carName}</h3>
                <span class="booking-status booking-status--${info.status}">${info.label}</span>
              </div>
              <p class="booking-id">${b.id}</p>
              <div class="booking-meta">
                <div><span>Pickup</span><strong>${b.pickupLocation}</strong></div>
                <div><span>Drop-off</span><strong>${b.dropoffLocation}</strong></div>
                <div><span>Dates</span><strong>${b.pickupDate} → ${b.returnDate}</strong></div>
                <div><span>Days</span><strong>${b.days}</strong></div>
                <div><span>Total</span><strong class="lime">${Currency.format(Number(b.total).toLocaleString())}</strong></div>
              </div>
              <!-- Weather Badge Container -->
              <div class="weather-badge" id="weather-${b.id}" style="margin-top: 12px;"></div>
            </div>
          </div>
          <div class="booking-card__actions">
            <button type="button" class="btn-secondary view-voucher" data-id="${b.id}">
              View voucher
            </button>
            <button type="button" class="btn-primary download-voucher" data-id="${b.id}">
              Download voucher
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach button click listeners
  list.querySelectorAll(".view-voucher").forEach((btn) => {
    btn.addEventListener("click", () => {
      const booking = mine.find((b) => b.id === btn.dataset.id);
      openVoucher(booking, false);
    });
  });

  list.querySelectorAll(".download-voucher").forEach((btn) => {
    btn.addEventListener("click", () => {
      const booking = mine.find((b) => b.id === btn.dataset.id);
      openVoucher(booking, true);
    });
  });

  // Fetch and display weather dynamically for each booking card
  for (const b of mine) {
    const weatherContainer = document.getElementById(`weather-${b.id}`);
    if (weatherContainer) {
      const weather = await getBookingWeather(b.pickupLocation, b.pickupDate);
      if (weather) {
        weatherContainer.innerHTML = `
          <div style="background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border, #333); display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem;">
            
            <span><strong>${weather.temp}</strong> — ${weather.condition} expected at pickup</span>
          </div>
        `;
      }
    }
  }
}

/* ---------- Favorites ---------- */
function renderFavorites(cars) {
  const grid = document.getElementById("favorites-grid");
  const empty = document.getElementById("favorites-empty");
  if (!grid || !empty) return;

  const ids = getFavoriteIds();
  const favCars = cars.filter((c) => ids.includes(c.id));

  if (favCars.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = favCars
    .map(
      (car) => `
      <a class="fav-card" href="car-details.html?id=${car.id}">
        <img src="${car.image}" alt="${car.name}" />
        <div>
          <p class="fav-brand">${car.brand}</p>
          <h3>${car.name}</h3>
          <p class="fav-price">${Number(car.price).toLocaleString()} XAF / day</p>
        </div>
      </a>
    `
    )
    .join("");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();

  if (!user) {
    localStorage.setItem("velox-return-url", "profile.html");
    window.location.href = "login.html";
    return;
  }

  renderUser(user);
  setupLogout();

  const cars = await loadCars();
  await renderBookings(user, cars);
  renderFavorites(cars);
});