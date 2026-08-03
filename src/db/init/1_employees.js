module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id SERIAL PRIMARY KEY,
            F_name VARCHAR(100) NOT NULL,
            L_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            reset_otp VARCHAR(10),
            reset_otp_expires TIMESTAMP
        )
    `);

    // Safety net for databases created before password/reset_otp columns existed
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(255)`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10)`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP`);
    }