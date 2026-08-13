/* =========================================
   BTTC EARN — TELEGRAM MINI APP
========================================= */


/* =========================================
   SUPABASE EDGE FUNCTIONS
========================================= */

const TELEGRAM_USER_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/telegram-user";

const START_EARNING_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/start-earning";

const CLAIM_EARNING_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/claim-earning";

const PROCESS_REFERRAL_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/process-referral";


/* =========================================
   TELEGRAM
========================================= */

const tg =
window.Telegram?.WebApp || null;


/* =========================================
   TELEGRAM INITIALIZATION
========================================= */

if (tg) {

  try {

    tg.ready();

    tg.expand();

    tg.setHeaderColor(
      "#050511"
    );

    tg.setBackgroundColor(
      "#050511"
    );

  } catch (error) {

    console.log(
      "Telegram initialization error:",
      error
    );

  }

}


/* =========================================
   ELEMENTS
========================================= */

const userName =
document.getElementById(
  "userName"
);


const telegramId =
document.getElementById(
  "telegramId"
);


const userAvatar =
document.getElementById(
  "userAvatar"
);


const avatarFallback =
document.getElementById(
  "avatarFallback"
);


const copyButton =
document.getElementById(
  "copyId"
);


const usdtBalance =
document.getElementById(
  "usdtBalance"
);


const bttcBalance =
document.getElementById(
  "bttcBalance"
);


const startButton =
document.getElementById(
  "startEarning"
);


const earningButtonText =
document.getElementById(
  "earningButtonText"
);


const earningStatus =
document.getElementById(
  "earningStatus"
);


/* =========================================
   EARNING SETTINGS
========================================= */

const EARNING_DURATION_SECONDS =
15 * 60;


const EARNING_REWARD =
1000;


const EARNING_STORAGE_KEY =
"bttc_earning_session";


let currentUser =
null;


let earningTimer =
null;


let earningSession =
null;


/* =========================================
   BUTTON TEXT
========================================= */

function setButtonText(
  text
) {

  if (
    earningButtonText
  ) {

    earningButtonText.textContent =
    text;

  } else if (
    startButton
  ) {

    startButton.textContent =
    text;

  }

}


/* =========================================
   STATUS TEXT
========================================= */

function setStatus(
  text
) {

  if (
    earningStatus
  ) {

    earningStatus.textContent =
    text || "";

  }

}


/* =========================================
   HAPTIC
========================================= */

function mediumHaptic() {

  try {

    tg?.HapticFeedback
    ?.impactOccurred(
      "medium"
    );

  } catch (_) {}

}


function successHaptic() {

  try {

    tg?.HapticFeedback
    ?.notificationOccurred(
      "success"
    );

  } catch (_) {}

}


/* =========================================
   PROFILE PHOTO
========================================= */

function setProfilePhoto(
  photoUrl
) {

  if (
    !userAvatar
  ) {

    return;

  }


  if (
    typeof photoUrl ===
    "string" &&
    photoUrl.trim() !== ""
  ) {

    userAvatar.src =
    photoUrl;

    userAvatar.style.display =
    "block";


    if (
      avatarFallback
    ) {

      avatarFallback.style.display =
      "none";

    }


    userAvatar.onerror =
    function () {

      userAvatar.style.display =
      "none";


      if (
        avatarFallback
      ) {

        avatarFallback.style.display =
        "flex";

      }

    };


    return;

  }


  userAvatar.style.display =
  "none";


  if (
    avatarFallback
  ) {

    avatarFallback.style.display =
    "flex";

  }

}


/* =========================================
   DISPLAY USER
========================================= */

