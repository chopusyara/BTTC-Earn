/* =========================================
   BTTC EARN — TELEGRAM MINI APP
========================================= */

const TELEGRAM_USER_FUNCTION =
    "https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/telegram-user";

const START_EARNING_FUNCTION =
    "https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/start-earning";

const CLAIM_EARNING_FUNCTION =
    "https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/claim-earning";


const tg = window.Telegram?.WebApp;


/* =========================================
   TELEGRAM INITIALIZATION
========================================= */

if (tg) {

    tg.ready();
    tg.expand();

    try {

        tg.setHeaderColor("#050511");
        tg.setBackgroundColor("#050511");

    } catch (error) {

        console.log(
            "Telegram color settings unavailable."
        );

    }

}


/* =========================================
   ELEMENTS
========================================= */

const userName =
    document.getElementById("userName");

const telegramId =
    document.getElementById("telegramId");

const copyButton =
    document.getElementById("copyId");

const startButton =
    document.getElementById("startEarning");

const usdtBalance =
    document.getElementById("usdtBalance");

const bttcBalance =
    document.getElementById("bttcBalance");


/* =========================================
   EARNING SETTINGS
========================================= */

const EARNING_DURATION_SECONDS =
    15 * 60;

const EARNING_REWARD =
    1000;

const EARNING_STORAGE_KEY =
    "bttc_earning_session";


let currentUser = null;

let earningTimer = null;

let earningSession = null;


/* =========================================
   HAPTIC
========================================= */

function mediumHaptic() {

    if (
        tg &&
        tg.HapticFeedback
    ) {

        tg.HapticFeedback
            .impactOccurred("medium");

    }

}


function successHaptic() {

    if (
        tg &&
        tg.HapticFeedback
    ) {

        tg.HapticFeedback
            .notificationOccurred("success");

    }

}


/* =========================================
   TELEGRAM USER
   Securely verified by Supabase
========================================= */

async function loadTelegramUser() {

    if (!tg) {

        console.log(
            "Not running inside Telegram."
        );

        return null;

    }


    const initData =
        tg.initData;


    if (!initData) {

        console.log(
            "Telegram initData not available."
        );

        return null;

    }


    try {

        const response =
            await fetch(
                TELEGRAM_USER_FUNCTION,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        initData:
                            initData
                    })
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "Backend error:",
                result
            );

            return null;

        }


        const user =
            result.user;


        /* =====================================
           DISPLAY VERIFIED USER
        ===================================== */

        if (
            userName &&
            user.first_name
        ) {

            userName.textContent =
                user.first_name;

        }


        if (
            telegramId &&
            user.telegram_id
        ) {

            telegramId.textContent =
                user.telegram_id;

        }


        /* =====================================
           DISPLAY BALANCES
        ===================================== */

        if (
            usdtBalance &&
            user.balance_usdt !== undefined
        ) {

            usdtBalance.textContent =
                Number(
                    user.balance_usdt
                ).toFixed(2);

        }


        if (
            bttcBalance &&
            user.balance_bttc !== undefined
        ) {

            bttcBalance.textContent =
                Number(
                    user.balance_bttc
                ).toLocaleString(
                    "en-IN"
                );

        }


        console.log(
            "Verified BTTC user:",
            user
        );


        return user;


    } catch (error) {

        console.error(
            "Backend connection error:",
            error
        );

        return null;

    }

}


/* =========================================
   UPDATE BTTC BALANCE
========================================= */

function updateBTTCBalance(
    balance
) {

    if (!bttcBalance) {
        return;
    }

    bttcBalance.textContent =
        Number(balance)
            .toLocaleString("en-IN");

}


/* =========================================
   SAVE EARNING SESSION LOCALLY
========================================= */

function saveEarningSession(
    session
) {

    try {

        localStorage.setItem(
            EARNING_STORAGE_KEY,
            JSON.stringify(session)
        );

    } catch (error) {

        console.error(
            "Unable to save earning session:",
            error
        );

    }

}


/* =========================================
   LOAD SAVED EARNING SESSION
========================================= */

function loadSavedEarningSession() {

    try {

        const saved =
            localStorage.getItem(
                EARNING_STORAGE_KEY
            );


        if (!saved) {
            return null;
        }


        return JSON.parse(saved);


    } catch (error) {

        console.error(
            "Unable to load earning session:",
            error
        );

        return null;

    }

}


