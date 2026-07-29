module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            user_name VARCHAR(100),
            category VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
};