/* ==========================================
   GLOBAL VARIABLES
========================================== */

let employees = []; // Employees selected for booking
let buses = []; // All buses, each dedicated to one pickup_time + direction

const searchInput = document.getElementById("employeeSearch");
const addEmployeeBtn = document.getElementById("addEmployee");
const selectedEmployees = document.getElementById("selectedEmployees");
const bookButton = document.getElementById("bookBtn");

/* ==========================================
   LOGGED-IN USER
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const rawUser = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!rawUser) {
    window.location.href = "./login.html";
    return;
  }

  // Load logged in user
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;

  const userData = storage.getItem("user");

  if (userData) {
    const user = JSON.parse(userData);

    const welcome = document.querySelector(".overlay h1");

    welcome.textContent = `Welcome, ${user.f_name} 👋`;
  }

  await loadStations();

  await loadBuses();

  await loadOccupiedSeats();
});

/* ==========================================
   LOAD BUSES (so we know which bus is assigned
   to the currently selected pickup time + direction)
========================================== */

async function loadBuses() {
  try {
    const response = await fetch("/api/dashboard/buses");

    if (!response.ok) {
      throw new Error("Failed to load buses.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    buses = data.buses;
  } catch (error) {
    console.error(error);
  }
}

/* ==========================================
   RESOLVE THE BUS FOR THE CURRENTLY SELECTED
   PICKUP TIME + DIRECTION
   NOTE: buses are keyed by bus_number (string),
   not bus_id — the backend no longer returns
   bus_id at all (see dashboardController.js
   getBuses), so we resolve and use bus_number
   everywhere on the frontend too.
========================================== */

function getCurrentBusNumber() {
  const pickup_time = document.getElementById("pickupTime").value;
  const direction = document.querySelector(
    "input[name='direction']:checked",
  ).value;

  // pickup_time from buses comes back as "HH:MM:SS" from Postgres —
  // compare on the "HH:MM" prefix so it matches the <select> value.
  const bus = buses.find(
    (b) => b.pickup_time?.slice(0, 5) === pickup_time && b.direction === direction,
  );

  return bus ? bus.bus_number : null;
}

/* ==========================================
   EMPLOYEE SEARCH
========================================== */

async function searchEmployees(search) {
  try {
    const response = await fetch(
      `/api/dashboard/employees?search=${encodeURIComponent(search)}`,
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.employees;
  } catch (error) {
    console.error(error);

    return [];
  }
}
async function addEmployee() {
  const search = searchInput.value.trim();

  if (!search) {
    alert("Enter an employee name.");
    return;
  }

  const results = await searchEmployees(search);

  if (results.length === 0) {
    alert("Employee not found.");
    return;
  }

  const employee = results[0];

  const alreadyAdded = employees.find(
    (emp) => emp.employee_id === employee.employee_id,
  );

  if (alreadyAdded) {
    alert("Employee already selected.");
    return;
  }

  employees.push({
    employee_id: employee.employee_id,
    full_name: employee.full_name,
    seat_number: null,
  });

  const tag = document.createElement("div");
  tag.className = "tag";
  tag.dataset.employeeId = employee.employee_id;

  tag.innerHTML = `
        ${employee.full_name}
        <span class="remove-tag">&times;</span>
    `;

  selectedEmployees.appendChild(tag);

  tag.querySelector(".remove-tag").addEventListener("click", () => {
    employees = employees.filter(
      (emp) => emp.employee_id !== employee.employee_id,
    );

    tag.remove();
    updateSeatAssignments();
  });

  searchInput.value = "";
}

addEmployeeBtn.addEventListener("click", addEmployee);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addEmployee();
  }
});

/* ==========================================
   SEAT SELECTION
========================================== */

const seats = document.querySelectorAll(".seat");

seats.forEach((seat) => {
  seat.addEventListener("click", () => {
    if (seat.classList.contains("occupied")) {
      return;
    }

    // Prevent selecting more seats than employees
    const selectedSeats = document.querySelectorAll(".seat.selected");

    if (
      !seat.classList.contains("selected") &&
      selectedSeats.length >= employees.length
    ) {
      alert("Select employees first.");
      return;
    }

    seat.classList.toggle("selected");

    // Update employee -> seat mapping
    updateSeatAssignments();
  });
});

/* ==========================================
   ASSIGN SEATS TO EMPLOYEES
========================================== */

function updateSeatAssignments() {
  const selectedSeatNumbers = [];

  document.querySelectorAll(".seat.selected").forEach((seat) => {
    selectedSeatNumbers.push(Number(seat.innerText));
  });

  employees.forEach((employee, index) => {
    employee.seat_number = selectedSeatNumbers[index] || null;
  });

  console.log(employees);
}

/* ==========================================
   BOOK RESERVATION
========================================== */

