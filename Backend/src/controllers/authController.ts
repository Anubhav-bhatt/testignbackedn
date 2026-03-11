import { Request, Response } from "express";
import { query } from "../db";

export const signup = async (req: Request, res: Response) => {
    const { name, email, phone, role, uploadedDocIds } = req.body;

    if (!name || !email || !phone) {
        res.status(400).json({ error: "Name, email, and phone are required" });
        return;
    }

    try {
        // Check if user exists by phone
        const existing = await query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (existing.rows.length > 0) {
            res.status(400).json({ error: "User with this phone number already exists" });
            return;
        }

        const id = 'u_' + Date.now().toString();
        const { rows } = await query(
            'INSERT INTO users (id, name, email, phone, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, email, phone, role || 'client', 'pending']
        );

        // Bind uploaded documents to this new user and set selfie_url
        if (uploadedDocIds && Array.isArray(uploadedDocIds) && uploadedDocIds.length > 0) {
            const placeholders = uploadedDocIds.map((_, i) => `$${i + 2}`).join(', ');
            await query(`UPDATE documents SET user_id = $1 WHERE id IN (${placeholders})`, [id, ...uploadedDocIds]);

            // Specifically find the selfie document to update current user
            const { rows: docRows } = await query(`SELECT filename FROM documents WHERE id IN (${placeholders}) AND doc_type = 'selfie' LIMIT 1`, uploadedDocIds);
            if (docRows.length > 0) {
                await query('UPDATE users SET selfie_url = $1 WHERE id = $2', [docRows[0].filename, id]);
            }
        }

        res.status(201).json({ message: "Signup successful", user: rows[0] });
    } catch (error: any) {
        console.error("Signup error:", error);
        if (error.code === '23505') {
            res.status(400).json({ error: "User with this email or phone already exists" });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400).json({ error: "Phone number is required" });
        return;
    }

    try {
        const { rows } = await query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (rows.length === 0) {
            res.status(404).json({ error: "User not found. Please sign up first." });
            return;
        }

        // Return the actual status from the row (so 'approved' numbers work)
        res.status(200).json({ message: "Login successful", user: rows[0] });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const sendOtp = async (req: Request, res: Response) => {
    const { phone, checkExists } = req.body;

    if (!phone) {
        res.status(400).json({ error: "Phone number is required" });
        return;
    }

    if (checkExists) {
        try {
            const { rows } = await query('SELECT * FROM users WHERE phone = $1', [phone]);
            if (rows.length === 0) {
                res.status(404).json({ error: "User not found. Please sign up first." });
                return;
            }
        } catch (error) {
            console.error("Database error in sendOtp:", error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n=========================================\n🔑 SERVER OTP LOG: Your OTP for ${phone} is: ${generatedOtp}\n=========================================\n`);

    res.status(200).json({ message: "OTP sent successfully", otp: generatedOtp });
};
