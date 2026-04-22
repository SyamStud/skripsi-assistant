import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('papers')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ papers: data || [] });
    } catch (error) {
        console.error('Error fetching papers:', error);
        return NextResponse.json({ papers: [] });
    }
}
