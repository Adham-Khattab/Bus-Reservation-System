// Attach this script to your sign-up page (Create Account form)

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#signupForm");
  const errorMsg = document.querySelector("#errorMsg");
  const passwordInput = document.querySelector("#employeePassword");
  const passwordHint = document.querySelector("#passwordHint");

  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const PASSWORD_RULES_MESSAGE =
    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

  function isPasswordStrong(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  }

  // Show the hint live only while the password doesn't meet the rules yet.
  // Hide it once it's empty or once it becomes strong.
  if (passwordInput && passwordHint) {
    passwordInput.addEventListener("input", () => {
      const value = passwordInput.value;

      if (value.length === 0 || isPasswordStrong(value)) {
        passwordHint.style.display = "none";
      } else {
        passwordHint.style.display = "block";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop normal form submission, we'll send it with fetch instead

    const name = form.elements["employeeName"].value.trim();
    const email = form.elements["employeeEmail"].value.trim();
    const password = form.elements["employeePassword"].value;
    const confirmPassword = form.elements["confirmPassword"].value;

    errorMsg.textContent = "";

    if (!name || !email || !password || !confirmPassword) {
      errorMsg.textContent = "Please fill in all fields.";
      return;
    }

    if (password !== confirmPassword) {
      errorMsg.textContent = "Passwords do not match.";
      return;
    }

    if (!isPasswordStrong(password)) {
      errorMsg.textContent = PASSWORD_RULES_MESSAGE;
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent =
          data.message || "Sign up failed. Please try again.";
        return;
      }

      // Success — send them to the login page
      window.location.href = "./login.html";
    } catch (error) {
      console.error("Sign up request failed:", error);
      errorMsg.textContent = "Something went wrong. Please try again.";
    }
  });
});
