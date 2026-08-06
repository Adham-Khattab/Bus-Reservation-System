// ==========================================
// GUARD: redirect non-admins away from this page
// ==========================================

(() => {
  const userJson =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!userJson) {
    window.location.href = "./login.html";
    return;
  }

  const email = (JSON.parse(userJson).email || "").toLowerCase();

  if (!email.includes("admin")) {
    window.location.href = "./Dashboard.html";
    return;
  }
})();

// ==========================================
// LOAD BUSES + DRIVERS (same source table)
// ==========================================

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadBuses() {
  try {
    const res = await fetch("/api/dashboard/buses");
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    const busesBody = document.getElementById("busesTableBody");
    busesBody.innerHTML = data.buses
      .map(
        (bus) => `
      <tr>
        <td>${escapeHtml(bus.bus_number)}</td>
        <td>${escapeHtml(bus.license_plate || "")}</td>
        <td>${escapeHtml(bus.driver_name || "")}</td>
        <td>${escapeHtml(bus.driver_phone || "")}</td>
        <td>${bus.capacity}</td>
        <td>${bus.pickup_time || ""}</td>
        <td>${bus.direction || ""}</td>
        <td><button class="admin-delete-btn" data-bus="${escapeHtml(bus.bus_number)}">Delete</button></td>
      </tr>
    `,
      )
      .join("");

    const driversBody = document.getElementById("driversTableBody");
    const busesWithDrivers = data.buses.filter((bus) => bus.driver_name);

    driversBody.innerHTML = busesWithDrivers.length
      ? busesWithDrivers
          .map(
            (bus) => `
          <tr>
            <td>${escapeHtml(bus.driver_name)}</td>
            <td>${escapeHtml(bus.driver_phone || "")}</td>
            <td>${escapeHtml(bus.bus_number)}</td>
            <td><button class="admin-remove-driver-btn" data-bus="${escapeHtml(bus.bus_number)}">Remove</button></td>
          </tr>
        `,
          )
          .join("")
      : `<tr><td colspan="4">No drivers assigned yet.</td></tr>`;
  } catch (error) {
    console.error("Failed to load buses:", error);
  }
}

// ==========================================
// DELETE BUS / REMOVE DRIVER (event delegation)
// ==========================================

document
  .getElementById("busesTableBody")
  .addEventListener("click", async (e) => {
    if (!e.target.classList.contains("admin-delete-btn")) return;

    const busNumber = e.target.dataset.bus;
    if (!confirm(`Delete bus ${busNumber}? This cannot be undone.`)) return;

    try {
      const res = await fetch(
        `/api/admin/buses/${encodeURIComponent(busNumber)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to delete bus.");
        return;
      }

      loadBuses();
    } catch (error) {
      console.error("Delete bus failed:", error);
      alert("Something went wrong. Please try again.");
    }
  });

document
  .getElementById("driversTableBody")
  .addEventListener("click", async (e) => {
    if (!e.target.classList.contains("admin-remove-driver-btn")) return;

    const busNumber = e.target.dataset.bus;
    if (!confirm(`Remove the driver from bus ${busNumber}?`)) return;

    try {
      const res = await fetch(
        `/api/admin/buses/${encodeURIComponent(busNumber)}/remove-driver`,
        {
          method: "PATCH",
        },
      );
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to remove driver.");
        return;
      }

      loadBuses();
    } catch (error) {
      console.error("Remove driver failed:", error);
      alert("Something went wrong. Please try again.");
    }
  });

// ==========================================
// LOAD RESERVATIONS
// ==========================================

async function loadReservations() {
  const statusEl = document.getElementById("reservationsStatus");
  statusEl.textContent = "";

  try {
    const res = await fetch("/api/admin/reservations");

    console.log("Reservations request status:", res.status);

    const data = await res.json();

    console.log("Reservations response:", data);

    if (!data.success) {
      statusEl.textContent = data.message || "Failed to load reservations.";
      statusEl.className = "admin-status error";
      return;
    }

    const tbody = document.getElementById("reservationsTableBody");

    if (data.reservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">No reservations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.reservations
      .map(
        (r) => `
      <tr>
        <td>${r.reservation_id}</td>
        <td>${escapeHtml(r.employee_name)}</td>
        <td>${escapeHtml(r.bus_number)}</td>
        <td>${escapeHtml(r.station_name)}</td>
        <td>${r.travel_date}</td>
        <td>${r.pickup_time}</td>
        <td>${r.direction}</td>
        <td>${r.seat_number}</td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Failed to load reservations:", error);
    statusEl.textContent =
      "Something went wrong loading reservations. Check the console for details.";
    statusEl.className = "admin-status error";
  }
}

// ==========================================
// ADD BUS FORM
// ==========================================

document.getElementById("addBusForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const statusEl = document.getElementById("busStatus");
  statusEl.textContent = "";

  const bus = {
    bus_number: document.getElementById("busNumber").value.trim(),
    license_plate: document.getElementById("licensePlate").value.trim(),
    driver_name: document.getElementById("driverName").value.trim(),
    driver_phone: document.getElementById("driverPhone").value.trim(),
    capacity: Number(document.getElementById("capacity").value),
    pickup_time: document.getElementById("pickupTime").value,
    direction: document.getElementById("direction").value,
  };

  try {
    const res = await fetch("/api/admin/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bus),
    });

    const data = await res.json();

    if (!data.success) {
      statusEl.textContent = data.message || "Failed to add bus.";
      statusEl.className = "admin-status error";
      return;
    }

    statusEl.textContent = "Bus added successfully!";
    statusEl.className = "admin-status success";
    document.getElementById("addBusForm").reset();

    loadBuses();
  } catch (error) {
    console.error("Add bus failed:", error);
    statusEl.textContent = "Something went wrong. Please try again.";
    statusEl.className = "admin-status error";
  }
});

// ==========================================
// INIT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  loadBuses();
  loadReservations();
});
