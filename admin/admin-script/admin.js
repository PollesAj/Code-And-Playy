
// Auth guard
(function(){
    const u = JSON.parse(localStorage.getItem("loggedInUser")||"null");
    if(!u||u.role!=="admin"){ alert("Access denied."); window.location.href="../../pages/landingpage.html"; }
})();

const GAME_DEFS = JSON.parse(localStorage.getItem("customGames") || JSON.stringify([
    {id:"java_beginner", title:"Fundamentals of Java",    desc:"Master the basics of Java.", url:"../game-pages/Questions.html", difficulty:"beginner"},
    {id:"cpp_beginner",  title:"Fundamentals of C++",     desc:"Reinforce fundamental C++ concepts.", url:"../game-pages/cgame.html", difficulty:"beginner"},
    {id:"html_beginner", title:"Fundamentals of HTML",    desc:"HTML structure and essential elements.", url:"../game-pages/ht.html", difficulty:"beginner"},
    {id:"css_beginner",  title:"Fundamentals of CSS",     desc:"CSS concepts and styling techniques.", url:"../game-pages/cs.html", difficulty:"beginner"},
]));

const DEFAULT_GAME_ORDER = ["java_beginner", "cpp_beginner", "html_beginner", "css_beginner"];

const getUsers = () => {
    try {
        const raw = localStorage.getItem("users");
        if(!raw) return [];
        const parsed = JSON.parse(raw);
        if(!Array.isArray(parsed)) return [];

        const now = Date.now();

        const normalized = parsed.map(u => {
            const username = typeof u.username === "string" && u.username.trim()
                ? u.username
                : (typeof u.email === "string" && u.email.includes("@")
                    ? u.email.split("@")[0]
                    : "");

            const rawEmail = typeof u.email === "string" ? u.email : "";
            const email = rawEmail
                .replace(/@codeandplay\.com$/i, "@google.con")
                .replace(/@google\.com$/i, "@google.con");

            const role = typeof u.role === "string" ? u.role : "user";

            const name = typeof u.name === "string" && u.name.trim()
                ? u.name
                : username || (email.includes("@") ? email.split("@")[0] : "");

            const password = typeof u.password === "string" ? u.password : "";

            // 👉 FIX: simulate registration date if missing
            let createdAt = u.createdAt;
            if(!createdAt){
                const daysAgo = Math.floor(Math.random() * 7); // 0–6 days ago
                createdAt = new Date(now - daysAgo * 86400000).toISOString();
            }

            return { username, email, role, name, password, createdAt };
        });

        localStorage.setItem("users", JSON.stringify(normalized));
        return normalized;

    } catch {
        return [];
    }
};
const saveUsers = u  => localStorage.setItem("users",JSON.stringify(u));
const getGames  = () => JSON.parse(localStorage.getItem("gameStatuses")||"{}");
const saveGames = g  => localStorage.setItem("gameStatuses",JSON.stringify(g));
const getAnns   = () => JSON.parse(localStorage.getItem("announcements")||"[]");
const saveAnns  = a  => localStorage.setItem("announcements",JSON.stringify(a));

function displayName(user){
    if(typeof user.name === "string" && user.name.trim()) return user.name;
    if(typeof user.username === "string" && user.username.trim()) return user.username;
    if(typeof user.email === "string" && user.email.includes("@")) return user.email.split("@")[0];
    return "—";
}

function roleBadge(r){ const m={admin:"badge-admin",guest:"badge-guest",user:"badge-user"}; return `<span class="badge ${m[r]||'badge-user'}">${r||"user"}</span>`; }

function toast(msg,type="success"){
    const t=document.getElementById("toast");
    t.textContent=msg; t.className="show "+type;
    clearTimeout(t._t); t._t=setTimeout(()=>t.className="",2800);
}

