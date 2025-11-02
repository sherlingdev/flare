import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Service client for privileged operations (bypasses RLS)
 * 
 * ⚠️ WARNING: This client uses the service role key and bypasses Row Level Security.
 * Use this ONLY in API routes that require admin privileges:
 * - Updating rates from GitHub Actions
 * - Bulk operations
 * - Admin operations
 * 
 * NEVER expose this client to the browser or client-side code.
 */
export function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            'Missing Supabase service role key. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local'
        );
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
