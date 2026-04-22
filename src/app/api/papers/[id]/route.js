import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

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
        const { id } = await params;
        const updates = await request.json();

        const { data, error } = await supabaseAdmin
            .from('papers')
            .update(updates)
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
