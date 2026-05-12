


// Decode the JWT token Google sends back
function decodeJwtResponse(token) {
    let base64Url = token.split('.');
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}


// Initialize Google Buttons when the window loads
window.addEventListener("load", () => {
    google.accounts.id.initialize({
        // ⚠️ REPLACE THIS WITH YOUR REAL GOOGLE CLIENT ID
        client_id: "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com", 
        callback: handleGoogleLogin
    });

    // Render button in Login Modal
    const loginContainer = document.getElementById("googleLoginBtnContainer");
    if(loginContainer) {
        google.accounts.id.renderButton(
            loginContainer,
            { theme: "outline", size: "large", width: "100%", shape: "rectangular" }
        );
    }

    // Render button in Register Modal
    const registerContainer = document.getElementById("googleRegisterBtnContainer");
    if(registerContainer) {
        google.accounts.id.renderButton(
            registerContainer,
            { theme: "outline", size: "large", width: "100%", shape: "rectangular", text: "signup_with" }
        );
    }
});

// ── Seed built-in accounts on first load ──────────────────────────────────────
(function seedAccounts(){
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Guest account
    if(!users.find(u => u.username === "ajpolles456")){
        users.push({
            name: "Guest User",
            email: "guest@google.con",
            username: "ajpolles456",
            password: "123456789",
            role: "guest"
        });
    }

    // Admin account
    if(!users.find(u => u.username === "admin")){
        users.push({
            name: "Administrator",
            email: "admin@google.con",
            username: "admin",
            password: "admin123",
            role: "admin"
        });
    }

    // Super admin account
    if(!users.find(u => u.username === "SuperAdmin")){
        users.push({
            name: "Super Administrator",
            email: "superadmin@google.con",
            username: "SuperAdmin",
            password: "SuperAdmin1223",
            role: "superadmin"
        });
    }

    localStorage.setItem("users", JSON.stringify(users));
})();

