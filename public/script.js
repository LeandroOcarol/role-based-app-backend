const STORAGE_KEY = "ipt_demo_v1";
let currentUser = null;

/* ================= STORAGE ================= */

function loadFromStorage(){

    let data = localStorage.getItem(STORAGE_KEY);

    if(data == null){

        window.db = {
            accounts:[
                {
                    first:"Admin",
                    last:"User",
                    email:"admin@example.com",
                    password:"Password123!",
                    role:"admin",
                    verified:true
                }
            ],
            departments:[],
            employees:[],
            requests:[]
        };

        saveToStorage();

    }else{

        window.db = JSON.parse(data);

    }

}

function saveToStorage(){

    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));

}


/* ================= AUTH STATE ================= */

function setAuthState(isAuth,user){

    if(user){
        currentUser = user;
    }else{
        currentUser = null;
    }

    if(isAuth){
        document.body.classList.add("authenticated");
        document.body.classList.remove("not-authenticated");
    }else{
        document.body.classList.add("not-authenticated");
        document.body.classList.remove("authenticated");
    }

    if(user && user.role === "admin"){
        document.body.classList.add("is-admin");
    }else{
        document.body.classList.remove("is-admin");
    }

    let name = document.getElementById("nav-username");

    if(name){
        name.textContent = user ? user.first : "";
    }

}


/* ================= ROUTING ================= */

function navigateTo(hash){

    window.location.hash = hash;

}

function showPage(id){

    let pages = document.querySelectorAll(".page");

    for(let i=0;i<pages.length;i++){
        pages[i].classList.remove("active");
    }

    document.getElementById(id).classList.add("active");

}

function handleRouting(){

    let hash = window.location.hash;

    if(hash == ""){
        hash = "#/";
        navigateTo(hash);
    }

    if(hash === "#/") showPage("home-page");
    if(hash === "#/register") showPage("register-page");
    if(hash === "#/login") showPage("login-page");
    if(hash === "#/verify-email") showPage("verify-page");


    if(hash === "#/profile"){

        if(!currentUser){
            navigateTo("#/login");
            return;
        }

        renderProfile();
        showPage("profile-page");

    }


    if(hash === "#/accounts"){

        if(!currentUser || currentUser.role !== "admin"){
            navigateTo("#/");
            return;
        }

        renderAccounts();
        showPage("accounts-page");

    }


    if(hash === "#/departments"){

        if(!currentUser || currentUser.role !== "admin"){
            navigateTo("#/");
            return;
        }

        renderDepartments();
        showPage("departments-page");

    }


    if(hash === "#/employees"){

        if(!currentUser || currentUser.role !== "admin"){
            navigateTo("#/");
            return;
        }

        renderEmployees();
        addEmployee();
        showPage("employees-page");

    }


    if(hash === "#/requests"){

        if(!currentUser){
            navigateTo("#/login");
            return;
        }

        renderRequests();
        showPage("requests-page");

    }

}


/* ================= REGISTER ================= */

document.getElementById("register-form").onsubmit = function(e){

    e.preventDefault();

    let first = document.getElementById("reg-first").value;
    let last = document.getElementById("reg-last").value;
    let email = document.getElementById("reg-email").value;
    let password = document.getElementById("reg-password").value;

    for(let i=0;i<window.db.accounts.length;i++){

        if(window.db.accounts[i].email === email){
            alert("Email already exists");
            return;
        }

    }

    window.db.accounts.push({
        first:first,
        last:last,
        email:email,
        password:password,
        role:"user",
        verified:false
    });

    localStorage.setItem("unverified_email",email);

    saveToStorage();

    navigateTo("#/verify-email");

};


/* ================= VERIFY ================= */

document.getElementById("verify-btn").onclick = function(){

    let email = localStorage.getItem("unverified_email");

    for(let i=0;i<window.db.accounts.length;i++){

        if(window.db.accounts[i].email === email){

            window.db.accounts[i].verified = true;

        }

    }

    saveToStorage();

    alert("Email Verified");

    navigateTo("#/login");

};


/* ================= LOGIN ================= */

async function login(username, password){
    try{
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await response.json();

        if (response.ok) {

        } else {
            alert ('Login failed: ' + data.error);
        }
    } catch(err) {
        alert('Network error');
    }
}

