/* Teamora demo – all JavaScript.
   Sample data only. Goals, notes and the photo are saved in your browser (localStorage). */

// ============================================================
// 1. SAMPLE DATA
// ============================================================
const DEFAULT_GOALS = [
  { id: 1, text: "Increase Sales in DKJ by 12%", owner: "AQ", progress: 50 },
  { id: 2, text: "Complete EMEA Sales Training", owner: "CW", progress: 25 },
  { id: 3, text: "Complete Pricing Strategy Revamp", owner: "MN", progress: 75 },
  { id: 4, text: "Launch partner referral program", owner: "SP", progress: 0 }
];
// Analytics: result percentages for each way of grouping the data
const ANALYTICS = {
  Department: [["Sales", 68], ["Marketing", 73], ["Product", 45], ["Legal", 68], ["Support", 100]],
  Quarter: [["Q1", 52], ["Q2", 61], ["Q3", 74], ["Q4", 88], ["Q5", 95]],
  Level: [["Intern", 40], ["Junior", 58], ["Mid", 72], ["Senior", 84], ["Lead", 91]]
};
const BAR_COLORS = ["#0f8f86", "#3ee0c0", "#5ad0e6", "#1b8fd0", "#6b6cf0"];
const TABS = {
  "Career Goals": "I want to grow into management and eventually lead my team.\n- Find a mentor\n- Attend a leadership workshop",
  "Motivations": "I enjoy mentoring teammates and solving problems that help people do their best work.",
  "Strengths": "Clear communication, empathy, and organizing cross-team projects."
};
const PLANS = [
  { name: "Starter", price: 0, features: ["Goals for one team", "Basic analytics", "Email support"] },
  { name: "Growth", price: 49, best: true, features: ["Unlimited goals", "Analytics by department", "Development plans"] },
  { name: "Scale", price: 99, features: ["Everything in Growth", "Advanced reporting", "Priority demo support"] }
];
const FAQS = [
  ["Is Teamora a real product?", "No. It is a fictional brand created for a demonstration project."],
  ["Are the numbers real?", "No. Every chart, percentage and price on this page is sample data."],
  ["Where is my data stored?", "Only in your browser's localStorage. Nothing is sent to a server."],
  ["Does the login work?", "It is a mock form with validation only. Please don't enter real credentials."],
  ["Can I change the sample goals?", "Yes. Add, update or delete key results in the Goals card."]
];

// ============================================================
// 2. HELPERS
// ============================================================
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: ignore */ } };

let toastTimer;
function toast(message, isError) {
  const box = $("toast");
  box.textContent = message;
  box.className = "on" + (isError ? " bad" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (box.className = ""), 3000);
}

// Menu (mobile) and anchor links
$("burger").onclick = () => $("menu").classList.toggle("open");
document.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => $("menu").classList.remove("open")));

// ============================================================
// 3. GOALS (OKRs): add, update progress, delete
// ============================================================
let goals = load("tm-goals", DEFAULT_GOALS);

function renderGoals() {
  $("krList").innerHTML = goals.map((g, i) => `
    <li><div class="kr" data-id="${g.id}" role="button" tabindex="0" aria-label="Update progress for ${esc(g.text)}">
      <span class="t">${esc(g.text)}</span><span class="pct">${g.progress}%</span>
      <span class="avatar a${(i % 4) + 1}">${esc(g.owner)}</span>
      <button class="link del" data-del="${g.id}" aria-label="Delete ${esc(g.text)}">✕</button></div></li>`).join("")
    || `<li><small>No key results yet. Add one below.</small></li>`;
}
$("krList").addEventListener("click", (e) => {
  if (e.target.dataset.del) {                      // delete
    goals = goals.filter((g) => g.id !== +e.target.dataset.del);
  } else {                                         // click row: 0 -> 25 -> 50 -> 75 -> 100 -> 0
    const row = e.target.closest(".kr");
    if (!row) return;
    const g = goals.find((x) => x.id === +row.dataset.id);
    g.progress = g.progress >= 100 ? 0 : g.progress + 25;
  }
  save("tm-goals", goals);
  renderGoals();
});
$("krList").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.classList.contains("kr")) e.target.click(); });
$("krForm").onsubmit = (e) => {
  e.preventDefault();
  const text = $("krInput").value.trim();
  if (text.length < 4) return ($("krMsg").textContent = "Enter at least 4 characters.");
  $("krMsg").textContent = "";
  goals.push({ id: Date.now(), text, owner: "YO", progress: 0 });
  save("tm-goals", goals);
  $("krInput").value = "";
  renderGoals();
  toast("Key result added.");
};

