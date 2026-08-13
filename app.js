/* =========================================================
   BTTC EARN — TELEGRAM MINI APP
   COMPLETE APP.JS REPLACEMENT

   Fixes:
   - Telegram name / ID load immediately
   - Telegram avatar fallback
   - BTTC / USDT balance refresh
   - START button click handler
   - 15-minute earning countdown
   - Claim flow
   - Session restore after reload
   - Bottom navigation
   - Referral page navigation
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


/* =========================================================
   TELEGRAM
   ========================================================= */

const tg = window.Telegram?.WebApp || null;

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
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

let userName;
let telegramId;
let userAvatar;
let avatarFallback;
let copyButton;
let usdtBalance;
let bttcBalance;
let startButton;
let earningButtonText;
let earningStatus;


/* =========================================================
   SETTINGS
   ========================================================= */

const EARNING_STORAGE_KEY = "bttc_earning_session";

let currentUser = null;
let earningSession = null;
let earningTimer = null;
let startRequestRunning = false;
let claimRequestRunning = false;


/* =========================================================
   DEFAULT VALUES
   ========================================================= */

const DEFAULT_EARNING_DURATION = 15 * 60 * 1000;

const DEFAULT_REWARD = 1;

const REFERRAL_REWARD = 3333;


/* =========================================================
   SAFE JSON
   ========================================================= */

async function readJson(response) {
  try {
    return await response.json();
  } catch (_) {
    return {};
  }
}


/* =========================================================
   TELEGRAM INIT DATA
   ========================================================= */

function getTelegramInitData() {
  if (
    tg &&
    typeof tg.initData === "string" &&
    tg.initData.trim()
  ) {
    return tg.initData;
  }

  return "";
}


/* =========================================================
   TELEGRAM USER
   ========================================================= */

function getTelegramUser() {
  if (!tg || !tg.initDataUnsafe) {
    return null;
  }

  return tg.initDataUnsafe.user || null;
}


/* =========================================================
   USER NAME
   ========================================================= */

function getTelegramDisplayName(user) {
  if (!user) {
    return "User";
  }

  const firstName =
  typeof user.first_name === "string"
  ? user.first_name.trim(): "";

  const lastName =
  typeof user.last_name === "string"
  ? user.last_name.trim(): "";

  const username =
  typeof user.username === "string"
  ? user.username.trim(): "";

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  if (username) {
    return `@${username}`;
  }

  return "User";
}


/* =========================================================
   UPDATE NAME
   ========================================================= */

function updateName(user) {
  const name = getTelegramDisplayName(user);

  if (userName) {
    userName.textContent = name;
  }

  const nameElements =
  document.querySelectorAll(
    "[data-user-name], .user-name, #userName"
  );

  nameElements.forEach((element) => {
    element.textContent = name;
  });
}


/* =========================================================
   UPDATE TELEGRAM ID
   ========================================================= */

function updateTelegramId(user) {
  const id =
  user?.id ||
  currentUser?.telegram_id ||
  "";

  if (!id) {
    return;
  }

  if (telegramId) {
    telegramId.textContent = String(id);
  }

  const idElements =
  document.querySelectorAll(
    "[data-telegram-id], .telegram-id, #telegramId"
  );

  idElements.forEach((element) => {
    element.textContent = String(id);
  });
}


/* =========================================================
   AVATAR
   ========================================================= */

function setAvatar(url, user) {
  const fallbackLetter =
  getTelegramDisplayName(user)
  .charAt(0)
  .toUpperCase() || "U";

  const avatarImages =
  document.querySelectorAll(
    "img[data-user-avatar], #userAvatar, .user-avatar img"
  );

  if (url) {
    avatarImages.forEach((image) => {
      image.src = url;

      image.onerror = () => {
        image.style.display = "none";
        showAvatarFallback(fallbackLetter);
      };

      image.style.display = "";
    });
  } else {
    avatarImages.forEach((image) => {
      image.style.display = "none";
    });

    showAvatarFallback(fallbackLetter);
  }

  if (userAvatar && url) {
    userAvatar.src = url;

    userAvatar.onerror = () => {
      userAvatar.style.display = "none";
      showAvatarFallback(fallbackLetter);
    };

    userAvatar.style.display = "";
  }
}


/* =========================================================
   AVATAR FALLBACK
   ========================================================= */

