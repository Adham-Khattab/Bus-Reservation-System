module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS stations (
            station_id SERIAL PRIMARY KEY,
            station_name VARCHAR(100) NOT NULL UNIQUE
        )
    `);

    await pool.query(`
        INSERT INTO stations (station_name)
        VALUES
        ('Abu Qir'), ('Mamoura'), ('Montaza'), ('Mandara'), ('Asafra'),
        ('Miami'), ('Sidi Bishr'), ('Mohamed Nagib'), ('Victoria'), ('Louran'),
        ('Ganaklis'), ('Gleem'), ('Bokla'), ('Roushdy'), ('Mostafa Kamel'),
        ('Sidi Gaber'), ('Cleopatra'), ('Sporting'), ('Ibrahimya')
        ON CONFLICT (station_name) DO NOTHING
    `);
};