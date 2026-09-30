/* =========================================
   VELOX AUTHENTICATION
========================================= */


/* ---------- Storage ---------- */

function getStoredUsers() {
  try {
    return JSON.parse(
      localStorage.getItem("velox-users") || "[]"
    );
  } catch {
    return [];
  }
}


function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("velox-user") || "null"
    );
  } catch {
    return null;
  }
}


function isLoggedIn() {
  return !!getCurrentUser();
}


/* ---------- Return URL ---------- */

function getReturnUrl() {
  return localStorage.getItem("velox-return-url");
}


function saveReturnUrl(url) {
  if (!url) return;

  localStorage.setItem(
    "velox-return-url",
    url
  );
}


function clearReturnUrl() {
  localStorage.removeItem("velox-return-url");
}


/* ---------- Redirect ---------- */

function goToLogin(returnUrl = null) {

  if (returnUrl) {
    saveReturnUrl(returnUrl);
  }

  window.location.href = "login.html";
}


function goToSignup(returnUrl = null) {

  if (returnUrl) {
    saveReturnUrl(returnUrl);
  }

  window.location.href = "login.html#signup";
}


/* =========================================
   CARD SWITCHING
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const loginCard = document.getElementById("login-card");
  const signupCard = document.getElementById("signup-card");
  const loader = document.getElementById("card-loader");

  const toSignupBtn =
    document.getElementById("to-signup");

  const toLoginBtn =
    document.getElementById("to-login");


  if (!loginCard || !signupCard) return;


  let isLogin = true;
  let busy = false;


  function switchCard(showLogin) {

    if (busy || isLogin === showLogin) {
      return;
    }

    busy = true;

    const current =
      isLogin ? loginCard : signupCard;

    const next =
      isLogin ? signupCard : loginCard;


    current.classList.add("loading");

    loader?.classList.add("active");


    setTimeout(() => {

      loader?.classList.remove("active");

      current.classList.remove(
        "active",
        "loading"
      );

      current.classList.add("inactive");


      next.classList.remove("inactive");

      next.classList.add("active");


      isLogin = showLogin;

      busy = false;


      /* Keep URL hash synchronized */

      if (showLogin) {
        history.replaceState(
          null,
          "",
          window.location.pathname
        );
      } else {
        history.replaceState(
          null,
          "",
          "#signup"
        );
      }

    }, 1200);
  }


  toSignupBtn?.addEventListener(
    "click",
    (e) => {

      e.preventDefault();

      switchCard(false);
    }
  );


  toLoginBtn?.addEventListener(
    "click",
    (e) => {

      e.preventDefault();

      switchCard(true);
    }
  );


  /* ---------- Initial card ---------- */

  if (window.location.hash === "#signup") {

    loginCard.classList.remove("active");
    loginCard.classList.add("inactive");

    signupCard.classList.remove("inactive");
    signupCard.classList.add("active");

    isLogin = false;

  } else {

    loginCard.classList.remove("inactive");
    loginCard.classList.add("active");

    signupCard.classList.remove("active");
    signupCard.classList.add("inactive");

    isLogin = true;
  }


  /* ---------- Forms ---------- */

  document
    .getElementById("login-form")
    ?.addEventListener(
      "submit",
      handleLogin
    );


  document
    .getElementById("signup-form")
    ?.addEventListener(
      "submit",
      handleSignup
    );
});


/* =========================================
   LOGIN
========================================= */

function handleLogin(e) {

  e.preventDefault();


  const email =
    document
      .getElementById("login-email")
      ?.value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("login-password")
      ?.value;


  if (!email || !password) {

    alert("Please enter email and password.");

    return;
  }


  const users = getStoredUsers();


  const user = users.find(
    (u) =>
      u.email === email &&
      u.password === password
  );


  if (!user) {

    alert("Invalid email or password.");

    return;
  }


  /* ---------- Create session ---------- */

  const sessionUser = {

    id: user.id,

    name: user.name,

    email: user.email

  };


  localStorage.setItem(
    "velox-user",
    JSON.stringify(sessionUser)
  );


  /* ---------- Return to previous page ---------- */

  const returnUrl = getReturnUrl();


  if (returnUrl) {

    clearReturnUrl();

    window.location.href = returnUrl;

    return;
  }


  /* ---------- No return page ---------- */

  window.location.href = "profile.html";
}


/* =========================================
   SIGN UP
========================================= */

