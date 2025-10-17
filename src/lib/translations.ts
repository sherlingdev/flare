export const translations = {
    en: {
        // Main converter
        enterAmount: "How much?",
        fromCurrency: "From currency",
        toCurrency: "To currency",
        swap: "Swap currencies",
        login: "Login",
        loginButton: "Log In",

        // Site description
        siteDescription: "Convert USD, EUR, and DOP instantly. Quick, safe, and always accurate.",

        // Authentication
        register: "Register",
        registerButton: "Create account",
        loginSubtitle: "Sign in to your account",
        registerSubtitle: "Create a new account",
        fullName: "Full name",
        fullNamePlaceholder: "Enter your full name",
        email: "Email",
        emailPlaceholder: "Enter your email",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "Confirm your password",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        passwordRequirements: "Password Requirements:",
        passwordReq1: "At least 8 characters long",
        passwordReq2: "One uppercase letter",
        passwordReq3: "One lowercase letter",
        passwordReq4: "One number",
        passwordReq5: "One special character",

        // Loader
        loading: "Loading...",

        // Rate Display
        liveExchangeRates: "Live",
        lastUpdated: "Updated",

        // Currency Variations
        mainVariations: "Main Variations",
        oneDollarToPeso: "1 dollar to peso",
        oneEuroToPeso: "1 euro to peso",
        onePesoToDollar: "1 peso to dollar",
        onePesoToEuro: "1 peso to euro",
        basedOnCurrentRates: "Based on current rates",

        // API Guide
        apiGuideTitle: "API Usage Guide",
        apiGuideSubtitle: "Complete documentation for Flare Exchange Rate APIs",
        authentication: "Authentication",
        authenticationText: "All API endpoints require authentication except for public exchange rate data. Use the authentication endpoints to get an access token.",
        registerUser: "Register user",
        loginUser: "Login user",
        requestBody: "Request body",
        response: "Response",
        exchangeRateApis: "Exchange rate APIs",
        exchangeRateApisText: "Get real-time exchange rates from InfoDolar.com.do with multiple data options.",
        getExchangeRates: "Get exchange rates",
        getExchangeRatesDesc: "Retrieve the latest exchange rates. Data is cached and refreshed periodically.",
        convertCurrency: "Convert currency",
        convertCurrencyDesc: "Convert a specific amount from one currency to another using current exchange rates.",
        triggerManualScraper: "Trigger manual scraper",
        description: "Description",
        triggerManualScraperDesc: "Manually trigger the exchange rate scraper to get fresh data.",

        // API Guide specific content
        completeDataInfo: "Complete data & information",
        completeDataDesc: "Returns complete exchange rate data including USD, EUR details and global rates",
        onlyGlobalRates: "Only global rates",
        onlyGlobalRatesDesc: "Returns only the global cross-currency rates without detailed USD/EUR data",
        onlyUsdData: "Only USD data",
        onlyUsdDataDesc: "Returns only USD exchange rate data",
        onlyEurData: "Only EUR data",
        onlyEurDataDesc: "Returns only EUR exchange rate data",
        alternativeExchangeRate: "Alternative exchange rate source",
        alternativeExchangeRateDesc: "Get exchange rates from Banco Central de la República Dominicana as an alternative source",

        rateLimits: "Rate limits",
        unauthenticatedRequests: "Unauthenticated requests",
        rateLimitUnauth: "10 requests per minute",
        authenticatedRequests: "Authenticated requests",
        rateLimitAuth: "100 requests per minute",
        scraperRequests: "Scraper requests",
        rateLimitScraper: "1 request per minute",
        noRateLimiting: "No rate limiting currently applied",
        cachedForOneHour: "Cached for 1 hour",

        errorHandling: "Error handling",
        errorHandlingText: "All endpoints return standardized error responses with appropriate HTTP status codes.",
        errorResponseExample: "Error response example",
        sdkExamples: "SDK examples",
        needHelp: "Need help?",
        needHelpText: "If you have questions about our API or need assistance with integration, please contact us.",

        // Legal pages content
        aboutUs: "About us",
        privacyPolicy: "Privacy policy",
        termsOfService: "Terms and conditions",
        siteName: "Flare Exchange Rate",
        siteUrl: "flarexrate.com",

        // Terms and Conditions
        acceptanceOfTerms: "Acceptance of terms",
        acceptanceOfTermsText: "By accessing and using this currency converter, you accept and agree to follow the terms and provisions of this agreement. If you do not agree to follow these terms, please do not use this service.",

        descriptionOfService: "Description of service",
        descriptionOfServiceText: "This platform is a web-based application that provides real-time calculations between various international currencies. The service includes:",
        realTimeExchangeRates: "Real-time exchange rate information",
        calculationOperations: "Calculation operations",
        responsiveDesign: "Responsive design for various devices",

        useLicense: "Use license",
        useLicenseText: "Permission is granted to temporarily use this platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
        modifyOrCopy: "Modify or copy the materials",
        commercialUse: "Use the materials for any commercial purpose or for any public display",
        reverseEngineer: "Attempt to reverse engineer any software contained on the website",
        removeCopyright: "Remove any copyright or other proprietary notations from the materials",

        disclaimer: "Disclaimer",
        disclaimerText1: "The materials on this currency converter are provided without any warranties, expressed or implied, and hereby disclaims all other warranties including without limitation, implied warranties or conditions of merchantability, or non-infringement of intellectual property or other violation of rights.",
        disclaimerText2: "Exchange rates are provided for informational purposes only and should not be used for actual financial transactions without verification from a licensed financial institution.",

        limitations: "Limitations",
        limitationsText: "We are not liable for any damages arising out of the use or inability to use the materials on this website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.",

        accuracyOfMaterials: "Accuracy of materials",
        accuracyOfMaterialsText: "The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on this website are accurate, complete, or current. We may make changes to the materials contained on this website at any time without notice.",

        links: "Links",
        linksText: "We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.",

        modifications: "Modifications",
        modificationsText: "We may revise these terms of service for this website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.",

        governingLaw: "Governing law",
        governingLawText: "These terms and conditions are governed by and construed in accordance with the laws of the Dominican Republic and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.",

        userConduct: "User conduct",
        userConductText: "You agree to use this service only for lawful purposes and in accordance with these terms. You agree not to:",
        violateLaws: "Use this service in any way that violates applicable laws or regulations",
        unauthorizedAccess: "Attempt to gain unauthorized access to any part of this service",
        interfereService: "Interfere with or disrupt this service or servers connected to this service",
        automatedAccess: "Use any automated means to access this service without permission",

        // Privacy Policy
        informationWeCollect: "Information we collect",
        informationWeCollectText: "When you use this platform, we may collect the following information:",
        calculationRequests: "Calculation requests and amounts",
        ipAddress: "IP address and browser information for analytics",
        usagePatterns: "Usage patterns and preferences",
        deviceInformation: "Device information and operating system",

        howWeUse: "How we use your information",
        howWeUseText: "We use the collected information to:",
        provideCalculations: "Provide accurate calculations",
        improveApplication: "Improve our application performance and user experience",
        analyzeUsage: "Analyze usage patterns to enhance our services",
        displayAds: "Display relevant advertisements",

        googleAdsense: "Google AdSense and third-party services",
        googleAdsenseText: "Our website displays advertisements through third-party services. This service may:",
        useCookies: "Use cookies to serve ads based on your visits to our site and other sites on the Internet",
        collectBrowsing: "Collect information about your browsing habits",
        displayPersonalized: "Display personalized advertisements",
        useWebBeacons: "Use web beacons to gather information",
        optOutText: "You can opt out of personalized advertising through your browser settings.",

        cookiesTracking: "Cookies and tracking",
        cookiesTrackingText: "We use cookies and similar tracking technologies to:",
        rememberTheme: "Remember your theme preferences",
        rememberLanguage: "Remember your language preferences",
        provideAnalytics: "Provide analytics and improve our services",
        enableAdvertising: "Enable advertising functionality",
        controlCookiesText: "You can control cookies through your browser settings, but disabling cookies may affect the functionality of our site.",

        dataSecurity: "Data security",
        dataSecurityText: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission is completely secure.",

        dataRetention: "Data retention",
        dataRetentionText: "We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Analytics data may be retained for a reasonable period.",

        yourRights: "Your rights",
        yourRightsText: "You have the right to:",
        accessInformation: "Access your personal information",
        correctInformation: "Correct inaccurate information",
        requestDeletion: "Request deletion of your information",
        optOutProcessing: "Opt out of data processing for advertising purposes",
        withdrawConsent: "Withdraw consent at any time",

        childrenPrivacy: "Children's privacy",
        childrenPrivacyText: "Our service is not intended for young users. We do not knowingly collect personal information from them.",

        changesPrivacy: "Changes to this privacy policy",
        changesPrivacyText: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.",

        // About Us
        ourMission: "Our mission",
        ourMissionText: "We believe that calculations should be simple, accurate, and accessible to everyone our mission is to provide real-time exchange rate information and calculation services that help individuals and businesses make informed financial decisions we focus on the currencies that matter most to our users, ensuring that you always have access to the most current and accurate exchange rates",

        whatWeOffer: "What we offer",
        realTimeExchangeRatesTitle: "Real-time exchange rates",
        realTimeExchangeRatesText: "Our platform provides up-to-date exchange rates sourced from reliable financial data providers, ensuring accuracy for your calculation needs.",
        multiLanguageSupport: "Multi-language support",
        multiLanguageSupportText: "Available in multiple languages to serve our diverse user base, making calculations accessible to more people.",
        responsiveDesignTitle: "Responsive design",
        responsiveDesignText: "Optimized for all devices - desktop, tablet, and mobile - so you can convert currencies wherever you are.",
        darkModeSupport: "Dark mode support",
        darkModeSupportText: "Choose between light and dark themes for comfortable viewing in any lighting condition.",

        ourTechnology: "Our technology",
        ourTechnologyText: "This platform is built using modern web technologies to ensure fast, reliable performance:",
        nextjs: "Next.js: For fast, server-side rendered web applications",
        react: "React: For responsive, interactive user interfaces",
        typescript: "TypeScript: For type-safe, maintainable code",
        tailwind: "Tailwind CSS: For beautiful, responsive designs",
        realTimeApis: "Real-time APIs: For accurate, up-to-date exchange rates",

        privacySecurity: "Privacy and security",
        privacySecurityText: "We take your privacy seriously our calculations are performed locally in your browser, ensuring that your financial information never leaves your device unnecessarily we only collect minimal analytics data to improve our service, and we never store your conversion history or personal financial information on our servers",

        futurePlans: "Future plans",
        futurePlansText: "We're continuously working to improve this platform. Future updates may include:",
        additionalCurrencies: "Support for additional currencies",
        historicalCharts: "Historical exchange rate charts",
        currencyAlerts: "Currency alerts and notifications",
        mobileApp: "Mobile app versions",
        enhancedAnalytics: "Enhanced analytics and insights",

        // Footer
        copyright: "Copyright <span class=\"text-indigo-600\">©</span> 2025 Flare Exchange. All rights reserved.",
        terms: "Terms and conditions",
        privacy: "Privacy policy",

        // Contact
        contactEmail: "sherlingdev@gmail.com",
        contactUs: "Contact us",
        contactTermsText: "If you have any questions about these terms and conditions, please contact us at:",
        contactPrivacyText: "If you have any questions about this privacy policy, please contact us at:",
        contactAboutText: "If you have any questions about our platform, please contact us at:",

        // Page titles
        pageTitle: "Flare Exchange Rate | Convert USD, EUR, and DOP instantly. Quick, safe, and always accurate.",
        privacyTitle: "Privacy policy | Convert USD, EUR, and DOP instantly. Quick, safe, and always accurate.",
        termsTitle: "Terms and conditions | Convert USD, EUR, and DOP instantly. Quick, safe, and always accurate.",
        aboutTitle: "About us | Convert USD, EUR, and DOP instantly. Quick, safe, and always accurate."
    },
    es: {
        // Main converter
        enterAmount: "¿Cuánto?",
        fromCurrency: "Moneda de origen",
        toCurrency: "Moneda de destino",
        swap: "Intercambiar monedas",
        login: "Iniciar sesión",
        loginButton: "Acceder",

        // Site description
        siteDescription: "Convierte USD, EUR y DOP al instante. Rápido, seguro y siempre preciso.",

        // Authentication
        register: "Registrarse",
        registerButton: "Crear cuenta",
        loginSubtitle: "Accede a tu cuenta",
        registerSubtitle: "Crea una nueva cuenta",
        fullName: "Nombre completo",
        fullNamePlaceholder: "Ingresa tu nombre completo",
        email: "Correo electrónico",
        emailPlaceholder: "Ingresa tu correo electrónico",
        password: "Contraseña",
        passwordPlaceholder: "Ingresa tu contraseña",
        confirmPassword: "Confirmar contraseña",
        confirmPasswordPlaceholder: "Confirma tu contraseña",
        noAccount: "¿No tienes una cuenta?",
        haveAccount: "¿Ya tienes una cuenta?",
        passwordRequirements: "Requisitos de Contraseña:",
        passwordReq1: "Al menos 8 caracteres",
        passwordReq2: "Una letra mayúscula",
        passwordReq3: "Una letra minúscula",
        passwordReq4: "Un número",
        passwordReq5: "Un carácter especial",

        // Loader
        loading: "Cargando...",

        // Rate Display
        liveExchangeRates: "Vivo",
        lastUpdated: "Actualizado",

        // Currency Variations
        mainVariations: "Variaciones Principales",
        oneDollarToPeso: "1 dólar a peso",
        oneEuroToPeso: "1 euro a peso",
        onePesoToDollar: "1 peso a dólar",
        onePesoToEuro: "1 peso a euro",
        basedOnCurrentRates: "Basado en tasas actuales",

        // API Guide
        apiGuideTitle: "Guía de uso de API",
        apiGuideSubtitle: "Documentación completa para APIs de Flare Exchange Rate",
        authentication: "Autenticación",
        authenticationText: "Todos los endpoints de API requieren autenticación excepto para datos públicos de tipos de cambio. Usa los endpoints de autenticación para obtener un token de acceso.",
        registerUser: "Registrar usuario",
        loginUser: "Iniciar sesión",
        requestBody: "Cuerpo de solicitud",
        response: "Respuesta",
        exchangeRateApis: "APIs de tipo de cambio",
        exchangeRateApisText: "Obtén tipos de cambio en tiempo real de InfoDolar.com.do con múltiples opciones de datos.",
        getExchangeRates: "Obtener tipos de cambio",
        getExchangeRatesDesc: "Recupera los últimos tipos de cambio. Los datos se almacenan en caché y se actualizan periódicamente.",
        convertCurrency: "Convertir moneda",
        convertCurrencyDesc: "Convierte una cantidad específica de una moneda a otra usando los tipos de cambio actuales.",
        triggerManualScraper: "Activar scraper manual",
        description: "Descripción",
        triggerManualScraperDesc: "Activa manualmente el scraper de tipos de cambio para obtener datos frescos.",

        // API Guide specific content
        completeDataInfo: "Datos completos e información",
        completeDataDesc: "Devuelve datos completos de tipos de cambio incluyendo detalles de USD, EUR y tasas globales",
        onlyGlobalRates: "Solo tasas globales",
        onlyGlobalRatesDesc: "Devuelve solo las tasas de cambio globales sin datos detallados de USD/EUR",
        onlyUsdData: "Solo datos USD",
        onlyUsdDataDesc: "Devuelve solo datos de tipos de cambio USD",
        onlyEurData: "Solo datos EUR",
        onlyEurDataDesc: "Devuelve solo datos de tipos de cambio EUR",
        alternativeExchangeRate: "Fuente alternativa de tipos de cambio",
        alternativeExchangeRateDesc: "Obtén tipos de cambio del Banco Central de la República Dominicana como fuente alternativa",

        rateLimits: "Límites de velocidad",
        unauthenticatedRequests: "Solicitudes no autenticadas",
        rateLimitUnauth: "10 solicitudes por minuto",
        authenticatedRequests: "Solicitudes autenticadas",
        rateLimitAuth: "100 solicitudes por minuto",
        scraperRequests: "Solicitudes de scraper",
        rateLimitScraper: "1 solicitud por minuto",
        noRateLimiting: "Sin límites de velocidad aplicados actualmente",
        cachedForOneHour: "Almacenado en caché por 1 hora",

        errorHandling: "Manejo de errores",
        errorHandlingText: "Todos los endpoints devuelven respuestas de error estandarizadas con códigos de estado HTTP apropiados.",
        errorResponseExample: "Ejemplo de respuesta de error",
        sdkExamples: "Ejemplos de SDK",
        needHelp: "¿Necesitas ayuda?",
        needHelpText: "Si tienes preguntas sobre nuestra API o necesitas ayuda con la integración, por favor contáctanos.",

        // Legal pages content
        aboutUs: "Acerca de nosotros",
        privacyPolicy: "Política de privacidad",
        termsOfService: "Términos y condiciones",
        siteName: "Flare Exchange Rate",
        siteUrl: "flarexrate.com",

        // Terms and Conditions
        acceptanceOfTerms: "Aceptación de términos",
        acceptanceOfTermsText: "Al acceder y usar este convertidor de monedas, aceptas y acuerdas seguir los términos y disposiciones de este acuerdo. Si no estás de acuerdo con seguir estos términos, por favor no uses este servicio.",

        descriptionOfService: "Descripción del servicio",
        descriptionOfServiceText: "Esta plataforma es una aplicación basada en web que proporciona cálculos en tiempo real entre varias monedas internacionales. El servicio incluye:",
        realTimeExchangeRates: "Información de tipos de cambio en tiempo real",
        calculationOperations: "Operaciones de cálculo",
        responsiveDesign: "Diseño responsivo para varios dispositivos",

        useLicense: "Licencia de uso",
        useLicenseText: "Se otorga permiso para usar temporalmente esta plataforma solo para visualización personal y no comercial transitoria. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puedes:",
        modifyOrCopy: "Modificar o copiar los materiales",
        commercialUse: "Usar los materiales para cualquier propósito comercial o para cualquier exhibición pública",
        reverseEngineer: "Intentar hacer ingeniería inversa de cualquier software contenido en el sitio web",
        removeCopyright: "Remover cualquier copyright u otras notaciones de propiedad de los materiales",

        disclaimer: "Descargo de responsabilidad",
        disclaimerText1: "Los materiales en este convertidor de monedas se proporcionan sin garantías, expresas o implícitas, y por la presente rechaza todas las demás garantías incluyendo sin limitación, garantías implícitas o condiciones de comerciabilidad, o no violación de propiedad intelectual u otra violación de derechos.",
        disclaimerText2: "Los tipos de cambio se proporcionan solo con fines informativos y no deben usarse para transacciones financieras reales sin verificación de una institución financiera autorizada.",

        limitations: "Limitaciones",
        limitationsText: "No somos responsables por cualquier daño que surja del uso o la imposibilidad de usar los materiales en este sitio web, incluso si nosotros o un representante autorizado hemos sido notificados oralmente o por escrito de la posibilidad de tal daño.",

        accuracyOfMaterials: "Precisión de materiales",
        accuracyOfMaterialsText: "Los materiales que aparecen en este sitio web podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que ninguno de los materiales en este sitio web sean precisos, completos o actuales. Podemos hacer cambios a los materiales contenidos en este sitio web en cualquier momento sin previo aviso.",

        links: "Enlaces",
        linksText: "No hemos revisado todos los sitios enlazados a nuestro sitio web y no somos responsables del contenido de ningún sitio enlazado de este tipo. La inclusión de cualquier enlace no implica respaldo por parte nuestra del sitio. El uso de cualquier sitio web enlazado de este tipo es bajo el propio riesgo del usuario.",

        modifications: "Modificaciones",
        modificationsText: "Podemos revisar estos términos de servicio para este sitio web en cualquier momento sin previo aviso. Al usar este sitio web aceptas estar sujeto a la versión actual de estos términos de servicio.",

        governingLaw: "Ley aplicable",
        governingLawText: "Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de la República Dominicana y te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales en ese estado o ubicación.",

        userConduct: "Conducta del usuario",
        userConductText: "Aceptas usar este servicio solo para propósitos legales y de acuerdo con estos términos. Aceptas no:",
        violateLaws: "Usar este servicio de cualquier manera que viole las leyes o regulaciones aplicables",
        unauthorizedAccess: "Intentar obtener acceso no autorizado a cualquier parte de este servicio",
        interfereService: "Interferir o interrumpir este servicio o servidores conectados a este servicio",
        automatedAccess: "Usar cualquier medio automatizado para acceder a este servicio sin permiso",

        // Privacy Policy
        informationWeCollect: "Información que recopilamos",
        informationWeCollectText: "Cuando usas esta plataforma, podemos recopilar la siguiente información:",
        calculationRequests: "Solicitudes de cálculo y montos",
        ipAddress: "Dirección IP e información del navegador para análisis",
        usagePatterns: "Patrones de uso y preferencias",
        deviceInformation: "Información del dispositivo y sistema operativo",

        howWeUse: "Cómo usamos tu información",
        howWeUseText: "Usamos la información recopilada para:",
        provideCalculations: "Proporcionar cálculos precisos",
        improveApplication: "Mejorar el rendimiento de nuestra aplicación y experiencia del usuario",
        analyzeUsage: "Analizar patrones de uso para mejorar nuestros servicios",
        displayAds: "Mostrar anuncios relevantes",

        googleAdsense: "Google AdSense y servicios de terceros",
        googleAdsenseText: "Nuestro sitio web muestra anuncios a través de servicios de terceros. Este servicio puede:",
        useCookies: "Usar cookies para mostrar anuncios basados en tus visitas a nuestro sitio y otros sitios en Internet",
        collectBrowsing: "Recopilar información sobre tus hábitos de navegación",
        displayPersonalized: "Mostrar anuncios personalizados",
        useWebBeacons: "Usar web beacons para recopilar información",
        optOutText: "Puedes optar por no recibir publicidad personalizada a través de la configuración de tu navegador.",

        cookiesTracking: "Cookies y seguimiento",
        cookiesTrackingText: "Usamos cookies y tecnologías de seguimiento similares para:",
        rememberTheme: "Recordar tus preferencias de tema",
        rememberLanguage: "Recordar tus preferencias de idioma",
        provideAnalytics: "Proporcionar análisis y mejorar nuestros servicios",
        enableAdvertising: "Habilitar funcionalidad publicitaria",
        controlCookiesText: "Puedes controlar las cookies a través de la configuración de tu navegador, pero deshabilitar las cookies puede afectar la funcionalidad de nuestro sitio.",

        dataSecurity: "Seguridad de datos",
        dataSecurityText: "Implementamos medidas de seguridad apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión es completamente seguro.",

        dataRetention: "Retención de datos",
        dataRetentionText: "Retenemos tu información personal solo el tiempo necesario para proporcionar nuestros servicios y cumplir con las obligaciones legales. Los datos de análisis pueden retenerse por un período razonable.",

        yourRights: "Tus derechos",
        yourRightsText: "Tienes derecho a:",
        accessInformation: "Acceder a tu información personal",
        correctInformation: "Corregir información inexacta",
        requestDeletion: "Solicitar la eliminación de tu información",
        optOutProcessing: "Optar por no procesar datos con fines publicitarios",
        withdrawConsent: "Retirar el consentimiento en cualquier momento",

        childrenPrivacy: "Privacidad de menores",
        childrenPrivacyText: "Nuestro servicio no está destinado a usuarios jóvenes. No recopilamos conscientemente información personal de ellos.",

        changesPrivacy: "Cambios a esta política de privacidad",
        changesPrivacyText: "Podemos actualizar esta política de privacidad de vez en cuando. Te notificaremos de cualquier cambio publicando la nueva política de privacidad en esta página.",

        // About Us
        ourMission: "Nuestra misión",
        ourMissionText: "Creemos que los cálculos deben ser simples, precisos y accesibles para todos nuestra misión es proporcionar información de tipos de cambio en tiempo real y servicios de cálculo que ayuden a individuos y empresas a tomar decisiones financieras informadas nos enfocamos en las monedas que más importan a nuestros usuarios, asegurando que siempre tengas acceso a los tipos de cambio más actuales y precisos",

        whatWeOffer: "Lo que ofrecemos",
        realTimeExchangeRatesTitle: "Tipos de cambio en tiempo real",
        realTimeExchangeRatesText: "Nuestra plataforma proporciona tipos de cambio actualizados obtenidos de proveedores de datos financieros confiables, asegurando precisión para tus necesidades de cálculo.",
        multiLanguageSupport: "Soporte multiidioma",
        multiLanguageSupportText: "Disponible en múltiples idiomas para servir a nuestra base de usuarios diversa, haciendo los cálculos accesibles a más personas.",
        responsiveDesignTitle: "Diseño responsivo",
        responsiveDesignText: "Optimizado para todos los dispositivos - escritorio, tableta y móvil - para que puedas convertir monedas dondequiera que estés.",
        darkModeSupport: "Soporte de modo oscuro",
        darkModeSupportText: "Elige entre temas claros y oscuros para una visualización cómoda en cualquier condición de iluminación.",

        ourTechnology: "Nuestra tecnología",
        ourTechnologyText: "Esta plataforma está construida usando tecnologías web modernas para asegurar un rendimiento rápido y confiable:",
        nextjs: "Next.js: Para aplicaciones web rápidas con renderizado del lado del servidor",
        react: "React: Para interfaces de usuario responsivas e interactivas",
        typescript: "TypeScript: Para código seguro en tipos y mantenible",
        tailwind: "Tailwind CSS: Para diseños hermosos y responsivos",
        realTimeApis: "APIs en tiempo real: Para tipos de cambio precisos y actualizados",

        privacySecurity: "Privacidad y seguridad",
        privacySecurityText: "Tomamos en serio tu privacidad nuestros cálculos se realizan localmente en tu navegador, asegurando que tu información financiera nunca salga de tu dispositivo innecesariamente solo recopilamos datos de análisis mínimos para mejorar nuestro servicio, y nunca almacenamos tu historial de conversión o información financiera personal en nuestros servidores",

        futurePlans: "Planes futuros",
        futurePlansText: "Estamos trabajando continuamente para mejorar esta plataforma. Las actualizaciones futuras pueden incluir:",
        additionalCurrencies: "Soporte para monedas adicionales",
        historicalCharts: "Gráficos históricos de tipos de cambio",
        currencyAlerts: "Alertas y notificaciones de monedas",
        mobileApp: "Versiones de aplicación móvil",
        enhancedAnalytics: "Análisis y perspectivas mejoradas",

        // Footer
        copyright: "Copyright <span class=\"text-indigo-600\">©</span> 2025 Flare Exchange. Todos los derechos reservados.",
        terms: "Términos y condiciones",
        privacy: "Política de privacidad",

        // Contact
        contactEmail: "sherlingdev@gmail.com",
        contactUs: "Contáctanos",
        contactTermsText: "Si tienes alguna pregunta sobre estos términos y condiciones, por favor contáctanos en:",
        contactPrivacyText: "Si tienes alguna pregunta sobre esta política de privacidad, por favor contáctanos en:",
        contactAboutText: "Si tienes alguna pregunta sobre nuestra plataforma, por favor contáctanos en:",

        // Page titles
        pageTitle: "Flare Exchange Rate | Convierte USD, EUR y DOP al instante. Rápido, seguro y siempre preciso.",
        privacyTitle: "Política de privacidad | Convierte USD, EUR y DOP al instante. Rápido, seguro y siempre preciso.",
        termsTitle: "Términos y condiciones | Convierte USD, EUR y DOP al instante. Rápido, seguro y siempre preciso.",
        aboutTitle: "Acerca de nosotros | Convierte USD, EUR y DOP al instante. Rápido, seguro y siempre preciso."
    }
};