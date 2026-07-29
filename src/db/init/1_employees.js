module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
            employee_id INT PRIMARY KEY,
            F_name VARCHAR(100) NOT NULL,
            L_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE
        )
    `);

    await pool.query(`
        INSERT INTO employees (employee_id, F_name, L_name, email)
        VALUES
        (1001, 'Adham', 'Khattab', 'adhamkhattab04@gmail.com'),
        (1002, 'Salma', 'Elhagam', 'salmaelhagam81@gmail.com'),
        (1003, 'Caroline', 'Peter', 'es.carolin.peter2023@alexu.edu.eg')
        ON CONFLICT (employee_id) DO NOTHING
    `);
};