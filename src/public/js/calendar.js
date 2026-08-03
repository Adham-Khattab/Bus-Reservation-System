document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');

    // Check BOTH storages for the user object
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!userData) {
        console.error('No logged-in user found — cannot load reservations.');
        console.log('DEBUG localStorage keys:', Object.keys(localStorage));
        console.log('DEBUG sessionStorage keys:', Object.keys(sessionStorage));
        return;
    }

    const user = JSON.parse(userData);

    let events = [];

    try {
        const response = await fetch(`/api/reservations/mine?employee_id=${user.employee_id}`);
        const data = await response.json();

        if (data.success) {
            events = data.reservations.map(trip => {

                // travel_date comes back as YYYY-MM-DD
                // pickup_time comes back as HH:MM:SS
                const datePart = trip.travel_date.slice(0, 10);
                const start = `${datePart}T${trip.pickup_time}`;

                const startDate = new Date(start);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

                return {
                    title: `${trip.direction} — Bus ${trip.bus_number}`,
                    start: start,
                    end: endDate.toISOString(),
                    extendedProps: {
                        tripId: trip.reservation_id
                    }
                };
            });
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Failed to load reservations:', error);
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {

        // Show week view by default
        initialView: 'timeGridWeek',

        // Open on today's date
        initialDate: new Date(),

        // Start the week on Monday
        firstDay: 1,

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        events: events,

        eventClick: function (info) {
            const tripId = info.event.extendedProps.tripId;
            window.location.href = `trip-detail.html?id=${tripId}`;
        }

    });

    calendar.render();

});