document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridWeek',

        headerToolbar: {

            left: 'prev,next today',

            center: 'title',

            right: 'dayGridMonth,timeGridWeek,timeGridDay'

        },

        events: [

            {
                title: 'Service booked',
                start: '2026-09-22T08:00:00',
                end: '2026-09-22T09:00:00'
            },

            {
                title: 'Service booked',
                start: '2026-09-23T10:00:00',
                end: '2026-09-23T11:00:00'
            },

            {
                title: 'Service booked',
                start: '2026-09-24T09:00:00',
                end: '2026-09-24T10:00:00'
            },

            {
                title: 'Service booked',
                start: '2026-09-25T10:00:00',
                end: '2026-09-25T11:00:00'
            }

        ]

    });

    calendar.render();

});