function showAvatarFallback(letter) {
  const fallbacks =
  document.querySelectorAll(
    "[data-avatar-fallback], #avatarFallback, .avatar-fallback"
  );

  fallbacks.forEach((element) => {
    element.textContent = letter;
    element.style.display = "flex";
  });

  if (avatarFallback) {
    avatarFallback.textContent = letter;
    avatarFallback.style.display = "flex";
  }
}


/* =========================================================
   UPDATE BALANCES
   ========================================================= */

function updateBalanceUI(userData) {
  if (!userData) {
    return;
  }

  const bttc =
  userData.balance_bttc ??
  userData.bttc_balance ??
  userData.balanceBTTC ??
  0;

  const usdt =
  userData.balance_usdt ??
  userData.usdt_balance ??
  userData.balanceUSDT ??
  0;

  const formattedBttc =
  formatNumber(bttc);

  const formattedUsdt =
  formatNumber(usdt);

  if (bttcBalance) {
    bttcBalance.textContent =
    formattedBttc;
  }

  if (usdtBalance) {
    usdtBalance.textContent =
    formattedUsdt;
  }

  document
  .querySelectorAll(
    "[data-bttc-balance], #bttcBalance, .bttc-balance"
  )
  .forEach((element) => {
    element.textContent =
    formattedBttc;
  });

  document
  .querySelectorAll(
    "[data-usdt-balance], #usdtBalance, .usdt-balance"
  )
  .forEach((element) => {
    element.textContent =
    formattedUsdt;
  });
}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 8
    }
  );
}


/* =========================================================
   LOAD USER FROM SUPABASE
   ========================================================= */

async function loadUser() {
  const initData =
  getTelegramInitData();

  const telegramUser =
  getTelegramUser();

  /*
   * Show Telegram information immediately.
   */

  if (telegramUser) {
    updateName(telegramUser);
    updateTelegramId(telegramUser);

    setAvatar(
      telegramUser.photo_url || "",
      telegramUser
    );
  }

  /*
   * Mini App must provide initData.
   */

  if (!initData) {
    console.warn(
      "Telegram initData is not available."
    );

    return;
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
          initData
        })
      }
    );

    const data =
    await readJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
        "Unable to load Telegram user"
      );
    }

    currentUser =
    data.user ||
    data.data ||
    data;

    updateName(
      telegramUser ||
      currentUser
    );

    updateTelegramId(
      telegramUser ||
      currentUser
    );

    const photoUrl =
    currentUser.photo_url ||
    currentUser.avatar_url ||
    telegramUser?.photo_url ||
    "";

    setAvatar(
      photoUrl,
      telegramUser ||
      currentUser
    );

    updateBalanceUI(
      currentUser
    );

    /*
     * Some versions of the backend return
     * balances outside the user object.
     */

    if (
      data.balance_bttc !== undefined ||
      data.balance_usdt !== undefined
    ) {
      updateBalanceUI( {
        ...currentUser,
        balance_bttc:
        data.balance_bttc ??
        currentUser?.balance_bttc,

        balance_usdt:
        data.balance_usdt ??
        currentUser?.balance_usdt
      });
    }

  } catch (error) {
    console.error(
      "loadUser error:",
      error
    );
  }
}


/* =========================================================
   REFRESH USER
   ========================================================= */

async function refreshUser() {
  await loadUser();
}


/* =========================================================
   START EARNING
   ========================================================= */

async function startEarning() {
  if (startRequestRunning) {
    return;
  }

  if (earningSession) {
    return;
  }

  const initData =
  getTelegramInitData();

  if (!initData) {
    showEarningStatus(
      "Open BTTC Earn inside Telegram."
    );

    return;
  }

  startRequestRunning = true;

  setStartButtonLoading(
    true
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
          initData
        })
      }
    );

    const data =
    await readJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
        "Unable to start Mining"
      );
    }

    /*
     * Backend may return different
     * field names depending on version.
     */

    const startTime =
    data.start_time ||
    data.started_at ||
    data.startTime ||
    new Date().toISOString();

    const endTime =
    data.end_time ||
    data.ends_at ||
    data.endTime ||
    new Date(
      Date.now() +
      DEFAULT_EARNING_DURATION
    ).toISOString();

    const reward =
    Number(
      data.reward ??
      data.reward_bttc ??
      DEFAULT_REWARD
    );

    earningSession = {
      startTime,
      endTime,
      reward,
      sessionId:
      data.session_id ||
      data.id ||
      null
    };

    saveEarningSession();

    startEarningTimer();

    showEarningStatus(
      "Mining started!"
    );

  } catch (error) {
    console.error(
      " Start Mining error:",
      error
    );

    /*
     * If the backend is temporarily unavailable,
     * do not create a fake earning session.
     */

    showEarningStatus(
      error?.message ||
      "Unable to start Mining"
    );

  } finally {
    startRequestRunning = false;

    setStartButtonLoading(
      false
    );
  }
}


