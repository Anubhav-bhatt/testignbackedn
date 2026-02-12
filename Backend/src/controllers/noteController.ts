import { Request, Response } from "express";
import { query } from "../db";

export const getNotes = async (req: Request, res: Response) => {
    const { caseId } = req.query;
    try {
        let text = 'SELECT * FROM notes';
        const values: any[] = [];

        if (caseId) {
            text += ' WHERE case_id = $1';
            values.push(caseId);
        }

        text += ' ORDER BY created_at DESC';

        const { rows } = await query(text, values);
        // Transform keys to camelCase for frontend compatibility
        const formatted = rows.map(r => ({
            id: r.id,
            content: r.content,
            caseId: r.case_id,
            createdAt: r.created_at
        }));
        res.json(formatted);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createNote = async (req: Request, res: Response) => {
    const { content, caseId } = req.body;
    if (!content || !caseId) {
        return res.status(400).json({ error: "Content and Case ID are required" });
    }

    try {
        const id = Date.now().toString();
        const { rows } = await query(
            'INSERT INTO notes (id, content, case_id) VALUES ($1, $2, $3) RETURNING *',
            [id, content, caseId]
        );
        const newNote = rows[0];
        res.status(201).json({
            id: newNote.id,
            content: newNote.content,
            caseId: newNote.case_id,
            createdAt: newNote.created_at
        });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM notes WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
