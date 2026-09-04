// ==========================================
// MANASULO MAATA — ADMIN DASHBOARD
// ==========================================


const SUPABASE_URL =
    "https://tlcxkoywciowcpfcxvaj.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_pfHA9_9H8mLybs4UHbh04Q_y2rgj2SK";


/* =========================================
   DOM
========================================= */

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const submissionsContainer =
    document.getElementById("submissionsContainer");

const emptyState =
    document.getElementById("emptyState");

const writerQueue =
    document.getElementById("writerQueue");

const writerQueueCount =
    document.getElementById("writerQueueCount");

const readyQueue =
    document.getElementById("readyQueue");


/* Stats */

const newCount =
    document.getElementById("newCount");

const selectedCount =
    document.getElementById("selectedCount");

const writingCount =
    document.getElementById("writingCount");

const writtenCount =
    document.getElementById("writtenCount");

const instagramReadyCount =
    document.getElementById("instagramReadyCount");

const postedCount =
    document.getElementById("postedCount");

const rejectedCount =
    document.getElementById("rejectedCount");


/* Modal */

const submissionModal =
    document.getElementById("submissionModal");

const modalClose =
    document.getElementById("modalClose");

const modalTitle =
    document.getElementById("modalTitle");

const modalStatus =
    document.getElementById("modalStatus");

const modalSituation =
    document.getElementById("modalSituation");

const modalFeeling =
    document.getElementById("modalFeeling");

const modalMessage =
    document.getElementById("modalMessage");

const modalOriginalQuote =
    document.getElementById("modalOriginalQuote");

const modalName =
    document.getElementById("modalName");

const modalInstagram =
    document.getElementById("modalInstagram");

const modalPermission =
    document.getElementById("modalPermission");

const modalDate =
    document.getElementById("modalDate");

const startWritingBtn =
    document.getElementById("startWritingBtn");

const saveQuoteBtn =
    document.getElementById("saveQuoteBtn");

const markPostReadyBtn =
    document.getElementById("markPostReadyBtn");

const markPostedBtn =
    document.getElementById("markPostedBtn");

const quoteSaveMessage =
    document.getElementById("quoteSaveMessage");


/* =========================================
   STATE
========================================= */

let allSubmissions = [];

let currentFilter = "all";

let currentSubmissionId = null;


/* =========================================
   SUPABASE REQUEST
========================================= */

async function supabaseRequest(
    endpoint,
    options = {},
    accessToken = null
) {

    const headers = {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        ...options.headers
    };

    if (accessToken) {
        headers.Authorization =
            `Bearer ${accessToken}`;
    }

    const response =
        await fetch(
            `${SUPABASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    const text =
        await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {

        const errorMessage =
            data?.message ||
            data?.error_description ||
            data?.hint ||
            text ||
            "Supabase request failed.";

        throw new Error(errorMessage);
    }

    return data;
}


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        if (!email || !password) {
            return;
        }

        loginBtn.disabled = true;

        loginBtn.textContent =
            "Logging in...";

        loginMessage.textContent = "";

        try {

            const data =
                await supabaseRequest(
                    "/auth/v1/token?grant_type=password",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

            if (!data?.access_token) {
                throw new Error(
                    "Login failed."
                );
            }

            const isAdmin =
                await verifyAdmin(
                    data.access_token
                );

            if (!isAdmin) {

                throw new Error(
                    "This account is not an admin."
                );
            }

            localStorage.setItem(
                "mm_access_token",
                data.access_token
            );

            if (data.refresh_token) {

                localStorage.setItem(
                    "mm_refresh_token",
                    data.refresh_token
                );
            }

            showDashboard();

        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                error.message ||
                "Login failed.";

        } finally {

            loginBtn.disabled = false;

            loginBtn.textContent =
                "Login";
        }
    }
);


/* =========================================
   VERIFY ADMIN
========================================= */

async function verifyAdmin(accessToken) {

    const user =
        await supabaseRequest(
            "/auth/v1/user",
            {
                method: "GET"
            },
            accessToken
        );

    if (!user?.id) {
        return false;
    }

    const admins =
        await supabaseRequest(
            "/rest/v1/admins?select=user_id",
            {
                method: "GET"
            },
            accessToken
        );

    return admins.some(
        admin =>
            admin.user_id === user.id
    );
}


/* =========================================
   SESSION CHECK
========================================= */

async function checkExistingSession() {

    const token =
        localStorage.getItem(
            "mm_access_token"
        );

    if (!token) {
        return;
    }

    try {

        const isAdmin =
            await verifyAdmin(token);

        if (isAdmin) {

            showDashboard();

        } else {

            clearSession();
        }

    } catch (error) {

        console.error(error);

        clearSession();
    }
}


/* =========================================
   SHOW DASHBOARD
========================================= */

async function showDashboard() {

    loginSection.classList.add(
        "hidden"
    );

    dashboardSection.classList.remove(
        "hidden"
    );

    await loadSubmissions();
}


/* =========================================
   LOAD SUBMISSIONS
========================================= */

async function loadSubmissions() {

    const token =
        localStorage.getItem(
            "mm_access_token"
        );

    if (!token) {
        return;
    }

    submissionsContainer.innerHTML =
        `
        <div class="empty-state">
            Loading submissions...
        </div>
        `;

    try {

        allSubmissions =
            await supabaseRequest(
                "/rest/v1/submissions?select=*&order=created_at.desc",
                {
                    method: "GET"
                },
                token
            );

        updateStats();

        renderWriterQueue();

        renderReadyQueue();

        renderSubmissions();

    } catch (error) {

        console.error(error);

        submissionsContainer.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load submissions</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
            `;
    }
}


