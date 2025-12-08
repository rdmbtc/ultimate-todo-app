import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getSheetsClient() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('Google Sheets credentials not found. Using mock mode.');
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: SCOPES,
    });

    return google.sheets({ version: 'v4', auth });
}

export async function getTasksFromSheet() {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!sheets || !spreadsheetId) {
        // Mock data
        return [
            { id: '1', title: 'Review project plan (Mock)', completed: true },
            { id: '2', title: 'Setup Next.js project (Mock)', completed: true },
            { id: '3', title: 'Implement UI components (Mock)', completed: false },
        ];
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Tasks!A:C', // Assuming columns: ID, Title, Completed
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        // Skip header row if exists, or handle accordingly. Assuming header exists.
        return rows.slice(1).map((row) => ({
            id: row[0],
            title: row[1],
            completed: row[2] === 'TRUE',
        }));
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return [];
    }
}

export async function addTaskToSheet(title: string) {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!sheets || !spreadsheetId) {
        console.log('Mock: Added task', title);
        return { id: Date.now().toString(), title, completed: false };
    }

    const id = Date.now().toString();

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Tasks!A:C',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[id, title, 'FALSE']],
            },
        });
        return { id, title, completed: false };
    } catch (error) {
        console.error('Error adding to Google Sheets:', error);
        throw error;
    }
}
