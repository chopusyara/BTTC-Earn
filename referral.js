/* =========================================================
   BTTC EARN — REFERRAL.JS
   LINK-ONLY REFERRAL SYSTEM
   REWARD: 3,333 BTTC
========================================================= */


/* =========================================================
   TELEGRAM
========================================================= */

const tg =
window.Telegram &&
window.Telegram.WebApp
? window.Telegram.WebApp: null;


/* =========================================================
   CONFIGURATION
========================================================= */

const BOT_USERNAME =
"BTTC_Earnbot";


const SUPABASE_FUNCTION_BASE =
"https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1";


const PROCESS_REFERRAL_FUNCTION =
`${SUPABASE_FUNCTION_BASE}/process-referral`;


const REFERRAL_DATA_FUNCTION =
`${SUPABASE_FUNCTION_BASE}/referral-data`;


const REFERRAL_REWARD =
3333;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const referralLink =
document.getElementById(
  "referralLink"
);


const copyReferral =
document.getElementById(
  "copyReferral"
);


const shareReferral =
document.getElementById(
  "shareReferral"
);


const totalReferrals =
document.getElementById(
  "totalReferrals"
);


const totalReferralEarnings =
document.getElementById(
  "totalReferralEarnings"
);


const leaderboardList =
document.getElementById(
  "leaderboardList"
);


const yourReferralRank =
document.getElementById(
  "yourReferralRank"
);


const yourReferralCount =
document.getElementById(
  "yourReferralCount"
);


/* =========================================================
   TELEGRAM INITIALIZATION
========================================================= */

if (tg) {

  try {

    tg.ready();

    tg.expand();

  } catch (error) {

    console.error(
      "Telegram initialization error:",
      error
    );

  }

}


/* =========================================================
   GET TELEGRAM USER
========================================================= */

function getTelegramUser() {

  if (!tg) {

    console.warn(
      "Telegram WebApp SDK unavailable."
    );

    return null;

  }


  const user =
  tg.initDataUnsafe &&
  tg.initDataUnsafe.user
  ? tg.initDataUnsafe.user: null;


  if (!user) {

    console.warn(
      "Telegram user unavailable."
    );

    return null;

  }


  return user;

}


/* =========================================================
   GET START PARAMETER
========================================================= */

function getStartParameter() {

  if (!tg) {
    return null;
  }


  /*
     * Telegram Mini Apps normally expose
     * the startapp value here.
     */

  const startParam =
  tg.initDataUnsafe &&
  tg.initDataUnsafe.start_param
  ? tg.initDataUnsafe.start_param: null;


  if (
    startParam &&
    String(startParam).trim()
  ) {

    return String(
      startParam
    ).trim();

  }


  /*
     * Fallback for Telegram environments
     * where the parameter is available
     * through the URL.
     */

  try {

    const url =
    new URL(
      window.location.href
    );


    const urlStart =
    url.searchParams.get(
      "startapp"
    );


    if (
      urlStart &&
      urlStart.trim()
    ) {

      return urlStart.trim();

    }

  } catch (error) {

    console.error(
      "Unable to read start parameter:",
      error
    );

  }


  return null;

}


/* =========================================================
   CREATE PERSONAL REFERRAL LINK
========================================================= */

function createReferralLink(
  telegramId
) {

  /*
     * No referral code.
     *
     * The Telegram ID is used only as
     * the startapp parameter.
     */

  return (
    `https://t.me/${BOT_USERNAME}` +
    `?startapp=${telegramId}`
  );

}


/* =========================================================
   DISPLAY REFERRAL LINK
========================================================= */

