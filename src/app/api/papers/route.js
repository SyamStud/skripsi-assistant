import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('papers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ papers: data || [] });
    } catch (error) {
        console.error('Error fetching papers:', error);
        return NextResponse.json({ papers: [] });
    }
}
