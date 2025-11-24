import { Resend } from 'resend';
import { type SupportedLocale } from '@/lib/translations';

// Lazy initialization - only create Resend instance when actually needed
function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
    return new Resend(apiKey);
}

type Language = SupportedLocale;

interface SendApiKeyEmailParams {
    email: string;
    apiKey: string;
    language?: Language;
}

const emailCopy: Record<Language, {
    subject: string;
    generated: string;
    apiKeyLabel: string;
    importantLabel: string;
    importantBody: string;
    usage: string;
    button: string;
    footer: string;
    viewDocs: string;
}> = {
    en: {
        subject: 'Flare Exchange Rate | API Key',
        generated: 'The Flare Exchange Rate API key has been generated successfully.',
        apiKeyLabel: 'API Key:',
        importantLabel: 'Important:',
        importantBody: 'Please save this API key securely. This key will only be shown once and cannot be retrieved later. If you lose this key, you can regenerate a new one using the email address.',
        usage: 'To use the API key, include it in the request headers:',
        button: 'View API Documentation',
        footer: 'Flare Exchange Rate | Convert currencies instantly. Quick, safe, and always accurate.',
        viewDocs: 'View API Documentation: https://flarexrate.com/documentation'
    },
    es: {
        subject: 'Flare Exchange Rate | Clave API',
        generated: 'La clave API de Flare Exchange Rate ha sido generada exitosamente.',
        apiKeyLabel: 'Clave API:',
        importantLabel: 'Importante:',
        importantBody: 'Por favor, guarda esta clave API de forma segura. Esta clave solo se mostrará una vez y no se puede recuperar más tarde. Si pierdes esta clave, puedes regenerar una nueva usando la dirección de correo electrónico.',
        usage: 'Para usar la clave API, inclúyela en los encabezados de la solicitud:',
        button: 'Ver Documentación de la API',
        footer: 'Flare Exchange Rate | Convierte monedas al instante. Rápido, seguro y siempre preciso.',
        viewDocs: 'Ver Documentación de la API: https://flarexrate.com/documentation'
    },
    fr: {
        subject: 'Flare Exchange Rate | Clé API',
        generated: 'La clé API Flare Exchange Rate a été générée avec succès.',
        apiKeyLabel: 'Clé API:',
        importantLabel: 'Important:',
        importantBody: 'Veuillez sauvegarder cette clé API de manière sécurisée. Cette clé ne sera affichée qu\'une seule fois et ne pourra pas être récupérée plus tard. Si vous perdez cette clé, vous pouvez en régénérer une nouvelle en utilisant l\'adresse e-mail.',
        usage: 'Pour utiliser la clé API, incluez-la dans les en-têtes de la requête:',
        button: 'Voir la Documentation de l\'API',
        footer: 'Flare Exchange Rate | Convertissez les devises instantanément. Rapide, sûr et toujours précis.',
        viewDocs: 'Voir la Documentation de l\'API: https://flarexrate.com/documentation'
    },
    pt: {
        subject: 'Flare Exchange Rate | Chave API',
        generated: 'A chave API do Flare Exchange Rate foi gerada com sucesso.',
        apiKeyLabel: 'Chave API:',
        importantLabel: 'Importante:',
        importantBody: 'Por favor, salve esta chave API com segurança. Esta chave será exibida apenas uma vez e não pode ser recuperada mais tarde. Se você perder esta chave, pode regenerar uma nova usando o endereço de e-mail.',
        usage: 'Para usar a chave API, inclua-a nos cabeçalhos da solicitação:',
        button: 'Ver Documentação da API',
        footer: 'Flare Exchange Rate | Converta moedas instantaneamente. Rápido, seguro e sempre preciso.',
        viewDocs: 'Ver Documentação da API: https://flarexrate.com/documentation'
    },
    de: {
        subject: 'Flare Exchange Rate | API-Schlüssel',
        generated: 'Der API-Schlüssel von Flare Exchange Rate wurde erfolgreich erstellt.',
        apiKeyLabel: 'API-Schlüssel:',
        importantLabel: 'Wichtig:',
        importantBody: 'Bitte bewahren Sie diesen API-Schlüssel sicher auf. Dieser Schlüssel wird nur einmal angezeigt und kann später nicht erneut abgerufen werden. Wenn Sie ihn verlieren, können Sie mit derselben E-Mail-Adresse einen neuen Schlüssel generieren.',
        usage: 'Um den API-Schlüssel zu verwenden, fügen Sie ihn in die Anfrage-Header ein:',
        button: 'API-Dokumentation anzeigen',
        footer: 'Flare Exchange Rate | Währungen sofort umrechnen. Schnell, sicher und immer präzise.',
        viewDocs: 'API-Dokumentation anzeigen: https://flarexrate.com/documentation'
    },
    zh: {
        subject: 'Flare Exchange Rate | API 密钥',
        generated: 'Flare Exchange Rate 的 API 密钥已成功生成。',
        apiKeyLabel: 'API 密钥：',
        importantLabel: '重要：',
        importantBody: '请妥善保管此 API 密钥。该密钥仅显示一次，之后无法再次获取。如果丢失，可以使用相同的邮箱重新生成新的密钥。',
        usage: '要使用此 API 密钥，请将其加入请求头：',
        button: '查看 API 文档',
        footer: 'Flare Exchange Rate | 即时货币转换。快速、安全、始终准确。',
        viewDocs: '查看 API 文档：https://flarexrate.com/documentation'
    },
    it: {
        subject: 'Flare Exchange Rate | Chiave API',
        generated: 'La chiave API di Flare Exchange Rate è stata generata con successo.',
        apiKeyLabel: 'Chiave API:',
        importantLabel: 'Importante:',
        importantBody: 'Si prega di salvare questa chiave API in modo sicuro. Questa chiave verrà mostrata solo una volta e non potrà essere recuperata in seguito. Se perdi questa chiave, puoi rigenerarne una nuova utilizzando l\'indirizzo email.',
        usage: 'Per utilizzare la chiave API, includila negli header della richiesta:',
        button: 'Visualizza Documentazione API',
        footer: 'Flare Exchange Rate | Converti valute all\'istante. Veloce, sicuro e sempre preciso.',
        viewDocs: 'Visualizza Documentazione API: https://flarexrate.com/documentation'
    }
};

