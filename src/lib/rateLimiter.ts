import { createServiceClient } from '@/utils/supabase/service';

const RATE_LIMITS = {
    anonymous: { requests: 1, window: 60 },
    authenticated: { requests: 60, window: 60 },
} as const;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number;
    limit: number;
}

export async function checkRateLimit(
    identifier: string,
    isAuthenticated: boolean
): Promise<RateLimitResult> {
    const supabase = createServiceClient();
    const limit = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous;
    const now = Date.now();
    const windowStart = now - (limit.window * 1000);

    // Get existing requests in time window (including timestamp to calculate real reset time)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentRequests, error: queryError } = await (supabase as any)
        .from('rate_limits')
        .select('id, timestamp')
        .eq('identifier', identifier)
        .eq('is_authenticated', isAuthenticated)
        .gte('timestamp', windowStart)
        .order('timestamp', { ascending: true });

    if (queryError) {
        const isDev = process.env.NODE_ENV === 'development';
        if (isDev) console.error('[Rate Limit] Query error:', queryError);
        return {
            allowed: !isDev,
            remaining: 0,
            reset: now + (limit.window * 1000),
            limit: limit.requests,
        };
    }

    const requestCount = recentRequests?.length || 0;
    const allowed = requestCount < limit.requests;

    // Calculate real reset time based on the first request in the window
    // If there are requests, reset = firstRequestTimestamp + window
    // Otherwise, reset = now + window
    let resetTime: number;
    if (requestCount > 0 && recentRequests && recentRequests.length > 0) {
        const firstRequestTimestamp = recentRequests[0].timestamp;
        resetTime = firstRequestTimestamp + (limit.window * 1000);
    } else {
        resetTime = now + (limit.window * 1000);
    }

    // Insert record if allowed
    if (allowed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
            .from('rate_limits')
            .insert({
                identifier,
                timestamp: now,
                is_authenticated: isAuthenticated,
            });

        if (insertError && process.env.NODE_ENV === 'development') {
            console.error('[Rate Limit] Insert error:', insertError);
        }
    }

    return {
        allowed,
        remaining: Math.max(0, limit.requests - requestCount - 1),
        reset: resetTime,
        limit: limit.requests,
    };
}

export async function validateApiKey(apiKey: string): Promise<{ id: number; auth_user_id: string; is_active: boolean } | null> {
    if (!apiKey?.startsWith('sk_')) return null;

    try {
        const supabase = createServiceClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user, error } = await (supabase as any)
            .from('keys')
            .select('id, auth_user_id, is_active')
            .eq('api_key', apiKey)
            .eq('is_active', true)
            .single();

        return (error || !user) ? null : {
            id: user.id,
            auth_user_id: user.auth_user_id,
            is_active: user.is_active,
        };
    } catch {
        return null;
    }
}

export function getClientIP(headers: Headers): string {
    const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip');

    // Normalize localhost addresses
    const localhostVariants = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
    return !ip || localhostVariants.includes(ip) ? 'localhost' : ip;
}
