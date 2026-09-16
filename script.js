//Sample starting data
let transactions = [
  { id: 1, description: "Salary", amount: 6000, type: "income", category: "Income" },
  { id: 2, description: "Rent", amount: 400, type: "expense", category: "Housing" },
  { id: 3, description: "Groceries", amount: 120, type: "expense", category: "Food" },
  { id: 4, description: "Bus pass", amount: 60, type: "expense", category: "Transportation" },
  { id: 5, description: "Movie night", amount: 80, type: "expense", category: "Entertainment" },
  { id: 6, description: "New shoes", amount: 90, type: "expense", category: "Shopping" },
  { id: 7, description: "Concert", amount: 70, type: "expense", category: "Entertainment" }
];

const categoryColors = {
  Food: "#f4356b",
  Transportation: "#3b82f6",
  Housing: "#fbbf24",
  Entertainment: "#14b8a6",
  Shopping: "#a855f7"
};

let categoryChart, overviewChart;

//Navigation
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(btn.dataset.view).classList.add("active");
  });
});

//Dark mode
document.getElementById("darkToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

//Add transaction
function addTransaction() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (description === "" || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description: description,
    amount: amount,
    type: type,
    category: type === "income" ? "Income" : category
  });

  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";

  updateAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateAll();
}

//Export data as CSV
document.getElementById("exportBtn").addEventListener("click", () => {
  let csv = "Description,Amount,Type,Category\n";
  transactions.forEach(t => {
    csv += `${t.description},${t.amount},${t.type},${t.category}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions.csv";
  link.click();
});

//Render transaction list
function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  transactions.forEach(t => {
    const li = document.createElement("li");
    const sign = t.type === "income" ? "+" : "-";
    li.innerHTML = `
      <span>${t.description} <small style="color:var(--text-dim)">(${t.category})</small></span>
      <span>
        <span class="amt ${t.type}">${sign}€${t.amount.toFixed(2)}</span>
        <button onclick="deleteTransaction(${t.id})">✕</button>
      </span>
    `;
    list.appendChild(li);
  });
}

//Update stat cards
function updateStats() {
  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  document.getElementById("statBalance").textContent = "€" + balance.toFixed(2);
  document.getElementById("statIncome").textContent = "€" + income.toFixed(2);
  document.getElementById("statExpense").textContent = "€" + expense.toFixed(2);
  document.getElementById("statSavings").textContent = savingsRate + "%";

  return { income, expense };
}

//Charts
function setupCharts() {
  const ctx1 = document.getElementById("categoryChart");
  const ctx2 = document.getElementById("overviewChart");

  categoryChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    },
    options: {
      plugins: { legend: { position: "right" } }
    }
  });

  overviewChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["This Month"],
      datasets: [
        { label: "Income", data: [0], backgroundColor: "#38bdf8" },
        { label: "Expenses", data: [0], backgroundColor: "#ef4444" }
      ]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateCharts(totals) {
  const categoryTotals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = labels.map(l => categoryColors[l] || "#999");

  categoryChart.data.labels = labels;
  categoryChart.data.datasets[0].data = data;
  categoryChart.data.datasets[0].backgroundColor = colors;
  categoryChart.update();

  overviewChart.data.datasets[0].data = [totals.income];
  overviewChart.data.datasets[1].data = [totals.expense];
  overviewChart.update();
}

//Run everything
function updateAll() {
  renderList();
  const totals = updateStats();
  updateCharts(totals);
}

setupCharts();
updateAll();
