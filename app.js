/* =========================================
   BTTC EARN
   APP CONTROLLER
========================================= */
/* =========================================
   TELEGRAM WEBAPP
========================================= */

const telegramApp =
  window.Telegram?.WebApp;


if (telegramApp) {

  telegramApp.ready();

  telegramApp.expand();

}

/* =========================================
   SUPABASE CONFIG
========================================= */

const SUPABASE_URL =
  "https://fjhygcclzhvwebmrtbho.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_2Tbk0mdFhWv1Ikd-jzLyQw_TSbwewXf";


/* =========================================
   BTTC EARN
   TELEGRAM AUTHENTICATION
========================================= */

let currentUser = null;


/* =========================================
   AUTHENTICATE TELEGRAM USER
========================================= */

async function authenticateTelegramUser() {

  try {

    if (!window.Telegram?.WebApp) {

      console.error(
        "Telegram WebApp API is not available."
      );

      return false;

    }


    const telegramWebApp =
      window.Telegram.WebApp;


    telegramWebApp.ready();


    const initData =
      telegramWebApp.initData;


    if (!initData) {

      console.error(
        "Telegram initData is missing."
      );

      return false;

    }


    console.log(
      "Authenticating Telegram user..."
    );


    const {
      data,
      error
    } =
      await supabaseClient.functions.invoke(
        "telegram-auth",
        {
          body: {
            initData
          }
        }
      );


    if (error) {

      console.error(
        "Telegram authentication error:",
        error
      );

      return false;

    }


    if (!data?.success) {

      if (data?.blocked) {

        alert(
          "Your BTTC Earn account has been blocked."
        );

      } else {

        console.error(
          "Authentication failed:",
          data
        );

      }

      return false;

    }


    currentUser =
      data.user;


    console.log(
      "BTTC Earn user authenticated:",
      currentUser
    );


    updateUserInterface();


    return true;


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    return false;

  }

}


/* =========================================
   UPDATE USER INTERFACE
========================================= */

function updateUserInterface() {

  if (!currentUser) {

    return;

  }


  /* -----------------------------------------
     TELEGRAM ID
  ----------------------------------------- */

  const telegramIdElements =
    document.querySelectorAll(
      "[data-user-telegram-id]"
    );


  telegramIdElements.forEach(
    (element) => {

      element.textContent =
        currentUser.telegram_id;

    }
  );


  /* -----------------------------------------
     USERNAME
  ----------------------------------------- */

  const usernameElements =
    document.querySelectorAll(
      "[data-user-username]"
    );


  usernameElements.forEach(
    (element) => {

      element.textContent =
        currentUser.username
          ? "@" + currentUser.username
          : currentUser.first_name || "User";

    }
  );


  /* -----------------------------------------
     BALANCES
  ----------------------------------------- */

  updateBalance(
    "usdtBalance",
    Number(
      currentUser.usdt_balance
    ).toFixed(2)
  );


  updateBalance(
    "bttcBalance",
    Number(
      currentUser.bttc_balance
    ).toFixed(4)
  );


  /* -----------------------------------------
     AVATAR
  ----------------------------------------- */

  const avatarElements =
    document.querySelectorAll(
      "[data-user-avatar]"
    );


  avatarElements.forEach(
    (element) => {

      if (
        currentUser.avatar_url
      ) {

        if (
          element.tagName ===
          "IMG"
        ) {

          element.src =
            currentUser.avatar_url;

        }

        element.classList.add(
          "has-user-avatar"
        );

      }

    }
  );

}

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

function getTelegramUser() {

  if (!telegramApp) {

    return null;

  }

  return telegramApp.initDataUnsafe?.user || null;

}

const telegramUser =
  getTelegramUser();

console.log(
  "Telegram user:",
  telegramUser
); 
/* =========================================
   DEMO CONFIGURATION
========================================= */

const MINING_DURATION = 60;

const MINING_RATE = 100;


/* =========================================
   APP STATE
========================================= */

const appState = {

  miningStatus: "ready",

  miningStartTime: null,

  miningEndTime: null,

  sessionEarnings: 0,

  miningTimer: null

};


/* =========================================
   APP START
========================================= */
document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await authenticateTelegramUser();

    initializeApp();

  }
);



/* =========================================
   INITIALIZE
========================================= */

function initializeApp() {

  initializeNavigation()

  initializeMining();

  initializeModals();

  initializeDemoData();

}


/* =========================================
   DEMO DATA
========================================= */

function initializeDemoData() {

  updateBalance(
    "usdtBalance",
    "0.00"
  );


  updateBalance(
    "bttcBalance",
    "0"
  );

}

/* =========================================
   NAVIGATION
========================================= */

