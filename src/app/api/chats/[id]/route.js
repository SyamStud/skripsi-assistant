import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser, sanitizeInput } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: chat } = await supabaseAdmin
            .from('chat_sessions')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!chat || (chat.user_id !== auth.user.id && !auth.isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates = await request.json();

        // Prevent arbitrary column updates - whitelist only safe fields
        const safeUpdates = { updated_at: new Date().toISOString() };
        if (updates.messages !== undefined) safeUpdates.messages = updates.messages;
        if (updates.context_paper_ids !== undefined) safeUpdates.context_paper_ids = updates.context_paper_ids;
        if (updates.title !== undefined) safeUpdates.title = sanitizeInput(updates.title, 200);

        const { error } = await supabaseAdmin
            .from('chat_sessions')
            .update(safeUpdates)
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating chat:', error);
        return NextResponse.json({ error: 'Gagal update chat' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: chat } = await supabaseAdmin
            .from('chat_sessions')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!chat || (chat.user_id !== auth.user.id && !auth.isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabaseAdmin.from('chat_sessions').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Gagal hapus chat' }, { status: 500 });
    }
}
