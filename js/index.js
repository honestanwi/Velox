gsap.registerPlugin(ScrollTrigger);
// const intro = document.querySelector(".intro");
// const loadingProgress = document.querySelector(".loading-progress");

// loadingProgress.addEventListener("animationend", (e) => {
//   e.stopPropagation();
//   intro.classList.add("hide");
// });

// intro.addEventListener("animationend", (e) => {
//   if (e.target === intro) {
//     intro.remove();
//     startHeroAnimation();
//   }
// });

startHeroAnimation();

function startHeroAnimation() {
  const heroTimeline = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
    onComplete: () => {
      startHeroIdleAnimation();
      setupMagneticButtons();
      animateBookingPanel();
    },
  });

  heroTimeline
    .from(".hero-background img", {
      scale: 1.15,
      x: 150,
      opacity: 0,
      duration: 1.4,
    })

    .from(".hero-eyebrow", {
      y: 30,
      opacity: 0,
      duration: 0.6,
    })

    .from(
      ".hero-title",
      {
        y: 80,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.3",
    )

    .from(
      ".hero-description",
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
      },
      "-=0.4",
    )

    .from(
      ".hero-actions",
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
      },
      "-=0.3",
    )
    .from(
      ".booking-panel",
      {
        y: 60,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.4",
    );
}

function startHeroIdleAnimation() {
  gsap.to(".hero-background img", {
    y: -10,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  gsap.to(".hero-glow", {
    xPercent: -50,
    yPercent: -50,
    scale: 1.3,
    opacity: 0.3,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}
function setupMagneticButtons() {
  if (window.matchMedia("(hover: none)").matches) {
    return;
  }
  const buttons = document.querySelectorAll(".magnetic-button");

  buttons.forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();

      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const distanceX = event.clientX - buttonCenterX;
      const distanceY = event.clientY - buttonCenterY;

      gsap.to(button, {
        x: distanceX * 0.2,
        y: distanceY * 0.2,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });
}

// function animateBookingPanel() {
//   gsap.from(".booking-panel", {
//     y: 60,
//     opacity: 0,
//     duration: 0.8,
//     ease: "power3.out",
//   }, "-=0.4");
// }

function setupHowItWorksAnimation() {
  gsap.from(".section-heading", {
    y: 60,
    opacity: 0,
    duration: 0.8,

    scrollTrigger: {
      trigger: ".how-it-works",
      start: "top 80%",
    },
  });
  gsap.from(".step-card", {
    y: 80,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,

    scrollTrigger: {
      trigger: ".steps",
      start: "top 80%",
    },
  });
}
setupHowItWorksAnimation();

const featuredCars = [
  {
    name: "BMW M4",
    type: "Sports",
    image: "../assets/images/porsche/Porsche_911_GT3_RS_Neon.png",
    seats: 4,
    transmission: "Auto",
    fuel: "Petrol",
    price: 85000,
  },

  {
    name: "Mercedes AMG",
    type: "Luxury",
    image: "../assets/images/porsche/Porsche_911_GT3_RS_Neon.png",
    seats: 5,
    transmission: "Auto",
    fuel: "Petrol",
    price: 95000,
  },

  {
    name: "Porsche 911",
    type: "Sports",
    image: "../assets/images/porsche/Porsche_911_GT3_RS_Neon.png",
    seats: 2,
    transmission: "Auto",
    fuel: "Petrol",
    price: 120000,
  },
];
function renderFeaturedCars() {
  const carsContainer = document.querySelector(".cars-container");

  featuredCars.forEach((car) => {
    const carCard = document.createElement("article");

    carCard.classList.add("car-card");

    carCard.innerHTML = `
            <div class="car-image">

                <img
                    src="${car.image}"
                    alt="${car.name}"
                >

                <button
                    class="favorite-button"
                    aria-label="Add ${car.name} to favorites"
                >
                    ♡
                </button>

            </div>

            <div class="car-info">

                <p class="car-type">
                    ${car.type}
                </p>

                <h3 class="car-name">
                    ${car.name}
                </h3>

                <div class="car-specs">
                    <span>${car.seats} Seats</span>
                    <span>${car.transmission}</span>
                    <span>${car.fuel}</span>
                </div>

                <div class="car-bottom">

                    <p class="car-price">
                        ${car.price.toLocaleString()} XAF
                        <span>/ day</span>
                    </p>

                    <a
                        href="#"
                        class="car-details"
                    >
                        Details
                    </a>

                </div>

            </div>
        `;

    carsContainer.appendChild(carCard);
  });
}
renderFeaturedCars();

// function setupFeaturedCarsAnimation() {
//   gsap.from(".featured-heading", {
//     y: 60,
//     opacity: 0,
//     duration: 0.8,

//     scrollTrigger: {
//       trigger: ".featured-cars",
//       start: "top 80%",
//     },
//   });

//   gsap.from(".car-card", {
//     y: 80,
//     opacity: 0,
//     scale: 0.95,
//     duration: 0.7,
//     stagger: 0.15,
//     ease: "power3.out",

//     scrollTrigger: {
//       trigger: ".cars-container",
//       start: "top 80%",
//     },
//   });
// }
// setupFeaturedCarsAnimation();