function initializeNavigation() {

  const navItems =
  document.querySelectorAll(".nav-item");

  const pages =
  document.querySelectorAll(".page");


  /*
   * MAIN NAVIGATION
   */

  navItems.forEach((item) => {

    item.addEventListener("click", () => {

      const targetPage =
      item.dataset.page;

      if (!targetPage) {
        return;
      }

      showPage(targetPage);

    });

  });


  /*
   * EXPOSE PAGE NAVIGATION
   * So other buttons such as
   * Admin can use the same system.
   */

  window.showPage = showPage;


  /*
   * DEFAULT PAGE
   */

  const activeNav =
  document.querySelector(
    ".nav-item.active-nav"
  );

  const defaultPage =
  activeNav?.dataset.page ||
  pages[0]?.id;

  if (defaultPage) {

    showPage(defaultPage);

  }

}


/* =========================================
   SHOW PAGE
========================================= */

function showPage(targetPage) {

  const navItems =
  document.querySelectorAll(
    ".nav-item"
  );

  const pages =
  document.querySelectorAll(
    ".page"
  );


  /*
   * Remove active state
   * from every page.
   */

  pages.forEach((page) => {

    page.classList.remove(
      "active-page"
    );

  });


  /*
   * Find requested page.
   */

  const selectedPage =
  document.getElementById(
    targetPage
  );


  if (!selectedPage) {

    console.error(
      "Page not found:",
      targetPage
    );

    return;

  }


  /*
   * Activate requested page.
   */

  selectedPage.classList.add(
    "active-page"
  );


  /*
   * Update bottom navigation.
   *
   * Admin is NOT part of the bottom
   * navigation, so when Admin opens,
   * no bottom-nav item is highlighted.
   */

  navItems.forEach((navItem) => {

    navItem.classList.remove(
      "active-nav"
    );


    if (
      navItem.dataset.page ===
      targetPage
    ) {

      navItem.classList.add(
        "active-nav"
      );

    }

  });


  /*
   * Hide bottom navigation on Admin.
   *
   * If you want Admin to also have
   * the bottom navigation, remove
   * this block.
   */

  const bottomNav =
  document.querySelector(
    ".bottom-nav"
  );


  if (bottomNav) {

    if (targetPage === "admin-page") {

      bottomNav.classList.add(
        "admin-nav-hidden"
      );

    } else {

      bottomNav.classList.remove(
        "admin-nav-hidden"
      );

    }

  }


  /*
   * Scroll page back to top.
   */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

/* =========================================
   MINING
========================================= */

function initializeMining() {

  const miningButton =
  document.getElementById(
    "miningButton"
  );


  if (!miningButton) {

    return;

  }


  miningButton.addEventListener(
    "click",
    handleMiningButton
  );


  updateMiningUI();

}


/* =========================================
   MINING BUTTON
========================================= */

function handleMiningButton() {

  if (
    appState.miningStatus ===
    "ready"
  ) {

    startMining();

    return;

  }


  if (
    appState.miningStatus ===
    "mining"
  ) {

    /*
         * Mining button does nothing
         * while the session is active.
         */

    return;

  }


  if (
    appState.miningStatus ===
    "claimable"
  ) {

    claimMining();

  }

}


/* =========================================
   START MINING
========================================= */

function startMining() {

  appState.miningStatus =
  "mining";


  appState.miningStartTime =
  Date.now();


  appState.miningEndTime =
  Date.now() +
  (MINING_DURATION * 1000);


  appState.sessionEarnings =
  0;


  clearInterval(
    appState.miningTimer
  );


  appState.miningTimer =
  setInterval(
    updateMiningProgress,
    100
  );


  updateMiningUI();

}


/* =========================================
   UPDATE MINING
========================================= */

function updateMiningProgress() {

  const now =
  Date.now();


  const remaining =
  appState.miningEndTime -
  now;


  if (remaining <= 0) {

    appState.sessionEarnings =
    calculateFullSessionReward();


    clearInterval(
      appState.miningTimer
    );


    appState.miningTimer =
    null;


    appState.miningStatus =
    "claimable";


    updateMiningUI();

    return;

  }


  const elapsed =
  now -
  appState.miningStartTime;


  const duration =
  appState.miningEndTime -
  appState.miningStartTime;


  const progress =
  Math.min(
    elapsed / duration,
    1
  );


  appState.sessionEarnings =
  calculateReward(
    progress
  );


  updateMiningUI();

}


/* =========================================
   CALCULATE REWARD
========================================= */

function calculateReward(progress) {

  const hourlyRate =
  MINING_RATE;


  const sessionSeconds =
  MINING_DURATION;


  const reward =
  hourlyRate *
  (sessionSeconds / 3600) *
  progress;


  return reward;

}


/* =========================================
   FULL REWARD
========================================= */

function calculateFullSessionReward() {

  return calculateReward(1);

}


/* =========================================
   CLAIM MINING
========================================= */

function claimMining() {

  const reward =
  appState.sessionEarnings;


  /*
     * Demo only.
     *
     * In production this operation
     * will be handled by Supabase.
     */

  const currentBalance =
  Number(
    document.getElementById(
      "bttcBalance"
    ).textContent
  ) || 0;


  const newBalance =
  currentBalance +
  reward;


  updateBalance(
    "bttcBalance",
    formatNumber(newBalance)
  );


  appState.sessionEarnings =
  0;


  appState.miningStartTime =
  null;


  appState.miningEndTime =
  null;


  appState.miningStatus =
  "ready";


  updateMiningUI();

}


/* =========================================
   UPDATE MINING UI
========================================= */

function updateMiningUI() {

  const miningCard =
  document.querySelector(
    ".mining-card"
  );


  const status =
  document.getElementById(
    "miningStatus"
  );


  const buttonText =
  document.getElementById(
    "miningButtonText"
  );


  const timer =
  document.getElementById(
    "miningTimer"
  );


  const earnings =
  document.getElementById(
    "sessionEarnings"
  );


  const rate =
  document.getElementById(
    "miningRate"
  );


  if (!miningCard) {

    return;

  }


  miningCard.classList.remove(
    "is-mining",
    "is-claimable"
  );


  rate.textContent =
  MINING_RATE;


  earnings.textContent =
  formatNumber(
    appState.sessionEarnings,
    4
  );


  if (
    appState.miningStatus ===
    "ready"
  ) {

    status.textContent =
    "READY TO MINE";


    buttonText.textContent =
    "START";


    timer.textContent =
    "Ready";

  }


  if (
    appState.miningStatus ===
    "mining"
  ) {

    miningCard.classList.add(
      "is-mining"
    );


    status.textContent =
    "MINING";


    buttonText.textContent =
    "MINING";


    const remaining =
    Math.max(
      0,
      appState.miningEndTime -
      Date.now()
    );


    timer.textContent =
    formatTime(
      remaining
    );

  }


  if (
    appState.miningStatus ===
    "claimable"
  ) {

    miningCard.classList.add(
      "is-claimable"
    );


    status.textContent =
    "READY TO CLAIM";


    buttonText.textContent =
    "CLAIM";


    timer.textContent =
    "Mining session complete";

  }

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(
  milliseconds
) {

  const totalSeconds =
  Math.ceil(
    milliseconds / 1000
  );


  const minutes =
  Math.floor(
    totalSeconds / 60
  );


  const seconds =
  totalSeconds % 60;


  return (

    String(minutes).padStart(2, "0") +

    ":" +

    String(seconds).padStart(2, "0")

  );

}


/* =========================================
   FORMAT NUMBER
========================================= */

function formatNumber(
  number,
  decimals = 4
) {

  return Number(number)
  .toFixed(decimals);

}


/* =========================================
   UPDATE BALANCE
========================================= */

function updateBalance(
  elementId,
  value
) {

  const element =
  document.getElementById(
    elementId
  );


  if (!element) {

    return;

  }


  element.textContent =
  value;

}


/* =========================================
   MODALS
========================================= */

function initializeModals() {

  const modalTriggers =
  document.querySelectorAll(
    "[data-modal]"
  );


  modalTriggers.forEach(
    (trigger) => {

      trigger.addEventListener(
        "click",
        () => {

          const modalId =
          trigger.dataset.modal;


          openModal(
            modalId
          );

        }
      );

    }
  );


  const closeButtons =
  document.querySelectorAll(
    ".modal-close"
  );


  closeButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const modal =
          button.closest(
            ".modal-overlay"
          );


          if (modal) {

            closeModal(
              modal.id
            );

          }

        }
      );

    }
  );


  const overlays =
  document.querySelectorAll(
    ".modal-overlay"
  );


  overlays.forEach(
    (overlay) => {

      overlay.addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            overlay
          ) {

            closeModal(
              overlay.id
            );

          }

        }
      );

    }
  );

}


