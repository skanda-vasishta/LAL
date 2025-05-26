import { NextResponse } from 'next/server';
import { migrate } from '@/app/lib/migrate';

export async function POST() {
  try {
    await migrate();
    return NextResponse.json({ message: 'Database migrated successfully' });
  } catch (error) {
    console.error('Error migrating database:', error);
    return NextResponse.json(
      { error: 'Failed to migrate database' },
      { status: 500 }
    );
  }
} 