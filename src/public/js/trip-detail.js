document.addEventListener('DOMContentLoaded', async function () {

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    if (!tripId) {
        window.location.href = 'calendar.html';
        return;
    }

    let trip;

    try {
        const response = await fetch(`/api/reservations/${tripId}`);
        const data = await response.json();

        if (!data.success) {
            console.error(data.message);
            window.location.href = 'calendar.html';
            return;
        }

        trip = data.reservation;
    } catch (error) {
        console.error('Failed to load trip:', error);
        window.location.href = 'calendar.html';
        return;
    }

    const datePart = trip.travel_date.slice(0, 10);
    const startDate = new Date(`${datePart}T${trip.pickup_time}`);

    const dateStr = startDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeStr = startDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
    });

    // "To Office" means pickup = the chosen station, dropoff = the office.
    // "From Office" is the reverse.
    const pickupLabel = trip.direction === 'To Office' ? trip.station_name : 'Office';
    const dropoffLabel = trip.direction === 'To Office' ? 'Office' : trip.station_name;

    document.getElementById('tripDate').textContent = dateStr;
    document.getElementById('tripTime').textContent = timeStr;
    document.getElementById('pickup').textContent = pickupLabel;
    document.getElementById('dropoff').textContent = dropoffLabel;
    document.getElementById('driverName').textContent = trip.driver_name || 'Not assigned';
    document.getElementById('driverPhone').textContent = trip.driver_phone || '—';
    document.getElementById('busNumber').textContent = trip.bus_number;
    document.getElementById('seatNumber').textContent = trip.seat_number;

    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', async function () {
        const confirmed = window.confirm('Are you sure you want to cancel this trip? This cannot be undone.');
        if (!confirmed) return;

        cancelBtn.disabled = true;
        cancelBtn.textContent = 'Cancelling...';

        try {
            const response = await fetch(`/api/reservations/${trip.reservation_id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!data.success) {
                alert(data.message || 'Failed to cancel trip.');
                cancelBtn.disabled = false;
                cancelBtn.textContent = 'Cancel Trip';
                return;
            }

            // Trip is gone from the DB — head back to the calendar,
            // which will re-fetch reservations and the cancelled trip
            // will no longer appear.
            window.location.href = 'calendar.html?cancelled=1';
        } catch (error) {
            console.error('Failed to cancel trip:', error);
            alert('Something went wrong cancelling this trip. Please try again.');
            cancelBtn.disabled = false;
            cancelBtn.textContent = 'Cancel Trip';
        }
    });

});