import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export async function getCalendarClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('Google Calendar credentials not found. Using mock mode.');
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: SCOPES,
    });

    return google.calendar({ version: 'v3', auth });
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    color?: string;
}

export async function getCalendarEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const calendar = await getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    if (!calendar) {
        // Mock data
        return [
            {
                id: '1',
                title: 'Team Sync (Mock)',
                start: new Date(new Date().setDate(2)).toISOString(),
                end: new Date(new Date().setDate(2)).toISOString(),
                color: 'bg-blue-500'
            },
            {
                id: '2',
                title: 'Project Deadline (Mock)',
                start: new Date(new Date().setDate(15)).toISOString(),
                end: new Date(new Date().setDate(15)).toISOString(),
                color: 'bg-red-500'
            }
        ];
    }

    try {
        const response = await calendar.events.list({
            calendarId,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items;
        if (!events || events.length === 0) return [];

        return events.map((event: any) => ({
            id: event.id || '',
            title: event.summary || 'No Title',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            // Map Google Calendar colors to our Tailwind classes if possible, or default
            color: 'bg-blue-500'
        }));
    } catch (error) {
        console.error('Error fetching from Google Calendar:', error);
        return [];
    }
}
