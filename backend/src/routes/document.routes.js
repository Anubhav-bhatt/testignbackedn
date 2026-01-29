import express from "express";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file received" });
  }

  res.json({
    success: true,
    filename: req.file.filename,
  });
});

export default router;