/* =========================================
   OPEN MODAL
========================================= */

function openModal(
  modalId
) {

  const modal =
  document.getElementById(
    modalId
  );


  if (!modal) {

    return;

  }


  modal.classList.add(
    "active"
  );


  document.body.style.overflow =
  "hidden";

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal(
  modalId
) {

  const modal =
  document.getElementById(
    modalId
  );


  if (!modal) {

    return;

  }


  modal.classList.remove(
    "active"
  );


  document.body.style.overflow =
  "";

}
/* =========================================================
   REFERRAL SYSTEM
========================================================= */

const referralLink =
document.getElementById("referral-link");

const copyReferralBtn =
document.getElementById("copy-referral-btn");

const inviteFriendsBtn =
document.getElementById("invite-friends-btn");


/* COPY REFERRAL LINK */

if (copyReferralBtn && referralLink) {

  copyReferralBtn.addEventListener("click", async () => {

    const link =
    referralLink.textContent.trim();

    try {

      await navigator.clipboard.writeText(link);

      copyReferralBtn.textContent = "COPIED";

      copyReferralBtn.classList.add("copied");

      setTimeout(() => {

        copyReferralBtn.textContent = "COPY";

        copyReferralBtn.classList.remove("copied");

      }, 1800);

    } catch (error) {

      console.log(
        "Unable to copy referral link."
      );

    }

  });

}


/* TELEGRAM INVITE */

if (inviteFriendsBtn) {

  inviteFriendsBtn.addEventListener("click", () => {

    const link =
    referralLink
    ? referralLink.textContent.trim(): "";

    const message =
    "Join BTTC Earn and start mining BTTC with me! 🚀";

    const telegramUrl =
    "https://t.me/share/url?url=" +
    encodeURIComponent(link) +
    "&text=" +
    encodeURIComponent(message);

    window.open(
      telegramUrl,
      "_blank"
    );

  });

}

/* =========================================================
   BTTC EARN — TASK SYSTEM
========================================================= */

const createTaskModal =
document.getElementById("create-task-modal");

const openCreateTaskBtn =
document.getElementById("open-create-task");

const closeCreateTaskBtn =
document.getElementById("close-create-task");

const confirmTaskBtn =
document.getElementById("confirm-task-btn");

const telegramUrlInput =
document.getElementById("task-telegram-url");

const selectedPlanText =
document.getElementById("selected-plan-text");

const taskPlans =
document.querySelectorAll(".task-plan");


let selectedTaskPlan = null;


/* =========================================================
   OPEN MODAL
========================================================= */

if (openCreateTaskBtn && createTaskModal) {

  openCreateTaskBtn.addEventListener("click", () => {

    createTaskModal.classList.add("active");

    createTaskModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "modal-open"
    );

  });

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeCreateTaskModal() {

  if (!createTaskModal) return;

  createTaskModal.classList.remove("active");

  createTaskModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "modal-open"
  );
}


