module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            suggestion TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
};