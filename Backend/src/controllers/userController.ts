import { Request, Response } from "express";
import { query } from "../db";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { rows } = await query('SELECT * FROM users WHERE id = $1', ['u1']);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { name, firmName, barId } = req.body;
    try {
        const { rows } = await query(
            'UPDATE users SET name = COALESCE($1, name), firm_name = COALESCE($2, firm_name), bar_id = COALESCE($3, bar_id) WHERE id = $4 RETURNING *',
            [name, firmName, barId, 'u1']
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
