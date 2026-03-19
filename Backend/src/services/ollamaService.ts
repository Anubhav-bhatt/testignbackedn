type OllamaGenerateOptions = {
    system?: string;
    format?: 'json';
    temperature?: number;
};

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

const assertText = async (response: Response) => {
    if (response.ok) {
        return response.json();
    }

    const errorBody = await response.text();
    throw new Error(`Ollama request failed with ${response.status}: ${errorBody}`);
};

export const getOllamaConfig = () => ({
    baseUrl: OLLAMA_BASE_URL,
    chatModel: OLLAMA_CHAT_MODEL,
    embedModel: OLLAMA_EMBED_MODEL,
});

export const generateText = async (prompt: string, options: OllamaGenerateOptions = {}): Promise<string> => {
    const payload = {
        model: OLLAMA_CHAT_MODEL,
        prompt,
        system: options.system,
        stream: false,
        format: options.format,
        options: {
            temperature: options.temperature ?? 0.2,
        },
    };

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await assertText(response) as { response?: string };
    if (!data.response) {
        throw new Error('Ollama returned an empty text response');
    }

    return data.response.trim();
};

export const generateJson = async <T>(prompt: string, system?: string): Promise<T> => {
    const raw = await generateText(prompt, { system, format: 'json' });
    return JSON.parse(raw) as T;
};

export const embedText = async (input: string): Promise<number[]> => {
    const embedResponse = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_EMBED_MODEL,
            input,
        }),
    });

    if (embedResponse.ok) {
        const data = await embedResponse.json() as { embeddings?: number[][] };
        const embedding = data.embeddings?.[0];
        if (embedding?.length) {
            return embedding;
        }
    }

    const legacyResponse = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_EMBED_MODEL,
            prompt: input,
        }),
    });

    const legacyData = await assertText(legacyResponse) as { embedding?: number[] };
    if (!legacyData.embedding?.length) {
        throw new Error('Ollama returned an empty embedding vector');
    }

    return legacyData.embedding;
};