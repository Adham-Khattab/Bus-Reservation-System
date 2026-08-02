document.addEventListener("DOMContentLoaded", () => {
  fetch("/partials/header.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("header-placeholder").innerHTML = html;
    });

  fetch("/partials/footer.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("footer-placeholder").innerHTML = html;
    });
});