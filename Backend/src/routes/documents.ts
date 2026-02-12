import { Router } from "express";
import { getDocuments, upload, uploadDocument } from "../controllers/documentController";

const router = Router();

// Upload a single file
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents (optionally filtered by caseId)
router.get("/", getDocuments);

export default router;
