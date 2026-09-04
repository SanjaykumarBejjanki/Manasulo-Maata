// ==========================================
// MANASULO MAATA — ADMIN DASHBOARD
// ==========================================


const SUPABASE_URL =
    "https://tlcxkoywciowcpfcxvaj.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_pfHA9_9H8mLybs4UHbh04Q_y2rgj2SK";



// ==========================================
// ELEMENTS
// ==========================================

const loginPage =
    document.getElementById("loginPage");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const submissionsContainer =
    document.getElementById("submissions");

const writerQueue =
    document.getElementById("writerQueue");

const writerQueueCount =
    document.getElementById("writerQueueCount");



// ==========================================
// MODAL ELEMENTS
// ==========================================

const submissionModal =
    document.getElementById("submissionModal");

const modalClose =
    document.getElementById("modalClose");

const saveQuoteBtn =
    document.getElementById("saveQuoteBtn");

const markPostedBtn =
    document.getElementById("markPostedBtn");

const modalOriginalQuote =
    document.getElementById("modalOriginalQuote");

const quoteSaveMessage =
    document.getElementById("quoteSaveMessage");



// ==========================================
// DATA
// ==========================================

let allSubmissions = [];

let currentFilter = "all";

let currentSubmissionId = null;



// ==========================================
// SUPABASE REQUEST
// ==========================================