function displayUser(
  user
) {

  if (
    !user
  ) {

    return;

  }


  /* NAME */

  if (
    userName &&
    user.first_name
  ) {

    userName.textContent =
    user.first_name;

  }


  /* TELEGRAM ID */

  if (
    telegramId &&
    user.telegram_id !==
    undefined &&
    user.telegram_id !==
    null
  ) {

    telegramId.textContent =
    user.telegram_id;

  }


  /* USDT BALANCE */

  if (
    usdtBalance &&
    user.balance_usdt !==
    undefined &&
    user.balance_usdt !==
    null
  ) {

    usdtBalance.textContent =
    Number(
      user.balance_usdt
    ).toFixed(2);

  }


  /* BTTC BALANCE */

  if (
    bttcBalance &&
    user.balance_bttc !==
    undefined &&
    user.balance_bttc !==
    null
  ) {

    bttcBalance.textContent =
    Number(
      user.balance_bttc
    ).toLocaleString(
      "en-IN"
    );

  }


  /*
   * Prefer backend photo_url.
   * Fall back to Telegram photo_url.
   */

  let photoUrl =
  user.photo_url || "";


  if (
    !photoUrl &&
    tg?.initDataUnsafe?.user?.photo_url
  ) {

    photoUrl =
    tg.initDataUnsafe
    .user
    .photo_url;

  }


  setProfilePhoto(
    photoUrl
  );

}


/* =========================================
   LOAD TELEGRAM USER
========================================= */

