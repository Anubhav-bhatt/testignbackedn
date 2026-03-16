import { query } from "../db";

type CaseInsight = {
    caseId: string;
    riskLevel: "low" | "medium" | "high";
    summary: string;
    recommendations: string[];
    metrics: {
        documents: number;
        notes: number;
        hearings: number;
        payments: number;
        paidAmount: number;
        pendingAmount: number;
    };
};

export const getCaseInsights = async (caseId: string): Promise<CaseInsight> => {
    const caseRes = await query("SELECT id, title, status FROM cases WHERE id = $1", [caseId]);
    if (caseRes.rows.length === 0) {
        throw new Error("Case not found");
    }

    const [docRes, noteRes, hearingRes, paymentRes] = await Promise.all([
        query("SELECT COUNT(*)::int AS count FROM documents WHERE case_id = $1", [caseId]),
        query("SELECT COUNT(*)::int AS count FROM notes WHERE case_id = $1", [caseId]),
        query("SELECT COUNT(*)::int AS count FROM hearings WHERE case_id = $1", [caseId]),
        query(
            "SELECT COALESCE(SUM(amount), 0)::float AS billed, COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0)::float AS paid, COUNT(*)::int AS count FROM payments WHERE case_id = $1",
            [caseId]
        ),
    ]);

    const documents = docRes.rows[0].count;
    const notes = noteRes.rows[0].count;
    const hearings = hearingRes.rows[0].count;
    const payments = paymentRes.rows[0].count;
    const paidAmount = paymentRes.rows[0].paid;
    const billedAmount = paymentRes.rows[0].billed;
    const pendingAmount = billedAmount - paidAmount;

    let riskLevel: "low" | "medium" | "high" = "low";
    if (documents === 0 || pendingAmount > 0) {
        riskLevel = "medium";
    }
    if (documents === 0 && hearings > 0) {
        riskLevel = "high";
    }

    const summary = `Case ${caseId} has ${documents} documents, ${hearings} hearings and pending amount ${pendingAmount.toFixed(2)}.`;

    const recommendations: string[] = [];
    if (documents === 0) {
        recommendations.push("Upload supporting documents before next hearing.");
    }
    if (notes === 0) {
        recommendations.push("Add internal notes to capture strategy and action items.");
    }
    if (pendingAmount > 0) {
        recommendations.push("Follow up on pending payment with client.");
    }
    if (recommendations.length === 0) {
        recommendations.push("Case data looks healthy. Continue routine follow-up.");
    }

    return {
        caseId,
        riskLevel,
        summary,
        recommendations,
        metrics: {
            documents,
            notes,
            hearings,
            payments,
            paidAmount,
            pendingAmount,
        },
    };
};
