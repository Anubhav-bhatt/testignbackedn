import { Request, Response } from "express";
import { query } from "../db";

export const getPayments = async (req: Request, res: Response) => {
    const { caseId } = req.query;
    try {
        let text = 'SELECT * FROM payments';
        const values: any[] = [];

        if (caseId) {
            text += ' WHERE case_id = $1';
            values.push(caseId);
        }

        text += ' ORDER BY date DESC';

        const { rows } = await query(text, values);
        // Transform keys to camelCase for frontend compatibility
        const formatted = rows.map(r => ({
            id: r.id,
            amount: parseFloat(r.amount), // ensure number
            status: r.status,
            date: r.date,
            description: r.description,
            caseId: r.case_id
        }));
        res.json(formatted);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    const { amount, status, description, caseId } = req.body;

    if (!amount || !status || !caseId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const id = Date.now().toString();
        const date = new Date();
        const { rows } = await query(
            'INSERT INTO payments (id, amount, status, description, case_id, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, amount, status, description, caseId, date]
        );
        const newPayment = rows[0];
        res.status(201).json({
            id: newPayment.id,
            amount: parseFloat(newPayment.amount),
            status: newPayment.status,
            date: newPayment.date,
            description: newPayment.description,
            caseId: newPayment.case_id
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM payments WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
