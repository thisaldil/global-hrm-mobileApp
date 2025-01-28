const express = require("express");
const router = express.Router();
const pool = require("../database");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const multer = require("multer");
const crypto = require("crypto");
const { initializeApp } = require("firebase/app");
const {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytesResumable,
} = require("firebase/storage");
const config = require("../config/firebase.config");

//send emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//upload profile image
initializeApp(config.firebaseConfig);
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });

function giveCurrentDateTime() {
    return new Date().toISOString().replace(/:/g, "-");
}

// save medical claim
router.post("/uploadMedicalClaim/:empId", upload.array("medicalClaim", 10), async (req, res) => {
    const empId = req.params.empId;
    const requestAmount = req.body.requestamount;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded.");
        }

        const dateTime = giveCurrentDateTime();
        const fileUrls = [];

        for (const file of req.files) {
            const storageRef = ref(storage, `medicalClaim/${file.originalname} ${dateTime}`);
            const metadata = { contentType: file.mimetype };

            const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);
            fileUrls.push(downloadURL);
        }

        const insertQuery = "INSERT INTO medicalclaim (empId, claim, requestamount) VALUES (?, ?, ?)";
        await pool.query(insertQuery, [empId, JSON.stringify(fileUrls), requestAmount]);

        return res.send({
            message: "Files uploaded and medical claims saved successfully",
            filesUploaded: req.files.length,
        });
    } catch (error) {
        console.error("Error uploading files or saving medical claims:", error);
        return res.status(500).send(error.message);
    }
});


//get medical claims by empId
router.get("/getMedicalClaim/:empId", async (req, res) => {
    const empId = req.params.empId;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM medicalclaim WHERE empId = ?",
            [empId]
        );

        if (rows.length > 0) {
            const formattedClaims = rows.map((row) => {
                let claim = [];
                try {
                    claim = JSON.parse(row.claim);
                } catch (e) {
                    console.error("Invalid JSON format in claim field:", e);
                }
                return {
                    id: row.id,
                    empId: row.empId,
                    requestamount: row.requestamount,
                    claim: claim,
                    claimstatus: row.claimstatus,
                };
            });

            res.status(200).json(formattedClaims);
        } else {
            res.status(404).json({ message: "No claims found for this employee" });
        }
    } catch (error) {
        console.error("Error fetching medical claim:", error);
        res.status(500).json({ error: "Error fetching medical claim" });
    }
});

//get all medical claims
router.get("/getAllMedicalClaim", async (req, res) => {

    try {
        const [rows] = await pool.query(
            "SELECT * FROM medicalclaim WHERE claimstatus = ?",
            ['Pending']
        );

        if (rows.length > 0) {
            const formattedClaims = rows.map((row) => {
                let claim = [];
                try {
                    claim = JSON.parse(row.claim);
                } catch (e) {
                    console.error("Invalid JSON format in claim field:", e);
                }
                return {
                    id: row.id,
                    empId: row.empId,
                    requestamount: row.requestamount,
                    claim: claim,
                    claimstatus: row.claimstatus,
                    created_at: row.created_at,
                };
            });

            res.status(200).json(formattedClaims);
        } else {
            res.status(404).json({ message: "No claims found for this employee" });
        }
    } catch (error) {
        console.error("Error fetching medical claims:", error);
        res.status(500).json({ error: "Error fetching medical claims" });
    }
});

//update maximum amount
router.put("/updateClaimAmount", async (req, res) => {
    const { maxamount } = req.body;

    try {
        const [existingRow] = await pool.query("SELECT COUNT(*) AS count FROM claimamount");

        if (existingRow[0].count > 0) {
            await pool.query("UPDATE claimamount SET maxamount = ?", [maxamount]);
        } else {
            await pool.query("INSERT INTO claimamount (maxamount) VALUES (?)", [maxamount]);
        }

        res.status(200).json({ message: "Max claim amount updated/added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error updating/adding max claim amount" });
    }
});

//get claim summary by empId
router.get("/getClaimSummary/:empId", async (req, res) => {
    const empId = req.params.empId;

    try {
        const [maxAmountResult] = await pool.query(
            `SELECT maxamount FROM claimamount`
        );

        const [spentAmountResult] = await pool.query(
            `SELECT SUM(requestamount) AS totalSpent FROM medicalclaim WHERE empId = ? AND claimstatus = ?`,
            [empId, 'Accepted']
        );

        const maxAmount = maxAmountResult[0]?.maxamount || 0;
        const totalSpent = spentAmountResult[0]?.totalSpent || 0;

        res.status(200).json({ maxAmount, totalSpent });
    } catch (error) {
        res.status(500).json({ error: "Error fetching claim summary" });
    }
});

//get all claim summary
router.get("/getAllClaimSummary", async (req, res) => {
    try {
        const [maxAmountResult] = await pool.query(`SELECT maxamount FROM claimamount`);

        const [spentAmountResult] = await pool.query(
            `SELECT empId, requestamount, created_at FROM medicalclaim WHERE claimstatus = ?`,
            ['Accepted']
        );

        const maxAmount = maxAmountResult[0]?.maxamount || 0;
        const totalSpent = spentAmountResult.reduce((sum, row) => sum + row.requestamount, 0).toString().replace(/^0+/, '');

        const spentAmounts = spentAmountResult.map(row => ({
            empId: row.empId,
            requestamount: row.requestamount,
            created_at: row.created_at,
        }));

        res.status(200).json({ maxAmount, totalSpent, spentAmounts });
    } catch (error) {
        res.status(500).json({ error: "Error fetching claim summary" });
    }
});

//update claim status
router.put("/updateClaimStatus/:claimId/:claimStatus", async (req, res) => {
    const { claimId, claimStatus } = req.params;
    try {
        await pool.query(
            "UPDATE medicalclaim SET claimstatus = ? WHERE id = ?",
            [claimStatus, claimId]
        );

        res.status(200).json({ message: "Claim status updated successfully" });
    } catch (error) {
        console.error("Error updating/adding claim status:", error);
        res.status(500).json({ error: "Error updating claim status" });
    }
});

module.exports = router;