import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, validateApiKey, getClientIP } from '@/lib/rateLimiter';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Only process API routes
    if (!pathname.startsWith('/api/') || pathname.includes('/test-')) {
        return NextResponse.next();
    }

    // Allowlist routes that shouldn't be rate limited (internal use only)
    const rateLimitBypass = ['/api/payload', '/api/information/payload', '/api/historical'];
    if (rateLimitBypass.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow GET requests to /api/api-key without rate limit (read-only operation)
    // POST requests to /api/api-key will still be rate limited
    if (pathname === '/api/api-key' && request.method === 'GET') {
        return NextResponse.next();
    }

    // Get identifier
    const ip = getClientIP(request.headers);
    const apiKey = request.headers.get('x-api-key') ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    const isAuthenticated = apiKey ? !!(await validateApiKey(apiKey)) : false;
    const identifier = isAuthenticated && apiKey
        ? `api_${apiKey.substring(0, 16)}`
        : ip;

    // Check rate limit
    const rateLimit = await checkRateLimit(identifier, isAuthenticated);

    // Create response
    const response = rateLimit.allowed
        ? NextResponse.next()
        : NextResponse.json(
            {
                success: false,
                error: 'Rate limit exceeded',
                message: isAuthenticated
                    ? `You have reached the rate limit of ${rateLimit.limit} request${rateLimit.limit > 1 ? 's' : ''} per minute. Please try again later.`
                    : `You have exceeded the rate limit of ${rateLimit.limit} request${rateLimit.limit > 1 ? 's' : ''} per minute. Get an API key for higher limits.`,
                rateLimit: {
                    limit: rateLimit.limit,
                    remaining: rateLimit.remaining,
                    reset: new Date(rateLimit.reset).toISOString()
                },
                ...(isAuthenticated ? {} : { getApiKey: 'https://flarexrate.com/key' })
            },
            { status: 429 }
        );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());

    if (!rateLimit.allowed) {
        response.headers.set('Retry-After',
            Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
        );
    }

    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};
