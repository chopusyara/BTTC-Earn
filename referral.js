/* =========================================================
   BTTC EARN — REFERRAL PAGE
   referral.js
========================================================= */

(function () {

  "use strict";


  /* =====================================================
       SETTINGS
    ===================================================== */

  const BOT_USERNAME =
  "BTTC_Earnbot";

  const REFERRAL_REWARD =
  3333;

  const REFERRAL_STATS_FUNCTION =
  "https://fjhygcclzhvwebmrtbho.supabase.co/functions/v1/referral-stats";


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
  document.getElementById(
    "referralLink"
  );

  const copyButton =
  document.getElementById(
    "copyReferral"
  );

  const shareButton =
  document.getElementById(
    "shareReferral"
  );

  const totalReferralsEl =
  document.getElementById(
    "totalReferrals"
  );

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
       TELEGRAM USER ID
    ===================================================== */

  function getTelegramUserId() {

    const user =
    tg?.initDataUnsafe?.user;


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
       REFERRAL LINK
    ===================================================== */

  function createReferralLink() {

    const userId =
    getTelegramUserId();


    if (!userId) {

      return null;

    }


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
       LOAD REAL REFERRAL STATISTICS
    ===================================================== */

  async function loadReferralStats() {

    if (
      !tg ||
      !tg.initData
    ) {

      console.log(
        "Referral stats: Telegram initData unavailable."
      );

      return;

    }


    /*
         * Keep the loading state while
         * the server request is running.
         */

    if (
      leaderboardEl
    ) {

      leaderboardEl.innerHTML =
      '<div class="leaderboard-loading">' +
      'Loading leaderboard...' +
      '</div>';

    }


    try {

      const response =
      await fetch(
        REFERRAL_STATS_FUNCTION,
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
        "referral-stats response:",
        result
      );


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.error ||
          "Unable to load referral statistics."
        );

      }


      /*
             * TOTAL REFERRALS
             */

      const totalReferrals =
      Number(
        result.total_referrals ||
        0
      );


      if (
        totalReferralsEl
      ) {

        totalReferralsEl.textContent =
        totalReferrals.toLocaleString(
          "en-IN"
        );

      }


      /*
             * TOTAL EARNINGS
             */

      const totalEarnings =
      Number(
        result.total_earnings ||
        (
          totalReferrals *
          REFERRAL_REWARD
        )
      );


      if (
        totalEarningsEl
      ) {

        totalEarningsEl.textContent =
        totalEarnings.toLocaleString(
          "en-IN"
        ) +
        " BTTC";

      }


      /*
             * YOUR REFERRALS
             */

      const yourReferrals =
      Number(
        result.your_referrals ??
        totalReferrals
      );


      if (
        referralCountEl
      ) {

        referralCountEl.textContent =
        yourReferrals.toLocaleString(
          "en-IN"
        ) +
        " Referrals";

      }


      /*
             * YOUR RANK
             */

      const rank =
      result.your_rank;


      if (
        rankingEl
      ) {

        if (
          rank ===
          null ||
          rank ===
          undefined
        ) {

          rankingEl.textContent =
          "#--";

        } else {

          rankingEl.textContent =
          "#" +
          Number(
            rank
          ).toLocaleString(
            "en-IN"
          );

        }

      }


      /*
             * LEADERBOARD
             */

      renderLeaderboard(
        result.leaderboard ||
        []
      );


    } catch (
      error
    ) {

      console.error(
        "Referral statistics error:",
        error
      );


      if (
        leaderboardEl
      ) {

        leaderboardEl.innerHTML =
        '<div class="leaderboard-loading">' +
        'Unable to load leaderboard.' +
        '</div>';

      }

    }

  }


  /* =====================================================
       RENDER TOP 10 LEADERBOARD
    ===================================================== */

  function renderLeaderboard(
    leaderboard
  ) {

    if (
      !leaderboardEl
    ) {

      return;

    }


    if (
      !Array.isArray(
        leaderboard
      ) ||
      leaderboard.length ===
      0
    ) {

      leaderboardEl.innerHTML =
      '<div class="leaderboard-loading">' +
      'No referral leaders yet.' +
      '</div>';

      return;

    }


    leaderboardEl.innerHTML =
    "";


    leaderboard.forEach(
      function (
        player
      ) {

        const row =
        document.createElement(
          "div"
        );


        row.className =
        "leaderboard-row";


        const rank =
        document.createElement(
          "div"
        );


        rank.className =
        "leaderboard-rank";


        const rankNumber =
        Number(
          player.rank ||
          0
        );


        if (
          rankNumber ===
          1
        ) {

          rank.textContent =
          "🥇";

        } else if (
          rankNumber ===
          2
        ) {

          rank.textContent =
          "🥈";

        } else if (
          rankNumber ===
          3
        ) {

          rank.textContent =
          "🥉";

        } else {

          rank.textContent =
          String(
            rankNumber
          );

        }


        const name =
        document.createElement(
          "div"
        );


        name.className =
        "leaderboard-name";


        name.textContent =
        player.name ||
        "BTTC User";


        const referrals =
        document.createElement(
          "div"
        );


        referrals.className =
        "leaderboard-referrals";


        const count =
        Number(
          player.referrals ||
          0
        );


        referrals.textContent =
        count.toLocaleString(
          "en-IN"
        ) +
        " Referrals";


        row.appendChild(
          rank
        );


        row.appendChild(
          name
        );


        row.appendChild(
          referrals
        );


        leaderboardEl.appendChild(
          row
        );

      }
    );

  }


  /* =====================================================
       COPY REFERRAL LINK
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


    } catch (
      error
    ) {

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
       SHARE REFERRAL LINK
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

    } catch (_) {}

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

    } catch (_) {}

  }


  /* =====================================================
       BUTTON EVENTS
    ===================================================== */

  if (
    copyButton
  ) {

    copyButton.addEventListener(
      "click",
      copyReferralLink
    );

  }


  if (
    shareButton
  ) {

    shareButton.addEventListener(
      "click",
      shareReferralLink
    );

  }


  /* =====================================================
       INITIALIZE
    ===================================================== */

  async function initializeReferralPage() {

    initializeTelegram();


    /*
         * Load the personal referral link.
         */

    loadReferralLink();


    /*
         * Load real statistics and
         * leaderboard from Supabase.
         */

    await loadReferralStats();

  }


  initializeReferralPage();


  /* =====================================================
       DEBUG HELPERS
    ===================================================== */

  window.BTTCReferral = {

    getUserId:
    getTelegramUserId,

    getLink:
    createReferralLink,

    loadLink:
    loadReferralLink,

    loadStats:
    loadReferralStats

  };


})();