// ============================================================
// 4. ANALYTICS chart (bars animate when the grouping changes)
// ============================================================
function renderBars() {
  const data = ANALYTICS[$("groupBy").value];
  $("bars").innerHTML = data.map(([label, value], i) =>
    `<div class="bar" style="background:${BAR_COLORS[i]}" data-h="${value}" title="${label}: ${value}%">${value}%<span>${label}</span></div>`).join("");
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll(".bar").forEach((b) => (b.style.height = b.dataset.h + "%"))));
}
$("groupBy").onchange = renderBars;

// ============================================================
// 5. GROW: profile photo upload + development notes per tab
// ============================================================
let notes = load("tm-notes", { ...TABS });
let activeTab = "Career Goals";
let photo = load("tm-photo", null);

function renderTabs() {
  $("tabs").innerHTML = Object.keys(TABS).map((t) => `<button role="tab" class="${t === activeTab ? "on" : ""}" data-tab="${t}">${t}</button>`).join("");
  $("note").value = notes[activeTab];
}
$("tabs").onclick = (e) => { if (e.target.dataset.tab) { activeTab = e.target.dataset.tab; renderTabs(); } };
$("note").oninput = () => { notes[activeTab] = $("note").value; save("tm-notes", notes); $("noteMsg").textContent = "Saved in this browser."; };

