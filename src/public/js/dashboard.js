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
========================================== */

function getCurrentBusId() {
  const pickup_time = document.getElementById("pickupTime").value;
  const direction = document.querySelector(
    "input[name='direction']:checked",
  ).value;

  // pickup_time from buses comes back as "HH:MM:SS" from Postgres —
  // compare on the "HH:MM" prefix so it matches the <select> value.
  const bus = buses.find(
    (b) => b.pickup_time?.slice(0, 5) === pickup_time && b.direction === direction,
  );

  return bus ? bus.bus_id : null;
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

  // ============================
  // REQUEST BODY
  // ============================

  // reservationController.js expects station NAME (not id), a "date"/"time"
  // pair (not travel_date/pickup_time), a "seats" array, and a "passengers"
  // count, with employees sent as plain full-name strings in the same order
  // as their seats.
  const stationName =
    stationSelect.options[stationSelect.selectedIndex]?.textContent || "";

  // NOTE: bus_number was missing here, which is why the backend
  // rejected the request with "Bus number is required". loadOccupiedSeats()
  // below already hardcodes bus_id=1 for the seat grid, so this app
  // currently assumes a single bus. Using the same "1" here keeps the
  // booking request consistent with the seat-availability check.
  // If you add support for multiple buses later, replace this with a
  // real bus selector value instead of the hardcoded "1".
  const reservation = {
    employees: employees.map((emp) => emp.full_name),

    passengers: employees.length,

    seats: employees.map((emp) => emp.seat_number),

    station: stationName,

    direction,

    date: travel_date,

    time: pickup_time,

    bus_number: 1,
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

  const bus_id = getCurrentBusId();

  if (!bus_id) {
    // No bus is assigned to this pickup time + direction combo —
    // nothing to mark as occupied, and booking will fail server-side too.
    document.querySelectorAll(".seat").forEach((seat) => {
      seat.classList.remove("occupied");
    });
    return;
  }

  try {
    const response = await fetch(
      `/api/dashboard/occupied-seats?bus_id=${bus_id}&travel_date=${travel_date}&pickup_time=${pickup_time}&direction=${encodeURIComponent(direction)}`,
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
