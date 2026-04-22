import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser, isDemoMode, getQuotaLimits } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isDemo = isDemoMode();
        const { maxUploads, maxMessages } = getQuotaLimits();

        // Count user's papers
        const { count: paperCount } = await supabaseAdmin
            .from('papers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', auth.user.id);

        // Count user's messages
        const { data: sessions } = await supabaseAdmin
            .from('chat_sessions')
            .select('messages')
            .eq('user_id', auth.user.id);
            
        let messageCount = 0;
        if (sessions) {
            messageCount = sessions.reduce((acc, session) => {
                return acc + (session.messages || []).filter(m => m.role === 'user').length;
            }, 0);
        }

        return NextResponse.json({
            isDemo,
            isAdmin: auth.isAdmin,
            role: auth.user.user_metadata?.role || 'user',
            usage: {
                papers: paperCount || 0,
                messages: messageCount,
            },
            limits: auth.isAdmin ? null : {
                maxUploads,
                maxMessages,
            }
        });
    } catch (error) {
        console.error('Quota error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
