const express = require("express");
const router = express.Router();
const pool = require("../database");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

//send emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// add employee salary
router.post("/addSalary/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { date, total_days_worked, total_hours_worked, earnings, deductions } =
    req.body;

  try {
    // Calculate total earnings from earnings JSON object
    const total_earnings = (
      parseFloat(earnings.basic || 0) +
      parseFloat(earnings.allowance || 0) +
      parseFloat(earnings.bonus || 0) +
      parseFloat(earnings.overtime || 0)
    ).toFixed(2);

    // Calculate total deductions from deductions JSON object
    const total_deductions = (
      parseFloat(deductions.leave || 0) +
      parseFloat(deductions.loan || 0) +
      parseFloat(deductions.tax || 0)
    ).toFixed(2);

    // Calculate net pay (total earnings - total deductions)
    const net_pay = (total_earnings - total_deductions).toFixed(2);

    // Create the new salary record
    const newSalary = {
      empId,
      date,
      total_days_worked,
      total_hours_worked,
      earnings: JSON.stringify(earnings),
      deductions: JSON.stringify(deductions),
    };

    // Insert the salary record into the database
    const [results] = await pool.query(
      `INSERT INTO salary (empId, date, total_days_worked, total_hours_worked, earnings, deductions)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newSalary.empId,
        newSalary.date,
        newSalary.total_days_worked,
        newSalary.total_hours_worked,
        newSalary.earnings,
        newSalary.deductions,
      ]
    );

    // Send success response with calculated fields
    res.status(201).json({
      message: "Employee salary created successfully",
      salaryId: results.insertId,
      total_earnings,
      total_deductions,
      net_pay,
    });
  } catch (error) {
    console.error("Error saving employee salary:", error);
    res.status(500).json({ error: "Error saving employee salary" });
  }
});

// get payslip by employee ID
router.get("/getPayslip/:empId", async (req, res) => {
  const empId = req.params.empId;

  try {
    // Query the database to get all salary records for the given empId
    const [salaryRecords] = await pool.query(
      "SELECT * FROM salary WHERE empId = ? ORDER BY date DESC", // Fetch all salary records for empId, ordered by date
      [empId]
    );

    // Check if any salary records exist
    if (salaryRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No salary records found for this employee" });
    }

    // Function to calculate total from dynamic fields
    const calculateTotal = (items) => {
      return Object.values(items).reduce(
        (acc, value) => acc + parseFloat(value || 0),
        0
      );
    };

    // Map over all salary records and format the response
    const payslips = salaryRecords.map((salary) => {
      let earnings, deductions;

      // Validate and parse earnings
      if (typeof salary.earnings === "string") {
        earnings = JSON.parse(salary.earnings);
      } else if (typeof salary.earnings === "object") {
        earnings = salary.earnings;
      } else {
        console.error("Earnings field is not valid:", salary.earnings);
        earnings = {};
      }

      // Validate and parse deductions
      if (typeof salary.deductions === "string") {
        deductions = JSON.parse(salary.deductions);
      } else if (typeof salary.deductions === "object") {
        deductions = salary.deductions;
      } else {
        console.error("Deductions field is not valid:", salary.deductions);
        deductions = {};
      }

      // Calculate total earnings and deductions
      const total_earnings = calculateTotal(earnings).toFixed(2);
      const total_deductions = calculateTotal(deductions).toFixed(2);

      // Calculate net pay (total earnings - total deductions)
      const net_pay = (total_earnings - total_deductions).toFixed(2);

      const formattedDate = new Date(salary.date).toISOString().split("T")[0];

      return {
        empId: salary.empId,
        date: formattedDate,
        total_days_worked: salary.total_days_worked,
        total_hours_worked: salary.total_hours_worked,
        earnings: earnings,
        total_earnings: total_earnings,
        deductions: deductions,
        total_deductions: total_deductions,
        net_pay: net_pay,
        createdAt: salary.createdAt,
      };
    });

    // Send the response with all payslips
    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error retrieving payslips:", error);
    res.status(500).json({ error: "Error retrieving payslips" });
  }
});

// Get detailed earnings for an employee
router.get("/getEarnings/:empId", async (req, res) => {
  const empId = req.params.empId;

  try {
    const query = `
      SELECT 
        JSON_EXTRACT(earnings, '$.basic') AS basic,
        JSON_EXTRACT(earnings, '$.bonus') AS bonus,
        JSON_EXTRACT(earnings, '$.overtime') AS overtime,
        JSON_EXTRACT(earnings, '$.allowance') AS allowance
      FROM 
        salary
      WHERE 
        empId = ?
      ORDER BY date DESC
      LIMIT 1; -- Fetch the latest earnings
    `;
    const [results] = await pool.query(query, [empId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No earnings data found for this employee." });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error fetching earnings details:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// Update bonus and allowance in the earnings table
router.put("/updateEarnings/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { bonus, allowance } = req.body;

  try {
    const query = `
      UPDATE salary
      SET earnings = JSON_SET(earnings, '$.bonus', ?, '$.allowance', ?)
      WHERE empId = ?;
    `;
    await pool.query(query, [bonus, allowance, empId]);

    res.status(200).json({ message: "Earnings updated successfully." });
  } catch (error) {
    console.error("Error updating earnings:", error);
    res.status(500).json({ error: "Failed to update earnings." });
  }
});

// Update bonus and allowance in the earnings table
router.put("/updateEarnings/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { bonus, allowance } = req.body;

  try {
    const query = `
      UPDATE salary
      SET earnings = JSON_SET(earnings, '$.bonus', ?, '$.allowance', ?)
      WHERE empId = ?;
    `;
    await pool.query(query, [bonus, allowance, empId]);

    res.status(200).json({ message: "Earnings updated successfully." });
  } catch (error) {
    console.error("Error updating earnings:", error);
    res.status(500).json({ error: "Failed to update earnings." });
  }
});

// Update bonus and allowance in the earnings table
router.put("/updatedeductions/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { loan, leave } = req.body;

  try {
    // Validate JSON structure of deductions column
    const validateQuery = `
      SELECT JSON_VALID(deductions) AS isValid
      FROM salary
      WHERE empId = ?;
    `;
    const [rows] = await pool.query(validateQuery, [empId]);
    if (!rows[0]?.isValid) {
      return res
        .status(400)
        .json({ error: "Deductions column is not valid JSON." });
    }

    // Update deductions
    const query = `
      UPDATE salary
      SET deductions = JSON_SET(deductions, '$.loan', ?, '$.leave', ?)
      WHERE empId = ?;
    `;
    await pool.query(query, [loan, leave, empId]);

    res.status(200).json({ message: "Deductions updated successfully." });
  } catch (error) {
    console.error("Error updating deductions for empId:", empId, error.message);
    res.status(500).json({
      error:
        "Failed to update deductions. Please check the logs for more details.",
    });
  }
});

// Get all employee details
router.get("/getAllEmployee", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT p.name, l.empId, l.role, w.department, w.designation FROM logindetails l, workdetails w, personaldetails p WHERE l.empId = w.empId AND l.empId = p.empId"
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "Employee details not found" });
    }
  } catch (error) {
    console.error("Error fetching Employee details:", error);
    res.status(500).json({ error: "Error fetching Employee details" });
  }
});

//add members to chat
router.post("/addMember", async (req, res) => {
  const { members, chatId } = req.body;

  if (!members || members.length === 0) {
    return res.status(400).json({ error: "No members provided" });
  }

  try {
    const chatMemberValues = members.map((empId) => [empId, chatId]);

    const [results] = await pool.query(
      "INSERT INTO chatmembers (empId, chatId) VALUES ?",
      [chatMemberValues]
    );

    res.status(201).json({
      message: "Employees added to chat successfully",
      insertedRows: results.affectedRows,
    });
  } catch (error) {
    console.error("Error saving employee chat data:", error);
    res.status(500).json({ error: "Error saving employee chat data" });
  }
});

// Get all chat records for an employee, ordered by latest first
router.get("/getMember/:empId", async (req, res) => {
  const employeeId = req.params.empId;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM chatmembers WHERE empId = ? ORDER BY created_at DESC",
      [employeeId]
    );

    if (rows.length > 0) {
      res.status(200).json(rows); // Return all rows
    } else {
      res
        .status(404)
        .json({ message: "No chat records found for this employee" });
    }
  } catch (error) {
    console.error("Error fetching chat member details:", error);
    res.status(500).json({ error: "Error fetching chat member details" });
  }
});

// Get all chat members
router.get("/getAllMembers/:chatId", async (req, res) => {
  const chatId = req.params.chatId;

  try {
    const [rows] = await pool.query(
      "SELECT p.name, c.empId, c.chatId FROM chatmembers c JOIN personaldetails p ON c.empId = p.empId WHERE c.chatId = ?",
      [chatId]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res
        .status(404)
        .json({ message: "No chat records found for this chat id" });
    }
  } catch (error) {
    console.error("Error fetching chat members:", error);
    res.status(500).json({ error: "Error fetching chat members" });
  }
});

//delete chat
router.delete("/deleteChat/:chatId", async (req, res) => {
  const chatId = req.params.chatId;

  try {
    const [result] = await pool.query(
      "DELETE FROM chatmembers WHERE chatId = ?",
      [chatId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Chat deleted successfully." });
    } else {
      res.status(404).json({ message: "Chat not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

//mark as read
router.put("/markAsRead/:empId/:chatId", async (req, res) => {
  const empId = req.params.empId;
  const chatId = req.params.chatId;

  try {
    const [results] = await pool.query(
      "UPDATE chatmembers SET `read` = 'read' WHERE empId = ? AND chatId = ?",
      [empId, chatId]
    );

    if (results.affectedRows > 0) {
      res.status(200).json({
        message: "Marked as read successfully",
        affectedRows: results.affectedRows,
      });
    } else {
      res.status(404).json({
        message: "No messages found for the provided empId",
      });
    }
  } catch (error) {
    console.error("Error updating employee chat data:", error);
    res.status(500).json({ error: "Error updating employee chat data" });
  }
});

//add members to new team
router.post("/createTeam/:empId", async (req, res) => {
  const creator = req.params.empId;
  const { teamName, members } = req.body;

  if (!members || members.length === 0) {
    return res.status(400).json({ error: "No members provided" });
  }

  try {
    await pool.query("INSERT INTO teams (empId, teamName) VALUES (?, ?)", [
      creator,
      teamName,
    ]);

    // Insert each member into the teammembers table
    const teamMemberValues = members.map(
      ({ empId, role, department, name }) => [
        empId,
        name,
        teamName,
        role,
        department,
        creator,
      ]
    );

    const [results] = await pool.query(
      "INSERT INTO teammembers (empId, name, teamName, role, department, creator) VALUES ?",
      [teamMemberValues]
    );

    res.status(201).json({
      message: "Team created and members added successfully",
      insertedRows: results.affectedRows,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        error: "Team name already taken. Please choose a different name.",
      });
    } else {
      console.error("Error saving employee team data:", error);
      res.status(500).json({ error: "Error creating team" });
    }
  }
});

// Get team by creator's empId
router.get("/getTeam/:empId/:filteredTeamName", async (req, res) => {
  const employeeId = req.params.empId;
  const teamName = req.params.filteredTeamName;

  try {
    const [rows] = await pool.query(
      `SELECT tm.id, t.teamName, tm.empId, tm.name, tm.role, tm.department, tm.performance, tm.taskcompleted
             FROM teams t 
             JOIN teammembers tm 
             ON t.empId = tm.creator AND t.teamName = tm.teamName
             WHERE t.empId = ? AND t.teamName = ?
             ORDER BY t.created_at DESC`,
      [employeeId, teamName]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res
        .status(404)
        .json({ message: "No team records found for this creator" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching team details" });
  }
});

// Get all teams
router.get("/getAllTeams/:empId", async (req, res) => {
  const employeeId = req.params.empId;

  try {
    const [rows] = await pool.query("SELECT * FROM teams WHERE empId = ?", [
      employeeId,
    ]);

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No team records found" });
    }
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ error: "Error fetching team details" });
  }
});

//update team
router.post("/updateTeam/:empId", async (req, res) => {
  const creatorEmpId = req.params.empId;
  const { teamName, members } = req.body;

  if (!members || members.length === 0) {
    return res.status(400).json({ error: "No members provided" });
  }

  try {
    // Update teammembers table
    const teamMemberValues = members.map(
      ({ empId, role, department, name }) => [
        empId,
        name,
        teamName,
        role,
        department,
        creatorEmpId,
      ]
    );

    const [results] = await pool.query(
      "INSERT INTO teammembers (empId, name, teamName, role, department, creator) VALUES ?",
      [teamMemberValues]
    );

    res.status(201).json({
      message: "Team created and members added successfully",
      insertedRows: results.affectedRows,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        error: "Team name already taken. Please choose a different name.",
      });
    } else {
      console.error("Error saving employee team data:", error);
      res.status(500).json({ error: "Error creating team" });
    }
  }
});

//delete member from team
router.delete("/deleteTeamMember/:empId/:teamName", async (req, res) => {
  const empId = req.params.empId;
  const teamName = req.params.teamName;

  try {
    const [result] = await pool.query(
      "DELETE FROM teammembers WHERE empId = ? and teamName = ?",
      [empId, teamName]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Team member deleted successfully." });
    } else {
      res.status(404).json({ message: "Team member not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Get all strategic plans by id
router.get("/getPlans/:empId", async (req, res) => {
  const employeeId = req.params.empId;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM strategicplans WHERE empId = ?",
      [employeeId]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No strategic plan records found" });
    }
  } catch (error) {
    console.error("Error fetching strategic plan details:", error);
    res.status(500).json({ error: "Error fetching strategic plan details" });
  }
});

//create strategic plan
router.post("/addStrategicPlan/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { goal, description, deadline, progress } = req.body;

  try {
    await pool.query(
      "INSERT INTO strategicplans (empId, goal, description, deadline, progress) VALUES (?, ?, ?, ?, ?)",
      [empId, goal, description, deadline, progress]
    );
    res.status(201).json({ message: "Strategic plan added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding startegic plan" });
  }
});

// Get all strategic plans
router.get("/getAllPlans", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM strategicplans");

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No strategic plans found" });
    }
  } catch (error) {
    console.error("Error fetching all strategic plan details:", error);
    res
      .status(500)
      .json({ error: "Error fetching all strategic plan details" });
  }
});

// Delete a strategic plan by ID
router.delete("/deletePlan/:id", async (req, res) => {
  const planId = req.params.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM strategicplans WHERE id = ?",
      [planId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Strategic plan deleted successfully" });
    } else {
      res.status(404).json({ message: "Strategic plan not found" });
    }
  } catch (error) {
    console.error("Error deleting strategic plan:", error);
    res.status(500).json({ error: "Error deleting strategic plan" });
  }
});

// Update the progress of a strategic plan by ID
router.put("/updateProgress/:id", async (req, res) => {
  const planId = req.params.id;
  const { progress } = req.body; // Assuming the progress is sent in the request body

  try {
    const [result] = await pool.query(
      "UPDATE strategicplans SET progress = ? WHERE id = ?",
      [progress, planId]
    );

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Strategic plan progress updated successfully" });
    } else {
      res.status(404).json({ message: "Strategic plan not found" });
    }
  } catch (error) {
    console.error("Error updating strategic plan progress:", error);
    res.status(500).json({ error: "Error updating strategic plan progress" });
  }
});

// Add members to a meeting
router.post("/addMMember", async (req, res) => {
  const { members, meetingId } = req.body;

  if (!members || members.length === 0) {
    return res.status(400).json({ error: "No members provided" });
  }

  try {
    const meetingMemberValues = members.map((empId) => [empId, meetingId]);

    const [results] = await pool.query(
      "INSERT INTO meetingmembers (empId, meetingId) VALUES ?",
      [meetingMemberValues]
    );

    res.status(201).json({
      message: "Employees added to meeting successfully",
      insertedRows: results.affectedRows,
    });
  } catch (error) {
    console.error("Error saving meeting member data:", error);
    res.status(500).json({ error: "Error saving meeting member data" });
  }
});

// Get all meetings for an employee, ordered by latest first
router.get("/getMember/:empId", async (req, res) => {
  const empId = req.params.empId;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM meetingmembers WHERE empId = ? ORDER BY created_at DESC",
      [empId]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res
        .status(404)
        .json({ message: "No meeting records found for this employee" });
    }
  } catch (error) {
    console.error("Error fetching meeting member details:", error);
    res.status(500).json({ error: "Error fetching meeting member details" });
  }
});

// Get all members of a meeting
router.get("/getAllMMembers/:meetingId", async (req, res) => {
  const meetingId = req.params.meetingId;

  try {
    const [rows] = await pool.query(
      "SELECT p.name, m.empId, m.meetingId FROM meetingmembers m JOIN personaldetails p ON m.empId = p.empId WHERE m.meetingId = ?",
      [meetingId]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: "No members found for this meeting ID" });
    }
  } catch (error) {
    console.error("Error fetching meeting members:", error);
    res.status(500).json({ error: "Error fetching meeting members" });
  }
});

// Delete a meeting
router.delete("/deleteMeeting/:meetingId", async (req, res) => {
  const meetingId = req.params.meetingId;

  try {
    const [result] = await pool.query(
      "DELETE FROM meetingmembers WHERE meetingId = ?",
      [meetingId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Meeting deleted successfully." });
    } else {
      res.status(404).json({ message: "Meeting not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

//get allocated budgets by year and month
router.get("/getAllocatedBudget/:department/:year/:month", async (req, res) => {
  const { department, year, month } = req.params;

  try {
    const [rows] = await pool.query(
      `
            SELECT * 
            FROM budgets 
            WHERE department = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [department, `${year}-${month}`]
    );
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ error: "Error fetching budget" });
  }
});

