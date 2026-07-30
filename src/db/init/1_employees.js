module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id INT PRIMARY KEY,
            F_name VARCHAR(100) NOT NULL,
            L_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE
        )
    `);
    }