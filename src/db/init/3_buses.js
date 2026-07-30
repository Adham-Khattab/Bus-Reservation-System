module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS buses (
            bus_id SERIAL PRIMARY KEY,
            bus_number VARCHAR(20) NOT NULL,
            license_plate VARCHAR(20) UNIQUE,
            driver_name VARCHAR(100),
            driver_phone VARCHAR(20),
            capacity INT NOT NULL DEFAULT 12
        )
    `);
};