import { Request, Response } from "express";
import { query } from "../db";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['user-id'] || 'u1';
        const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
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
    const { name, firmName, barId, selfie_url, biometrics_enabled } = req.body;
    try {
        const userId = req.headers['user-id'] || 'u1';
        const { rows } = await query(
            'UPDATE users SET name = COALESCE($1, name), firm_name = COALESCE($2, firm_name), bar_id = COALESCE($3, bar_id), selfie_url = COALESCE($5, selfie_url), biometrics_enabled = COALESCE($6, biometrics_enabled) WHERE id = $4 RETURNING *',
            [name, firmName, barId, userId, selfie_url, biometrics_enabled]
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

// Admin Endpoints
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { rows: users } = await query(`
            SELECT 
                u.*,
                (SELECT COUNT(*)::int FROM cases c WHERE c.lawyer_id = u.id) as total_cases,
                (SELECT COALESCE(SUM(p.amount), 0)::float 
                 FROM payments p 
                 JOIN cases c ON p.case_id = c.id 
                 WHERE c.lawyer_id = u.id AND p.status = 'Paid') as total_earnings
            FROM users u
        `);
        
        // Also fetch documents associated with users
        const { rows: docs } = await query('SELECT * FROM documents WHERE user_id IS NOT NULL');
        
        const usersWithDocs = users.map(user => ({
            ...user,
            documents: docs.filter(d => d.user_id === user.id)
        }));
        
        res.json(usersWithDocs);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, role } = req.body;
    try {
        const { rows } = await query(
            'UPDATE users SET status = COALESCE($1, status), role = COALESCE($2, role) WHERE id = $3 RETURNING *',
            [status, role, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, phone, role, status } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    try {
        const id = 'u_' + Date.now().toString();
        const { rows } = await query(
            'INSERT INTO users (id, name, email, phone, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, email, phone, role || 'client', status || 'approved']
        );
        res.status(201).json(rows[0]);
    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "User with this email or phone already exists" });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