function getAuthHeader() {
    const token = sessionStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}` } : {};
}

async function loadAdminDashboard() {
    const res = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: getAuthHeader()
    });
    if (res.ok) {
        const data = await res.json();
        document.getElementById('content').innerText = data.message;
    } else {
        document.getElementById('content').innerText = 'Access Denied!';
    }
}




/*document.getElementById("login-form").onsubmit = function(e){

    e.preventDefault();

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    let foundUser = null;

    for(let i=0;i<window.db.accounts.length;i++){

        let acc = window.db.accounts[i];

        if(acc.email === email && acc.password === password && acc.verified){

            foundUser = acc;

        }

    }

    if(!foundUser){

        alert("Invalid login or email not verified");
        return;

    }

    localStorage.setItem("auth_token",email);

    setAuthState(true,foundUser);

    navigateTo("#/profile");

};*/



/* ================= LOGOUT ================= */

document.getElementById("logout-btn").onclick = function(){

    localStorage.removeItem("auth_token");

    setAuthState(false,null);

    navigateTo("#/");

};


/* ================= PROFILE ================= */

function renderProfile(){

    let div = document.getElementById("profile-info");

    div.innerHTML = `
        <p><b>Name:</b> ${currentUser.first} ${currentUser.last}</p>
        <p><b>Email:</b> ${currentUser.email}</p>
        <p><b>Role:</b> ${currentUser.role}</p>
    `;

}


/* ================= ACCOUNTS ================= */

function renderAccounts(){

    let table = document.getElementById("accounts-table");

    table.innerHTML = "";

    for(let i=0;i<window.db.accounts.length;i++){

        let acc = window.db.accounts[i];

        table.innerHTML += `
        <tr>
            <td>${acc.first} ${acc.last}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td>${acc.verified ? "✔" : "—"}</td>
            <td>
                <button class="btn btn-outline-primary"onclick="editAccount('${acc.email}')">Edit</button>
                <button class="btn btn-outline-warning"onclick="resetPassword('${acc.email}')">Reset</button>
                <button class="btn btn-outline-danger"onclick="deleteAccount('${acc.email}')">Delete</button>
            </td>
        </tr>
        `;
    }

}

function editAccount(email){

    for(let i=0;i<window.db.accounts.length;i++){

        let acc = window.db.accounts[i];

        if(acc.email === email){

            let first = prompt("First Name:",acc.first);
            let last = prompt("Last Name:",acc.last);

            if(first) acc.first = first;
            if(last) acc.last = last;

        }

    }

    saveToStorage();
    renderAccounts();
}

function resetPassword(email){

    for(let i=0;i<window.db.accounts.length;i++){

        let acc = window.db.accounts[i];

        if(acc.email === email){

            let pass = prompt("New Password:");

            if(pass){
                acc.password = pass;
                alert("Password Reset");
            }

        }

    }

    saveToStorage();
    renderAccounts();

}

function deleteAccount(email){

    if(email === currentUser.email){

        alert("Cannot delete your own account");
        return;

    }

    for(let i=0;i<window.db.accounts.length;i++){

        if(window.db.accounts[i].email === email){

            window.db.accounts.splice(i,1);

        }

    }

    saveToStorage();
    renderAccounts();

}


/* ================= DEPARTMENTS ================= */

function renderDepartments(){

    let table = document.getElementById("departments-table");

    table.innerHTML = "";

    for(let i=0;i<window.db.departments.length;i++){

        let d = window.db.departments[i];

        table.innerHTML += `
        <tr>
            <td>${d.name}</td>
            <td>${d.description}</td>
            <td>
                <button class="btn btn-outline-primary"onclick="editDepartment('${d.name}')">Edit</button>
                <button class="btn btn-outline-danger"onclick="deleteDepartment('${d.name}')">Delete</button>
            </td>
        </tr>
        `
    }
}

function editDepartment(name){

    for(let i=0;i<window.db.departments.length;i++){

        let d = window.db.departments[i];

        if(d.name === name){

            let newName = prompt("Name:", d.name);
            let newDesc = prompt("Description:", d.description)

            if(newName) d.name = newName;
            if(newDesc) d.description = newDesc;

            saveToStorage();
            renderDepartments();
        }
    }
}

function deleteDepartment(name){

    for(let i=0;i<window.db.departments.length;i++){

        if(window.db.departments[i].name === name){
            window.db.departments.splice(i,1);
        }

        saveToStorage();
        renderDepartments();
    }
}

function addDepartment(){

    let name = prompt("Department:");
    if(!name) return alert("Department name is required.");
    for(let i=0;i<window.db.departments.length;i++){
        if(window.db.departments[i].name === name){
            return alert("This department name already exists.")
        }
    }

    let description = prompt("Description:");
    if(!description) description = "";


    window.db.departments.push({
        name: name,
        description: description
    });

    saveToStorage();
    renderDepartments();
}


/* ================= EMPLOYEES ================= */

function renderEmployees(){

    let table = document.getElementById("employees-table");

    table.innerHTML = "";

    for(let i=0;i<window.db.employees.length;i++){

        let e = window.db.employees[i];

        table.innerHTML += `
        <tr>
            <td>${e.id}</td>
            <td>${e.email}</td>
            <td>${e.position}</td>
            <td>${e.department}</td>
            <td>
                <button class="btn btn-outline-primary"onclick="editEmployee('${e.id}')">Edit</button>
                <button class="btn btn-outline-danger"onclick="deleteEmployee('${e.id}')">Delete</button>
            </td>
        </tr>
        `;

    }
}

function addEmployee(){

    let e = window.db.employees;

    document.getElementById("employee-form").onsubmit = function(e){

        let id = document.getElementById("empId").value;
        let email = document.getElementById("empEmail").value;
        let position = document.getElementById("empPosition").value;
        let department = document.getElementById("empDepartment").value;
        let date = document.getElementById("empDate").value;

        let departmentExists = false;
        for(let i=0;i<window.db.departments.length;i++){

            if(window.db.departments[i].name === department){
                departmentExists = true;
            }
        }

        if(departmentExists){ 
            window.db.employees.push({
            id: id,
            email: email,
            position: position,
            department: department,
            date: date});
        }
        else{
            return alert("Department name doesn't exists.");
        }

        saveToStorage();
        renderEmployees();
        
    }
}

function editEmployee(id){  

    for(let i=0;i<window.db.employees.length;i++){

        let e = window.db.employees[i];

        if(e.id === id){

            let newId = prompt("New ID:");
            let newEmail = prompt("New Email:");
            let newPosition = prompt("New Position:");
            let newDepartment = prompt("New Department:");

            if(newId) e.id = newId;
            if(newEmail) e.email = newEmail;
            if(newPosition) e.position = newPosition;
            if(newDepartment) e.department = newDepartment;

            saveToStorage();
            renderEmployees();
        }
    }
}

function deleteEmployee(id){

    for(let i=0;i<window.db.employees.length;i++){

        if(window.db.employees[i].id === id){
            window.db.employees.splice(i,1);

            saveToStorage();
            renderEmployees();
        }
    }
}

/* ================= REQUESTS ================= */

function renderRequests(){

    let table = document.getElementById("requests-table");

    table.innerHTML = "";

    let hasRequest = false;

    for(let i=0;i<window.db.requests.length;i++){

        let r = window.db.requests[i];

        if(r.employeeEmail === currentUser.email){

            hasRequest = true;

            table.innerHTML += `
            <tr>
                <td>${r.type}</td>
                <td>${r.date}</td>
                <td><span class="badge bg-warning">${r.status}</span></td>
            </tr>
            `;

        }
    }

    if(!hasRequest){

        table.innerHTML = `
        <tr>
            <td colspan="3" style="text-align:center;">
                You have no requests yet.
            </td>
        </tr>
        `;

    }
}

function addItem(){

    let list = document.getElementById("items-list");

    list.innerHTML += `
        <div class="item-row row g-1 my-1">
            <div class="col-sm-9">
                <input class="item-name form-control " type="text" placeholder="Item Name">
            </div>
            <div class="col">
                <input class="item-qty form-control" type="number" value="1" style="width:50px">
            </div>
            <div class="col">
                <button class="btn btn-danger" onclick="removeItem(this)"><b>X</b></button>
            </div>
        </div>
    `;
}

function removeItem(button){

    button.parentElement.parentElement.remove();
}

function submitRequest(){

    let type = document.getElementById("request-type").value;

    let rows = document.querySelectorAll("#items-list .item-row");

    let items = [];

    for(let i = 0; i < rows.length; i++){

        let name = rows[i].children[0].value;

        if(name !== ""){
            items.push(name);
        }

    }

    if(items.length === 0){
        alert("Add at least one item");
        return;
    }

    window.db.requests.push({
        employeeEmail: currentUser.email,
        type: type,
        date: new Date().toLocaleDateString(),
        status: "Pending",
        items: items
    });

    saveToStorage();
    renderRequests();

}

/* ================= INIT ================= */

loadFromStorage();

let token = localStorage.getItem("auth_token");

if(token){

    for(let i=0;i<window.db.accounts.length;i++){

        if(window.db.accounts[i].email === token){

            setAuthState(true,window.db.accounts[i]);

        }

    }

}

window.addEventListener("hashchange",handleRouting);

handleRouting();