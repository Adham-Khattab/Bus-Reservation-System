module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reservations (
            reservation_id SERIAL PRIMARY KEY,

            employee_id INT NOT NULL,
            bus_id INT NOT NULL,
            station_id INT NOT NULL,
            direction VARCHAR(20) NOT NULL,
            travel_date DATE NOT NULL,
            pickup_time TIME NOT NULL,
            seat_number INT NOT NULL,
            reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
            FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
            FOREIGN KEY (station_id) REFERENCES stations(station_id),

            CONSTRAINT unique_seat_per_trip UNIQUE (bus_id, travel_date, pickup_time, direction, seat_number)
        )
    `);
};