module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS buses (
            bus_id SERIAL PRIMARY KEY,
            bus_number VARCHAR(20) NOT NULL,
            license_plate VARCHAR(20) UNIQUE,
            driver_name VARCHAR(100),
            driver_phone VARCHAR(20),
            capacity INT NOT NULL DEFAULT 9
        )
    `);
    // NOTE: driver_name/driver_phone here overlap with the separate `drivers`
    // table (owned by the Support & Info module). Flag this with the team —
    // driver data should probably live in one place only.

    await pool.query(`
        INSERT INTO buses (bus_number, license_plate, driver_name, driver_phone, capacity)
        VALUES ('Bus 1', 'ABC-123', 'Mahmoud Ali', '01012345678', 9)
        ON CONFLICT (license_plate) DO NOTHING
    `);
};