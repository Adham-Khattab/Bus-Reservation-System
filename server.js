require('dotenv').config();

const app = require('./src/app');
const initDB = require('./src/db/init');

const PORT = process.env.PORT || 3000;

initDB().catch(err => {
    console.error("❌ Failed to initialize database:");
    console.error(err.message);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

initDB();
app.listen(PORT, () => 
    {
         console.log('Server running on port ${PORT}');
         });



require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/db');

const PORT = process.env.PORT || 3000;

// ======================
// Initialize Database
// ======================

const initDB = async () => {
    try {

        await pool.query(`

            CREATE TABLE IF NOT EXISTS employees (
                employee_id INT PRIMARY KEY,
                F_name VARCHAR(100) NOT NULL,
                L_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE
            );

            CREATE TABLE IF NOT EXISTS stations (
                station_id SERIAL PRIMARY KEY,
                station_name VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS buses (
                bus_id SERIAL PRIMARY KEY,
                bus_number VARCHAR(20) NOT NULL,
                license_plate VARCHAR(20) UNIQUE,
                driver_name VARCHAR(100),
                driver_phone VARCHAR(20),
                capacity INT NOT NULL DEFAULT 9
            );

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id SERIAL PRIMARY KEY,

                employee_id INT NOT NULL,
                bus_id INT NOT NULL,
                station_id INT NOT NULL,

                travel_date DATE NOT NULL,
                pickup_time TIME NOT NULL,
                seat_number INT NOT NULL,

                reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (employee_id)
                    REFERENCES employees(employee_id),

                FOREIGN KEY (bus_id)
                    REFERENCES buses(bus_id),

                FOREIGN KEY (station_id)
                    REFERENCES stations(station_id),

                CONSTRAINT unique_seat_per_trip
                    UNIQUE (bus_id, travel_date, seat_number)
            );

            INSERT INTO employees
            (employee_id, F_name, L_name, email)
            VALUES
                (1001, 'Adham', 'Khattab', 'adhamkhattab04@gmail.com'),
                (1002, 'Salma', 'Elhagam', 'salmaelhagam81@gmail.com'),
                (1003, 'Caroline', 'Peter', 'es.carolin.peter2023@alexu.edu.eg')
            ON CONFLICT (employee_id) DO NOTHING;

            INSERT INTO stations (station_name)
            VALUES
                ('Abu Qir'),
                ('Mamoura'),
                ('Montaza'),
                ('Mandara'),
                ('Asafra'),
                ('Miami'),
                ('Sidi Bishr'),
                ('Mohamed Nagib'),
                ('Victoria'),
                ('Louran'),
                ('Ganaklis'),
                ('Gleem'),
                ('Bokla'),
                ('Roushdy'),
                ('Mostafa Kamel'),
                ('Sidi Gaber'),
                ('Cleopatra'),
                ('Sporting'),
                ('Ibrahimya')
            ON CONFLICT (station_name) DO NOTHING;

            INSERT INTO buses
            (bus_number, license_plate, driver_name, driver_phone, capacity)
            VALUES
                ('Bus 1', 'ABC-123', 'Mahmoud Ali', '01012345678', 9)
            ON CONFLICT (license_plate) DO NOTHING;

        `);

        console.log("✅ Database initialized successfully.");

    } catch (error) {

        console.error("❌ Failed to initialize database.");
        console.error(error);

    }
};

const startServer = async () => {

    await initDB();

    app.listen(PORT, () => {

        console.log(`🚀 Server running at http://localhost:${PORT}`);

    });

};

startServer();
});