async function loadTelegramUser() {

  if (
    !tg
  ) {

    console.log(
      "Telegram WebApp SDK unavailable."
    );

    return null;

  }


  const initData =
  tg.initData;


  if (
    !initData
  ) {

    console.log(
      "Telegram initData unavailable."
    );

    return null;

  }


  /*
   * Show Telegram information immediately.
   */

  const telegramPreviewUser =
  tg.initDataUnsafe?.user;


  if (
    telegramPreviewUser
  ) {

    if (
      userName &&
      telegramPreviewUser.first_name
    ) {

      userName.textContent =
      telegramPreviewUser.first_name;

    }


    if (
      telegramId &&
      telegramPreviewUser.id
    ) {

      telegramId.textContent =
      telegramPreviewUser.id;

    }


    setProfilePhoto(
      telegramPreviewUser.photo_url
    );

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


    console.log(
      "telegram-user response:",
      result
    );


    if (
      !response.ok ||
      !result.success ||
      !result.user
    ) {

      console.error(
        "Telegram user backend error:",
        result
      );

      return null;

    }


    const user =
    result.user;


    currentUser =
    user;


    displayUser(
      user
    );


    return user;


  } catch (
    error
  ) {

    console.error(
      "Telegram user connection error:",
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

  if (
    !bttcBalance
  ) {

    return;

  }


  bttcBalance.textContent =
  Number(
    balance
  ).toLocaleString(
    "en-IN"
  );

}


/* =========================================
   LOCAL EARNING SESSION
========================================= */

function saveEarningSession(
  session
) {

  try {

    localStorage.setItem(
      EARNING_STORAGE_KEY,
      JSON.stringify(
        session
      )
    );

  } catch (
    error
  ) {

    console.error(
      "Unable to save earning session:",
      error
    );

  }

}


function getSavedEarningSession() {

  try {

    const saved =
    localStorage.getItem(
      EARNING_STORAGE_KEY
    );


    if (
      !saved
    ) {

      return null;

    }


    return JSON.parse(
      saved
    );


  } catch (
    error
  ) {

    console.error(
      "Unable to read earning session:",
      error
    );

    return null;

  }

}


function clearSavedEarningSession() {

  try {

    localStorage.removeItem(
      EARNING_STORAGE_KEY
    );

  } catch (
    error
  ) {

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
  seconds
) {

  const minutes =
  Math.floor(
    seconds / 60
  );


  const remainingSeconds =
  seconds % 60;


  return (
    String(
      minutes
    ).padStart(
      2,
      "0"
    ) +
    ":" +
    String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )
  );

}


/* =========================================
   STOP TIMER
========================================= */

function stopTimer() {

  if (
    earningTimer
  ) {

    clearInterval(
      earningTimer
    );

    earningTimer =
    null;

  }

}


/* =========================================
   CLAIM MODE
========================================= */

function setClaimMode(
  enabled
) {

  if (
    !startButton
  ) {

    return;

  }


  startButton.dataset.mode =
  enabled
  ? "claim": "start";

}


/* =========================================
   SHOW CLAIM BUTTON
========================================= */

function showClaimButton() {

  stopTimer();


  setClaimMode(
    true
  );


  setButtonText(
    "CLAIM 1,000 BTTC"
  );


  if (
    startButton
  ) {

    startButton.disabled =
    false;


    startButton.classList.add(
      "claim-ready"
    );

  }


  setStatus(
    "Your 1,000 BTTC reward is ready."
  );

}


/* =========================================
   SHOW START BUTTON
========================================= */

function showStartButton() {

  stopTimer();


  setClaimMode(
    false
  );


  setButtonText(
    "Start Earning"
  );


  if (
    startButton
  ) {

    startButton.disabled =
    false;


    startButton.classList.remove(
      "claim-ready"
    );

  }


  setStatus(
    ""
  );

}


/* =========================================
   COUNTDOWN
========================================= */

function startCountdown(
  session
) {

  if (
    !session ||
    !session.ends_at
  ) {

    showStartButton();

    return;

  }


  earningSession =
  session;


  saveEarningSession(
    session
  );


  stopTimer();


  setClaimMode(
    false
  );


  if (
    startButton
  ) {

    startButton.disabled =
    true;


    startButton.classList.remove(
      "claim-ready"
    );

  }


  function update() {

    const endTime =
    new Date(
      session.ends_at
    ).getTime();


    const now =
    Date.now();


    const remaining =
    Math.max(
      0,
      Math.ceil(
        (
          endTime -
          now
        ) / 1000
      )
    );


    if (
      remaining <=
      0
    ) {

      showClaimButton();

      return;

    }


    setButtonText(
      formatTime(
        remaining
      )
    );


    setStatus(
      "Earning in progress..."
    );

  }


  update();


  earningTimer =
  setInterval(
    update,
    1000
  );

}


/* =========================================
   START EARNING
========================================= */

async function startEarning() {

  if (
    !tg
  ) {

    alert(
      "Please open BTTC Earn inside Telegram."
    );

    return;

  }


  if (
    !tg.initData
  ) {

    alert(
      "Telegram authentication data is unavailable."
    );

    return;

  }


  if (
    !currentUser
  ) {

    alert(
      "Please wait for your Telegram account to load."
    );

    return;

  }


  mediumHaptic();


  if (
    startButton
  ) {

    startButton.disabled =
    true;

  }


  setClaimMode(
    false
  );


  setButtonText(
    "Mining..."
  );


  setStatus(
    "Starting your 15-minute earning session..."
  );


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
      "start-earning response:",
      result
    );


    if (
      !response.ok ||
      !result.success ||
      !result.session
    ) {

      throw new Error(
        result.error ||
        "Unable to start earning."
      );

    }


    startCountdown(
      result.session
    );


  } catch (
    error
  ) {

    console.error(
      "Start earning error:",
      error
    );


    showStartButton();


    alert(
      error.message ||
      "Unable to start earning."
    );

  }

}


/* =========================================
   CLAIM EARNING
========================================= */

