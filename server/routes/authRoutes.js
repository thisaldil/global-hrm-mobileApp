const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../database");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

//send emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create login credentials
router.post("/loginCredentials", async (req, res) => {
  const { empId, email, password, role } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Log the hashed password for debugging
    console.log("Hashed Password:", hashedPassword);

    const newEmployeeLogin = { empId, email, password: hashedPassword, role };

    const [results] = await pool.query(
      "INSERT INTO logindetails (empId, email, password, role) VALUES (?, ?, ?, ?)",
      [
        newEmployeeLogin.empId,
        newEmployeeLogin.email,
        newEmployeeLogin.password,
        newEmployeeLogin.role,
      ]
    );

    // Get the newly created employee ID
    const employeeId = results.empId; // Use results.insertId to get the new employee's ID

    // Send success response with employee ID
    res
      .status(201)
      .json({ message: "Employee Login Created successfully", employeeId });
  } catch (error) {
    console.error("Error saving employee login data:", error);
    res.status(500).json({ error: "Error saving employee login data" });
  }
});

// Use the secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

//employee login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve employee by email
    const [rows] = await pool.query(
      "SELECT * FROM logindetails WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const employee = rows[0];

    // Compare password with hashed password
    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Successful login: create a token
    const token = jwt.sign({ empId: employee.empId }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      employeeId: employee.empId,
      role: employee.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error during login" });
  }
});

router.post("/requestPasswordReset", async (req, res) => {
  try {
    const { empId, email } = req.body;

    if (!empId && !email) {
      return res
        .status(400)
        .json({ message: "Please provide either employee ID or email." });
    }

    // Query the database using either empId or email
    let query = "";
    let queryParam = "";

    if (empId) {
      query = "SELECT * FROM logindetails WHERE empId = ?";
      queryParam = empId;
    } else if (email) {
      query = "SELECT * FROM logindetails WHERE email = ?";
      queryParam = email;
    }

    const [rows] = await pool.query(query, [queryParam]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = rows[0];

    // Generate a random 6-digit code
    const resetCode = crypto.randomInt(100000, 999999);

    // Save the reset code and its expiration time (you'll need to adjust this part for your DB model)
    const resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await pool.query(
      "UPDATE logindetails SET resetcode = ?, resetcodeexpires = ? WHERE empId = ?",
      [resetCode, resetCodeExpires, employee.empId]
    );

    // Send the reset code via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: "Password Reset Request",
      text: `Your password reset code is ${resetCode}. It will expire in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset code sent to email" });
  } catch (error) {
    console.error("Error requesting password reset:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//reset password
router.post("/resetPassword", async (req, res) => {
  try {
    const { resetCode, newPassword } = req.body;

    // Fetch the user with the given reset code
    const [rows] = await pool.query(
      "SELECT * FROM logindetails WHERE resetcode = ?",
      [resetCode]
    );

    // If no user is found with the reset code
    if (rows.length === 0) {
      return res.status(404).json({ message: "Reset code not found" });
    }

    const user = rows[0];

    // Check if the reset code is expired
    if (new Date(user.resetCodeExpires) < Date.now()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset code fields
    await pool.query(
      "UPDATE logindetails SET password = ?, resetcode = NULL, resetcodeexpires = NULL WHERE empId = ?",
      [hashedPassword, user.empId]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
