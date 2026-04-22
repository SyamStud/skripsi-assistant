import { NextResponse } from 'next/server';
import { retrieveAndAnswer } from '@/lib/rag';
import { getAuthUser, sanitizeInput, isDemoMode, getQuotaLimits } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, contextPaperIds } = body;

        // Sanitize user query - limit length, strip dangerous patterns
        const query = sanitizeInput(body.query, 2000);

        if (!query) {
            return NextResponse.json(
                { error: 'Query diperlukan' },
                { status: 400 }
            );
        }

        // Verify chat ownership
        if (sessionId) {
            const { data: chat } = await supabaseAdmin
                .from('chat_sessions')
                .select('user_id')
                .eq('id', sessionId)
                .single();

            if (!chat || (chat.user_id !== auth.user.id && !auth.isAdmin)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Demo mode: count total messages sent by user across all chats
        if (isDemoMode() && !auth.isAdmin) {
            const { maxMessages } = getQuotaLimits();
            const { data: sessions } = await supabaseAdmin
                .from('chat_sessions')
                .select('messages')
                .eq('user_id', auth.user.id);
            
            let totalUserMessages = 0;
            if (sessions) {
                totalUserMessages = sessions.reduce((acc, session) => {
                    return acc + (session.messages || []).filter(m => m.role === 'user').length;
                }, 0);
            }

            if (totalUserMessages >= maxMessages) {
                return NextResponse.json(
                    { error: `Batas prompt tercapai (${maxMessages} prompt dalam mode free).` },
                    { status: 429 }
                );
            }
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
