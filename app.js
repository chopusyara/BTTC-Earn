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

/* =========================================
   TELEGRAM
========================================= */

const tg = window.Telegram?.WebApp || null;

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

const userName = document.getElementById("userName");

const telegramId = document.getElementById("telegramId");

const userAvatar = document.getElementById("userAvatar");

const avatarFallback = document.getElementById("avatarFallback");

const copyButton = document.getElementById("copyId");

const usdtBalance = document.getElementById("usdtBalance");

const bttcBalance = document.getElementById("bttcBalance");

const startButton = document.getElementById("startEarning");

const earningButtonText = document.getElementById("earningButtonText");

const earningStatus = document.getElementById("earningStatus");

/* =========================================
   EARNING SETTINGS
========================================= */

const EARNING_DURATION_SECONDS = 15 * 60;

const EARNING_REWARD = 1000;

const EARNING_STORAGE_KEY = "bttc_earning_session";

let currentUser = null;

let earningTimer = null;

let earningSession = null;

/* =========================================
   BUTTON TEXT
========================================= */

function setButtonText(text) {
  if (earningButtonText) {
    earningButtonText.textContent = text;
  } else if (startButton) {
    startButton.textContent = text;
  }
}

/* =========================================
   STATUS TEXT
========================================= */

function setStatus(text) {
  if (earningStatus) {
    earningStatus.textContent = text || "";
  }
}

/* =========================================
   HAPTIC
========================================= */

function mediumHaptic() {
  try {
    tg?.HapticFeedback?.impactOccurred("medium");
  } catch (_) {}
}

function successHaptic() {
  try {
    tg?.HapticFeedback?.notificationOccurred("success");
  } catch (_) {}
}

/* =========================================
   PROFILE PHOTO
========================================= */

function setProfilePhoto(photoUrl) {
  if (!userAvatar) {
    return;
  }

  if (typeof photoUrl === "string" && photoUrl.trim() !== "") {
    userAvatar.src = photoUrl;

    userAvatar.style.display = "block";

    if (avatarFallback) {
      avatarFallback.style.display = "none";
    }

    userAvatar.onerror = function () {
      userAvatar.style.display = "none";

      if (avatarFallback) {
        avatarFallback.style.display = "flex";
      }
    };

    return;
  }

  userAvatar.style.display = "none";

  if (avatarFallback) {
    avatarFallback.style.display = "flex";
  }
}

/* =========================================
   DISPLAY USER
========================================= */

function displayUser(user) {
  if (!user) {
    return;
  }

  /* NAME */

  if (userName && user.first_name) {
    userName.textContent = user.first_name;
  }

  /* TELEGRAM ID */

  if (
    telegramId &&
    user.telegram_id !== undefined &&
    user.telegram_id !== null
  ) {
    telegramId.textContent = user.telegram_id;
  }

  /* USDT */

  if (
    usdtBalance &&
    user.balance_usdt !== undefined &&
    user.balance_usdt !== null
  ) {
    usdtBalance.textContent = Number(user.balance_usdt).toFixed(2);
  }

  /* BTTC */

  if (
    bttcBalance &&
    user.balance_bttc !== undefined &&
    user.balance_bttc !== null
  ) {
    bttcBalance.textContent = Number(user.balance_bttc).toLocaleString(
      "en-IN"
    );
  }

  /*
     * Prefer backend photo_url.
     * If backend doesn't return it,
     * use Telegram Mini App data.
     */

  let photoUrl = user.photo_url || "";

  if (!photoUrl && tg?.initDataUnsafe?.user?.photo_url) {
    photoUrl = tg.initDataUnsafe.user.photo_url;
  }

  setProfilePhoto(photoUrl);
}

/* =========================================
   LOAD TELEGRAM USER
========================================= */

async function loadTelegramUser() {
  if (!tg) {
    console.log("Telegram WebApp SDK unavailable.");

    return null;
  }

  const initData = tg.initData;

  if (!initData) {
    console.log("Telegram initData unavailable.");

    /*
         * Acode / normal browser preview
         * does not provide Telegram initData.
         */

    return null;
  }

  /*
     * Immediately display Telegram profile
     * information when available.
     *
     * This makes the profile image appear
     * even if the backend user table doesn't
     * contain photo_url.
     */

  const telegramPreviewUser = tg.initDataUnsafe?.user;

  if (telegramPreviewUser) {
    if (userName && telegramPreviewUser.first_name) {
      userName.textContent = telegramPreviewUser.first_name;
    }

    if (telegramId && telegramPreviewUser.id) {
      telegramId.textContent = telegramPreviewUser.id;
    }

    setProfilePhoto(telegramPreviewUser.photo_url);
  }

  try {
    const response = await fetch(TELEGRAM_USER_FUNCTION, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        initData: initData
      })
    });

    const result = await response.json();

    console.log("telegram-user response:", result);

    if (!response.ok || !result.success || !result.user) {
      console.error("Telegram user backend error:", result);

      return null;
    }

    const user = result.user;

    currentUser = user;

    displayUser(user);

    return user;
  } catch (error) {
    console.error("Telegram user connection error:", error);

    return null;
  }
}

