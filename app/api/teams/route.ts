import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const team = await prisma.team.findMany();
  return NextResponse.json(team);
}