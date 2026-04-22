import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth || !auth.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // List all users
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
        if (error) throw error;

        // Get per-user counts
        const enrichedUsers = [];
        for (const user of users) {
            const { count: paperCount } = await supabaseAdmin
                .from('papers')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: chatCount } = await supabaseAdmin
                .from('chat_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            enrichedUsers.push({
                id: user.id,
                email: user.email,
                role: user.user_metadata?.role || 'user',
                created_at: user.created_at,
                paperCount: paperCount || 0,
                chatCount: chatCount || 0,
            });
        }

        return NextResponse.json({ users: enrichedUsers });
    } catch (error) {
        console.error('Admin list error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth || !auth.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, role } = await request.json();

        if (!userId || !['admin', 'user'].includes(role)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role }
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin update error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth || !auth.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Don't allow deleting yourself
        if (userId === auth.user.id) {
            return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
        }

        // Delete user's papers chunks first
        const { data: papers } = await supabaseAdmin
            .from('papers')
            .select('id')
            .eq('user_id', userId);

        if (papers) {
            for (const paper of papers) {
                await supabaseAdmin.from('documents_chunks').delete().eq('document_id', paper.id);
            }
        }

        // Delete user's papers
        await supabaseAdmin.from('papers').delete().eq('user_id', userId);

        // Delete user's chats
        await supabaseAdmin.from('chat_sessions').delete().eq('user_id', userId);

        // Delete user account
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
