import { NextResponse } from 'next/server';
import { getTasksFromSheet, addTaskToSheet } from '@/lib/google-sheets';

export async function GET() {
    const tasks = await getTasksFromSheet();
    return NextResponse.json(tasks);
}

export async function POST(request: Request) {
    const { title } = await request.json();
    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTask = await addTaskToSheet(title);
    return NextResponse.json(newTask);
}
