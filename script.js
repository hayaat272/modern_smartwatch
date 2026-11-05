const $ = (id) => document.getElementById(id);
let stepCount = 6842;
const pad = n => String(n).padStart(2, "0");

function updateClock() {
  const now = new Date();
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const shortDate = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "2-digit" }).toUpperCase();
  $("clock").innerHTML = `${pad(now.getHours())}:${pad(now.getMinutes())}<span>:${pad(now.getSeconds())}</span>`;
  $("fullTime").textContent = time;
  $("fullDate").textContent = date;
  $("faceDay").textContent = shortDate;
  $("topDate").textContent = now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  $("secondsLabel").textContent = `${pad(now.getSeconds())} SECONDS`;
  $("minuteProgress").style.width = `${(now.getSeconds() / 60) * 100}%`;
}
function updateSteps() {
  $("steps").textContent = stepCount.toLocaleString("en-US");
  const percent = Math.min(100, stepCount / 10000 * 100);
  document.querySelector(".step-track span").style.width = `${percent}%`;
  document.querySelector(".activity-ring").style.background = `conic-gradient(var(--mint) 0 ${percent}%,#ffffff12 ${percent}% 100%)`;
  document.querySelector(".activity-details b").textContent = stepCount.toLocaleString("en-US");
  document.querySelector(".activity-details div:nth-child(2) b").textContent = `${(stepCount * 0.0007).toFixed(1)} km`;
  document.querySelector(".activity-details div:nth-child(3) b").textContent = `${Math.round(stepCount * 0.036)} kcal`;
  document.querySelector(".stat-note b").textContent = `${Math.round(percent)}%`;
}
function updateBattery() {
  if ("getBattery" in navigator) {
    navigator.getBattery().then(b => {
      const level = Math.round(b.level * 100);
      $("battery").textContent = level;
      $("faceBattery").textContent = `${level}%`;
      $("batteryBar").style.width = `${level}%`;
    }).catch(() => fallbackBattery());
  } else fallbackBattery();
}
function fallbackBattery() {
  $("battery").textContent = "86";
  $("faceBattery").textContent = "86%";
  $("batteryBar").style.width = "86%";
}
async function updateWeather() {
  if (!navigator.geolocation) { $("weatherStatus").textContent = "Location not supported"; return; }
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
      if (!res.ok) throw new Error("Weather unavailable");
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m);
      $("temperature").textContent = temp;
      $("faceWeather").textContent = `${temp}°`;
      const code = data.current.weather_code;
      $("weatherStatus").textContent = code === 0 ? "Clear sky" : code <= 3 ? "Partly cloudy" : code <= 67 ? "Rainy conditions" : "Current conditions";
    } catch { $("weatherStatus").textContent = "Weather unavailable"; }
  }, () => { $("weatherStatus").textContent = "Allow location for weather"; }, { timeout: 8000 });
}
$("addSteps").addEventListener("click", () => { stepCount = Math.min(30000, stepCount + 500); updateSteps(); });
$("resetSteps").addEventListener("click", () => { stepCount = 0; updateSteps(); });
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  $("themeIcon").textContent = light ? "☀" : "☾";
  $("themeLabel").textContent = light ? "Light mode" : "Dark mode";
});
updateClock(); setInterval(updateClock, 1000);
updateSteps(); updateBattery(); updateWeather();
