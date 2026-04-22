import pdf from 'pdf-parse';
import fs from 'fs';
import { generateWithGroq, generateWithSystemPrompt } from './groq';

export async function extractPDFText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return {
        text: data.text,
        pageCount: data.numpages,
    };
}

export function chunkText(text, chunkSize = 1000, overlap = 100) {
    const chunks = [];
    let chunkIndex = 0;

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize);
        if (chunk.trim().length > 0) {
            chunks.push({
                text: chunk.trim(),
                pageNumber: Math.ceil((i + chunkSize) / 3000),
                chunkIndex,
            });
            chunkIndex++;
        }
    }

    return chunks;
}

export async function generateSummary(text) {
    const prompt = `Buat ringkasan akademik dari paper berikut dalam 3 paragraf (Bahasa Indonesia):

${text.slice(0, 8000)}

Ringkasan harus mencakup:
1. Tujuan dan latar belakang penelitian
2. Metodologi yang digunakan
3. Hasil dan kesimpulan utama`;

    return await generateWithGroq(prompt, 'llama-3.3-70b-versatile');
}

export async function extractMetadata(text) {
    const prompt = `Ekstrak metadata dari paper berikut. Return ONLY valid JSON tanpa markdown:

${text.slice(0, 2000)}

Format JSON:
{
  "title": "judul paper",
  "authors": "nama author",
  "year": 2024,
  "keywords": ["keyword1", "keyword2"]
}`;

    try {
        const result = await generateWithGroq(prompt, 'llama-3.1-8b-instant');
        const clean = result.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
    } catch {
        return {};
    }
}