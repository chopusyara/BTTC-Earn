/* =========================================================
   BTTC EARN — REFERRAL.JS
   LINK-ONLY REFERRAL SYSTEM
   ========================================================= */

const BOT_USERNAME = "BTTC_Earnbot";

const REFERRAL_REWARD = 3333;

const SUPABASE_FUNCTION_BASE =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1";

const PROCESS_REFERRAL_FUNCTION =
`${SUPABASE_FUNCTION_BASE}/process-referral`;

const REFERRAL_DATA_FUNCTION =
`${SUPABASE_FUNCTION_BASE}/referral-data`;


/* =========================================================
   TELEGRAM
   ========================================================= */

function getTelegramWebApp() {

  if (
    window.Telegram &&
    window.Telegram.WebApp
  ) {
    return window.Telegram.WebApp;
  }

  return null;
}


/* =========================================================
   GET TELEGRAM USER
   ========================================================= */

function getTelegramUser() {

  const telegram =
  getTelegramWebApp();

  if (!telegram) {
    return null;
  }

  return (
    telegram.initDataUnsafe &&
    telegram.initDataUnsafe.user
  )
  ? telegram.initDataUnsafe.user: null;
}


/* =========================================================
   CREATE REFERRAL LINK
   ========================================================= */

function createReferralLink(
  telegramId
) {

  return (
    `https://t.me/${BOT_USERNAME}` +
    `?startapp=${telegramId}`
  );

}


/* =========================================================
   GET REFERRAL LINK ELEMENT
   ========================================================= */

function getReferralLinkElement() {

  return document.getElementById(
    "referralLink"
  );

}


/* =========================================================
   DISPLAY PERSONAL REFERRAL LINK
   ========================================================= */

function displayReferralLink() {

  const element =
  getReferralLinkElement();


  if (!element) {

    console.log(
      "Referral link element not found yet."
    );

    return false;

  }


  const user =
  getTelegramUser();


  if (!user) {

    element.textContent =
    "Open BTTC Earn inside Telegram";

    console.log(
      "Telegram user not available yet."
    );

    return false;

  }


  const link =
  createReferralLink(
    user.id
  );


  /*
     * IMPORTANT:
     *
     * If referralLink is an input,
     * put the link in .value.
     *
     * If it is a div/span,
     * use .textContent.
     */

  if (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA"
  ) {

    element.value = link;

  } else {

    element.textContent = link;

  }


  element.setAttribute(
    "data-referral-link",
    link
  );


  element.setAttribute(
    "title",
    link
  );


  console.log(
    "BTTC referral link:",
    link
  );


  return true;

}


/* =========================================================
   COPY REFERRAL LINK
   ========================================================= */

async function copyReferralLink() {

  const user =
  getTelegramUser();


  if (!user) {

    showReferralMessage(
      "Open BTTC Earn inside Telegram first.",
      "error"
    );

    return;

  }


  const link =
  createReferralLink(
    user.id
  );


  try {

    await navigator.clipboard.writeText(
      link
    );


    showReferralMessage(
      "Referral link copied!",
      "success"
    );


    const telegram =
    getTelegramWebApp();


    if (
      telegram &&
      telegram.HapticFeedback
    ) {

      telegram.HapticFeedback.notificationOccurred(
        "success"
      );

    }

  } catch (error) {

    console.error(
      "Clipboard error:",
      error
    );


    /*
         * Fallback
         */

    const textarea =
    document.createElement(
      "textarea"
    );


    textarea.value =
    link;


    textarea.style.position =
    "fixed";

    textarea.style.left =
    "-9999px";


    document.body.appendChild(
      textarea
    );


    textarea.select();


    try {

      document.execCommand(
        "copy"
      );


      showReferralMessage(
        "Referral link copied!",
        "success"
      );

    } catch (copyError) {

      showReferralMessage(
        "Unable to copy referral link.",
        "error"
      );

    }


    textarea.remove();

  }

}


/* =========================================================
   SHARE REFERRAL LINK
   ========================================================= */