if (closeCreateTaskBtn) {

  closeCreateTaskBtn.addEventListener(
    "click",
    closeCreateTaskModal
  );

}


/* =========================================================
   CLOSE BY BACKDROP
========================================================= */

if (createTaskModal) {

  createTaskModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        createTaskModal
      ) {

        closeCreateTaskModal();

      }

    }
  );

}


/* =========================================================
   PLAN SELECTION
========================================================= */

taskPlans.forEach((plan) => {

  plan.addEventListener("click", () => {

    taskPlans.forEach((item) => {

      item.classList.remove(
        "selected"
      );

    });

    plan.classList.add("selected");

    const price =
    plan.dataset.price;

    const users =
    plan.dataset.users;

    selectedTaskPlan = {
      price: Number(price),
      users: Number(users)
    };

    selectedPlanText.textContent =
    `${price} USDT • ${Number(users).toLocaleString()} USERS`;

  });

});


/* =========================================================
   CREATE TASK
========================================================= */

if (confirmTaskBtn) {

  confirmTaskBtn.addEventListener(
    "click",
    () => {

      const telegramUrl =
      telegramUrlInput
      ? telegramUrlInput.value.trim(): "";


      /* URL VALIDATION */

      if (!telegramUrl) {

        showTaskMessage(
          "Please enter your Telegram channel or group link."
        );

        telegramUrlInput?.focus();

        return;

      }


      if (
        !telegramUrl.startsWith(
          "https://t.me/"
        )
      ) {

        showTaskMessage(
          "Please enter a valid https://t.me/ link."
        );

        telegramUrlInput?.focus();

        return;

      }


      /* PLAN VALIDATION */

      if (!selectedTaskPlan) {

        showTaskMessage(
          "Please select a task plan."
        );

        return;

      }


      /*
             * FRONTEND ONLY
             *
             * Later this data will be sent
             * to Supabase.
             */

      const newTask = {

        telegramUrl,

        price:
        selectedTaskPlan.price,

        targetUsers:
        selectedTaskPlan.users,

        status:
        "pending"

      };


      console.log(
        "Task ready for Supabase:",
        newTask
      );


      showTaskMessage(
        "Task submitted successfully!"
      );


      setTimeout(() => {

        closeCreateTaskModal();

        resetCreateTaskForm();

      }, 900);

    }
  );

}


/* =========================================================
   RESET
========================================================= */