function displayReferralLink(
  telegramId
) {

  if (!referralLink) {
    return;
  }


  if (!telegramId) {

    referralLink.textContent =
    "Open BTTC Earn in Telegram";

    return;

  }


  const link =
  createReferralLink(
    telegramId
  );


  referralLink.textContent =
  link;


  referralLink.setAttribute(
    "title",
    link
  );

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


    /*
         * Telegram haptic feedback
         */

    if (
      tg &&
      tg.HapticFeedback
    ) {

      tg.HapticFeedback.notificationOccurred(
        "success"
      );

    }

  } catch (error) {

    console.error(
      "Copy referral link error:",
      error
    );


    /*
         * Fallback copy method
         */

    try {

      const textarea =
      document.createElement(
        "textarea"
      );


      textarea.value =
      link;


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


      showReferralMessage(
        "Referral link copied!",
        "success"
      );

    } catch (fallbackError) {

      console.error(
        "Fallback copy failed:",
        fallbackError
      );


      showReferralMessage(
        "Unable to copy the link.",
        "error"
      );

    }

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


  const shareText =
  "🚀 Join BTTC Earn and start earning BTTC!";


  /*
     * Telegram share URL
     */

  const telegramShareUrl =
  "https://t.me/share/url" +
  "?url=" +
  encodeURIComponent(link) +
  "&text=" +
  encodeURIComponent(
    shareText
  );


  if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
  ) {

    tg.openTelegramLink(
      telegramShareUrl
    );

    return;

  }


  window.open(
    telegramShareUrl,
    "_blank"
  );

}


/* =========================================================
   PROCESS INCOMING REFERRAL
========================================================= */

