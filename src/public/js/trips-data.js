// Shared trip data. Later this can be replaced with a fetch() call to a real API —
// as long as each trip object keeps the same shape, calendar.js and trip-detail.js
// don't need to change.

const trips = [
    {
        id: 'trip-1',
        title: 'Service booked',
        start: '2026-09-22T08:00:00',
        end: '2026-09-22T09:00:00',
        pickup: '123 Main St, Alexandria',
        dropoff: '456 Corniche Rd, Alexandria',
        driverName: 'Ahmed Youssef',
        driverPhone: '+20 100 123 4567',
        busNumber: 'B-102',
        seatNumber: '14A'
    },
    {
        id: 'trip-2',
        title: 'Service booked',
        start: '2026-09-23T10:00:00',
        end: '2026-09-23T11:00:00',
        pickup: '789 Fouad St, Alexandria',
        dropoff: 'Alexandria Airport',
        driverName: 'Mostafa Kamal',
        driverPhone: '+20 101 234 5678',
        busNumber: 'B-207',
        seatNumber: '08C'
    },
    {
        id: 'trip-3',
        title: 'Service booked',
        start: '2026-09-24T09:00:00',
        end: '2026-09-24T10:00:00',
        pickup: 'Stanley Bridge, Alexandria',
        dropoff: 'Montaza Palace, Alexandria',
        driverName: 'Karim Adel',
        driverPhone: '+20 102 345 6789',
        busNumber: 'B-115',
        seatNumber: '22B'
    },
    {
        id: 'trip-4',
        title: 'Service booked',
        start: '2026-09-25T10:00:00',
        end: '2026-09-25T11:00:00',
        pickup: 'Bibliotheca Alexandrina',
        dropoff: 'Sidi Gaber Station',
        driverName: 'Omar Hassan',
        driverPhone: '+20 103 456 7890',
        busNumber: 'B-330',
        seatNumber: '05D'
    }
];

// Small helper both pages use
function getTripById(id) {
    return trips.find(trip => trip.id === id);
}