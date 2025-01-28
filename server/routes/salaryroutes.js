const express = require("express");
const router = express.Router();
const pool = require("../database");
const cron = require("node-cron");

router.post("/salaries", async (req, res) => {
  const { department, designation, basic_salary } = req.body;

  if (!department || !designation || !basic_salary) {
    return res.status(400).send({ error: "All fields are required." });
  }

  try {
    const query = `
      INSERT INTO salary_details (department, designation, basic_salary) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary)`;

    const [results] = await pool.query(query, [
      department,
      designation,
      basic_salary,
    ]);

    res.status(201).send({
      id: results.insertId,
      department,
      designation,
      basic_salary,
    });
  } catch (err) {
    console.error("Error inserting salary record:", err);
    res.status(500).send({ error: "Database error." });
  }
});

// Get all salary records
router.get("/salaries", async (req, res) => {
  try {
    const query = "SELECT * FROM salary_details";
    const [results] = await pool.query(query);
    res.status(200).send(results);
  } catch (err) {
    console.error("Error fetching salary records:", err);
    res.status(500).send({ error: "Database error." });
  }
});

// Get a salary record by ID
router.get("/salaries/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = "SELECT * FROM salary_details WHERE id = ?";
    const [results] = await pool.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).send({ error: "Record not found." });
    }
    res.status(200).send(results[0]);
  } catch (err) {
    console.error("Error fetching salary record:", err);
    res.status(500).send({ error: "Database error." });
  }
});

// Update a salary record by ID
router.put("/salaries/:id", async (req, res) => {
  const { id } = req.params;
  const { department, designation, basic_salary } = req.body;

  if (!department || !designation || !basic_salary) {
    return res.status(400).send({ error: "All fields are required." });
  }

  try {
    const query =
      "UPDATE salary_details SET department = ?, designation = ?, basic_salary = ? WHERE id = ?";
    const [results] = await pool.query(query, [
      department,
      designation,
      basic_salary,
      id,
    ]);

    if (results.affectedRows === 0) {
      return res.status(404).send({ error: "Record not found." });
    }
    res.status(200).send({ id, department, designation, basic_salary });
  } catch (err) {
    console.error("Error updating salary record:", err);
    res.status(500).send({ error: "Database error." });
  }
});

// Delete a salary record by ID
router.delete("/salaries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM salary_details WHERE id = ?";
    const [results] = await pool.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).send({ error: "Record not found." });
    }
    res.status(200).send({ message: `Record with ID ${id} deleted.` });
  } catch (err) {
    console.error("Error deleting salary record:", err);
    res.status(500).send({ error: "Database error." });
  }
});
router.post("/loans", async (req, res) => {
  try {
    const { loantype, about } = req.body;
    const query = "INSERT INTO loans (loantype, about) VALUES (?, ?)";
    const [result] = await pool.query(query, [loantype, about]);
    res.status(201).json({ id: result.insertId, loantype, about });
  } catch (err) {
    console.error("Error adding loan:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// READ: Get all loans
router.get("/loans", async (req, res) => {
  try {
    const query = "SELECT * FROM loans";
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching loans:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// READ: Get a specific loan by ID
router.get("/loans/:id", async (req, res) => {
  try {
    const loanId = req.params.id;
    const query = "SELECT * FROM loans WHERE id = ?";
    const [results] = await pool.query(query, [loanId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Loan not found." });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error fetching loan by ID:", err);
    res.status(500).json({ error: "Database error." });
  }
});

router.put("/loans/:id", async (req, res) => {
  try {
    const loanId = req.params.id;
    const { loantype, about } = req.body; // 'about' will be a JSON string

    const query = "UPDATE loans SET loantype = ?, about = ? WHERE id = ?";
    const [result] = await pool.query(query, [loantype, about, loanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Loan not found." });
    }

    res.status(200).json({ id: loanId, loantype, about });
  } catch (err) {
    console.error("Error updating loan:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// DELETE: Delete a loan
router.delete("/loans/:id", async (req, res) => {
  try {
    const loanId = req.params.id;

    const query = "DELETE FROM loans WHERE id = ?";
    const [result] = await pool.query(query, [loanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Loan not found." });
    }

    res.status(200).json({ message: "Loan deleted successfully." });
  } catch (err) {
    console.error("Error deleting loan:", err);
    res.status(500).json({ error: "Database error." });
  }
});

router.post("/insertSalary", (req, res) => {
  const { empId, department, designation } = req.body;

  // Ensure all required data is provided
  if (!empId || !department || !designation) {
    return res
      .status(400)
      .json({ error: "empId, department, and designation are required" });
  }

  // Calculate salary based on department and designation
  const basicSalary = calculateSalary(department, designation);

  if (basicSalary === 0) {
    return res.status(400).json({
      error:
        "Salary could not be calculated for the given department and designation",
    });
  }

  // SQL query to update the basic_salary in the workdetails table
  const query = `
    UPDATE workdetails
    SET basic_salary = ?
    WHERE empId = ?
  `;

  // Use the pool to execute the query
  pool.execute(query, [basicSalary, empId], (err, results) => {
    if (err) {
      console.error("Error updating salary:", err);
      return res.status(500).json({ error: "Failed to update salary" });
    }

    // Return success response
    res.status(200).json({ message: "Salary updated successfully", results });
  });
});

// In your backend (e.g., workdetailsRoutes.js or in the same route file)
// Assuming you are using Express and MySQL with Pool for DB connection
router.put("/workdetails/updateSalaryByDeptAndDesig", async (req, res) => {
  const { department, designation, salary } = req.body;

  try {
    const query = `
      UPDATE workdetails
      SET basic_salary = ?
      WHERE department = ? AND designation = ?
    `;
    await pool.query(query, [salary, department, designation]);
    res.status(200).send("Workdetails table updated successfully");
  } catch (error) {
    console.error("Error updating workdetails:", error);
    res.status(500).send("Error updating workdetails");
  }
});

// Function to add salary rows
const generateMonthlySalaries = async () => {
  try {
    // Fetch all employees from workdetails
    const [workDetails] = await pool.query(
      "SELECT empId, basic_salary FROM workdetails"
    );

    // Insert a new row for each employee in the salary table
    for (const detail of workDetails) {
      const { empId, basic_salary } = detail;

      // Construct the earnings JSON
      const earnings = {
        basic: parseFloat(basic_salary),
        bonus: 0,
        overtime: 0,
        allowance: 0,
      };

      // Insert the new salary record
      await pool.query(
        `INSERT INTO salary (empId, date, total_days_worked, total_hours_worked, earnings, deductions) 
         VALUES (?, CURDATE(), 0, 0, ?, ?)`,
        [empId, JSON.stringify(earnings), JSON.stringify({})] // Empty deductions
      );
    }

    console.log("Monthly salaries generated successfully.");
  } catch (error) {
    console.error("Error generating monthly salaries:", error);
  }
};

// Schedule this function to run on the 20th of every month
cron.schedule("0 0 20 * *", () => {
  console.log("Running salary generation job...");
  generateMonthlySalaries();
});

module.exports = router;