function paintPhoto() {
  $("photo").style.backgroundImage = photo ? `url(${photo})` : "none";
  $("photo").textContent = photo ? "" : "BH";
}
function readImage(file, done) {
  if (!file) return;
  if (!file.type.startsWith("image/")) return toast("Please choose an image file.", true);
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {                            // shrink big photos before saving
      const scale = Math.min(1, 300 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => toast("Could not read that image.", true);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
$("photoUp").onchange = (e) => readImage(e.target.files[0], (url) => { photo = url; save("tm-photo", photo); paintPhoto(); toast("Photo updated."); });
$("photoRm").onclick = () => {
  if (!photo) return toast("No uploaded photo to remove.", true);
  photo = null; save("tm-photo", null); paintPhoto(); toast("Photo removed.");
};

// ============================================================
// 6. TURNOVER donut + impact calculator
// ============================================================
const REDUCTION = 27;                                // demo figure (%)
const CIRCUMFERENCE = 2 * Math.PI * 48;              // ring length for r = 48

function animateDonut() {
  $("ring").style.strokeDasharray = `${(REDUCTION / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  let n = 0;                                         // count up 0 -> 27
  const timer = setInterval(() => { n++; $("donutText").textContent = n + "%"; if (n >= REDUCTION) clearInterval(timer); }, 35);
}
function calculate() {
  const employees = +$("cEmp").value, rate = +$("cRate").value, cost = +$("cCost").value;
  if (!(employees > 0) || rate < 0 || rate > 100 || cost < 0 || isNaN(rate) || isNaN(cost)) {
    $("calcMsg").textContent = "Enter positive numbers (turnover between 0 and 100).";
    return;
  }
  $("calcMsg").textContent = "";
  const leavers = employees * (rate / 100);          // people leaving per year
  const avoided = leavers * (REDUCTION / 100);       // leavers avoided with a 27% reduction
  $("cSave").textContent = money(avoided * cost);    // avoided leavers x cost to replace
  $("cLeavers").textContent = `${avoided.toFixed(1)} fewer departures per year (illustrative)`;
}
["cEmp", "cRate", "cCost"].forEach((id) => ($(id).oninput = calculate));

// ============================================================
// 7. PRICING + FAQ
// ============================================================
$("plans").innerHTML = PLANS.map((p, i) => `
  <div class="plan ${p.best ? "best" : ""}"><h3>${p.name}</h3><div class="price">$${p.price}<small>/month</small></div>
    <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
    <button class="btn ${p.best ? "green" : "ghost"}" style="border:1px solid var(--line)" data-plan="${i}">Choose plan</button></div>`).join("");
$("plans").onclick = (e) => { if (e.target.dataset.plan) openForm(planForm(PLANS[+e.target.dataset.plan])); };

function renderFaq() {
  const q = $("faqSearch").value.trim().toLowerCase();
  const list = FAQS.filter(([question, answer]) => (question + answer).toLowerCase().includes(q));
  $("faqList").innerHTML = list.length
    ? list.map(([question, answer]) => `<button class="q" aria-expanded="false">${question} ▾</button><div class="a" hidden>${answer}</div>`).join("")
    : "<p class='a'>No questions match your search.</p>";
}
$("faqSearch").oninput = renderFaq;
$("faqList").onclick = (e) => {
  if (!e.target.classList.contains("q")) return;
  const answer = e.target.nextElementSibling, open = answer.hidden;
  answer.hidden = !open;
  e.target.setAttribute("aria-expanded", open);
};

// ============================================================
// 8. MODAL FORMS (validated; nothing is sent anywhere)
// ============================================================
const dlg = $("dlg");
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });  // click backdrop to close

const FORMS = {
  login: { title: "Log in (demo)", button: "Log in", success: "Mock sign-in successful. No account was accessed.",
    fields: [{ name: "email", label: "Email", type: "email" }, { name: "password", label: "Password", type: "password" }] },
  demo: { title: "Book a demo", button: "Request demo", success: "Thanks! Your request was recorded locally (nothing was sent).",
    fields: [{ name: "name", label: "Name" }, { name: "email", label: "Work email", type: "email" }, { name: "company", label: "Company" },
             { name: "size", label: "Team size", options: ["1–10", "11–50", "51–200", "200+"] }] }
};
const planForm = (p) => ({ title: `Choose ${p.name} (demo)`, button: "Confirm plan", success: `${p.name} selected. Demo only, no payment taken.`,
  fields: [{ name: "email", label: "Email", type: "email" }] });

function validate(field, value) {
  if (!value.trim()) return "This field is required.";
  if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address.";
  if (field.type === "password" && value.length < 6) return "Use at least 6 characters.";
  return "";
}
function openForm(config) {
  $("dlgBody").innerHTML = `
    <div class="dh"><h2>${config.title}</h2><button class="link" id="dx" aria-label="Close">✕</button></div>
    <small>Demo only. Do not enter real credentials or personal data.</small>
    <form novalidate>${config.fields.map((f) => `<label>${f.label}${f.options
      ? `<select name="${f.name}">${f.options.map((o) => `<option>${o}</option>`).join("")}</select>`
      : `<input name="${f.name}" type="${f.type || "text"}">`}<span class="err" data-for="${f.name}"></span></label>`).join("")}
      <button class="btn green">${config.button}</button></form>`;
  $("dx").onclick = () => dlg.close();
  $("dlgBody").querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    let ok = true;
    config.fields.forEach((f) => {
      const message = validate(f, e.target.elements[f.name].value);
      $("dlgBody").querySelector(`[data-for="${f.name}"]`).textContent = message;
      if (message) ok = false;
    });
    if (ok) $("dlgBody").innerHTML = `<p class="ok" role="status">${config.success}</p><br><button class="btn green" onclick="dlg.close()">Close</button>`;
  };
  dlg.showModal();
}
function openText(title, text) {
  $("dlgBody").innerHTML = `<div class="dh"><h2>${title}</h2><button class="link" onclick="dlg.close()" aria-label="Close">✕</button></div><p>${text}</p>`;
  dlg.showModal();
}
document.addEventListener("click", (e) => {
  const key = e.target.dataset.modal;
  if (!key) return;
  if (key === "privacy") openText("Privacy", "Demonstration text: this project collects no real data.");
  else if (key === "terms") openText("Terms", "Demonstration text: Teamora is a fictional product.");
  else openForm(FORMS[key]);
});

// ============================================================
// 9. START
// ============================================================
renderGoals();
renderBars();
renderTabs();
paintPhoto();
renderFaq();
calculate();
animateDonut();
