import { searchSimilar } from './vectorStore';
import { generateWithSystemPrompt } from './groq';

export async function retrieveAndAnswer(query, userId, documentIds) {
    const chunks = await searchSimilar(
        `doc_${userId}`,
        query,
        documentIds,
        10 // Search more chunks if multiple files are involved
    );

    if (chunks.length === 0) {
        return {
            answer: 'Maaf, tidak ditemukan informasi relevan dalam dokumen.',
            sources: [],
        };
    }

    const contextText = chunks
        .map((c) => `[Halaman ${c.pageNumber}]\n${c.text}`)
        .join('\n\n---\n\n');

    const systemPrompt = `Kamu adalah asisten akademik yang membantu mahasiswa memahami jurnal dan paper penelitian.
  
Aturan:
- Jawab HANYA berdasarkan konteks yang diberikan
- Sebutkan nomor halaman jika relevan
- Gunakan Bahasa Indonesia yang jelas dan akademis
- Jika informasi tidak ada di konteks, katakan "Informasi tidak ditemukan dalam dokumen"
- Jangan mengarang informasi di luar konteks`;

    const userPrompt = `Konteks dari dokumen:

${contextText}

Pertanyaan: ${query}`;

    const answer = await generateWithSystemPrompt(
        systemPrompt,
        userPrompt,
        'llama-3.3-70b-versatile'
    );

    return {
        answer,
        sources: chunks.map((c) => ({
            text: c.text.slice(0, 200) + '...',
            pageNumber: c.pageNumber,
            score: c.score.toFixed(3),
        })),
    };
}