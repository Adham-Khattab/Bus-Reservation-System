module.exports = async (pool) => {
  // Fresh installs get the correct schema from the start
  await pool.query(`
        CREATE TABLE IF NOT EXISTS reservations (
            reservation_id SERIAL PRIMARY KEY,

            employee_id INT NOT NULL,
            bus_number VARCHAR(20) NOT NULL,
            station_id INT NOT NULL,
            direction VARCHAR(20) NOT NULL,
            travel_date DATE NOT NULL,
            pickup_time TIME NOT NULL,
            seat_number INT NOT NULL,
            reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
            FOREIGN KEY (bus_number) REFERENCES buses(bus_number),
            FOREIGN KEY (station_id) REFERENCES stations(station_id),

            CONSTRAINT unique_seat_per_trip UNIQUE (bus_number, travel_date, pickup_time, direction, seat_number)
        )
    `);

  // Safety net: databases created before this change still have the old
  // bus_id column instead of bus_number. This upgrades them IN PLACE —
  // no data loss, no dropping the table. It runs once; on every restart
  // after that, bus_id will no longer exist, so this block is skipped.
  const hasBusId = await pool.query(`
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations' AND column_name = 'bus_id'
    `);

  if (hasBusId.rows.length > 0) {
    console.log("Upgrading reservations table: bus_id -> bus_number ...");

    await pool.query(
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS bus_number VARCHAR(20)`,
    );

    await pool.query(`
            UPDATE reservations r
            SET bus_number = b.bus_number
            FROM buses b
            WHERE r.bus_id = b.bus_id
            AND r.bus_number IS NULL
        `);

    await pool.query(
      `ALTER TABLE reservations ALTER COLUMN bus_number SET NOT NULL`,
    );

    // Dropping the column with CASCADE also removes the old bus_id
    // foreign key and the old unique constraint that referenced it
    await pool.query(`ALTER TABLE reservations DROP COLUMN bus_id CASCADE`);

    await pool.query(`
            ALTER TABLE reservations
            ADD CONSTRAINT reservations_bus_number_fkey
            FOREIGN KEY (bus_number) REFERENCES buses(bus_number)
        `);

    await pool.query(`
            ALTER TABLE reservations
            ADD CONSTRAINT unique_seat_per_trip
            UNIQUE (bus_number, travel_date, pickup_time, direction, seat_number)
        `);

    console.log("reservations table upgraded successfully — no data was lost.");
  }

  // Safety net for databases created before "direction" existed
  await pool.query(`
        ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS direction VARCHAR(20) NOT NULL DEFAULT 'To Office'
    `);
};
