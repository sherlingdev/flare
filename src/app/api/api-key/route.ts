import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { randomBytes } from 'crypto';
import { sendApiKeyEmail } from '@/lib/email';
import { type SupportedLocale } from '@/lib/translations';

type Language = SupportedLocale;

function detectLanguage(request: Request): Language {
    // Intentar obtener el idioma del header Accept-Language
    const acceptLanguage = request.headers.get('accept-language') || '';

    if (acceptLanguage.includes('es')) return 'es';
    if (acceptLanguage.includes('fr')) return 'fr';
    if (acceptLanguage.includes('pt')) return 'pt';
    if (acceptLanguage.includes('de')) return 'de';
    if (acceptLanguage.includes('zh')) return 'zh';

    return 'en'; // Default
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { language } = body;

        // Detectar idioma del body o del header
        const detectedLanguage: Language = language || detectLanguage(request);

        // Get authenticated user from session
        const supabase = await createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.id || !session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required', message: 'You must be logged in to generate an API key' },
                { status: 401 }
            );
        }

        const authUserId = session.user.id;
        const email = session.user.email; // For sending email only
        const serviceSupabase = createServiceClient();

        // Verificar si el usuario ya existe usando auth_user_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser, error: queryError } = await (serviceSupabase as any)
            .from('users')
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
                .from('users')
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
                .from('users')
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

        // Enviar email con la API key
        try {
            await sendApiKeyEmail({
                email,
                apiKey,
                language: detectedLanguage
            });
        } catch (emailError) {
            // Log el error pero no fallar la respuesta si la API key se generó correctamente
            console.error('Error sending email, but API key was generated:', emailError);
            // Continuar - el usuario puede regenerar el API key si no recibió el email
        }

        return NextResponse.json({
            success: true,
            message: 'API key generated successfully. Check your email.',
            data: {
                user_id: userId,
                email,
                // En desarrollo, devolver la API key en la respuesta también
                ...(process.env.NODE_ENV === 'development' && { api_key: apiKey })
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

