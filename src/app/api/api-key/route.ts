import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { randomBytes } from 'crypto';
// import { sendApiKeyEmail } from '@/lib/email'; // Commented out - API key is now displayed directly in UI
export async function GET() {
    try {
        // Get authenticated user - use getUser() for security
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user?.id) {
            return NextResponse.json(
                { success: false, error: 'Authentication required', message: 'You must be logged in to view your API key' },
                { status: 401 }
            );
        }

        const authUserId = user.id;
        const serviceSupabase = createServiceClient();

        // Get existing API key
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser, error: queryError } = await (serviceSupabase as any)
            .from('keys')
            .select('api_key, is_active')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        if (queryError && queryError.code !== 'PGRST116') {
            throw queryError;
        }

        if (!existingUser || !existingUser.api_key) {
            return NextResponse.json({
                success: true,
                hasKey: false,
                data: null
            });
        }

        return NextResponse.json({
            success: true,
            hasKey: true,
            data: {
                api_key: existingUser.api_key,
                is_active: existingUser.is_active
            }
        });

    } catch (error) {
        console.error('Error in GET /api/api-key:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                message: 'Unable to fetch API key. Please try again later.'
            },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        // Get authenticated user - use getUser() for security
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user?.id || !user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required', message: 'You must be logged in to generate an API key' },
                { status: 401 }
            );
        }

        const authUserId = user.id;
        const email = user.email; // For sending email only
        const serviceSupabase = createServiceClient();

        // Verificar si el usuario ya existe usando auth_user_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser, error: queryError } = await (serviceSupabase as any)
            .from('keys')
            .select('id, api_key, is_active, auth_user_id')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        // Si hay un error de query (no es que no encontró, sino un error real)
        if (queryError && queryError.code !== 'PGRST116') {
            throw queryError;
        }

        let userId: number;

        // Generar nueva API key
        const apiKey = `sk_${randomBytes(32).toString('hex')}`;

        if (existingUser) {
            // Usuario existe, actualizar API key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: updatedUser, error: updateError } = await (serviceSupabase as any)
                .from('keys')
                .update({
                    api_key: apiKey,
                    is_active: true
                })
                .eq('auth_user_id', authUserId)
                .select('id')
                .single();

            if (updateError) {
                throw updateError;
            }

            if (!updatedUser) {
                throw new Error('Failed to update API key');
            }

            userId = updatedUser.id;
        } else {
            // Usuario nuevo, crear usando auth_user_id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: newUser, error: insertError } = await (serviceSupabase as any)
                .from('keys')
                .insert({
                    auth_user_id: authUserId,
                    api_key: apiKey,
                    is_active: true
                })
                .select('id')
                .single();

            if (insertError) {
                throw insertError;
            }

            if (!newUser) {
                throw new Error('Failed to create user');
            }

            userId = newUser.id;
        }

        // Email sending commented out - API key is now displayed directly in the UI
        // try {
        //     await sendApiKeyEmail({
        //         email,
        //         apiKey,
        //         language: detectedLanguage
        //     });
        // } catch (emailError) {
        //     console.error('Error sending email, but API key was generated:', emailError);
        // }

        return NextResponse.json({
            success: true,
            message: 'API key generated successfully.',
            data: {
                user_id: userId,
                email,
                api_key: apiKey // Always return the API key
            }
        });

    } catch (error) {
        console.error('Error in POST /api/api-key:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                message: 'Unable to generate API key. Please try again later.'
            },
            { status: 500 }
        );
    }
}

