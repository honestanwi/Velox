gsap.registerPlugin(ScrollTrigger);
let lenis;
if (typeof Lenis !== "undefined") {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}
function setupBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}
setupBackToTop();
const nav = document.querySelector(".navbar"); // Adjust selector to match your header/nav tag

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});
function setupMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  const menuTimeline = gsap.timeline({
    paused: true,
  });
  menuTimeline
    .to(
      ".menu-toggle span:nth-child(1)",
      {
        rotate: 45,
        y: 7,
        duration: 0.3,
      },
      0,
    )

    .to(
      ".menu-toggle span:nth-child(2)",
      {
        opacity: 0,
        duration: 0.2,
      },
      0,
    )

    .to(
      ".menu-toggle span:nth-child(3)",
      {
        rotate: -45,
        y: -7,
        duration: 0.3,
      },
      0,
    )

    .to(navMenu, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    })

    .from(
      ".nav-links a",
      {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.2",
    )

    .from(
      ".nav-button",
      {
        y: 30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.2",
    );

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.contains("active");

    if (isOpen) {
      menuTimeline.reverse();
    } else {
      navMenu.classList.add("active");
      menuTimeline.play();
    }
    menuTimeline.eventCallback("onReverseComplete", () => {
      navMenu.classList.remove("active");
    });
  });
}
if (window.matchMedia("(max-width: 767px)").matches) {
  setupMobileMenu();
}

function updateNavAuth() {
  if (!isLoggedIn()) return; // logged out: leave the nav as it is

  const loginLink = document.querySelector('.nav-links a[href$="login.html"]');
  const signupLink = document.querySelector('.nav-links a[href$="signup.html"]');

  if (signupLink) signupLink.remove();

  if (loginLink) {
    loginLink.textContent = "Log out";
    loginLink.setAttribute("href", "#");
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  // Clear whatever isLoggedIn() checks, e.g.:
  localStorage.removeItem("velox-user");
  window.location.reload();
}

updateNavAuth();