// Mark meeting as read for an employee
router.put("/markAsRead/:empId/:meetingId", async (req, res) => {
  const empId = req.params.empId;
  const meetingId = req.params.meetingId;

  try {
    const [results] = await pool.query(
      "UPDATE meetingmembers SET readStatus = 'read' WHERE empId = ? AND meetingId = ?",
      [empId, meetingId]
    );

    if (results.affectedRows > 0) {
      res.status(200).json({
        message: "Marked as read successfully",
        affectedRows: results.affectedRows,
      });
    } else {
      res.status(404).json({
        message: "No records found for the provided empId and meetingId",
      });
    }
  } catch (error) {
    console.error("Error updating meeting member data:", error);
    res.status(500).json({ error: "Error updating meeting member data" });
  }
});

//get spent budget
router.get("/getSpentBudget/:department/:year/:month", async (req, res) => {
  const { department, year, month } = req.params;

  try {
    const [totals] = await pool.query(
      `SELECT 
                SUM(\`operational costs\`) AS "OperationalCosts",
                SUM(marketing) AS Marketing,
                SUM(\`research & development\`) AS "ResearchDevelopment",
                SUM(miscellaneous) AS Miscellaneous,
                SUM(\`operational costs\` + marketing + \`research & development\` + miscellaneous) AS Total
            FROM expenses_data
            WHERE department = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [department, `${year}-${month}`]
    );
    res.status(200).json(totals[0]);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving expenses data" });
  }
});

//validate password
router.post("/validatePassword/:empId", async (req, res) => {
  const { password } = req.body;
  const currentUserId = req.params.empId;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Invalid password format." });
  }

  try {
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const [rows] = await pool.query(
      `SELECT password FROM logindetails WHERE empId = ?`,
      [currentUserId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentUser = rows[0];
    const match = await bcrypt.compare(password, currentUser.password);

    if (!match) {
      return res.status(403).json({ message: "Invalid password." });
    }

    return res
      .status(200)
      .json({ message: "Password validated successfully." });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error during password validation:`,
      error.message
    );
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
});

//get all departments
router.get("/getAllDepartments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT DISTINCT department 
            FROM workdetails 
            WHERE department IS NOT NULL AND department != ''
        `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Error fetching departments" });
  }
});
// Add a new company policy
router.post("/addPolicy", async (req, res) => {
  const {
    policy_title,
    policy_description,
    policy_type,
    department,
    policy_level,
    effective_date,
    created_by,
    approval_status,
    attachments,
    is_active,
  } = req.body;

  try {
    const query = `
      INSERT INTO company_policies 
      (policy_title, policy_description, policy_type, department, policy_level, 
      effective_date, last_updated_date, created_by, approval_status, attachments, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const currentDate = new Date().toISOString().split("T")[0]; // Get today's date for `last_updated_date`

    const [results] = await pool.query(query, [
      policy_title,
      policy_description,
      policy_type,
      department,
      policy_level,
      effective_date,
      currentDate,
      created_by,
      approval_status,
      attachments,
      is_active,
    ]);

    res.status(201).json({
      message: "Company policy created successfully",
      policyId: results.insertId,
    });
  } catch (error) {
    console.error("Error saving company policy:", error);
    res.status(500).json({ error: "Error saving company policy" });
  }
});