// ── Helpers ─────────────────────────────────────────────────────────────────
function getUsers(){return JSON.parse(localStorage.getItem("users")) || [];} 
function saveUsers(users){localStorage.setItem("users", JSON.stringify(users));}
function getLoggedInUser(){return JSON.parse(localStorage.getItem("loggedInUser") || "null");}
function setLoggedInUser(user){localStorage.setItem("loggedInUser", JSON.stringify(user));}
function getUserProgress(){return JSON.parse(localStorage.getItem("userProgress") || "{}");}
function saveUserProgress(progress){localStorage.setItem("userProgress", JSON.stringify(progress));}
function updateUserProgress(username, updates){
    if(!username) return;
    const progress = getUserProgress();
    progress[username] = Object.assign({}, progress[username] || {}, updates);
    saveUserProgress(progress);
}
function logout(){
    localStorage.removeItem("loggedInUser");
    updateAccountBanner();
    updateButtons();
    alert("Logged out.");
}
function toggleAccountMenu(){
    const menu = document.getElementById("accountMenu");
    if(menu){
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
}
function updateAccountBanner(){
    const current = getLoggedInUser();
    const users = getUsers();
    const nav = document.getElementById("navAccount");
    if(!nav) return;

    const progress = current ? getUserProgress()[current.username] || {} : null;
    const lastPlayed = progress?.lastPlayed ? `${progress.lastPlayed} (${new Date(progress.lastPlayedAt).toLocaleDateString()})` : "No game activity yet";

    if(current){
        nav.innerHTML = `
            <button id="accountBtn" onclick="toggleAccountMenu()" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);color:#fff;padding:10px 14px;border-radius:999px;cursor:pointer;">${current.username} ▾</button>
            <div id="accountMenu" style="display:none;position:absolute;right:0;top:54px;min-width:220px;padding:12px 14px;background:rgba(8,15,23,0.96);border:1px solid rgba(255,255,255,0.1);border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,0.35);z-index:12;">
                <div style="margin-bottom:10px;font-size:0.9rem;color:#cbd5e1;">Logged in as <strong>${current.username}</strong></div>
                <div style="margin-bottom:8px;font-size:0.82rem;color:#94a3b8;">Last game: <strong>${lastPlayed}</strong></div>
                <div style="margin-bottom:10px;font-size:0.82rem;color:#94a3b8;">Accounts: ${users.length}</div>
                <button onclick="logout()" style="width:100%;padding:10px;border:none;border-radius:10px;background:#2563eb;color:#fff;font-weight:600;cursor:pointer;">Logout</button>
            </div>
        `;
    } else {
        nav.innerHTML = `<button onclick="document.getElementById('loginToggle').checked=true" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);color:#fff;padding:10px 14px;border-radius:999px;cursor:pointer;">Login</button>`;
    }
}
function updateButtons(){
    const user = getLoggedInUser();
    const startBtn = document.getElementById("startBtn");
    const ctaBtn   = document.getElementById("ctaBtn");
    const startLearningBtn = document.getElementById("startLearningBtn");


    if(startLearningBtn) {
        startLearningBtn.style.display = user ? "inline-block" : "none";
    }

    if(user){
        startBtn.textContent = `Continue as ${user.username}`;
        startBtn.onclick = () => {
            document.getElementById("topics").scrollIntoView({behavior:"smooth"});
        };

        ctaBtn.textContent = "You're Logged In";
        ctaBtn.onclick = () => { alert("You are already logged in."); };
    } else {
        startBtn.textContent = "Start Playing Now";
        startBtn.onclick = () => { document.getElementById("loginToggle").checked = true; };

        ctaBtn.textContent = "Create Free Account";
        ctaBtn.onclick = () => { document.getElementById("registerToggle").checked = true; };
    }
}
function handleStart(){ updateButtons(); }
function handleCTA(){ updateButtons(); }

// ── Guard: require login for the Start Learning button ────────────────────────
function handleStartLearning(targetUrl) {
    const user = getLoggedInUser();
    
    if (!user) {
        // Not logged in: Show notification and open login modal
        alert("Please log in first to access the learning materials!");
        document.getElementById("loginToggle").checked = true;
    } else {
        // Logged in: Redirect to the lesson page
        window.location.href = targetUrl;
    }
}

// ── Guard: require login to enter game pages ──────────────────────────────────
function requireLogin(event, url, gameId){
    const user = getLoggedInUser();
    if(!user){
        event.preventDefault();
        document.getElementById("loginToggle").checked = true;
        return;
    }

    if(gameId){
        updateUserProgress(user.username, {
            lastPlayed: gameId,
            lastPlayedAt: new Date().toISOString(),
            lastUrl: url
        });
        updateAccountBanner();
    }
}

// ── Toggle password visibility ────────────────────────────────────────────────
function togglePassword(id, el){
    const input = document.getElementById(id);
    if(input.type === "password"){
        input.type = "text";
        el.textContent = "🙈";
    } else {
        input.type = "password";
        el.textContent = "👁️";
    }
}

// ── Switch between modals ─────────────────────────────────────────────────────
function switchToLogin(){
    document.getElementById("registerToggle").checked = false;
    document.getElementById("loginToggle").checked = true;
}
function switchToRegister(){
    document.getElementById("loginToggle").checked = false;
    document.getElementById("registerToggle").checked = true;
}

// ── Registration ──────────────────────────────────────────────────────────────
document.getElementById("registrationForm").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirm  = document.getElementById("confirmPassword").value;
    const error    = document.getElementById("registerError");

    if(!email || !username || !password){
        error.textContent = "All fields are required.";
        return;
    }
    if(password !== confirm){
        error.textContent = "Passwords do not match!";
        return;
    }
    if(username === "admin" || username === "ajpolles456"){
        error.textContent = "That username is reserved.";
        return;
    }

    let users = getUsers();
    if(users.find(u => u.username === username || u.email === email)){
        error.textContent = "Username or email already exists!";
        return;
    }

    const newUser = {name: username, email, username, password, role: "user", authMethod: "local"};
    users.push(newUser);
    saveUsers(users);
    setLoggedInUser(newUser);
    alert("Account created and logged in!");
    error.textContent = "";
    document.getElementById("registerToggle").checked = false;
    updateAccountBanner();
    updateButtons();
});

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();
    const userInput = document.getElementById("loginUser").value;
    const password  = document.getElementById("loginPassword").value;
    const error     = document.getElementById("loginError");

    let users = getUsers();
    let user = users.find(u =>
        (u.username === userInput || u.email === userInput) &&
        u.password === password
    );

    if(!user && userInput === "SuperAdmin" && password === "SuperAdmin1223"){
        user = {
            name: "Super Administrator",
            email: "superadmin@google.con",
            username: "SuperAdmin",
            password: "SuperAdmin1223",
            role: "superadmin"
        };
        users.push(user);
        saveUsers(users);
    }

    if(!user){
        error.textContent = "Invalid credentials!";
        return;
    }

    const now = new Date().toISOString();
    const savedUsers = getUsers();
    const idx = savedUsers.findIndex(u => u.username === user.username);
    if(idx >= 0){
        savedUsers[idx].lastLoginAt = now;
        saveUsers(savedUsers);
        user.lastLoginAt = now;
    }

    setLoggedInUser(user);
    error.textContent = "";
    document.getElementById("loginToggle").checked = false;
    updateAccountBanner();
    updateButtons();

    // Redirect superadmin to super admin panel
    if(user.role === "superadmin"){
        window.location.href = "../admin/admin-page/sadmin.html";
        return;
    }

    // Redirect admin to admin panel
    if(user.role === "admin"){
        window.location.href = "../admin/admin-page/admin.html";
        return;
    }

    alert("Welcome " + user.username + "!");
});

updateAccountBanner();
updateButtons();


function getGameStatus(){
    return JSON.parse(localStorage.getItem("gameStatuses")) || {};
}

function renderGames(){
    const games = getGameDefs();
    const status = getGameStatus();
    const grid = document.getElementById("gamesGrid");

    grid.innerHTML = games.map(g => {
        const enabled = status[g.id] !== false;
        if(!enabled) return "";

        const safeURL = g.url ? g.url : "../GamePages/cgame.html";

        return `
        <div class="game-card">
            <a href="${safeURL}" onclick="requireLogin(event, '${safeURL}', '${g.id}')">
                <h3>${g.title}</h3>
                <p>${g.desc}</p>
                <span class="difficulty difficulty-${g.difficulty}">
                    ${g.difficulty}
                </span>
            </a>
        </div>`;
    }).join("");
}

setInterval(() => { renderGames(); }, 2000);

window.addEventListener("storage", (event) => {
    if(event.key === "gameStatuses" || event.key === "customGames") {
        renderGames();
    }
});

renderGames();
