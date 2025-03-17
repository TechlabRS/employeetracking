//for employees related

    let employees = JSON.parse(localStorage.getItem("employees")) || [];
    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    function addEmployee() {
let name = document.getElementById("empName").value.trim();
let phone = document.getElementById("empPhone").value.trim();
let address = document.getElementById("empAddress").value.trim();
let rate = parseFloat(document.getElementById("empRate").value) || 600;

if (!name || !phone || !address) {
    alert("Please enter all employee details!");
    return;
}

let id = (employees.length + 1).toString();
employees.push({ id, name, phone, address, amountPerDay: rate });

localStorage.setItem("employees", JSON.stringify(employees));
loadEmployees();
alert("Employee added successfully!");

}


// Ensure Employees are loaded first
// Load Employees on Startup
function loadEmployees() {
    let employeeTable = document.getElementById("employeeTable");
    employeeTable.innerHTML = employees.map(emp =>
        `<tr>
            <td>${emp.id}</td><td>${emp.name}</td><td>${emp.phone}</td>
            <td>${emp.address}</td><td>₹${emp.amountPerDay}</td>
        </tr>`
    ).join("");

    let paymentDropdown = document.getElementById("paymentEmp");
    let employeeDropdown = document.getElementById("employeeSelect");
    let chipsDiv = document.getElementById("employeeChips");

    paymentDropdown.innerHTML = employeeDropdown.innerHTML = employees.map(emp =>
        `<option value="${emp.id}">${emp.name}</option>`).join("");

    chipsDiv.innerHTML = employees.map(emp =>
        `<span class="chip" onclick="toggleSelect(this, '${emp.id}')">${emp.name}</span>`).join("");
}

// **Record Payment**
function recordPayment() {
    let id = document.getElementById("paymentEmp").value;
    let amount = parseFloat(document.getElementById("paymentAmount").value);
    let date = document.getElementById("paymentDate").value;  // Allow user-selected date

    if (!id || isNaN(amount) || amount <= 0 || !date) {
        alert("Enter a valid amount and valid date.");
        return;
    }

    let employee = employees.find(e => e.id === id);
    if (!employee) {
        alert("Employee not found.");
        return;
    }

    let employeeBalance = calculateBalance(id, date);  // Get balance before payment

    if (!confirm(`${employee.name} has a balance of ₹${employeeBalance}. Proceed with payment of ₹${amount}?`)) {
        return;
    }

    if (amount > employeeBalance) {
        alert("Payment cannot exceed balance.");
        return;
    }

    payments.push({ id, name: employee.name, date, amount });
    localStorage.setItem("payments", JSON.stringify(payments));

    alert("Payment recorded!");
    generatePaymentTable();
    generateSummaryReport();
}

// Update Payment History Table
//function updatePaymentHistory() {
//let table = document.getElementById("paymentHistoryTable");
//table.innerHTML = payments.map(p =>
//    `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.date}</td><td>₹${p.amount}</td></tr>`
//).join("");
//}

// Load Employees & Payment History on Startup
loadEmployees();
//updatePaymentHistory();

    function toggleSelect(chip, empId) {
        chip.classList.toggle("selected");
        chip.dataset.selected = chip.classList.contains("selected") ? "true" : "false";
    }

    function saveAttendance() {
        let date = document.getElementById("attendanceDate").value;
        if (!date) return alert("Select a date!");

        let selectedEmployees = [...document.querySelectorAll(".chip.selected")].map(chip => chip.innerText);
        employees.forEach(emp => {
            let present = selectedEmployees.includes(emp.name);
            attendance.push({ id: emp.id, name: emp.name, date, month: date.slice(0, 7), present });
        });

        localStorage.setItem("attendance", JSON.stringify(attendance));
        alert("Attendance saved!");
        generateSummaryReport();
    }

    function savePayment() {
let id = document.getElementById("paymentEmp").value;
let date = document.getElementById("paymentDate").value;
let amount = parseFloat(document.getElementById("paymentAmount").value);

if (!id || isNaN(amount) || amount <= 0 || !date) {
  alert("Enter a valid amount and valid date.");
  return;
}

let employee = employees.find(e => e.id === id);
if (!employee) {
  alert("Employee not found.");
  return;
}

// Get employee's current balance before payment
let employeeBalance = generateEmployeeBalance(id);

// Show confirmation prompt
if (!confirm(`${employee.name} has a balance of ₹${employeeBalance}. Proceed with payment of ₹${amount}?`)) {
  return;
}

if (amount > employeeBalance) {
  alert("Payment cannot exceed balance.");
  return;
}

// Record the payment
payments.push({ id, name: employee.name, date, amount });

// Save to Local Storage
localStorage.setItem("payments", JSON.stringify(payments));

alert("Payment recorded!");
generateSummaryReport();
generatePaymentTable();
}

