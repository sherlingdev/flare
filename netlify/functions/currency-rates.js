import { getStore } from "@netlify/blobs";

const currencyRatesHandler = async (req) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    try {
        const store = getStore("currency-rates");

        if (req.method === 'PUT') {
            // Store data in Netlify Blobs
            const data = await req.json();
            await store.setJSON("latest", data);

            return new Response(JSON.stringify({
                success: true,
                message: 'Data stored in Netlify Blobs successfully',
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers
            });
        }

        if (req.method === 'GET') {
            // Retrieve data from Netlify Blobs
            const data = await store.get("latest", { type: 'json' });

            if (data) {
                return new Response(JSON.stringify({
                    success: true,
                    data: data
                }), {
                    status: 200,
                    headers
                });
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'No data found in Netlify Blobs'
                }), {
                    status: 404,
                    headers
                });
            }
        }

        return new Response(JSON.stringify({
            success: false,
            message: 'Method not allowed'
        }), {
            status: 405,
            headers
        });

    } catch (error) {
        console.error('Error in currency-rates function:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            message: 'Internal server error'
        }), {
            status: 500,
            headers
        });
    }
};

export default currencyRatesHandler;
