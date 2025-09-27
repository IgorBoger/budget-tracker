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

    for (const e of entries) {
        const tr = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.textContent = formatDate(e.date);

        const tdType = document.createElement("td");
        const tag = document.createElement("span");
        tag.className = `tag ${e.type}`;
        tag.textContent = e.type === "income" ? "Einnahme" : "Ausgabe";
        tdType.appendChild(tag);

        const tdCat = document.createElement("td");
        tdCat.textContent = e.category;

        const tdAmt = document.createElement("td");
        tdAmt.className = "right";
        tdAmt.textContent = (e.type === "income" ? "+" : "−") + " " + EUR(e.amount);

        const tdNote = document.createElement("td");
        tdNote.textContent = e.note || "";

        const tdActions = document.createElement("td");
        tdActions.className = "row-actions";

        const del = document.createElement("button");
        del.className = "icon-btn";
        del.textContent = "Löschen";
        del.addEventListener("click", () => {
            entries = entries.filter(x => x.id !== e.id);
            saveEntries();
            render();
        });
        tdActions.appendChild(del);


        tr.append(tdDate, tdType, tdCat, tdAmt, tdNote, tdActions);
        tbody.appendChild(tr);
    }

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


// ===== Events =====
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = typeEl.value; // income | expense
    const amount = parseFloat(amountEl.value);
    const category = categoryEl.value.trim();
    const date = dateEl.value;
    const note = noteEl.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Bitte einen gültigen Betrag > 0 eingeben.");
        return;
    }
    if (!category) {
        alert("Bitte Kategorie angeben.");
        return;
    }
    if (!date) {
        alert("Bitte Datum wählen.");
        return;
    }

    const entry = {
        id: crypto.randomUUID(),
        type,
        amount: Number(amount.toFixed(2)),
        category,
        date,  // ISO yyyy-mm-dd
        note
    };
    entries.unshift(entry);
    saveEntries();
    form.reset();
    dateEl.valueAsDate = new Date();
    render();
});


// ===== CSV Export =====
function toCSV(rows) {
    const header = ["id", "type", "amount", "category", "date", "note"];
    const esc = (v = "") => `"${String(v).replaceAll('"', '""')}"`;
    const body = rows.map(r => header.map(k => esc(r[k])).join(",")).join("\n");
    return header.join(",") + "\n" + body;
}

const exportBtn = byId("export-csv");
exportBtn.addEventListener("click", () => {
    const csv = toCSV(entries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-entries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});