// Get all company policies with optional filters
router.get("/getPolicies", async (req, res) => {
  const { department, policy_type, approval_status, is_active } = req.query;

  try {
    let query = "SELECT * FROM company_policies WHERE 1 = 1"; // Default query to select all

    // Add filters if parameters are passed
    const filters = [];
    if (department) {
      query += " AND department = ?";
      filters.push(department);
    }
    if (policy_type) {
      query += " AND policy_type = ?";
      filters.push(policy_type);
    }
    if (approval_status) {
      query += " AND approval_status = ?";
      filters.push(approval_status);
    }
    if (typeof is_active !== "undefined") {
      query += " AND is_active = ?";
      filters.push(is_active);
    }

    const [policies] = await pool.query(query, filters);

    if (policies.length === 0) {
      return res.status(404).json({ message: "No policies found" });
    }

    res.status(200).json(policies);
  } catch (error) {
    console.error("Error retrieving policies:", error);
    res.status(500).json({ error: "Error retrieving policies" });
  }
});

// Get a specific company policy by policy_id
router.get("/getPolicy/:policyId", async (req, res) => {
  const policyId = req.params.policyId;

  try {
    const [policy] = await pool.query(
      "SELECT * FROM company_policies WHERE policy_id = ?",
      [policyId]
    );

    if (policy.length === 0) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy[0]);
  } catch (error) {
    console.error("Error retrieving policy:", error);
    res.status(500).json({ error: "Error retrieving policy" });
  }
});

