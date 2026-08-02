const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// POST /auth/login
exports.Login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Fetch user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password with hashed password in DB
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Token lasts longer if "Remember Me" is checked
    const expiresIn = rememberMe ? '30d' : '1d';

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    // Remove password before sending user back
    delete user.password;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};