bookButton.addEventListener("click", async () => {
  const stationSelect = document.getElementById("station");
  const station_id = Number(stationSelect.value);

  const travel_date = document.getElementById("travelDate").value;

  const pickup_time = document.getElementById("pickupTime").value;

  const direction = document.querySelector(
    "input[name='direction']:checked",
  ).value;

  // ============================
  // VALIDATION
  // ============================

  if (employees.length === 0) {
    alert("Please add at least one employee.");
    return;
  }

  if (!station_id) {
    alert("Please select a pickup station.");
    return;
  }

  if (!travel_date) {
    alert("Please select a travel date.");
    return;
  }

  if (!pickup_time) {
    alert("Please select a pickup time.");
    return;
  }

  const unassigned = employees.some((emp) => emp.seat_number === null);

  if (unassigned) {
    alert("Please select one seat for each employee.");
    return;
  }

  // Resolve the real bus for this pickup time + direction instead of
  // hardcoding one. If no bus covers this slot, bail out before hitting
  // the server (it would reject with "Bus not found" anyway).
  const bus_number = getCurrentBusNumber();

  if (!bus_number) {
    alert("No bus is available for the selected time and direction.");
    return;
  }

  // ============================
  // REQUEST BODY
  // ============================

  // reservationController.js expects station NAME (not id), a "date"/"time"
  // pair (not travel_date/pickup_time), a "seats" array, and a "passengers"
  // count, with employees sent as plain full-name strings in the same order
  // as their seats.
  const stationName =
    stationSelect.options[stationSelect.selectedIndex]?.textContent || "";

  const reservation = {
    employees: employees.map((emp) => emp.full_name),

    passengers: employees.length,

    seats: employees.map((emp) => emp.seat_number),

    station: stationName,

    direction,

    date: travel_date,

    time: pickup_time,

    bus_number,
  };

  try {
    bookButton.disabled = true;
    bookButton.innerText = "Booking...";

    const response = await fetch("/api/reservations", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(reservation),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    alert("Reservation created successfully!");

    console.log(data);

    // ============================
    // RESET PAGE
    // ============================

    employees = [];

    selectedEmployees.innerHTML = "";
    searchInput.value = "";

    document.querySelectorAll(".seat").forEach((seat) => {
      seat.classList.remove("selected");
    });

    await loadOccupiedSeats();
  } catch (err) {
    console.error(err);

    alert(err.message);

    // Someone may have just taken the seat we thought was free —
    // refresh so the grid reflects reality.
    await loadOccupiedSeats();
  } finally {
    bookButton.disabled = false;
    bookButton.innerText = "Book Now!";
  }
});

/* ==========================================
   LOAD STATIONS
========================================== */

async function loadStations() {
  try {
    const response = await fetch("/api/dashboard/stations");

    if (!response.ok) {
      throw new Error("Failed to load stations.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    const stationSelect = document.getElementById("station");

    stationSelect.innerHTML = `<option value="">Select Pickup Station</option>`;

    data.stations.forEach((station) => {
      const option = document.createElement("option");

      option.value = station.station_id;
      option.textContent = station.station_name;

      stationSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    alert("Unable to load stations.");
  }
}
/* ==========================================
   LOAD OCCUPIED SEATS
========================================== */

async function loadOccupiedSeats() {
  const travel_date = document.getElementById("travelDate").value;
  const pickup_time = document.getElementById("pickupTime").value;
  const direction = document.querySelector(
    "input[name='direction']:checked",
  ).value;

  if (!travel_date || !pickup_time) {
    return;
  }

  const bus_number = getCurrentBusNumber();

  if (!bus_number) {
    // No bus is assigned to this pickup time + direction combo —
    // nothing to mark as occupied, and booking will fail server-side too.
    document.querySelectorAll(".seat").forEach((seat) => {
      seat.classList.remove("occupied");
    });
    return;
  }

  try {
    const response = await fetch(
      `/api/dashboard/occupied-seats?bus_number=${encodeURIComponent(bus_number)}&travel_date=${travel_date}&pickup_time=${pickup_time}&direction=${encodeURIComponent(direction)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to load occupied seats.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    document.querySelectorAll(".seat").forEach((seat) => {
      const number = Number(seat.innerText);

      seat.classList.remove("occupied");

      if (data.occupiedSeats.includes(number)) {
        seat.classList.add("occupied");
        seat.classList.remove("selected");
      }
    });

    updateSeatAssignments();
  } catch (err) {
    console.error(err);
  }
}

/* ==========================================
   RELOAD OCCUPIED SEATS
========================================== */

document
  .getElementById("travelDate")
  .addEventListener("change", loadOccupiedSeats);

document
  .getElementById("pickupTime")
  .addEventListener("change", loadOccupiedSeats);

document.querySelectorAll("input[name='direction']").forEach((radio) => {
  radio.addEventListener("change", loadOccupiedSeats);
});