// Update a company policy by policy_id
router.put("/updatePolicy/:policyId", async (req, res) => {
  const policyId = req.params.policyId;
  const {
    policy_title,
    policy_description,
    policy_type,
    department,
    policy_level,
    effective_date,
    approval_status,
    attachments,
    is_active,
  } = req.body;

  try {
    const currentDate = new Date().toISOString().split("T")[0]; // Get today's date for `last_updated_date`

    const query = `
      UPDATE company_policies
      SET policy_title = ?, policy_description = ?, policy_type = ?, department = ?, 
          policy_level = ?, effective_date = ?, last_updated_date = ?, approval_status = ?, 
          attachments = ?, is_active = ?
      WHERE policy_id = ?
    `;

    await pool.query(query, [
      policy_title,
      policy_description,
      policy_type,
      department,
      policy_level,
      effective_date,
      currentDate,
      approval_status,
      attachments,
      is_active,
      policyId,
    ]);

    res.status(200).json({ message: "Policy updated successfully" });
  } catch (error) {
    console.error("Error updating policy:", error);
    res.status(500).json({ error: "Error updating policy" });
  }
});

// Delete a company policy by policy_id
router.delete("/deletePolicy/:policyId", async (req, res) => {
  const policyId = req.params.policyId;

  try {
    const query = "DELETE FROM company_policies WHERE policy_id = ?";
    await pool.query(query, [policyId]);

    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error("Error deleting policy:", error);
    res.status(500).json({ error: "Error deleting policy" });
  }
});

