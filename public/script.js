const API = "http://localhost:3000/api";
let currentUser = null;

function setAuthState(isAuth, user) {

    if (user) {
        currentUser = user;
    } else {
        currentUser = null;
    }

    if (isAuth) {
        document.body.classList.add("authenticated");
        document.body.classList.remove("not-authenticated");
    } else {
        document.body.classList.add("not-authenticated");
        document.body.classList.remove("authenticated");
    }

    if (user && user.role === "admin") {
        document.body.classList.add("is-admin");
    } else {
        document.body.classList.remove("is-admin");
    }

    let name = document.getElementById("nav-username");

    if (name) {
        name.textContent = user ? user.username : "";
    }

}

function navigateTo(hash) {
    window.location.hash = hash;
}

function showPage(id) {

    let pages = document.querySelectorAll(".page");

    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active");
    }

    document.getElementById(id).classList.add("active");

}

function handleRouting() {

    let hash = window.location.hash;

    if (hash == "") {
        hash = "#/";
        navigateTo(hash);
    }

    if (hash === "#/")         showPage("home-page");
    if (hash === "#/register") showPage("register-page");
    if (hash === "#/login")    showPage("login-page");

    if (hash === "#/profile") {

        if (!currentUser) {
            navigateTo("#/login");
            return;
        }

        renderProfile();
        showPage("profile-page");

    }

    if (hash === "#/dashboard") {

        if (!currentUser || currentUser.role !== "admin") {
            navigateTo("#/");
            return;
        }

        renderDashboard();
        showPage("dashboard-page");

    }

    if (hash === "#/accounts") {

        if (!currentUser || currentUser.role !== "admin") {
            navigateTo("#/");
            return;
        }

        renderAccounts();
        showPage("accounts-page");

    }

    if (hash === "#/employees") {

        if (!currentUser || currentUser.role !== "admin") {
            navigateTo("#/");
            return;
        }

        renderEmployees();
        showPage("employees-page");

    }

    if (hash === "#/departments") {

        if (!currentUser || currentUser.role !== "admin") {
            navigateTo("#/");
            return;
        }

        renderDepartments();
        showPage("departments-page");

    }

    if (hash === "#/requests") {

        if (!currentUser) {
            navigateTo("#/login");
            return;
        }

        renderRequests();
        showPage("requests-page");

    }

}

document.getElementById("register-form").onsubmit = async function (e) {

    e.preventDefault();

    let username = document.getElementById("reg-username").value;
    let password = document.getElementById("reg-password").value;

    const res  = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Registered successfully! Please login.");
        navigateTo("#/login");
    } else {
        alert(data.error);
    }

};

document.getElementById("login-form").onsubmit = async function (e) {

    e.preventDefault();

    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    const res  = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        sessionStorage.setItem("token", data.token);
        setAuthState(true, data.user);
        navigateTo("#/profile");
    } else {
        alert(data.error);
    }

};

document.getElementById("logout-btn").onclick = function () {

    sessionStorage.removeItem("token");

    setAuthState(false, null);

    navigateTo("#/");

};

