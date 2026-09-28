document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const toggleLabel = document.querySelector(".dark span");
  const toggleIcon = document.querySelector(".toggle-icon");

  const isSubPage =
    window.location.pathname.includes("/pages/") ||
    window.location.pathname.includes("\\pages\\");
  const assetPrefix = isSubPage ? "../" : "";
  const SUN_ICON = assetPrefix + "assets/icons/sun-2-svgrepo-com.svg";
  const MOON_ICON = assetPrefix + "assets/icons/moon-svgrepo-com.svg";

  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  setTheme(initialTheme);

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      if (toggleLabel) toggleLabel.textContent = "Dark";
      if (toggleIcon) toggleIcon.src = MOON_ICON;
    } else {
      if (toggleLabel) toggleLabel.textContent = "Light";
      if (toggleIcon) toggleIcon.src = SUN_ICON;
    }
  }
});