/* =========================================
   UPDATE BTTC BALANCE
========================================= */

function updateBTTCBalance(balance) {
  if (!bttcBalance) {
    return;
  }

  bttcBalance.textContent = Number(balance).toLocaleString("en-IN");
}

/* =========================================
   LOCAL SESSION STORAGE
========================================= */

function saveEarningSession(session) {
  try {
    localStorage.setItem(EARNING_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Unable to save session:", error);
  }
}

function getSavedEarningSession() {
  try {
    const saved = localStorage.getItem(EARNING_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error("Unable to read saved session:", error);

    return null;
  }
}

function clearSavedEarningSession() {
  try {
    localStorage.removeItem(EARNING_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear saved session:", error);
  }
}

/* =========================================
   FORMAT TIME
========================================= */

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

/* =========================================
   STOP TIMER
========================================= */

function stopTimer() {
  if (earningTimer) {
    clearInterval(earningTimer);

    earningTimer = null;
  }
}

/* =========================================
   CLAIM MODE
========================================= */

function setClaimMode(enabled) {
  if (!startButton) {
    return;
  }

  startButton.dataset.mode = enabled ? "claim": "start";
}

/* =========================================
   SHOW CLAIM BUTTON
========================================= */

function showClaimButton() {
  stopTimer();

  setClaimMode(true);

  setButtonText("CLAIM BTTC");

  if (startButton) {
    startButton.disabled = false;

    startButton.classList.add("claim-ready");
  }
}

/* =========================================
   SHOW START BUTTON
========================================= */

function showStartButton() {
  stopTimer();

  setClaimMode(false);

  setButtonText("START");

  if (startButton) {
    startButton.disabled = false;

    startButton.classList.remove("claim-ready");
  }

  setStatus("");
}

/* =========================================
   COUNTDOWN
========================================= */

function startCountdown(session) {
  if (!session || !session.ends_at) {
    showStartButton();

    return;
  }

  earningSession = session;

  saveEarningSession(session);

  stopTimer();

  setClaimMode(false);

  if (startButton) {
    startButton.disabled = true;

    startButton.classList.remove("claim-ready");
  }

  function update() {
    const endTime = new Date(session.ends_at).getTime();

    const now = Date.now();

    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

    if (remaining <= 0) {
      showClaimButton();

      return;
    }

    setButtonText(formatTime(remaining));
  }

  update();

  earningTimer = setInterval(update, 1000);
}

/* =========================================
   START EARNING
========================================= */

async function startEarning() {
  if (!tg) {
    alert("Please open BTTC Earn inside Telegram.");

    return;
  }

  if (!tg.initData) {
    alert("Telegram authentication data is unavailable.");

    return;
  }

  if (!currentUser) {
    alert("Please wait for your Telegram account to load.");

    return;
  }

  mediumHaptic();

  if (startButton) {
    startButton.disabled = true;
  }

  setClaimMode(false);

  setButtonText("Mining...");

  try {
    const response = await fetch(START_EARNING_FUNCTION, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        initData: tg.initData
      })
    });

    const result = await response.json();

    console.log("start-earning response:", result);

    if (!response.ok || !result.success || !result.session) {
      throw new Error(result.error || "Unable to start earning.");
    }

    /*
         * Server controls the session
         * start/end time.
         */

    startCountdown(result.session);
  } catch (error) {
    console.error("Start earning error:", error);

    showStartButton();

    alert(error.message || "Unable to start earning.");
  }
}

/* =========================================
   CLAIM EARNING
========================================= */