async function renderProfile() {

    let token = sessionStorage.getItem("token");

    const res  = await fetch(API + "/profile", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    let div = document.getElementById("profile-info");

    if (res.ok) {
        div.innerHTML = `
            <p><b>Username:</b> ${data.user.username}</p>
            <p><b>Role:</b> ${data.user.role}</p>
        `;
    } else {
        div.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }

}

async function renderDashboard() {

    let token = sessionStorage.getItem("token");

    const res  = await fetch(API + "/admin/dashboard", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    let div = document.getElementById("dashboard-info");

    if (res.ok) {
        div.innerHTML = `
            <p>${data.message}</p>
            <p><b>Data:</b> ${data.data}</p>
        `;
    } else {
        div.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }

}

async function renderAccounts() {

    let token = sessionStorage.getItem("token");

    const res   = await fetch(API + "/accounts", {
        headers: { "Authorization": "Bearer " + token }
    });

    const accounts = await res.json();

    let table = document.getElementById("accounts-table");

    table.innerHTML = "";

    for (let i = 0; i < accounts.length; i++) {

        let acc = accounts[i];

        table.innerHTML += `
        <tr>
            <td>${acc.username}</td>
            <td>${acc.role}</td>
            <td>
                <button class="btn btn-outline-danger" onclick="deleteAccount(${acc.id})">Delete</button>
            </td>
        </tr>
        `;

    }

}

document.getElementById("add-account-btn").onclick = function () {
    navigateTo("#/register");
};

async function deleteAccount(id) {

    if (!confirm("Delete this account?")) return;

    let token = sessionStorage.getItem("token");

    await fetch(API + "/accounts/" + id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    renderAccounts();

}

async function renderEmployees() {

    let token = sessionStorage.getItem("token");

    const res   = await fetch(API + "/employees", {
        headers: { "Authorization": "Bearer " + token }
    });

    const employees = await res.json();

    let table = document.getElementById("employees-table");

    table.innerHTML = "";

    for (let i = 0; i < employees.length; i++) {

        let e = employees[i];

        table.innerHTML += `
        <tr>
            <td>${e.employeeId}</td>
            <td>${e.email}</td>
            <td>${e.position}</td>
            <td>${e.department}</td>
            <td>
                <button class="btn btn-outline-danger" onclick="deleteEmployee(${e.id})">Delete</button>
            </td>
        </tr>
        `;

    }

}

document.getElementById("add-employee-btn").onclick = function () {
    document.getElementById("employee-form-card").style.display = "block";
};

document.getElementById("cancel-employee-btn").onclick = function () {
    document.getElementById("employee-form-card").style.display = "none";
};

document.getElementById("employee-form").onsubmit = async function (e) {

    e.preventDefault();

    let token = sessionStorage.getItem("token");

    let body = {
        employeeId: document.getElementById("empId").value,
        email:      document.getElementById("empEmail").value,
        position:   document.getElementById("empPosition").value,
        department: document.getElementById("empDepartment").value,
        hireDate:   document.getElementById("empDate").value
    };

    await fetch(API + "/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(body)
    });

    document.getElementById("employee-form-card").style.display = "none";
    renderEmployees();

};

async function deleteEmployee(id) {

    if (!confirm("Delete this employee?")) return;

    let token = sessionStorage.getItem("token");

    await fetch(API + "/employees/" + id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    renderEmployees();

}

async function renderDepartments() {

    let token = sessionStorage.getItem("token");

    const res   = await fetch(API + "/departments", {
        headers: { "Authorization": "Bearer " + token }
    });

    const departments = await res.json();

    let table = document.getElementById("departments-table");

    table.innerHTML = "";

    for (let i = 0; i < departments.length; i++) {

        let d = departments[i];

        table.innerHTML += `
        <tr>
            <td>${d.name}</td>
            <td>${d.description}</td>
            <td>
                <button class="btn btn-outline-danger" onclick="deleteDepartment(${d.id})">Delete</button>
            </td>
        </tr>
        `;

    }

}

document.getElementById("add-department-btn").onclick = async function () {

    let name = prompt("Department Name:");
    if (!name) return alert("Department name is required.");

    let description = prompt("Description:") || "";

    let token = sessionStorage.getItem("token");

    await fetch(API + "/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ name, description })
    });

    renderDepartments();

};

async function deleteDepartment(id) {

    if (!confirm("Delete this department?")) return;

    let token = sessionStorage.getItem("token");

    await fetch(API + "/departments/" + id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    renderDepartments();

}

async function renderRequests() {

    let token = sessionStorage.getItem("token");

    const res   = await fetch(API + "/requests", {
        headers: { "Authorization": "Bearer " + token }
    });

    const requests = await res.json();

    let table = document.getElementById("requests-table");

    table.innerHTML = "";

    if (requests.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center;">
                You have no requests yet.
            </td>
        </tr>
        `;

        return;

    }

    for (let i = 0; i < requests.length; i++) {

        let r = requests[i];

        table.innerHTML += `
        <tr>
            <td>${r.type}</td>
            <td>${r.items ? r.items.join(", ") : ""}</td>
            <td>${r.date}</td>
            <td><span class="badge bg-warning">${r.status}</span></td>
        </tr>
        `;

    }

}

document.getElementById("add-item-btn").onclick = function () {

    let list = document.getElementById("items-list");

    list.innerHTML += `
        <div class="item-row row g-1 my-1">
            <div class="col-sm-9">
                <input class="item-name form-control" type="text" placeholder="Item Name">
            </div>
            <div class="col">
                <input class="item-qty form-control" type="number" value="1" style="width:50px">
            </div>
            <div class="col">
                <button type="button" class="btn btn-danger" onclick="this.closest('.item-row').remove()"><b>X</b></button>
            </div>
        </div>
    `;

};

document.getElementById("submit-request-btn").onclick = async function () {

    let type  = document.getElementById("request-type").value;
    let rows  = document.querySelectorAll("#items-list .item-row");
    let items = [];
    let token = sessionStorage.getItem("token");

    for (let i = 0; i < rows.length; i++) {

        let name = rows[i].querySelector(".item-name").value.trim();
        let qty  = rows[i].querySelector(".item-qty").value;

        if (name) items.push({ name, qty });

    }

    if (items.length === 0) {
        alert("Add at least one item.");
        return;
    }

    await fetch(API + "/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ type, items })
    });

    bootstrap.Modal.getInstance(document.getElementById("requestModal")).hide();
    renderRequests();

};

document.getElementById("get-started-btn").onclick = function () {
    navigateTo(currentUser ? "#/profile" : "#/login");
};

async function init() {

    let token = sessionStorage.getItem("token");

    if (token) {

        const res = await fetch(API + "/profile", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {

            const data = await res.json();
            setAuthState(true, data.user);

        } else {

            sessionStorage.removeItem("token");
            setAuthState(false, null);

        }

    } else {

        setAuthState(false, null);

    }

    handleRouting();

}

window.addEventListener("hashchange", handleRouting);
init();