function showSection(name,el){
    document.querySelectorAll(".panel-section").forEach(s=>s.classList.remove("active"));
    document.querySelectorAll(".sidebar-item").forEach(s=>s.classList.remove("active"));
    document.getElementById("section-"+name).classList.add("active");
    el.classList.add("active");
    ({overview:renderOverview, users:renderUsers, games:renderGames, analytics:renderAnalytics, announcements:renderAnnouncements})[name]?.();
}

// OVERVIEW
function renderOverview(){
    const u=getUsers(), t=u.length, a=u.filter(x=>x.role==="admin").length, g=u.filter(x=>x.role==="guest").length;
    document.getElementById("statsGrid").innerHTML=`
        <div class="stat-card"><div class="stat-label">Total Accounts</div><div class="stat-value blue">${t}</div></div>
        <div class="stat-card"><div class="stat-label">Regular Users</div><div class="stat-value green">${t-a-g}</div></div>
        <div class="stat-card"><div class="stat-label">Guest Accounts</div><div class="stat-value orange">${g}</div></div>
        <div class="stat-card"><div class="stat-label">Admins</div><div class="stat-value red">${a}</div></div>`;
    const rec=[...u].reverse().slice(0,5);
    document.getElementById("recentTable").innerHTML=rec.length
        ?rec.map(x=>`<tr><td>${x.username}</td><td>${displayName(x)}</td><td>${x.email||"—"}</td><td>${roleBadge(x.role)}</td></tr>`).join("")
        :`<tr><td colspan="4" class="empty">No users yet.</td></tr>`;
}

// USERS
let _resetTarget="";
function renderUsers(){
    const q=(document.getElementById("userSearch")?.value||"").toLowerCase();
    const u=getUsers().filter(x=>x.username.toLowerCase().includes(q));
    document.getElementById("usersTable").innerHTML=u.length
        ?u.map(x=>`<tr>
            <td><strong>${x.username}</strong></td><td>${displayName(x)}</td><td>${x.email||"—"}</td><td>${roleBadge(x.role)}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
              ${x.role!=="admin"
                ?`<button class="btn-sm btn-warning" onclick="openResetModal('${x.username}')">Reset PW</button><button class="btn-sm btn-danger" onclick="deleteUser('${x.username}')">Delete</button>`
                :`<span style="color:var(--muted);font-size:12px;">protected</span>`}
            </td></tr>`).join("")
        :`<tr><td colspan="5" class="empty">No users found.</td></tr>`;
}

function deleteUser(un){
    if(!confirm(`Delete "${un}"? This cannot be undone.`)) return;
    saveUsers(getUsers().filter(u=>u.username!==un));
    const li=JSON.parse(localStorage.getItem("loggedInUser")||"null");
    if(li&&li.username===un) localStorage.removeItem("loggedInUser");
    toast(`User "${un}" deleted.`); renderUsers(); renderOverview();
}

function openResetModal(un){
    _resetTarget=un;
    document.getElementById("resetUsername").textContent=un;
    document.getElementById("newPassword").value="";
    document.getElementById("confirmNewPassword").value="";
    document.getElementById("resetError").textContent="";
    document.getElementById("resetModal").classList.add("open");
}

function confirmReset(){
    const np=document.getElementById("newPassword").value.trim();
    const cp=document.getElementById("confirmNewPassword").value.trim();
    const err=document.getElementById("resetError");
    if(!np){err.textContent="Password cannot be empty.";return;}
    if(np!==cp){err.textContent="Passwords do not match.";return;}
    if(np.length<6){err.textContent="Minimum 6 characters.";return;}
    const users=getUsers(); const i=users.findIndex(u=>u.username===_resetTarget);
    if(i===-1){err.textContent="User not found.";return;}
    users[i].password=np; saveUsers(users);
    closeModal("resetModal"); toast(`Password reset for "${_resetTarget}".`,"info");
}