/* =========================================
   CLEAR SAVED SESSION
========================================= */

function clearEarningSession() {

    try {

        localStorage.removeItem(
            EARNING_STORAGE_KEY
        );

    } catch (error) {

        console.error(
            "Unable to clear earning session:",
            error
        );

    }

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(
    totalSeconds
) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;


    return (
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0")
    );

}


/* =========================================
   SET START BUTTON TEXT
========================================= */

function setStartButtonText(
    text
) {

    if (!startButton) {
        return;
    }

    startButton.textContent =
        text;

}


/* =========================================
   START COUNTDOWN
========================================= */

function startCountdown(
    session
) {

    if (!startButton) {
        return;
    }


    if (earningTimer) {

        clearInterval(
            earningTimer
        );

        earningTimer = null;

    }


    earningSession =
        session;


    saveEarningSession(
        session
    );


    function updateTimer() {

        const now =
            Date.now();

        const endTime =
            new Date(
                session.ends_at
            ).getTime();


        const remainingSeconds =
            Math.max(
                0,
                Math.ceil(
                    (endTime - now) /
                    1000
                )
            );


        if (
            remainingSeconds <= 0
        ) {

            clearInterval(
                earningTimer
            );

            earningTimer =
                null;


            setStartButtonText(
                "CLAIM 1,000 BTTC"
            );


            startButton.disabled =
                false;


            startButton.classList.add(
                "claim-ready"
            );


            console.log(
                "Earning session completed."
            );


            return;

        }


        setStartButtonText(
            formatTime(
                remainingSeconds
            )
        );


        startButton.disabled =
            true;


        startButton.classList.remove(
            "claim-ready"
        );

    }


    updateTimer();


    earningTimer =
        setInterval(
            updateTimer,
            1000
        );

}


/* =========================================
   START EARNING SESSION
========================================= */

async function startEarning() {

    if (!tg) {

        alert(
            "Please open BTTC Earn inside Telegram."
        );

        return;

    }


    if (!currentUser) {

        alert(
            "User verification is still loading. Please try again."
        );

        return;

    }


    if (!tg.initData) {

        alert(
            "Telegram authentication data is unavailable."
        );

        return;

    }


    mediumHaptic();


    setStartButtonText(
        "STARTING..."
    );


    startButton.disabled =
        true;


    try {

        const response =
            await fetch(
                START_EARNING_FUNCTION,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        initData:
                            tg.initData
                    })
                }
            );


        const result =
            await response.json();


        console.log(
            "Start earning response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to start earning."
            );

        }


        const session =
            result.session;


        /*
         * The backend may tell us that
         * a session was already active.
         *
         * In that case we simply resume it.
         */

        startCountdown(
            session
        );


    } catch (error) {

        console.error(
            "Start earning error:",
            error
        );


        startButton.disabled =
            false;


        setStartButtonText(
            "START EARNING"
        );


        alert(
            error.message ||
            "Unable to start earning."
        );

    }

}


/* =========================================
   CLAIM 1,000 BTTC
========================================= */

async function claimEarning() {

    if (!tg) {

        alert(
            "Please open BTTC Earn inside Telegram."
        );

        return;

    }


    if (!tg.initData) {

        alert(
            "Telegram authentication data is unavailable."
        );

        return;

    }


    mediumHaptic();


    setStartButtonText(
        "CLAIMING..."
    );


    startButton.disabled =
        true;


    try {

        const response =
            await fetch(
                CLAIM_EARNING_FUNCTION,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        initData:
                            tg.initData
                    })
                }
            );


        const result =
            await response.json();


        console.log(
            "Claim response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to claim reward."
            );

        }


        /*
         * The backend returns the
         * authoritative new balance.
         */

        updateBTTCBalance(
            result.new_balance_bttc
        );


        clearEarningSession();


        earningSession =
            null;


        successHaptic();


        /*
         * The cycle is now completely finished.
         *
         * The user MUST press START EARNING
         * again to begin another 15-minute session.
         */

        setStartButtonText(
            "START EARNING"
        );


        startButton.disabled =
            false;


        startButton.classList.remove(
            "claim-ready"
        );


        console.log(
            `Reward claimed: ${result.reward_bttc} BTTC`
        );


    } catch (error) {

        console.error(
            "Claim earning error:",
            error
        );


        /*
         * If the local timer finished slightly
         * before the server's exact 15 minutes,
         * allow the user to try the claim again.
         */

        setStartButtonText(
            "CLAIM 1,000 BTTC"
        );


        startButton.disabled =
            false;


        startButton.classList.add(
            "claim-ready"
        );


        alert(
            error.message ||
            "Unable to claim reward."
        );

    }

}


