import { NextResponse } from 'next/server';

const CMC_API_KEY = 'c9f2d7c9eff34e7eb9aef03e9acfc79b';
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export async function GET() {
    try {
        const response = await fetch(`${CMC_API_URL}?start=1&limit=10&convert=USD`, {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY,
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`CMC API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching market data:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
