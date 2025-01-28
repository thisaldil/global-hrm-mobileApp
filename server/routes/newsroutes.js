const express = require("express");
const router = express.Router();
const multer = require("multer");
const { initializeApp, getApps, getApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");
const pool = require("../database"); // Import MySQL connection pool
const firebaseConfig = require("../config/firebase.config");

// Initialize Firebase App if not already initialized
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();
const storage = getStorage(firebaseApp);

// Multer middleware for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Utility: Get current timestamp
const giveCurrentDateTime = () =>
  new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

// Upload file to Firebase
const uploadToFirebase = async (file) => {
  if (!file) throw new Error("No file uploaded");

  try {
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `attachments/${file.originalname} ${dateTime}`
    );
    const metadata = { contentType: file.mimetype };

    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata
    );
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw new Error("Failed to upload file to Firebase");
  }
};
// Add new post (Specific roles only)
router.post("/posts", upload.single("attachment"), async (req, res) => {
  const { title, content, userRole } = req.body;

  // Restrict post creation to specific roles
  const allowedRoles = ["Top Lvl Manager", "Ceo"];
  if (!allowedRoles.includes(userRole)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to create posts." });
  }

  try {
    const attachmentUrl = req.file ? await uploadToFirebase(req.file) : null;

    const query = `
        INSERT INTO posts (title, content, attachment, created_at)
        VALUES (?, ?, ?, ?)
      `;
    const [result] = await pool.query(query, [
      title,
      content,
      attachmentUrl,
      giveCurrentDateTime(),
    ]);

    res.status(201).json({
      message: "Post created successfully.",
      postId: result.insertId,
      attachmentUrl,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

router.get("/posts/created_at", async (req, res) => {
  try {
    // Query to fetch post id and created_at fields
    const [rows] = await pool
      .promise()
      .query("SELECT id, created_at FROM posts");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching created_at values:", error);
    res.status(500).json({ error: "Failed to fetch created_at values." });
  }
});

// Like a post
router.post("/posts/:id/like", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE posts SET likes = likes + 1 WHERE id = ?
    `;
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.status(200).json({ message: "Post liked successfully." });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post." });
  }
});

// Unlike a post
router.post("/posts/:id/unlike", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE posts SET likes = likes - 1 WHERE id = ? AND likes > 0
    `;
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Post not found or already unliked." });
    }

    res.status(200).json({ message: "Post unliked successfully." });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Failed to unlike post." });
  }
});

// Get all likes for each post
router.get("/posts/likes", async (req, res) => {
  try {
    // Query to get the likes count for each post
    const query = `
        SELECT id, title, likes FROM posts ORDER BY created_at DESC
      `;
    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No posts found." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Failed to fetch likes." });
  }
});

// Comment on a post
router.post("/posts/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { comment, user } = req.body;

  try {
    const query = `
      INSERT INTO comments (post_id, user, comment, created_at)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(query, [id, user, comment, giveCurrentDateTime()]);

    res.status(201).json({ message: "Comment added successfully." });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
});

// Get all comments for a specific post
router.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
        SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC
      `;
    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this post." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

// Edit a post
router.put("/posts/:id", upload.single("attachment"), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // Fetch the post to check if it exists and get the current attachment URL
    const [rows] = await pool.query(
      "SELECT attachment FROM posts WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    const currentAttachmentUrl = rows[0].attachment;

    // Upload a new attachment if provided
    let newAttachmentUrl = currentAttachmentUrl;
    if (req.file) {
      // Upload the new file
      newAttachmentUrl = await uploadToFirebase(req.file);

      // Delete the old attachment from Firebase Storage
      if (currentAttachmentUrl) {
        const filePath = currentAttachmentUrl.split("/o/")[1]?.split("?")[0];
        const decodedFilePath = decodeURIComponent(filePath);
        const fileRef = ref(storage, decodedFilePath);
        await deleteObject(fileRef);
      }
    }

    // Update the post in the database
    const query = `
          UPDATE posts 
          SET title = ?, content = ?, attachment = ?, updated_at = ?
          WHERE id = ?
        `;
    const [result] = await pool.query(query, [
      title,
      content,
      newAttachmentUrl,
      giveCurrentDateTime(),
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post not found or not updated." });
    }

    res.status(200).json({
      message: "Post updated successfully.",
      postId: id,
      attachmentUrl: newAttachmentUrl,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post." });
  }
});

// Delete a post (Managers only)
router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the post to get the attachment URL
    const [rows] = await pool.query(
      "SELECT attachment FROM posts WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    const attachmentUrl = rows[0].attachment;

    // Delete the attachment from Firebase Storage
    if (attachmentUrl) {
      const filePath = attachmentUrl.split("/o/")[1]?.split("?")[0];
      const decodedFilePath = decodeURIComponent(filePath);
      const fileRef = ref(storage, decodedFilePath);
      await deleteObject(fileRef);
    }

    // Delete the post from the database
    const [result] = await pool.query("DELETE FROM posts WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// Create a sticky card
router.post("/addStickyCard", async (req, res) => {
  const { title, description } = req.body;

  try {
    const [results] = await pool.query(
      `INSERT INTO sticky_card (title, description, updated_at) VALUES (?, ?, NOW())`,
      [title, description]
    );

    res.status(201).json({
      message: "Sticky card created successfully",
      cardId: results.insertId,
      title,
      description,
    });
  } catch (error) {
    console.error("Error creating sticky card:", error);
    res.status(500).json({ error: "Error creating sticky card" });
  }
});

// GET route to fetch all sticky cards
router.get("/getAllStickyCards", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM sticky_card");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching sticky cards:", error);
    res.status(500).json({ error: "Error fetching sticky cards" });
  }
});

// GET route to fetch a sticky card by id
router.get("/getStickyCard/:id", async (req, res) => {
  const cardId = req.params.id;

  try {
    const [results] = await pool.query(
      "SELECT * FROM sticky_card WHERE id = ?",
      [cardId]
    );

    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: "Sticky card not found" });
    }
  } catch (error) {
    console.error("Error fetching sticky card:", error);
    res.status(500).json({ error: "Error fetching sticky card" });
  }
});

// PUT route to update a sticky card
router.put("/updateStickyCard/:id", async (req, res) => {
  const cardId = req.params.id;
  const { title, description } = req.body;

  try {
    const [results] = await pool.query(
      `UPDATE sticky_card SET title = ?, description = ?, updated_at = NOW() WHERE id = ?`,
      [title, description, cardId]
    );

    if (results.affectedRows > 0) {
      res.status(200).json({
        message: "Sticky card updated successfully",
        cardId,
        title,
        description,
      });
    } else {
      res.status(404).json({ message: "Sticky card not found" });
    }
  } catch (error) {
    console.error("Error updating sticky card:", error);
    res.status(500).json({ error: "Error updating sticky card" });
  }
});

// DELETE route to delete a sticky card
router.delete("/deleteStickyCard/:id", async (req, res) => {
  const cardId = req.params.id;

  try {
    const [results] = await pool.query("DELETE FROM sticky_card WHERE id = ?", [
      cardId,
    ]);

    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Sticky card deleted successfully" });
    } else {
      res.status(404).json({ message: "Sticky card not found" });
    }
  } catch (error) {
    console.error("Error deleting sticky card:", error);
    res.status(500).json({ error: "Error deleting sticky card" });
  }
});

module.exports = router;
