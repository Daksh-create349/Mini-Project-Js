const amountInput = document.getElementById("amount");
const baseCurrencySelect = document.getElementById("baseCurrency");
const targetCurrencySelect = document.getElementById("targetCurrency");
const convertBtn = document.getElementById("convertBtn");
const resultEl = document.getElementById("result");
const updatedTimeEl = document.getElementById("updatedTime");

const API_URL = "https://open.er-api.com/v6/latest";
const CACHE_KEY = "forex_rates_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

const currencies = ["USD", "EUR", "INR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", ];

// Populate currency dropdowns
function populateCurrencies() {
  currencies.forEach(currency => {
    const option1 = document.createElement("option");
    const option2 = document.createElement("option");

    option1.value = option2.value = currency;
    option1.textContent = option2.textContent = currency;

    baseCurrencySelect.appendChild(option1);
    targetCurrencySelect.appendChild(option2);
  });

  baseCurrencySelect.value = "USD";
  targetCurrencySelect.value = "INR";
}

// Fetch exchange rates with caching
async function getRates(base) {
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (
    cachedData &&
    cachedData.base === base &&
    Date.now() - cachedData.timestamp < CACHE_DURATION
  ) {
    console.log("Using cached data");
    return cachedData.data;
  }

  console.log("Fetching fresh data from API...");
  const response = await fetch(`${API_URL}/${base}`);
  const data = await response.json();

  if (data.result !== "success") {
    throw new Error("API failed");
  }

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      base: base,
      data: data,
      timestamp: Date.now(),
    })
  );

  return data;
}

// Convert currency
async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const base = baseCurrencySelect.value;
  const target = targetCurrencySelect.value;

  if (!amount || amount <= 0) {
    resultEl.textContent = " Please enter a valid amount !!!!!";
    updatedTimeEl.textContent = "";
    return;
  }

  try {
    const data = await getRates(base);
    const rate = data.rates[target];
    const convertedAmount = (amount * rate).toFixed(2);

    resultEl.textContent = `${amount} ${base} = ${convertedAmount} ${target}`;
    updatedTimeEl.textContent = `Last updated: ${new Date(data.time_last_update_utc).toLocaleString()}`;
  } catch (error) {
    resultEl.textContent = " Error fetching exchange rates !!!!";
    updatedTimeEl.textContent = "";
    console.error(error);
  }
}

// Event listener
convertBtn.addEventListener("click", convertCurrency);

// Initialize app
populateCurrencies();
