import { NextResponse } from 'next/server';
import { retrieveAndAnswer } from '@/lib/rag';

export async function POST(request) {
    try {
        const { query, sessionId, contextPaperIds } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Query diperlukan' },
                { status: 400 }
            );
        }

        const documentIds = contextPaperIds || [];
        const result = await retrieveAndAnswer(query, 'default', documentIds);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal memproses pertanyaan' },
            { status: 500 }
        );
    }
}