async function claimEarning() {
  if (!tg) {
    alert("Please open BTTC Earn inside Telegram.");

    return;
  }

  if (!tg.initData) {
    alert("Telegram authentication data is unavailable.");

    return;
  }

  mediumHaptic();

  if (startButton) {
    startButton.disabled = true;
  }

  setButtonText("+3333 BTTC");

  try {
    const response = await fetch(CLAIM_EARNING_FUNCTION, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        initData: tg.initData
      })
    });

    const result = await response.json();

    console.log("claim-earning response:", result);

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Unable to claim reward.");
    }

    /*
         * Backend is authoritative.
         */

    if (
      result.new_balance_bttc !== undefined &&
      result.new_balance_bttc !== null
    ) {
      updateBTTCBalance(result.new_balance_bttc);
    }

    clearSavedEarningSession();

    earningSession = null;

    successHaptic();

    /*
         * IMPORTANT:
         *
         * We do NOT automatically
         * start another session.
         *
         * User must tap Start Earning
         * again.
         */

    showStartButton();
  } catch (error) {
    console.error("Claim error:", error);

    /*
         * Allow retry if the server
         * timestamp was only slightly
         * ahead of the browser timer.
         */

    setClaimMode(true);

    setButtonText("CLAIM 1,000 BTTC");

    if (startButton) {
      startButton.disabled = false;

      startButton.classList.add("claim-ready");
    }

    setStatus("");

    alert(error.message || "Unable to claim reward.");
  }
}

/* =========================================
   START / CLAIM BUTTON
========================================= */

if (startButton) {
  startButton.addEventListener("click", async function () {
    /*
         * If timer has finished,
         * button is in CLAIM mode.
         */

    if (startButton.dataset.mode === "claim") {
      await claimEarning();

      return;
    }

    /*
         * Extra protection:
         * check visible button text.
         */

    const text = (
      earningButtonText?.textContent ||
      startButton.textContent ||
      ""
    ).toUpperCase();

    if (text.includes("CLAIM")) {
      await claimEarning();

      return;
    }

    /*
         * Normal START mode.
         */

    await startEarning();
  });
}

/* =========================================
   RESTORE SAVED SESSION
========================================= */

function restoreEarningSession() {
  const savedSession = getSavedEarningSession();

  if (!savedSession || !savedSession.ends_at) {
    showStartButton();

    return;
  }

  const endTime = new Date(savedSession.ends_at).getTime();

  if (Number.isNaN(endTime)) {
    clearSavedEarningSession();

    showStartButton();

    return;
  }

  /*
     * If the saved session has already
     * finished, show Claim immediately.
     */

  if (endTime <= Date.now()) {
    earningSession = savedSession;

    showClaimButton();

    return;
  }

  /*
     * Otherwise continue countdown.
     */
  startCountdown(savedSession);
}

/* =========================================
   COPY TELEGRAM ID
========================================= */

if (copyButton) {
  copyButton.addEventListener("click", async function () {
    const id = telegramId?.textContent?.trim();

    if (!id || id === "XXXXXXXXXX") {
      return;
    }

    try {
      await navigator.clipboard.writeText(id);

      try {
        tg?.HapticFeedback?.notificationOccurred("success");
      } catch (_) {}

      if (tg?.showPopup) {
        tg.showPopup({
          title: "Copied",

          message: "Telegram ID copied successfully.",

          buttons: [{
            type: "ok"
          }]
        });
      } else {
        alert("Telegram ID copied successfully.");
      }
    } catch (error) {
      console.error("Copy ID error:", error);

      /*
             * Clipboard fallback.
             */

      try {
        const textarea = document.createElement("textarea");

        textarea.value = id;

        textarea.style.position = "fixed";

        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        alert("Telegram ID copied successfully.");
      } catch (_) {
        alert("Unable to copy Telegram ID.");
      }
    }
  });
}

/* =========================================
   QUICK ACTIONS
========================================= */

const quickButtons = document.querySelectorAll(".quick-card");

quickButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const page = button.dataset.page;

    try {
      tg?.HapticFeedback?.selectionChanged();
    } catch (_) {}

    console.log("Quick page:", page);
  });
});

/* =========================================
   BOTTOM NAVIGATION
========================================= */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const page = item.dataset.page;

    navItems.forEach(function (nav) {
      nav.classList.remove("active");
    });

    item.classList.add("active");

    try {
      tg?.HapticFeedback?.selectionChanged();
    } catch (_) {}

    console.log("Navigation:", page);
  });
});

/* =========================================
   PREVENT DOUBLE-TAP ZOOM
========================================= */

let lastTouchEnd = 0;

document.addEventListener(
  "touchend",
  function (event) {
    const now = Date.now();

    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  },
  false
);

/* =========================================
   START APP
========================================= */

(async function () {
  /*
     * Load verified Telegram user
     * and backend balances.
     */

  currentUser = await loadTelegramUser();

  /*
     * Restore an active 15-minute
     * earning session after reload.
     */

  restoreEarningSession();
})();

/* =========================================
   READY
========================================= */

console.log("BTTC Earn loaded successfully.");