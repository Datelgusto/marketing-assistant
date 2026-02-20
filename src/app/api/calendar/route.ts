import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const CALENDAR_FILE = path.join('/home/z/my-project/download', 'calendar-data.json');

// Helper para leer/escribir archivo de calendario
async function getCalendarData() {
  try {
    const data = await readFile(CALENDAR_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { events: [] };
  }
}

async function saveCalendarData(data: any) {
  await writeFile(CALENDAR_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await getCalendarData();
    return NextResponse.json({ success: true, events: data.events });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al obtener eventos', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event } = body;

    const data = await getCalendarData();

    switch (action) {
      case 'create':
        const newEvent = {
          ...event,
          id: `event-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        data.events.push(newEvent);
        await saveCalendarData(data);
        return NextResponse.json({ success: true, event: newEvent });

      case 'update':
        const updateIndex = data.events.findIndex((e: any) => e.id === event.id);
        if (updateIndex >= 0) {
          data.events[updateIndex] = { ...data.events[updateIndex], ...event };
          await saveCalendarData(data);
          return NextResponse.json({ success: true, event: data.events[updateIndex] });
        }
        return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });

      case 'delete':
        data.events = data.events.filter((e: any) => e.id !== event.id);
        await saveCalendarData(data);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error en operación de calendario', details: errorMessage },
      { status: 500 }
    );
  }
}
