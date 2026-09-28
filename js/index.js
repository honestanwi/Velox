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
      // animateBookingPanel();
    },
  });

  heroTimeline
    .from(".hero-background img", {
      scale: 1.18,
      x: 100,
      opacity: 0,
      duration: 1.6,
      ease: "power3.out",
    })

    .from(
      ".hero-eyebrow",
      {
        y: 40,
        opacity: 0,
        duration: 0.7,
      },
      "-=1",
    )

    .from(
      ".hero-title",
      {
        y: 100,
        opacity: 0,
        duration: 1,
      },
      "-=0.3",
    )

    .from(
      ".hero-description",
      {
        y: 35,
        opacity: 0,
        duration: 0.7,
      },
      "-=0.5",
    )

    .from(
      ".hero-actions",
      {
        y: 30,
        opacity: 0,
        duration: 0.7,
      },
      "-=0.4",
    )
    .from(
      ".booking-panel",
      {
        y: 70,
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        ease: "power3.out",
      },
      "-=0.35",
    );
}

function startHeroIdleAnimation() {
  gsap.to(".hero-background img", {
    y: -12,
    scale: 1.02,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".hero-glow", {
    scale: 1.25,
    opacity: 0.3,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
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
    brand: "BMW",
    category: "Sports",
    type: "Sedan",
    image: "../assets/images/porsche/Porsche_911_GT3_RS_Neon.png",
    seats: 4,
    transmission: "Auto",
    fuel: "Petrol",
    price: 85000,
  },

  {
    name: "Mercedes AMG",
    brand: "Mercedes",
    category: "Luxury",
    type: "Sport",
    image: "../assets/images/porsche/Porsche_911_GT3_RS_Neon.png",
    seats: 5,
    transmission: "Auto",
    fuel: "Petrol",
    price: 95000,
  },

  {
    name: "Porsche 911",
    brand: "porsche",
    category: "Sports",
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
                <h3 class="car-name">
                    ${car.name}
                </h3>

              <div class="car-bottom">
<p class="car-category">
            ${car.category}
        </p>
                    <p class="car-price">
 ${car.price.toLocaleString()} XAF
 <span>/ day</span>
 </p>
              </div>
            </div>

             <div class="car-hover">

        <div class="car-hover-content">

            <p class="car-category">
                ${car.category}
            </p>

            <h3 class="car-hover-brand">
                ${car.brand}
            </h3>

            <div class="car-specs">
                <span>${car.type}</span>
                <span>${car.seats} Seats</span>

                <span>${car.transmission}</span>

                <span>${car.fuel}</span>
                

            </div>

            <p class="car-hover-price">
                ${car.price.toLocaleString()} XAF
                <span>/ day</span>
            </p>

            <a
                href="#"
                class="car-details magnetic-button"
            >
                View Details
            </a>

        </div>

    </div>
        `;

    carsContainer.appendChild(carCard);
  });
}
renderFeaturedCars();
setupCarCardAnimations();

function setupFeaturedCarsAnimation() {
  gsap.from(".car-card", {
    y: 80,
    opacity: 0,
    scale: 0.95,
    duration: 0.9,
    stagger: 0.15,
    ease: "power3.out",

    scrollTrigger: {
      trigger: ".cars-container",
      start: "top 80%",
    },
  });
}
setupFeaturedCarsAnimation();

function setupCarCardAnimations() {
  const cards = document.querySelectorAll(".car-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 9;

      const rotateY = (centerX - x) / 9;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    const image = card.querySelector(".car-image img");
    const hoverContent = card.querySelector(".car-hover-content");

    card.addEventListener("mouseenter", () => {
      gsap.to(image, {
        scale: 1.08,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.fromTo(
        hoverContent,
        {
          y: 25,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        },
      );
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.to(image, {
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
      });
    });
  });
}
function setupAboutAnimation() {
  // Step 2: Animate stat cards staggered
  // "stagger: 0.15" means each card animates 0.15s after the previous one
  gsap.from(".stat-card", {
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15, // KEY: Stagger creates sequence
    scrollTrigger: {
      trigger: ".about-grid",
      start: "top 75%",
      onEnter: () => {
        // When cards enter viewport, start the counter
        startStatCounters();
      },
    },
  });

  // Step 3: Animate the about image with glow reveal
  gsap.from(".about-image", {
    x: 60,
    opacity: 0,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".about-image",
      start: "top 70%",
    },
  });

  // Step 4: Add the "active" state to stat cards for light effects
  const statCards = document.querySelectorAll(".stat-card");
  statCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      onEnter: () => card.classList.add("active"),
      onLeaveBack: () => card.classList.remove("active"),
    });
  });
}

// Teaching moment: Animated number counter
// We're animating numbers counting up using GSAP's to() method
// The key: use onUpdate callback to read the current value every frame
function startStatCounters() {
  const statNumbers = document.querySelectorAll(".stat-number");

  statNumbers.forEach((element) => {
    const target = parseInt(element.dataset.target);
    // Check if this is the "Satisfaction %" card
    const isSatisfactionCard =
      element.nextElementSibling.textContent.includes("Satisfaction");

    // Use GSAP to animate an object's value property from 0 to target
    gsap.to(
      { value: 0 },
      {
        value: target,
        duration: 2, // 2 second animation
        ease: "power2.out", // Easing: fast start, slow end
        onUpdate: function () {
          // onUpdate fires every frame during animation
          const currentValue = Math.floor(this.targets()[0].value);
          const suffix = isSatisfactionCard ? "%" : "";
          element.textContent = currentValue.toLocaleString() + suffix;
        },
      },
    );
  });

  // Activate the image glow after a tiny delay
  gsap.delayedCall(0.3, () => {
    document.querySelector(".about-image").classList.add("active");
  });
}

// Animate Why Choose Us benefit cards
function setupBenefitsAnimation() {
  gsap.from(".benefit-card", {
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12, // Slightly tighter stagger than stat cards
    scrollTrigger: {
      trigger: ".benefits-grid",
      start: "top 75%",
    },
  });
}

// Call the animations
setupAboutAnimation();
setupBenefitsAnimation();
function setupTestimonials() {
  const container = document.querySelector(".testimonial-container");
  if (!container) return;

  const testimonialCards = [...container.querySelectorAll(".testimonial-card")];
  if (!testimonialCards.length) return;

  function selectTestimonial(selectedCard) {
    testimonialCards.forEach((card) => {
      const isSelected = card === selectedCard;
      card.classList.toggle("expanded", isSelected);
      card.setAttribute("aria-expanded", String(isSelected));
    });
  }

  selectTestimonial(testimonialCards[0]);

  testimonialCards.forEach((card, index) => {
    card.addEventListener("click", () => selectTestimonial(card));

    card.addEventListener("keydown", (event) => {
      const direction =
        event.key === "ArrowDown" || event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp" || event.key === "ArrowLeft"
            ? -1
            : 0;

      if (!direction) return;

      event.preventDefault();
      const nextIndex =
        (index + direction + testimonialCards.length) % testimonialCards.length;
      testimonialCards[nextIndex].focus();
      selectTestimonial(testimonialCards[nextIndex]);
    });
  });
}
setupTestimonials();
function setupFinalCTAAnimation() {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".final-cta",
      start: "top 75%",
    },
  });

  timeline
    .from(".final-cta .section-eyebrow", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    })

    .from(
      ".cta-title",
      {
        y: 80,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      },
      "-=0.3",
    )

    .from(
      ".cta-description",
      {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.5",
    )

    .from(
      ".cta-button",
      {
        y: 25,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.3",
    )

    .from(
      ".cta-light",
      {
        xPercent: -30,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.8",
    );
  gsap.to(".cta-glow", {
    scale: 1.3,
    opacity: 0.12,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}
setupFinalCTAAnimation();
function setupFooterAnimation() {
  gsap.from(".footer-brand", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    scrollTrigger: {
      trigger: ".footer",
      start: "top 85%",
    },
  });

  gsap.from(".footer-column", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".footer-links",
      start: "top 85%",
    },
  });
}
setupFooterAnimation();
function setupFooterWordmarkAnimation() {
  const wordmark = document.querySelector(".footer-wordmark");
  const text = document.querySelector(".footer-wordmark__text");
  const light = document.querySelector(".footer-wordmark__light");

  if (!wordmark || !text || !light) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: wordmark,
      start: "top 85%",
      end: "bottom 40%",
      scrub: 1,
    },
  });

  timeline
    .to(text, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    })
    .to(light, {
      xPercent: 400,
      opacity: 0.5,
      duration: 1,
      ease: "power2.inOut",
    });
}

setupFooterWordmarkAnimation();
