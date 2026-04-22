import { GoogleGenerativeAI } from '@google/generative-ai';

let genAIInstance = null;

function getGenAI() {
    if (!genAIInstance) {
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAIInstance;
}

export async function embedText(text) {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    const result = await model.embedContent(text);
    return result.embedding.values;
}

export async function embedBatch(texts) {
    const embeddings = [];
    for (const text of texts) {
        const embedding = await embedText(text);
        embeddings.push(embedding);
    }
    return embeddings;
}