/* =========================================
   START / CLAIM BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        async () => {

            /*
             * If the button says CLAIM,
             * perform the claim operation.
             */

            if (
                startButton.textContent
                    .includes("CLAIM")
            ) {

                await claimEarning();

                return;

            }


            /*
             * Otherwise start a new
             * 15-minute earning session.
             */

            await startEarning();

        }
    );

}


/* =========================================
   RESTORE SESSION AFTER RELOAD
========================================= */

function restoreEarningSession() {

    const savedSession =
        loadSavedEarningSession();


    if (!savedSession) {
        return;
    }


    if (
        savedSession.status !==
        "active"
    ) {

        clearEarningSession();

        return;

    }


    const endTime =
        new Date(
            savedSession.ends_at
        ).getTime();


    if (
        Number.isNaN(endTime)
    ) {

        clearEarningSession();

        return;

    }


    const remaining =
        endTime -
        Date.now();


    /*
     * The local timer says the session
     * has completed.
     *
     * We show Claim, but the backend
     * still performs the real 15-minute
     * verification.
     */

    if (remaining <= 0) {

        setStartButtonText(
            "CLAIM 1,000 BTTC"
        );


        startButton.disabled =
            false;


        startButton.classList.add(
            "claim-ready"
        );


        earningSession =
            savedSession;


        return;

    }


    /*
     * Session is still running.
     */

    startCountdown(
        savedSession
    );

}


/* =========================================
   COPY TELEGRAM ID
========================================= */

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            const id =
                telegramId?.textContent
                    ?.trim();


            if (!id) {
                return;
            }


            try {

                await navigator
                    .clipboard
                    .writeText(id);


                if (
                    tg &&
                    tg.showPopup
                ) {

                    tg.showPopup({

                        title:
                            "Copied",

                        message:
                            "Telegram ID copied successfully.",

                        buttons: [
                            {
                                type:
                                    "ok"
                            }
                        ]

                    });

                } else {

                    alert(
                        "ID copied!"
                    );

                }


            } catch (error) {

                console.error(
                    "Copy error:",
                    error
                );

            }

        }
    );

}


/* =========================================
   QUICK BUTTONS
========================================= */

const quickButtons =
    document.querySelectorAll(
        ".quick-card"
    );


quickButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;


                if (
                    tg &&
                    tg.HapticFeedback
                ) {

                    tg.HapticFeedback
                        .selectionChanged();

                }


                console.log(
                    "Quick page:",
                    page
                );

            }
        );

    }
);


/* =========================================
   BOTTOM NAVIGATION
========================================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;


                navItems.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                item.classList.add(
                    "active"
                );


                if (
                    tg &&
                    tg.HapticFeedback
                ) {

                    tg.HapticFeedback
                        .selectionChanged();

                }


                console.log(
                    "Navigation:",
                    page
                );

            }
        );

    }
);


/* =========================================
   PREVENT DOUBLE TAP ZOOM
========================================= */

let lastTouchEnd =
    0;


document.addEventListener(
    "touchend",
    event => {

        const now =
            Date.now();


        if (
            now - lastTouchEnd <= 300
        ) {

            event.preventDefault();

        }


        lastTouchEnd =
            now;

    },
    false
);


/* =========================================
   START APP
========================================= */

(async () => {

    currentUser =
        await loadTelegramUser();


    if (currentUser) {

        /*
         * Only restore a session here.
         *
         * We DO NOT call start-earning
         * automatically because the user
         * must explicitly press START.
         */

        if (startButton) {

            restoreEarningSession();

        }

    }

})();


console.log(
    "BTTC Earn loaded successfully."
);