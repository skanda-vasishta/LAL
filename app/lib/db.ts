import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from './prisma';
import { Trade, TradeDraftPick, TradeWithDetails } from './definitions';

// Trade operations
export async function getTradesByUser(userId: string) {
  noStore();
  try {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return trades;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trades.');
  }
}

export async function getTradeDetails(id: string) {
  noStore();
  try {
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        draftPicks: true
      }
    });
    
    if (!trade) throw new Error('Trade not found');
    
    return trade as TradeWithDetails;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trade details.');
  }
}

export async function createTrade(
  userId: string,
  description: string,
  teams: string[],
  draftPicks: { year: number; round: number; givingTeam: string; receivingTeam: string }[]
) {
  try {
    const trade = await prisma.trade.create({
      data: {
        userId,
        description,
        teams,
        draftPicks: {
          create: draftPicks.map(pick => ({
            year: pick.year,
            round: pick.round,
            givingTeam: pick.givingTeam,
            receivingTeam: pick.receivingTeam
          }))
        }
      }
    });
    
    return trade.id;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create trade.');
  }
}

export async function deleteTrade(id: string) {
  try {
    await prisma.trade.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete trade.');
  }
} 