function resetCreateTaskForm() {

  if (telegramUrlInput) {

    telegramUrlInput.value = "";

  }


  taskPlans.forEach((plan) => {

    plan.classList.remove(
      "selected"
    );

  });


  selectedTaskPlan = null;


  if (selectedPlanText) {

    selectedPlanText.textContent =
    "Select a plan";

  }

}


/* =========================================================
   TASK MESSAGE
========================================================= */

function showTaskMessage(message) {

  /*
     * If your existing app already has
     * a toast system, connect it here.
     */

  if (
    typeof window.showToast ===
    "function"
  ) {

    window.showToast(message);

    return;

  }


  alert(message);

}


/* =========================================================
   AVAILABLE TASK ACTIONS
========================================================= */

const taskActionButtons =
document.querySelectorAll(
  ".task-action-btn"
);


taskActionButtons.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const taskType =
      button.dataset.task;


      /*
             * Placeholder behavior.
             *
             * Real verification will be
             * handled by the backend later.
             */

      if (taskType === "telegram") {

        showTaskMessage(
          "Telegram task opened."
        );

      } else if (taskType === "video") {

        showTaskMessage(
          "Video task opened."
        );

      } else if (taskType === "website") {

        showTaskMessage(
          "Website task opened."
        );

      } else if (taskType === "social") {

        showTaskMessage(
          "Social task opened."
        );

      }

    }
  );

});

/* =========================================================
   BTTC EARN — PROFILE SYSTEM
========================================================= */


/* =========================================================
   MODAL HELPERS
========================================================= */

function openProfileModal(modal) {

  if (!modal) return;

  modal.classList.add("active");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );
}


function closeProfileModal(modal) {

  if (!modal) return;

  modal.classList.remove("active");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   DEPOSIT MODAL
========================================================= */

const depositModal =
document.getElementById(
  "deposit-modal"
);

const openDepositBtn =
document.getElementById(
  "open-deposit-modal"
);

const closeDepositBtn =
document.getElementById(
  "close-deposit-modal"
);


if (openDepositBtn) {

  openDepositBtn.addEventListener(
    "click",
    () => {

      openProfileModal(
        depositModal
      );

    }
  );

}


if (closeDepositBtn) {

  closeDepositBtn.addEventListener(
    "click",
    () => {

      closeProfileModal(
        depositModal
      );

    }
  );

}


/* =========================================================
   WITHDRAW MODAL
========================================================= */

const withdrawModal =
document.getElementById(
  "withdraw-modal"
);

const openWithdrawBtn =
document.getElementById(
  "open-withdraw-modal"
);

const closeWithdrawBtn =
document.getElementById(
  "close-withdraw-modal"
);


if (openWithdrawBtn) {

  openWithdrawBtn.addEventListener(
    "click",
    () => {

      openProfileModal(
        withdrawModal
      );

    }
  );

}


if (closeWithdrawBtn) {

  closeWithdrawBtn.addEventListener(
    "click",
    () => {

      closeProfileModal(
        withdrawModal
      );

    }
  );

}


/* =========================================================
   CLOSE MODALS BY BACKDROP
========================================================= */

[depositModal,
  withdrawModal]
.forEach((modal) => {

  if (!modal) return;

  modal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === modal
      ) {

        closeProfileModal(
          modal
        );

      }

    }
  );

});


/* =========================================================
   COPY DEPOSIT ADDRESS
========================================================= */

const copyDepositAddressBtn =
document.getElementById(
  "copy-deposit-address"
);

const depositAddress =
document.getElementById(
  "deposit-address"
);


if (
  copyDepositAddressBtn &&
  depositAddress
) {

  copyDepositAddressBtn.addEventListener(
    "click",
    async () => {

      const address =
      depositAddress.textContent
      .trim();


      try {

        await navigator
        .clipboard
        .writeText(address);

        copyDepositAddressBtn
        .textContent =
        "COPIED";

        setTimeout(() => {

          copyDepositAddressBtn
          .textContent =
          "COPY";

        }, 1600);

      } catch (error) {

        console.log(
          "Unable to copy address."
        );

      }

    }
  );

}


/* =========================================================
   DEPOSIT FILE
========================================================= */

const depositScreenshot =
document.getElementById(
  "deposit-screenshot"
);

const depositFileName =
document.getElementById(
  "deposit-file-name"
);


if (depositScreenshot) {

  depositScreenshot.addEventListener(
    "change",
    () => {

      const file =
      depositScreenshot
      .files?.[0];


      if (!file) {

        depositFileName.textContent =
        "";

        return;

      }


      depositFileName.textContent =
      "Attached: " + file.name;

    }
  );

}


/* =========================================================
   SUBMIT DEPOSIT
========================================================= */

const submitDepositBtn =
document.getElementById(
  "submit-deposit"
);

const depositAmount =
document.getElementById(
  "deposit-amount"
);