router.put("/updatePerformanceOrTask/:id", async (req, res) => {
  const { id } = req.params;
  const { performance, taskcompleted } = req.body;

  try {
    const fields = [];
    const values = [];

    if (performance !== undefined) {
      fields.push("performance = ?");
      values.push(performance);
    }
    if (taskcompleted !== undefined) {
      fields.push("taskcompleted = ?");
      values.push(taskcompleted);
    }

    if (fields.length === 0) {
      return res.status(400).json("No fields to update");
    }

    const query = `UPDATE teammembers SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json("Employee not found");
    }

    res.status(200).json("Updated successfully");
  } catch (error) {
    res.status(500).json("Error updating data");
  }
});

//get team member by id and performance
router.get("/getTeamAndPerformance/:teamName/:empId", async (req, res) => {
  const { teamName, empId } = req.params;
  try {
    const [memberPerformance] = await pool.query(
      `SELECT performance, taskcompleted
      FROM teammembers
      WHERE teamName = ? AND empId = ?`,
      [teamName, empId]
    );

    if (memberPerformance.length === 0) {
      return res.status(404).json({ error: "No matching team member found" });
    }

    res.status(200).json(memberPerformance);
  } catch (error) {
    console.error(
      "Error fetching team and performance Of selected member:",
      error
    );
    res.status(500).json({
      error: "Error fetching team and performance Of selected member",
    });
  }
});

//update team member performance by id
router.put("/updatePerformance/:teamName/:empId", async (req, res) => {
  const { teamName, empId } = req.params;
  const { performance } = req.body;

  try {
    await pool.query(
      `
            UPDATE teammembers
            SET performance = ?
            WHERE teamName = ? AND empId = ?
        `,
      [performance, taskcompleted, teamName, empId]
    );

    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating performance:", error);
    res.status(500).json({ error: "Error updating performance" });
  }
});

//update team member task completed by id
router.put("/updateTaskcompleted/:teamName/:empId", async (req, res) => {
  const { teamName, empId } = req.params;
  const { taskcompleted } = req.body;

  try {
    await pool.query(
      `
            UPDATE teammembers
            SET taskcompleted = ?
            WHERE teamName = ? AND empId = ?
        `,
      [taskcompleted, teamName, empId]
    );

    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating completed tasks:", error);
    res.status(500).json({ error: "Error updating completed tasks" });
  }
});

//get team and average performance
router.get("/getTeamAndPerformance", async (req, res) => {
  try {
    const [teamsWithPerformance] = await pool.query(
      `SELECT 
                t.teamName, 
                t.creator AS creatorEmpId,
                p.NAME AS creatorName, 
                FORMAT(AVG(t.performance), 2) AS avgPerformance,
                t.created_at
            FROM teammembers t
            JOIN personaldetails p ON p.empId = t.creator
            GROUP BY t.teamName, p.NAME`
    );

    res.status(200).json(teamsWithPerformance);
  } catch (error) {
    console.error("Error fetching team and performance:", error);
    res.status(500).json({ error: "Error fetching team and performance" });
  }
});

//add new resourse
router.post("/addNewResource", async (req, res) => {
  const { resource, type, quantity } = req.body;

  try {
    await pool.query(
      "INSERT INTO resource (resource, type, quantity) VALUES (?, ?, ?)",
      [resource, type, quantity]
    );
    res.status(201).json({ message: "resource added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding resource" });
  }
});

//get all resources
router.get("/getAllResources", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT * 
            FROM resource 
        `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Error fetching resources" });
  }
});

