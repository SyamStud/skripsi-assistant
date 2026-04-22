import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();
        
        // Prevent arbitrary column updates
        const safeUpdates = { updated_at: new Date().toISOString() };
        if (updates.messages !== undefined) safeUpdates.messages = updates.messages;
        if (updates.context_paper_ids !== undefined) safeUpdates.context_paper_ids = updates.context_paper_ids;
        if (updates.title !== undefined) safeUpdates.title = updates.title;

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
        const { id } = await params;
        const { error } = await supabaseAdmin.from('chat_sessions').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Gagal hapus chat' }, { status: 500 });
    }
}