function showPayments(){
    alert("The updated payments are!");
    generatePaymentTable();
}


function generatePaymentTable() {
    let paymentTable = document.getElementById("paymentTable");

    if (!payments.length) {
        paymentTable.innerHTML = "<tr><td colspan='4'>No payments recorded</td></tr>";
        return;
    }

    let runningBalances = {}; // Store balances per employee

    let paymentRows = payments.map(p => {
        if (!runningBalances[p.id]) runningBalances[p.id] = generateEmployeeBalance(p.id) + p.amount;
        runningBalances[p.id] -= p.amount;

        return `<tr>
            <td>${p.date}</td>
            <td>${p.name}</td>
            <td>₹${p.amount}</td>
            <td>₹${runningBalances[p.id]}</td>
        </tr>`;
    }).join("");

    paymentTable.innerHTML = paymentRows;
}



// **Calculate Employee Balance up to a specific date**
function calculateBalance(empId, upToDate) {
    let employee = employees.find(e => e.id === empId);
    if (!employee) return 0;

    let earned = attendance.filter(a => a.id === empId && a.date <= upToDate)
        .reduce((sum, a) => sum + (a.present ? employee.amountPerDay : 0), 0);
    
    let paid = payments.filter(p => p.id === empId && p.date <= upToDate)
        .reduce((sum, p) => sum + p.amount, 0);

    return earned - paid;
}

