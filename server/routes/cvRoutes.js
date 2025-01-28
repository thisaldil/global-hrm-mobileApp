const express = require("express");
const router = express.Router();
const pool = require("../database");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const config = require("../config/firebase.config");

const { deleteObject } = require("firebase/storage");
// Initialize Firebase App and Storage
initializeApp(config.firebaseConfig);
const storage = getStorage();

// Multer Middleware for File Uploads
const upload = multer({ storage: multer.memoryStorage() });

// Utility Functions
const giveCurrentDateTime = () =>
  new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

// Function to Upload CV to Firebase
const uploadCvToFirebase = async (file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  try {
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(storage, `resumes/${file.originalname} ${dateTime}`);
    const metadata = { contentType: file.mimetype };

    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata
    );

    // Get the download URL and log it
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("CV URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading CV to Firebase:", error);
    throw new Error("Failed to upload CV to Firebase");
  }
};

// Create New Pre-Approval Record
router.post("/preApprovals", upload.single("cv"), async (req, res) => {
  const { department, position, status = "Pending", name } = req.body;

  try {
    const downloadURL = await uploadCvToFirebase(req.file);

    const query = `
      INSERT INTO pre_approvals (department, position, status, cv, name)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      department,
      position,
      status,
      downloadURL,
      name,
    ]);

    res.status(201).json({
      message: "Pre-approval record created successfully.",
      id: result.insertId,
      cvURL: downloadURL,
    });
  } catch (error) {
    console.error("Error creating pre-approval record:", error);
    res.status(500).json({ error: "Failed to create pre-approval record." });
  }
});

// Fetch All Pre-Approvals
router.get("/preApprovals", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pre_approvals");

    // Map through each row and modify the cv field to ensure it's returned correctly
    const preApprovalsWithUrls = rows.map((row) => {
      return {
        ...row,
        cv: row.cv ? row.cv : null, // If CV URL exists, send it; otherwise, null
      };
    });

    res.status(200).json(preApprovalsWithUrls);
  } catch (error) {
    console.error("Error fetching pre-approvals:", error);
    res.status(500).json({ error: "Failed to fetch pre-approvals." });
  }
});

// Fetch Single Pre-Approval by ID
router.get("/preApprovals/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM pre_approvals WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pre-approval record not found." });
    }

    // Modify the row to ensure the cv URL is sent correctly
    const preApproval = {
      ...rows[0],
      cv: rows[0].cv ? rows[0].cv : null,
    };

    res.status(200).json(preApproval);
  } catch (error) {
    console.error("Error fetching pre-approval record:", error);
    res.status(500).json({ error: "Failed to fetch pre-approval record." });
  }
});

// Update Pre-Approval Record
router.put("/preApprovals/:id", upload.single("cv"), async (req, res) => {
  const { id } = req.params;
  const { department, position, status, name } = req.body;

  try {
    // If a new CV file is uploaded, upload it to Firebase and get the URL
    let downloadURL = null;
    if (req.file) {
      downloadURL = await uploadCvToFirebase(req.file); // Upload the new file
    }

    // Update the pre-approval record in the database
    const query = `
      UPDATE pre_approvals
      SET department = ?, position = ?, status = ?, name = ?, 
          cv = COALESCE(?, cv)
      WHERE id = ?;
    `;
    const [result] = await pool.query(query, [
      department,
      position,
      status,
      name,
      downloadURL, // The new CV URL or null
      id,
    ]);

    // Check if the record was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pre-approval record not found." });
    }

    // Respond with the updated data (return downloadURL if it's updated)
    res.status(200).json({
      message: "Pre-approval record updated successfully.",
      cvURL: downloadURL || "No changes to CV",
    });
  } catch (error) {
    console.error("Error updating pre-approval record:", error);
    res.status(500).json({ error: "Failed to update pre-approval record." });
  }
});

// Delete Pre-Approval Record
router.delete("/preApprovals/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the pre-approval record to get the CV URL
    const [rows] = await pool.query(
      "SELECT cv FROM pre_approvals WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pre-approval record not found." });
    }

    const cvUrl = rows[0].cv;

    // If there is a CV URL, delete the file from Firebase
    if (cvUrl) {
      // Extract the file name from the URL and decode it
      const filePath = cvUrl.split("/o/")[1]?.split("?")[0]; // Extract file path
      const decodedFilePath = decodeURIComponent(filePath); // Decode URL-encoded path

      const fileRef = ref(storage, decodedFilePath); // Create reference with decoded path

      // Delete the file from Firebase Storage
      await deleteObject(fileRef);
    }

    // Delete the pre-approval record from MySQL
    const [result] = await pool.query(
      "DELETE FROM pre_approvals WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pre-approval record not found." });
    }

    res
      .status(200)
      .json({ message: "Pre-approval record deleted successfully." });
  } catch (error) {
    console.error("Error deleting pre-approval record:", error);
    res.status(500).json({ error: "Failed to delete pre-approval record." });
  }
});

module.exports = router;
