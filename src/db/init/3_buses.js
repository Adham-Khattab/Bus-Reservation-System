module.exports = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS buses (
            bus_id SERIAL PRIMARY KEY,
            bus_number VARCHAR(20) NOT NULL,
            license_plate VARCHAR(20) UNIQUE,
            driver_name VARCHAR(100),
            driver_phone VARCHAR(20),
            capacity INT NOT NULL DEFAULT 12,
            pickup_time TIME,
            direction VARCHAR(20),
            CONSTRAINT unique_bus_per_slot UNIQUE (pickup_time, direction)
        )
    `);

    // Safety net for databases created before pickup_time/direction existed
    await pool.query(`ALTER TABLE buses ADD COLUMN IF NOT EXISTS pickup_time TIME`);
    await pool.query(`ALTER TABLE buses ADD COLUMN IF NOT EXISTS direction VARCHAR(20)`);

    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'unique_bus_per_slot'
                AND conrelid = 'buses'::regclass
            ) THEN
                ALTER TABLE buses
                    ADD CONSTRAINT unique_bus_per_slot UNIQUE (pickup_time, direction);
            END IF;
        END $$;
    `);
};