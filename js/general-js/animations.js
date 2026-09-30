(function () {
  const overlay = document.getElementById("page-transition");
  const panel = overlay?.querySelector(".page-transition__panel");
  const logo = overlay?.querySelector(".page-transition__logo");

  if (!overlay || !panel || typeof gsap === "undefined") return;

  const DURATION = 0.55;
  const EASE = "power3.inOut";

  /* ---------- ENTER (new page load) ---------- */
  function playEnter() {
  const shouldPlay = sessionStorage.getItem("velox-transition") === "1";
  sessionStorage.removeItem("velox-transition");

  if (!shouldPlay) {
    gsap.set(panel, { y: "100%" });
    gsap.set(logo, { opacity: 0 });
    return;
  }

  // Curtain is already closed via the html class; sync GSAP to that state
  overlay.classList.add("is-active");
  gsap.set(panel, { y: "0%" });
  gsap.set(logo, { opacity: 1, scale: 1 });

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.classList.remove("is-active");
      document.documentElement.classList.remove("is-transitioning");
    },
  });

  tl.to(logo, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 0.15)
    .to(panel, { y: "-100%", duration: DURATION, ease: EASE }, 0.2);
}
window.addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  overlay.classList.remove("is-active");
  document.documentElement.classList.remove("is-transitioning");
  gsap.set(panel, { y: "100%" });
  gsap.set(logo, { opacity: 0, scale: 0.9 });
});

  /* ---------- LEAVE (before navigate) ---------- */
  function playLeave(url) {
    overlay.classList.add("is-active");
    sessionStorage.setItem("velox-transition", "1");

    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = url;
      },
    });

    gsap.set(panel, { y: "100%" });
    gsap.set(logo, { opacity: 0, scale: 0.9 });

    tl.to(panel, { y: "0%", duration: DURATION, ease: EASE })
      .to(logo, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, "-=0.25");
  }

  /* ---------- Intercept internal links ---------- */
  function isInternalLink(a) {
    if (!a || !a.href) return false;
    if (a.target === "_blank") return false;
    if (a.hasAttribute("download")) return false;
    if (a.href.startsWith("mailto:") || a.href.startsWith("tel:")) return false;

    const url = new URL(a.href, window.location.origin);
    if (url.origin !== window.location.origin) return false;

    // same page hash only → skip
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }

    return true;
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!isInternalLink(a)) return;

    e.preventDefault();
    playLeave(a.href);
  });

  // On load
  playEnter();
})();