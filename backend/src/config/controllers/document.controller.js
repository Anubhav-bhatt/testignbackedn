import { pool } from "../config/db.js";

export const uploadDocument = async (req, res) => {
  try {
    const { title, documentType } = req.body;
    const fileUrl = req.file.path;

    const result = await pool.query(
      `INSERT INTO documents (title, document_type, file_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, documentType, fileUrl]
    );

    res.status(201).json({
      message: "Document uploaded successfully",
      document: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllDocuments = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM documents ORDER BY uploaded_at DESC"
  );
  res.json(result.rows);
};
