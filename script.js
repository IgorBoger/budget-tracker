// ===== Utilities =====
const EUR = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const byId = (id) => document.getElementById(id);

// ===== State (localStorage) =====
const KEY = "bt.entries.v1";
let entries = loadEntries();
function loadEntries() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}
function saveEntries() {
    localStorage.setItem(KEY, JSON.stringify(entries));
}

// ===== DOM Refs =====
const form = byId("entry-form");
const typeEl = byId("type");
const amountEl = byId("amount");
const categoryEl = byId("category");
const dateEl = byId("date");
const noteEl = byId("note");
const tbody = byId("entries-tbody");
const sumIncomeEl = byId("sum-income");
const sumExpenseEl = byId("sum-expense");
const sumBalanceEl = byId("sum-balance");

// default date = heute
dateEl.valueAsDate = new Date();

// ===== Render Table =====
function renderTable() {
    tbody.innerHTML = "";
    if (!entries.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 6;
        td.className = "muted";
        td.textContent = "Noch keine Einträge.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    // (noch kein Zeilen-Rendern in Slice 1)
}

function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ===== Summary =====
function renderSummary() {
    const income = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const balance = income - expense;
    sumIncomeEl.textContent = EUR(income);
    sumExpenseEl.textContent = EUR(expense);
    sumBalanceEl.textContent = EUR(balance);
    sumBalanceEl.classList.toggle("positive", balance >= 0);
    sumBalanceEl.classList.toggle("negative", balance < 0);
}

// ===== Main render =====
function render() {
    renderTable();
    renderSummary();
}

render();
