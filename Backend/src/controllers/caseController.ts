import { Request, Response } from "express";
import { getCaseInsights } from "../../../AI/engine/insights";
import { query } from "../db";
import { generateLegalResponse } from "../services/aiService";

export const getCases = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['user-id'] as string;
        
        // Fetch user to check role
        const { rows: userRows } = await query('SELECT role FROM users WHERE id = $1', [userId]);
        const userRole = userRows.length > 0 ? userRows[0].role : 'client';

        let text = `
            SELECT 
                c.*,
                (SELECT COUNT(*)::int FROM documents d WHERE d.case_id = c.id) as document_count,
                (SELECT COALESCE(SUM(amount), 0)::float FROM payments p WHERE p.case_id = c.id) as total_billed,
                (SELECT COALESCE(SUM(amount), 0)::float FROM payments p WHERE p.case_id = c.id AND p.status = 'Paid') as total_paid
            FROM cases c
        `;

        const params: any[] = [];
        if (userRole !== 'admin') {
            text += ` WHERE c.lawyer_id = $1`;
            params.push(userId);
        }

        text += ` ORDER BY c.next_hearing ASC`;
        const { rows } = await query(text, params);

        const summary = rows.map(r => {
            const pendingValue = r.total_billed - r.total_paid;
            return {
                id: r.id,
                caseId: r.case_id,
                title: r.title,
                clientName: r.client_name,
                clientImage: r.client_image,
                category: r.category,
                court: r.court,
                nextHearing: r.next_hearing,
                status: r.status,
                statusColor: r.status_color,
                lawyerId: r.lawyer_id,
                documentCount: r.document_count,
                totalFixedAmount: r.total_fixed_amount,
                pendingAmount: r.total_fixed_amount ? (r.total_fixed_amount - r.total_paid) : pendingValue,
                totalPaid: r.total_paid,
                hasPendingPayment: (r.total_fixed_amount ? (r.total_fixed_amount - r.total_paid) : pendingValue) > 0,
                hasDocs: r.document_count > 0
            };
        });

        res.json(summary);
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createCase = async (req: Request, res: Response) => {
    const { title, clientName, caseId, category, court, nextHearing, clientImage: providedImage, documents } = req.body;

    if (!title || !clientName) {
        return res.status(400).json({ message: "Title and Client Name are required" });
    }

    try {
        const id = (await query('SELECT COUNT(*) FROM cases')).rows[0].count + 1 + Date.now(); // Simple ID generation
        const generatedCaseId = caseId || `CAS-${Date.now()}`;
        const defaultCategory = category || "Civil";
        const clientImage = providedImage || `https://i.pravatar.cc/150?u=${Math.random()}`;
        const statusColor = defaultCategory === 'Criminal' ? "#EF4444" : "#3B82F6";

        const userId = req.headers['user-id'] || 'u1';
        
        const { rows } = await query(
            `INSERT INTO cases (
                id, case_id, title, client_name, client_image, category, court, next_hearing, status, status_color, lawyer_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                id.toString(),
                generatedCaseId,
                title,
                clientName,
                clientImage,
                defaultCategory,
                court || "Jurisdiction Pending",
                nextHearing || "TBD",
                "Newly Filed",
                statusColor,
                userId
            ]
        );

        const newCase = rows[0];

        // Link uploaded intake documents to this case
        if (documents) {
            for (const key of Object.keys(documents)) {
                const doc = documents[key];
                if (doc.filename) {
                    await query(
                        'UPDATE documents SET case_id = $1, doc_type = $2 WHERE filename = $3',
                        [newCase.id, key, doc.filename]
                    );
                }
            }
        }

        // Return in camelCase
        res.status(201).json({
            id: newCase.id,
            caseId: newCase.case_id,
            title: newCase.title,
            clientName: newCase.client_name,
            clientImage: newCase.client_image,
            category: newCase.category,
            court: newCase.court,
            nextHearing: newCase.next_hearing,
            status: newCase.status,
            statusColor: newCase.status_color,
            lawyerId: newCase.lawyer_id,
            totalFixedAmount: newCase.total_fixed_amount
        });
    } catch (error) {
        console.error("Error creating case:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCaseById = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        // Fetch Case
        const caseRes = await query('SELECT * FROM cases WHERE id = $1', [id]);
        if (caseRes.rows.length === 0) {
            return res.status(404).json({ message: "Case not found" });
        }
        const c = caseRes.rows[0];

        // Fetch Related Data
        const [docsRes, paymentsRes, notesRes, hearingsRes] = await Promise.all([
            query('SELECT * FROM documents WHERE case_id = $1', [id]),
            query('SELECT * FROM payments WHERE case_id = $1', [id]),
            query('SELECT * FROM notes WHERE case_id = $1 ORDER BY created_at DESC', [id]),
            query('SELECT * FROM hearings WHERE case_id = $1', [id])
        ]);

        const documents = docsRes.rows.map(d => ({
            id: d.id,
            filename: d.filename,
            originalName: d.original_name,
            mimeType: d.mime_type,
            size: parseInt(d.size),
            caseId: d.case_id,
            createdAt: d.created_at
        }));

        const payments = paymentsRes.rows.map(p => ({
            id: p.id,
            amount: parseFloat(p.amount),
            status: p.status,
            date: p.date,
            description: p.description,
            caseId: p.case_id
        }));

        const notes = notesRes.rows.map(n => ({
            id: n.id,
            content: n.content,
            caseId: n.case_id,
            createdAt: n.created_at
        }));

        const hearings = hearingsRes.rows.map(h => ({
            id: h.id,
            caseId: h.case_id,
            date: h.date,
            purpose: h.purpose,
            status: h.status,
            documents: documents.filter(d => h.document_ids && h.document_ids.includes(d.id))
        }));

        const totalBilled = payments.reduce((acc, p) => acc + p.amount, 0);
        const totalPaid = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
        const pendingValue = totalBilled - totalPaid;

        res.json({
            id: c.id,
            caseId: c.case_id,
            title: c.title,
            clientName: c.client_name,
            clientImage: c.client_image,
            category: c.category,
            court: c.court,
            nextHearing: c.next_hearing,
            status: c.status,
            statusColor: c.status_color,
            lawyerId: c.lawyer_id,
            totalFixedAmount: c.total_fixed_amount,
            documentCount: documents.length,
            documents,
            payments,
            notes,
            hearings,
            pendingAmount: c.total_fixed_amount ? (c.total_fixed_amount - totalPaid) : pendingValue,
            totalPaid: totalPaid
        });

    } catch (error) {
        console.error("Error fetching case details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCaseAnalysis = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        console.log(`[AI] Generating Strategic Analysis for case: ${id}`);
        const insights = await getCaseInsights(id);
        res.json(insights);
    } catch (error) {
        console.error("Error fetching analysis:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const chatWithAI = async (req: Request, res: Response) => {
    const { query, caseId } = req.body;

    try {
        const answer = await generateLegalResponse(query, caseId);
        res.json({ answer });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateHearingDate = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { nextHearing } = req.body;

    if (!nextHearing) {
        return res.status(400).json({ message: "New hearing date is required" });
    }

    try {
        // 1. Update the case's next hearing date
        const { rows } = await query(
            'UPDATE cases SET next_hearing = $1 WHERE id = $2 RETURNING *',
            [nextHearing, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Case not found" });
        }

        const updatedCase = rows[0];

        // 2. Add an entry to the hearing history (optional but good practice)
        await query(
            'INSERT INTO hearings (id, case_id, date, purpose, status) VALUES ($1, $2, $3, $4, $5)',
            [Date.now().toString(), updatedCase.id, nextHearing, "Next Scheduled Hearing", "Upcoming"]
        );

        res.json({
            message: "Hearing date updated",
            nextHearing: updatedCase.next_hearing
        });

    } catch (error) {
        console.error("Error updating hearing date:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const closeCase = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const { rows } = await query(
            "UPDATE cases SET status = 'Closed', next_hearing = 'No Further Hearings', status_color = '#6B7280' WHERE id = $1 RETURNING *",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Case not found" });
        }

        res.json({ message: "Case closed successfully", case: rows[0] });
    } catch (error) {
        console.error("Error closing case:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateCaseDeal = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { totalFixedAmount } = req.body;

    try {
        const { rows } = await query(
            'UPDATE cases SET total_fixed_amount = $1 WHERE id = $2 RETURNING *',
            [totalFixedAmount, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Case not found" });
        }

        res.json({
            message: "Deal fixed successfully",
            totalFixedAmount: rows[0].total_fixed_amount
        });
    } catch (error) {
        console.error("Error updating deal:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