// GAMES
function renderGames(){
    const s=getGames();
    const orderedGames = [...GAME_DEFS].sort((a,b) => {
        const ai = DEFAULT_GAME_ORDER.indexOf(a.id);
        const bi = DEFAULT_GAME_ORDER.indexOf(b.id);
        if(ai !== -1 && bi !== -1) return ai - bi;
        if(ai !== -1) return -1;
        if(bi !== -1) return 1;
        return 0;
    });

    document.getElementById("gamesManager").innerHTML=orderedGames.map(g=>{
        const on=s[g.id]!==false;
        return `<div class="game-manage-card"><h4>${g.title}</h4><p>${g.desc}</p>
            <div class="game-card-footer">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <span style="font-size:0.78rem; color:var(--muted);">ID: ${g.id}</span>
                    <span class="game-status ${on?"enabled":"disabled"}">● ${on?"Enabled":"Disabled"}</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <button class="btn-sm btn-danger" onclick="deleteGame('${g.id}')">Delete</button>
                    <label class="toggle"><input type="checkbox" ${on?"checked":""} onchange="toggleGame('${g.id}',this.checked)"><span class="slider"></span></label>
                </div>
            </div></div>`;
    }).join("");
}
function toggleGame(id,on){
    const s=getGames(); s[id]=on; saveGames(s);
    toast(`"${GAME_DEFS.find(g=>g.id===id).title}" ${on?"enabled":"disabled"}.`,on?"success":"error");
    renderGames();
}



function deleteGame(id){
    const game = GAME_DEFS.find(g=>g.id===id);
    if(!confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    GAME_DEFS.splice(GAME_DEFS.findIndex(g=>g.id===id),1);
    localStorage.setItem("customGames", JSON.stringify(GAME_DEFS));
    toast(`"${game.title}" deleted.`, "error");
    renderGames();
    // Also update analytics if needed, but renderAnalytics is called elsewhere
}

// ANALYTICS
const charts={};
function killChart(id){ if(charts[id]){charts[id].destroy();delete charts[id];} }

function renderAnalytics(){
    const u=getUsers(), t=u.length;
    const reg=u.filter(x=>!x.role||x.role==="user").length;
    const gst=u.filter(x=>x.role==="guest").length;
    const adm=u.filter(x=>x.role==="admin").length;
    const s=getGames();
    const en=GAME_DEFS.filter(g=>s[g.id]!==false).length;
    const dis=GAME_DEFS.length-en;

    document.getElementById("analyticsStats").innerHTML=`
        <div class="stat-card"><div class="stat-label">Total Accounts</div><div class="stat-value blue">${t}</div></div>
        <div class="stat-card"><div class="stat-label">Active Topics</div><div class="stat-value green">${en}</div></div>
        <div class="stat-card"><div class="stat-label">Announcements</div><div class="stat-value orange">${getAnns().length}</div></div>
        <div class="stat-card"><div class="stat-label">Disabled Topics</div><div class="stat-value red">${dis}</div></div>`;

    killChart("rolesChart");
    charts["rolesChart"]=new Chart(document.getElementById("rolesChart"),{
        type:"doughnut",
        data:{ labels:["Regular","Guest","Admin"], datasets:[{data:[reg,gst,adm],backgroundColor:["#238636","#d29922","#58a6ff"],borderColor:"#161b22",borderWidth:3}] },
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{color:"#8b949e",font:{size:12},padding:14}}}}
    });

    killChart("gamesChart");
    charts["gamesChart"]=new Chart(document.getElementById("gamesChart"),{
        type:"bar",
        data:{ labels:["Enabled","Disabled"], datasets:[{data:[en,dis],backgroundColor:["#238636","#da3633"],borderRadius:6,borderSkipped:false}] },
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
            scales:{x:{ticks:{color:"#8b949e"},grid:{color:"rgba(255,255,255,.06)"}},
                    y:{ticks:{color:"#8b949e",stepSize:1},grid:{color:"rgba(255,255,255,.06)"},beginAtZero:true}}}
    });

const labels = [];
const counts = Array(7).fill(0);

const today = new Date();

