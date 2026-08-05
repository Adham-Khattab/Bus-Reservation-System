document.addEventListener("DOMContentLoaded", () => {
  fetch("/partials/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-placeholder").innerHTML = html;
      showAdminLinkIfApplicable();
      attachMenuToggle();
    });

  fetch("/partials/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("footer-placeholder").innerHTML = html;
      attachLogoutHandler();
    });
});

function attachMenuToggle() {
  const header = document.querySelector(".site-header");
  const toggleBtn = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");

  if (!header || !toggleBtn || !nav) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the menu after tapping a nav link (mobile UX)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close the menu if the viewport is resized back to desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      header.classList.remove("nav-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

function attachLogoutHandler() {
  const logoutLink = document.getElementById("logoutLink");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

function showAdminLinkIfApplicable() {
  const userJson =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!userJson) return;

  try {
    const user = JSON.parse(userJson);
    const email = (user.email || "").toLowerCase();

    if (email.includes("admin")) {
      const adminLink = document.getElementById("adminLink");
      if (adminLink) adminLink.style.display = "";
    }
  } catch (error) {
    console.error("Failed to read logged-in user:", error);
  }
}