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

seats.forEach(seat => {

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

/* ==========================================
   EMPLOYEE TAGS
========================================== */

const searchInput = document.getElementById("employeeSearch");
const addEmployee = document.getElementById("addEmployee");
const selectedEmployees = document.getElementById("selectedEmployees");

let employees = [];

function addEmployeeTag() {

    const name = searchInput.value.trim();

    if (name === "") {

        alert("Please enter an employee name.");

        return;

    }

    if (employees.includes(name)) {

        alert("Employee already added.");

        return;

    }

    employees.push(name);

    const tag = document.createElement("div");

    tag.className = "tag";

    tag.innerHTML = `
        ${name}
        <span class="remove-tag">&times;</span>
    `;

    selectedEmployees.appendChild(tag);

    searchInput.value = "";

    tag.querySelector(".remove-tag").addEventListener("click", () => {

        employees = employees.filter(emp => emp !== name);

        tag.remove();

        if (passengers > employees.length && employees.length > 0) {

            passengers = employees.length;

            passengerCount.textContent = passengers;

            const selected = document.querySelectorAll(".seat.selected");

            while (selected.length > passengers) {

                selected[selected.length - 1].classList.remove("selected");

            }

        }

    });

}

addEmployee.addEventListener("click", addEmployeeTag);

searchInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        e.preventDefault();

        addEmployeeTag();

    }

});

/* ==========================================
   BOOK BUTTON
========================================== */

const bookButton = document.querySelector(".book-btn");

bookButton.addEventListener("click", () => {

    const station = document.getElementById("station").value;

    const date = document.getElementById("travelDate").value;

    const time = document.getElementById("pickupTime").value;

    const direction = document.querySelector(
        "input[name='direction']:checked"
    ).parentElement.innerText.trim();

    const selectedSeats = [];

    document.querySelectorAll(".seat.selected").forEach(seat => {

        selectedSeats.push(seat.innerText);

    });

    if (employees.length === 0) {

        alert("Please add at least one employee.");

        return;

    }

    if (date === "") {

        alert("Please choose a travel date.");

        return;

    }

    if (selectedSeats.length !== passengers) {

        alert("Please select a seat for every passenger.");

        return;

    }

    const reservation = {

        employees,

        passengers,

        station,

        date,

        time,

        direction,

        seats: selectedSeats

    };

    console.log(reservation);

    alert("Reservation is ready to be sent to the server.");

    /*
    Later:

    fetch('/reservation', {

        method:'POST',

        headers:{
            'Content-Type':'application/json'
        },

        body:JSON.stringify(reservation)

    });

    */

});

/* ==========================================
   MINIMUM DATE = TODAY
========================================== */

const today = new Date().toISOString().split("T")[0];

document.getElementById("travelDate").setAttribute("min", today);

/* ==========================================
   OPTIONAL:
   PRELOAD SAMPLE EMPLOYEES
========================================== */

// Later these will come from PostgreSQL

const employeeSuggestions = [

    "Ahmed Ali",

    "Mohamed Hassan",

    "Sara Ibrahim",

    "Omar Khaled",

    "Youssef Adel",

    "Mariam Ashraf"

];

console.log("Employees:", employeeSuggestions);