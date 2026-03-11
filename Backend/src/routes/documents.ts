import { Router } from "express";
import { deleteDocument, getDocuments, upload, uploadDocument } from "../controllers/documentController";

const router = Router();

// Upload a single file
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents (optionally filtered by caseId)
router.get("/", getDocuments);

// Delete a document
router.delete("/:id", deleteDocument);

export default router;
