// app/dashboard/page.tsx
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import TradeBuilder from './trade-builder';
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<{ edit?: string }>
}

const PICK_VALUE_CHART: Record<number, number> = {
  1: 4000, 2: 3250, 3: 2890, 4: 2660, 5: 2500, 6: 2380, 7: 2280, 8: 2200, 9: 2120, 10: 2030,
  11: 1930, 12: 1840, 13: 1760, 14: 1690, 15: 1630, 16: 1580, 17: 1530, 18: 1490, 19: 1440, 20: 1400,
  21: 1340, 22: 1300, 23: 1250, 24: 1210, 25: 1170, 26: 1130, 27: 1090, 28: 1040, 29: 1000, 30: 950,
  31: 720, 32: 690, 33: 660, 34: 630, 35: 600, 36: 580, 37: 550, 38: 530, 39: 500, 40: 480,
  41: 460, 42: 430, 43: 410, 44: 390, 45: 370, 46: 350, 47: 330, 48: 310, 49: 290, 50: 270,
  51: 250, 52: 240, 53: 220, 54: 200, 55: 180, 56: 170, 57: 150, 58: 130, 59: 120, 60: 100,
};

const getPickValue = (round: number, pickNumber: number) => {
  const overallPick = round === 1 ? pickNumber : pickNumber + 30;
  return PICK_VALUE_CHART[overallPick] || 0;
};

interface DraftPick {
  year: number;
  round: number;
  pickNumber: number;
  givingTeam: string;
  receivingTeam: string;
}

interface EvaluatedTrade {
  id?: string;
  description: string;
  teams: string[];
  draftPicks: DraftPick[];
  teamValues: Record<string, { given: number; received: number; givenPicks: string[]; receivedPicks: string[] }>;
  userId: string;
}

export default async function DashboardPage({
  searchParams,
}: Props) {
  // Await the searchParams
  const params = await searchParams;
  const editId = params?.edit;

  const session = await auth();
  
  // const user = await prisma.user.findUnique({
  //   where: { 
  //     email: session?.user?.email
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //   }
  // });
   // Add null check for session and email
   if (!session?.user?.email) {
    return <div>Please log in to continue</div>;
  }

  const user = await prisma.user.findUnique({
    where: { 
      email: session.user.email // Now TypeScript knows this is a string
    },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  let initialTrade: EvaluatedTrade | undefined = undefined;
  if (editId) { //this code is redundant to trade-builder, only for edit functionality (passing in the trade id)
    const trade = await prisma.trade.findUnique({
      where: { id: editId },
      include: { draftPicks: true }
    });
    if (!trade || trade.userId !== user.id) {
      return <div>Trade not found or you don't have permission to edit it.</div>;
    }

    // Transform the trade data into EvaluatedTrade format
    const teamValues: Record<string, { given: number; received: number; givenPicks: string[]; receivedPicks: string[] }> = {};
    trade.teams.forEach((team: string) => {
      teamValues[team] = { given: 0, received: 0, givenPicks: [], receivedPicks: [] };
    });

    trade.draftPicks.forEach((pick: DraftPick) => {
      const value = getPickValue(pick.round, pick.pickNumber);
      const pickLabel = `${pick.year} Round ${pick.round} Pick ${pick.pickNumber}`;
      
      if (!teamValues[pick.givingTeam]) {
        teamValues[pick.givingTeam] = { given: 0, received: 0, givenPicks: [], receivedPicks: [] };
      }
      if (!teamValues[pick.receivingTeam]) {
        teamValues[pick.receivingTeam] = { given: 0, received: 0, givenPicks: [], receivedPicks: [] };
      }

      teamValues[pick.givingTeam].given += value;
      teamValues[pick.givingTeam].givenPicks.push(pickLabel);
      teamValues[pick.receivingTeam].received += value;
      teamValues[pick.receivingTeam].receivedPicks.push(pickLabel);
    });

    initialTrade = {
      id: trade.id,
      description: trade.description || '',
      teams: trade.teams,
      draftPicks: trade.draftPicks,
      teamValues,
      userId: trade.userId
    };
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {initialTrade ? 'Edit Trade' : 'Create New Trade'}
        </h2>
        <TradeBuilder userId={user.id} initialTrade={initialTrade} />
      </div>
    </div>
  );
}