async function claimEarning() {

  if (
    !tg
  ) {

    alert(
      "Please open BTTC Earn inside Telegram."
    );

    return;

  }


  if (
    !tg.initData
  ) {

    alert(
      "Telegram authentication data is unavailable."
    );

    return;

  }


  mediumHaptic();


  if (
    startButton
  ) {

    startButton.disabled =
    true;

  }


  setButtonText(
    "Claiming..."
  );


  setStatus(
    "Checking your earning session..."
  );


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
      "claim-earning response:",
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


    if (
      result.new_balance_bttc !==
      undefined &&
      result.new_balance_bttc !==
      null
    ) {

      updateBTTCBalance(
        result.new_balance_bttc
      );

    }


    clearSavedEarningSession();


    earningSession =
    null;


    successHaptic();


    showStartButton();


    setStatus(
      "+1,000 BTTC added to your balance."
    );


  } catch (
    error
  ) {

    console.error(
      "Claim error:",
      error
    );


    setClaimMode(
      true
    );


    setButtonText(
      "CLAIM 1,000 BTTC"
    );


    if (
      startButton
    ) {

      startButton.disabled =
      false;


      startButton.classList.add(
        "claim-ready"
      );

    }


    setStatus(
      ""
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

if (
  startButton
) {

  startButton.addEventListener(
    "click",
    async function () {

      if (
        startButton.dataset.mode ===
        "claim"
      ) {

        await claimEarning();

        return;

      }


      const buttonText =
      (
        earningButtonText
        ?.textContent ||
        startButton
        .textContent ||
        ""
      ).toUpperCase();


      if (
        buttonText.includes(
          "CLAIM"
        )
      ) {

        await claimEarning();

        return;

      }


      await startEarning();

    }
  );

}


/* =========================================
   RESTORE EARNING SESSION
========================================= */

function restoreEarningSession() {

  const savedSession =
  getSavedEarningSession();


  if (
    !savedSession ||
    !savedSession.ends_at
  ) {

    showStartButton();

    return;

  }


  const endTime =
  new Date(
    savedSession.ends_at
  ).getTime();


  if (
    Number.isNaN(
      endTime
    )
  ) {

    clearSavedEarningSession();

    showStartButton();

    return;

  }


  earningSession =
  savedSession;


  if (
    endTime <=
    Date.now()
  ) {

    showClaimButton();

    return;

  }


  startCountdown(
    savedSession
  );

}


/* =========================================
   COPY TELEGRAM ID
========================================= */

if (
  copyButton
) {

  copyButton.addEventListener(
    "click",
    async function () {

      const id =
      telegramId
      ?.textContent
      ?.trim();


      if (
        !id ||
        id ===
        "XXXXXXXXXX"
      ) {

        return;

      }


      try {

        await navigator.clipboard.writeText(
          id
        );


        try {

          tg?.HapticFeedback
          ?.notificationOccurred(
            "success"
          );

        } catch (_) {}


        if (
          tg?.showPopup
        ) {

          tg.showPopup({

            title:
            "Copied",

            message:
            "Telegram ID copied successfully.",

            buttons: [{
              type:
              "ok"
            }]

          });

        } else {

          alert(
            "Telegram ID copied successfully."
          );

        }


      } catch (
        error
      ) {

        console.error(
          "Copy ID error:",
          error
        );


        /*
         * Clipboard fallback.
         */

        try {

          const textarea =
          document.createElement(
            "textarea"
          );


          textarea.value =
          id;


          textarea.style.position =
          "fixed";


          textarea.style.opacity =
          "0";


          document.body.appendChild(
            textarea
          );


          textarea.select();


          document.execCommand(
            "copy"
          );


          textarea.remove();


          alert(
            "Telegram ID copied successfully."
          );


        } catch (_) {

          alert(
            "Unable to copy Telegram ID."
          );

        }

      }

    }
  );

}


/* =========================================
   PROCESS TELEGRAM REFERRAL
========================================= */

async function processTelegramReferral() {

  /*
   * Must be running inside Telegram.
   */

  if (
    !tg
  ) {

    console.log(
      "Referral: Telegram WebApp unavailable."
    );

    return;

  }


  /*
   * Telegram initData is required
   * by the secure Edge Function.
   */

  if (
    !tg.initData
  ) {

    console.log(
      "Referral: Telegram initData unavailable."
    );

    return;

  }


  /*
   * Telegram places the ?start=
   * value in start_param.
   */

  const startParam =
  tg.initDataUnsafe
  ?.start_param;


  if (
    !startParam
  ) {

    console.log(
      "Referral: no start parameter."
    );

    return;

  }


  /*
   * The start parameter is the
   * referrer's Telegram ID.
   */

  const referrerTelegramId =
  Number(
    startParam
  );


  if (
    !Number.isSafeInteger(
      referrerTelegramId
    ) ||
    referrerTelegramId <=
    0
  ) {

    console.error(
      "Referral: invalid referrer Telegram ID:",
      startParam
    );

    return;

  }


  /*
   * Get the current user's Telegram ID.
   */

  const currentTelegramId =
  Number(
    tg.initDataUnsafe
    ?.user
    ?.id
  );


  if (
    !Number.isSafeInteger(
      currentTelegramId
    ) ||
    currentTelegramId <=
    0
  ) {

    console.log(
      "Referral: current Telegram user unavailable."
    );

    return;

  }


  /*
   * Self-referral protection.
   */
  if (
    referrerTelegramId ===
    currentTelegramId
  ) {

    console.log(
      "Referral: self-referral blocked."
    );

    return;

  }


  /*
   * Local duplicate guard.
   *
   * The database/RPC remains the
   * final authority.
   */

  const referralKey =
  `bttc_referral_attempt_${currentTelegramId}`;


  if (
    localStorage.getItem(
      referralKey
    )
  ) {

    console.log(
      "Referral: already attempted on this device."
    );

    return;

  }


  console.log(
    "Referral detected.",
    {
      referrerTelegramId:
      referrerTelegramId,

      currentTelegramId:
      currentTelegramId
    }
  );


  try {

    const response =
    await fetch(
      PROCESS_REFERRAL_FUNCTION,
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          initData:
          tg.initData,

          referrerTelegramId:
          referrerTelegramId

        })

      }
    );


    const result =
    await response.json();


    console.log(
      "process-referral response:",
      result
    );


    /*
     * Only mark the local attempt
     * after the server responds.
     */

    if (
      response.ok &&
      result.success
    ) {

      localStorage.setItem(
        referralKey,
        "1"
      );


      console.log(
        "Referral processed successfully.",
        result
      );


      successHaptic();


      /*
       * Do not display a popup if the
       * referral was silently processed.
       *
       * This keeps the Mini App UX clean.
       */

      return;

    }


    /*
     * Existing referrer / already processed
     * is not a client-side failure that
     * needs to be retried forever.
     */

    if (
      result?.error ===
      "This account already has a referrer" ||
      result?.error ===
      "Referral already processed"
    ) {

      localStorage.setItem(
        referralKey,
        "1"
      );

    }


    console.error(
      "Referral processing failed:",
      result?.error ||
      "Unknown error"
    );


  } catch (
    error
  ) {

    console.error(
      "Referral request failed:",
      error
    );

  }

}


