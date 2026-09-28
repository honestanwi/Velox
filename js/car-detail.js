let currentCar = null;
let currentColor = null;
let lightboxImages = [];
let lightboxIndex = 0;

function getCarIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : null;
}

async function loadCars() {
  try {
    const response = await fetch("../data/cars.json");
    if (!response.ok) throw new Error("Failed to load cars data");
    return await response.json();
  } catch (err) {
    console.error("Error loading cars:", err);
    return [];
  }
}

function getFavorites() {
  const stored = localStorage.getItem("velox-favorites");
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(ids) {
  localStorage.setItem("velox-favorites", JSON.stringify(ids));
}

function isFavorite(carId) {
  return getFavorites().includes(carId);
}

// ---------- UI builders ----------
function renderSpecs(car) {
  const grid = document.getElementById("specs-grid");
  if (!grid) return;

  const specs = [
    { label: "Type", value: car.type },
    { label: "Category", value: car.category },
    { label: "Seats", value: `${car.seats}` },
    { label: "Transmission", value: car.transmission },
    { label: "Fuel", value: car.fuel },
    { label: "Year", value: String(car.year) },
  ];

  if (car.horsepower) {
    specs.push({ label: "Horsepower", value: `${car.horsepower} hp` });
  }

  grid.innerHTML = specs
    .map(
      (s) => `
      <div class="spec-card fade-in">
        <span class="spec-label">${s.label}</span>
        <span class="spec-value">${s.value}</span>
      </div>
    `,
    )
    .join("");
}

function renderColorSwatches(car) {
  const container = document.getElementById("color-swatches");
  if (!container || !car.colors || car.colors.length === 0) {
    if (container) container.innerHTML = "";
    return;
  }

  const defaultName = car.defaultColor || car.colors[0].name;

  container.innerHTML = car.colors
    .map((color) => {
      const isActive = color.name === defaultName;
      return `
        <button
          type="button"
          class="color-swatch ${isActive ? "active" : ""}"
          style="background-color: ${color.hex}"
          data-name="${color.name}"
          title="${color.name}"
          aria-label="Select colour ${color.name}"
        ></button>
      `;
    })
    .join("");

  container.querySelectorAll(".color-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      selectColor(name);
    });
  });
}

function getColorByName(car, name) {
  if (!car.colors) return null;
  return car.colors.find((c) => c.name === name) || car.colors[0];
}

function selectColor(colorName) {
  if (!currentCar) return;

  const color = getColorByName(currentCar, colorName);
  if (!color) return;

  currentColor = color;

  // Update swatch active state
  document.querySelectorAll(".color-swatch").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.name === color.name);
  });

  // Update label
  const label = document.getElementById("selected-color-name");
  if (label) label.textContent = color.name;

  // Prefer first exterior image of this color for hero;
  // fall back to car.image if none
  const exterior = color.images?.exterior || [];
  const heroSrc = exterior.length > 0 ? exterior[0] : currentCar.image;

  updateHeroImage(heroSrc);
  renderGalleries(color);
}

function updateHeroImage(src) {
  const img = document.getElementById("hero-image");
  if (!img) return;

  img.style.opacity = "0";
  const temp = new Image();
  temp.onload = () => {
    img.src = src;
    img.alt = currentCar ? currentCar.name : "";
    requestAnimationFrame(() => {
      img.style.opacity = "1";
    });
  };
  temp.onerror = () => {
    img.src = currentCar.image;
    img.style.opacity = "1";
  };
  temp.src = src;
}

function renderGalleries(color) {
  const exteriorGrid = document.getElementById("exterior-gallery");
  const interiorGrid = document.getElementById("interior-gallery");

  const exterior = color?.images?.exterior || [];
  const interior = color?.images?.interior || [];

  renderGallery(exteriorGrid, exterior, "Exterior");
  renderGallery(interiorGrid, interior, "Interior");
}

