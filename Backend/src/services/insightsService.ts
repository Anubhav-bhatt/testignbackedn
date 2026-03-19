import { query } from '../db';
import { generateJson } from './ollamaService';
import { buildContextBlock, retrieveRelevantChunks } from './ragService';

type CaseInsight = {
    case_summary: string;
    tactical_insights: string[];
    evidentiary_risks: string[];
    precedents_analysis: string;
    procedural_next_steps: string[];
    probability_assessment: string;
    summary?: string;
    actions?: string[];
    metrics?: {
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

    const notesDetails = await query(
        'SELECT content, created_at FROM notes WHERE case_id = $1 ORDER BY created_at DESC LIMIT 5',
        [caseId]
    );
    const hearingsDetails = await query(
        'SELECT purpose, date, status FROM hearings WHERE case_id = $1 ORDER BY date DESC LIMIT 5',
        [caseId]
    );

    const retrieval = await retrieveRelevantChunks(`${caseRes.rows[0].title} ${caseRes.rows[0].status}`, caseId, 5);
    const ragContext = buildContextBlock(retrieval.chunks);

    const prompt = `
Return a JSON object with exactly these keys:
- case_summary: string
- tactical_insights: string[]
- evidentiary_risks: string[]
- precedents_analysis: string
- procedural_next_steps: string[]
- probability_assessment: string

Case facts:
- id: ${caseId}
- title: ${caseRes.rows[0].title}
- stage: ${caseRes.rows[0].status}
- documents: ${documents}
- notes: ${notes}
- hearings: ${hearings}
- payments: ${payments}
- paid_amount: ${paidAmount}
- pending_amount: ${pendingAmount}
- risk_level_hint: ${riskLevel}

Recent notes:
${notesDetails.rows.map((row: { content: string; created_at: Date }) => `[${new Date(row.created_at).toISOString().split('T')[0]}] ${row.content}`).join('\n') || 'None'}

Recent hearings:
${hearingsDetails.rows.map((row: { purpose: string; date: string; status: string }) => `[${row.date}] ${row.purpose} - ${row.status}`).join('\n') || 'None'}

Retrieved legal/document context:
${ragContext}

Requirements:
- Be concrete and litigation-oriented.
- Do not invent evidence or precedents.
- If context is weak, say that explicitly.
- Keep each list to 3 to 5 items max.
`;

    try {
        const generated = await generateJson<Omit<CaseInsight, 'summary' | 'actions' | 'metrics'>>(prompt, 'You generate structured legal case analysis as strict JSON.');
        return {
            ...generated,
            summary: generated.case_summary,
            actions: generated.tactical_insights,
            metrics: {
                documents,
                notes,
                hearings,
                payments,
                paidAmount,
                pendingAmount,
            },
        };
    } catch (error) {
        console.error('Failed to generate Ollama case insights, falling back to deterministic analysis:', error);
        return {
            case_summary: `Case ${caseId} is currently in ${caseRes.rows[0].status} stage with ${documents} documents and pending amount ${pendingAmount.toFixed(2)}.`,
            tactical_insights: recommendations,
            evidentiary_risks: documents === 0 ? ['No supporting documents are indexed for this matter yet.'] : ['Review retrieved documents for admissibility and completeness.'],
            precedents_analysis: retrieval.chunks.length > 0 ? 'Related indexed material was found in the local knowledge base and should be reviewed before drafting.' : 'No indexed precedent-like material was retrieved from the local knowledge base.',
            procedural_next_steps: recommendations,
            probability_assessment: `Current operational risk is ${riskLevel}. This is a workflow estimate, not a merits prediction.`,
            summary: `Case ${caseId} is currently in ${caseRes.rows[0].status} stage with ${documents} documents and pending amount ${pendingAmount.toFixed(2)}.`,
            actions: recommendations,
            metrics: {
                documents,
                notes,
                hearings,
                payments,
                paidAmount,
                pendingAmount,
            },
        };
    }
};
