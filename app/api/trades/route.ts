// app/api/trades/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    // Get the current user's session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { description, teams, draftPicks } = await request.json();

    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        description,
        teams,
        draftPicks: {
          create: draftPicks.map((pick: any) => ({
            year: pick.year,
            round: pick.round,
            givingTeam: pick.givingTeam,
            receivingTeam: pick.receivingTeam
          }))
        },
        user: {
          connect: { id: user.id }
        }
      }
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}