/* =========================================
   QUICK ACTIONS
========================================= */

const quickButtons =
document.querySelectorAll(
  ".quick-card"
);


quickButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        const page =
        button.dataset.page;


        try {

          tg?.HapticFeedback
          ?.selectionChanged();

        } catch (_) {}


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
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const page =
        item.dataset.page;


        navItems.forEach(
          function (nav) {

            nav.classList.remove(
              "active"
            );

          }
        );


        item.classList.add(
          "active"
        );


        try {

          tg?.HapticFeedback
          ?.selectionChanged();

        } catch (_) {}


        console.log(
          "Navigation:",
          page
        );

      }
    );

  }
);


/* =========================================
   PREVENT DOUBLE-TAP ZOOM
========================================= */

let lastTouchEnd =
0;


document.addEventListener(
  "touchend",
  function (event) {

    const now =
    Date.now();


    if (
      now -
      lastTouchEnd <=
      300
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

(async function () {

  /*
   * First load and verify
   * the Telegram user.
   */

  currentUser =
  await loadTelegramUser();


  /*
   * Process a referral after
   * Telegram authentication is ready.
   */

  await processTelegramReferral();


  /*
   * Restore an existing
   * earning session.
   */

  restoreEarningSession();

})();


/* =========================================
   READY
========================================= */

console.log(
  "BTTC Earn loaded successfully."
);