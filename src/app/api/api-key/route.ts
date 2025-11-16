import { NextResponse } from 'next/server';
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
        const { email, language } = body;

        // Detectar idioma del body o del header
        const detectedLanguage: Language = language || detectLanguage(request);

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required', message: 'Invalid request' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Verificar si el usuario ya existe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingUser } = await (supabase as any)
            .from('users')
            .select('id, email, api_key, is_active')
            .eq('email', email)
            .single();

        let apiKey: string;
        let userId: number;

        if (existingUser) {
            // Usuario existe, regenerar API key
            apiKey = `sk_${randomBytes(32).toString('hex')}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabase as any)
                .from('users')
                .update({
                    api_key: apiKey,
                    is_active: true
                })
                .eq('id', existingUser.id);

            if (updateError) {
                throw updateError;
            }

            userId = existingUser.id;
        } else {
            // Usuario nuevo, crear
            apiKey = `sk_${randomBytes(32).toString('hex')}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: newUser, error: insertError } = await (supabase as any)
                .from('users')
                .insert({
                    email,
                    api_key: apiKey,
                    is_active: true
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
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