//update resource
router.put("/updateResource/:id/:quantity", async (req, res) => {
  const { id, quantity } = req.params;
  try {
    await pool.query(
      `
            UPDATE resource
            SET quantity = ? 
            WHERE id = ?
        `,
      [quantity, id]
    );
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating resources:", error);
    res.status(500).json({ error: "Error updating resources" });
  }
});

//allocate resource to employee
router.post("/allocateResource/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { id, resource, quantity, allocatedate, returneddate } = req.body;

  try {
    await pool.query(
      "INSERT INTO allocatedresources (empId, resource, quantity, allocatedate, returneddate) VALUES (?, ?, ?, ?, ?)",
      [empId, resource, quantity, allocatedate, returneddate]
    );

    const [currentQuantityResult] = await pool.query(
      "select quantity from resource where id = ?",
      [id]
    );

    const currentQuantity = currentQuantityResult[0].quantity;

    if (currentQuantity < quantity) {
      return res.status(400).json({ error: "Not enough resource available" });
    }

    const newQuantity = currentQuantity - quantity;

    await pool.query(
      `
            UPDATE resource
            SET quantity = ? 
            WHERE id = ?
        `,
      [newQuantity, id]
    );

    res.status(201).json({ message: "Resource allocated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error allocating resource" });
    console.error("Error allocating resource:", error);
  }
});

