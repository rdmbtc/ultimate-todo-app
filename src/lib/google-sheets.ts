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

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    progress?: number;
    images?: string[];
}

export async function getTasksFromSheet(): Promise<Task[]> {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!sheets || !spreadsheetId) {
        // Mock data
        return [
            {
                id: '1',
                title: 'Review project plan (Mock)',
                completed: true,
                description: 'Review the Q4 roadmap and provide feedback.',
                priority: 'high',
                progress: 100,
                dueDate: '2024-12-10'
            },
            {
                id: '2',
                title: 'Setup Next.js project (Mock)',
                completed: true,
                progress: 100
            },
            {
                id: '3',
                title: 'Implement UI components (Mock)',
                completed: false,
                priority: 'medium',
                progress: 30,
                dueDate: '2024-12-15'
            },
        ];
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Лист1!A:H', // Extended range for new columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        // Skip header row if exists
        return rows.slice(1).map((row) => ({
            id: row[0],
            title: row[1],
            completed: row[2] === 'TRUE',
            description: row[3] || '',
            dueDate: row[4] || '',
            priority: (row[5] as 'low' | 'medium' | 'high') || 'medium',
            progress: parseInt(row[6] || '0', 10),
            images: row[7] ? row[7].split(',') : [],
        }));
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return [];
    }
}

export async function addTaskToSheet(taskData: Partial<Task>) {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const { id, title, description = '', dueDate = '', priority = 'medium', progress = 0, images = [] } = taskData;

    if (!title) throw new Error("Title is required");

    if (!sheets || !spreadsheetId) {
        console.log('Mock: Added/Updated task', title);
        return {
            id: id || Date.now().toString(),
            title,
            completed: false,
            description,
            dueDate,
            priority,
            progress,
            images
        };
    }

    try {
        // Check if task exists to update
        if (id) {
            console.log(`Checking for existing task with ID: "${id}"`);
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Лист1!A:H', // Get all data
            });

            const rows = response.data.values;
            console.log(`Fetched ${rows?.length} rows from sheet.`);

            // Debug: Log first few IDs
            if (rows) {
                console.log('First 5 IDs in sheet:', rows.slice(0, 5).map(r => r[0]));
            }

            const rowIndex = rows?.findIndex(row => String(row[0]).trim() === String(id).trim());
            console.log(`Found index for ID "${id}": ${rowIndex}`);

            if (rowIndex !== undefined && rowIndex !== -1) {
                console.log(`Updating existing task at row ${rowIndex + 1}`);
                // Update existing row
                const existingRow = rows![rowIndex];
                const currentCompleted = existingRow[2]; // Column C is completed status

                const range = `Лист1!A${rowIndex + 1}:H${rowIndex + 1}`;
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[
                            id,
                            title,
                            taskData.completed !== undefined ? (taskData.completed ? 'TRUE' : 'FALSE') : currentCompleted,
                            description,
                            dueDate,
                            priority,
                            progress.toString(),
                            images.join(',')
                        ]],
                    },
                });
                return {
                    id,
                    title,
                    completed: taskData.completed !== undefined ? taskData.completed : (currentCompleted === 'TRUE'),
                    description,
                    dueDate,
                    priority,
                    progress,
                    images
                };
            } else {
                console.log(`Task ID "${id}" not found in sheet. Creating new row.`);
            }
        }

        // If no ID or not found, append new
        const newId = id || Date.now().toString();
        console.log(`Appending new task with ID: ${newId}`);
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Лист1!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    newId,
                    title,
                    'FALSE',
                    description,
                    dueDate,
                    priority,
                    progress.toString(),
                    images.join(',')
                ]],
            },
        });
        return { id: newId, title, completed: false, description, dueDate, priority, progress, images };
    } catch (error) {
        console.error('Error adding/updating Google Sheets:', error);
        throw error;
    }
}

export async function deleteTask(id: string) {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!sheets || !spreadsheetId) {
        console.log('Mock: Deleted task', id);
        return { success: true };
    }

    try {
        console.log(`Attempting to delete task with ID: "${id}"`);
        // 1. Get all values to find the row index of the ID.
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Лист1!A:A', // Get IDs only
        });

        const rows = response.data.values;
        const rowIndex = rows?.findIndex(row => String(row[0]).trim() === String(id).trim());
        console.log(`Found index for deletion: ${rowIndex}`);

        if (rowIndex !== undefined && rowIndex !== -1) {
            // Fetch sheet metadata to get the correct sheetId for 'Лист1'
            const metadata = await sheets.spreadsheets.get({ spreadsheetId });
            const sheet = metadata.data.sheets?.find(s => s.properties?.title === 'Лист1');
            const sheetId = sheet?.properties?.sheetId || 0;
            console.log(`Using sheetId: ${sheetId} for deletion`);

            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId,
                                    dimension: 'ROWS',
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1,
                                },
                            },
                        },
                    ],
                },
            });
            return { success: true };
        } else {
            console.warn(`Task with ID ${id} not found for deletion.`);
            return { success: false, error: 'Task not found' };
        }
    } catch (error) {
        console.error('Error deleting from Google Sheets:', error);
        throw error;
    }
}