async function supabaseRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${SUPABASE_URL}/rest/v1/${endpoint}`,
            {
                ...options,

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        options.headers?.Authorization ||
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );


    if (!response.ok) {

        let error;

        try {

            error =
                await response.json();

        } catch {

            error = {
                message:
                    "Unknown error"
            };
        }


        console.error(
            "Supabase error:",
            error
        );


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

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        loginError.textContent = "";


        const button =
            loginForm.querySelector(
                "button"
            );


        button.disabled = true;

        button.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                    {
                        method: "POST",

                        headers: {

                            "apikey":
                                SUPABASE_KEY,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                email,

                            password:
                                password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error_description ||
                    data.msg ||
                    "Invalid login details"
                );
            }


            // ==================================
            // SAVE SESSION
            // ==================================

            localStorage.setItem(
                "manasulo_admin_access_token",
                data.access_token
            );


            localStorage.setItem(
                "manasulo_admin_refresh_token",
                data.refresh_token
            );


            // ==================================
            // VERIFY ADMIN
            // ==================================

            await verifyAdmin(
                data.access_token
            );


            showDashboard();


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginError.textContent =
                error.message ||
                "Login failed. Please try again.";


        } finally {

            button.disabled = false;

            button.textContent =
                "Login 🖤";
        }

    }
);



// ==========================================
// VERIFY ADMIN
// ==========================================

async function verifyAdmin(
    accessToken
) {

    const response =
        await fetch(
            `${SUPABASE_URL}/rest/v1/admins?select=user_id`,
            {
                method: "GET",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to verify admin."
        );
    }


    const admins =
        await response.json();


    const userResponse =
        await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${accessToken}`
                }
            }
        );


    if (!userResponse.ok) {

        throw new Error(
            "Unable to verify user."
        );
    }


    const user =
        await userResponse.json();


    const isAdmin =
        admins.some(
            admin =>
                admin.user_id === user.id
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

    loginPage.style.display =
        "none";


    dashboard.style.display =
        "block";


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

        await verifyAdmin(
            token
        );


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

async function loadSubmissions() {

    submissionsContainer.innerHTML =
        `
        <div class="loading">
            Loading submissions...
        </div>
        `;


    try {

        const token =
            localStorage.getItem(
                "manasulo_admin_access_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired."
            );
        }


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/submissions?select=*&order=created_at.desc`,
                {
                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            let error;

            try {

                error =
                    await response.json();

            } catch {

                error = {
                    message:
                        "Could not load submissions."
                };
            }


            throw new Error(
                error.message ||
                "Could not load submissions."
            );
        }


        allSubmissions =
            await response.json();


        updateStats();

        renderWriterQueue();

        renderSubmissions();


    } catch (error) {

        console.error(
            "Load submissions error:",
            error
        );


        submissionsContainer.innerHTML =
            `
            <div class="empty">
                Unable to load submissions.
                <br><br>
                ${escapeHtml(error.message)}
            </div>
            `;


        writerQueue.innerHTML =
            `
            <div class="queue-empty">
                Unable to load writer queue.
            </div>
            `;

        writerQueueCount.textContent =
            "0";
    }
}



// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats() {

    const newCount =
        allSubmissions.filter(
            item =>
                !item.status ||
                item.status === "new"
        ).length;


    const selectedCount =
        allSubmissions.filter(
            item =>
                item.status === "selected"
        ).length;


    const rejectedCount =
        allSubmissions.filter(
            item =>
                item.status === "rejected"
        ).length;


    const postedCount =
        allSubmissions.filter(
            item =>
                item.status === "posted"
        ).length;


    document.getElementById(
        "newCount"
    ).textContent =
        newCount;


    document.getElementById(
        "selectedCount"
    ).textContent =
        selectedCount;


    document.getElementById(
        "rejectedCount"
    ).textContent =
        rejectedCount;


    document.getElementById(
        "postedCount"
    ).textContent =
        postedCount;
}



// ==========================================
// WRITER QUEUE
// ==========================================

function renderWriterQueue() {

    const selectedSubmissions =
        allSubmissions.filter(
            item =>
                (item.status || "new") ===
                "selected"
        );


    writerQueueCount.textContent =
        selectedSubmissions.length;


    if (
        selectedSubmissions.length ===
        0
    ) {

        writerQueue.innerHTML =
            `
            <div class="queue-empty">
                No selected submissions in the writer queue.
                <br>
                Select a follower maata below to send it here.
            </div>
            `;

        return;
    }


    writerQueue.innerHTML =
        selectedSubmissions
            .map(
                createWriterQueueItem
            )
            .join("");
}



// ==========================================
// CREATE WRITER QUEUE ITEM
// ==========================================

function createWriterQueueItem(
    item
) {

    const hasQuote =
        Boolean(
            item.original_quote &&
            item.original_quote.trim()
        );


    const date =
        item.created_at
            ? new Date(
                item.created_at
            ).toLocaleString("en-IN")
            : "Unknown";


    return `
        <article
            class="writer-queue-item"
        >

            <div class="queue-item-top">

                <div class="queue-item-id">
                    Submission #${item.id}
                </div>

                ${
                    hasQuote
                        ? `
                            <span class="queue-written">
                                ✓ Written
                            </span>
                        `
                        : `
                            <span class="queue-not-written">
                                Not Written
                            </span>
                        `
                }

            </div>


            <div class="queue-feeling">

                <strong>
                    Feeling:
                </strong>

                ${escapeHtml(
                    item.feeling ||
                    "—"
                )}

            </div>


            <div class="queue-message">

                ${escapeHtml(
                    item.message ||
                    "—"
                )}

            </div>


            <div class="queue-item-bottom">

                <span class="queue-date">
                    ${escapeHtml(date)}
                </span>


                <button
                    class="queue-open-btn"
                    type="button"
                    onclick="openSubmission(${item.id})"
                >
                    ${
                        hasQuote
                            ? "✏️ Edit Quote"
                            : "✍️ Open & Write"
                    }
                </button>

            </div>

        </article>
    `;
}



// ==========================================
// RENDER SUBMISSIONS
// ==========================================

function renderSubmissions() {

    let submissions =
        allSubmissions;


    if (
        currentFilter !==
        "all"
    ) {

        submissions =
            submissions.filter(
                item => {

                    const status =
                        item.status ||
                        "new";


                    return (
                        status ===
                        currentFilter
                    );
                }
            );
    }


    if (
        submissions.length ===
        0
    ) {

        submissionsContainer.innerHTML =
            `
            <div class="empty">
                No submissions found.
            </div>
            `;

        return;
    }


    submissionsContainer.innerHTML =
        submissions
            .map(
                createSubmissionCard
            )
            .join("");
}



// ==========================================
// CREATE SUBMISSION CARD
// ==========================================

function createSubmissionCard(
    item
) {

    const status =
        item.status ||
        "new";


    const date =
        item.created_at
            ? new Date(
                item.created_at
            ).toLocaleString("en-IN")
            : "Unknown";


    const hasQuote =
        Boolean(
            item.original_quote &&
            item.original_quote.trim()
        );


    return `
        <article
            class="submission-card"
        >

            <div
                class="submission-header"
            >

                <div>

                    <div
                        class="submission-id"
                    >
                        #${item.id}
                    </div>

                    <div
                        class="submission-date"
                    >
                        ${escapeHtml(date)}
                    </div>

                </div>


                <span
                    class="status status-${escapeHtml(status)}"
                >
                    ${escapeHtml(status)}
                </span>

            </div>



            <div class="field">

                <div class="field-label">
                    Situation
                </div>

                <div class="field-value">
                    ${escapeHtml(
                        item.situation ||
                        "—"
                    )}
                </div>

            </div>



            <div class="field">

                <div class="field-label">
                    Feeling
                </div>

                <div class="field-value">
                    ${escapeHtml(
                        item.feeling ||
                        "—"
                    )}
                </div>

            </div>



            <div class="field">

                <div class="field-label">
                    Message
                </div>

                <div
                    class="field-value message"
                >
                    ${escapeHtml(
                        item.message ||
                        "—"
                    )}
                </div>

            </div>



            ${
                hasQuote
                    ? `
                        <div class="field">

                            <div class="field-label">
                                Original Quote
                            </div>

                            <div class="field-value message">
                                ${escapeHtml(
                                    item.original_quote
                                )}
                            </div>

                        </div>
                    `
                    : ""
            }



            <div class="meta">

                <div class="meta-item">

                    Name:

                    <strong>
                        ${escapeHtml(
                            item.name ||
                            "Anonymous"
                        )}
                    </strong>

                </div>


                <div class="meta-item">

                    Instagram:

                    <strong>
                        ${escapeHtml(
                            item.instagram ||
                            "—"
                        )}
                    </strong>

                </div>


                <div class="meta-item">

                    Permission:

                    <strong>
                        ${
                            item.permission
                                ? "Yes"
                                : "No"
                        }
                    </strong>

                </div>

            </div>



            <div class="actions">


                <button
                    class="action-btn"
                    type="button"
                    onclick="openSubmission(${item.id})"
                >
                    📝 Open Submission
                </button>


                <button
                    class="action-btn action-selected"
                    type="button"
                    onclick="changeStatus(${item.id}, 'selected')"
                >
                    🟡 Selected
                </button>


                <button
                    class="action-btn action-rejected"
                    type="button"
                    onclick="changeStatus(${item.id}, 'rejected')"
                >
                    🔴 Rejected
                </button>


                <button
                    class="action-btn action-posted"
                    type="button"
                    onclick="changeStatus(${item.id}, 'posted')"
                >
                    🟢 Posted
                </button>


                <button
                    class="action-btn"
                    type="button"
                    onclick="changeStatus(${item.id}, 'new')"
                >
                    ↩ New
                </button>


            </div>

        </article>
    `;
}



// ==========================================
// OPEN SUBMISSION MODAL
// ==========================================

function openSubmission(
    id
) {

    const submission =
        allSubmissions.find(
            item =>
                item.id === id
        );


    if (!submission) {

        alert(
            "Submission not found."
        );

        return;
    }


    currentSubmissionId =
        id;


    const status =
        submission.status ||
        "new";


    const date =
        submission.created_at
            ? new Date(
                submission.created_at
            ).toLocaleString("en-IN")
            : "Unknown";



    // ======================================
    // BASIC DATA
    // ======================================

    document.getElementById(
        "modalTitle"
    ).textContent =
        `Submission #${submission.id}`;


    document.getElementById(
        "modalSituation"
    ).textContent =
        submission.situation ||
        "—";


    document.getElementById(
        "modalFeeling"
    ).textContent =
        submission.feeling ||
        "—";


    document.getElementById(
        "modalMessage"
    ).textContent =
        submission.message ||
        "—";


    document.getElementById(
        "modalName"
    ).textContent =
        submission.name ||
        "Anonymous";


    document.getElementById(
        "modalInstagram"
    ).textContent =
        submission.instagram ||
        "—";


    document.getElementById(
        "modalPermission"
    ).textContent =
        submission.permission
            ? "Yes"
            : "No";


    document.getElementById(
        "modalDate"
    ).textContent =
        date;



    // ======================================
    // STATUS
    // ======================================

    const modalStatus =
        document.getElementById(
            "modalStatus"
        );


    modalStatus.textContent =
        status;


    modalStatus.className =
        `status status-${escapeHtml(status)}`;



    // ======================================
    // WRITER QUOTE
    // ======================================

    modalOriginalQuote.value =
        submission.original_quote ||
        "";


    quoteSaveMessage.textContent =
        "";



    // ======================================
    // WRITER BUTTON STATE
    // ======================================

    updateWriterButtons(
        submission
    );



    // ======================================
    // SHOW MODAL
    // ======================================

    submissionModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";
}



// ==========================================
// UPDATE WRITER BUTTONS
// ==========================================

function updateWriterButtons(
    submission
) {

    const hasQuote =
        Boolean(
            submission.original_quote &&
            submission.original_quote.trim()
        );


    if (
        submission.status ===
        "posted"
    ) {

        markPostedBtn.textContent =
            "✓ Already Posted";


        markPostedBtn.disabled =
            true;


    } else {

        markPostedBtn.textContent =
            "🟢 Mark as Posted";


        markPostedBtn.disabled =
            false;
    }


    if (hasQuote) {

        saveQuoteBtn.textContent =
            "💾 Update Quote";

    } else {

        saveQuoteBtn.textContent =
            "💾 Save Quote";
    }
}



// ==========================================
// SAVE ORIGINAL QUOTE
// ==========================================

saveQuoteBtn.addEventListener(
    "click",
    async function () {

        if (
            currentSubmissionId ===
            null
        ) {

            quoteSaveMessage.textContent =
                "No submission selected.";

            return;
        }


        const originalQuote =
            modalOriginalQuote
                .value
                .trim();


        const token =
            localStorage.getItem(
                "manasulo_admin_access_token"
            );


        if (!token) {

            quoteSaveMessage.textContent =
                "Please login again.";

            return;
        }


        saveQuoteBtn.disabled =
            true;


        const oldButtonText =
            saveQuoteBtn.textContent;


        saveQuoteBtn.textContent =
            "Saving...";


        quoteSaveMessage.textContent =
            "";


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/submissions?id=eq.${currentSubmissionId}`,
                    {
                        method: "PATCH",

                        headers: {

                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"
                        },

                        body:
                            JSON.stringify({
                                original_quote:
                                    originalQuote
                            })
                    }
                );


            if (!response.ok) {

                let error;

                try {

                    error =
                        await response.json();

                } catch {

                    error = {
                        message:
                            "Quote save failed."
                    };
                }


                throw new Error(
                    error.message ||
                    error.hint ||
                    "Quote save failed."
                );
            }



            // ==================================
            // UPDATE LOCAL DATA
            // ==================================

            const submission =
                allSubmissions.find(
                    item =>
                        item.id ===
                        currentSubmissionId
                );


            if (submission) {

                submission.original_quote =
                    originalQuote;
            }



            // ==================================
            // SUCCESS
            // ==================================

            quoteSaveMessage.textContent =
                "Quote saved successfully 🖤";


            updateWriterButtons(
                submission
            );


            renderWriterQueue();

            renderSubmissions();


        } catch (error) {

            console.error(
                "Quote save error:",
                error
            );


            quoteSaveMessage.textContent =
                "Save failed: " +
                error.message;


        } finally {

            saveQuoteBtn.disabled =
                false;


            if (
                currentSubmissionId !==
                null
            ) {

                const current =
                    allSubmissions.find(
                        item =>
                            item.id ===
                            currentSubmissionId
                    );


                if (current) {

                    updateWriterButtons(
                        current
                    );

                } else {

                    saveQuoteBtn.textContent =
                        oldButtonText;
                }

            } else {

                saveQuoteBtn.textContent =
                    oldButtonText;
            }
        }

    }
);



// ==========================================
// MARK AS POSTED
// ==========================================

markPostedBtn.addEventListener(
    "click",
    async function () {

        if (
            currentSubmissionId ===
            null
        ) {

            quoteSaveMessage.textContent =
                "No submission selected.";

            return;
        }


        const submission =
            allSubmissions.find(
                item =>
                    item.id ===
                    currentSubmissionId
            );


        if (!submission) {

            quoteSaveMessage.textContent =
                "Submission not found.";

            return;
        }


        const quote =
            modalOriginalQuote
                .value
                .trim();


        if (!quote) {

            quoteSaveMessage.textContent =
                "Please write and save the quote before posting.";

            modalOriginalQuote.focus();

            return;
        }


        const token =
            localStorage.getItem(
                "manasulo_admin_access_token"
            );


        if (!token) {

            quoteSaveMessage.textContent =
                "Please login again.";

            return;
        }


        markPostedBtn.disabled =
            true;


        markPostedBtn.textContent =
            "Posting...";


        try {

            // ==================================
            // SAVE QUOTE FIRST
            // ==================================

            if (
                submission.original_quote !==
                quote
            ) {

                const quoteResponse =
                    await fetch(
                        `${SUPABASE_URL}/rest/v1/submissions?id=eq.${currentSubmissionId}`,
                        {
                            method: "PATCH",

                            headers: {

                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json",

                                "Prefer":
                                    "return=minimal"
                            },

                            body:
                                JSON.stringify({
                                    original_quote:
                                        quote
                                })
                        }
                    );


                if (!quoteResponse.ok) {

                    let error;

                    try {

                        error =
                            await quoteResponse.json();

                    } catch {

                        error = {
                            message:
                                "Quote save failed."
                        };
                    }


                    throw new Error(
                        error.message ||
                        error.hint ||
                        "Quote save failed."
                    );
                }


                submission.original_quote =
                    quote;
            }



            // ==================================
            // CHANGE STATUS TO POSTED
            // ==================================

            const statusResponse =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/submissions?id=eq.${currentSubmissionId}`,
                    {
                        method: "PATCH",

                        headers: {

                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"
                        },

                        body:
                            JSON.stringify({
                                status:
                                    "posted"
                            })
                    }
                );


            if (!statusResponse.ok) {

                let error;

                try {

                    error =
                        await statusResponse.json();

                } catch {

                    error = {
                        message:
                            "Status update failed."
                    };
                }


                throw new Error(
                    error.message ||
                    error.hint ||
                    "Could not mark as posted."
                );
            }



            // ==================================
            // UPDATE LOCAL DATA
            // ==================================

            submission.status =
                "posted";


            submission.original_quote =
                quote;



            // ==================================
            // UPDATE UI
            // ==================================

            updateStats();

            renderWriterQueue();

            renderSubmissions();


            quoteSaveMessage.textContent =
                "Posted successfully 🟢";


            updateWriterButtons(
                submission
            );


        } catch (error) {

            console.error(
                "Mark posted error:",
                error
            );


            quoteSaveMessage.textContent =
                "Post failed: " +
                error.message;


        } finally {

            if (
                submission.status !==
                "posted"
            ) {

                markPostedBtn.disabled =
                    false;

                markPostedBtn.textContent =
                    "🟢 Mark as Posted";
            }

        }

    }
);



