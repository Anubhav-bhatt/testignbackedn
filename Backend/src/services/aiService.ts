import { query } from '../db';
import { generateJson, generateText, getOllamaConfig } from './ollamaService';
import { buildContextBlock, buildSources, retrieveRelevantChunks, type RagSource } from './ragService';

export type AiQueryResponse = {
    response: string;
    sources: RagSource[];
    retrieval: {
        scope: 'case' | 'global' | 'none';
        chunkCount: number;
        totalCandidates: number;
    };
};

type StructuredAnswer = {
    answer: string;
    risk_or_caution?: string;
    next_action?: string;
};

export const generateLegalResponse = async (userQuery: string, caseId?: string): Promise<AiQueryResponse> => {
    try {
        const ollamaConfig = getOllamaConfig();
        let caseContext = 'No case-specific context provided.';
        let notesContext = 'No recent notes found.';
        let hearingContext = 'No hearing history found.';

        if (caseId) {
            const [caseRes, notesRes, hearingRes] = await Promise.all([
                query('SELECT id, title, category, court, status, next_hearing FROM cases WHERE id = $1', [caseId]),
                query('SELECT content, created_at FROM notes WHERE case_id = $1 ORDER BY created_at DESC LIMIT 5', [caseId]),
                query('SELECT purpose, date, status FROM hearings WHERE case_id = $1 ORDER BY date DESC LIMIT 5', [caseId]),
            ]);

            if (caseRes.rows.length > 0) {
                const matter = caseRes.rows[0];
                caseContext = [
                    `Case ID: ${matter.id}`,
                    `Title: ${matter.title}`,
                    `Category: ${matter.category || 'N/A'}`,
                    `Court: ${matter.court || 'N/A'}`,
                    `Stage: ${matter.status || 'N/A'}`,
                    `Next hearing: ${matter.next_hearing || 'N/A'}`,
                ].join('\n');
            }

            if (notesRes.rows.length > 0) {
                notesContext = notesRes.rows
                    .map((row: { content: string; created_at: Date }) => `[${new Date(row.created_at).toISOString().split('T')[0]}] ${row.content}`)
                    .join('\n');
            }

            if (hearingRes.rows.length > 0) {
                hearingContext = hearingRes.rows
                    .map((row: { purpose: string; date: string; status: string }) => `[${row.date}] ${row.purpose} - ${row.status}`)
                    .join('\n');
            }
        }

        const retrieval = await retrieveRelevantChunks(userQuery, caseId, 6);
        const ragContext = buildContextBlock(retrieval.chunks);
        const sources = buildSources(retrieval.chunks);

        const prompt = `
You are a legal assistant for Indian legal workflows using a local Ollama RAG stack.
Chat model: ${ollamaConfig.chatModel}
Embedding model: ${ollamaConfig.embedModel}
    Retrieval scope: ${retrieval.scope}

Matter Context:
${caseContext}

Recent Notes:
${notesContext}

Hearing History:
${hearingContext}

Retrieved Document Context:
${ragContext}

User Query:
${userQuery}

Return JSON with exactly these keys:
- answer: string
- next_action: string
- risk_or_caution: string

Only claim facts that are supported by the provided context. If the record is missing, say so explicitly.
`;

        let responseText: string;

        try {
            const structured = await generateJson<StructuredAnswer>(prompt, 'You are a careful legal workflow assistant. Do not invent statutes, filings, evidence, or hearing outcomes. Return strict JSON only.');
            responseText = [
                structured.answer?.trim(),
                structured.next_action ? `Next action: ${structured.next_action.trim()}` : null,
                structured.risk_or_caution ? `Risk/Caution: ${structured.risk_or_caution.trim()}` : null,
            ].filter(Boolean).join('\n\n');
        } catch (structuredError) {
            console.warn('Structured AI response failed, falling back to plain text generation:', structuredError);
            responseText = await generateText(prompt.replace('Return JSON with exactly these keys:\n- answer: string\n- next_action: string\n- risk_or_caution: string\n', 'Provide a concise, practical legal-assistant style response with:\n1) Key point summary\n2) Suggested next action\n3) Any risk/caution\n'), {
                system: 'You are a careful legal workflow assistant. Do not invent statutes, filings, evidence, or hearing outcomes.',
                temperature: 0.2,
            });
        }

        return {
            response: responseText,
            sources,
            retrieval: {
                scope: retrieval.scope,
                chunkCount: retrieval.chunks.length,
                totalCandidates: retrieval.totalCandidates,
            },
        };

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return {
            response: `I could not generate a response from the local Ollama AI stack. Error: ${error.message}`,
            sources: [],
            retrieval: {
                scope: 'none',
                chunkCount: 0,
                totalCandidates: 0,
            },
        };
    }
};

