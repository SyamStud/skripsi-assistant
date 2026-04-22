import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// In-memory IP tracking (persists across requests within same server process)
// For production, use Redis or a database table instead.
const registeredIPs = new Map();

export async function POST(request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

        // Check if IP already registered (demo mode)
        if (process.env.NEXT_PUBLIC_IS_DEMO === 'true' && ip !== 'unknown') {
            if (registeredIPs.has(ip)) {
                return NextResponse.json(
                    { error: 'Perangkat ini sudah pernah mendaftar. Hanya 1 akun per perangkat yang diizinkan dalam mode demo.' },
                    { status: 429 }
                );
            }
        }

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Create user via Supabase Admin (bypasses email confirmation)
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: { role: 'user', registered_ip: ip }
        });

        if (error) {
            // Check for duplicate
            if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
                return NextResponse.json(
                    { error: 'Email sudah terdaftar. Silakan login.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        // Track the IP after successful registration
        if (process.env.NEXT_PUBLIC_IS_DEMO === 'true' && ip !== 'unknown') {
            registeredIPs.set(ip, { email, registeredAt: new Date().toISOString() });
        }

        return NextResponse.json({
            success: true,
            message: 'Pendaftaran berhasil! Silakan login.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal mendaftarkan akun' },
            { status: 500 }
        );
    }
}