/* =========================================
   STATS
========================================= */

function updateStats() {

    const count =
        status =>
            allSubmissions.filter(
                item =>
                    item.status === status
            ).length;

    newCount.textContent =
        count("new");

    selectedCount.textContent =
        count("selected");

    writingCount.textContent =
        count("writing");

    writtenCount.textContent =
        count("written");

    instagramReadyCount.textContent =
        count("instagram_ready");

    postedCount.textContent =
        count("posted");

    rejectedCount.textContent =
        count("rejected");
}


/* =========================================
   WRITER QUEUE
========================================= */

function renderWriterQueue() {

    const queue =
        allSubmissions.filter(
            item =>
                [
                    "selected",
                    "writing",
                    "written"
                ].includes(item.status)
        );

    writerQueueCount.textContent =
        queue.length;

    if (!queue.length) {

        writerQueue.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">✍️</div>
                <h3>Writer queue is empty</h3>
                <p>Select a submission to start writing.</p>
            </div>
            `;

        return;
    }

    writerQueue.innerHTML =
        queue
            .map(createWriterQueueItem)
            .join("");
}


/* =========================================
   WRITER QUEUE ITEM
========================================= */

function createWriterQueueItem(item) {

    const quote =
        item.original_quote?.trim();

    const statusLabel =
        getStatusLabel(item.status);

    return `
        <div class="writer-queue-item">

            <div class="queue-main">

                <div class="queue-top">

                    <span class="status-badge status-${item.status}">
                        ${statusLabel}
                    </span>

                    <span class="queue-id">
                        #${item.id}
                    </span>

                    <span class="queue-feeling">
                        ${escapeHtml(item.feeling || "")}
                    </span>

                </div>

                <div class="queue-preview">
                    ${escapeHtml(item.message || "")}
                </div>

                ${
                    quote
                        ? `
                        <div class="queue-quote">
                            ${escapeHtml(quote)}
                        </div>
                        `
                        : ""
                }

            </div>


            <div class="queue-actions">

                <button
                    class="action-btn write-btn"
                    onclick="openSubmission(${item.id})"
                >
                    ${
                        quote
                            ? "✏️ Edit Quote"
                            : "✍️ Open & Write"
                    }
                </button>

            </div>

        </div>
    `;
}


/* =========================================
   READY QUEUE
========================================= */

function renderReadyQueue() {

    const ready =
        allSubmissions.filter(
            item =>
                item.status ===
                "instagram_ready"
        );

    if (!ready.length) {

        readyQueue.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">📸</div>
                <h3>No post-ready quotes</h3>
                <p>Written quotes will appear here.</p>
            </div>
            `;

        return;
    }

    readyQueue.innerHTML =
        ready
            .map(createReadyQueueItem)
            .join("");
}


/* =========================================
   READY QUEUE ITEM
========================================= */