function shareReferralLink() {

  const user =
  getTelegramUser();


  if (!user) {

    showReferralMessage(
      "Open BTTC Earn inside Telegram first.",
      "error"
    );

    return;

  }


  const link =
  createReferralLink(
    user.id
  );


  const text =
  "🚀 Join BTTC Earn and start earning BTTC!";


  const shareUrl =
  "https://t.me/share/url" +
  "?url=" +
  encodeURIComponent(link) +
  "&text=" +
  encodeURIComponent(text);


  const telegram =
  getTelegramWebApp();


  if (
    telegram &&
    typeof telegram.openTelegramLink ===
    "function"
  ) {

    telegram.openTelegramLink(
      shareUrl
    );

  } else {

    window.open(
      shareUrl,
      "_blank"
    );

  }

}


/* =========================================================
   PROCESS INCOMING REFERRAL
   ========================================================= */

async function processIncomingReferral() {

  const telegram =
  getTelegramWebApp();


  const user =
  getTelegramUser();


  if (
    !telegram ||
    !user
  ) {

    return;

  }


  if (!telegram.initData) {

    console.log(
      "Telegram initData unavailable."
    );

    return;

  }


  let startParameter =
  telegram.initDataUnsafe &&
  telegram.initDataUnsafe.start_param;


  /*
     * URL fallback
     */

  if (!startParameter) {

    try {

      const url =
      new URL(
        window.location.href
      );


      startParameter =
      url.searchParams.get(
        "startapp"
      );

    } catch (error) {

      console.error(
        "URL parameter error:",
        error
      );

    }

  }


  if (!startParameter) {

    return;

  }


  const referrerTelegramId =
  Number(
    startParameter
  );


  if (
    !Number.isSafeInteger(
      referrerTelegramId
    ) ||
    referrerTelegramId <= 0
  ) {

    console.log(
      "Invalid referral parameter."
    );

    return;

  }


  /*
     * Self referral
     */

  if (
    referrerTelegramId ===
    Number(user.id)
  ) {

    console.log(
      "Self referral blocked."
    );

    return;

  }


  const attemptKey =
  `bttc_referral_${user.id}_${referrerTelegramId}`;


  if (
    localStorage.getItem(
      attemptKey
    )
  ) {

    return;

  }


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
          telegram.initData,

          referrerTelegramId:
          referrerTelegramId

        })

      }
    );


    const result =
    await response.json();


    console.log(
      "Referral processing:",
      result
    );


    localStorage.setItem(
      attemptKey,
      "1"
    );


    if (
      response.ok &&
      result.success
    ) {

      showReferralMessage(
        "🎉 Referral successful! +3,333 BTTC",
        "success"
      );


      await loadReferralData();

    }

  } catch (error) {

    console.error(
      "Referral processing error:",
      error
    );

  }

}


/* =========================================================
   LOAD REFERRAL DATA
   ========================================================= */

async function loadReferralData() {

  const user =
  getTelegramUser();


  const telegram =
  getTelegramWebApp();


  if (
    !user ||
    !telegram
  ) {

    return;

  }


  try {

    const response =
    await fetch(
      REFERRAL_DATA_FUNCTION,
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          initData:
          telegram.initData,

          telegramId:
          user.id

        })

      }
    );


    const result =
    await response.json();


    console.log(
      "Referral data:",
      result
    );


    if (
      !response.ok ||
      !result.success
    ) {

      console.error(
        result.error ||
        "Referral data failed"
      );

      return;

    }


    updateReferralStatistics(
      result
    );


    updateLeaderboard(
      result.leaderboard || []
    );


  } catch (error) {

    console.error(
      "Referral data error:",
      error
    );

  }

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateReferralStatistics(
  data
) {

  const referrals =
  Number(
    data.total_referrals || 0
  );


  const earnings =
  Number(
    data.total_earnings || 0
  );


  const rank =
  data.your_rank || null;


  const totalReferrals =
  document.getElementById(
    "totalReferrals"
  );


  const totalEarnings =
  document.getElementById(
    "totalReferralEarnings"
  );


  const yourRank =
  document.getElementById(
    "yourReferralRank"
  );


  const yourCount =
  document.getElementById(
    "yourReferralCount"
  );


  if (totalReferrals) {

    totalReferrals.textContent =
    referrals.toLocaleString(
      "en-IN"
    );

  }


  if (totalEarnings) {

    totalEarnings.textContent =
    earnings.toLocaleString(
      "en-IN"
    );

  }


  if (yourRank) {

    yourRank.textContent =
    rank
    ? `#${rank}`: "#--";

  }


  if (yourCount) {

    yourCount.textContent =
    referrals.toLocaleString(
      "en-IN"
    );

  }

}