function renderGallery(container, images, label) {
  if (!container) return;

  if (!images || images.length === 0) {
    container.innerHTML = `
      <p class="gallery-empty">No ${label.toLowerCase()} images for this colour yet.</p>
    `;
    return;
  }

  container.innerHTML = images
    .map(
      (src, index) => `
      <div class="gallery-item fade-in" data-src="${src}" data-index="${index}" data-gallery="${label.toLowerCase()}">
        <img src="${src}" alt="${currentCar.name} – ${label} ${index + 1}" loading="lazy" />
      </div>
    `,
    )
    .join("");

  container.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const galleryType = item.dataset.gallery;
      const color = currentColor;
      const list =
        galleryType === "exterior"
          ? color?.images?.exterior || []
          : color?.images?.interior || [];
      openLightbox(
        list,
        Number(item.dataset.index),
        `${currentCar.name} – ${label}`,
      );
    });
  });
}

// ---------- Lightbox ----------
function openLightbox(images, startIndex, captionPrefix) {
  lightboxImages = images;
  lightboxIndex = startIndex;

  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");

  if (!lightbox || !img) return;

  img.src = images[startIndex];
  if (caption) {
    caption.textContent = `${captionPrefix} (${startIndex + 1} / ${images.length})`;
  }
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.hidden = true;
  document.body.style.overflow = "";
}

function lightboxNavigate(dir) {
  if (lightboxImages.length === 0) return;
  lightboxIndex =
    (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  const img = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  if (img) img.src = lightboxImages[lightboxIndex];
  if (caption) {
    caption.textContent = `${currentCar.name} (${lightboxIndex + 1} / ${lightboxImages.length})`;
  }
}

function setupLightbox() {
  document
    .getElementById("lightbox-close")
    ?.addEventListener("click", closeLightbox);
  document
    .getElementById("lightbox-prev")
    ?.addEventListener("click", () => lightboxNavigate(-1));
  document
    .getElementById("lightbox-next")
    ?.addEventListener("click", () => lightboxNavigate(1));

  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lightboxNavigate(-1);
    if (e.key === "ArrowRight") lightboxNavigate(1);
  });
}

// ---------- Favorite ----------
function setupFavorite(car) {
  const btn = document.getElementById("favorite-btn");
  if (!btn) return;

  const heart = btn.querySelector(".heart");
  const updateUI = () => {
    const fav = isFavorite(car.id);
    btn.classList.toggle("active", fav);
    if (heart) heart.textContent = fav ? "♥" : "♡";
  };

  updateUI();

  btn.addEventListener("click", () => {
    let favorites = getFavorites();
    if (favorites.includes(car.id)) {
      favorites = favorites.filter((id) => id !== car.id);
    } else {
      favorites.push(car.id);
    }
    saveFavorites(favorites);
    updateUI();
  });
}
function hideLoading() {
  const loading = document.getElementById("loading-state");
  if (loading) loading.hidden = true;
}

// ---------- Main render ----------
function renderCar(car) {
  currentCar = car;

  document.title = `${car.name} | Velox`;

  // Hero text
  const categoryEl = document.getElementById("hero-category");
  const titleEl = document.getElementById("hero-title");
  const brandEl = document.getElementById("hero-brand");
  const priceEl = document.getElementById("hero-price");

  if (categoryEl) categoryEl.textContent = car.category || "";
  if (titleEl) titleEl.textContent = car.name || "";
  if (brandEl) brandEl.textContent = car.brand || "";
  if (priceEl) {
    priceEl.textContent = Number(car.price).toLocaleString();
  }

  // Default color
  const defaultName = car.defaultColor || (car.colors && car.colors[0]?.name);
  const defaultColor = getColorByName(car, defaultName);

  // Hero image: prefer default color first exterior, else car.image
  const heroSrc = defaultColor?.images?.exterior?.[0] || car.image;
  const heroImg = document.getElementById("hero-image");
  if (heroImg) {
    heroImg.src = heroSrc;
    heroImg.alt = car.name;
  }

  renderSpecs(car);
  renderColorSwatches(car);
  selectColor(defaultName); // sets currentColor + galleries
  setupFavorite(car);
  setupDatePickers(car);
  setupLocationListeners();
  updateBookingSummary(); // initial state (button disabled)
  // Show main, hide loading
  hideLoading();
  const main = document.getElementById("details-main");
  if (main) main.hidden = false;
}

