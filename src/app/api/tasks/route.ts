import { NextResponse } from 'next/server';
import { getTasksFromSheet, addTaskToSheet, deleteTask } from '@/lib/google-sheets';

export async function GET() {
    const tasks = await getTasksFromSheet();
    return NextResponse.json(tasks);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const newTask = await addTaskToSheet(body);
        return NextResponse.json(newTask);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await deleteTask(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