/* =========================================================
   CLAIM EARNING
   ========================================================= */

async function claimEarning() {
  if (claimRequestRunning) {
    return;
  }

  if (!earningSession) {
    return;
  }

  const initData =
  getTelegramInitData();

  if (!initData) {
    showEarningStatus(
      "Open BTTC Earn inside Telegram."
    );

    return;
  }

  claimRequestRunning = true;

  setStartButtonLoading(
    true
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
          initData,

          sessionId:
          earningSession.sessionId,

          session_id:
          earningSession.sessionId,

          reward:
          earningSession.reward
        })
      }
    );

    const data =
    await readJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
        "Unable to claim earning"
      );
    }

    const claimedReward =
    Number(
      data.reward ??
      data.reward_bttc ??
      earningSession.reward ??
      DEFAULT_REWARD
    );

    /*
     * Update returned balance immediately
     * when backend provides it.
     */

    if (
      data.balance_bttc !== undefined ||
      data.new_balance_bttc !== undefined ||
      data.balance !== undefined
    ) {
      updateBalanceUI( {
        balance_bttc:
        data.balance_bttc ??
        data.new_balance_bttc ??
        data.balance,

        balance_usdt:
        data.balance_usdt ??
        currentUser?.balance_usdt ??
        0
      });
    }

    earningSession = null;

    clearEarningSession();

    stopEarningTimer();

    updateEarningButton();

    showEarningStatus(
      `Claimed ${formatNumber(
        claimedReward
      )} BTTC`
    );

    /*
     * Reload complete user data after claim.
     */

    await refreshUser();

  } catch (error) {
    console.error(
      "claimEarning error:",
      error
    );

    showEarningStatus(
      error?.message ||
      "Unable to claim earning"
    );

  } finally {
    claimRequestRunning = false;

    setStartButtonLoading(
      false
    );
  }
}


/* =========================================================
   START BUTTON
   ========================================================= */

function handleEarningButton() {
  if (startRequestRunning ||
    claimRequestRunning) {
    return;
  }

  if (earningSession) {
    const end =
    new Date(
      earningSession.endTime
    ).getTime();

    if (Date.now() >= end) {
      claimEarning();
      return;
    }

    showEarningStatus(
      "Earning is already running."
    );

    return;
  }

  startEarning();
}


/* =========================================================
   SET BUTTON LOADING
   ========================================================= */

function setStartButtonLoading(
  loading
) {
  if (!startButton) {
    return;
  }

  startButton.disabled =
  loading;

  if (loading) {
    setButtonText(
      "PLEASE WAIT..."
    );
  } else {
    updateEarningButton();
  }
}


/* =========================================================
   BUTTON TEXT
   ========================================================= */

function setButtonText(text) {
  if (earningButtonText) {
    earningButtonText.textContent =
    text;
  }

  if (startButton) {
    /*
     * If the button itself is a text button,
     * update its text without destroying
     * child elements unnecessarily.
     */

    if (
      startButton.children.length === 0
    ) {
      startButton.textContent =
      text;
    }
  }

  document
  .querySelectorAll(
    "[data-earning-button-text]"
  )
  .forEach((element) => {
    element.textContent =
    text;
  });
}


/* =========================================================
   UPDATE EARNING BUTTON
   ========================================================= */