function showError() {
  hideLoading();
  const error = document.getElementById("error-state");
  if (error) error.hidden = false;
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  setupLightbox();

  const id = getCarIdFromURL();
  if (id == null || Number.isNaN(id)) {
    showError();
    return;
  }

  const cars = await loadCars();
  const car = cars.find((c) => c.id === id);

  if (!car) {
    showError();
    return;
  }

  renderCar(car);
  setupBookButton();
});
function getDisabledDates(car) {
  // Returns an array of date strings that flatpickr should disable
  if (!car.bookings || car.bookings.length === 0) return [];

  const disabled = [];

  car.bookings.forEach((booking) => {
    const start = new Date(booking.start);
    const end = new Date(booking.end);

    // Loop every day from start to end (inclusive)
    const current = new Date(start);
    while (current <= end) {
      // flatpickr likes "YYYY-MM-DD"
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      disabled.push(`${y}-${m}-${d}`);

      current.setDate(current.getDate() + 1);
    }
  });

  return disabled;
}
function calculateDays(pickupStr, returnStr) {
  if (!pickupStr || !returnStr) return 0;

  const pickup = new Date(pickupStr);
  const returnD = new Date(returnStr);

  // Invalid range
  if (returnD < pickup) return 0;

  // Difference in milliseconds → days
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = returnD - pickup;

  // +1 because both pickup and return days are charged
  return Math.floor(diff / msPerDay) + 1;
}
function updateBookingSummary() {
  const pickupDate = document.getElementById("pickup-date")?.value || "";
  const returnDate = document.getElementById("return-date")?.value || "";
  const pickupLoc = document.getElementById("pickup-location")?.value || "";
  const dropoffLoc = document.getElementById("dropoff-location")?.value || "";

  const days = calculateDays(pickupDate, returnDate);
  const total = days * (currentCar?.price || 0);

  const daysEl = document.getElementById("rental-days");
  const totalEl = document.getElementById("total-price");
  const bookBtn = document.getElementById("book-button");

  if (daysEl) daysEl.textContent = days;
  if (totalEl) {
    totalEl.textContent = total > 0 ? `${total.toLocaleString()} XAF` : "0 XAF";
  }

  // Enable button only when everything is filled and days > 0
  const isValid =
    pickupLoc && dropoffLoc && pickupDate && returnDate && days > 0;

  if (bookBtn) bookBtn.disabled = !isValid;
}
function setupDatePickers(car) {
  const disabledDates = getDisabledDates(car);

  const commonOptions = {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: disabledDates,
    onChange: updateBookingSummary,
  };

  // Pickup
  flatpickr("#pickup-date", {
    ...commonOptions,
    onChange: function (selectedDates, dateStr) {
      // When pickup changes, set return minDate to that day
      if (returnPicker) {
        returnPicker.set("minDate", dateStr || "today");
      }
      updateBookingSummary();
    },
  });

  // Return
  const returnPicker = flatpickr("#return-date", {
    ...commonOptions,
  });
}
function setupLocationListeners() {
  ["pickup-location", "dropoff-location"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", updateBookingSummary);
  });
}
function setupBookButton() {
  const btn = document.getElementById("book-button");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (btn.disabled || !currentCar) return;

    const bookingData = {
      carId: currentCar.id,
      carName: currentCar.name,
      pricePerDay: currentCar.price,
      pickupLocation: document.getElementById("pickup-location").value,
      dropoffLocation: document.getElementById("dropoff-location").value,
      pickupDate: document.getElementById("pickup-date").value,
      returnDate: document.getElementById("return-date").value,
      days: Number(document.getElementById("rental-days").textContent),
      total:
        currentCar.price *
        Number(document.getElementById("rental-days").textContent),
    };

    // Save for the booking page (we’ll build that next)
    localStorage.setItem("velox-pending-booking", JSON.stringify(bookingData));

    // Go to booking / checkout page
    window.location.href = "booking.html"; // adjust path if needed
  });
}