//get allocated resources by empId
router.get("/getAllocatedResources/:empId", async (req, res) => {
  const { empId } = req.params;

  try {
    const [rows] = await pool.query(
      `
            SELECT * 
            FROM allocatedresources
            WHERE empId = ? 
        `,
      [empId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching allocated resources:", error);
    res.status(500).json({ error: "Error fetching allocated resources" });
  }
});

//get all allocated resources
router.get("/getAllAllocatedResources", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT a.id, a.empId, p.NAME, a.resource, a.quantity, a.allocatedate, a.returneddate, a.status
            FROM allocatedresources a JOIN personaldetails p ON a.empId = p.empId
            WHERE a.status = "Not returned"
            ORDER By a.created_at DESC
        `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching allocated resources:", error);
    res.status(500).json({ error: "Error fetching allocated resources" });
  }
});

//update quantity after returned
router.put(
  "/updateQuantity/:id/:resource/:quantity/:empId",
  async (req, res) => {
    const { resource, empId, id } = req.params;
    const quantity = parseInt(req.params.quantity, 10);

    try {
      const [currentQuantityResult] = await pool.query(
        "select quantity from resource where resource = ?",
        [resource]
      );

      const currentQuantity = currentQuantityResult[0].quantity;

      const newQuantity = currentQuantity + quantity;

      await pool.query(
        `
            UPDATE resource
            SET quantity = ? 
            WHERE resource = ?
        `,
        [newQuantity, resource]
      );

      await pool.query(
        `
            UPDATE allocatedresources
            SET status = "Returned" 
            WHERE resource = ? AND empId = ? AND id = ?
        `,
        [resource, empId, id]
      );

      res.status(200).json({
        message: "Updated successfully",
        currentQuantity,
        newQuantity,
      });
    } catch (error) {
      console.error("Error updating resources:", error);
      res.status(500).json({ error: "Error updating resources" });
    }
  }
);

//save alert
router.put("/saveAlert/:id/:resource/:empId", async (req, res) => {
  const { resource, empId, id } = req.params;
  const { alertResponse } = req.body;

  try {
    await pool.query(
      `UPDATE allocatedresources 
      SET alert = ? 
      WHERE resource = ? AND empId = ? AND id = ?`,
      [alertResponse, resource, empId, id]
    );

    res.status(200).json({ message: "Alert sent and updated successfully" });
  } catch (error) {
    console.error("Error updating alert status:", error);
    res.status(500).json({ error: "Error updating alert status" });
  }
});

//add new training
router.post("/addNewTraining", async (req, res) => {
  const { training, weight, duration } = req.body;

  try {
    await pool.query(
      "INSERT INTO training (training, weight, duration) VALUES (?, ?, ?)",
      [training, weight, duration]
    );
    res.status(201).json({ message: "training added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding training" });
  }
});

//get all training
router.get("/getAllTrainings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT * 
            FROM training 
        `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    res.status(500).json({ error: "Error fetching trainings" });
  }
});

