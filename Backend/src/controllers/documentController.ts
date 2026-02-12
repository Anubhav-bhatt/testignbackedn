import { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { query } from "../db";

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });

export const uploadDocument = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    const { caseId, docType } = req.body;
    const finalCaseId = (caseId === 'profile-temp' || caseId === 'undefined' || !caseId) ? null : caseId;

    try {
        const id = Date.now().toString();
        const { rows } = await query(
            'INSERT INTO documents (id, filename, original_name, mime_type, size, case_id, doc_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                id,
                req.file.filename,
                req.file.originalname,
                req.file.mimetype,
                req.file.size,
                finalCaseId,
                docType || null,
                new Date()
            ]
        );
        const newDoc = rows[0];

        // Match frontend expected structure
        res.status(201).json({
            id: newDoc.id,
            filename: newDoc.filename,
            originalName: newDoc.original_name,
            mimeType: newDoc.mime_type,
            size: parseInt(newDoc.size),
            caseId: newDoc.case_id,
            docType: newDoc.doc_type,
            createdAt: newDoc.created_at
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getDocuments = async (req: Request, res: Response) => {
    const { caseId } = req.query;

    try {
        let text = 'SELECT * FROM documents';
        const values: any[] = [];

        if (caseId) {
            text += ' WHERE case_id = $1';
            values.push(caseId);
        }

        text += ' ORDER BY created_at DESC';

        const { rows } = await query(text, values);

        const formatted = rows.map(d => ({
            id: d.id,
            filename: d.filename,
            originalName: d.original_name,
            mimeType: d.mime_type,
            size: parseInt(d.size),
            caseId: d.case_id,
            createdAt: d.created_at
        }));
        res.json(formatted);

    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