// Function to calculate the employee's balance dynamically
function generateEmployeeBalance(empId, upToDate = null) {
    let employee = employees.find(e => e.id === empId);
    if (!employee) return 0; // Safety check

    let filteredAttendance = attendance.filter(a => a.id === empId);
    let totalEarnings = filteredAttendance.reduce((sum, r) => {
        if (!upToDate || new Date(r.date) <= new Date(upToDate)) {
            return sum + (r.present ? employee.amountPerDay : 0);
        }
        return sum;
    }, 0);

    let filteredPayments = payments.filter(p => p.id === empId);
    let totalPayments = filteredPayments.reduce((sum, p) => {
        if (!upToDate || new Date(p.date) <= new Date(upToDate)) {
            return sum + p.amount;
        }
        return sum;
    }, 0);

    return totalEarnings - totalPayments;
}

    
function generateEmployeeReport() {
    let id = document.getElementById("employeeSelect").value;
    let reportTable = document.getElementById("employeeReportTable");

    let employee = employees.find(e => e.id === id);
    if (!employee) return;

    let records = attendance
        .filter(a => String(a.id) === String(id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let paymentsForEmployee = payments
        .filter(p => String(p.id) === String(id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    let reportHTML = "";
    let paymentIndex = 0;

    records.forEach(record => {
        let amountEarned = record.present ? employee.amountPerDay : 0;
        let paidAmount = 0;

        // Deduct payments sequentially as per the payment history
        while (paymentIndex < paymentsForEmployee.length && paymentsForEmployee[paymentIndex].date <= record.date) {
            paidAmount += paymentsForEmployee[paymentIndex].amount;
            paymentIndex++;
        }

        balance += amountEarned - paidAmount;

        reportHTML += `<tr>
            <td>${record.date}</td>
            <td>${record.present ? "✅" : "-"}</td>
            <td>${record.present ? "-" : "❌"}</td>
            <td>₹${amountEarned}</td>
            <td>₹${paidAmount}</td>
            <td>₹${balance}</td>
        </tr>`;
    });

    reportTable.innerHTML = reportHTML;
}




    // Generate Monthly Summary Report
function generateSummaryReport() {
    let month = document.getElementById("monthSelect").value;
    let reportData = {};

    attendance.filter(a => a.month === month).forEach(a => {
        if (!reportData[a.id]) reportData[a.id] = { name: a.name, present: 0, absent: 0, earnings: 0, payments: 0 };
        a.present ? reportData[a.id].present++ : reportData[a.id].absent++;
    });

    employees.forEach(emp => {
        if (reportData[emp.id]) reportData[emp.id].earnings = reportData[emp.id].present * emp.amountPerDay;
    });

    payments.filter(p => p.date.startsWith(month)).forEach(p => {
        if (reportData[p.id]) reportData[p.id].payments += p.amount;
    });

    let summaryTable = document.getElementById("summaryTable");
    summaryTable.innerHTML = Object.keys(reportData).map(id => {
        let data = reportData[id], balance = data.earnings - data.payments;
        return `<tr>
            <td>${id}</td>
            <td>${data.name}</td>
            <td>${data.present}</td>
            <td>${data.absent}</td>
            <td>₹${data.earnings}</td>
            <td>₹${data.payments}</td>
            <td>₹${balance}</td>
        </tr>`;
    }).join("");
}


// Export all data (Employees, Attendance, Payments)
function exportEmpData() {
let allData = {
    employees: JSON.parse(localStorage.getItem("employees")) || [],
    attendance: JSON.parse(localStorage.getItem("attendance")) || [],
    payments: JSON.parse(localStorage.getItem("payments")) || []
};

let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
let downloadAnchor = document.createElement("a");
downloadAnchor.setAttribute("href", dataStr);
downloadAnchor.setAttribute("download", "EmployeeData.json");
document.body.appendChild(downloadAnchor);
downloadAnchor.click();
document.body.removeChild(downloadAnchor);
}

// Import Data from JSON File
function importEmpData(event) {
let file = event.target.files[0];
if (!file) return;

let reader = new FileReader();
reader.onload = function(e) {
    try {
        let importedData = JSON.parse(e.target.result);
        
        if (importedData.employees && importedData.attendance && importedData.payments) {
            localStorage.setItem("employees", JSON.stringify(importedData.employees));
            localStorage.setItem("attendance", JSON.stringify(importedData.attendance));
            localStorage.setItem("payments", JSON.stringify(importedData.payments));

            alert("Data imported successfully!");
            location.reload(); // Refresh to apply changes
        } else {
            alert("Invalid data format. Please upload a valid JSON file.");
        }
    } catch (error) {
        alert("Error reading file. Make sure it's a valid JSON format.");
    }
};
reader.readAsText(file);
}

// Clear All Data with Confirmation
function clearAllData() {
if (confirm("⚠️ Are you sure you want to delete all data? This action cannot be undone!")) {
    localStorage.clear();
    alert("All data has been cleared.");
    location.reload(); // Refresh to apply changes
}
}

    window.onload = () => { 
        loadEmployees(); 
        generateSummaryReport(); 
        generatePaymentTable();

    };

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    
    // Load data when page loads
    window.onload = function () {
        updateTaskDropdowns();
        updateIncomeHistory();
        updateExpenseHistory();
        generateReport();
    };
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("incomes", JSON.stringify(incomes));
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }
    
    // Add Task
    function addTask() {
        const name = document.getElementById("taskName").value;
        const material = document.getElementById("includesMaterial").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
    
        if (!name || !startDate || !endDate) {
            alert("Please fill all fields.");
            return;
        }
    
        const task = { name, material, startDate, endDate };
        tasks.push(task);
    
        saveData();
        updateTaskDropdowns();
        updateTaskDetailsDropdown();
        showTaskDetails();
        alert("Task added!");
    }
    
    // Update dropdowns with tasks
    function updateTaskDropdowns() {
        const incomeDropdown = document.getElementById("incomeTask");
        const expenseDropdown = document.getElementById("expenseTask");
    
        incomeDropdown.innerHTML = "";
        expenseDropdown.innerHTML = "";
    
        tasks.forEach((task, index) => {
            const option = `<option value="${index}">${task.name}</option>`;
            incomeDropdown.innerHTML += option;
            expenseDropdown.innerHTML += option;
        });
    }
    
    // Function to update Task Details dropdown
    function updateTaskDetailsDropdown() {
        const dropdown = document.getElementById("taskDetailsDropdown");
        dropdown.innerHTML = "";
    
        tasks.forEach((task, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = task.name;
            dropdown.appendChild(option);
        });
    
        if (tasks.length > 0) {
            showTaskDetails();
        }
    }
    
    // Function to show task details in a table
    function showTaskDetails() {
        const index = document.getElementById("taskDetailsDropdown").value;
        if (!tasks[index]) return;
    
        const task = tasks[index];
    
        // Calculate total income & expenses for the selected task
        const taskIncome = incomes
            .filter(i => i.taskIndex == index)
            .reduce((sum, i) => sum + i.amount, 0);
    
        const taskExpenses = expenses
            .filter(e => e.taskIndex == index)
            .reduce((sum, e) => sum + e.amount, 0);
    
        const profitLoss = taskIncome - taskExpenses;
    
        // Update task details in the table
        document.getElementById("taskDetailsTable").innerHTML = `
            <tr>
                <td>${task.name}</td>
                <td>${task.startDate}</td>
                <td>${task.endDate}</td>
                <td>${task.material}</td>
                <td>₹${taskIncome}</td>
                <td>₹${taskExpenses}</td>
                <td style="color: ${profitLoss >= 0 ? 'green' : 'red'};">₹${profitLoss}</td>
            </tr>
        `;
    }
    
    // Call function on page load
    window.onload = function () {
        updateTaskDetailsDropdown();
        showTaskDetails();
        updateTaskDropdowns();
    };
    
    
    // Add Income
    function addIncome() {
        const taskIndex = document.getElementById("incomeTask").value;
        const amount = parseFloat(document.getElementById("incomeAmount").value);
        const date = document.getElementById("incomeDate").value;
    
        if (!date || isNaN(amount) || amount <= 0) {
            alert("Enter valid date and amount.");
            return;
        }
    
        incomes.push({ taskIndex, amount, date });
    
        saveData();
        updateIncomeHistory();
        generateReport();
    }
    
    // Add Expense
    function addExpense() {
        const taskIndex = document.getElementById("expenseTask").value;
        const type = document.getElementById("expenseType").value;
        const amount = parseFloat(document.getElementById("expenseAmount").value);
    
        if (!type || isNaN(amount) || amount <= 0) {
            alert("Enter valid expense type and amount.");
            return;
        }
    
        expenses.push({ taskIndex, type, amount });
    
        saveData();
        updateExpenseHistory();
        generateReport();
    }
    
    // Update income history table
    function updateIncomeHistory() {
        const table = document.getElementById("incomeHistory");
        table.innerHTML = incomes.map(income => 
            `<tr><td>${tasks[income.taskIndex]?.name || "Deleted Task"}</td><td>${income.date}</td><td>₹${income.amount}</td></tr>`
        ).join("");
    }
    
    // Update expense history table
    function updateExpenseHistory() {
        const table = document.getElementById("expenseHistory");
        table.innerHTML = expenses.map(expense => 
            `<tr><td>${tasks[expense.taskIndex]?.name || "Deleted Task"}</td><td>${expense.type}</td><td>₹${expense.amount}</td></tr>`
        ).join("");
    }
    
    // Generate Profit/Loss Report
    function generateReport() {
        const selectedMonth = document.getElementById("filterMonth").value;
        if (!selectedMonth) return;
    
        let totalProfit = 0;
        let totalLoss = 0;
    
        const reportTable = document.getElementById("reportTable");
        reportTable.innerHTML = "";
    
        tasks.forEach((task, index) => {
            // Filter incomes and expenses based on the selected month
            let taskIncome = incomes
                .filter(i => i.taskIndex == index && i.date.startsWith(selectedMonth))
                .reduce((sum, i) => sum + i.amount, 0);
    
            let taskExpenses = expenses
                .filter(e => e.taskIndex == index && incomes.some(i => i.taskIndex == index && i.date.startsWith(selectedMonth)))
                .reduce((sum, e) => sum + e.amount, 0);
    
            let profitLoss = taskIncome - taskExpenses;
    
            if (profitLoss >= 0) {
                totalProfit += profitLoss;
            } else {
                totalLoss += Math.abs(profitLoss);
            }
    
            // Append to report table
            reportTable.innerHTML += `
                <tr>
                    <td>${task.name}</td>
                    <td>${task.startDate}</td>
                    <td>${task.endDate}</td>
                    <td>₹${taskIncome}</td>
                    <td>₹${taskExpenses}</td>
                    <td style="color: ${profitLoss >= 0 ? 'green' : 'red'};">₹${profitLoss}</td>
                </tr>
            `;
        });
    
        // Update total profit/loss
        document.getElementById("totalProfit").innerText = `₹${totalProfit}`;
        document.getElementById("totalLoss").innerText = `₹${totalLoss}`;
    }
    
    
    // Function to clear all stored data
    function clearData() {
        if (confirm("Are you sure you want to delete all data? This cannot be undone!")) {
            localStorage.removeItem("tasks");
            localStorage.removeItem("incomes");
            localStorage.removeItem("expenses");
            
            tasks = [];
            incomes = [];
            expenses = [];
    
            updateTaskDropdowns();
            updateIncomeHistory();
            updateExpenseHistory();
            generateReport();
            
            alert("All data has been cleared.");
        }
    }
    
    // Function to export data as a JSON file
    function exportData() {
        const data = {
            tasks,
            incomes,
            expenses
        };
        const jsonData = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonData], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "data_backup.json";
        a.click();
    }
    
    // Function to import data from a JSON file
    function importTaskData() {
        const fileInput = document.getElementById("importTaskFile");
        if (fileInput.files.length === 0) {
            alert("Please select a JSON file to import.");
            return;
        }
    
        const file = fileInput.files[0];
        const reader = new FileReader();
    
        reader.onload = function (event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (!importedData.tasks || !importedData.incomes || !importedData.expenses) {
                    throw new Error("Invalid JSON format!");
                }
    
                tasks = importedData.tasks;
                incomes = importedData.incomes;
                expenses = importedData.expenses;
    
                saveData();
                updateTaskDropdowns();
                updateIncomeHistory();
                updateExpenseHistory();
                generateReport();
    
                alert("Data imported successfully!");
            } catch (error) {
                alert("Failed to import data: " + error.message);
            }
        };
    
        reader.readAsText(file);
    }
    
    
    // Set default values to current date for all date inputs
    window.onload = function () {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        const formattedMonth = today.toISOString().slice(0, 7); // YYYY-MM format
    
        document.getElementById("startDate").value = formattedDate;
        document.getElementById("endDate").value = formattedDate;
        document.getElementById("incomeDate").value = formattedDate;
        document.getElementById("filterMonth").value = formattedMonth;
    
        updateTaskDropdowns();
        updateIncomeHistory();
        updateExpenseHistory();
        generateReport();
    };
