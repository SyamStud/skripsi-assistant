import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser, sanitizeInput } from '@/lib/auth';

export async function DELETE(request, { params }) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: paper } = await supabaseAdmin
            .from('papers')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!paper || (paper.user_id !== auth.user.id && !auth.isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await supabaseAdmin
            .from('documents_chunks')
            .delete()
            .eq('document_id', id);

        const { error } = await supabaseAdmin
            .from('papers')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting paper:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus paper' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: paper } = await supabaseAdmin
            .from('papers')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!paper || (paper.user_id !== auth.user.id && !auth.isAdmin)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates = await request.json();

        // Only allow title update, sanitize it
        const safeUpdates = {};
        if (updates.title !== undefined) {
            safeUpdates.title = sanitizeInput(updates.title, 200);
        }

        const { data, error } = await supabaseAdmin
            .from('papers')
            .update(safeUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, paper: data });
    } catch (error) {
        console.error('Error updating paper:', error);
        return NextResponse.json(
            { error: 'Gagal memperbarui paper' },
            { status: 500 }
        );
    }
}
