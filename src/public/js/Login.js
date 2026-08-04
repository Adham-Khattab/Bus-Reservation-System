document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  const errorMsg = document.querySelector("#errorMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop normal form submission, we'll send it with fetch instead

    const email = form.elements["employeeEmail"].value.trim();
    const password = form.elements["employeePassword"].value;
    const rememberMe = form.elements["rememberMe"].checked;

    errorMsg.textContent = "";

    if (!email || !password) {
      errorMsg.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || "Login failed.";
        return;
      }

      // Clear BOTH storages first — otherwise a previous login (e.g. an
      // admin test account with "Remember Me" checked) can leave stale
      // data behind in localStorage, which other pages would keep reading
      // even after a new, different account logs in.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Now store the new login in the correct place only
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to the dashboard on success
      window.location.href = "./Dashboard.html";
    } catch (error) {
      console.error("Login request failed:", error);
      errorMsg.textContent = "Something went wrong. Please try again.";
    }
  });
});
