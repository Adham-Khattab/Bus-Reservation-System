module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS stations (
            station_id SERIAL PRIMARY KEY,
            station_name VARCHAR(100) NOT NULL UNIQUE
        )
    `);

}