if (submitDepositBtn) {

  submitDepositBtn.addEventListener(
    "click",
    () => {

      const amount =
      Number(
        depositAmount?.value
      );

      const screenshot =
      depositScreenshot
      ?.files?.[0];


      if (
        !amount ||
        amount <= 0
      ) {

        showProfileMessage(
          "Enter a valid USDT amount."
        );

        return;

      }


      if (!screenshot) {

        showProfileMessage(
          "Please attach your payment screenshot."
        );

        return;

      }


      /*
             * FRONTEND ONLY
             *
             * Later this information will
             * be uploaded to Supabase Storage
             * and the deposit request will be
             * inserted into the database.
             */

      const depositRequest = {

        amount,

        network:
        "BEP20",

        screenshot:
        screenshot.name,

        status:
        "pending"

      };


      console.log(
        "Deposit request:",
        depositRequest
      );


      showProfileMessage(
        "Deposit request submitted!"
      );


      setTimeout(() => {

        closeProfileModal(
          depositModal
        );

      }, 900);

    }
  );

}


/* =========================================================
   WITHDRAW AMOUNT
========================================================= */

const withdrawAmounts =
document.querySelectorAll(
  ".withdraw-amount"
);

const selectedWithdrawAmount =
document.getElementById(
  "selected-withdraw-amount"
);


let selectedWithdrawal = null;


withdrawAmounts.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      withdrawAmounts.forEach(
        (item) => {

          item.classList.remove(
            "selected"
          );

        }
      );


      button.classList.add(
        "selected"
      );


      selectedWithdrawal =
      Number(
        button.dataset.amount
      );


      selectedWithdrawAmount
      .textContent =
      `${selectedWithdrawal.toLocaleString()} BTTC`;

    }
  );

});


/* =========================================================
   SUBMIT WITHDRAWAL
========================================================= */

const submitWithdrawBtn =
document.getElementById(
  "submit-withdraw"
);

const binanceIdInput =
document.getElementById(
  "binance-id"
);


if (submitWithdrawBtn) {

  submitWithdrawBtn.addEventListener(
    "click",
    () => {

      const binanceId =
      binanceIdInput
      ?.value
      .trim();


      if (!binanceId) {

        showProfileMessage(
          "Enter your Binance ID."
        );

        return;

      }


      if (!selectedWithdrawal) {

        showProfileMessage(
          "Select a withdrawal amount."
        );

        return;

      }


      /*
             * FRONTEND ONLY
             *
             * Actual balance checking,
             * withdrawal validation,
             * duplicate prevention and
             * admin approval will happen
             * on the backend.
             */

      const withdrawalRequest = {

        binanceId,

        amount:
        selectedWithdrawal,

        status:
        "pending"

      };


      console.log(
        "Withdrawal request:",
        withdrawalRequest
      );


      showProfileMessage(
        "Withdrawal request submitted!"
      );


      setTimeout(() => {

        closeProfileModal(
          withdrawModal
        );

      }, 900);

    }
  );

}


/* =========================================================
   PROFILE MESSAGE
========================================================= */

function showProfileMessage(message) {

  if (
    typeof window.showToast ===
    "function"
  ) {

    window.showToast(message);

    return;

  }


  alert(message);

}/* =========================================================
   BTTC EARN — ADMIN FRONTEND
========================================================= */


/* =========================================================
   ADMIN PAGE NAVIGATION
========================================================= */

const adminBackProfile =
document.getElementById(
  "admin-back-profile"
);


if (adminBackProfile) {

  adminBackProfile.addEventListener(
    "click",
    () => {

      if (
        typeof window.showPage ===
        "function"
      ) {

        window.showPage(
          "profile-page"
        );

      }

    }
  );

}


/* =========================================================
   UPDATE REQUEST COUNTS
========================================================= */

function updateAdminCounts() {

  const withdrawalCount =
  document.querySelectorAll(
    "#admin-withdrawal-list .pending-request"
  ).length;


  const depositCount =
  document.querySelectorAll(
    "#admin-deposit-list .pending-request"
  ).length;


  const withdrawalBadge =
  document.getElementById(
    "pending-withdrawal-count"
  );


  const depositBadge =
  document.getElementById(
    "pending-deposit-count"
  );


  if (withdrawalBadge) {

    withdrawalBadge.textContent =
    withdrawalCount;

  }


  if (depositBadge) {

    depositBadge.textContent =
    depositCount;

  }

}


updateAdminCounts();


/* =========================================================
   REQUEST SWIPE
========================================================= */