export async function sendApiKeyEmail({ email, apiKey, language = 'en' }: SendApiKeyEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM || 'api@flarexrate.com';

    const copy = emailCopy[language] ?? emailCopy.en;
    const emailSubject = copy.subject;

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
                <p>${copy.generated}</p>
                
                <p><strong>${copy.apiKeyLabel}</strong></p>
                
                <div class="api-key-box">
                    ${apiKey}
                </div>
                
                <div class="warning">
                    <p class="warning-text">
                        <strong>${copy.importantLabel}</strong><br>
                        ${copy.importantBody}
                    </p>
                </div>
                
                <p><strong>${copy.usage}</strong></p>
                
                <div class="api-key-box" style="text-align: left; font-size: 14px;">
                    <code style="color: #ffffff; display: block; margin-bottom: 10px;">Header: X-API-Key: ${apiKey}</code>
                    <code style="color: #ffffff;">Authorization: Bearer: ${apiKey}</code>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://flarexrate.com/documentation" class="button" style="color: #ffffff; text-decoration: none;">
                        ${copy.button}
                    </a>
                </p>
            </div>
            <div class="footer">
                <p>${copy.footer}</p>
                <p><a href="https://flarexrate.com" style="color: #4F46E5;">flarexrate.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const emailText = `
${emailSubject}

${copy.generated}

${copy.apiKeyLabel}

${apiKey}

${copy.importantLabel} ${copy.importantBody}

${copy.usage}

Header: X-API-Key: ${apiKey}
Authorization: Bearer: ${apiKey}

${copy.viewDocs}

---
${copy.footer}
https://flarexrate.com
    `;

    try {
        const resend = getResend();
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