function updateEarningButton() {
  if (!startButton) {
    return;
  }

  if (startRequestRunning ||
    claimRequestRunning) {
    return;
  }

  if (!earningSession) {
    setButtonText("START");

    startButton.classList.remove(
      "earning-active",
      "earning-complete"
    );

    startButton.disabled =
    false;

    return;
  }

  const end =
  new Date(
    earningSession.endTime
  ).getTime();

  const remaining =
  end - Date.now();

  if (remaining <= 0) {
    setButtonText(
      "CLAIM BTTC"
    );

    startButton.classList.add(
      "earning-complete"
    );

    startButton.classList.remove(
      "earning-active"
    );

    startButton.disabled =
    false;

    return;
  }

  setButtonText(
    `EARNING ${formatTime(
      remaining
    )}`
  );

  startButton.classList.add(
    "earning-active"
  );

  startButton.classList.remove(
    "earning-complete"
  );

  startButton.disabled =
  false;
}


/* =========================================================
   EARNING TIMER
   ========================================================= */

function startEarningTimer() {
  stopEarningTimer();

  updateEarningButton();

  earningTimer =
  setInterval(() => {
    if (!earningSession) {
      stopEarningTimer();
      updateEarningButton();
      return;
    }

    const end =
    new Date(
      earningSession.endTime
    ).getTime();

    const remaining =
    end - Date.now();

    if (remaining <= 0) {
      stopEarningTimer();

      updateEarningButton();

      showEarningStatus(
        "Your earning is ready to claim."
      );

      return;
    }

    updateEarningButton();

  },
    1000);
}


/* =========================================================
   STOP TIMER
   ========================================================= */

function stopEarningTimer() {
  if (earningTimer) {
    clearInterval(
      earningTimer
    );

    earningTimer = null;
  }
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(milliseconds) {
  const totalSeconds =
  Math.max(
    0,
    Math.floor(
      milliseconds / 1000
    )
  );

  const minutes =
  Math.floor(
    totalSeconds / 60
  );

  const seconds =
  totalSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}


/* =========================================================
   EARNING STATUS
   ========================================================= */

function showEarningStatus(message) {
  if (earningStatus) {
    earningStatus.textContent =
    message;

    earningStatus.style.display =
    "block";
  }

  document
  .querySelectorAll(
    "[data-earning-status], #earningStatus, .earning-status"
  )
  .forEach((element) => {
    element.textContent =
    message;

    element.style.display =
    "block";
  });
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveEarningSession() {
  if (!earningSession) {
    return;
  }

  try {
    localStorage.setItem(
      EARNING_STORAGE_KEY,
      JSON.stringify(
        earningSession
      )
    );
  } catch (error) {
    console.warn(
      "Unable to save earning session:",
      error
    );
  }
}


/* =========================================================
   LOAD SESSION
   ========================================================= */

function loadEarningSession() {
  try {
    const raw =
    localStorage.getItem(
      EARNING_STORAGE_KEY
    );

    if (!raw) {
      return;
    }

    const session =
    JSON.parse(raw);

    if (
      !session ||
      !session.endTime
    ) {
      clearEarningSession();
      return;
    }

    const end =
    new Date(
      session.endTime
    ).getTime();

    if (!Number.isFinite(end)) {
      clearEarningSession();
      return;
    }

    earningSession =
    session;

    if (
      Date.now() < end
    ) {
      startEarningTimer();
    } else {
      updateEarningButton();
    }

  } catch (error) {
    console.warn(
      "Unable to restore earning session:",
      error
    );

    clearEarningSession();
  }
}


/* =========================================================
   CLEAR SESSION
   ========================================================= */

function clearEarningSession() {
  earningSession =
  null;

  try {
    localStorage.removeItem(
      EARNING_STORAGE_KEY
    );
  } catch (_) {}
}


/* =========================================================
   COPY REFERRAL LINK
   ========================================================= */

async function copyReferralLink() {
  const input =
  document.querySelector(
    "#referralLink, [data-referral-link]"
  );

  const value =
  input?.value ||
  input?.textContent ||
  "";

  if (!value ||
    value.includes(
      "Loading"
    )) {
    showToast(
      "Referral link is not ready yet."
    );

    return;
  }

  try {
    await navigator.clipboard.writeText(
      value.trim()
    );

    showToast(
      "Referral link copied!"
    );

  } catch (_) {
    /*
     * Fallback for older WebViews.
     */

    try {
      const textarea =
      document.createElement(
        "textarea"
      );

      textarea.value =
      value.trim();

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

      showToast(
        "Referral link copied!"
      );

    } catch (error) {
      console.error(
        "Copy referral link error:",
        error
      );

      showToast(
        "Unable to copy link."
      );
    }
  }
}


/* =========================================================
   SHARE REFERRAL LINK
   ========================================================= */

async function shareReferralLink() {
  const input =
  document.querySelector(
    "#referralLink, [data-referral-link]"
  );

  const value =
  input?.value ||
  input?.textContent ||
  "";

  if (!value ||
    value.includes(
      "Loading"
    )) {
    showToast(
      "Referral link is not ready yet."
    );

    return;
  }

  const shareText =
  "Join BTTC Earn using my referral link!";

  /*
   * Telegram native share.
   */

  if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
  ) {
    const url =
    `https://t.me/share/url?url=${encodeURIComponent(
      value.trim()
    )}&text=${encodeURIComponent(
      shareText
    )}`;

    try {
      tg.openTelegramLink(url);
      return;
    } catch (_) {}
  }

  /*
   * Web Share API.
   */

  if (
    navigator.share
  ) {
    try {
      await navigator.share({
        title:
        "BTTC Earn",

        text:
        shareText,

        url:
        value.trim()
      });

      return;

    } catch (_) {}
  }

  /*
   * Fallback to copy.
   */

  await copyReferralLink();
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  let toast =
  document.getElementById(
    "bttcToast"
  );

  if (!toast) {
    toast =
    document.createElement(
      "div"
    );

    toast.id =
    "bttcToast";

    toast.style.position =
    "fixed";

    toast.style.left =
    "50%";

    toast.style.bottom =
    "90px";

    toast.style.transform =
    "translateX(-50%)";

    toast.style.zIndex =
    "99999";

    toast.style.padding =
    "12px 18px";

    toast.style.borderRadius =
    "12px";

    toast.style.background =
    "rgba(20,10,40,.95)";

    toast.style.color =
    "#fff";

    toast.style.fontSize =
    "14px";

    toast.style.border =
    "1px solid rgba(160,80,255,.6)";

    toast.style.boxShadow =
    "0 0 25px rgba(140,50,255,.4)";

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
  message;

  toast.style.display =
  "block";

  clearTimeout(
    toast._timer
  );

  toast._timer =
  setTimeout(() => {
    toast.style.display =
    "none";
  }, 2500);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
  document
  .querySelectorAll(
    ".nav-item, [data-page]"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const page =
        button.dataset.page;

        if (!page) {
          return;
        }

        navigateToPage(
          page
        );
      }
    );
  });
}


