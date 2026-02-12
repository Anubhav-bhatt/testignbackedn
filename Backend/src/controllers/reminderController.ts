import { Request, Response } from "express";
import { query } from "../db";

export const getReminders = async (req: Request, res: Response) => {
    try {
        const { rows } = await query('SELECT * FROM reminders WHERE lawyer_id = $1 ORDER BY date ASC, time ASC', ['u1']);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching reminders:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createReminder = async (req: Request, res: Response) => {
    const { title, date, time } = req.body;
    if (!title || !date) {
        return res.status(400).json({ message: "Title and Date are required" });
    }

    try {
        const id = 'rem_' + Date.now();
        const { rows } = await query(
            'INSERT INTO reminders (id, title, date, time, lawyer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, title, date, time || '09:00 AM', 'u1']
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Error creating reminder:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteReminder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM reminders WHERE id = $1', [id]);
        res.json({ message: "Reminder deleted" });
    } catch (error) {
        console.error("Error deleting reminder:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
