// Auth Guard - Super Admin only
(function(){
    const u = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    // Ensure only superadmins can access this page
    if(!u || u.role !== "superadmin"){ 
        alert("Elevated access required. Super Admin strictly."); 
        window.location.href = "../../pages/landingpage.html"; 
    }
})();

// Data Management
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const saveUsers = u => localStorage.setItem("users", JSON.stringify(u));
const getGames = () => JSON.parse(localStorage.getItem("customGames") || "[]");
const saveGames = g => localStorage.setItem("customGames", JSON.stringify(g));
const getAnns = () => JSON.parse(localStorage.getItem("announcements") || "[]");
const saveAnns = a => localStorage.setItem("announcements", JSON.stringify(a));
const getLogs = () => JSON.parse(localStorage.getItem("systemLogs") || '[{"time":"2026-05-11 10:00","action":"System Boot","user":"SYSTEM","level":"INFO"}]');
const saveLogs = l => localStorage.setItem("systemLogs", JSON.stringify(l));
const getMaps = () => JSON.parse(localStorage.getItem("customMaps") || "[]");
const saveMaps = m => localStorage.setItem("customMaps", JSON.stringify(m));
const getStories = () => JSON.parse(localStorage.getItem("customStories") || "[]");
const saveStories = s => localStorage.setItem("customStories", JSON.stringify(s));
const getCharacters = () => JSON.parse(localStorage.getItem("customCharacters") || "[]");
const saveCharacters = c => localStorage.setItem("customCharacters", JSON.stringify(c));
const getUserProgress = () => JSON.parse(localStorage.getItem("userProgress") || "{}");

function addLog(action, user, level="INFO") {
    const logs = getLogs();
    logs.unshift({ time: new Date().toLocaleString(), action, user, level });
    saveLogs(logs.slice(0, 50)); // Keep last 50
    renderLogs();
}

function roleBadge(r){ 
    const m = { superadmin: "badge-superadmin", admin: "badge-admin", user: "badge-user" }; 
    return `<span class="badge ${m[r]||'badge-user'}">${r||"user"}</span>`; 
}

function toast(msg){
    const t = document.getElementById("toast");
    t.textContent = msg; 
    t.className = "show";
    clearTimeout(t._t); 
    t._t = setTimeout(() => t.className = "", 2800);
}

