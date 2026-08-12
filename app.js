/* =========================================
   BTTC EARN — TELEGRAM MINI APP
========================================= */

const SUPABASE_FUNCTION_URL =
    "https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/telegram-user";

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
        console.log("Telegram color settings unavailable.");
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


/* =========================================
   LOAD TELEGRAM USER
   Securely verified by Supabase
========================================= */

async function loadTelegramUser() {

    if (!tg) {
        console.log("Not running inside Telegram.");
        return null;
    }

    const initData = tg.initData;

    if (!initData) {
        console.log("Telegram initData not available.");
        return null;
    }

    try {

        const response = await fetch(
            SUPABASE_FUNCTION_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    initData: initData
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
const usdtBalance =
    document.getElementById("usdtBalance");

const bttcBalance =
    document.getElementById("bttcBalance");


if (
    usdtBalance &&
    user.balance_usdt !== undefined
) {
    usdtBalance.textContent =
        Number(user.balance_usdt).toFixed(2);
}


if (
    bttcBalance &&
    user.balance_bttc !== undefined
) {
    bttcBalance.textContent =
        Number(user.balance_bttc).toLocaleString("en-IN");
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
   START APP
========================================= */

let currentUser = null;


(async () => {

    currentUser =
        await loadTelegramUser();

})();


/* =========================================
   COPY TELEGRAM ID
========================================= */

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            const id =
                telegramId?.textContent?.trim();

            if (!id) {
                return;
            }

            try {

                await navigator.clipboard
                    .writeText(id);


                if (
                    tg &&
                    tg.showPopup
                ) {

                    tg.showPopup({

                        title: "Copied",

                        message:
                            "Telegram ID copied successfully.",

                        buttons: [
                            {
                                type: "ok"
                            }
                        ]

                    });

                } else {

                    alert("ID copied!");

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
   START EARNING
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            if (
                tg &&
                tg.HapticFeedback
            ) {

                tg.HapticFeedback
                    .impactOccurred("medium");

            }

            console.log(
                "Start Earning clicked"
            );

            /*
             * Actual earning system
             * will be connected later.
             */

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

let lastTouchEnd = 0;

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

        lastTouchEnd = now;

    },
    false
);


console.log(
    "BTTC Earn loaded successfully."
);