for(let i = 6; i >= 0; i--){
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    labels.push(
        i === 0 ? "Today" :
        i === 1 ? "Yesterday" :
        `${i}d ago`
    );
}

u.forEach(user => {
    if(!user.createdAt) return;
    const created = new Date(user.createdAt);
    const diffDays = Math.floor((today - created) / 86400000);

    if(diffDays >= 0 && diffDays < 7){
        counts[6 - diffDays]++;
    }
});
    killChart("timelineChart");
    charts["timelineChart"] = new Chart(
document.getElementById("timelineChart"),
{
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Registrations",
            data: counts,
            borderColor: "#58a6ff",
            backgroundColor: "rgba(88,166,255,.1)",
            fill: true,
            tension: .4,
            pointRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
}

// ANNOUNCEMENTS
function renderAnnouncements(){
    const anns=getAnns(), list=document.getElementById("annList");
    if(!anns.length){list.innerHTML=`<div class="empty">No announcements yet. Create one above.</div>`;return;}
    list.innerHTML=[...anns].reverse().map((a,ri)=>{
        const i=anns.length-1-ri;
        return `<div class="ann-card">
            <div class="ann-card-header">
                <div><span class="ann-title">${a.title}</span><span class="ann-type ${a.type}">${a.type}</span></div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span class="ann-meta">${a.date}</span>
                    <button class="btn-sm btn-danger" onclick="deleteAnn(${i})">Delete</button>
                </div>
            </div>
            <div class="ann-body">${a.body}</div>
        </div>`;
    }).join("");
}

function openAnnModal(){
    document.getElementById("annTitle").value="";
    document.getElementById("annBody").value="";
    document.getElementById("annType").value="info";
    document.getElementById("annError").textContent="";
    document.getElementById("annModal").classList.add("open");
}

function postAnnouncement(){
    const title=document.getElementById("annTitle").value.trim();
    const body=document.getElementById("annBody").value.trim();
    const type=document.getElementById("annType").value;
    const err=document.getElementById("annError");
    if(!title){err.textContent="Title is required.";return;}
    if(!body){err.textContent="Message is required.";return;}
    const anns=getAnns();
    anns.push({title,body,type,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})});
    saveAnns(anns); closeModal("annModal"); toast("Announcement posted!","info"); renderAnnouncements();
}

function deleteAnn(i){
    if(!confirm("Delete this announcement?")) return;
    const anns=getAnns(); anns.splice(i,1); saveAnns(anns);
    toast("Announcement deleted.","error"); renderAnnouncements();
}

function openAddGameModal(){
    document.getElementById("gameTitle").value="";
    document.getElementById("gameDesc").value="";
    document.getElementById("gameDifficulty").value="beginner";
    document.getElementById("gameUrl").value="";
    document.getElementById("gameError").textContent="";
    document.getElementById("addGameModal").classList.add("open");
}

function addNewGame(){
    const title=document.getElementById("gameTitle").value.trim();
    const desc=document.getElementById("gameDesc").value.trim();
    const difficulty=document.getElementById("gameDifficulty").value;
    const url=document.getElementById("gameUrl").value.trim();
    const err=document.getElementById("gameError");
    if(!title){err.textContent="Title is required.";return;}
    if(!desc){err.textContent="Description is required.";return;}
    if(!url){err.textContent="Game Page URL is required.";return;}
    // Generate a unique id
    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + difficulty;
    // Add to GAME_DEFS
    GAME_DEFS.push({id, title, desc, difficulty, url});
    // Save to localStorage
    localStorage.setItem("customGames", JSON.stringify(GAME_DEFS));
    closeModal("addGameModal"); toast("New game added!","success"); renderGames();
}

function closeModal(id){ document.getElementById(id).classList.remove("open"); }
document.querySelectorAll(".modal-bg").forEach(m=>m.addEventListener("click",function(e){if(e.target===this)this.classList.remove("open");}));

function logout(){ localStorage.removeItem("loggedInUser"); window.location.href="../../pages/landingpage.html"; }

renderOverview();