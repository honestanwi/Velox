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