function animateAdminRequest(
  request,
  type,
  callback
) {

  if (!request) return;

  if (
    request.classList.contains(
      "processing-request"
    )
  ) {

    return;

  }


  request.classList.add(
    "processing-request"
  );


  if (type === "confirm") {

    request.classList.add(
      "swipe-confirm"
    );

  } else {

    request.classList.add(
      "swipe-reject"
    );

  }


  setTimeout(() => {

    request.remove();

    updateAdminCounts();

    if (callback) {

      callback();

    }

  },
    550);

}


/* =========================================================
   WITHDRAWAL CONFIRM
========================================================= */

document
.querySelectorAll(
  ".confirm-withdrawal"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".admin-request"
      );


      animateAdminRequest(
        request,
        "confirm",
        () => {

          /*
                         * BACKEND TODO:
                         *
                         * 1. Verify admin
                         * 2. Verify withdrawal
                         * 3. Update transaction
                         * 4. Update user's withdrawal
                         * 5. Post to withdrawal channel
                         */

          console.log(
            "Withdrawal confirmed"
          );

        }
      );

    }
  );

});


/* =========================================================
   WITHDRAWAL REJECT
========================================================= */

document
.querySelectorAll(
  ".reject-withdrawal"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".admin-request"
      );


      animateAdminRequest(
        request,
        "reject",
        () => {

          /*
                         * BACKEND TODO:
                         *
                         * Update withdrawal
                         * status to rejected.
                         */

          console.log(
            "Withdrawal rejected"
          );

        }
      );

    }
  );

});


/* =========================================================
   DEPOSIT CONFIRM
========================================================= */

document
.querySelectorAll(
  ".confirm-deposit"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".deposit-request"
      );


      const amount =
      Number(
        request?.dataset.amount
      );


      animateAdminRequest(
        request,
        "confirm",
        () => {

          /*
                         * BACKEND TODO:
                         *
                         * Atomically:
                         *
                         * user.usdt_balance
                         * += amount
                         *
                         * transaction.status
                         * = confirmed
                         */

          console.log(
            `Deposit confirmed: ${amount} USDT`
          );

        }
      );

    }
  );

});


/* =========================================================
   DEPOSIT REJECT
========================================================= */

document
.querySelectorAll(
  ".reject-deposit"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".deposit-request"
      );


      animateAdminRequest(
        request,
        "reject",
        () => {

          /*
                         * BACKEND TODO:
                         *
                         * transaction.status
                         * = rejected
                         */

          console.log(
            "Deposit rejected"
          );

        }
      );

    }
  );

});


/* =========================================================
   PROMO CONFIRM
========================================================= */

document
.querySelectorAll(
  ".confirm-promo"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".customer-request"
      );


      if (!request) return;


      request.style.transition =
      "all .35s ease";

      request.style.transform =
      "translateX(30px)";

      request.style.opacity =
      "0";


      setTimeout(() => {

        request.remove();

        /*
                     * BACKEND TODO:
                     *
                     * Confirm promo request
                     * and create corresponding
                     * reward transaction.
                     */

      }, 350);

    }
  );

});


/* =========================================================
   PROMO REJECT
========================================================= */

document
.querySelectorAll(
  ".reject-promo"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".customer-request"
      );


      if (!request) return;


      request.style.transition =
      "all .35s ease";

      request.style.transform =
      "translateX(-30px)";

      request.style.opacity =
      "0";


      setTimeout(() => {

        request.remove();

        console.log(
          "Promo request rejected"
        );

      }, 350);

    }
  );

});


/* =========================================================
   TASK CONFIRM
========================================================= */

document
.querySelectorAll(
  ".confirm-task"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".customer-request"
      );


      if (!request) return;


      request.style.transition =
      "all .35s ease";

      request.style.transform =
      "translateX(30px)";

      request.style.opacity =
      "0";


      setTimeout(() => {

        request.remove();

        console.log(
          "Task request confirmed"
        );

      }, 350);

    }
  );

});


/* =========================================================
   TASK REJECT
========================================================= */

document
.querySelectorAll(
  ".reject-task"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const request =
      button.closest(
        ".customer-request"
      );


      if (!request) return;


      request.style.transition =
      "all .35s ease";

      request.style.transform =
      "translateX(-30px)";

      request.style.opacity =
      "0";


      setTimeout(() => {

        request.remove();

        console.log(
          "Task request rejected"
        );

      }, 350);

    }
  );

});


/* =========================================================
   HISTORY DELETE
========================================================= */

document
.querySelectorAll(
  ".history-delete"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const historyItem =
      button.closest(
        ".customer-history-item"
      );


      if (!historyItem) return;


      historyItem.style.transition =
      "all .3s ease";

      historyItem.style.opacity =
      "0";

      historyItem.style.transform =
      "translateY(-8px)";


      setTimeout(() => {

        historyItem.remove();

      }, 300);

    }
  );

});


/* =========================================================
   MINER SEARCH
========================================================= */

