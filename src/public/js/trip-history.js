document.addEventListener("DOMContentLoaded", async function () {
  const tripContainer = document.getElementById("tripContainer");
  const searchInput = document.querySelector(".search-box input");

  // login.js stores a JSON `user` object in localStorage (Remember Me)
  // or sessionStorage (otherwise). Adjust `user.employee_id` below if
  // your login response actually names this field differently.
  const rawUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const employeeId = user ? user.employee_id : null;

  if (!employeeId) {
    window.location.href = './login.html';
    return;
  }

  let trips = [];

  try {
    // Matches: routes/tripHistoryRoutes.js mounted at /api/trip-history
    // This is a fully separate endpoint from /api/reservations
    // (used by trip-detail.js) — no shared code, no route overlap.
    const response = await fetch(
      `/api/trip-history?employee_id=${encodeURIComponent(employeeId)}`,
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(errData.error || "Unknown error");
      tripContainer.innerHTML = "<p>Could not load your trip history.</p>";
      return;
    }

    // Controller responds with a plain array
    trips = await response.json();
  } catch (error) {
    console.error("Failed to load trip history:", error);
    tripContainer.innerHTML = "<p>Could not load your trip history.</p>";
    return;
  }

  function displayTrips(tripsList) {
    tripContainer.innerHTML = "";

    if (tripsList.length === 0) {
      tripContainer.innerHTML = `
                <div class="no-trips">
                    No trips found.
                </div>
            `;
      return;
    }

    tripsList.forEach((trip) => {
      // Defensive: skip any row missing a usable date instead of crashing
      // the whole page (this is what caused the earlier "Cannot read
      // properties of undefined (reading 'slice')" error).
      if (!trip.travel_date) {
        console.warn("Skipping trip with missing travel_date:", trip);
        return;
      }

      const dateStr = formatDate(trip.travel_date);

      const card = document.createElement("a");
      card.href = `trip-detail.html?id=${trip.reservationId}`;
      card.className = "trip-card";
      card.style.textDecoration = "none";
      card.style.color = "inherit";

      card.innerHTML = `
                <div class="left">
                    <p>Date:</p>
                    <p>Time:</p>
                    <p>Bus#:</p>
                </div>

                <div class="right">
                    <div class="value">${dateStr}</div>
                    <div class="value">${formatTime(trip.pickup_time)}</div>
                    <div class="value">${trip.bus_number}</div>
                </div>
            `;

      tripContainer.appendChild(card);
    });
  }

  function formatDate(travelDate) {
    // travel_date comes back as an ISO string (e.g. "2026-07-29T00:00:00.000Z")
    const datePart = travelDate.slice(0, 10);
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatTime(pickupTime) {
    // pickup_time comes back from Postgres as "HH:MM:SS" — trim to "HH:MM"
    if (!pickupTime) return "";
    return pickupTime.slice(0, 5);
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const text = this.value.toLowerCase();

      const filtered = trips.filter(
        (trip) =>
          trip.travel_date &&
          (formatDate(trip.travel_date).toLowerCase().includes(text) ||
            String(trip.bus_number).toLowerCase().includes(text)),
      );

      displayTrips(filtered);
    });
  }

  displayTrips(trips);
});