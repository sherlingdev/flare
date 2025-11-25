// Client-side geolocation detection
export async function detectUserLocation(): Promise<{ success: boolean; country: string | null; code: string | null }> {
    try {
        // Try ip-api.com first (works from client)
        // Note: 'countryCode' in URL is the API's field name, we map it to 'code' internally
        const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Geolocation API failed');
        }

        const data = await response.json();

        // ip-api.com returns status: "success" or "fail"
        // API field is 'countryCode', but we return it as 'code' in our interface
        if (data.status === 'success' && data.countryCode) {
            return {
                success: true,
                country: data.country,
                code: data.countryCode, // Map API's 'countryCode' to our 'code'
            };
        }

        // If ip-api.com failed, try fallback API
        if (data.status === 'fail' || !data.country) {
            try {
                const fallbackResponse = await fetch('https://ipapi.co/json/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.country_code) {
                        return {
                            success: true,
                            country: fallbackData.country_name,
                            code: fallbackData.country_code,
                        };
                    }
                }
            } catch {
                // Fallback also failed
            }
        }

        return {
            success: false,
            country: null,
            code: null,
        };
    } catch {
        return {
            success: false,
            country: null,
            code: null,
        };
    }
}