const minerSearchInput =
document.getElementById(
  "miner-search-input"
);


if (minerSearchInput) {

  minerSearchInput.addEventListener(
    "input",
    () => {

      const query =
      minerSearchInput.value
      .trim()
      .toLowerCase();


      document
      .querySelectorAll(
        ".miner-user-card"
      )
      .forEach((card) => {

        const userId =
        card.dataset.userId
        ?.toLowerCase() || "";


        card.style.display =
        !query ||
        userId.includes(query)
        ? "": "none";

      });

    }
  );

}


/* =========================================================
   BLOCK USER
========================================================= */

document
.querySelectorAll(
  ".miner-block-button"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const userCard =
      button.closest(
        ".miner-user-card"
      );


      if (!userCard) return;


      userCard.classList.add(
        "blocked"
      );


      const status =
      userCard.querySelector(
        ".miner-user-status"
      );


      if (status) {

        status.textContent =
        "BLOCKED";

      }


      console.log(
        "User blocked:",
        userCard.dataset.userId
      );

    }
  );

});


/* =========================================================
   UNBLOCK USER
========================================================= */

document
.querySelectorAll(
  ".miner-unblock-button"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const userCard =
      button.closest(
        ".miner-user-card"
      );


      if (!userCard) return;


      userCard.classList.remove(
        "blocked"
      );


      const status =
      userCard.querySelector(
        ".miner-user-status"
      );


      if (status) {

        status.textContent =
        "ACTIVE";

      }


      console.log(
        "User unblocked:",
        userCard.dataset.userId
      );

    }
  );

});


/* =========================================================
   EDIT COIN
========================================================= */

document
.querySelectorAll(
  ".miner-edit-button"
)
.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const userCard =
      button.closest(
        ".miner-user-card"
      );


      const userId =
      userCard?.dataset.userId;


      console.log(
        "Edit coin for:",
        userId
      );


      /*
                 * Next backend/UI stage:
                 *
                 * Open Edit Coin modal
                 *
                 * BTTC
                 * USDT
                 * PEPE
                 *
                 * Admin enters adjustment
                 * and confirms.
                 */

    }
  );

});


/* =========================================================
   ADMIN PAGE NAVIGATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const adminButton =
  document.getElementById("open-admin-page");

  const adminPage =
  document.getElementById("admin-page");

  const profilePage =
  document.getElementById("profile-page");

  const adminBackButton =
  document.getElementById("admin-back-profile");


  /* =========================================
     CHECK ELEMENTS
  ========================================= */

  console.log("Admin button:",
    adminButton);
  console.log("Admin page:",
    adminPage);
  console.log("Profile page:",
    profilePage);


  /* =========================================
     OPEN ADMIN PAGE
  ========================================= */

  if (adminButton) {

    adminButton.addEventListener("click", (event) => {

      event.preventDefault();
      event.stopPropagation();

      console.log("ADMIN BUTTON CLICKED");


      /* Hide every page */

      document
      .querySelectorAll(".page")
      .forEach((page) => {

        page.classList.remove(
          "active-page"
        );

      });


      /* Show Admin page */

      if (adminPage) {

        adminPage.classList.add(
          "active-page"
        );

        console.log(
          "ADMIN PAGE OPENED"
        );

      } else {

        console.error(
          "ERROR: #admin-page was not found."
        );

      }


      /* Remove active state from bottom nav */

      document
      .querySelectorAll(".nav-item")
      .forEach((item) => {

        item.classList.remove(
          "active-nav"
        );

      });


      /* Hide bottom navigation while admin is open */

      const bottomNav =
      document.querySelector(
        ".bottom-nav"
      );

      if (bottomNav) {

        bottomNav.classList.add(
          "admin-nav-hidden"
        );

      }

    });

  } else {

    console.error(
      "ERROR: #open-admin-page was not found."
    );

  }


  /* =========================================
     ADMIN → PROFILE
  ========================================= */

  if (adminBackButton) {

    adminBackButton.addEventListener(
      "click",
      (event) => {

        event.preventDefault();
        event.stopPropagation();


        /* Hide Admin */

        if (adminPage) {

          adminPage.classList.remove(
            "active-page"
          );

        }


        /* Show Profile */

        if (profilePage) {

          profilePage.classList.add(
            "active-page"
          );

        }


        /* Activate Profile navigation */

        document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

          item.classList.remove(
            "active-nav"
          );


          if (
            item.dataset.page ===
            "profile-page"
          ) {

            item.classList.add(
              "active-nav"
            );

          }

        });


        /* Show bottom navigation */

        const bottomNav =
        document.querySelector(
          ".bottom-nav"
        );

        if (bottomNav) {

          bottomNav.classList.remove(
            "admin-nav-hidden"
          );

        }

      }
    );

  }

});