import { supabaseAdmin } from './supabase';

/**
 * Extract and verify user from Authorization Bearer token.
 * Returns { user, isAdmin } or null if invalid.
 */
export async function getAuthUser(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return null;

        const isAdmin = user.user_metadata?.role === 'admin';
        return { user, isAdmin };
    } catch {
        return null;
    }
}

/**
 * Check if environment is in demo mode
 */
export function isDemoMode() {
    return process.env.NEXT_PUBLIC_IS_DEMO === 'true';
}

/**
 * Get quota limits from env
 */
export function getQuotaLimits() {
    return {
        maxUploads: parseInt(process.env.MAX_UPLOADS_PER_USER || '1', 10),
        maxMessages: parseInt(process.env.MAX_MESSAGES_PER_USER || '10', 10),
    };
}

/**
 * Sanitize user input to prevent XSS and prompt injection.
 * Strips HTML tags, limits length, and removes dangerous patterns.
 */
export function sanitizeInput(input, maxLength = 5000) {
    if (typeof input !== 'string') return '';

    let sanitized = input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove script-like patterns
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        // Remove null bytes
        .replace(/\0/g, '');

    // Trim to max length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.slice(0, maxLength);
    }

    return sanitized.trim();
}
