document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');

    // Check BOTH storages for the user object — don't guess based on whether
    // 'token' exists, since that guess was silently failing before.
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
                // travel_date comes back as an ISO date string, pickup_time as HH:MM:SS
                const datePart = trip.travel_date.slice(0, 10);
                const start = `${datePart}T${trip.pickup_time}`;
                const startDate = new Date(start);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour block

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

        initialView: 'timeGridWeek',

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