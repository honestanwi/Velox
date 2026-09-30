const Currency = (function () {
  let rates = { XAF: 1, USD: null, EUR: null }; // per 1 XAF
  let current = localStorage.getItem("velox-currency") || "XAF";

  async function loadRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (!res.ok) throw new Error("Rate fetch failed");

    const data = await res.json();
    // data.rates.XAF = XAF per 1 EUR
    // data.rates.USD = USD per 1 EUR

    const xafPerEur = data.rates.XAF;
    const usdPerEur = data.rates.USD;

    if (!xafPerEur || !usdPerEur) throw new Error("Missing rates");

    rates = {
      XAF: 1,
      EUR: 1 / xafPerEur,         // 1 XAF → EUR
      USD: usdPerEur / xafPerEur, // 1 XAF → USD
    };

    console.log("Currency rates loaded", rates);
  } catch (err) {
    console.warn("Currency API unavailable, using fallback rates", err);

    // Approximate fallback so UI still works offline / if API fails
    // 1 XAF ≈ 0.0016 USD, ≈ 0.0015 EUR (adjust if you like)
    rates = {
      XAF: 1,
      USD: 0.00165,
      EUR: 0.00152,
    };
  }
}

  function setCurrency(code) {
    if (!["XAF", "USD", "EUR"].includes(code)) return;
    current = code;
    localStorage.setItem("velox-currency", code);
    document.dispatchEvent(new CustomEvent("currency:change", { detail: code }));
  }

  function getCurrency() {
    return current;
  }

  function format(amountXAF) {
    const n = Number(amountXAF) || 0;

    if (current === "XAF" || rates[current] == null) {
      return `${Math.round(n).toLocaleString()} XAF`;
    }

    const converted = n * rates[current];
    const symbol = current === "USD" ? "$" : "€";
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function convert(amountXAF) {
    if (current === "XAF" || rates[current] == null) return Number(amountXAF) || 0;
    return (Number(amountXAF) || 0) * rates[current];
  }

  return { loadRates, setCurrency, getCurrency, format, convert };
})();
document.addEventListener("DOMContentLoaded", async () => {
  await Currency.loadRates();

  const code = Currency.getCurrency();
  document.querySelectorAll(".currency-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.currency === code);

    btn.addEventListener("click", () => {
      Currency.setCurrency(btn.dataset.currency);
      document.querySelectorAll(".currency-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.currency === btn.dataset.currency);
      });
    });
  });
});