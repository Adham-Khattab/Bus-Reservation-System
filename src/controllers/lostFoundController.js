const pool = require("../db");

// POST /api/lost-found
exports.postItem = async (req, res) => {
  const { description, bus_number } = req.body;

  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lost_found_items (description, bus_number, photo_url)
             VALUES ($1, $2, $3)
             RETURNING *`,
      [description, bus_number, photo_url],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating lost/found item:", error.message);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// GET /api/lost-found
exports.getItems = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lost_found_items ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching lost/found items:", error.message);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};