/* =========================================================
   LEADERBOARD
   ========================================================= */

function updateLeaderboard(
  leaderboard
) {

  const container =
  document.getElementById(
    "leaderboardList"
  );


  if (!container) {
    return;
  }


  if (
    !Array.isArray(
      leaderboard
    ) ||
    leaderboard.length === 0
  ) {

    container.innerHTML = `
    <div class="leaderboard-loading">
    No referral leaders yet.
    </div>
    `;

    return;

  }


  container.innerHTML =
  leaderboard
  .slice(0, 10)
  .map(
    (
      item,
      index
    ) => {

      const rank =
      Number(
        item.rank ||
        index + 1
      );


      const name =
      escapeHtml(
        item.first_name ||
        item.username ||
        "BTTC User"
      );


      const referrals =
      Number(
        item.referrals || 0
      );


      let medal;


      if (rank === 1) {

        medal = "🥇";

      } else if (
        rank === 2
      ) {

        medal = "🥈";

      } else if (
        rank === 3
      ) {

        medal = "🥉";

      } else {

        medal =
        rank;

      }


      return `
      <div class="leaderboard-item">

      <div class="leaderboard-position">
      ${medal}
      </div>

      <div class="leaderboard-user">
      ${name}
      </div>

      <div class="leaderboard-referrals">
      ${referrals}
      </div>

      </div>
      `;

    }
  )
  .join("");

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

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


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showReferralMessage(
  message,
  type
) {

  const old =
  document.querySelector(
    ".referral-toast"
  );


  if (old) {
    old.remove();
  }


  const toast =
  document.createElement(
    "div"
  );


  toast.className =
  `referral-toast ${type || ""}`;


  toast.textContent =
  message;


  document.body.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.classList.add(
        "hide"
      );


      setTimeout(
        () => {

          toast.remove();

        },
        300
      );

    },
    2500
  );

}


/* =========================================================
   CONNECT BUTTONS
   ========================================================= */

function connectReferralButtons() {

  const copyButton =
  document.getElementById(
    "copyReferral"
  );


  const shareButton =
  document.getElementById(
    "shareReferral"
  );


  if (
    copyButton &&
    !copyButton.dataset.connected
  ) {

    copyButton.addEventListener(
      "click",
      copyReferralLink
    );


    copyButton.dataset.connected =
    "true";

  }


  if (
    shareButton &&
    !shareButton.dataset.connected
  ) {

    shareButton.addEventListener(
      "click",
      shareReferralLink
    );


    shareButton.dataset.connected =
    "true";

  }

}


/* =========================================================
   INITIALIZE REFERRAL PAGE
   ========================================================= */

async function initializeReferralPage() {

  console.log(
    "Initializing BTTC Referral page..."
  );


  const telegram =
  getTelegramWebApp();


  if (telegram) {

    try {

      telegram.ready();
      telegram.expand();

    } catch (error) {

      console.error(
        "Telegram initialization:",
        error
      );

    }

  }


  /*
     * Wait briefly because the Referral
     * HTML may be injected dynamically.
     */

  let attempts = 0;


  const waitForPage =
  setInterval(
    async () => {

      attempts++;


      const linkElement =
      getReferralLinkElement();


      const user =
      getTelegramUser();


      connectReferralButtons();


      if (
        linkElement &&
        user
      ) {

        clearInterval(
          waitForPage
        );


        /*
                     * THIS IS THE IMPORTANT PART
                     */

        displayReferralLink();


        await processIncomingReferral();


        await loadReferralData();


        console.log(
          "Referral page initialized successfully."
        );


        return;

      }


      /*
                 * Stop after 10 seconds.
                 */

      if (
        attempts >= 50
      ) {

        clearInterval(
          waitForPage
        );


        console.log(
          "Referral page initialization timed out."
        );

      }

    },
    200
  );

}


/* =========================================================
   START
   ========================================================= */

initializeReferralPage();


/*
 * Expose initialization globally.
 *
 * Your main app can call this whenever
 * the Referral page is opened.
 */

window.initializeReferralPage =
initializeReferralPage;

window.displayReferralLink =
displayReferralLink;