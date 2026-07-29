module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS lost_found_items (
            id SERIAL PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            bus_number VARCHAR(50) NOT NULL,
            photo_url TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
};