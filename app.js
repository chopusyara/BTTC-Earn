/* =========================================================
   BTTC EARN — TELEGRAM MINI APP
   COMPLETE APP.JS REPLACEMENT

   Fixes:
   - Start Earning works reliably in Telegram
   - Does not wait unnecessarily for currentUser
   - Telegram initData is used for secure server calls
   - Claim flow preserved
   - Mining session restored after reload
   - Copy Telegram ID
   - Telegram profile display
   - Referral processing preserved
   - Bottom navigation preserved
   - Quick buttons preserved
========================================================= */


/* =========================================================
   SUPABASE EDGE FUNCTIONS
========================================================= */

const TELEGRAM_USER_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/telegram-user";

const START_EARNING_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/start-earning";

const CLAIM_EARNING_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/claim-earning";

const PROCESS_REFERRAL_FUNCTION =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/process-referral";


/* =========================================================
   TELEGRAM
========================================================= */

const tg =
window.Telegram?.WebApp || null;


/* =========================================================
   TELEGRAM INITIALIZATION
========================================================= */

if (tg) {

  try {
    tg.ready();
  } catch (_) {}

  try {
    tg.expand();
  } catch (_) {}

  try {
    tg.setHeaderColor("#050511");
  } catch (_) {}

  try {
    tg.setBackgroundColor("#050511");
  } catch (_) {}

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const userName =
document.getElementById("userName");

const telegramId =
document.getElementById("telegramId");

const userAvatar =
document.getElementById("userAvatar");

const avatarFallback =
document.getElementById("avatarFallback");

const copyButton =
document.getElementById("copyId");

const usdtBalance =
document.getElementById("usdtBalance");

const bttcBalance =
document.getElementById("bttcBalance");

const startButton =
document.getElementById("startEarning");

const earningButtonText =
document.getElementById("earningButtonText");

const earningStatus =
document.getElementById("earningStatus");


/* =========================================================
   EARNING SETTINGS
========================================================= */

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

let startRequestRunning =
false;

let claimRequestRunning =
false;


/* =========================================================
   BUTTON TEXT
========================================================= */

function setButtonText(text) {

  if (earningButtonText) {

    earningButtonText.textContent =
    text;

    return;
  }

  if (startButton) {

    /*
     * Preserve the rocket/icon if
     * there is no separate text span.
     */

    const textNode =
    Array.from(
      startButton.childNodes
    ).find(
      node =>
      node.nodeType ===
      Node.TEXT_NODE
    );

    if (textNode) {

      textNode.textContent =
      " " + text;

    } else {

      startButton.textContent =
      text;

    }

  }

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(text) {

  if (earningStatus) {

    earningStatus.textContent =
    text || "";

  }

}


/* =========================================================
   HAPTIC HELPERS
========================================================= */

function mediumHaptic() {

  try {

    tg?.HapticFeedback
    ?.impactOccurred(
      "medium"
    );

  } catch (_) {}

}


function lightHaptic() {

  try {

    tg?.HapticFeedback
    ?.impactOccurred(
      "light"
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


function errorHaptic() {

  try {

    tg?.HapticFeedback
    ?.notificationOccurred(
      "error"
    );

  } catch (_) {}

}


/* =========================================================
   TELEGRAM ALERT
========================================================= */

function showTelegramAlert(message) {

  try {

    if (
      tg?.showAlert
    ) {

      tg.showAlert(
        String(message)
      );

      return;

    }

  } catch (_) {}

  alert(
    String(message)
  );

}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function setProfilePhoto(
  photoUrl
) {

  if (!userAvatar) {
    return;
  }


  if (
    typeof photoUrl === "string" &&
    photoUrl.trim() !== ""
  ) {

    userAvatar.src =
    photoUrl;

    userAvatar.style.display =
    "block";


    if (avatarFallback) {

      avatarFallback.style.display =
      "none";

    }


    userAvatar.onerror =
    function () {

      userAvatar.style.display =
      "none";


      if (avatarFallback) {

        avatarFallback.style.display =
        "flex";

      }

    };


    return;

  }


  userAvatar.style.display =
  "none";


  if (avatarFallback) {

    avatarFallback.style.display =
    "flex";

  }

}


/* =========================================================
   DISPLAY USER
========================================================= */

function displayUser(
  user
) {

  if (!user) {
    return;
  }


  if (
    userName &&
    user.first_name
  ) {

    userName.textContent =
    user.first_name;

  }


  if (
    telegramId &&
    user.id
  ) {

    telegramId.textContent =
    user.id;

  }


  setProfilePhoto(
    user.photo_url
  );

}


/* =========================================================
   UPDATE BTTC BALANCE
========================================================= */

function updateBTTCBalance(
  balance
) {

  if (!bttcBalance) {
    return;
  }


  const numericBalance =
  Number(balance);


  if (
    !Number.isFinite(
      numericBalance
    )
  ) {

    return;

  }


  bttcBalance.textContent =
  numericBalance.toLocaleString(
    "en-IN"
  );

}


/* =========================================================
   UPDATE USDT BALANCE
========================================================= */

function updateUSDTBalance(
  balance
) {

  if (!usdtBalance) {
    return;
  }


  const numericBalance =
  Number(balance);


  if (
    !Number.isFinite(
      numericBalance
    )
  ) {

    return;

  }


  usdtBalance.textContent =
  numericBalance.toFixed(2);

}


/* =========================================================
   LOAD TELEGRAM USER
========================================================= */

async function loadTelegramUser() {

  /*
   * Telegram client data is immediately
   * available inside the Mini App.
   */

  const telegramClientUser =
  tg?.initDataUnsafe?.user;


  if (
    telegramClientUser
  ) {

    displayUser(
      telegramClientUser
    );

  }


  /*
   * Secure server request.
   */

  if (
    !tg ||
    !tg.initData
  ) {

    console.warn(
      "Telegram initData unavailable."
    );

    return (
      telegramClientUser ||
      null
    );

  }


  try {

    const response =
    await fetch(
      TELEGRAM_USER_FUNCTION,
      {
        method:
        "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({
          initData:
          tg.initData
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
      !result.success
    ) {

      console.warn(
        "Telegram user request failed:",
        result.error
      );

      /*
       * IMPORTANT:
       *
       * Do not block Start Earning.
       * Telegram initData is enough for
       * the secure earning Edge Function.
       */

      return (
        telegramClientUser ||
        null
      );

    }


    const serverUser =
    result.user ||
    result.data ||
    result;


    if (
      serverUser
    ) {

      currentUser =
      serverUser;

    }


    if (
      result.balance_bttc !==
      undefined
    ) {

      updateBTTCBalance(
        result.balance_bttc
      );

    }


    if (
      result.bttc_balance !==
      undefined
    ) {

      updateBTTCBalance(
        result.bttc_balance
      );

    }


    if (
      result.balance_usdt !==
      undefined
    ) {

      updateUSDTBalance(
        result.balance_usdt
      );

    }


    if (
      result.usdt_balance !==
      undefined
    ) {

      updateUSDTBalance(
        result.usdt_balance
      );

    }


    return (
      serverUser ||
      telegramClientUser ||
      null
    );


  } catch (error) {

    console.error(
      "loadTelegramUser error:",
      error
    );


    /*
     * Do NOT prevent earning because
     * this optional profile request failed.
     */

    return (
      telegramClientUser ||
      null
    );

  }

}


/* =========================================================
   COPY TELEGRAM ID
========================================================= */

function setupCopyButton() {

  if (!copyButton) {
    return;
  }


  copyButton.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();
      event.stopPropagation();


      const id =
      telegramId?.textContent
      ?.trim();


      if (
        !id ||
        id ===
        "XXXXXXXXXX"
      ) {

        showTelegramAlert(
          "Telegram ID is not available."
        );

        return;

      }


      lightHaptic();


      try {

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          await navigator.clipboard.writeText(
            id
          );

        } else {

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

        }


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


      } catch (error) {

        console.error(
          "Copy ID error:",
          error
        );

        showTelegramAlert(
          "Unable to copy Telegram ID."
        );

      }

    }
  );

}


/* =========================================================
   LOCAL SESSION STORAGE
========================================================= */

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

  } catch (error) {

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


    if (!saved) {

      return null;

    }


    return JSON.parse(
      saved
    );


  } catch (error) {

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

  } catch (error) {

    console.error(
      "Unable to clear earning session:",
      error
    );

  }

}


/* =========================================================
   FORMAT TIME
========================================================= */

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
    String(minutes)
    .padStart(
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


/* =========================================================
   STOP TIMER
========================================================= */

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


/* =========================================================
   CLAIM MODE
========================================================= */

function setClaimMode(
  enabled
) {

  if (!startButton) {
    return;
  }


  startButton.dataset.mode =
  enabled
  ? "claim": "start";

}


/* =========================================================
   SHOW CLAIM BUTTON
========================================================= */

function showClaimButton() {

  stopTimer();

  setClaimMode(
    true
  );


  setButtonText(
    "CLAIM BTTC"
  );


  if (startButton) {

    startButton.disabled =
    false;

    startButton.classList.add(
      "claim-ready"
    );

  }


  setStatus(
    "Your BTTC reward is ready."
  );

}


/* =========================================================
   SHOW START BUTTON
========================================================= */

function showStartButton() {

  stopTimer();

  setClaimMode(
    false
  );


  setButtonText(
    "START"
  );


  if (startButton) {

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


/* =========================================================
   COUNTDOWN
========================================================= */

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


  if (startButton) {

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


    if (
      Number.isNaN(
        endTime
      )
    ) {

      showStartButton();

      return;

    }


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
      remaining <= 0
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


/* =========================================================
   START EARNING
   IMPORTANT:
   Does NOT depend on currentUser.
========================================================= */

async function startEarning() {

  console.log(
    "START EARNING clicked"
  );


  /*
   * Telegram check.
   */

  if (!tg) {

    showTelegramAlert(
      "Please open BTTC Earn inside Telegram."
    );

    return;

  }


  /*
   * Secure Telegram authentication.
   */

  if (
    !tg.initData
  ) {

    showTelegramAlert(
      "Telegram authentication data is unavailable. Please reopen the Mini App from Telegram."
    );

    return;

  }


  /*
   * Prevent double requests.
   */

  if (
    startRequestRunning
  ) {

    return;

  }


  /*
   * If an active session exists,
   * don't create another one.
   */

  if (
    earningSession &&
    earningSession.ends_at
  ) {

    const existingEnd =
    new Date(
      earningSession.ends_at
    ).getTime();


    if (
      Number.isFinite(
        existingEnd
      ) &&
      existingEnd >
      Date.now()
    ) {

      startCountdown(
        earningSession
      );

      return;

    }

  }


  startRequestRunning =
  true;


  mediumHaptic();


  if (startButton) {

    startButton.disabled =
    true;

  }


  setClaimMode(
    false
  );


  setButtonText(
    "Starting..."
  );


  setStatus(
    "Starting your earning session..."
  );


  try {

    const response =
    await fetch(
      START_EARNING_FUNCTION,
      {
        method:
        "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({
          initData:
          tg.initData
        })
      }
    );


    /*
     * Read response safely.
     */

    const rawText =
    await response.text();


    let result = {};


    try {

      result =
      rawText
      ? JSON.parse(
        rawText
      ): {};

    } catch (_) {

      throw new Error(
        "The earning server returned an invalid response."
      );

    }


    console.log(
      "start-earning response:",
      response.status,
      result
    );


    if (
      !response.ok
    ) {

      throw new Error(
        result.error ||
        `Server error (${response.status}).`
      );

    }


    if (
      !result.success
    ) {

      throw new Error(
        result.error ||
        "Unable to start earning."
      );

    }


    if (
      !result.session ||
      !result.session.ends_at
    ) {

      throw new Error(
        "The server did not return a valid earning session."
      );

    }


    /*
     * Server is authoritative.
     */

    startCountdown(
      result.session
    );


    successHaptic();


  } catch (error) {

    console.error(
      "Start earning error:",
      error
    );


    showStartButton();


    errorHaptic();


    showTelegramAlert(
      error?.message ||
      "Unable to start earning."
    );


  } finally {

    startRequestRunning =
    false;

  }

}


/* =========================================================
   CLAIM EARNING
========================================================= */

async function claimEarning() {

  if (!tg) {

    showTelegramAlert(
      "Please open BTTC Earn inside Telegram."
    );

    return;

  }


  if (
    !tg.initData
  ) {

    showTelegramAlert(
      "Telegram authentication data is unavailable."
    );

    return;

  }


  if (
    claimRequestRunning
  ) {

    return;

  }


  claimRequestRunning =
  true;


  mediumHaptic();


  if (startButton) {

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
        method:
        "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({
          initData:
          tg.initData
        })
      }
    );