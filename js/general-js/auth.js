function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("velox-user") || "null");
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function requireLogin(returnUrl) {
  if (returnUrl) {
    localStorage.setItem("velox-return-url", returnUrl);
  }
  window.location.href = "login.html";
}
function isLoggedIn() {
  return !!getCurrentUser();
}
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