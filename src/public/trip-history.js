
const trips = [

    {
        date: "29/07/2026",
        busNo: "102"
    },

    {
        date: "30/07/2026",
        busNo: "115"
    },

    {
        date: "02/08/2026",
        busNo: "208"
    },

    {
        date: "05/08/2026",
        busNo: "315"
    }

];



const tripContainer = document.getElementById("tripContainer");
const searchInput = document.getElementById("search");

function displayTrips(tripsList){

    tripContainer.innerHTML = "";

    if(tripsList.length === 0){

        tripContainer.innerHTML = `
            <div class="no-trips">
                No trips found.
            </div>
        `;

        return;
    }

    tripsList.forEach(trip =>{

        const card = document.createElement("div");

        card.className = "trip-card";

        card.innerHTML = `

            <div class="left">

                <p>Date:</p>
                <p>Bus#:</p>

            </div>

            <div class="right">

                <div class="value">${trip.date}</div>
                <div class="value">${trip.busNo}</div>

            </div>

        `;

        tripContainer.appendChild(card);

    });

}


searchInput.addEventListener("input", function(){

    const text = this.value.toLowerCase();

    const filtered = trips.filter(trip =>

        trip.date.toLowerCase().includes(text) ||
        trip.busNo.toLowerCase().includes(text)

    );

    displayTrips(filtered);

});


displayTrips(trips);