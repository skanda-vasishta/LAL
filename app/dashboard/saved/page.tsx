// app/dashboard/saved/page.tsx
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export default async function SavedTradesPage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { 
      email: session?.user?.email as string
    },
    select: {
      name: true,
      email: true,
      trades: {
        select: {
          id: true,
          description: true,
          teams: true,
          draftPicks: {
            select: {
              id: true,
              year: true,
              round: true,
              givingTeam: true,
              receivingTeam: true
            }
          },
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Trades</h1>
      
      {user.trades.length === 0 ? (
        <p className="text-gray-500">No trades saved yet.</p>
      ) : (
        <div className="space-y-4">
          {user.trades.map((trade) => (
            <div key={trade.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium mb-2">{trade.description || 'Untitled Trade'}</p>
              <div className="text-sm text-gray-600">
                <p>Teams: {trade.teams.join(' ↔ ')}</p>
                {trade.draftPicks.map((pick) => (
                  <p key={pick.id}>
                    {pick.year} Round {pick.round}: {pick.givingTeam} → {pick.receivingTeam}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}