function createReadyQueueItem(item) {

    return `
        <div class="ready-queue-item">

            <div class="queue-main">

                <div class="queue-top">

                    <span class="status-badge status-instagram_ready">
                        📸 Instagram Post Ready
                    </span>

                    <span class="queue-id">
                        #${item.id}
                    </span>

                </div>

                <div class="queue-quote">
                    ${escapeHtml(item.original_quote || "")}
                </div>

            </div>


            <div class="queue-actions">

                <button
                    class="action-btn ready-btn"
                    onclick="openSubmission(${item.id})"
                >
                    Open
                </button>

            </div>

        </div>
    `;
}


/* =========================================
   RENDER SUBMISSIONS
========================================= */

function renderSubmissions() {

    let filtered =
        allSubmissions;

    if (currentFilter !== "all") {

        filtered =
            allSubmissions.filter(
                item =>
                    item.status ===
                    currentFilter
            );
    }

    if (!filtered.length) {

        submissionsContainer.innerHTML =
            "";

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }

    emptyState.classList.add(
        "hidden"
    );

    submissionsContainer.innerHTML =
        filtered
            .map(createSubmissionCard)
            .join("");
}


/* =========================================
   SUBMISSION CARD
========================================= */

function createSubmissionCard(item) {

    const quote =
        item.original_quote?.trim();

    return `
        <article class="submission-card">

            <div class="submission-card-top">

                <div>

                    <span class="submission-id">
                        Submission #${item.id}
                    </span>

                    <h3>
                        ${escapeHtml(item.feeling || "No feeling")}
                    </h3>

                </div>

                <span class="status-badge status-${item.status}">
                    ${getStatusLabel(item.status)}
                </span>

            </div>


            <div class="submission-message-preview">
                ${escapeHtml(item.message || "")}
            </div>


            ${
                quote
                    ? `
                    <div class="submission-quote-preview">
                        ${escapeHtml(quote)}
                    </div>
                    `
                    : ""
            }


            <div class="submission-card-actions">

                <button
                    class="action-btn open-btn"
                    onclick="openSubmission(${item.id})"
                >
                    Open
                </button>

                ${
                    item.status === "new"
                        ? `
                        <button
                            class="action-btn select-btn"
                            onclick="changeStatus(${item.id}, 'selected')"
                        >
                            🟡 Select
                        </button>

                        <button
                            class="action-btn reject-btn"
                            onclick="changeStatus(${item.id}, 'rejected')"
                        >
                            Reject
                        </button>
                        `
                        : ""
                }


                ${
                    item.status === "selected"
                        ? `
                        <button
                            class="action-btn write-btn"
                            onclick="changeStatus(${item.id}, 'writing')"
                        >
                            ✍️ Start Writing
                        </button>
                        `
                        : ""
                }


                ${
                    item.status === "writing" && quote
                        ? `
                        <button
                            class="action-btn write-btn"
                            onclick="openSubmission(${item.id})"
                        >
                            ✏️ Edit Quote
                        </button>
                        `
                        : ""
                }


                ${
                    item.status === "written"
                        ? `
                        <button
                            class="action-btn ready-btn"
                            onclick="openSubmission(${item.id})"
                        >
                            📸 Prepare Post
                        </button>
                        `
                        : ""
                }


                ${
                    item.status === "instagram_ready"
                        ? `
                        <button
                            class="action-btn posted-btn"
                            onclick="changeStatus(${item.id}, 'posted')"
                        >
                            ✅ Mark Posted
                        </button>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================================
   OPEN SUBMISSION
========================================= */

window.openSubmission =
    function (id) {

        const item =
            allSubmissions.find(
                submission =>
                    Number(submission.id) ===
                    Number(id)
            );

        if (!item) {
            return;
        }

        currentSubmissionId =
            item.id;

        modalTitle.textContent =
            `Submission #${item.id}`;

        modalStatus.textContent =
            getStatusLabel(item.status);

        modalStatus.className =
            `status-badge status-${item.status}`;

        modalSituation.textContent =
            item.situation || "—";

        modalFeeling.textContent =
            item.feeling || "—";

        modalMessage.textContent =
            item.message || "—";

        modalOriginalQuote.value =
            item.original_quote || "";

        modalName.textContent =
            item.name || "Anonymous";

        modalInstagram.textContent =
            item.instagram || "—";

        modalPermission.textContent =
            item.permission
                ? "Allowed"
                : "Not allowed";

        modalDate.textContent =
            formatDate(item.created_at);

        quoteSaveMessage.textContent =
            "";

        updateWriterButtons(item);

        submissionModal.classList.remove(
            "hidden"
        );
    };


/* =========================================
   WRITER BUTTON STATE
========================================= */

function updateWriterButtons(item) {

    startWritingBtn.style.display =
        "none";

    saveQuoteBtn.style.display =
        "none";

    markPostReadyBtn.style.display =
        "none";

    markPostedBtn.style.display =
        "none";


    if (item.status === "selected") {

        startWritingBtn.style.display =
            "inline-block";

    }


    if (
        item.status === "writing" ||
        item.status === "written"
    ) {

        saveQuoteBtn.style.display =
            "inline-block";
    }


    if (item.status === "written") {

        markPostReadyBtn.style.display =
            "inline-block";
    }


    if (item.status === "instagram_ready") {

        markPostReadyBtn.style.display =
            "none";

        markPostedBtn.style.display =
            "inline-block";
    }


    if (item.status === "posted") {

        startWritingBtn.style.display =
            "none";

        saveQuoteBtn.style.display =
            "none";

        markPostReadyBtn.style.display =
            "none";

        markPostedBtn.style.display =
            "none";
    }
}


/* =========================================
   START WRITING
========================================= */

startWritingBtn.addEventListener(
    "click",
    async function () {

        if (!currentSubmissionId) {
            return;
        }

        await changeStatus(
            currentSubmissionId,
            "writing",
            true
        );
    }
);


/* =========================================
   SAVE QUOTE
========================================= */

saveQuoteBtn.addEventListener(
    "click",
    async function () {

        if (!currentSubmissionId) {
            return;
        }

        const quote =
            modalOriginalQuote.value.trim();

        if (!quote) {

            quoteSaveMessage.textContent =
                "Please write a quote first.";

            quoteSaveMessage.style.color =
                "#df7070";

            return;
        }

        const token =
            localStorage.getItem(
                "mm_access_token"
            );

        saveQuoteBtn.disabled =
            true;

        saveQuoteBtn.textContent =
            "Saving...";

        try {

            await supabaseRequest(
                `/rest/v1/submissions?id=eq.${currentSubmissionId}`,
                {
                    method: "PATCH",

                    headers: {
                        Prefer: "return=minimal"
                    },

                    body: JSON.stringify({
                        original_quote: quote,
                        status: "written"
                    })
                },
                token
            );

            updateLocalSubmission(
                currentSubmissionId,
                {
                    original_quote: quote,
                    status: "written"
                }
            );

            quoteSaveMessage.textContent =
                "✓ Quote saved — Written";

            quoteSaveMessage.style.color =
                "#69c58a";

            updateStats();

            renderWriterQueue();

            renderReadyQueue();

            renderSubmissions();

            const updated =
                getCurrentSubmission();

            if (updated) {
                updateWriterButtons(updated);
            }

        } catch (error) {

            console.error(error);

            quoteSaveMessage.textContent =
                error.message;

            quoteSaveMessage.style.color =
                "#df7070";

        } finally {

            saveQuoteBtn.disabled =
                false;

            saveQuoteBtn.textContent =
                "💾 Save Quote";
        }
    }
);


/* =========================================
   MARK POST READY
========================================= */

markPostReadyBtn.addEventListener(
    "click",
    async function () {

        if (!currentSubmissionId) {
            return;
        }

        const quote =
            modalOriginalQuote.value.trim();

        if (!quote) {

            quoteSaveMessage.textContent =
                "Save the quote before marking it Post Ready.";

            quoteSaveMessage.style.color =
                "#df7070";

            return;
        }

        await changeStatus(
            currentSubmissionId,
            "instagram_ready",
            true
        );
    }
);


/* =========================================
   MARK POSTED
========================================= */

markPostedBtn.addEventListener(
    "click",
    async function () {

        if (!currentSubmissionId) {
            return;
        }

        await changeStatus(
            currentSubmissionId,
            "posted",
            true
        );
    }
);


/* =========================================
   CHANGE STATUS
========================================= */

window.changeStatus =
    async function (
        id,
        newStatus,
        keepModalOpen = false
    ) {

        const token =
            localStorage.getItem(
                "mm_access_token"
            );

        if (!token) {
            return;
        }

        try {

            await supabaseRequest(
                `/rest/v1/submissions?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {
                        Prefer: "return=minimal"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                },
                token
            );


            updateLocalSubmission(
                id,
                {
                    status: newStatus
                }
            );


            updateStats();

            renderWriterQueue();

            renderReadyQueue();

            renderSubmissions();


            if (
                keepModalOpen &&
                Number(currentSubmissionId) ===
                Number(id)
            ) {

                const updated =
                    getCurrentSubmission();

                if (updated) {

                    modalStatus.textContent =
                        getStatusLabel(
                            updated.status
                        );

                    modalStatus.className =
                        `status-badge status-${updated.status}`;

                    updateWriterButtons(
                        updated
                    );

                    if (
                        newStatus ===
                        "writing"
                    ) {

                        quoteSaveMessage.textContent =
                            "✍️ Writing mode started.";

                        quoteSaveMessage.style.color =
                            "#6fa8dc";
                    }

                    if (
                        newStatus ===
                        "instagram_ready"
                    ) {

                        quoteSaveMessage.textContent =
                            "📸 Instagram Post Ready.";

                        quoteSaveMessage.style.color =
                            "#c9a86a";
                    }

                    if (
                        newStatus ===
                        "posted"
                    ) {

                        quoteSaveMessage.textContent =
                            "✓ Marked as Posted.";

                        quoteSaveMessage.style.color =
                            "#69c58a";
                    }
                }

            } else {

                closeModal();
            }

        } catch (error) {

            console.error(error);

            if (keepModalOpen) {

                quoteSaveMessage.textContent =
                    error.message;

                quoteSaveMessage.style.color =
                    "#df7070";

            } else {

                alert(
                    error.message ||
                    "Status update failed."
                );
            }
        }
    };


/* =========================================
   UPDATE LOCAL DATA
========================================= */

function updateLocalSubmission(
    id,
    updates
) {

    const index =
        allSubmissions.findIndex(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (index === -1) {
        return;
    }

    allSubmissions[index] = {
        ...allSubmissions[index],
        ...updates
    };
}


/* =========================================
   CURRENT SUBMISSION
========================================= */

function getCurrentSubmission() {

    return allSubmissions.find(
        item =>
            Number(item.id) ===
            Number(currentSubmissionId)
    );
}


/* =========================================
   FILTERS
========================================= */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                this.classList.add(
                    "active"
                );

                currentFilter =
                    this.dataset.filter;

                renderSubmissions();
            }
        );

    });


/* =========================================
   MODAL CLOSE
========================================= */

modalClose.addEventListener(
    "click",
    closeModal
);

submissionModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            submissionModal
        ) {
            closeModal();
        }
    }
);


function closeModal() {

    submissionModal.classList.add(
        "hidden"
    );

    currentSubmissionId =
        null;
}


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeModal();
        }
    }
);


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    async function () {

        refreshBtn.disabled =
            true;

        refreshBtn.textContent =
            "Refreshing...";

        await loadSubmissions();

        refreshBtn.disabled =
            false;

        refreshBtn.textContent =
            "↻ Refresh";
    }
);


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
    "click",
    function () {

        clearSession();

        location.reload();
    }
);


/* =========================================
   CLEAR SESSION
========================================= */

function clearSession() {

    localStorage.removeItem(
        "mm_access_token"
    );

    localStorage.removeItem(
        "mm_refresh_token"
    );
}


/* =========================================
   STATUS LABEL
========================================= */

function getStatusLabel(status) {

    const labels = {

        new:
            "🆕 New",

        selected:
            "🟡 Selected",

        writing:
            "✍️ Writing",

        written:
            "✓ Written",

        instagram_ready:
            "📸 Instagram Post Ready",

        rejected:
            "✕ Rejected",

        posted:
            "🟢 Posted"
    };

    return labels[status] ||
        status;
}


/* =========================================
   DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return "—";
    }

    try {

        return new Date(date)
            .toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

    } catch {

        return date;
    }
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   START
========================================= */

checkExistingSession();