// ==========================================
// CHANGE STATUS
// ==========================================

async function changeStatus(
    id,
    newStatus
) {

    const token =
        localStorage.getItem(
            "manasulo_admin_access_token"
        );


    if (!token) {

        alert(
            "Please login again."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/submissions?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=minimal"
                    },

                    body:
                        JSON.stringify({
                            status:
                                newStatus
                        })
                }
            );


        if (!response.ok) {

            let error;

            try {

                error =
                    await response.json();

            } catch {

                error = {
                    message:
                        "Status update failed."
                };
            }


            throw new Error(
                error.message ||
                error.hint ||
                "Status update failed."
            );
        }



        // ==================================
        // UPDATE LOCAL DATA
        // ==================================

        const submission =
            allSubmissions.find(
                item =>
                    item.id === id
            );


        if (submission) {

            submission.status =
                newStatus;
        }



        // ==================================
        // UPDATE UI
        // ==================================

        updateStats();

        renderWriterQueue();

        renderSubmissions();



        // If modal is currently open
        if (
            currentSubmissionId ===
            id
        ) {

            const currentSubmission =
                allSubmissions.find(
                    item =>
                        item.id === id
                );


            if (currentSubmission) {

                const modalStatus =
                    document.getElementById(
                        "modalStatus"
                    );


                modalStatus.textContent =
                    newStatus;


                modalStatus.className =
                    `status status-${escapeHtml(
                        newStatus
                    )}`;


                updateWriterButtons(
                    currentSubmission
                );
            }
        }


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Status update failed: " +
            error.message
        );
    }
}



// ==========================================
// CLOSE MODAL
// ==========================================

modalClose.addEventListener(
    "click",
    function () {

        closeModal();

    }
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


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            if (
                submissionModal.style.display ===
                "flex"
            ) {

                closeModal();

            }

        }

    }
);



function closeModal() {

    submissionModal.style.display =
        "none";


    document.body.style.overflow =
        "";


    currentSubmissionId =
        null;


    quoteSaveMessage.textContent =
        "";
}



// ==========================================
// FILTER BUTTONS
// ==========================================

document
    .querySelectorAll(".filter")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".filter"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    this.classList.add(
                        "active"
                    );


                    currentFilter =
                        this.dataset.status;


                    renderSubmissions();

                }
            );

        }
    );



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


        dashboard.style.display =
            "none";


        loginPage.style.display =
            "flex";


        loginForm.reset();


        currentSubmissionId =
            null;


        submissionModal.style.display =
            "none";


        document.body.style.overflow =
            "";

    }
);



// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}



// ==========================================
// START
// ==========================================

checkExistingSession();