async function processIncomingReferral() {

  const user =
  getTelegramUser();


  if (!user) {

    console.log(
      "Referral processing skipped: Telegram user unavailable."
    );

    return;

  }


  const startParameter =
  getStartParameter();


  /*
     * No start parameter means this is
     * not a referral visit.
     */

  if (!startParameter) {

    console.log(
      "No incoming referral."
    );

    return;

  }


  /*
     * Telegram startapp contains the
     * referrer's Telegram ID.
     */

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

    console.error(
      "Invalid referral start parameter:",
      startParameter
    );

    return;

  }


  /*
     * Prevent self-referral.
     */

  if (
    referrerTelegramId ===
    Number(user.id)
  ) {

    console.log(
      "Self-referral ignored."
    );

    return;

  }


  /*
     * Prevent repeatedly calling the
     * function on every page load.
     *
     * The backend also protects against
     * duplicate referrals.
     */

  const referralAttemptKey =
  `bttc_referral_attempt_${user.id}_${referrerTelegramId}`;


  if (
    localStorage.getItem(
      referralAttemptKey
    )
  ) {

    console.log(
      "Referral already attempted from this link."
    );

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
          "application/json",
        },

        body: JSON.stringify({

          initData:
          tg.initData,

          referrerTelegramId:
          referrerTelegramId,

        }),
      }
    );


    const result =
    await response.json();


    console.log(
      "process-referral response:",
      result
    );


    /*
         * Mark the attempt so the frontend
         * does not repeatedly call it.
         *
         * The backend remains the real
         * protection against duplicate rewards.
         */

    localStorage.setItem(
      referralAttemptKey,
      "1"
    );


    if (
      !response.ok ||
      !result.success
    ) {

      /*
             * An already-processed referral
             * is not a frontend crash.
             */

      console.log(
        "Referral was not processed:",
        result.error
      );

      return;

    }


    /*
         * Successful referral.
         */

    showReferralMessage(
      `🎉 Referral successful! +${REFERRAL_REWARD.toLocaleString("en-IN")} BTTC`,
      "success"
    );


    /*
         * Haptic feedback.
         */

    if (
      tg &&
      tg.HapticFeedback
    ) {

      tg.HapticFeedback.notificationOccurred(
        "success"
      );

    }


    /*
         * Refresh referral statistics.
         */

    await loadReferralData();

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


  if (!user) {

    console.log(
      "Cannot load referral data without Telegram user."
    );

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
          "application/json",
        },

        body: JSON.stringify({

          telegramId:
          user.id,

        }),
      }
    );


    const result =
    await response.json();


    console.log(
      "referral-data response:",
      result
    );


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.error ||
        "Unable to load referral data"
      );

    }


    /*
         * Statistics
         */

    updateStatistics(
      result
    );


    /*
         * Leaderboard
         */

    updateLeaderboard(
      result.leaderboard || []
    );


  } catch (error) {

    console.error(
      "Referral data error:",
      error
    );


    if (leaderboardList) {

      leaderboardList.innerHTML = `
      <div class="leaderboard-loading">
      Unable to load leaderboard.
      </div>
      `;

    }

  }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics(
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
  data.your_rank;


  /*
     * Total referrals
     */

  if (totalReferrals) {

    totalReferrals.textContent =
    referrals.toLocaleString(
      "en-IN"
    );

  }


  /*
     * Total earnings
     */

  if (
    totalReferralEarnings
  ) {

    totalReferralEarnings.textContent =
    earnings.toLocaleString(
      "en-IN"
    );

  }


  /*
     * Ranking
     */

  if (yourReferralRank) {

    yourReferralRank.textContent =
    rank
    ? `#${rank}`: "#--";

  }


  /*
     * Referral count in ranking card
     */

  if (
    yourReferralCount
  ) {

    yourReferralCount.textContent =
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

  if (!leaderboardList) {
    return;
  }


  if (
    !Array.isArray(
      leaderboard
    ) ||
    leaderboard.length === 0
  ) {

    leaderboardList.innerHTML = `
    <div class="leaderboard-loading">
    No referral leaders yet.
    </div>
    `;

    return;

  }


  leaderboardList.innerHTML =
  leaderboard
  .map(
    (
      user,
      index
    ) =>
    createLeaderboardItem(
      user,
      index
    )
  )
  .join("");

}


/* =========================================================
   CREATE LEADERBOARD ITEM
========================================================= */

function createLeaderboardItem(
  user,
  index
) {

  const rank =
  Number(
    user.rank ||
    index + 1
  );


  const referrals =
  Number(
    user.referrals || 0
  );


  const earnings =
  Number(
    user.earnings || 0
  );


  const firstName =
  escapeHtml(
    user.first_name ||
    "BTTC User"
  );


  const username =
  user.username
  ? `@${escapeHtml(user.username)}`: "";


  /*
     * Medal for top 3
     */

  let medal = "";


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
    `<span class="leaderboard-rank-number">${rank}</span>`;

  }


  return `
  <div
  class="leaderboard-item"
  data-rank="${rank}"
  >

  <div class="leaderboard-position">
  ${medal}
  </div>


  <div class="leaderboard-user">

  <strong>
  ${firstName}
  </strong>


  ${
  username
  ? `<small>${username}</small>`: ""
  }

  </div>


  <div class="leaderboard-referrals">

  <strong>
  ${referrals.toLocaleString("en-IN")}
  </strong>


  <small>
  referrals
  </small>

  </div>


  <div class="leaderboard-earnings">

  <strong>
  ${earnings.toLocaleString("en-IN")}
  </strong>


  <small>
  BTTC
  </small>

  </div>

  </div>
  `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value
) {

  return String(
    value
  )
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
   USER MESSAGE
========================================================= */

function showReferralMessage(
  message,
  type = "success"
) {

  /*
     * Remove previous message.
     */

  const oldMessage =
  document.querySelector(
    ".referral-toast"
  );


  if (oldMessage) {
    oldMessage.remove();
  }


  const toast =
  document.createElement(
    "div"
  );


  toast.className =
  `referral-toast ${type}`;


  toast.textContent =
  message;


  document.body.appendChild(
    toast
  );


  /*
     * Automatically remove.
     */

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
   BUTTON EVENTS
========================================================= */

if (copyReferral) {

  copyReferral.addEventListener(
    "click",
    copyReferralLink
  );

}


if (shareReferral) {

  shareReferral.addEventListener(
    "click",
    shareReferralLink
  );

}


/* =========================================================
   INITIAL LOAD
========================================================= */

async function initializeReferralPage() {

  console.log(
    "BTTC Earn Referral page starting..."
  );


  const user =
  getTelegramUser();


  if (!user) {

    console.log(
      "Telegram user not available."
    );