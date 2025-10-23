import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Check if we're in production with Netlify Blobs configured
        if (process.env.NETLIFY && process.env.NETLIFY_BLOBS_STORE_ID) {
            // Get Netlify Blobs store
            const store = getStore('currency-rates');
            
            // Store the data
            await store.set('latest', JSON.stringify(body));
            
            return NextResponse.json({
                success: true,
                message: 'Data stored in Netlify Blobs successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            // Development mode - simulate success
            console.log('🔧 Development mode: Simulating Netlify Blobs storage');
            console.log('📊 Data that would be stored:', JSON.stringify(body, null, 2));
            
            return NextResponse.json({
                success: true,
                message: 'Data would be stored in Netlify Blobs (development mode)',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error storing data in Netlify Blobs:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to store data in Netlify Blobs'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Check if we're in production with Netlify Blobs configured
        if (process.env.NETLIFY && process.env.NETLIFY_BLOBS_STORE_ID) {
            // Get Netlify Blobs store
            const store = getStore('currency-rates');
            
            // Try to get the latest data
            const data = await store.get('latest');
            
            if (data) {
                // Convert ArrayBuffer to string
                const dataString = new TextDecoder().decode(data);
                const parsedData = JSON.parse(dataString);
                return NextResponse.json({
                    success: true,
                    data: parsedData
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'No data found in Netlify Blobs'
                }, { status: 404 });
            }
        } else {
            // Development mode - return mock data
            console.log('🔧 Development mode: Using mock data for Netlify Blobs');
            return NextResponse.json({
                success: false,
                message: 'Netlify Blobs not configured (development mode)'
            }, { status: 404 });
        }
    } catch (error) {
        console.error('Error retrieving data from Netlify Blobs:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to retrieve data from Netlify Blobs'
        }, { status: 500 });
    }
}