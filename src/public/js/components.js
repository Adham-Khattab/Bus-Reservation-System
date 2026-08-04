document.addEventListener("DOMContentLoaded", () => {
  fetch("/partials/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-placeholder").innerHTML = html;
      showAdminLinkIfApplicable();
    });

  fetch("/partials/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("footer-placeholder").innerHTML = html;
    });
});

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
