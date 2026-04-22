import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSummary } from '@/lib/pdfProcessor';
import { searchSimilar } from '@/lib/vectorStore';

export async function POST(request) {
    try {
        const { paperId } = await request.json();

        if (!paperId) {
            return NextResponse.json(
                { error: 'paperId diperlukan' },
                { status: 400 }
            );
        }

        const { data: paper, error } = await supabaseAdmin
            .from('papers')
            .select('summary')
            .eq('id', paperId)
            .single();

        if (error) throw error;

        if (paper.summary) {
            return NextResponse.json({ summary: paper.summary });
        }

        const chunks = await searchSimilar('documents', '', paperId, 20);
        const fullText = chunks.map((c) => c.text).join('\n\n');
        const summary = await generateSummary(fullText);

        await supabaseAdmin
            .from('papers')
            .update({ summary })
            .eq('id', paperId);

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Summarize error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal membuat ringkasan' },
            { status: 500 }
        );
    }
}
