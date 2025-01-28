const express = require("express");
const router = express.Router();
const pool = require("../database");

//add skill
router.post("/addSkill/:empId", async (req, res) => {
    const empId = req.params.empId;
    const { skill, level } = req.body;

    try {
        await pool.query(
            "INSERT INTO skills (empId, skill, level) VALUES (?, ?, ?)",
            [empId, skill, level]
        );

        res.status(201).json({ message: "Skill added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error adding skill" });
        console.error("Error adding skill:", error);
    }
});

//get skill
router.get("/getSkill/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        const [rows] = await pool.query(`
              SELECT * 
              FROM skills
              WHERE empId = ? 
          `, [empId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ error: "Error fetching skills" });
    }
});

//update skill level
router.put("/updateSkill/:id/:level", async (req, res) => {
    const { id, level } = req.params;

    try {
        const [result] = await pool.query(
            "UPDATE skills SET level = ? WHERE id = ?",
            [level, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No matching record found to update" });
        }

        res.status(200).json({ message: "Skill level updated successfully" });
    } catch (error) {
        console.error("Error updating skill level:", error);
        res.status(500).json({ error: "Error updating skill level" });
    }
});

//add career plan
router.post("/addCareerPlan/:empId", async (req, res) => {
    const empId = req.params.empId;
    const { plan, steps } = req.body;

    try {
        if (!steps || steps.length === 0) {
            return res.status(400).json({ error: "At least one step is required." });
        }

        const stepsString = JSON.stringify(steps);

        await pool.query(
            "INSERT INTO careerplans (empId, plan, steps) VALUES (?, ?, ?)",
            [empId, plan, stepsString]
        );

        res.status(201).json({ message: "Career plan added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error adding career plan" });
    }
});

//get career plan
router.get("/getCareerPlan/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT w.designation, c.empId, c.plan, JSON_UNQUOTE(c.steps) AS steps 
             FROM careerplans c JOIN workdetails w ON c.empId = w.empId
             WHERE c.empId = ?`,
            [empId]
        );

        const formattedRows = rows.map((row) => ({
            ...row,
            steps: JSON.parse(row.steps || "[]"),
        }));

        res.status(200).json(formattedRows);
    } catch (error) {
        console.error("Error fetching career plans:", error);
        res.status(500).json({ error: "Error fetching career plans" });
    }
});

//add feeedback and from mentor
router.post("/addFeedback/:mentorId/:empId", async (req, res) => {
    const { mentorId, empId } = req.params;
    const { feedback, recommendation, steps } = req.body;

    try {
        const [existingFeedback] = await pool.query(
            "SELECT feedback, recommendation, steps FROM mentorfeedback WHERE mentorId = ? AND empId = ?",
            [mentorId, empId]
        );

        const feedbackValue = feedback || existingFeedback[0].feedback;
        const recommendationValue = recommendation || existingFeedback[0].recommendation;
        const stepsValue = steps ? JSON.stringify(steps) : existingFeedback[0].steps;

        const query = `
            INSERT INTO mentorfeedback (mentorId, empId, feedback, recommendation, steps)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                feedback = ?, recommendation = ?, steps = ?`;

        const params = [
            mentorId, empId, feedbackValue, recommendationValue, stepsValue,
            feedbackValue, recommendationValue, stepsValue
        ];

        await pool.query(query, params);

        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ error: "Error adding feedback" });
    }
});

//get feedback by empId
router.get("/getEmpFeedback/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        const [rows] = await pool.query(`
              SELECT m.empId, m.mentorId, p.Name AS mentor, m.feedback, m.recommendation, m.steps 
              FROM mentorfeedback m 
              JOIN personaldetails p ON m.mentorId = p.empId
              WHERE m.empId = ? 
          `, [empId]);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Error fetching feedback" });
    }
});

//get feedback by mentorId
router.get("/getMentorFeedback/:mentorId", async (req, res) => {
    const { mentorId } = req.params;

    try {
        const [rows] = await pool.query(`
            SELECT m.mentorId, m.empId, p.Name AS employee, m.feedback, m.recommendation, m.steps 
            FROM mentorfeedback m 
            JOIN personaldetails p ON m.empId = p.empId
            WHERE m.mentorId = ? 
        `, [mentorId]);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Error fetching feedback" });
    }
});

//get recommendation
router.get("/getRecommendation/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT w.designation, c.empId, c.plan, JSON_UNQUOTE(c.steps) AS steps 
             FROM careerplans c JOIN workdetails w ON c.empId = w.empId
             WHERE c.empId = ?`,
            [empId]
        );

        const formattedRows = rows.map((row) => ({
            ...row,
            steps: JSON.parse(row.steps || "[]"),
        }));

        res.status(200).json(formattedRows);
    } catch (error) {
        console.error("Error fetching career plans:", error);
        res.status(500).json({ error: "Error fetching career plans" });
    }
});

//update performance metrics
router.put("/updateMetrics/:empId", async (req, res) => {
    const empId = req.params.empId;
    const { targettime, completedtime } = req.body;
    const rate = (completedtime / targettime) * 100;

    try {
        await pool.query(
            "INSERT INTO performancemetrics (empId, targettime, completedtime, rate) " +
            "VALUES (?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE targettime = ?, completedtime = ?, rate = ?",
            [empId, targettime, completedtime, rate, targettime, completedtime, rate]
        );

        res.status(200).json({ message: "Performance metrics updated/added successfully" });
    } catch (error) {
        console.error("Error updating/adding performance metrics:", error);
        res.status(500).json({ error: "Error updating/adding performance metrics" });
    }
});

//get performance metrics
router.get("/getPerformanceMetrics/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        const [rows] = await pool.query(`
              SELECT * 
              FROM performancemetrics
              WHERE empId = ? 
          `, [empId]);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching performance metrics:", error);
        res.status(500).json({ error: "Error fetching performance metrics" });
    }
});

module.exports = router;