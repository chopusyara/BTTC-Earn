/* =========================================================
   BTTC EARN — REFERRAL PAGE
   referral.js
========================================================= */

(function () {

  "use strict";


  /* =====================================================
       SETTINGS
    ===================================================== */

  const REFERRAL_REWARD = 3333;

  const BOT_USERNAME = "BTTC_Earnbot";


  /* =====================================================
       TELEGRAM
    ===================================================== */

  const tg =
  window.Telegram &&
  window.Telegram.WebApp
  ? window.Telegram.WebApp: null;


  /* =====================================================
       ELEMENTS
    ===================================================== */

  const referralLinkEl =
  document.getElementById("referralLink");

  const copyButton =
  document.getElementById("copyReferral");

  const shareButton =
  document.getElementById("shareReferral");

  const totalReferralsEl =
  document.getElementById("totalReferrals");

  const totalEarningsEl =
  document.getElementById(
    "totalReferralEarnings"
  );

  const rankingEl =
  document.getElementById(
    "yourReferralRank"
  );

  const referralCountEl =
  document.getElementById(
    "yourReferralCount"
  );

  const leaderboardEl =
  document.getElementById(
    "leaderboardList"
  );


  /* =====================================================
       TELEGRAM INITIALIZATION
    ===================================================== */

  function initializeTelegram() {

    if (!tg) {
      return;
    }

    try {

      tg.ready();

      tg.expand();

      if (
        typeof tg.setHeaderColor ===
        "function"
      ) {

        tg.setHeaderColor(
          "#05050d"
        );

      }

      if (
        typeof tg.setBackgroundColor ===
        "function"
      ) {

        tg.setBackgroundColor(
          "#05050d"
        );

      }

    } catch (error) {

      console.log(
        "Telegram initialization error:",
        error
      );

    }

  }


  initializeTelegram();


  /* =====================================================
       GET TELEGRAM USER
    ===================================================== */

  function getTelegramUser() {

    if (
      tg &&
      tg.initDataUnsafe &&
      tg.initDataUnsafe.user
    ) {

      return tg.initDataUnsafe.user;

    }

    return null;

  }


  /* =====================================================
       GET TELEGRAM USER ID
    ===================================================== */

  function getTelegramUserId() {

    const user =
    getTelegramUser();


    if (
      user &&
      user.id
    ) {

      return String(
        user.id
      );

    }


    return null;

  }


  /* =====================================================
       CREATE REFERRAL LINK
    ===================================================== */

  function createReferralLink() {

    const userId =
    getTelegramUserId();


    if (!userId) {

      return null;

    }


    /*
         * No referral code is created.
         *
         * Telegram user ID is used directly
         * as the start parameter.
         */

    return (
      "https://t.me/" +
      BOT_USERNAME +
      "?start=" +
      encodeURIComponent(
        userId
      )
    );

  }


  /* =====================================================
       LOAD REFERRAL LINK
    ===================================================== */

  function loadReferralLink() {

    if (!referralLinkEl) {
      return;
    }


    let attempts = 0;

    const maxAttempts = 20;


    function tryLoad() {

      const link =
      createReferralLink();


      if (link) {

        referralLinkEl.textContent =
        link;

        referralLinkEl.title =
        link;

        referralLinkEl.dataset.link =
        link;

        return;

      }


      attempts++;


      if (
        attempts >=
        maxAttempts
      ) {

        referralLinkEl.textContent =
        "Open BTTC Earn inside Telegram";

        referralLinkEl.title =
        "Telegram user information is unavailable";

        return;

      }


      setTimeout(
        tryLoad,
        250
      );

    }


    tryLoad();

  }


  /* =====================================================
       COPY
    ===================================================== */

  async function copyReferralLink() {

    const link =
    createReferralLink();


    if (!link) {

      showMessage(
        "Referral link is unavailable. Please open BTTC Earn inside Telegram."
      );

      return;

    }


    try {

      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        await navigator.clipboard.writeText(
          link
        );

      } else {

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

      }


      hapticSuccess();


      showTemporaryText(
        copyButton,
        "✓ COPIED"
      );


      if (
        tg &&
        typeof tg.showAlert ===
        "function"
      ) {

        tg.showAlert(
          "Referral link copied! 📋"
        );

      }

    } catch (error) {

      console.error(
        "Copy error:",
        error
      );

      showMessage(
        "Unable to copy the referral link."
      );

    }

  }


  /* =====================================================
       SHARE
    ===================================================== */

  function shareReferralLink() {

    const link =
    createReferralLink();


    if (!link) {

      showMessage(
        "Referral link is unavailable. Please open BTTC Earn inside Telegram."
      );

      return;

    }


    const text =
    "🚀 Join BTTC Earn and start earning BTTC!\n\n" +
    "Join using my referral link.";


    const shareUrl =
    "https://t.me/share/url" +
    "?url=" +
    encodeURIComponent(
      link
    ) +
    "&text=" +
    encodeURIComponent(
      text
    );


    hapticLight();


    if (
      tg &&
      typeof tg.openTelegramLink ===
      "function"
    ) {

      tg.openTelegramLink(
        shareUrl
      );

      return;

    }


    if (
      navigator.share
    ) {

      navigator.share({

        title:
        "BTTC Earn",

        text:
        text,

        url:
        link

      }).catch(
        () => {}
      );

      return;

    }


    window.open(
      shareUrl,
      "_blank"
    );

  }


  /* =====================================================
       TEMPORARY BUTTON TEXT
    ===================================================== */

  function showTemporaryText(
    button,
    text
  ) {

    if (!button) {
      return;
    }


    const original =
    button.textContent;


    button.textContent =
    text;


    setTimeout(
      function () {

        button.textContent =
        original;

      },
      1500
    );

  }


  /* =====================================================
       MESSAGE
    ===================================================== */

  function showMessage(
    message
  ) {

    if (
      tg &&
      typeof tg.showAlert ===
      "function"
    ) {

      tg.showAlert(
        message
      );

    } else {

      alert(
        message
      );

    }

  }


  /* =====================================================
       HAPTIC
    ===================================================== */

  function hapticLight() {

    try {

      if (
        tg &&
        tg.HapticFeedback
      ) {

        tg.HapticFeedback
        .impactOccurred(
          "light"
        );

      }

    } catch (error) {

      console.log(
        "Haptic error:",
        error
      );

    }

  }


  function hapticSuccess() {

    try {

      if (
        tg &&
        tg.HapticFeedback
      ) {

        tg.HapticFeedback
        .notificationOccurred(
          "success"
        );

      }

    } catch (error) {

      console.log(
        "Haptic error:",
        error
      );

    }

  }


  /* =====================================================
       BUTTON EVENTS
    ===================================================== */

  if (copyButton) {

    copyButton.addEventListener(
      "click",
      copyReferralLink
    );

  }


  if (shareButton) {

    shareButton.addEventListener(
      "click",
      shareReferralLink
    );

  }


  /* =====================================================
       INITIAL STATISTICS
    ===================================================== */

  function initializeStats() {

    if (totalReferralsEl) {

      totalReferralsEl.textContent =
      "0";

    }


    if (totalEarningsEl) {

      totalEarningsEl.textContent =
      "0";

    }


    if (rankingEl) {

      rankingEl.textContent =
      "#--";

    }


    if (referralCountEl) {

      referralCountEl.textContent =
      "0";

    }


    if (leaderboardEl) {

      leaderboardEl.innerHTML =

      '<div class="leaderboard-loading">' +
      'No leaderboard data yet.' +
      '</div>';

    }

  }


  /* =====================================================
       START
    ===================================================== */

  function initializeReferralPage() {

    initializeTelegram();

    initializeStats();

    loadReferralLink();

  }


  initializeReferralPage();


  /* =====================================================
       DEBUG
    ===================================================== */

  window.BTTCReferral = {

    getUserId:
    getTelegramUserId,

    getLink:
    createReferralLink,

    reload:
    loadReferralLink

  };


})();