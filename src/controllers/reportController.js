const pool = require("../db");

// POST /api/reports
exports.postReport = async (req, res) => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reports (description)
             VALUES ($1)
             RETURNING *`,
      [description.trim()],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating report:", error.message);
    res.status(500).json({ error: "Failed to submit report" });
  }
};

// GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reports ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};