/* ==========================================
   PASSENGER COUNTER
========================================== */

const minusBtn = document.getElementById("minus");
const plusBtn = document.getElementById("plus");
const passengerCount = document.getElementById("passengerCount");

let passengers = 1;

passengerCount.textContent = passengers;

plusBtn.addEventListener("click", () => {
  passengers++;

  passengerCount.textContent = passengers;
});

minusBtn.addEventListener("click", () => {
  if (passengers > 1) {
    passengers--;

    passengerCount.textContent = passengers;

    // Remove extra selected seats
    const selectedSeats = document.querySelectorAll(".seat.selected");

    if (selectedSeats.length > passengers) {
      selectedSeats[selectedSeats.length - 1].classList.remove("selected");
    }
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

    const selected = document.querySelectorAll(".seat.selected");

    if (!seat.classList.contains("selected")) {
      if (selected.length >= passengers) {
        alert("You cannot select more seats than passengers.");

        return;
      }
    }

    seat.classList.toggle("selected");
  });
});

document
  .getElementById("travelDate")
  .addEventListener("change", loadOccupiedSeats);

document
  .getElementById("pickupTime")
  .addEventListener("change", loadOccupiedSeats);

document.querySelectorAll('input[name="direction"]').forEach((radio) => {
  radio.addEventListener("change", loadOccupiedSeats);
});
/* ==========================================
   EMPLOYEE TAGS
========================================== */

const searchInput = document.getElementById("employeeSearch");
const addEmployee = document.getElementById("addEmployee");
const selectedEmployees = document.getElementById("selectedEmployees");

let employees = [];

async function addEmployeeTag() {
  const name = searchInput.value.trim();

  if (name === "") {
    alert("Please enter an employee name.");

    return;
  }

  if (employees.includes(name)) {
    alert("Employee already added.");

    return;
  }

  const results = await searchEmployees(name);

  const exactEmployee = results.find(
    (employee) => employee.full_name.toLowerCase() === name.toLowerCase(),
  );

  if (!exactEmployee) {
    alert("Employee not found in database.");

    return;
  }

  employees.push(exactEmployee.full_name);

  const tag = document.createElement("div");

  tag.className = "tag";

  tag.innerHTML = `
        ${exactEmployee.full_name}
        <span class="remove-tag">&times;</span>
    `;

  selectedEmployees.appendChild(tag);

  searchInput.value = "";

  tag.querySelector(".remove-tag").addEventListener("click", () => {
    employees = employees.filter((emp) => emp !== exactEmployee.full_name);

    tag.remove();
  });
}
addEmployee.addEventListener("click", addEmployeeTag);

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    addEmployeeTag();
  }
});

/* ==========================================
   BOOK BUTTON
========================================== */

const bookButton = document.querySelector(".book-btn");

bookButton.addEventListener("click", async () => {
  const station = document.getElementById("station").value;

  const date = document.getElementById("travelDate").value;

  const time = document.getElementById("pickupTime").value;

  const directionElement = document.querySelector(
    "input[name='direction']:checked",
  );

  const direction = directionElement.parentElement.innerText.trim();

  const selectedSeats = [];

  document.querySelectorAll(".seat.selected").forEach((seat) => {
    selectedSeats.push(Number(seat.innerText));
  });

  // ==========================================
  // VALIDATION
  // ==========================================

  if (employees.length === 0) {
    alert("Please add at least one employee.");

    return;
  }

  if (date === "") {
    alert("Please choose a travel date.");

    return;
  }

  if (selectedSeats.length !== employees.length) {
    alert("Please select one seat for every employee.");

    return;
  }

  // ==========================================
  // RESERVATION OBJECT
  // ==========================================

  const reservation = {
    employees: employees,

    passengers: employees.length,

    station: station,

    date: date,

    time: time,

    direction: direction,

    seats: selectedSeats,

    bus_id: 1,
  };

  try {
    bookButton.disabled = true;

    bookButton.innerText = "Booking...";

    // ==========================================
    // SEND TO BACKEND
    // ==========================================

    const response = await fetch("/api/reservations", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(reservation),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Reservation failed");
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    alert("Reservation created successfully!");

    console.log("Reservation IDs:", data.reservationIds);

    // Clear employees

    employees = [];

    selectedEmployees.innerHTML = "";

    // Clear seats

    document.querySelectorAll(".seat.selected").forEach((seat) => {
      seat.classList.remove("selected");
    });

    // Refresh seats

    await loadOccupiedSeats();
  } catch (error) {
    console.error(error);

    alert("Booking failed: " + error.message);
  } finally {
    bookButton.disabled = false;

    bookButton.innerText = "Book Now!";
  }
});

/* ==========================================
   MINIMUM DATE = TODAY
========================================== */

const today = new Date().toISOString().split("T")[0];

document.getElementById("travelDate").setAttribute("min", today);

/* ==========================================
   LOAD EMPLOYEES FROM DATABASE
========================================== */

async function searchEmployees(search = "") {
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
    console.error("Employee loading error:", error);

    return [];
  }
}

// console.log("Employees:", employeeSuggestions);

/* ==========================================
   LOAD STATIONS
========================================== */

async function loadStations() {
  try {
    const response = await fetch("/api/dashboard/stations");

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    const stationSelect = document.getElementById("station");

    stationSelect.innerHTML = `<option value="">
                Select station
            </option>`;

    data.stations.forEach((station) => {
      const option = document.createElement("option");

      option.value = station.station_name;

      option.textContent = station.station_name;

      stationSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load stations:", error);
  }
}

/* ==========================================
   LOAD OCCUPIED SEATS
========================================== */

async function loadOccupiedSeats() {
  const date = document.getElementById("travelDate").value;

  const time = document.getElementById("pickupTime").value;

  const directionElement = document.querySelector(
    "input[name='direction']:checked",
  );

  if (!date || !time || !directionElement) {
    return;
  }

  const direction = directionElement.parentElement.innerText.trim();

  try {
    const url =
      `/api/dashboard/occupied-seats` +
      `?bus_id=1` +
      `&travel_date=${encodeURIComponent(date)}` +
      `&pickup_time=${encodeURIComponent(time)}` +
      `&direction=${encodeURIComponent(direction)}`;

    const response = await fetch(url);

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    document.querySelectorAll(".seat").forEach((seat) => {
      const number = Number(seat.set.innerText);

      if (data.occupiedSeats.includes(number)) {
        seat.classList.add("occupied");

        seat.classList.remove("selected");
      } else {
        seat.classList.remove("occupied");
      }
    });
  } catch (error) {
    console.error("Failed to load occupied seats:", error);
  }
}

/* ==========================================
   SEAT EVENTS
========================================== */

function attachSeatEvents() {
  seats.forEach((seat) => {
    seat.addEventListener("click", () => {
      if (seat.classList.contains("occupied")) {
        return;
      }

      const selected = document.querySelectorAll(".seat.selected");

      if (!seat.classList.contains("selected")) {
        if (selected.length >= employees.length) {
          alert("You cannot select more seats than passengers.");
          return;
        }
      }
      seat.classList.toggle("selected");
    });
  });
}

/* ==========================================
   TRIP CHANGE EVENTS
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

/* ==========================================
   INITIALIZE DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadStations();
  attachSeatEvents();
});
