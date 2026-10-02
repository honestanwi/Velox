
let allCars = [];

async function loadCars() {
  try {
    const response = await fetch("../data/cars.json");

    if (!response.ok) {
      throw new Error("Failed to load cars data");
    }

    const cars = await response.json();
    return cars;
  } catch (error) {
    console.error("Error loading cars:", error);
    return [];
  }
}

function isCarAvailable(car, pickupDate, returnDate) {
  if (!car.colors || car.colors.length === 0) return true;

  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);

  return car.colors.some((color) => {
    if (!color.bookings || color.bookings.length === 0) return true;

    return !color.bookings.some((b) => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      return pickup <= end && returnD >= start;
    });
  });
}

// Smooth anchor scrolling
// document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
//   anchor.addEventListener("click", (e) => {
//     const targetId = anchor.getAttribute("href");
//     if (targetId && targetId !== "#") {
//       const targetElement = document.querySelector(targetId);
//       if (targetElement) {
//         e.preventDefault();
//         if (lenis) {
//           lenis.scrollTo(targetElement, { offset: -40, duration: 1.3 });
//         } else {
//           targetElement.scrollIntoView({ behavior: "smooth" });
//         }
//       }
//     }
//   });
// });

// =====================================
// VIDEO HERO ENTRANCE & PARALLAX TIMELINE
// =====================================
function initVideoHero() {
  const video = document.getElementById("hero-video");
  const progressBar = document.getElementById("video-progress-bar");

  //   // Ensure video autoplays safely
  if (video) {
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        document.body.addEventListener(
          "click",
          () => {
            video.play();
          },
          { once: true },
        );
      });
    }

    //     // Video playback progress bar scrubber
    video.addEventListener("timeupdate", () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      }
    });
  }

  //   // Hero entrance animation
  const heroTl = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  heroTl
    .fromTo(
      ".hero-video",
      { scale: 1.15, filter: "brightness(0.3) contrast(1.2)" },
      {
        scale: 1.0,
        filter: "brightness(1) contrast(1.08)",
        duration: 1.8,
        ease: "power2.out",
      },
    )

    .from(".hero-badge", { y: 30, opacity: 0, duration: 0.6 }, "-=1.0")
    .from(".hero-title", { y: 70, opacity: 0, duration: 0.9 }, "-=0.7")
    .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6 }, "-=0.5")
    .from(
      ".hero-actions .hero-btn",
      { y: 25, opacity: 0, stagger: 0.12, duration: 0.6 },
      "-=0.4",
    )
    .from(".scroll-cue", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3");

  //   // ScrollTrigger parallax & depth zoom on scroll
  gsap.to(".hero-video", {
    scale: 1.18,
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: ".video-hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero-content", {
    yPercent: -20,
    opacity: 0,
    ease: "power1.in",
    scrollTrigger: {
      trigger: ".video-hero",
      start: "center center",
      end: "bottom top",
      scrub: true,
    },
  });
}


// Initialise everything once DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  initVideoHero();
  // setupBackToTop();
  allCars = await loadCars();
  console.log("Loaded cars:", allCars); // you can keep this for now
  renderCars(allCars); // show all 40 cars
  setupFilters();
  setupSearch();
  setupClearFilters();
  setupDateFilters();
  setupFavorites();
  setupCurrencySwitcher(); // see below

  // 3. When user changes currency → redraw grid
  document.addEventListener("currency:change", () => {
    applyFilters(); // uses Currency.format again inside createCarCard
  });
});
function createCarCard(car) {
  // 1. Create the outer container
  const card = document.createElement("article");
  card.classList.add("car-card");

  // 2. Build the entire inner HTML using a template literal
  //    (the backticks ` allow us to write multi-line HTML easily)
  card.innerHTML = `
    <div class="car-card-image">
      <img src="${car.image}" alt="${car.name}" loading="lazy" />
      
      <button 
  class="favorite-button ${isFavorite(car.id) ? "active" : ""}" 
  aria-label="Add ${car.name} to favorites"
  data-id="${car.id}"
>
  ${isFavorite(car.id) ? "♥" : "♡"}
</button>
    </div>

    <div class="car-card-info">
      <h2 class="car-card-name">${car.name}</h2>
      <div class="car-card-meta">
        <span class="car-card-category">${car.category}</span>
        <p class="car-card-price">
          ${Currency.format(car.price)}
          <span>/ day</span>
        </p>
      </div>
    </div>

    <div class="car-card-overlay">
      <div class="car-card-overlay-content">
      <h3 class="car-hover-brand">
                ${car.brand}
            </h3>
        <div class="car-card-specs">
          <span>${car.type}</span>
          <span>${car.seats} Seats</span>
          <span>${car.transmission}</span>
          <span>${car.fuel}</span>
        </div>

        <a 
  href="car-details.html?id=${car.id}" 
  class="car-details magnetic-button"
>
  View Details
</a>
      </div>
    </div>
  `;
  return card;
}
function setupCurrencySwitcher() {
  const buttons = document.querySelectorAll(".currency-btn");
  if (!buttons.length || !window.Currency) return;

  const current = Currency.getCurrency();
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.currency === current);

    btn.addEventListener("click", () => {
      const code = btn.dataset.currency;
      Currency.setCurrency(code);

      buttons.forEach((b) => {
        b.classList.toggle("active", b.dataset.currency === code);
      });
    });
  });
}
// Enable smooth click-and-drag horizontal scrolling on desktop
function setupHorizontalDragScroll(row) {
  // Disable drag-to-scroll logic on touch devices so native touch scrolling and taps work cleanly
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let isDragging = false;

  row.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a, input")) return;

    isDown = true;
    isDragging = false;
    startX = e.pageX - row.offsetLeft;
    scrollLeft = row.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    row.classList.remove("is-dragging");
    setTimeout(() => {
      isDragging = false;
    }, 50);
  });

  row.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const x = e.pageX - row.offsetLeft;
    const walk = x - startX;

    if (!isDragging && Math.abs(walk) > 6) {
      isDragging = true;
      row.classList.add("is-dragging");
    }

    if (isDragging) {
      e.preventDefault();
      row.scrollLeft = scrollLeft - walk;
    }
  });

  row.addEventListener(
    "click",
    (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}

function renderCars(carsToShow) {
  const container = document.getElementById("cars-grid");
  const countEl = document.getElementById("cars-count");
  const emptyState = document.getElementById("cars-empty");

  if (!container || !countEl || !emptyState) {
    console.error("Missing elements for rendering cars");
    return;
  }

  // Clear previous content
  container.innerHTML = "";

  // Update total number of cars
  countEl.textContent = carsToShow.length;

  // Show empty state if no cars match
  if (carsToShow.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  // Group cars by category
  const categoryOrder = ["Luxury", "SUV", "Sedan", "Sports", "Electric"];

  const groupedCars = carsToShow.reduce((groups, car) => {
    const category = car.category || car.type || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(car);
    return groups;
  }, {});

  // Sort categories according to the defined order
  const sortedCategories = Object.keys(groupedCars).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Render each category section
  sortedCategories.forEach((category) => {
    const cars = groupedCars[category];

    const section = document.createElement("section");
    section.classList.add("car-category-section");

    section.innerHTML = `
      <div class="car-category-heading">
        <div>
          <p class="car-category-eyebrow">VELOX FLEET</p>
          <h2 class="car-category-title">${category}</h2>
        </div>

        <span class="car-category-count">
          ${cars.length} ${cars.length === 1 ? "vehicle" : "vehicles"}
        </span>
      </div>
    `;

    // Divide cars of this category into top and bottom individually scrollable rows
    const half = Math.ceil(cars.length / 2);
    const topCars = cars.slice(0, half);
    const bottomCars = cars.slice(half);

    const dualGrid = document.createElement("div");
    dualGrid.className = "cars-dual-grid";

    // Top row
    const topRow = document.createElement("div");
    topRow.className = "cars-scroll-row cars-row-top";
    topRow.setAttribute("data-scroll-row", "top");
    topRow.setAttribute("aria-label", "Top vehicle fleet showcase");
    topCars.forEach((car) => topRow.appendChild(createCarCard(car)));
    dualGrid.appendChild(topRow);

    // Bottom row (if available)
    if (bottomCars.length > 0) {
      const bottomRow = document.createElement("div");
      bottomRow.className = "cars-scroll-row cars-row-bottom";
      bottomRow.setAttribute("data-scroll-row", "bottom");
      bottomRow.setAttribute("aria-label", "Bottom vehicle fleet showcase");
      bottomCars.forEach((car) => bottomRow.appendChild(createCarCard(car)));
      dualGrid.appendChild(bottomRow);
    }

    container.appendChild(dualGrid);

    // Enable drag to scroll for mouse & desktop on both rows
    dualGrid
      .querySelectorAll(".cars-scroll-row")
      .forEach(setupHorizontalDragScroll);

    animateCarsIn();
  });
}

function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    // Standard click event covering both desktop and mobile
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Update the active visual state
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Apply the active category filter
      applyFilters();
    });
  });
}
function applyFilters() {
  // 1. Category
  const activeButton = document.querySelector(".filter-button.active");
  const category = activeButton ? activeButton.dataset.category : "all";

  // 2. Search text
  const searchInput = document.getElementById("car-search");
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // 3. Dates
  const pickupInput = document.getElementById("pickup-date");
  const returnInput = document.getElementById("return-date");
  const pickupDate = pickupInput ? pickupInput.value : "";
  const returnDate = returnInput ? returnInput.value : "";

  // 4. Start with all cars
  let filtered = allCars;

  // 5. Category filter
  if (category !== "all") {
    filtered = filtered.filter((car) => car.category === category);
  }

  // 6. Search filter
  if (searchText !== "") {
    filtered = filtered.filter((car) => {
      const name = car.name.toLowerCase();
      const brand = car.brand.toLowerCase();
      return name.includes(searchText) || brand.includes(searchText);
    });
  }

  // 7. Availability filter (only if both dates are selected)
  if (pickupDate && returnDate) {
    // Extra safety: return date must be after pickup date
    if (new Date(returnDate) < new Date(pickupDate)) {
      filtered = []; // invalid range → show nothing
    } else {
      filtered = filtered.filter((car) =>
        isCarAvailable(car, pickupDate, returnDate),
      );
    }
  }

  // 8. Render the final list
  renderCars(filtered);
}
function setupSearch() {
  const searchInput = document.getElementById("car-search");

  if (!searchInput) return;

  // "input" event fires every time the user types or deletes a character
  searchInput.addEventListener("input", () => {
    applyFilters();
  });
}
function setupClearFilters() {
  const clearBtn = document.getElementById("clear-filters");

  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    // 1. Clear the search input
    const pickupInput = document.getElementById("pickup-date");
    const returnInput = document.getElementById("return-date");

    const searchInput = document.getElementById("car-search");
    if (searchInput) {
      searchInput.value = "";
    }
    if (pickupInput) pickupInput.value = "";
    if (returnInput) returnInput.value = "";
    // 2. Reset category buttons – make “All” active
    const filterButtons = document.querySelectorAll(".filter-button");
    filterButtons.forEach((btn) => btn.classList.remove("active"));

    const allButton = document.querySelector(
      '.filter-button[data-category="all"]',
    );
    if (allButton) {
      allButton.classList.add("active");
    }

    // 3. Re-apply filters (which will now show everything)
    applyFilters();
  });
}
function setupDateFilters() {
  const pickupInput = document.getElementById("pickup-date");
  const returnInput = document.getElementById("return-date");

  if (pickupInput) {
    pickupInput.addEventListener("change", applyFilters);
  }
  if (returnInput) {
    returnInput.addEventListener("change", applyFilters);
  }
}
function animateCarsIn() {
  const cards = document.querySelectorAll(".car-card");
  if (cards.length === 0) return;

  gsap.killTweensOf(cards);

  gsap.fromTo(
    cards,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6, // reduced from 0.9s for snappier mobile performance
      stagger: 0.05,
      ease: "power3.out",
      clearProps: "transform,opacity" // Clears inline styles after animation finishes
    }
  );
}
// Get the current list of favorite IDs from localStorage
function getFavorites() {
  const stored = localStorage.getItem("velox-favorites");
  return stored ? JSON.parse(stored) : [];
}

// Save a new list of favorite IDs
function saveFavorites(ids) {
  localStorage.setItem("velox-favorites", JSON.stringify(ids));
}

// Check if a specific car is already favorited
function isFavorite(carId) {
  const favorites = getFavorites();
  return favorites.includes(carId);
}
function setupFavorites() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".favorite-button");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const carId = Number(button.dataset.id);
    let favorites = getFavorites();

    if (favorites.includes(carId)) {
      favorites = favorites.filter((id) => id !== carId);
      button.classList.remove("active");
      button.textContent = "♡";
    } else {
      favorites.push(carId);
      button.classList.add("active");
      button.textContent = "♥";
    }

    saveFavorites(favorites);
  });
}
