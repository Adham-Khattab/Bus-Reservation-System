module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS drivers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            license_number VARCHAR(50) UNIQUE NOT NULL,
            phone VARCHAR(20),
            experience_years INT,
            bus_id INT REFERENCES buses(bus_id),
            status VARCHAR(20) DEFAULT 'active'
        )
    `);
};