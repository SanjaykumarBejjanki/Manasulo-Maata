console.log("MANASULO MAATA SCRIPT LOADED 🖤");

const SUPABASE_URL = "https://tlcxkoywciowcpfcxvaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_pfHA9_9H8mLybs4UHbh04Q_y2rgj2SK";

const form = document.getElementById("maataForm");
const successMessage = document.getElementById("successMessage");
const sendAnother = document.getElementById("sendAnother");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("FORM SUBMITTED 🖤");

    const situation = document.getElementById("situation").value.trim();
    const feeling = document.getElementById("feeling").value.trim();
    const message = document.getElementById("message").value.trim();
    const name = document.getElementById("name").value.trim();
    const instagram = document.getElementById("instagram").value.trim();
    const permission = document.getElementById("permission").checked;

    if (!situation || !feeling || !message || !permission) {
        alert("Please complete all required fields. 🖤");
        return;
    }

    // Get the actual submit button
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = "<span>Sending...</span><span>⏳</span>";

    try {

        console.log("Sending data to Supabase...");

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/submissions`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({
                    situation: situation,
                    feeling: feeling,
                    message: message,
                    name: name || null,
                    instagram: instagram || null,
                    permission: permission
                })
            }
        );

        console.log("Supabase status:", response.status);

        if (!response.ok) {

            const errorText = await response.text();

            console.error("SUPABASE ERROR:", errorText);

            throw new Error(errorText);
        }

        // =========================
        // SUCCESS
        // =========================

        console.log("SUBMISSION SUCCESS 🖤");

        form.style.display = "none";
        successMessage.style.display = "block";

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {

        console.error("SUBMISSION ERROR:", error);

        alert(
            "Something went wrong. 🖤\n\n" +
            "Check Console for details."
        );

    } finally {

        submitButton.disabled = false;

        submitButton.innerHTML =
            "<span>Send My Maata</span><span>🖤</span>";
    }
});


sendAnother.addEventListener("click", function () {

    form.reset();

    successMessage.style.display = "none";
    form.style.display = "block";

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});