const pool = require("../db");

const RATING_LABELS = ["Bad", "Poor", "Average", "Good", "Excellent"];

// POST /api/feedback
exports.postFeedback = async (req, res) => {
  let { rating, message } = req.body;

  // Accept either a number (1-5) or a text label (e.g. "Good") from the frontend
  if (typeof rating === "string" && isNaN(Number(rating))) {
    const index = RATING_LABELS.findIndex(
      (label) => label.toLowerCase() === rating.toLowerCase(),
    );
    rating = index !== -1 ? index + 1 : null;
  } else {
    rating = Number(rating);
  }

  if (!rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Rating is required and must be between 1 and 5" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO feedback (rating, suggestion)
             VALUES ($1, $2)
             RETURNING *`,
      [rating, message || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating feedback:", error.message);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

// GET /api/feedback
exports.getFeedback = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM feedback ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching feedback:", error.message);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};