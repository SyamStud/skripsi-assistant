import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser, isDemoMode, getQuotaLimits } from '@/lib/auth';
import { extractPDFText, chunkText, extractMetadata, generateSummary } from '@/lib/pdfProcessor';
import { upsertChunks } from '@/lib/vectorStore';

export async function POST(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Quota check for demo mode (skip for admins)
        if (isDemoMode() && !auth.isAdmin) {
            const { maxUploads } = getQuotaLimits();
            const { count, error: countError } = await supabaseAdmin
                .from('papers')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', auth.user.id);

            if (!countError && count >= maxUploads) {
                return NextResponse.json(
                    { error: `Kuota upload habis. Maksimal ${maxUploads} file dalam mode demo.` },
                    { status: 429 }
                );
            }
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'File tidak ditemukan' },
                { status: 400 }
            );
        }

        if (!file.name.endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Hanya file PDF yang diterima' },
                { status: 400 }
            );
        }

        // Limit file size to 10MB
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        const buffer = Buffer.from(await file.arrayBuffer());
        if (buffer.length > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Ukuran file maksimal 10MB' },
                { status: 400 }
            );
        }

        const { text, pageCount } = await extractPDFText(buffer);

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Tidak dapat mengekstrak teks dari PDF' },
                { status: 400 }
            );
        }

        let metadata = {};
        try {
            metadata = await extractMetadata(text);
        } catch (e) {
            console.error('Metadata extraction failed:', e);
        }

        const { data: paper, error: insertError } = await supabaseAdmin
            .from('papers')
            .insert({
                title: metadata.title || file.name.replace('.pdf', ''),
                authors: metadata.authors || '',
                year: metadata.year || null,
                keywords: metadata.keywords || [],
                filename: file.name,
                status: 'processing',
                page_count: pageCount,
                user_id: auth.user.id,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        try {
            const chunks = chunkText(text);

            await upsertChunks('documents', paper.id, chunks);

            const summary = await generateSummary(text);

            await supabaseAdmin
                .from('papers')
                .update({ status: 'ready', summary })
                .eq('id', paper.id);

            return NextResponse.json({
                paper: { ...paper, status: 'ready', summary },
            });
        } catch (processError) {
            console.error('Processing error:', processError);

            await supabaseAdmin
                .from('papers')
                .update({ status: 'error' })
                .eq('id', paper.id);

            return NextResponse.json({
                paper: { ...paper, status: 'error' },
                warning: 'Paper diupload tapi proses embedding gagal',
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal mengupload file' },
            { status: 500 }
        );
    }
}
