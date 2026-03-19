import { Request, Response } from "express";
import { query } from "../db";

type OtpRecord = {
    otp: string;
    expiresAt: number;
    attempts: number;
};

const otpStore = new Map<string, OtpRecord>();
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const OTP_DEBUG_ENABLED = process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

const findUserByNormalizedPhone = async (phone: string) => {
    return query(
        "SELECT * FROM users WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1",
        [phone]
    );
};

const purgeExpiredOtp = (phone: string) => {
    const record = otpStore.get(phone);
    if (record && record.expiresAt <= Date.now()) {
        otpStore.delete(phone);
    }
};

export const signup = async (req: Request, res: Response) => {
    const { name, role, uploadedDocIds } = req.body;
    const email = String(req.body.email || '').trim();
    const phone = normalizePhone(req.body.phone || '');

    if (!name || !email || !phone) {
        res.status(400).json({ error: "Name, email, and phone are required" });
        return;
    }

    if (!isValidPhone(phone)) {
        res.status(400).json({ error: "Valid 10-digit phone number is required" });
        return;
    }

    try {
        // Check if user exists by normalized phone to support legacy values like +91XXXXXXXXXX.
        const existing = await findUserByNormalizedPhone(phone);
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
    const phone = normalizePhone(req.body.phone || "");

    if (!isValidPhone(phone)) {
        res.status(400).json({ error: "Phone number is required" });
        return;
    }

    try {
        const { rows } = await findUserByNormalizedPhone(phone);
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
    const { checkExists } = req.body;
    const phone = normalizePhone(req.body.phone || "");
    console.log(`📩 OTP Request received for phone: ${phone}`);

    if (!isValidPhone(phone)) {
        res.status(400).json({ error: "Valid 10-digit phone number is required" });
        return;
    }

    if (checkExists) {
        try {
            const { rows } = await findUserByNormalizedPhone(phone);
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
    
    console.log("\n" + "=".repeat(50));
    console.log(`🚀 [AUTH] SENDING OTP`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 OTP: ${generatedOtp}`);
    console.log("=".repeat(50) + "\n");

    otpStore.set(phone, {
        otp: generatedOtp,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
    });

    res.status(200).json({
        message: OTP_DEBUG_ENABLED ? "OTP generated in debug mode. Check console logs or debugOtp." : "OTP sent successfully",
        debugOtp: OTP_DEBUG_ENABLED ? generatedOtp : undefined,
        expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    });
};

export const verifyOtp = async (req: Request, res: Response) => {
    const phone = normalizePhone(req.body.phone || "");
    const otp = String(req.body.otp || '').trim();

    if (!isValidPhone(phone)) {
        return res.status(400).json({ error: "Valid 10-digit phone number is required" });
    }

    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ error: "Valid 6-digit OTP is required" });
    }

    purgeExpiredOtp(phone);
    const record = otpStore.get(phone);

    if (!record) {
        return res.status(400).json({ error: "OTP expired or not requested. Please resend OTP." });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(phone);
        return res.status(429).json({ error: "Too many incorrect attempts. Please request a new OTP." });
    }

    if (record.otp !== otp) {
        record.attempts += 1;
        otpStore.set(phone, record);
        return res.status(400).json({ error: "Invalid OTP" });
    }

    otpStore.delete(phone);
    return res.status(200).json({ message: "OTP verified successfully" });
};
