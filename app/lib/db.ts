import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from './prisma';
import { Trade, Team, DraftPick, TradeTeam, TradeDraftPick, TradeWithDetails } from './definitions';

// Team operations
export async function getTeams() {
  noStore();
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    });
    return teams;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch teams.');
  }
}

export async function getTeamById(id: string) {
  noStore();
  try {
    const team = await prisma.team.findUnique({
      where: { id }
    });
    return team;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch team.');
  }
}

// Draft pick operations
export async function getDraftPicksByTeam(teamId: string) {
  noStore();
  try {
    const picks = await prisma.draftPick.findMany({
      where: { teamId },
      orderBy: [
        { year: 'desc' },
        { round: 'asc' }
      ]
    });
    return picks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch draft picks.');
  }
}

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

export async function getTradeById(id: string) {
  noStore();
  try {
    const trade = await prisma.trade.findUnique({
      where: { id }
    });
    return trade;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trade.');
  }
}

export async function getTradeDetails(id: string) {
  noStore();
  try {
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true
          }
        },
        draftPicks: true
      }
    });
    
    if (!trade) throw new Error('Trade not found');
    
    return {
      ...trade,
      teams: trade.teams,
      draft_picks: trade.draftPicks
    } as TradeWithDetails;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trade details.');
  }
}

export async function createTrade(
  userId: string,
  description: string,
  teams: { teamId: string; isGiving: boolean }[],
  draftPicks: { year: number; round: 1 | 2; givingTeamId: string; receivingTeamId: string }[]
) {
  try {
    const trade = await prisma.trade.create({
      data: {
        userId,
        description,
        teams: {
          create: teams.map(team => ({
            teamId: team.teamId,
            isGiving: team.isGiving
          }))
        },
        draftPicks: {
          create: draftPicks.map(pick => ({
            year: pick.year,
            round: pick.round,
            givingTeamId: pick.givingTeamId,
            receivingTeamId: pick.receivingTeamId
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