/* =========================================================
   NAVIGATE PAGE
   ========================================================= */

function navigateToPage(page) {
  /*
   * Existing application navigation
   * is respected first.
   */

  if (
    typeof window.showPage ===
    "function"
  ) {
    try {
      window.showPage(
        page
      );
      updateNavigationState(
        page
      );
      return;
    } catch (_) {}
  }

  if (
    typeof window.navigateTo ===
    "function"
  ) {
    try {
      window.navigateTo(
        page
      );
      updateNavigationState(
        page
      );
      return;
    } catch (_) {}
  }

  /*
   * Generic page switching.
   */

  const pages =
  document.querySelectorAll(
    "[data-page-content], .page"
  );

  let found =
  false;

  pages.forEach((element) => {
    const elementPage =
    element.dataset.page ||
    element.id?.replace(
      /Page$/,
      ""
    );

    if (
      elementPage === page
    ) {
      element.style.display =
      "";

      found =
      true;
    } else {
      element.style.display =
      "none";
    }
  });

  updateNavigationState(
    page
  );

  /*
   * Referral page can also be loaded
   * through referral.html if present.
   */

  if (
    !found &&
    page === "referrals"
  ) {
    const referralPage =
    document.getElementById(
      "referralsPage"
    );

    if (referralPage) {
      referralPage.style.display =
      "";
    }
  }
}


/* =========================================================
   NAVIGATION STATE
   ========================================================= */

function updateNavigationState(
  activePage
) {
  document
  .querySelectorAll(
    ".nav-item, [data-page]"
  )
  .forEach((button) => {
    const page =
    button.dataset.page;

    if (
      page === activePage
    ) {
      button.classList.add(
        "active"
      );
    } else {
      button.classList.remove(
        "active"
      );
    }
  });
}


/* =========================================================
   BIND DOM ELEMENTS
   ========================================================= */