function handleSignup(e) {

  e.preventDefault();


  const name =
    document
      .getElementById("signup-name")
      ?.value
      .trim();


  const email =
    document
      .getElementById("signup-email")
      ?.value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("signup-password")
      ?.value;


  const confirm =
    document
      .getElementById("signup-confirm")
      ?.value;


  /* ---------- Validation ---------- */

  if (!name || !email || !password || !confirm) {

    alert("Please fill in all fields.");

    return;
  }


  if (password !== confirm) {

    alert("Passwords do not match.");

    return;
  }


  const users = getStoredUsers();


  /* ---------- Existing account ---------- */

  const existingUser = users.find(
    (user) => user.email === email
  );


  if (existingUser) {

    alert(
      "An account with this email already exists. Please log in."
    );


    document
      .getElementById("to-login")
      ?.click();


    const loginEmail =
      document.getElementById("login-email");


    if (loginEmail) {
      loginEmail.value = email;
    }


    return;
  }


  /* ---------- Create user ---------- */

  const newUser = {

    id: "user-" + Date.now(),

    name,

    email,

    password,

    createdAt: new Date().toISOString(),

    bookings: [],

    favorites: []

  };


  users.push(newUser);


  localStorage.setItem(
    "velox-users",
    JSON.stringify(users)
  );


  /* ---------- Show success modal ---------- */

  showSignupSuccessModal(email);
}


/* =========================================
   SIGNUP SUCCESS MODAL
========================================= */

function showSignupSuccessModal(email) {

  const modal =
    document.getElementById("auth-modal");


  const title =
    document.getElementById("auth-modal-title");


  const message =
    document.getElementById("auth-modal-message");


  const loginBtn =
    document.getElementById("auth-modal-login");


  const signupBtn =
    document.getElementById("auth-modal-signup");


  const closeBtn =
    document.getElementById("auth-modal-close");


  if (!modal) return;


  modal.classList.add("active");
  modal.classList.add("success");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  const badge =
    modal.querySelector(".auth-modal__badge");


  if (badge) {
    badge.textContent = "WELCOME TO VELOX";
  }


  title.textContent =
    "Account Created";


  message.textContent =
    "Your VELOX account was successfully created. Please log in with your new account to continue.";


  signupBtn.style.display = "none";


  loginBtn.innerHTML =
    'Log In <i class="fa-solid fa-arrow-right"></i>';


  loginBtn.onclick = () => {

    closeAuthModal();


    const loginEmail =
      document.getElementById("login-email");


    if (loginEmail) {
      loginEmail.value = email;
    }


    document
      .getElementById("to-login")
      ?.click();
  };


  closeBtn.onclick = () => {

    closeAuthModal();

    signupBtn.style.display = "";

  };
}


/* =========================================
   AUTH MODAL
========================================= */

function showAuthModal() {

  const modal =
    document.getElementById("auth-modal");


  const title =
    document.getElementById("auth-modal-title");


  const message =
    document.getElementById("auth-modal-message");


  const loginBtn =
    document.getElementById("auth-modal-login");


  const signupBtn =
    document.getElementById("auth-modal-signup");


  const closeBtn =
    document.getElementById("auth-modal-close");


  if (!modal) return;


  modal.classList.remove("success");


  modal.classList.add("active");


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  const badge =
    modal.querySelector(".auth-modal__badge");


  if (badge) {
    badge.textContent = "VELOX ACCOUNT";
  }


  title.textContent =
    "Login Required";


  message.textContent =
    "You need a VELOX account to continue with your booking.";


  signupBtn.style.display = "";


  loginBtn.innerHTML =
    'Log In <i class="fa-solid fa-arrow-right"></i>';


  loginBtn.onclick = () => {

    closeAuthModal();

    goToLogin();
  };


  signupBtn.onclick = () => {

    closeAuthModal();

    goToSignup();
  };


  closeBtn.onclick = closeAuthModal;
}


function closeAuthModal() {

  const modal =
    document.getElementById("auth-modal");


  if (!modal) return;


  modal.classList.remove(
    "active",
    "success"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* ---------- Close when clicking backdrop ---------- */

document.addEventListener(
  "click",
  (e) => {

    if (
      e.target.classList.contains(
        "auth-modal__backdrop"
      )
    ) {

      closeAuthModal();
    }
  }
);


/* ---------- Escape key ---------- */

document.addEventListener(
  "keydown",
  (e) => {

    if (e.key === "Escape") {
      closeAuthModal();
    }
  }
);