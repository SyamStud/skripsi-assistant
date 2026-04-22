import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ sessions: data || [] });
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ sessions: [] });
    }
}

export async function POST(req) {
    try {
        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            // handle empty body gracefully
        }
        
        const title = body.title || 'Chat Baru';
        const context_paper_ids = body.context_paper_ids || [];

        const { data, error } = await supabaseAdmin
            .from('chat_sessions')
            .insert({ title, context_paper_ids })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session: data });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: 'Gagal membuat chat baru' }, { status: 500 });
    }
}