function bindElements() {
  userName =
  document.getElementById(
    "userName"
  );

  telegramId =
  document.getElementById(
    "telegramId"
  );

  userAvatar =
  document.getElementById(
    "userAvatar"
  );

  avatarFallback =
  document.getElementById(
    "avatarFallback"
  );

  copyButton =
  document.getElementById(
    "copyReferral"
  );

  usdtBalance =
  document.getElementById(
    "usdtBalance"
  );

  bttcBalance =
  document.getElementById(
    "bttcBalance"
  );

  startButton =
  document.getElementById(
    "startButton"
  );

  earningButtonText =
  document.getElementById(
    "earningButtonText"
  );

  earningStatus =
  document.getElementById(
    "earningStatus"
  );


  /*
   * Support alternate START button IDs.
   */

  if (!startButton) {
    startButton =
    document.querySelector(
      "#startEarning, .start-button, [data-action='start-earning']"
    );
  }


  /*
   * Support alternate balance IDs.
   */

  if (!bttcBalance) {
    bttcBalance =
    document.querySelector(
      "[data-bttc-balance], .bttc-balance"
    );
  }

  if (!usdtBalance) {
    usdtBalance =
    document.querySelector(
      "[data-usdt-balance], .usdt-balance"
    );
  }


  /*
   * Support alternate name elements.
   */

  if (!userName) {
    userName =
    document.querySelector(
      "[data-user-name], .user-name"
    );
  }


  /*
   * Support alternate Telegram ID.
   */

  if (!telegramId) {
    telegramId =
    document.querySelector(
      "[data-telegram-id], .telegram-id"
    );
  }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {
  /*
   * START / CLAIM button.
   */

  if (startButton) {
    startButton.addEventListener(
      "click",
      handleEarningButton
    );
  }


  /*
   * Referral copy button.
   */

  if (copyButton) {
    copyButton.addEventListener(
      "click",
      copyReferralLink
    );
  }


  /*
   * Support data action copy.
   */

  document
  .querySelectorAll(
    "[data-action='copy-referral']"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      copyReferralLink
    );
  });


  /*
   * Referral share.
   */

  document
  .querySelectorAll(
    "[data-action='share-referral']"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      shareReferralLink
    );
  });


  /*
   * Navigation.
   */

  setupNavigation();
}


/* =========================================================
   PREVENT BUTTON FORM SUBMIT
   ========================================================= */

function preventUnexpectedSubmit() {
  document
  .querySelectorAll(
    "button"
  )
  .forEach((button) => {
    if (
      button.type !==
      "button"
    ) {
      /*
         * Do not change explicit submit
         * buttons belonging to forms.
         */
      if (
        button === startButton
      ) {
        button.type =
        "button";
      }
    }
  });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeApp() {
  bindElements();

  preventUnexpectedSubmit();

  setupEventListeners();

  /*
   * Restore earning session first so the
   * START button immediately has the correct state.
   */

  loadEarningSession();

  updateEarningButton();

  /*
   * Load Telegram information immediately.
   */

  const telegramUser =
  getTelegramUser();

  if (telegramUser) {
    updateName(
      telegramUser
    );

    updateTelegramId(
      telegramUser
    );

    setAvatar(
      telegramUser.photo_url ||
      "",
      telegramUser
    );
  }

  /*
   * Then load server-side account data.
   */

  await loadUser();

  /*
   * Refresh button state after user loading.
   */

  updateEarningButton();
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
}


/* =========================================================
   TELEGRAM VIEWPORT
   ========================================================= */

window.addEventListener(
  "resize",
  () => {
    try {
      tg?.expand();
    } catch (_) {}
  }
);


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {
    if (
      !document.hidden
    ) {
      /*
       * Recalculate timer immediately
       * when user returns to the Mini App.
       */

      if (earningSession) {
        const end =
        new Date(
          earningSession.endTime
        ).getTime();

        if (
          Date.now() >= end
        ) {
          stopEarningTimer();
        } else if (
          !earningTimer
        ) {
          startEarningTimer();
        }

        updateEarningButton();
      }

      /*
       * Refresh account data when returning.
       */

      refreshUser();
    }
  }
);


/* =========================================================
   EXPORT HELPERS
   ========================================================= */

window.BTTCApp = {
  loadUser,
  refreshUser,
  startEarning,
  claimEarning,
  copyReferralLink,
  shareReferralLink,
  navigateToPage,
  showToast
};