module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            employee_id INT NOT NULL REFERENCES employees(employee_id),
            otp VARCHAR(10) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
};