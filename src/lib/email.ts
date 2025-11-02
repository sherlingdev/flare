import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type Language = 'en' | 'es' | 'fr' | 'pt';

interface SendApiKeyEmailParams {
    email: string;
    apiKey: string;
    language?: Language;
}

export async function sendApiKeyEmail({ email, apiKey, language = 'en' }: SendApiKeyEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM || 'api@flarexrate.com';

    const emailSubject = language === 'en'
        ? 'Flare Exchange Rate | API Key'
        : language === 'es'
            ? 'Flare Exchange Rate | Clave API'
            : language === 'fr'
                ? 'Flare Exchange Rate | Clé API'
                : 'Flare Exchange Rate | Chave API';

    const emailHtml = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailSubject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .api-key-box {
            background-color: #1f2937;
            color: #ffffff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-text {
            color: #92400e;
            margin: 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div style="padding: 40px 20px;">
        <div class="container">
            <div class="header">
                <h1>${emailSubject}</h1>
            </div>
            <div class="content">
                <p>${language === 'en'
            ? 'The Flare Exchange Rate API key has been generated successfully.'
            : language === 'es'
                ? 'La clave API de Flare Exchange Rate ha sido generada exitosamente.'
                : language === 'fr'
                    ? 'La clé API Flare Exchange Rate a été générée avec succès.'
                    : 'A chave API do Flare Exchange Rate foi gerada com sucesso.'}</p>
                
                <p><strong>${language === 'en'
            ? 'API Key:'
            : language === 'es'
                ? 'Clave API:'
                : language === 'fr'
                    ? 'Clé API:'
                    : 'Chave API:'}</strong></p>
                
                <div class="api-key-box">
                    ${apiKey}
                </div>
                
                <div class="warning">
                    <p class="warning-text">
                        <strong>${language === 'en'
            ? 'Important:'
            : language === 'es'
                ? 'Importante:'
                : language === 'fr'
                    ? 'Important:'
                    : 'Importante:'}</strong><br>
                        ${language === 'en'
            ? 'Please save this API key securely. This key will only be shown once and cannot be retrieved later. If you lose this key, you can regenerate a new one using the email address.'
            : language === 'es'
                ? 'Por favor, guarda esta clave API de forma segura. Esta clave solo se mostrará una vez y no se puede recuperar más tarde. Si pierdes esta clave, puedes regenerar una nueva usando la dirección de correo electrónico.'
                : language === 'fr'
                    ? 'Veuillez sauvegarder cette clé API de manière sécurisée. Cette clé ne sera affichée qu\'une seule fois et ne pourra pas être récupérée plus tard. Si vous perdez cette clé, vous pouvez en régénérer une nouvelle en utilisant l\'adresse e-mail.'
                    : 'Por favor, salve esta chave API com segurança. Esta chave será exibida apenas uma vez e não pode ser recuperada mais tarde. Se você perder esta chave, pode regenerar uma nova usando o endereço de e-mail.'}
                    </p>
                </div>
                
                <p><strong>${language === 'en'
            ? 'To use the API key, include it in the request headers:'
            : language === 'es'
                ? 'Para usar la clave API, inclúyela en los encabezados de la solicitud:'
                : language === 'fr'
                    ? 'Pour utiliser la clé API, incluez-la dans les en-têtes de la requête:'
                    : 'Para usar a chave API, inclua-a nos cabeçalhos da solicitação:'}</strong></p>
                
                <div class="api-key-box" style="text-align: left; font-size: 14px;">
                    <code style="color: #ffffff; display: block; margin-bottom: 10px;">Header: X-API-Key: ${apiKey}</code>
                    <code style="color: #ffffff;">Authorization: Bearer: ${apiKey}</code>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://flarexrate.com/documentation" class="button" style="color: #ffffff; text-decoration: none;">
                        ${language === 'en'
            ? 'View API Documentation'
            : language === 'es'
                ? 'Ver Documentación de la API'
                : language === 'fr'
                    ? 'Voir la Documentation de l\'API'
                    : 'Ver Documentação da API'}
                    </a>
                </p>
            </div>
            <div class="footer">
                <p>${language === 'en'
            ? 'Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.'
            : language === 'es'
                ? 'Flare Exchange Rate | Convierte monedas al instante. Rápido, seguro y siempre preciso.'
                : language === 'fr'
                    ? 'Flare Exchange Rate | Convertissez les devises instantanément. Rapide, sûr et toujours précis.'
                    : 'Flare Exchange Rate | Converta moedas instantaneamente. Rápido, seguro e sempre preciso.'}</p>
                <p><a href="https://flarexrate.com" style="color: #4F46E5;">flarexrate.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const emailText = `
${emailSubject}

${language === 'en'
            ? 'The Flare Exchange Rate API key has been generated successfully.'
            : language === 'es'
                ? 'La clave API de Flare Exchange Rate ha sido generada exitosamente.'
                : language === 'fr'
                    ? 'La clé API Flare Exchange Rate a été générée avec succès.'
                    : 'A chave API do Flare Exchange Rate foi gerada com sucesso.'}

${language === 'en'
            ? 'API Key:'
            : language === 'es'
                ? 'Clave API:'
                : language === 'fr'
                    ? 'Clé API:'
                    : 'Chave API:'}

${apiKey}

${language === 'en'
            ? 'Important: Please save this API key securely. This key will only be shown once and cannot be retrieved later. If you lose this key, you can regenerate a new one using the email address.'
            : language === 'es'
                ? 'Importante: Por favor, guarda esta clave API de forma segura. Esta clave solo se mostrará una vez y no se puede recuperar más tarde. Si pierdes esta clave, puedes regenerar una nueva usando la dirección de correo electrónico.'
                : language === 'fr'
                    ? 'Important: Veuillez sauvegarder cette clé API de manière sécurisée. Cette clé ne sera affichée qu\'une seule fois et ne pourra pas être récupérée plus tard. Si vous perdez cette clé, vous pouvez en régénérer une nouvelle en utilisant l\'adresse e-mail.'
                    : 'Importante: Por favor, salve esta chave API com segurança. Esta chave será exibida apenas uma vez e não pode ser recuperada mais tarde. Se você perder esta chave, pode regenerar uma nova usando o endereço de e-mail.'}

${language === 'en'
            ? 'To use the API key, include it in the request headers:'
            : language === 'es'
                ? 'Para usar la clave API, inclúyela en los encabezados de la solicitud:'
                : language === 'fr'
                    ? 'Pour utiliser la clé API, incluez-la dans les en-têtes de la requête:'
                    : 'Para usar a chave API, inclua-a nos cabeçalhos da solicitação:'}

Header: X-API-Key: ${apiKey}
Authorization: Bearer: ${apiKey}

${language === 'en'
            ? 'View API Documentation: https://flarexrate.com/documentation'
            : language === 'es'
                ? 'Ver Documentación de la API: https://flarexrate.com/documentation'
                : language === 'fr'
                    ? 'Voir la Documentation de l\'API: https://flarexrate.com/documentation'
                    : 'Ver Documentação da API: https://flarexrate.com/documentation'}

---
Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.
https://flarexrate.com
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in sendApiKeyEmail:', error);
        throw error;
    }
}

