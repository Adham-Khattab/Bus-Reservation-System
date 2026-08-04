const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { sendOtpEmail } = require("../utils/mailer"); // adjust path if you place mailer.js elsewhere

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// POST /auth/login
exports.Login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Fetch employee by email
    const result = await pool.query(
      "SELECT * FROM employees WHERE email = $1",
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare password with hashed password in DB
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Token lasts longer if "Remember Me" is checked
    const expiresIn = rememberMe ? "30d" : "1d";

    const token = jwt.sign(
      { id: user.employee_id, email: user.email },
      JWT_SECRET,
      { expiresIn },
    );

    // Remove password before sending user back
    delete user.password;

    return res.status(200).json({
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// POST /auth/signup
exports.Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Password must be at least 8 characters and include an uppercase letter,
    // a lowercase letter, a number, and a special character.
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Check if an employee with this email already exists
    const existing = await pool.query(
      "SELECT employee_id FROM employees WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // Split full name into first/last to match the employees table columns
    const nameParts = name.trim().split(" ");
    const F_name = nameParts[0];
    const L_name = nameParts.slice(1).join(" ") || F_name; // fallback if only one name given

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO employees (F_name, L_name, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING employee_id, F_name, L_name, email`,
      [F_name, L_name, email, hashedPassword],
    );

    const newEmployee = result.rows[0];

    return res.status(201).json({
      message: "Account created successfully.",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// POST /auth/forgot-password
exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const result = await pool.query(
      "SELECT employee_id FROM employees WHERE email = $1",
      [email],
    );

    // Don't reveal whether the email exists or not, for security.
    // Always respond the same way, but only actually send an email if it does exist.
    if (result.rows.length > 0) {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await pool.query(
        "UPDATE employees SET reset_otp = $1, reset_otp_expires = $2 WHERE email = $3",
        [otp, expires, email],
      );

      await sendOtpEmail(email, otp);
    }

    return res.status(200).json({
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// POST /auth/reset-password
exports.ResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required." });
    }

    // Same password strength rules apply when resetting
    const minLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    const result = await pool.query(
      "SELECT reset_otp, reset_otp_expires FROM employees WHERE email = $1",
      [email],
    );

    const user = result.rows[0];

    if (!user || !user.reset_otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (new Date() > new Date(user.reset_otp_expires)) {
      return res
        .status(400)
        .json({ message: "This OTP has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the OTP fields so it can't be reused
    await pool.query(
      "UPDATE employees SET password = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE email = $2",
      [hashedPassword, email],
    );

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
