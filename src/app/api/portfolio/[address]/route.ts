import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    props: { params: Promise<{ address: string }> }
) {
    const params = await props.params;
    const address = params.address;

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        console.log(`Fetching portfolio for address: ${address}`);
        const apiUrl = `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Ethplorer API Error (${response.status}): ${errorText}`);
            return NextResponse.json({ error: `Ethplorer API Error: ${response.status} ${response.statusText}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolio data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
