import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser, isDemoMode, getQuotaLimits, sanitizeInput } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ sessions: data || [] });
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ sessions: [] });
    }
}

export async function POST(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }



        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // handle empty body gracefully
        }

        const title = sanitizeInput(body.title || 'Chat Baru', 200);
        const context_paper_ids = body.context_paper_ids || [];

        const { data, error } = await supabaseAdmin
            .from('chat_sessions')
            .insert({ title, context_paper_ids, user_id: auth.user.id })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session: data });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: error.message || 'Gagal membuat chat baru' }, { status: 500 });
    }
}
