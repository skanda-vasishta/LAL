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

    // Just create the trade, no duplicate pick validation!
    const trade = await prisma.trade.create({
      data: {
        description,
        teams,
        draftPicks: {
          create: draftPicks.map((pick: any) => ({
            year: pick.year,
            round: pick.round,
            pickNumber: pick.pickNumber,
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
    // Log the full error for debugging
    console.error('Detailed error creating trade:', error);
    
    // Return a more specific error message
    return NextResponse.json(
      { 
        error: 'Failed to create trade',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { tradeId } = await request.json();

    // Check if the trade belongs to the user
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      select: { userId: true }
    });
    if (!trade || trade.userId !== user.id) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    await prisma.trade.delete({ where: { id: tradeId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}