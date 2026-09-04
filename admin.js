// ==========================================
// MANASULO MAATA — ADMIN DASHBOARD
// ==========================================

const SUPABASE_URL = "https://tlcxkoywciowcpfcxvaj.supabase.co";

const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY_HERE";


// ==========================================
// ELEMENTS
// ==========================================

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

const submissionsContainer =
    document.getElementById("submissions");


// ==========================================
// SUPABASE REQUEST
// ==========================================

async function supabaseRequest(endpoint, options = {}) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${endpoint}`,
        {
            ...options,

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",

                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {

        let error;

        try {
            error = await response.json();
        } catch {
            error = {
                message: "Unknown error"
            };
        }

        console.error("Supabase error:", error);

        throw new Error(
            error.message ||
            error.hint ||
            "Supabase request failed"
        );
    }

    return response;
}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    loginError.textContent = "";

    const button =
        loginForm.querySelector("button");

    button.disabled = true;
    button.textContent = "Logging in...";

    try {

        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error_description ||
                data.msg ||
                "Invalid login details"
            );
        }

        // Save login session
        localStorage.setItem(
            "manasulo_admin_access_token",
            data.access_token
        );

        localStorage.setItem(
            "manasulo_admin_refresh_token",
            data.refresh_token
        );

        // Verify admin
        await verifyAdmin(data.access_token);

        showDashboard();

    } catch (error) {

        console.error(error);

        loginError.textContent =
            error.message ||
            "Login failed. Please try again.";

    } finally {

        button.disabled = false;
        button.textContent = "Login 🖤";
    }

});


// ==========================================
// VERIFY ADMIN
// ==========================================

async function verifyAdmin(accessToken) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/admins?select=user_id`,
        {
            method: "GET",

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error("Unable to verify admin.");
    }

    const admins = await response.json();

    const userResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/user`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (!userResponse.ok) {
        throw new Error("Unable to verify user.");
    }

    const user = await userResponse.json();

    const isAdmin = admins.some(
        admin => admin.user_id === user.id
    );

    if (!isAdmin) {

        localStorage.removeItem(
            "manasulo_admin_access_token"
        );

        localStorage.removeItem(
            "manasulo_admin_refresh_token"
        );

        throw new Error(
            "You are not authorized as an admin."
        );
    }

    return true;
}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    loginPage.style.display = "none";
    dashboard.style.display = "block";

    loadSubmissions();
}


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkExistingSession() {

    const token =
        localStorage.getItem(
            "manasulo_admin_access_token"
        );

    if (!token) {
        return;
    }

    try {

        await verifyAdmin(token);

        showDashboard();

    } catch (error) {

        console.log(
            "No valid admin session."
        );

        localStorage.removeItem(
            "manasulo_admin_access_token"
        );

        localStorage.removeItem(
            "manasulo_admin_refresh_token"
        );
    }
}


// ==========================================
// LOAD SUBMISSIONS
// ==========================================

let allSubmissions = [];
let currentFilter = "all";

async function loadSubmissions() {

    submissionsContainer.innerHTML =
        `<div class="loading">
            Loading submissions...
        </div>`;

    try {

        const token =
            localStorage.getItem(
                "manasulo_admin_access_token"
            );

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(
                error.message ||
                "Could not load submissions."
            );
        }

        allSubmissions =
            await response.json();

        updateStats();

        renderSubmissions();

    } catch (error) {

        console.error(error);

        submissionsContainer.innerHTML =
            `<div class="empty">
                Unable to load submissions.
                <br><br>
                ${escapeHtml(error.message)}
            </div>`;
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats() {

    const newCount =
        allSubmissions.filter(
            item => !item.status || item.status === "new"
        ).length;

    const selectedCount =
        allSubmissions.filter(
            item => item.status === "selected"
        ).length;

    const rejectedCount =
        allSubmissions.filter(
            item => item.status === "rejected"
        ).length;

    const postedCount =
        allSubmissions.filter(
            item => item.status === "posted"
        ).length;

    document.getElementById("newCount")
        .textContent = newCount;

    document.getElementById("selectedCount")
        .textContent = selectedCount;

    document.getElementById("rejectedCount")
        .textContent = rejectedCount;

    document.getElementById("postedCount")
        .textContent = postedCount;
}


// ==========================================
// RENDER SUBMISSIONS
// ==========================================

function renderSubmissions() {

    let submissions = allSubmissions;

    if (currentFilter !== "all") {

        submissions =
            submissions.filter(item => {

                const status =
                    item.status || "new";

                return status === currentFilter;
            });
    }

    if (submissions.length === 0) {

        submissionsContainer.innerHTML =
            `<div class="empty">
                No submissions found.
            </div>`;

        return;
    }

    submissionsContainer.innerHTML =
        submissions.map(createSubmissionCard).join("");
}


// ==========================================
// CREATE SUBMISSION CARD
// ==========================================

function createSubmissionCard(item) {

    const status =
        item.status || "new";

    const date =
        item.created_at
            ? new Date(item.created_at)
                .toLocaleString("en-IN")
            : "Unknown";

    return `
        <article class="submission-card">

            <div class="submission-header">

                <div>
                    <div class="submission-id">
                        #${item.id}
                    </div>

                    <div class="submission-date">
                        ${escapeHtml(date)}
                    </div>
                </div>

                <span class="status status-${escapeHtml(status)}">
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="field">

                <div class="field-label">
                    Situation
                </div>

                <div class="field-value">
                    ${escapeHtml(item.situation || "—")}
                </div>

            </div>


            <div class="field">

                <div class="field-label">
                    Feeling
                </div>

                <div class="field-value">
                    ${escapeHtml(item.feeling || "—")}
                </div>

            </div>


            <div class="field">

                <div class="field-label">
                    Message
                </div>

                <div class="field-value message">
                    ${escapeHtml(item.message || "—")}
                </div>

            </div>


            <div class="meta">

                <div class="meta-item">
                    Name:
                    <strong>
                        ${escapeHtml(item.name || "Anonymous")}
                    </strong>
                </div>

                <div class="meta-item">
                    Instagram:
                    <strong>
                        ${escapeHtml(item.instagram || "—")}
                    </strong>
                </div>

                <div class="meta-item">
                    Permission:
                    <strong>
                        ${item.permission ? "Yes" : "No"}
                    </strong>
                </div>

            </div>


            <div class="actions">

                <button
                    class="action-btn action-selected"
                    onclick="changeStatus(${item.id}, 'selected')">
                    🟡 Selected
                </button>

                <button
                    class="action-btn action-rejected"
                    onclick="changeStatus(${item.id}, 'rejected')">
                    🔴 Rejected
                </button>

                <button
                    class="action-btn action-posted"
                    onclick="changeStatus(${item.id}, 'posted')">
                    🟢 Posted
                </button>

                <button
                    class="action-btn"
                    onclick="changeStatus(${item.id}, 'new')">
                    ↩ New
                </button>

            </div>

        </article>
    `;
}


// ==========================================
// CHANGE STATUS
// ==========================================

async function changeStatus(id, newStatus) {

    const token =
        localStorage.getItem(
            "manasulo_admin_access_token"
        );

    if (!token) {
        alert("Please login again.");
        return;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/submissions?id=eq.${id}`,
            {
                method: "PATCH",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(
                error.message ||
                "Status update failed."
            );
        }

        // Update local data
        const submission =
            allSubmissions.find(
                item => item.id === id
            );

        if (submission) {
            submission.status = newStatus;
        }

        updateStats();
        renderSubmissions();

    } catch (error) {

        console.error(error);

        alert(
            "Status update failed: " +
            error.message
        );
    }
}


// ==========================================
// FILTER BUTTONS
// ==========================================

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                this.classList.add("active");

                currentFilter =
                    this.dataset.status;

                renderSubmissions();
            }
        );

    });


// ==========================================
// REFRESH
// ==========================================

refreshBtn.addEventListener(
    "click",
    function () {
        loadSubmissions();
    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "manasulo_admin_access_token"
        );

        localStorage.removeItem(
            "manasulo_admin_refresh_token"
        );

        dashboard.style.display = "none";
        loginPage.style.display = "flex";

        loginForm.reset();
    }
);


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START
// ==========================================

checkExistingSession();