//allocate training to employee
router.post("/allocateTraining/:empId", async (req, res) => {
  const empId = req.params.empId;
  const { training, weight, allocatedate, finisheddate } = req.body;

  try {
    await pool.query(
      "INSERT INTO allocatedtraining (empId, training, weight, allocatedate, finisheddate) VALUES (?, ?, ?, ?, ?)",
      [empId, training, weight, allocatedate, finisheddate]
    );

    res.status(201).json({ message: "training allocated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error allocating training" });
    console.error("Error allocating training:", error);
  }
});

//get allocated training by empId
router.get("/getAllocatedTraining/:empId", async (req, res) => {
  const { empId } = req.params;

  try {
    const [rows] = await pool.query(
      `
            SELECT * 
            FROM allocatedtraining
            WHERE empId = ? 
        `,
      [empId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching allocated training:", error);
    res.status(500).json({ error: "Error fetching allocated training" });
  }
});

//get all allocated training
router.get("/getAllAllocatedTraining", async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT a.id, a.empId, p.NAME, a.training, a.weight, a.allocatedate, a.finisheddate, a.status
            FROM allocatedtraining a JOIN personaldetails p ON a.empId = p.empId
            ORDER By a.created_at DESC
        `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching allocated training:", error);
    res.status(500).json({ error: "Error fetching allocated training" });
  }
});

// Update status after completed
router.put("/updateStatus/:id/:training/:empId", async (req, res) => {
  const { id, training, empId } = req.params;

  try {
    const query = `
      UPDATE allocatedtraining
      SET 
          status = "Completed", 
          finisheddate = NOW()
      WHERE 
          id = ? AND 
          training = ? AND 
          empId = ?
    `;

    const [result] = await pool.query(query, [id, training, empId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No matching record found to update" });
    }

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Error updating status" });
  }
});

// Save reminder
router.put("/saveReminder/:id/:training/:empId", async (req, res) => {
  const { id, training, empId } = req.params;
  const { reminderResponse } = req.body;

  if (!reminderResponse) {
    return res.status(400).json({ error: "Reminder response is required" });
  }

  try {
    const query = `
      UPDATE allocatedtraining
      SET 
          reminder = ? 
      WHERE 
          id = ? AND 
          training = ? AND 
          empId = ?
    `;

    const [result] = await pool.query(query, [
      reminderResponse,
      id,
      training,
      empId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No matching record found to update" });
    }

    res.status(200).json({ message: "Reminder sent and updated successfully" });
  } catch (error) {
    console.error("Error updating reminder status:", error);
    res.status(500).json({ error: "Error updating reminder status" });
  }
});

//get training reminder by empId
router.get("/getTrainingReminder/:empId", async (req, res) => {
  const empId = req.params.empId;

  try {
    const [rows] = await pool.query(
      `
      SELECT id, training, reminder
      FROM allocatedtraining
      WHERE empId = ? AND DATE(created_at) = CURDATE()
      `,
      [empId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reminders for the current day" });
  }
});

//get employees assigned for supervisor
router.get("/getAssignedEmployees/:empId", async (req, res) => {
  const supervisor = req.params.empId;

  try {
    const [rows] = await pool.query(`
            SELECT w.empId, p.NAME, w.designation, w.department
            FROM workdetails w JOIN personaldetails p ON w.empId = p.empId
            WHERE w.supervisor = ?
        `, [supervisor]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ error: "Error fetching employee details" });
  }
});

module.exports = router;
