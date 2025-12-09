import { NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Default to current month if not specified
    const now = new Date();
    const start = startParam ? new Date(startParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endParam ? new Date(endParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
        const events = await getCalendarEvents(start, end);
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }
}
