/* =========================================
   BTTC EARN — TELEGRAM MINI APP
========================================= */

const tg = window.Telegram?.WebApp;


/* =========================================
   TELEGRAM INITIALIZATION
========================================= */

if (tg) {
    tg.ready();
    tg.expand();

    tg.setHeaderColor("#050511");
    tg.setBackgroundColor("#050511");
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
========================================= */

function loadTelegramUser() {

    if (
        !tg ||
        !tg.initDataUnsafe ||
        !tg.initDataUnsafe.user
    ) {
        console.log(
            "Telegram user data not available."
        );

        return;
    }

    const user =
        tg.initDataUnsafe.user;


    /* User's first name */

    if (user.first_name) {

        userName.textContent =
            user.first_name;

    }


    /* Telegram ID */

    if (user.id) {

        telegramId.textContent =
            user.id;

    }


    console.log(
        "Telegram user:",
        user
    );
}


loadTelegramUser();


/* =========================================
   COPY ID
========================================= */

copyButton.addEventListener(
    "click",
    async () => {

        const id =
            telegramId.textContent.trim();

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


/* =========================================
   START EARNING
========================================= */

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