// Navigation
function showSection(name, el){
    document.querySelectorAll(".panel-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
    document.getElementById("section-" + name).classList.add("active");
    if(el) el.classList.add("active");
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../../Pages/landingpage.html";
}

// Rendering Functions
function renderOverview() {
    const users = getUsers();
    const admins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
    const progress = getUserProgress();
    const progressUsers = Object.keys(progress).length;
    const activeProgress = Object.values(progress).filter(p => p.lastPlayed).length;
    
    document.getElementById("statsGrid").innerHTML = `
        <div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value blue">${users.length}</div></div>
        <div class="stat-card"><div class="stat-label">Total Admins</div><div class="stat-value" style="color:var(--super)">${admins}</div></div>
        <div class="stat-card"><div class="stat-label">Users With Progress</div><div class="stat-value green">${progressUsers}</div></div>
        <div class="stat-card"><div class="stat-label">Progress Entries</div><div class="stat-value" style="color:#3fb950">${activeProgress}</div></div>
    `;

    const recent = users.slice(-5).reverse();
    document.getElementById("recentTable").innerHTML = recent.map(u => {
        const progressEntry = progress[u.username];
        const progressLabel = progressEntry
            ? `${progressEntry.lastPlayed || 'Started'}${progressEntry.lastPlayedAt ? ` (${new Date(progressEntry.lastPlayedAt).toLocaleDateString()})` : ''}`
            : 'No activity yet';
        return `
        <tr><td><strong>${u.username}</strong></td><td>${u.name || "—"}</td><td>${u.email}</td><td>${progressLabel}</td></tr>
    `;
    }).join("");
}

function renderUsers() {
    const q = (document.getElementById("userSearch").value || "").toLowerCase();
    const users = getUsers().filter(u => u.username.toLowerCase().includes(q));
    const progress = getUserProgress();
    
    document.getElementById("usersTable").innerHTML = users.map(u => {
        const progressEntry = progress[u.username];
        const progressCell = progressEntry
            ? `<strong>${progressEntry.lastPlayed || 'Seen'}</strong><div style="color:var(--muted);font-size:0.75rem;">${progressEntry.lastPlayedAt ? new Date(progressEntry.lastPlayedAt).toLocaleDateString() : ''}</div>`
            : 'No activity';
        return `
        <tr>
            <td><strong>${u.username}</strong></td><td>${u.name || "—"}</td><td>${u.email}</td><td>${progressCell}</td><td>${roleBadge(u.role)}</td>
            <td>
                ${u.role !== 'superadmin' ? `<button class="btn-sm btn-warning" onclick="openResetModal('${u.username}')">Reset</button>` : ''}
                ${u.role === 'user' ? `<button class="btn-sm btn-primary-sm" onclick="promoteUser('${u.username}')">Promote</button>` : ''}
            </td>
        </tr>
    `;
    }).join("");
}

function renderAdmins() {
    const admins = getUsers().filter(u => u.role === 'admin' || u.role === 'superadmin');
    document.getElementById("adminsTable").innerHTML = admins.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td><td>${u.name || "—"}</td><td>${u.email}</td><td>${roleBadge(u.role)}</td>
            <td>
                ${u.role === 'admin' ? `<button class="btn-sm btn-danger" onclick="demoteAdmin('${u.username}')">Revoke Admin</button>` : '<em>Root</em>'}
            </td>
        </tr>
    `).join("");
}

function renderLogs() {
    const logs = getLogs();
    document.getElementById("logsTable").innerHTML = logs.map(l => `
        <tr>
            <td style="color:var(--muted); font-size: 0.8rem;">${l.time}</td>
            <td>${l.action}</td>
            <td><strong>${l.user}</strong></td>
            <td><span style="color:${l.level==='WARN'?'var(--warning)':'var(--accent)'}">${l.level}</span></td>
        </tr>
    `).join("");
}

function renderGames() {
    const games = getGames();
    const maps = getMaps();
    const stories = getStories();
    const characters = getCharacters();

    document.getElementById("gamesManager").innerHTML = `
        <div class="section-header"><h3>Game Topics</h3></div>
        ${games.map((g, i) => `
        <div class="game-manage-card">
            <h4>${g.title}</h4>
            <p style="font-size:0.8rem;color:var(--muted)">${g.desc}</p>
            <div class="game-card-footer">
                <span style="font-size:0.7rem; color:var(--accent)">ID: ${g.id}</span>
                <button class="btn-sm btn-danger" onclick="deleteGame(${i})">Delete</button>
            </div>
        </div>`).join("")}
    `;

    document.getElementById("mapsManager").innerHTML = `
        <div class="section-header"><h3>Maps</h3></div>
        ${maps.length ? maps.map((m, i) => `
        <div class="game-manage-card">
            <h4>${m.name}</h4>
            <p style="font-size:0.8rem;color:var(--muted)">${m.desc}</p>
            <div class="game-card-footer">
                <span style="font-size:0.7rem; color:var(--accent)">ID: ${m.id}</span>
                <button class="btn-sm btn-danger" onclick="deleteMap(${i})">Delete</button>
            </div>
        </div>`).join("") : `<div class="empty" style="padding:12px; color:var(--muted);">No maps created yet.</div>`}
    `;

    document.getElementById("storiesManager").innerHTML = `
        <div class="section-header"><h3>Stories</h3></div>
        ${stories.length ? stories.map((s, i) => `
        <div class="game-manage-card">
            <h4>${s.title}</h4>
            <p style="font-size:0.8rem;color:var(--muted)">${s.summary}</p>
            <div class="game-card-footer">
                <span style="font-size:0.7rem; color:var(--accent)">ID: ${s.id}</span>
                <button class="btn-sm btn-danger" onclick="deleteStory(${i})">Delete</button>
            </div>
        </div>`).join("") : `<div class="empty" style="padding:12px; color:var(--muted);">No stories created yet.</div>`}
    `;

    document.getElementById("charactersManager").innerHTML = `
        <div class="section-header"><h3>Characters</h3></div>
        ${characters.length ? characters.map((c, i) => `
        <div class="game-manage-card">
            <h4>${c.name}</h4>
            <p style="font-size:0.8rem;color:var(--muted)">${c.desc}</p>
            <div class="game-card-footer">
                <span style="font-size:0.7rem; color:var(--accent)">ID: ${c.id}</span>
                <button class="btn-sm btn-danger" onclick="deleteCharacter(${i})">Delete</button>
            </div>
        </div>`).join("") : `<div class="empty" style="padding:12px; color:var(--muted);">No characters created yet.</div>`}
    `;
}

function renderAnnouncements() {
    const anns = getAnns();
    document.getElementById("annList").innerHTML = anns.map(a => `
        <div style="background:var(--surface-strong); border:1px solid var(--line); padding: 15px; border-radius: 10px; margin-bottom:10px;">
            <div style="color:var(--accent-strong); font-weight:bold; margin-bottom:5px;">${a.title}</div>
            <div style="font-size:0.85rem; color:var(--muted)">${a.body}</div>
        </div>
    `).join("");
}

// Super Admin Actions
function promoteUser(username) {
    if(!confirm(`Promote ${username} to Admin?`)) return;
    let users = getUsers();
    let u = users.find(x => x.username === username);
    if(u) { u.role = 'admin'; saveUsers(users); addLog("Promoted to Admin", username, "WARN"); renderUsers(); renderAdmins(); toast(`${username} is now an Admin`); }
}

function demoteAdmin(username) {
    if(!confirm(`Revoke admin privileges from ${username}?`)) return;
    let users = getUsers();
    let u = users.find(x => x.username === username);
    if(u) { u.role = 'user'; saveUsers(users); addLog("Demoted to User", username, "WARN"); renderUsers(); renderAdmins(); toast(`${username} is now a User`); }
}

function deleteGame(index) {
    let games = getGames();
    let deleted = games.splice(index, 1);
    saveGames(games);
    addLog("Deleted Game Topic", deleted[0].title, "WARN");
    renderGames();
    toast("Game deleted.");
}

// Modals
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openResetModal(username) {
    document.getElementById("resetUsername").innerText = username;
    document.getElementById("newPassword").value = "";
    openModal("resetModal");
}

function confirmReset() {
    const un = document.getElementById("resetUsername").innerText;
    const pw = document.getElementById("newPassword").value;
    if(!pw) return;
    let users = getUsers();
    let u = users.find(x => x.username === un);
    if(u) { 
        u.password = pw; 
        saveUsers(users); 
        addLog("Password Reset", un, "WARN");
        closeModal("resetModal"); 
        toast("Password updated successfully."); 
    }
}

function addNewGame() {
    const id = document.getElementById("gameId").value;
    const title = document.getElementById("gameTitle").value;
    const desc = document.getElementById("gameDesc").value;
    if(!id || !title) return;
    
    let games = getGames();
    games.push({id, title, desc, difficulty: "beginner"});
    saveGames(games);
    addLog("Created Game Topic", title, "INFO");
    closeModal("addGameModal");
    renderGames();
    toast("Game added successfully");
}

function addNewMap() {
    const id = document.getElementById("mapId").value;
    const name = document.getElementById("mapName").value;
    const desc = document.getElementById("mapDesc").value;
    if(!id || !name) return;

    let maps = getMaps();
    maps.push({id, name, desc});
    saveMaps(maps);
    addLog("Created Map", name, "INFO");
    closeModal("addMapModal");
    renderGames();
    toast("Map added successfully");
}

function addNewStory() {
    const id = document.getElementById("storyId").value;
    const title = document.getElementById("storyTitle").value;
    const summary = document.getElementById("storySummary").value;
    if(!id || !title) return;

    let stories = getStories();
    stories.push({id, title, summary});
    saveStories(stories);
    addLog("Created Story", title, "INFO");
    closeModal("addStoryModal");
    renderGames();
    toast("Story added successfully");
}

function addNewCharacter() {
    const id = document.getElementById("characterId").value;
    const name = document.getElementById("characterName").value;
    const desc = document.getElementById("characterDesc").value;
    if(!id || !name) return;

    let characters = getCharacters();
    characters.push({id, name, desc});
    saveCharacters(characters);
    addLog("Created Character", name, "INFO");
    closeModal("addCharacterModal");
    renderGames();
    toast("Character added successfully");
}

function deleteMap(index) {
    let maps = getMaps();
    const removed = maps.splice(index, 1);
    saveMaps(maps);
    addLog("Deleted Map", removed[0]?.name || "map", "WARN");
    renderGames();
    toast("Map deleted.");
}

function deleteStory(index) {
    let stories = getStories();
    const removed = stories.splice(index, 1);
    saveStories(stories);
    addLog("Deleted Story", removed[0]?.title || "story", "WARN");
    renderGames();
    toast("Story deleted.");
}

function deleteCharacter(index) {
    let characters = getCharacters();
    const removed = characters.splice(index, 1);
    saveCharacters(characters);
    addLog("Deleted Character", removed[0]?.name || "character", "WARN");
    renderGames();
    toast("Character deleted.");
}

function postAnnouncement() {
    const title = document.getElementById("annTitle").value;
    const body = document.getElementById("annBody").value;
    const type = document.getElementById("annType").value;
    if(!title || !body) return;

    let anns = getAnns();
    anns.push({title, body, type, date: new Date().toISOString()});
    saveAnns(anns);
    addLog("Posted Announcement", title, "INFO");
    closeModal("annModal");
    renderAnnouncements();
    toast("Announcement posted.");
}

function renderHeader() {
    const current = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    const status = document.getElementById("topbarStatus");
    if(!status) return;
    if(current){
        const loginLabel = current.username ? `${current.username} (${current.role})` : `${current.role}`;
        status.textContent = `Signed in as ${loginLabel}`;
    } else {
        status.textContent = "No active super admin session.";
    }
}

// Init
function init() {
    renderHeader();
    renderOverview();
    renderUsers();
    renderAdmins();
    renderGames();
    renderLogs();
    renderAnnouncements();
}

window.onload = init;

// ==========================================
// FIXED INITIALIZATION / CLEANUP LOGIC
// ==========================================

let allUsers = JSON.parse(localStorage.getItem("users") || "[]");

// 1. Remove any existing duplicates from localStorage
let uniqueUsers = [];
let seenUsernames = new Set();

allUsers.forEach(u => {
    if (!seenUsernames.has(u.username)) {
        seenUsernames.add(u.username);
        uniqueUsers.push(u);
    }
});

// 2. Add the 'boss' account ONLY if it doesn't already exist
if (!seenUsernames.has("boss")) {
    const bossUser = {
        username: "boss",
        password: "password123",
        role: "superadmin",
        name: "Head Admin",
        email: "admin@example.com"
    };
    uniqueUsers.push(bossUser);
    seenUsernames.add("boss");
    console.info("Superuser created: boss / password123");
}

// 3. Save the cleaned-up list back to localStorage
localStorage.setItem("users", JSON.stringify(uniqueUsers));

// 4. Handle auto-login for testing ONLY if a user isn't already logged in
if (!localStorage.getItem("loggedInUser")) {
    localStorage.setItem("loggedInUser", JSON.stringify({
        username: "boss", 
        role: "superadmin"
    }));
}
